// FIX: Import `JiraTask` and `JiraCredentials` types to resolve missing type errors.
import { JiraTask, JiraCredentials } from '../types';

/**
 * Parses a raw string of tasks into an array of JiraTask objects.
 * Expected format for each line: "TASK-ID: The summary of the task"
 */
export const parseManualTasks = (rawText: string): JiraTask[] => {
    if (!rawText.trim()) return [];

    const lines = rawText.split('\n');
    const tasks: JiraTask[] = lines
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map((line, index) => {
            const parts = line.split(/:(.*)/s); // Split on the first colon, preserving the rest
            const id = parts[0]?.trim();
            const summary = (parts[1] || 'Brak podsumowania').trim();

            return {
                id: id || `MANUAL-${index + 1}`, // Provide a fallback ID
                summary: summary,
                description: 'Zadanie wprowadzone ręcznie.',
                completionDate: new Date().toISOString().split('T')[0], // Default to today
            };
        });
    return tasks;
};

export const fetchCompletedTasksMock = (): Promise<JiraTask[]> => {
    console.log("Fetching mock Jira tasks...");
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                { id: 'PROJ-101', summary: 'Implement user authentication flow', description: 'Full implementation of login, logout, and registration pages.', completionDate: '2023-03-15' },
                { id: 'PROJ-102', summary: 'Develop dashboard analytics widget', description: 'Create a new widget for the main dashboard showing user engagement metrics.', completionDate: '2023-05-20' },
                { id: 'PROJ-103', summary: 'Refactor database schema for performance', description: 'Optimize key tables and add indexes to improve query times by 50%. This directly impacts application speed.', completionDate: '2023-01-30' },
                { id: 'PROJ-104', summary: 'Set up CI/CD pipeline for automated testing', description: 'Configure Jenkins to run unit and integration tests on every commit.', completionDate: '2023-06-10' },
                { id: 'PROJ-105', summary: 'Fix critical bug in payment processing', description: 'Resolved an issue causing payment failures for a subset of users.', completionDate: '2023-02-25' },
                { id: 'PROJ-106', summary: 'Write API documentation for new endpoints', description: 'Documented the v2 API endpoints for external partners.', completionDate: '2023-09-01' },
                { id: 'PROJ-107', summary: 'Upgrade frontend framework to latest version', description: 'Migrated the project from React 17 to React 18, improving performance and enabling new features.', completionDate: '2023-11-05' },
                { id: 'PROJ-108', summary: 'Conduct user research for analytics module', description: 'Interviewed key stakeholders and users to gather requirements for the new analytics module.', completionDate: '2023-04-12' },
            ]);
        }, 500);
    });
};


export const fetchRealCompletedTasks = async (credentials: JiraCredentials): Promise<JiraTask[]> => {
    const { domain, user, token } = credentials;
    if (!domain || !user || !token) {
        throw new Error("Jira domain, user, and API token are required.");
    }

    // Note: This is a client-side request, which is not recommended for production
    // due to CORS and security concerns. A backend proxy is the standard approach.
    // A public CORS proxy is used here for demonstration purposes.
    const apiUrl = `https://thingproxy.freeboard.io/fetch/https://${domain}/rest/api/3/search`;
    const jql = "status = Done AND resolutiondate >= -365d ORDER BY resolutiondate DESC";

    const headers = new Headers();
    headers.append("Authorization", "Basic " + btoa(`${user}:${token}`));
    headers.append("Content-Type", "application/json");
    headers.append("Accept", "application/json");

    const body = JSON.stringify({
        jql: jql,
        maxResults: 100,
        fields: ["summary", "description", "resolutiondate"]
    });

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: body
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `Jira API Error (${response.status}): ${response.statusText}`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = `Jira API Error (${response.status}): ${errorData.errorMessages?.join(', ') || errorText}`;
            } catch (e) {
                // Not a JSON error, use text
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        
        const parseDescription = (description: any): string => {
            if (!description || !description.content) return 'No description provided.';
            
            let text = '';
            const recurseNodes = (nodes: any[]) => {
                if (!nodes) return;
                nodes.forEach(node => {
                    if (node.type === 'text' && node.text) {
                        text += node.text;
                    }
                    if (node.content) {
                        recurseNodes(node.content);
                    }
                });
                text += '\n';
            }
            recurseNodes(description.content);
            return text.trim() || 'No description provided.';
        }

        return data.issues.map((issue: any) => ({
            id: issue.key,
            summary: issue.fields.summary || 'No summary',
            description: parseDescription(issue.fields.description),
            completionDate: issue.fields.resolutiondate ? issue.fields.resolutiondate.split('T')[0] : 'N/A'
        }));

    } catch (error) {
        console.error("Failed to fetch tasks from Jira:", error);
        if (error instanceof Error && error.name === 'TypeError') {
             throw new Error(`Błąd sieciowy. Może to być problem z CORS, certyfikatem SSL lub błędnym adresem domeny JIRA. Spróbuj otworzyć adres API JIRA (${`https://${domain}`}) w nowej karcie i zaakceptować certyfikat, jeśli jest samopodpisany.`);
        }
        if (error instanceof Error) {
            throw new Error(`Connection to Jira failed: ${error.message}.`);
        }
        throw new Error("An unknown error occurred while connecting to Jira.");
    }
};