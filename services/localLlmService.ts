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
    if (!config || !config.url || !config.model || !config.apiFormat) {
        throw new Error("Konfiguracja lokalnego LLM (URL, nazwa modelu i format API) jest wymagana.");
    }
    
    const body: any = {
        model: config.model,
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt }
        ],
        stream: true,
    };

    if (config.apiFormat === 'llama.cpp') {
        body.temperature = 0.5;
        if (expectJson) {
            body.response_format = { type: "json_object" };
        }
    } else if (config.apiFormat === 'ollama') {
        body.options = {
            temperature: 0.5
        };
        if (expectJson) {
            body.format = 'json';
        }
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
            throw new Error(`Lokalne API LLM (${config.apiFormat}) zwróciło błąd (${response.status}): ${errorText}`);
        }

        if (!response.body) {
            throw new Error("Odpowiedź serwera nie zawiera strumienia danych.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';
        
        const parseStream = async () => {
            let buffer = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                
                if (config.apiFormat === 'llama.cpp') {
                    const lines = buffer.split('\n\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const dataContent = line.substring(6);
                            if (dataContent === '[DONE]') {
                                return;
                            }
                            try {
                                const parsed = JSON.parse(dataContent);
                                const chunk = parsed.choices?.[0]?.delta?.content;
                                if (chunk) {
                                    fullContent += chunk;
                                    if (onChunk) onChunk(chunk);
                                }
                            } catch (e) {
                                console.error("Błąd parsowania fragmentu strumienia JSON (llama.cpp):", e, "Fragment:", dataContent);
                            }
                        }
                    }
                } else if (config.apiFormat === 'ollama') {
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (line.trim() === '') continue;
                        try {
                            const parsed = JSON.parse(line);
                            const chunk = parsed.message?.content;
                            if (chunk) {
                                fullContent += chunk;
                                if (onChunk) onChunk(chunk);
                            }
                            if (parsed.done) {
                                return;
                            }
                        } catch (e) {
                            console.error("Błąd parsowania fragmentu strumienia JSON (Ollama):", e, "Fragment:", line);
                        }
                    }
                }
            }
        };

        await parseStream();
        
        return fullContent;

    } catch (error) {
        console.error("Błąd podczas wywołania lokalnego LLM:", error);
        if (error instanceof TypeError) {
             throw new Error(`Błąd sieciowy podczas łączenia z lokalnym LLM (${config.apiFormat}). Upewnij się, że adres URL (${config.url}) jest poprawny, serwer działa i nie ma problemów z CORS.`);
        }
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Wystąpił nieznany błąd podczas komunikacji z lokalnym LLM.");
    }
}


/**
 * Finds and summarizes Jira tasks relevant to a single annual goal using a local LLM.
 */
export const findAndSummarizeTasksForGoal = async (
    goal: string,
    tasks: JiraTask[],
    promptTemplate: string,
    config: LocalLlmConfig,
    onPromptReady?: (prompt: string) => void
): Promise<AssignmentResult[]> => {
    
    const tasksString = JSON.stringify(tasks.map(task => ({
        id: task.id,
        summary: task.summary,
        description: task.description
    })), null, 2);

    const prompt = fillPromptTemplate(promptTemplate, { goal: goal, tasks: tasksString });

    if (onPromptReady) {
        onPromptReady(prompt);
    }

    const responseContent = await callLocalLlmStream(prompt, config, true);
    
    try {
        const firstBracket = responseContent.indexOf('[');
        const firstBrace = responseContent.indexOf('{');
        
        let startIndex = -1;
        
        if (firstBracket === -1) startIndex = firstBrace;
        else if (firstBrace === -1) startIndex = firstBracket;
        else startIndex = Math.min(firstBracket, firstBrace);

        if (startIndex === -1) {
            if (responseContent.trim() === '[]') return [];
            throw new Error("Nie znaleziono początku obiektu JSON ([ lub {) w odpowiedzi AI.");
        }

        const isArray = responseContent[startIndex] === '[';
        const lastBracket = responseContent.lastIndexOf(']');
        const lastBrace = responseContent.lastIndexOf('}');
        
        let endIndex = isArray ? lastBracket : lastBrace;

        if (endIndex === -1) {
             throw new Error("Nie znaleziono końca obiektu JSON (] lub }) w odpowiedzi AI.");
        }

        const jsonString = responseContent.substring(startIndex, endIndex + 1);

        const result = JSON.parse(jsonString);

         if (!Array.isArray(result)) {
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
    onChunk: (chunk: string) => void,
    onPromptReady?: (prompt: string) => void
): Promise<string> => {
    
    const summariesString = taskSummaries.map(s => `- ${s}`).join('\n');
    const prompt = fillPromptTemplate(promptTemplate, { goal: goal, summaries: summariesString });

    if (onPromptReady) {
        onPromptReady(prompt);
    }

    const fullResponse = await callLocalLlmStream(prompt, config, false, onChunk);

    return fullResponse.trim();
};