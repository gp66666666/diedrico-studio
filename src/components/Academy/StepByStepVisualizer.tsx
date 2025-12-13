
import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, RefreshCcw } from 'lucide-react';

interface Step {
    title: string;
    description: string;
    diagram: React.ReactNode;
}

interface StepByStepVisualizerProps {
    steps: Step[];
    title?: string;
}

export const StepByStepVisualizer: React.FC<StepByStepVisualizerProps> = ({ steps, title }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const nextStep = () => {
        if (currentStep < steps.length - 1) setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => {
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
    };

    const reset = () => setCurrentStep(0);

    return (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 shadow-sm break-inside-avoid">
            {title && (
                <div className="bg-white dark:bg-slate-950 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100">{title}</h4>
                    <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                        PASO {currentStep + 1} / {steps.length}
                    </span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Visual Area */}
                <div className="bg-white dark:bg-slate-950 p-6 flex items-center justify-center min-h-[300px] border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 relative">
                    <div className="w-full max-w-md transition-all duration-300">
                        {/* Render ONLY steps up to current step? Or Just current? 
                            Ideally, we want to accumulate drawings, but that depends on how "diagram" is defined.
                            If "diagram" is the WHOLE state at that step, we just render steps[currentStep].diagram.
                            Let's assume "diagram" is the full view for that step.
                        */}
                        {steps[currentStep].diagram}
                    </div>
                </div>

                {/* Controls & Description */}
                <div className="p-6 flex flex-col justify-between bg-slate-50 dark:bg-slate-900">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold shrink-0 shadow-lg shadow-blue-200 dark:shadow-none">
                                {currentStep + 1}
                            </span>
                            <h5 className="font-bold text-lg text-slate-900 dark:text-slate-100 leading-tight">
                                {steps[currentStep].title}
                            </h5>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-6">
                            {steps[currentStep].description}
                        </p>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${currentStep === 0
                                ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                                : 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm'
                                }`}
                        >
                            <ChevronLeft size={18} />
                            Anterior
                        </button>

                        <div className="flex gap-1.5">
                            {steps.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-2 h-2 rounded-full transition-all ${idx === currentStep ? 'bg-blue-600 w-4' : 'bg-slate-300 dark:bg-slate-700'
                                        }`}
                                />
                            ))}
                        </div>

                        {currentStep < steps.length - 1 ? (
                            <button
                                onClick={nextStep}
                                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:scale-105 active:scale-95"
                            >
                                Siguiente
                                <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={reset}
                                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 dark:shadow-none transition-all hover:scale-105 active:scale-95"
                            >
                                <RefreshCcw size={18} />
                                Repetir
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
