import React, { useState } from 'react';
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';
import { ClientNotesService } from '../../../services/supabase/clientNotes';
import { supabase } from '../../../lib/supabase';

export const ClientNotesTest: React.FC = () => {
    const [testResults, setTestResults] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const addTestResult = (message: string) => {
        setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const testDatabaseConnection = async () => {
        try {
            addTestResult('🔍 Testing database connection...');

            // Test basic supabase connection
            const { data: user } = await supabase.auth.getUser();
            addTestResult(`✅ Auth user: ${user.user?.email || 'No user'}`);

            // Test if client_notes table exists
            const { error } = await supabase
                .from('client_notes')
                .select('count(*)')
                .limit(1);

            if (error) {
                addTestResult(`❌ Table check failed: ${error.message}`);
                addTestResult(`Error code: ${error.code}`);
                addTestResult(`Error details: ${error.details}`);
                return;
            }

            addTestResult('✅ client_notes table exists and is accessible');

        } catch (error: any) {
            addTestResult(`❌ Connection test failed: ${error.message}`);
        }
    };

    const testClientNotesService = async () => {
        try {
            addTestResult('🧪 Testing ClientNotesService...');

            const testClientId = 'test-client-123';
            const testClientEmail = 'test@example.com';

            // Test fetching notes (should work even if empty)
            const notes = await ClientNotesService.getClientNotes(testClientId, testClientEmail);
            addTestResult(`✅ Fetched ${notes.length} notes for test client`);

            // Test adding a note
            const newNote = await ClientNotesService.addClientNote(
                testClientId,
                testClientEmail,
                'Test note from debug component'
            );
            addTestResult(`✅ Added test note: ${newNote.id}`);

            // Test fetching again
            const updatedNotes = await ClientNotesService.getClientNotes(testClientId, testClientEmail);
            addTestResult(`✅ Fetched ${updatedNotes.length} notes after adding`);

            // Test toggling the note
            await ClientNotesService.toggleClientNote(newNote.id, true);
            addTestResult(`✅ Toggled note completion`);

            // Test deleting the note
            await ClientNotesService.deleteClientNote(newNote.id);
            addTestResult(`✅ Deleted test note`);

            addTestResult('🎉 All ClientNotesService tests passed!');

        } catch (error: any) {
            addTestResult(`❌ Service test failed: ${error.message}`);
            console.error('Service test error:', error);
        }
    };

    const runAllTests = async () => {
        setLoading(true);
        setTestResults([]);

        await testDatabaseConnection();
        await testClientNotesService();

        setLoading(false);
    };

    const clearResults = () => {
        setTestResults([]);
    };

    return (
        <Card className="p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Client Notes Debug Test
            </h3>

            <div className="space-y-4">
                <div className="flex space-x-3">
                    <Button
                        onClick={runAllTests}
                        disabled={loading}
                        loading={loading}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Run Tests
                    </Button>
                    <Button
                        variant="outline"
                        onClick={clearResults}
                        disabled={loading}
                    >
                        Clear Results
                    </Button>
                </div>

                {testResults.length > 0 && (
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                        {testResults.map((result, index) => (
                            <div key={index} className="mb-1">
                                {result}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
};