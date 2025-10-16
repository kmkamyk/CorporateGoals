import { JiraTask, AssignmentResult } from '../types';

/**
 * Sends a request to a local LLM endpoint compatible with the OpenAI Chat Completions API format.
 * @param url - The URL of the local LLM API endpoint.
 * @param prompt - The prompt to send to the model.
 * @param isJson - Whether to request a JSON object as the response format.
 * @returns The response data from the API.
 */
const fetchFromLocalLlm = async (url: string, prompt: string, isJson: boolean) => {
    try {
        const body: any = {
            messages: [{ role: 'user', content: prompt }],
            temperature: isJson ? 0.2 : 0.7,
        };
        // Use response_format if the local model supports it (increases reliability for JSON).
        if (isJson) {
            body.response_format = { type: 'json_object' };
        }

        const apiResponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.text();
            throw new Error(`API request failed with status ${apiResponse.status}: ${errorBody}`);
        }

        const data = await apiResponse.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
             throw new Error("AI response did not contain the expected content.");
        }
        return content;

    } catch (e) {
        console.error("Failed to fetch or parse local LLM response:", e);
        if (e instanceof Error) {
            throw new Error(`AI processing failed: ${e.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the local LLM.");
    }
}

/**
 * Assigns JIRA tasks to annual goals using a local LLM.
 * @param goals - An array of annual goal strings.
 * @param tasks - An array of JIRA task objects.
 * @param assignmentPromptTemplate - The prompt template for the assignment task.
 * @param localLlmUrl - The URL of the local LLM endpoint.
 * @returns A promise that resolves to an array of assignment results.
 */
export const assignAndSummarizeTasks = async (
    goals: string[], 
    tasks: JiraTask[],
    assignmentPromptTemplate: string,
    localLlmUrl: string,
): Promise<AssignmentResult[]> => {
    const goalText = goals.map((goal, index) => `GOAL_ID ${index}: "${goal}"`).join('\n');
    const taskText = tasks.map(task => `TASK_ID "${task.id}":\nSummary: ${task.summary}\nDescription: ${task.description}`).join('\n\n');

    const prompt = assignmentPromptTemplate
        .replace('{{goals}}', goalText)
        .replace('{{tasks}}', taskText);
    
    const jsonText = await fetchFromLocalLlm(localLlmUrl, prompt, true);
    
    try {
        const jsonResponse = JSON.parse(jsonText);
        return jsonResponse as AssignmentResult[];
    } catch (e) {
        console.error("Failed to parse LLM JSON response:", jsonText);
        throw new Error("AI returned an invalid JSON format.");
    }
};

/**
 * Generates an annual summary for a goal using a local LLM.
 * @param goal - The annual goal string.
 * @param taskSummaries - An array of contextual summaries for tasks assigned to this goal.
 * @param summaryPromptTemplate - The prompt template for the summary task.
 * @param localLlmUrl - The URL of the local LLM endpoint.
 * @returns A promise that resolves to a two-paragraph summary string.
 */
export const generateAnnualSummary = async (
    goal: string, 
    taskSummaries: string[],
    summaryPromptTemplate: string,
    localLlmUrl: string
): Promise<string> => {
    const summariesText = taskSummaries.map(s => `- ${s}`).join('\n');

    const prompt = summaryPromptTemplate
        .replace('{{goal}}', goal)
        .replace('{{summaries}}', summariesText);
    
    const summaryText = await fetchFromLocalLlm(localLlmUrl, prompt, false);
    return summaryText.trim();
};
