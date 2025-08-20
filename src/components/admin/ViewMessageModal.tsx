"use client"

import { Button } from "../common/Button";

interface ViewMessageModalProps {
  message: string;
  onClose: () => void;
}

export default function ViewMessageModal({ message, onClose }: ViewMessageModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">Full Message</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap overflow-y-auto flex-grow">
          {message}
        </div>
        <div className="mt-6 flex justify-end flex-shrink-0">
          <Button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-6 py-2 rounded-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}