
import React, { useState } from 'react';
import { ProcessedGoal } from '../types';
import { Card, Spinner } from './common';
import { SummaryIcon, GoalsIcon } from './icons';

interface SummaryDisplayProps {
    goals: ProcessedGoal[] | null;
    isLoading: boolean;
    error: string | null;
    hasInputs: boolean;
}

const GoalAccordion: React.FC<{ goal: ProcessedGoal }> = ({ goal }) => {
    const [isOpen, setIsOpen] = useState(true);

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
                        {goal.annualSummary.split('\n\n').map((paragraph, i) => <p key={i}>{paragraph}</p>)}
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

export const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ goals, isLoading, error, hasInputs }) => {
    const renderContent = () => {
        if (isLoading) {
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
                <div className="text-center py-12 bg-red-50 border border-red-200 rounded-lg">
                    <p className="font-semibold text-red-700">Wystąpił błąd</p>
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                </div>
            );
        }

        if (goals) {
            return (
                <div>
                    {goals.map(goal => <GoalAccordion key={goal.id} goal={goal} />)}
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
