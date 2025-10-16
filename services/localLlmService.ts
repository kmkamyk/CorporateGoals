import { JiraTask, AssignmentResult, LocalLlmConfig } from '../types';

/**
 * Replaces placeholders in a prompt template with actual data.
 */
const fillPromptTemplate = (template: string, data: Record<string, string>): string => {
    let filledTemplate = template;
    for (const key in data) {
        filledTemplate = filledTemplate.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
    }
    return filledTemplate;
};

const callLocalLlmStream = async (
    prompt: string,
    config: LocalLlmConfig,
    expectJson: boolean,
    onChunk?: (chunk: string) => void
): Promise<string> => {
    if (!config || !config.url || !config.model) {
        throw new Error("Konfiguracja lokalnego LLM (URL i nazwa modelu) jest wymagana.");
    }
    
    const body: any = {
        model: config.model,
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt }
        ],
        temperature: 0.5,
        stream: true, // Enable streaming
    };
    
    if (expectJson) {
        body.response_format = { type: "json_object" };
    }

    try {
        const response = await fetch(config.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Lokalne API LLM zwróciło błąd (${response.status}): ${errorText}`);
        }

        if (!response.body) {
            throw new Error("Odpowiedź serwera nie zawiera strumienia danych.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || ''; // Keep the last, possibly incomplete line

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const dataContent = line.substring(6);
                    if (dataContent === '[DONE]') {
                        break;
                    }
                    try {
                        const parsed = JSON.parse(dataContent);
                        const chunk = parsed.choices?.[0]?.delta?.content;
                        if (chunk) {
                            fullContent += chunk;
                            if (onChunk) {
                                onChunk(chunk);
                            }
                        }
                    } catch (e) {
                        console.error("Błąd parsowania fragmentu strumienia JSON:", e, "Fragment:", dataContent);
                    }
                }
            }
        }
        
        return fullContent;

    } catch (error) {
        console.error("Błąd podczas wywołania lokalnego LLM:", error);
        if (error instanceof TypeError) {
             throw new Error(`Błąd sieciowy podczas łączenia z lokalnym LLM. Upewnij się, że adres URL (${config.url}) jest poprawny, serwer działa i nie ma problemów z CORS.`);
        }
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Wystąpił nieznany błąd podczas komunikacji z lokalnym LLM.");
    }
}


/**
 * Assigns Jira tasks to annual goals using a local LLM.
 */
export const assignAndSummarizeTasks = async (
    goals: string[],
    tasks: JiraTask[],
    promptTemplate: string,
    config: LocalLlmConfig
): Promise<AssignmentResult[]> => {
    
    const goalsString = goals.map((goal, index) => `${index}: ${goal}`).join('\n');
    const tasksString = JSON.stringify(tasks.map(task => ({
        id: task.id,
        summary: task.summary,
        description: task.description
    })), null, 2);

    const prompt = fillPromptTemplate(promptTemplate, { goals: goalsString, tasks: tasksString });

    // We await the full response here, as we need the complete JSON to proceed.
    // The UI won't stream this part, but the underlying mechanism is now streaming-capable.
    const responseContent = await callLocalLlmStream(prompt, config, true);
    
    try {
        const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```|(\[[\s\S]*?\]|{[\s\S]*?})/);
        const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[2]) : responseContent;

        const result = JSON.parse(jsonString);
         if (!Array.isArray(result)) {
            // Some models might wrap the array in an object, e.g., { "assignments": [...] }
            // Let's try to find an array within the object.
            const arrayInResult = Object.values(result).find(Array.isArray);
            if (arrayInResult) {
                return arrayInResult as AssignmentResult[];
            }
            throw new Error("Odpowiedź AI (po parsowaniu) nie jest prawidłową tablicą JSON.");
        }
        return result as AssignmentResult[];
    } catch (e) {
        console.error("Błąd parsowania JSON z lokalnego LLM:", e);
        throw new Error(`Nie udało się sparsować odpowiedzi JSON z lokalnego LLM. Otrzymano następującą odpowiedź:\n\n${responseContent}`);
    }
};

/**
 * Generates an annual summary for a single goal using a local LLM.
 */
export const generateAnnualSummary = async (
    goal: string,
    taskSummaries: string[],
    promptTemplate: string,
    config: LocalLlmConfig,
    onChunk: (chunk: string) => void
): Promise<string> => {
    
    const summariesString = taskSummaries.map(s => `- ${s}`).join('\n');
    const prompt = fillPromptTemplate(promptTemplate, { goal: goal, summaries: summariesString });

    const fullResponse = await callLocalLlmStream(prompt, config, false, onChunk);

    return fullResponse.trim();
};