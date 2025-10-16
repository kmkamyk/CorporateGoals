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
}

export const JiraConnect: React.FC<JiraConnectProps> = ({ credentials, setCredentials, onFetch, tasks, disabled }) => {
    
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
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={credentials.email}
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
            <Button onClick={onFetch} disabled={disabled} className="w-full">
                {disabled ? 'Pobieranie...' : 'Pobierz zadania (Mock)'}
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