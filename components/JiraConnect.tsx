import React from 'react';
import { JiraTask, JiraCredentials } from '../types';
import { Card, Button } from './common';
import { JiraIcon } from './icons';

interface JiraConnectProps {
    credentials: JiraCredentials;
    setCredentials: (creds: JiraCredentials) => void;
    onFetch: () => void;
    tasks: JiraTask[];
    disabled: boolean;
    useMockData: boolean;
    setUseMockData: (useMock: boolean) => void;
}

export const JiraConnect: React.FC<JiraConnectProps> = ({ credentials, setCredentials, onFetch, tasks, disabled, useMockData, setUseMockData }) => {
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
    };

    return (
        <Card>
            <div className="flex items-center mb-4">
                <JiraIcon className="w-6 h-6 text-indigo-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-800">2. Zadania z JIRA</h2>
            </div>
            <p className="text-gray-600 mb-4">Podaj dane do API JIRA, aby pobrać ukończone zadania. Aplikacja nie zapisuje tych danych.</p>
            
            <div className="space-y-4 mb-4">
                <div>
                    <label htmlFor="domain" className="block text-sm font-medium text-gray-700">Domena JIRA</label>
                    <input
                        type="text"
                        name="domain"
                        id="domain"
                        value={credentials.domain}
                        onChange={handleInputChange}
                        disabled={disabled}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 disabled:bg-gray-100"
                    />
                </div>
                 <div>
                    <label htmlFor="user" className="block text-sm font-medium text-gray-700">Użytkownik (email)</label>
                    <input
                        type="text"
                        name="user"
                        id="user"
                        value={credentials.user}
                        onChange={handleInputChange}
                        disabled={disabled}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 disabled:bg-gray-100"
                    />
                </div>
                <div>
                    <label htmlFor="token" className="block text-sm font-medium text-gray-700">Token API</label>
                    <input
                        type="password"
                        name="token"
                        id="token"
                        placeholder="Wprowadź swój token API"
                        value={credentials.token}
                        onChange={handleInputChange}
                        disabled={disabled}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 disabled:bg-gray-100"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <input
                        id="useMockData"
                        name="useMockData"
                        type="checkbox"
                        checked={useMockData}
                        onChange={(e) => setUseMockData(e.target.checked)}
                        disabled={disabled}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="useMockData" className="ml-2 block text-sm text-gray-900">
                        Użyj mockowych danych
                    </label>
                </div>
            </div>

            <Button onClick={onFetch} disabled={disabled} className="w-full">
                {disabled ? 'Pobieranie...' : (useMockData ? 'Pobierz zadania (Mock)' : 'Pobierz zadania z JIRA')}
            </Button>
            {tasks.length > 0 && (
                 <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-700">Pobrano {tasks.length} zadań:</h3>
                    <ul className="text-sm text-gray-600 list-disc list-inside mt-2 max-h-32 overflow-y-auto">
                        {tasks.map(task => <li key={task.id} className="truncate">{task.id}: {task.summary}</li>)}
                    </ul>
                </div>
            )}
        </Card>
    );
};