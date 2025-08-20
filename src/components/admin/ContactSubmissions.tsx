import React, { useState, useEffect } from 'react';
import * as ContactSubmissionsModule from '../../services/supabase/contactSubmissions';
import { LoadingSpinner, Button } from '../common';
import ViewMessageModal from './ViewMessageModal';
import { GenericDeleteConfirmationModal } from './GenericDeleteConfirmationModal';

export const ContactSubmissions: React.FC = () => {
    const [submissions, setSubmissions] = useState<ContactSubmissionsModule.ContactSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
    const [submissionToDelete, setSubmissionToDelete] = useState<ContactSubmissionsModule.ContactSubmission | null>(null);

    const fetchSubmissions = async () => {
        try {
            const data = await ContactSubmissionsModule.ContactSubmissionsService.getSubmissions();
            setSubmissions(data);
        } catch (error) {
            setError('Failed to fetch contact submissions.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const handleDelete = async () => {
        if (!submissionToDelete) return;

        try {
            await ContactSubmissionsModule.ContactSubmissionsService.deleteSubmission(submissionToDelete.id!);
            setSubmissions(submissions.filter(s => s.id !== submissionToDelete.id));
            setSubmissionToDelete(null);
        } catch (error) {
            setError('Failed to delete contact submission.');
            console.error(error);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Contact Form Submissions</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b text-left">Date</th>
                            <th className="py-2 px-4 border-b text-left">Name</th>
                            <th className="py-2 px-4 border-b text-left">Email</th>
                            <th className="py-2 px-4 border-b text-left">Message</th>
                            <th className="py-2 px-4 border-b text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {submissions.map((submission) => (
                            <tr key={submission.id}>
                                <td className="py-2 px-4 border-b text-left">{new Date(submission.created_at!).toLocaleString()}</td>
                                <td className="py-2 px-4 border-b text-left">{submission.name}</td>
                                <td className="py-2 px-4 border-b text-left">{submission.email}</td>
                                <td className="py-2 px-4 border-b text-left truncate max-w-xs">{submission.message}</td>
                                <td className="py-2 px-4 border-b text-left">
                                    <div className="flex space-x-2">
                                        <Button size="sm" variant="outline" onClick={() => setSelectedMessage(submission.message)}>View</Button>
                                        <Button size="sm" className="bg-red-600 text-white hover:bg-red-700" onClick={() => setSubmissionToDelete(submission)}>Delete</Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {selectedMessage && (
                <ViewMessageModal message={selectedMessage} onClose={() => setSelectedMessage(null)} />
            )}
            {submissionToDelete && (
                <GenericDeleteConfirmationModal
                    isOpen={!!submissionToDelete}
                    onClose={() => setSubmissionToDelete(null)}
                    onConfirm={handleDelete}
                    itemName={submissionToDelete.name}
                    itemType="submission"
                />
            )}
        </div>
    );
};