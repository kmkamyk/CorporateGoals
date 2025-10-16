import { JiraCredentials, JiraTask } from '../types';

// Helper to safely extract plain text from Atlassian Document Format (ADF)
const extractTextFromADF = (adf: any): string => {
    if (!adf || !adf.content) {
        return '';
    }
    let text = '';
    const recurse = (nodes: any[]) => {
        for (const node of nodes) {
            if (node.type === 'text' && node.text) {
                text += node.text;
            }
            if (node.content) {
                recurse(node.content);
            }
        }
    };
    recurse(adf.content);
    return text.trim();
};


/**
 * Fetches completed tasks from the real JIRA API.
 * @param creds - The user's JIRA credentials.
 * @returns A promise that resolves to an array of JIRA tasks.
 */
export const fetchRealCompletedTasks = async (creds: JiraCredentials): Promise<JiraTask[]> => {
    if (!creds.domain || !creds.user || !creds.token) {
        throw new Error("Domena JIRA, użytkownik i token API są wymagane.");
    }

    const apiUrl = `https://${creds.domain}/rest/api/3/search`;
    
    // Encode credentials for Basic Authentication
    const headers = new Headers();
    headers.append('Authorization', `Basic ${btoa(`${creds.user}:${creds.token}`)}`);
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');

    // JQL to get tasks with status 'Done', ordered by last updated date
    const body = JSON.stringify({
        jql: 'status = Done ORDER BY updated DESC',
        fields: ['summary', 'description', 'resolutiondate'],
        maxResults: 50, // Limit to 50 tasks to avoid huge responses
    });

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: body,
        });

        if (!response.ok) {
            let errorMsg = `Błąd API JIRA: ${response.status} ${response.statusText}.`;
            if (response.status === 401) {
                errorMsg += " Sprawdź poprawność emaila i tokenu API.";
            } else if (response.status === 404) {
                 errorMsg += " Nie znaleziono instancji JIRA pod podaną domeną. Upewnij się, że domena jest poprawna.";
            } else {
                 const errorData = await response.json();
                 errorMsg += ` ${JSON.stringify(errorData.errorMessages)}`;
            }
            throw new Error(errorMsg);
        }

        const data = await response.json();
        
        // Map the complex JIRA response to our simple JiraTask type
        return data.issues.map((issue: any): JiraTask => ({
            id: issue.key,
            summary: issue.fields.summary,
            description: extractTextFromADF(issue.fields.description) || 'Brak opisu.', // Handle ADF format for description
            completionDate: issue.fields.resolutiondate ? issue.fields.resolutiondate.split('T')[0] : new Date().toISOString().split('T')[0],
        }));

    } catch (e) {
        console.error("Błąd podczas pobierania zadań z JIRA:", e);
        if (e instanceof Error) {
            throw e;
        }
        throw new Error("Wystąpił nieznany błąd podczas komunikacji z API JIRA.");
    }
};


/**
 * Returns a mock list of JIRA tasks.
 */
export const fetchCompletedTasksMock = async (): Promise<JiraTask[]> => {
    console.log("Mocking JIRA API call...");

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return a predefined list of mock tasks
    return [
        {
            id: 'PROJ-123',
            summary: 'Implement new user authentication flow',
            description: 'Develop and integrate a new authentication system using OAuth 2.0. This includes frontend components, backend endpoints, and database schema changes.',
            completionDate: '2024-03-15',
        },
        {
            id: 'PROJ-145',
            summary: 'Design marketing materials for Q2 campaign',
            description: 'Create a set of digital assets for the upcoming "Summer Sale" campaign, including banners, social media posts, and email templates.',
            completionDate: '2024-04-22',
        },
        {
            id: 'PROJ-167',
            summary: 'Refactor reporting module for performance',
            description: 'The current reporting module is slow. Profile the code, identify bottlenecks, and refactor the data aggregation queries to improve page load times by 50%.',
            completionDate: '2024-02-10',
        },
        {
            id: 'PROJ-188',
            summary: 'Onboard two new junior developers',
            description: 'Prepare onboarding materials, conduct training sessions, and provide mentorship for the new team members to get them up to speed with our development workflow and codebase.',
            completionDate: '2024-05-30',
        },
        {
            id: 'PROJ-210',
            summary: 'Launch customer feedback portal',
            description: 'Build and deploy a new web portal where customers can submit feedback, suggest features, and vote on existing ideas. Integrate with our internal ticketing system.',
            completionDate: '2024-06-05',
        },
        {
            id: 'PROJ-221',
            summary: 'Fix critical security vulnerability CVE-2024-12345',
            description: 'A critical vulnerability was found in our session management library. Update the library to the patched version and verify the fix across all services.',
            completionDate: '2024-01-29',
        },
        {
            id: 'PROJ-235',
            summary: 'Organize quarterly team-building event',
            description: 'Plan and execute a team-building event to improve morale and collaboration. This includes choosing an activity, handling logistics, and gathering feedback.',
            completionDate: '2024-03-28',
        }
    ];
};