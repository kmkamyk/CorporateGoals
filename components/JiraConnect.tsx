import React from 'react';
import { JiraTask, JiraCredentials, DataSourceMode } from '../types';
import { Card, Button } from './common';
import { JiraIcon } from './icons';

interface JiraConnectProps {
    credentials: JiraCredentials;
    setCredentials: (creds: JiraCredentials) => void;
    onFetch: () => void;
    tasks: JiraTask[];
    disabled: boolean;
    dataSourceMode: DataSourceMode;
    setDataSourceMode: (mode: DataSourceMode) => void;
    manualTasksRaw: string;
    setManualTasksRaw: (text: string) => void;
}

export const JiraConnect: React.FC<JiraConnectProps> = ({ 
    credentials, 
    setCredentials, 
    onFetch, 
    tasks, 
    disabled, 
    dataSourceMode, 
    setDataSourceMode,
    manualTasksRaw,
    setManualTasksRaw
}) => {
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
    };

    const getButtonText = () => {
        if (disabled) return 'Ładowanie...';
        switch (dataSourceMode) {
            case 'mock': return 'Załaduj zadania (Mock)';
            case 'jira': return 'Pobierz zadania z JIRA';
            case 'manual': return 'Przetwórz wpisane zadania';
        }
    }

    return (
        <Card>
            <div className="flex items-center mb-4">
                <JiraIcon className="w-6 h-6 text-indigo-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-800">2. Zadania z JIRA</h2>
            </div>
            <p className="text-gray-600 mb-4">Wybierz źródło ukończonych zadań do analizy.</p>
            
            {/* Data Source Mode Selector */}
            <fieldset className="mb-4">
                <legend className="sr-only">Wybór źródła danych</legend>
                <div className="flex justify-between space-x-2 rounded-md bg-gray-100 p-1">
                    {(['mock', 'jira', 'manual'] as DataSourceMode[]).map((mode) => (
                        <div key={mode} className="w-full">
                            <input
                                type="radio"
                                name="dataSourceOption"
                                id={mode}
                                value={mode}
                                checked={dataSourceMode === mode}
                                onChange={() => setDataSourceMode(mode)}
                                className="sr-only"
                                disabled={disabled}
                            />
                            <label
                                htmlFor={mode}
                                className={`cursor-pointer w-full text-center block text-sm font-medium py-2 px-2 rounded-md transition-colors ${
                                    dataSourceMode === mode
                                        ? 'bg-white text-indigo-700 shadow-sm'
                                        : 'text-gray-500 hover:bg-gray-200'
                                } ${disabled ? 'cursor-not-allowed text-gray-400' : ''}`}
                            >
                                {mode === 'mock' && 'Dane Mockowe'}
                                {mode === 'jira' && 'Połącz z JIRA'}
                                {mode === 'manual' && 'Wpisz Ręcznie'}
                            </label>
                        </div>
                    ))}
                </div>
            </fieldset>

            {/* JIRA API Credentials Form */}
            {dataSourceMode === 'jira' && (
                <div className="space-y-4 mb-4 animate-fade-in">
                    <p className="text-sm text-gray-500">Podaj dane do API JIRA, aby pobrać ukończone zadania. Aplikacja nie zapisuje tych danych.</p>
                    <div>
                        <label htmlFor="domain" className="block text-sm font-medium text-gray-700">Domena JIRA</label>
                        <input type="text" name="domain" id="domain" value={credentials.domain} onChange={handleInputChange} disabled={disabled} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 disabled:bg-gray-100"/>
                    </div>
                    <div>
                        <label htmlFor="user" className="block text-sm font-medium text-gray-700">Użytkownik (email)</label>
                        <input type="text" name="user" id="user" value={credentials.user} onChange={handleInputChange} disabled={disabled} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 disabled:bg-gray-100"/>
                    </div>
                    <div>
                        <label htmlFor="token" className="block text-sm font-medium text-gray-700">Token API</label>
                        <input type="password" name="token" id="token" placeholder="Wprowadź swój token API" value={credentials.token} onChange={handleInputChange} disabled={disabled} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 disabled:bg-gray-100"/>
                    </div>
                </div>
            )}
            
            {/* Manual Task Input */}
            {dataSourceMode === 'manual' && (
                 <div className="mb-4 animate-fade-in">
                    <label htmlFor="manualTasks" className="block text-sm font-medium text-gray-700">Lista zadań</label>
                     <p className="text-sm text-gray-500 mb-2">Wpisz zadania, każde w nowej linii, w formacie: <code className="bg-gray-100 p-1 rounded">ID-ZADANIA: Treść zadania</code></p>
                    <textarea
                        id="manualTasks"
                        value={manualTasksRaw}
                        onChange={(e) => setManualTasksRaw(e.target.value)}
                        disabled={disabled}
                        rows={8}
                        placeholder={`PROJ-101: Implementacja logowania użytkownika\nPROJ-102: Stworzenie widgetu na dashboardzie`}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-gray-50 disabled:bg-gray-100"
                    />
                </div>
            )}


            <Button onClick={onFetch} disabled={disabled} className="w-full mt-4">
                {getButtonText()}
            </Button>

            {tasks.length > 0 && (
                 <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-700">Załadowano {tasks.length} zadań:</h3>
                    <ul className="text-sm text-gray-600 list-disc list-inside mt-2 max-h-32 overflow-y-auto">
                        {tasks.map(task => <li key={task.id} className="truncate">{task.id}: {task.summary}</li>)}
                    </ul>
                </div>
            )}
        </Card>
    );
};