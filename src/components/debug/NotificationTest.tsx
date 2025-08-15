import React, { useState, useCallback } from 'react';
import { NotificationService } from '../../services/supabase/notificationService';

/**
 * Simple test component to verify notification system works
 * This will be removed after testing is complete
 */
export const NotificationTest: React.FC = () => {
    const [testResults, setTestResults] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const addResult = useCallback((message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        const resultMessage = `${timestamp}: ${message}`;
        console.log('Adding result:', resultMessage); // Debug log
        setTestResults(prev => {
            const newResults = [...prev, resultMessage];
            console.log('New results array:', newResults); // Debug log
            return newResults;
        });
    }, []);

    const runUserFetchingTest = useCallback(async () => {
        console.log('Starting user fetching test...'); // Debug log
        setIsLoading(true);
        addResult('🧪 Starting user fetching test...');

        try {
            // Add a small delay to ensure the "Starting" message is visible
            await new Promise(resolve => setTimeout(resolve, 200));

            console.log('Calling NotificationService.testUserFetching()...'); // Debug log
            const result = await NotificationService.testUserFetching();
            console.log('User fetching result:', result); // Debug log

            if (result.success) {
                addResult(`✅ User fetching test PASSED: ${result.userCount} client users found`);
                addResult(`📊 User fetching details: Found ${result.userCount} client users in database`);
            } else {
                addResult(`❌ User fetching test FAILED: ${result.error}`);
            }
        } catch (error) {
            console.error('User fetching test error:', error); // Debug log
            addResult(`❌ User fetching test ERROR: ${error instanceof Error ? error.message : String(error)}`);
        }

        setIsLoading(false);
    }, [addResult]);

    const runNotificationTest = useCallback(async () => {
        console.log('Starting notification test...'); // Debug log
        setIsLoading(true);
        addResult('🧪 Starting notification fetching test...');

        try {
            const result = await NotificationService.getUserNotifications(1, 5);
            console.log('Notification test result:', result); // Debug log
            addResult(`✅ Notification test PASSED: ${result.notifications.length} notifications, total: ${result.totalCount}`);

            // Log first notification for debugging
            if (result.notifications.length > 0) {
                const first = result.notifications[0];
                addResult(`📋 First notification: "${first.title}" (${first.type})`);
            }
        } catch (error) {
            console.error('Notification test error:', error); // Debug log
            addResult(`❌ Notification test FAILED: ${error}`);
        }

        setIsLoading(false);
    }, [addResult]);

    const clearResults = useCallback(() => {
        console.log('Clearing results...'); // Debug log
        setTestResults([]);
    }, []);

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

                <button
                    onClick={async () => {
                        setIsLoading(true);
                        addResult('🧪 Testing notification bell functionality...');
                        try {
                            // Test if we can create a test notification
                            await NotificationService.createGlobalNotification({
                                title: 'Test Notification',
                                message: 'This is a test notification created by the test system',
                                type: 'info'
                            });
                            addResult('✅ Test notification created successfully');
                            addResult('🔔 Check the notification bell in the top right corner');
                        } catch (error) {
                            addResult(`❌ Failed to create test notification: ${error}`);
                        }
                        setIsLoading(false);
                    }}
                    disabled={isLoading}
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
                >
                    Test Notification Bell
                </button>
            </div>

            {isLoading && (
                <div className="text-blue-600 mb-4">⏳ Running test...</div>
            )}

            <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
                <h3 className="font-semibold mb-2">Test Results: (Count: {testResults.length})</h3>
                {testResults.length === 0 ? (
                    <p className="text-gray-500">No tests run yet. Click a test button above.</p>
                ) : (
                    <div className="space-y-1">
                        {testResults.map((result, index) => (
                            <div key={index} className="text-sm font-mono bg-white p-2 rounded border">
                                {result}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Debug info */}
            <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <strong>Debug:</strong> Results array length: {testResults.length}, Loading: {isLoading ? 'true' : 'false'}
            </div>
        </div>
    );
};