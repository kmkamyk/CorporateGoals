
import { JiraTask } from '../types';

// This is a mock service. In a real application, this would make an API call to JIRA.
export const fetchCompletedTasks = async (): Promise<JiraTask[]> => {
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
