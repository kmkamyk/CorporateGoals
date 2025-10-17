import React, { useState } from 'react';
import { Card } from './common';
import { CogIcon } from './icons';
import { LocalLlmConfig } from '../types';

interface AIConfigurationProps {
    assignmentPrompt: string;
    setAssignmentPrompt: (prompt: string) => void;
    summaryPrompt: string;
    setSummaryPrompt: (prompt: string) => void;
    disabled: boolean;
    localLlmConfig: LocalLlmConfig;
    setLocalLlmConfig: (config: LocalLlmConfig) => void;
}

export const AIConfiguration: React.FC<AIConfigurationProps> = ({
    assignmentPrompt,
    setAssignmentPrompt,
    summaryPrompt,
    setSummaryPrompt,
    disabled,
    localLlmConfig,
    setLocalLlmConfig
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleLlmConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalLlmConfig({ ...localLlmConfig, [name]: value });
    };

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
                    {/* Local LLM Configuration */}
                     <div className="space-y-4 p-4 border border-gray-200 rounded-md">
                        <h3 className="text-base font-medium text-gray-900">Konfiguracja Lokalnego LLM</h3>
                         
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Format API</label>
                            <fieldset className="mt-2">
                                <legend className="sr-only">Wybierz format API</legend>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center">
                                        <input
                                            id="llama.cpp"
                                            name="apiFormat"
                                            type="radio"
                                            value="llama.cpp"
                                            checked={localLlmConfig.apiFormat === 'llama.cpp'}
                                            onChange={handleLlmConfigChange}
                                            disabled={disabled}
                                            className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                        />
                                        <label htmlFor="llama.cpp" className="ml-3 block text-sm font-medium text-gray-700">
                                            llama.cpp
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="ollama"
                                            name="apiFormat"
                                            type="radio"
                                            value="ollama"
                                            checked={localLlmConfig.apiFormat === 'ollama'}
                                            onChange={handleLlmConfigChange}
                                            disabled={disabled}
                                            className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                        />
                                        <label htmlFor="ollama" className="ml-3 block text-sm font-medium text-gray-700">
                                            Ollama
                                        </label>
                                    </div>
                                </div>
                            </fieldset>
                        </div>

                         <div>
                            <label htmlFor="url" className="block text-sm font-medium text-gray-700">Adres URL API</label>
                            <input type="text" name="url" id="url" value={localLlmConfig.url} onChange={handleLlmConfigChange} disabled={disabled} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 disabled:bg-gray-100"/>
                            <p className="text-xs text-gray-500 mt-1">
                                {localLlmConfig.apiFormat === 'llama.cpp'
                                    ? 'Np. http://127.0.0.1:8080/v1/chat/completions'
                                    : 'Np. http://127.0.0.1:11434/api/chat'}
                            </p>
                         </div>
                         <div>
                            <label htmlFor="model" className="block text-sm font-medium text-gray-700">Nazwa Modelu</label>
                            <input type="text" name="model" id="model" value={localLlmConfig.model} onChange={handleLlmConfigChange} disabled={disabled} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 disabled:bg-gray-100"/>
                             <p className="text-xs text-gray-500 mt-1">Podaj nazwę modelu, której oczekuje Twoje API.</p>
                         </div>
                     </div>
                    
                    {/* Prompt Templates */}
                    <div className="pt-4 border-t border-gray-200">
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