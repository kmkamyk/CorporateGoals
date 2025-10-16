import { GoogleGenAI, Type } from "@google/genai";
import { JiraTask, AssignmentResult } from '../types';

// Per coding guidelines, initialize GoogleGenAI.
// The API key is expected to be in process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

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

/**
 * Assigns Jira tasks to annual goals and generates contextual summaries for each using Gemini.
 */
export const assignAndSummarizeTasks = async (
    goals: string[],
    tasks: JiraTask[],
    promptTemplate: string
): Promise<AssignmentResult[]> => {
    
    const goalsString = goals.map((goal, index) => `${index}: ${goal}`).join('\n');
    const tasksString = JSON.stringify(tasks.map(task => ({
        id: task.id,
        summary: task.summary,
        description: task.description
    })), null, 2);

    const prompt = fillPromptTemplate(promptTemplate, { goals: goalsString, tasks: tasksString });

    try {
        // Use Gemini API to generate content with a specific JSON schema
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            taskId: { type: Type.STRING },
                            assignedGoalId: { type: Type.NUMBER },
                            contextualSummary: { type: Type.STRING }
                        },
                        required: ["taskId", "assignedGoalId", "contextualSummary"]
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        // The Gemini API with responseSchema should return valid JSON, but parsing is still a good practice.
        const result = JSON.parse(jsonText);

        if (!Array.isArray(result)) {
            throw new Error("AI response is not a valid JSON array.");
        }
        
        return result as AssignmentResult[];

    } catch (error) {
        console.error("Error calling Gemini API for task assignment:", error);
        let message = 'An unknown error occurred.';
        if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }
        throw new Error(`Failed to assign tasks using AI: ${message}`);
    }
};

/**
 * Generates a comprehensive annual summary for a single goal based on task summaries using Gemini.
 */
export const generateAnnualSummary = async (
    goal: string,
    taskSummaries: string[],
    promptTemplate: string
): Promise<string> => {
    
    const summariesString = taskSummaries.map(s => `- ${s}`).join('\n');
    const prompt = fillPromptTemplate(promptTemplate, { goal: goal, summaries: summariesString });

    try {
        // Use Gemini API for text generation
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error calling Gemini API for annual summary:", error);
        let message = 'An unknown error occurred.';
        if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }
        throw new Error(`Failed to generate annual summary using AI: ${message}`);
    }
};
