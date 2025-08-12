import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';
import { staggerContainer, fadeInUp } from '../../../utils/motion';
import type { OnboardingData } from '../OnboardingFlow';
import {
    PlusIcon,
    XMarkIcon,
    GlobeAltIcon,
    EyeIcon
} from '@heroicons/react/24/outline';

export interface InspirationStepProps {
    data: OnboardingData;
    onNext: (data: Partial<OnboardingData>) => void;
    onBack?: () => void;
    isLoading: boolean;
}

interface WebsiteInspiration {
    url: string;
    description: string;
    whatYouLike: string;
}

export const InspirationStep: React.FC<InspirationStepProps> = ({
    data,
    onNext,
    onBack,
    isLoading,
}) => {
    const [inspirations, setInspirations] = useState<WebsiteInspiration[]>(
        data.websiteInspiration || [
            { url: '', description: '', whatYouLike: '' }, // Required
            { url: '', description: '', whatYouLike: '' }, // Optional
            { url: '', description: '', whatYouLike: '' }  // Optional
        ]
    );

    const updateInspiration = (index: number, field: keyof WebsiteInspiration, value: string) => {
        const updated = [...inspirations];
        updated[index] = { ...updated[index], [field]: value };
        setInspirations(updated);
    };

    const addInspiration = () => {
        if (inspirations.length < 5) {
            setInspirations([...inspirations, { url: '', description: '', whatYouLike: '' }]);
        }
    };

    const removeInspiration = (index: number) => {
        // Don't allow removing the first website (required)
        if (inspirations.length > 1 && index > 0) {
            setInspirations(inspirations.filter((_, i) => i !== index));
        }
    };

    const handleNext = () => {
        // Filter out empty inspirations
        const validInspirations = inspirations.filter(
            inspiration => inspiration.url.trim() !== ''
        );

        onNext({
            websiteInspiration: validInspirations
        });
    };

    const isValidUrl = (url: string) => {
        if (!url.trim()) return true; // Empty is okay
        try {
            new URL(url.startsWith('http') ? url : `https://${url}`);
            return true;
        } catch {
            return false;
        }
    };

    const hasValidData = inspirations.length > 0 &&
        inspirations[0].url.trim() !== '' &&
        isValidUrl(inspirations[0].url);

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <EyeIcon className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-3xl font-bold text-secondary-900 mb-3">
                    Website Inspiration
                </h2>
                <p className="text-secondary-600 text-lg max-w-2xl mx-auto">
                    Share at least 1 website you admire (up to 5 total). This helps us understand your design preferences and create something you'll love.
                </p>
            </motion.div>

            {/* Inspiration Cards */}
            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-6"
            >
                {inspirations.map((inspiration, index) => (
                    <motion.div key={index} variants={fadeInUp}>
                        <Card className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-lg font-semibold text-secondary-900">
                                    Website {index + 1}
                                    {index === 0 && <span className="text-red-500 ml-1">*</span>}
                                    {index > 0 && <span className="text-gray-400 ml-1 text-sm">(Optional)</span>}
                                </h3>
                                {inspirations.length > 3 && index >= 3 && (
                                    <button
                                        onClick={() => removeInspiration(index)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                        title="Remove this website"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                {/* Website URL */}
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                                        Website URL {index === 0 && <span className="text-red-500">*</span>}
                                    </label>
                                    <div className="relative">
                                        <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                                        <input
                                            type="text"
                                            value={inspiration.url}
                                            onChange={(e) => updateInspiration(index, 'url', e.target.value)}
                                            placeholder={index === 0 ? "https://example.com (required)" : "https://example.com (optional)"}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${inspiration.url && !isValidUrl(inspiration.url)
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-secondary-300'
                                                }`}
                                        />
                                    </div>
                                    {inspiration.url && !isValidUrl(inspiration.url) && (
                                        <p className="text-red-500 text-sm mt-1">Please enter a valid URL</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                                        Brief Description (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={inspiration.description}
                                        onChange={(e) => updateInspiration(index, 'description', e.target.value)}
                                        placeholder="e.g., Modern tech company, Creative agency, E-commerce store"
                                        className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                    />
                                </div>

                                {/* What You Like */}
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                                        What do you like about this website? (Optional)
                                    </label>
                                    <textarea
                                        value={inspiration.whatYouLike}
                                        onChange={(e) => updateInspiration(index, 'whatYouLike', e.target.value)}
                                        placeholder="e.g., Clean design, Great colors, Easy navigation, Professional look"
                                        rows={3}
                                        className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
                                    />
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}

                {/* Add More Button */}
                {inspirations.length < 5 && (
                    <motion.div variants={fadeInUp}>
                        <button
                            onClick={addInspiration}
                            className="w-full p-6 border-2 border-dashed border-secondary-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors group"
                        >
                            <div className="flex items-center justify-center space-x-2 text-secondary-600 group-hover:text-primary-600">
                                <PlusIcon className="w-5 h-5" />
                                <span>Add Another Website (Optional)</span>
                            </div>
                        </button>
                    </motion.div>
                )}
            </motion.div>

            {/* Helper Text */}
            <motion.div
                variants={fadeInUp}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
                <h4 className="font-medium text-blue-900 mb-2">💡 Tips for choosing inspiration websites:</h4>
                <ul className="text-blue-800 text-sm space-y-1">
                    <li>• <strong>First website is required</strong> - choose your best inspiration</li>
                    <li>• Additional websites are optional but help us understand your style better</li>
                    <li>• Look for websites in your industry or similar businesses</li>
                    <li>• Focus on design elements you find appealing (colors, layout, fonts)</li>
                    <li>• Don't worry about finding perfect matches - we'll adapt ideas to fit your needs</li>
                </ul>
            </motion.div>

            {/* Navigation */}
            <motion.div
                variants={fadeInUp}
                className="flex justify-between pt-6"
            >
                {onBack && (
                    <Button
                        variant="outline"
                        onClick={onBack}
                        disabled={isLoading}
                    >
                        Back
                    </Button>
                )}
                <Button
                    onClick={handleNext}
                    disabled={isLoading || !hasValidData}
                    className="ml-auto"
                >
                    {isLoading ? 'Processing...' : 'Continue'}
                </Button>
            </motion.div>
        </div>
    );
};