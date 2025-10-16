import React, { useState, useCallback } from 'react';
import { JiraTask, ProcessedGoal, JiraCredentials, AssignmentResult, DataSourceMode, LocalLlmConfig, ProcessedTask } from './types';
import { GoalInput } from './components/GoalInput';
import { JiraConnect } from './components/JiraConnect';
import { SummaryDisplay } from './components/SummaryDisplay';
import { AIConfiguration } from './components/AIConfiguration';
import { Button } from './components/common';
import * as localLlmService from './services/localLlmService';
import { fetchCompletedTasksMock, fetchRealCompletedTasks, parseManualTasks } from './services/jiraService';
import { SparklesIcon } from './components/icons';
import { ASSIGNMENT_PROMPT_TEMPLATE, SUMMARY_PROMPT_TEMPLATE } from './prompts';

const App: React.FC = () => {
    const [annualGoalsRaw, setAnnualGoalsRaw] = useState('');
    const [jiraTasks, setJiraTasks] = useState<JiraTask[]>([]);
    const [processedGoals, setProcessedGoals] = useState<ProcessedGoal[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [jiraCredentials, setJiraCredentials] = useState<JiraCredentials>({
        domain: 'your-company.atlassian.net',
        user: 'your.email@example.com',
        token: ''
    });
    const [dataSourceMode, setDataSourceMode] = useState<DataSourceMode>('mock');
    const [manualTasksRaw, setManualTasksRaw] = useState('');

    const [assignmentPrompt, setAssignmentPrompt] = useState(ASSIGNMENT_PROMPT_TEMPLATE);
    const [summaryPrompt, setSummaryPrompt] = useState(SUMMARY_PROMPT_TEMPLATE);
    
    const [streamingSummary, setStreamingSummary] = useState<{ goalId: number; text: string } | null>(null);

    const [localLlmConfig, setLocalLlmConfig] = useState<LocalLlmConfig>({
        url: 'http://127.0.0.1:8080/v1/chat/completions',
        model: 'local-model'
    });


    const handleLoadTasks = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setJiraTasks([]);
        try {
            let tasks: JiraTask[] = [];
            switch (dataSourceMode) {
                case 'mock':
                    tasks = await fetchCompletedTasksMock();
                    break;
                case 'jira':
                    tasks = await fetchRealCompletedTasks(jiraCredentials);
                    break;
                case 'manual':
                    tasks = parseManualTasks(manualTasksRaw);
                    if (tasks.length === 0) {
                        throw new Error("Nie wprowadzono żadnych zadań lub tekst jest w nieprawidłowym formacie.");
                    }
                    break;
            }
            setJiraTasks(tasks);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Wystąpił nieznany błąd.';
            setError(`Nie udało się załadować zadań: ${errorMessage}`);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [dataSourceMode, jiraCredentials, manualTasksRaw]);

    const handleProcess = useCallback(async () => {
        if (!annualGoalsRaw.trim() || jiraTasks.length === 0) {
            setError('Wprowadź cele roczne i załaduj zadania przed przetworzeniem.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setProcessedGoals(null);
        setStreamingSummary(null);

        try {
            const goalsList = annualGoalsRaw.split('\n').filter(g => g.trim() !== '');
            
            // Initialize goals structure so UI can show placeholders
            const initialGoals: ProcessedGoal[] = goalsList.map((goalText, index) => ({
                id: index,
                text: goalText,
                tasks: [],
                annualSummary: "..." // Placeholder
            }));
            setProcessedGoals(initialGoals);

            const finalResults: ProcessedGoal[] = [];

            // Process each goal sequentially
            for (const [index, goalText] of goalsList.entries()) {
                // Step 1: Find and summarize tasks relevant to THIS goal
                const relevantTaskSummaries: AssignmentResult[] = await localLlmService.findAndSummarizeTasksForGoal(
                    goalText,
                    jiraTasks,
                    assignmentPrompt,
                    localLlmConfig
                );

                const processedTasksForGoal: ProcessedTask[] = relevantTaskSummaries.map(summary => {
                    const originalTask = jiraTasks.find(t => t.id === summary.taskId);
                    // Handle case where task might not be found, though it shouldn't happen
                    if (!originalTask) return null;
                    return {
                        ...originalTask,
                        goalContextSummary: summary.contextualSummary
                    };
                }).filter((t): t is ProcessedTask => t !== null);


                const currentGoalData: ProcessedGoal = {
                    id: index,
                    text: goalText,
                    tasks: processedTasksForGoal,
                    annualSummary: "..."
                };

                // Step 2: Generate annual summary for THIS goal based on relevant tasks
                let finalSummary = "Nie wygenerowano podsumowania, ponieważ do tego celu nie przypisano żadnych zadań.";
                if (processedTasksForGoal.length > 0) {
                    const taskSummaries = processedTasksForGoal.map(t => `${t.summary}: ${t.goalContextSummary}`);
                    
                    setStreamingSummary({ goalId: index, text: '' }); // Start streaming for this goal
                    
                    finalSummary = await localLlmService.generateAnnualSummary(
                        goalText,
                        taskSummaries,
                        summaryPrompt,
                        localLlmConfig,
                        (chunk) => {
                             setStreamingSummary(prev => {
                                if (prev && prev.goalId === index) {
                                    return { ...prev, text: prev.text + chunk };
                                }
                                return prev;
                            });
                        }
                    );
                }
                
                currentGoalData.annualSummary = finalSummary;
                finalResults.push(currentGoalData);
                
                // Update UI progressively after each goal is fully processed
                setProcessedGoals([...finalResults, ...initialGoals.slice(finalResults.length)]);
            }

            setStreamingSummary(null); // End of all streaming

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Wystąpił nieznany błąd.';
            setError(`Błąd podczas przetwarzania danych przez AI: ${errorMessage}`);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [annualGoalsRaw, jiraTasks, assignmentPrompt, summaryPrompt, localLlmConfig]);

    const canProcess = annualGoalsRaw.trim().length > 0 && jiraTasks.length > 0;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Corporate Goals Dashboard</h1>
                    <p className="text-lg text-gray-600 mt-2">Automatyzuj podsumowania roczne, łącząc cele z zadaniami JIRA.</p>
                </header>

                <main>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left column for inputs */}
                        <div className="lg:col-span-1 flex flex-col gap-8">
                            <GoalInput
                                value={annualGoalsRaw}
                                onChange={setAnnualGoalsRaw}
                                disabled={isLoading}
                            />
                            <JiraConnect
                                credentials={jiraCredentials}
                                setCredentials={setJiraCredentials}
                                onFetch={handleLoadTasks}
                                tasks={jiraTasks}
                                disabled={isLoading}
                                dataSourceMode={dataSourceMode}
                                setDataSourceMode={setDataSourceMode}
                                manualTasksRaw={manualTasksRaw}
                                setManualTasksRaw={setManualTasksRaw}
                            />
                            <AIConfiguration
                                assignmentPrompt={assignmentPrompt}
                                setAssignmentPrompt={setAssignmentPrompt}
                                summaryPrompt={summaryPrompt}
                                setSummaryPrompt={setSummaryPrompt}
                                disabled={isLoading}
                                localLlmConfig={localLlmConfig}
                                setLocalLlmConfig={setLocalLlmConfig}
                            />
                             <div className="mt-auto pt-8">
                                <Button onClick={handleProcess} disabled={!canProcess || isLoading} className="w-full">
                                    <SparklesIcon className="w-5 h-5 mr-2" />
                                    {isLoading ? 'Przetwarzanie...' : 'Generuj Podsumowanie Roczne'}
                                </Button>
                             </div>
                        </div>

                        {/* Right column for results */}
                        <div className="lg:col-span-2">
                           <SummaryDisplay
                             goals={processedGoals}
                             isLoading={isLoading}
                             error={error}
                             hasInputs={canProcess}
                             streamingSummary={streamingSummary}
                           />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;