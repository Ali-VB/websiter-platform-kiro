import React, { useState } from 'react';
import { NotificationService } from '../../services/supabase/notificationService';

/**
 * Simple test component to verify notification system works
 * This will be removed after testing is complete
 */
export const NotificationTest: React.FC = () => {
    const [testResults, setTestResults] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const addResult = (message: string) => {
        setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const runUserFetchingTest = async () => {
        setIsLoading(true);
        addResult('🧪 Starting user fetching test...');

        try {
            const result = await NotificationService.testUserFetching();
            if (result.success) {
                addResult(`✅ User fetching test PASSED: ${result.userCount} client users found`);
            } else {
                addResult(`❌ User fetching test FAILED: ${result.error}`);
            }
        } catch (error) {
            addResult(`❌ User fetching test ERROR: ${error}`);
        }

        setIsLoading(false);
    };

    const runNotificationTest = async () => {
        setIsLoading(true);
        addResult('🧪 Starting notification fetching test...');

        try {
            const result = await NotificationService.getUserNotifications(1, 5);
            addResult(`✅ Notification test PASSED: ${result.notifications.length} notifications, total: ${result.totalCount}`);

            // Log first notification for debugging
            if (result.notifications.length > 0) {
                const first = result.notifications[0];
                addResult(`📋 First notification: "${first.title}" (${first.type})`);
            }
        } catch (error) {
            addResult(`❌ Notification test FAILED: ${error}`);
        }

        setIsLoading(false);
    };

    const clearResults = () => {
        setTestResults([]);
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-4">🧪 Notification System Test</h2>

            <div className="space-y-3 mb-6">
                <button
                    onClick={runUserFetchingTest}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    Test User Fetching
                </button>

                <button
                    onClick={runNotificationTest}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                    Test Notification Fetching
                </button>

                <button
                    onClick={clearResults}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                    Clear Results
                </button>
            </div>

            {isLoading && (
                <div className="text-blue-600 mb-4">⏳ Running test...</div>
            )}

            <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
                <h3 className="font-semibold mb-2">Test Results:</h3>
                {testResults.length === 0 ? (
                    <p className="text-gray-500">No tests run yet. Click a test button above.</p>
                ) : (
                    <div className="space-y-1">
                        {testResults.map((result, index) => (
                            <div key={index} className="text-sm font-mono">
                                {result}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};