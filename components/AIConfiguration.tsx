import React, { useState } from 'react';
import { Card } from './common';
import { CogIcon } from './icons';

// Fix: Remove props related to local LLM as we are using Gemini API
interface AIConfigurationProps {
    assignmentPrompt: string;
    setAssignmentPrompt: (prompt: string) => void;
    summaryPrompt: string;
    setSummaryPrompt: (prompt: string) => void;
    disabled: boolean;
}

export const AIConfiguration: React.FC<AIConfigurationProps> = ({
    assignmentPrompt,
    setAssignmentPrompt,
    summaryPrompt,
    setSummaryPrompt,
    disabled
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Card>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left"
                aria-expanded={isOpen}
            >
                <div className="flex items-center">
                    <CogIcon className="w-6 h-6 text-indigo-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-800">Konfiguracja AI</h2>
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
                <div className="mt-6 space-y-6">
                    {/* Fix: Remove local LLM URL configuration section */}
                    
                    {/* Prompt Templates */}
                    <div>
                        <h3 className="text-base font-medium text-gray-900">Szablony promptów</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Możesz edytować prompty, aby dostosować działanie AI. Użyj {'`{{placeholder}}`'} do wstawiania danych.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="assignmentPrompt" className="block text-sm font-medium text-gray-700">1. Prompt do przypisywania zadań</label>
                        <textarea
                            id="assignmentPrompt"
                            value={assignmentPrompt}
                            onChange={(e) => setAssignmentPrompt(e.target.value)}
                            disabled={disabled}
                            rows={12}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-gray-50 disabled:bg-gray-100 font-mono text-sm text-gray-900"
                        />
                         <p className="text-xs text-gray-500 mt-1">Wymagane placeholdery: {'`{{goals}}`, `{{tasks}}`'}</p>
                    </div>

                     <div>
                        <label htmlFor="summaryPrompt" className="block text-sm font-medium text-gray-700">2. Prompt do generowania podsumowania</label>
                        <textarea
                            id="summaryPrompt"
                            value={summaryPrompt}
                            onChange={(e) => setSummaryPrompt(e.target.value)}
                            disabled={disabled}
                            rows={12}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-gray-50 disabled:bg-gray-100 font-mono text-sm text-gray-900"
                        />
                        <p className="text-xs text-gray-500 mt-1">Wymagane placeholdery: {'`{{goal}}`, `{{summaries}}`'}</p>
                    </div>

                </div>
            )}
        </Card>
    );
};
