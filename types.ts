export interface JiraTask {
    id: string;
    summary: string;
    description: string;
    completionDate: string;
}

export interface AnnualGoal {
    id: number;
    text: string;
}

export interface ProcessedTask extends JiraTask {
    goalContextSummary: string;
}

export interface ProcessedGoal extends AnnualGoal {
    tasks: ProcessedTask[];
    annualSummary: string;
}

export interface JiraCredentials {
    domain: string;
    user: string; // Changed from email
    token: string;
}

export interface AssignmentResult {
    taskId: string;
    assignedGoalId: number;
    contextualSummary: string;
}

export type DataSourceMode = 'mock' | 'jira' | 'manual';

export interface LocalLlmConfig {
    url: string;
    model: string;
}