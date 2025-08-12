import React, { useState } from 'react';
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';
import { updateProjectStatus } from '../../../services/supabase/projects';

interface StatusDebuggerProps {
    projectId: string;
    currentStatus: string;
}

export const StatusDebugger: React.FC<StatusDebuggerProps> = ({ projectId, currentStatus }) => {
    const [testing, setTesting] = useState<string | null>(null);
    const [results, setResults] = useState<string[]>([]);

    const testStatuses = [
        'new', 'submitted', 'waiting_for_confirmation', 'confirmed',
        'in_progress', 'in_design', 'review', 'final_delivery', 'completed'
    ];

    const testStatus = async (status: string) => {
        setTesting(status);
        try {
            await updateProjectStatus(projectId, status as any);
            setResults(prev => [...prev, `✅ ${status}: SUCCESS`]);
        } catch (error: any) {
            setResults(prev => [...prev, `❌ ${status}: ${error.message}`]);
        } finally {
            setTesting(null);
        }
    };

    return (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">Status Debugger</h4>
            <p className="text-sm text-yellow-700 mb-3">
                Current status: <strong>{currentStatus}</strong>
            </p>

            <div className="grid grid-cols-3 gap-2 mb-4">
                {testStatuses.map(status => (
                    <Button
                        key={status}
                        size="sm"
                        variant="outline"
                        onClick={() => testStatus(status)}
                        disabled={testing !== null}
                        loading={testing === status}
                        className="text-xs"
                    >
                        {status}
                    </Button>
                ))}
            </div>

            {results.length > 0 && (
                <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono max-h-32 overflow-y-auto">
                    {results.map((result, index) => (
                        <div key={index}>{result}</div>
                    ))}
                </div>
            )}

            <Button
                size="sm"
                variant="outline"
                onClick={() => setResults([])}
                className="mt-2 text-xs"
            >
                Clear Results
            </Button>
        </Card>
    );
};