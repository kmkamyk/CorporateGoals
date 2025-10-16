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

const callLocalLlm = async (prompt: string, config: LocalLlmConfig, expectJson: boolean): Promise<any> => {
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
    };
    
    // Add response_format for JSON mode, compatible with many OpenAI-like servers
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

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error("Odpowiedź z lokalnego LLM nie zawierała oczekiwanej treści.");
        }
        
        return content;

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

    const responseContent = await callLocalLlm(prompt, config, true);
    
    try {
        const result = JSON.parse(responseContent);
         if (!Array.isArray(result)) {
            throw new Error("Odpowiedź AI (po parsowaniu) nie jest prawidłową tablicą JSON.");
        }
        return result as AssignmentResult[];
    } catch (e) {
        console.error("Błąd parsowania JSON z lokalnego LLM:", e);
        throw new Error("Nie udało się sparsować odpowiedzi JSON z lokalnego LLM.");
    }
};

/**
 * Generates an annual summary for a single goal using a local LLM.
 */
export const generateAnnualSummary = async (
    goal: string,
    taskSummaries: string[],
    promptTemplate: string,
    config: LocalLlmConfig
): Promise<string> => {
    
    const summariesString = taskSummaries.map(s => `- ${s}`).join('\n');
    const prompt = fillPromptTemplate(promptTemplate, { goal: goal, summaries: summariesString });

    const responseContent = await callLocalLlm(prompt, config, false);

    return responseContent.trim();
};
