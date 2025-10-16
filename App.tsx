import React, { useState, useCallback } from 'react';
import { JiraTask, ProcessedGoal, JiraCredentials, AssignmentResult, DataSourceMode, LocalLlmConfig } from './types';
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

        try {
            const goalsList = annualGoalsRaw.split('\n').filter(g => g.trim() !== '');
            
            const assignments: AssignmentResult[] = await localLlmService.assignAndSummarizeTasks(goalsList, jiraTasks, assignmentPrompt, localLlmConfig);
            
            const goalPromises = goalsList.map(async (goalText, index) => {
                const assignedTasksInfo = assignments.filter(a => a.assignedGoalId === index);
                const tasksForThisGoal = assignedTasksInfo.map(a => {
                    const originalTask = jiraTasks.find(t => t.id === a.taskId);
                    return {
                        ...originalTask!,
                        goalContextSummary: a.contextualSummary
                    };
                });
                
                let annualSummary = "Nie wygenerowano podsumowania, ponieważ do tego celu nie przypisano żadnych zadań.";
                if (tasksForThisGoal.length > 0) {
                    const taskSummaries = tasksForThisGoal.map(t => `${t.summary}: ${t.goalContextSummary}`);
                    annualSummary = await localLlmService.generateAnnualSummary(goalText, taskSummaries, summaryPrompt, localLlmConfig);
                }

                return {
                    id: index,
                    text: goalText,
                    tasks: tasksForThisGoal,
                    annualSummary: annualSummary
                };
            });

            const results = await Promise.all(goalPromises);
            setProcessedGoals(results);

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
                           />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;