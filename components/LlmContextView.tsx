import React from 'react';
import { Card } from './common';
import { SparklesIcon } from './icons';

interface LlmContextViewProps {
    title: string;
    content: string;
}

export const LlmContextView: React.FC<LlmContextViewProps> = ({ title, content }) => {
    return (
        <Card className="animate-fade-in border-2 border-indigo-200">
            <div className="flex items-center mb-4">
                <SparklesIcon className="w-6 h-6 text-indigo-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-800">Aktualny Kontekst dla AI</h2>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2 text-sm">{title}</h3>
                <pre className="text-xs text-gray-800 whitespace-pre-wrap bg-white p-3 rounded-md shadow-inner max-h-80 overflow-y-auto font-mono border border-gray-200">
                    <code>{content}</code>
                </pre>
            </div>
        </Card>
    );
};
