

import React, { useState } from 'react';
import { ProcessedGoal } from '../types';
import { Card, Spinner } from './common';
import { SummaryIcon, GoalsIcon } from './icons';

interface SummaryDisplayProps {
    goals: ProcessedGoal[] | null;
    isLoading: boolean;
    error: string | null;
    hasInputs: boolean;
    streamingSummary: { goalId: number; text: string } | null;
}

const BlinkingCursor = () => (
    <span className="inline-block w-2 h-4 bg-gray-600 animate-pulse ml-1" />
);

const GoalAccordion: React.FC<{ goal: ProcessedGoal; isStreaming: boolean; streamingText: string; }> = ({ goal, isStreaming, streamingText }) => {
    const [isOpen, setIsOpen] = useState(true);
    
    const renderSummary = () => {
        const textToRender = isStreaming ? streamingText : goal.annualSummary;
        const paragraphs = textToRender.split('\n').filter(p => p.trim() !== '');

        return (
            <>
                {paragraphs.map((paragraph, i) => (
                    <p key={i} className="mb-2 last:mb-0">{paragraph}</p>
                ))}
                {isStreaming && <BlinkingCursor />}
            </>
        );
    }

    return (
        <div className="border border-gray-200 rounded-lg mb-4 bg-white">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left text-lg font-semibold text-gray-800"
            >
                <div className="flex items-center">
                    <GoalsIcon className="w-6 h-6 text-indigo-500 mr-3" />
                    <span>{goal.text}</span>
                </div>
                <svg
                    className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-gray-200">
                    <h4 className="text-md font-semibold text-gray-700 mb-2">Podsumowanie roczne działań</h4>
                    <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap">
                        {renderSummary()}
                    </div>
                    
                    <h4 className="text-md font-semibold text-gray-700 mt-6 mb-2">Przypisane zadania ({goal.tasks.length})</h4>
                    <div className="space-y-4">
                        {goal.tasks.length > 0 ? goal.tasks.map(task => (
                            <div key={task.id} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                                <p className="font-semibold text-gray-800">{task.id}: {task.summary}</p>
                                <p className="text-xs text-gray-500 mb-2">Ukończono: {task.completionDate}</p>
                                <p className="text-sm text-gray-600">{task.goalContextSummary}</p>
                            </div>
                        )) : <p className="text-sm text-gray-500">Brak przypisanych zadań.</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ goals, isLoading, error, hasInputs, streamingSummary }) => {
    
    const renderError = () => {
        const errorMarker = "Otrzymano następującą odpowiedź:\n\n";
        if (error && error.includes(errorMarker)) {
            const parts = error.split(errorMarker);
            const mainError = parts[0];
            const rawResponse = parts[1];
            return (
                <div className="text-left">
                     <p className="font-semibold text-red-700">Wystąpił błąd</p>
                     <p className="mt-2 text-sm text-red-600">{mainError}</p>
                     <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-800">Otrzymana surowa odpowiedź od AI:</h4>
                        <pre className="mt-2 p-3 bg-gray-100 text-gray-700 rounded-md text-xs whitespace-pre-wrap max-h-60 overflow-auto">
                            <code>{rawResponse}</code>
                        </pre>
                     </div>
                </div>
            );
        }
        return (
            <div className="text-center">
                <p className="font-semibold text-red-700">Wystąpił błąd</p>
                <p className="mt-2 text-sm text-red-600">{error}</p>
            </div>
        );
    };

    const renderContent = () => {
        if (isLoading && !goals) { // Show spinner only on initial load
            return (
                <div className="text-center py-12">
                    <Spinner />
                    <p className="mt-4 text-gray-600 font-semibold">AI analizuje Twoje dane...</p>
                    <p className="text-sm text-gray-500">To może potrwać chwilę.</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    {renderError()}
                </div>
            );
        }

        if (goals) {
            return (
                <div>
                    {goals.map(goal => (
                        <GoalAccordion 
                            key={goal.id} 
                            goal={goal}
                            isStreaming={streamingSummary?.goalId === goal.id}
                            streamingText={streamingSummary?.goalId === goal.id ? streamingSummary.text : ''}
                        />
                    ))}
                </div>
            );
        }

        return (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <SummaryIcon className="w-12 h-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Podsumowanie roczne</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {hasInputs 
                    ? "Kliknij 'Generuj Podsumowanie Roczne', aby rozpocząć analizę."
                    : "Wprowadź swoje cele i pobierz zadania z JIRA, aby zobaczyć wyniki."}
                </p>
            </div>
        );
    };

    return (
        <Card className="!p-0">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-800">3. Podsumowanie Roczne</h2>
                <p className="text-gray-600 mt-1">Wyniki analizy AI pojawią się poniżej.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-b-lg">
                {renderContent()}
            </div>
        </Card>
    );
};