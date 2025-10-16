import React from 'react';
import { Card } from './common';
import { GoalsIcon } from './icons';

interface GoalInputProps {
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
}

export const GoalInput: React.FC<GoalInputProps> = ({ value, onChange, disabled }) => {
    return (
        <Card>
            <div className="flex items-center mb-4">
                <GoalsIcon className="w-6 h-6 text-indigo-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-800">1. Moje cele roczne</h2>
            </div>
            <p className="text-gray-600 mb-4">Wpisz swoje cele roczne, każdy w nowej linii. Na ich podstawie AI przypisze zadania z JIRA.</p>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                rows={10}
                placeholder={`Np. Ulepszenie wydajności aplikacji o 20%
Wdrożenie nowego modułu analitycznego
Zwiększenie pokrycia testami jednostkowymi do 80%`}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-gray-50 disabled:bg-gray-100"
            />
        </Card>
    );
};