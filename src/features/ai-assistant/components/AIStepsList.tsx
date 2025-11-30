// AI Steps List Component
import type { AIStep } from '../types/ai.types';
import { Check, Loader2, AlertCircle, Circle } from 'lucide-react';

interface Props {
    steps: AIStep[];
    currentStep: number | null;
}

export default function AIStepsList({ steps, currentStep }: Props) {
    return (
        <div className="space-y-2">
            {steps.map((step) => {
                const isActive = step.stepNumber === currentStep;
                const isCompleted = step.status === 'completed';
                const isError = step.status === 'error';
                const isExecuting = step.status === 'executing';

                return (
                    <div
                        key={step.id}
                        className={`flex items-start gap-3 p-2 rounded-lg transition-all ${isActive
                                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                : isCompleted
                                    ? 'bg-green-50 dark:bg-green-900/20'
                                    : isError
                                        ? 'bg-red-50 dark:bg-red-900/20'
                                        : 'bg-gray-50 dark:bg-gray-700/50'
                            }`}
                    >
                        {/* Status Icon */}
                        <div className="flex-shrink-0 mt-1">
                            {isExecuting && (
                                <Loader2 size={18} className="text-blue-600 dark:text-blue-400 animate-spin" />
                            )}
                            {isCompleted && !isExecuting && (
                                <Check size={18} className="text-green-600 dark:text-green-400" />
                            )}
                            {isError && (
                                <AlertCircle size={18} className="text-red-600 dark:text-red-400" />
                            )}
                            {!isExecuting && !isCompleted && !isError && (
                                <Circle size={18} className="text-gray-400" />
                            )}
                        </div>

                        {/* Step Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span
                                    className="inline-block w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold"
                                    style={{ backgroundColor: step.color }}
                                >
                                    {step.stepNumber}
                                </span>
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    {step.description.length > 100
                                        ? step.description.substring(0, 100) + '...'
                                        : step.description}
                                </span>
                            </div>

                            {isError && step.error && (
                                <div className="mt-1 text-xs text-red-600 dark:text-red-400">
                                    Error: {step.error}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
