"use client";
import React from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    isLoading = false
}) => {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
            bgIcon: 'bg-red-100 dark:bg-red-900/30',
            button: 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
        },
        warning: {
            icon: <AlertTriangle className="h-6 w-6 text-orange-600" />,
            bgIcon: 'bg-orange-100 dark:bg-orange-900/30',
            button: 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/20'
        },
        info: {
            icon: <AlertTriangle className="h-6 w-6 text-indigo-600" />,
            bgIcon: 'bg-indigo-100 dark:bg-indigo-900/30',
            button: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
        }
    };

    const currentVariant = variantStyles[variant];

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white dark:bg-[#151C2C] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${currentVariant.bgIcon}`}>
                            {currentVariant.icon}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                    </div>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {message}
                    </p>

                    <div className="flex items-center justify-end gap-3 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex items-center gap-2 px-6 py-2 text-sm font-medium text-white ${currentVariant.button} rounded-lg shadow-lg transition-all disabled:opacity-50`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Processing...
                                </>
                            ) : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
