import React, { useState, useCallback } from 'react';
import { JiraTask, ProcessedGoal, JiraCredentials, AssignmentResult, DataSourceMode, LocalLlmConfig, ProcessedTask } from './types';
import { usePersistentState } from './hooks/usePersistentState';
import { GoalInput } from './components/GoalInput';
import { JiraConnect } from './components/JiraConnect';
import { SummaryDisplay } from './components/SummaryDisplay';
import { AIConfiguration } from './components/AIConfiguration';
import { LlmContextView } from './components/LlmContextView';
import { Button } from './components/common';
import * as localLlmService from './services/localLlmService';
import { fetchCompletedTasksMock, fetchRealCompletedTasks, parseManualTasks } from './services/jiraService';
import { SparklesIcon } from './components/icons';
import { ASSIGNMENT_PROMPT_TEMPLATE, SUMMARY_PROMPT_TEMPLATE } from './prompts';

const App: React.FC = () => {
    // Stany nietrwałe, resetowane przy odświeżeniu
    const [jiraTasks, setJiraTasks] = useState<JiraTask[]>([]);
    const [processedGoals, setProcessedGoals] = useState<ProcessedGoal[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [streamingSummary, setStreamingSummary] = useState<{ goalId: number; text: string } | null>(null);
    const [llmContext, setLlmContext] = useState<{ title: string, content: string } | null>(null);

    // Stany trwałe, zapisywane w localStorage
    const [annualGoalsRaw, setAnnualGoalsRaw] = usePersistentState('annualGoalsRaw', '');
    const [jiraCredentials, setJiraCredentials] = usePersistentState<JiraCredentials>('jiraCredentials', {
        domain: 'your-company.atlassian.net',
        user: 'your.email@example.com',
        token: ''
    });
    const [dataSourceMode, setDataSourceMode] = usePersistentState<DataSourceMode>('dataSourceMode', 'mock');
    const [manualTasksRaw, setManualTasksRaw] = usePersistentState('manualTasksRaw', '');
    const [assignmentPrompt, setAssignmentPrompt] = usePersistentState('assignmentPrompt', ASSIGNMENT_PROMPT_TEMPLATE);
    const [summaryPrompt, setSummaryPrompt] = usePersistentState('summaryPrompt', SUMMARY_PROMPT_TEMPLATE);
    const [localLlmConfig, setLocalLlmConfig] = usePersistentState<LocalLlmConfig>('localLlmConfig', {
        url: 'http://127.0.0.1:8080/v1/chat/completions',
        model: 'local-model',
        apiFormat: 'llama.cpp'
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
        setLlmContext(null); // Reset kontekstu na starcie

        try {
            const goalsList = annualGoalsRaw.split('\n').filter(g => g.trim() !== '');
            
            const initialGoals: ProcessedGoal[] = goalsList.map((goalText, index) => ({
                id: index,
                text: goalText,
                tasks: [],
                annualSummary: "..."
            }));
            setProcessedGoals(initialGoals);

            const finalResults: ProcessedGoal[] = [];

            for (const [index, goalText] of goalsList.entries()) {
                const relevantTaskSummaries: AssignmentResult[] = await localLlmService.findAndSummarizeTasksForGoal(
                    goalText,
                    jiraTasks,
                    assignmentPrompt,
                    localLlmConfig,
                    (prompt) => setLlmContext({
                        title: `Krok 1/2: Przypisywanie zadań do celu "${goalText}"`,
                        content: prompt
                    })
                );

                const processedTasksForGoal: ProcessedTask[] = relevantTaskSummaries.map(summary => {
                    const originalTask = jiraTasks.find(t => t.id === summary.taskId);
                    if (!originalTask) return null;
                    return { ...originalTask, goalContextSummary: summary.contextualSummary };
                }).filter((t): t is ProcessedTask => t !== null);

                const currentGoalData: ProcessedGoal = {
                    id: index,
                    text: goalText,
                    tasks: processedTasksForGoal,
                    annualSummary: "..."
                };

                let finalSummary = "Nie wygenerowano podsumowania, ponieważ do tego celu nie przypisano żadnych zadań.";
                if (processedTasksForGoal.length > 0) {
                    const taskSummaries = processedTasksForGoal.map(t => `${t.summary}: ${t.goalContextSummary}`);
                    
                    setStreamingSummary({ goalId: index, text: '' });
                    
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
                        },
                        (prompt) => setLlmContext({
                             title: `Krok 2/2: Generowanie podsumowania dla celu "${goalText}"`,
                             content: prompt
                        })
                    );
                }
                
                currentGoalData.annualSummary = finalSummary;
                finalResults.push(currentGoalData);
                
                setProcessedGoals([...finalResults, ...initialGoals.slice(finalResults.length)]);
            }

            setStreamingSummary(null);

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Wystąpił nieznany błąd.';
            setError(`Błąd podczas przetwarzania danych przez AI: ${errorMessage}`);
            console.error(e);
        } finally {
            setIsLoading(false);
            setLlmContext(null); // Wyczyszczenie kontekstu po zakończeniu
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
                            {/* Warunkowe renderowanie nowego komponentu */}
                            {isLoading && llmContext && (
                                <LlmContextView 
                                    title={llmContext.title} 
                                    content={llmContext.content} 
                                />
                            )}
                             <div className="mt-auto pt-8">
                                <Button onClick={handleProcess} disabled={!canProcess || isLoading} className="w-full">
                                    <SparklesIcon className="w-5 h-5 mr-2" />
                                    {isLoading ? 'Przetwarzanie...' : 'Generuj Podsumowanie Roczne'}
                                </Button>
                             </div>
                        </div>

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