import React from "react";
import { CheckCircleIcon } from "@/icons";

export interface Step {
  id: number;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
}

export default function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <div className="w-full py-6">
      {/* Desktop View */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isClickable = onStepClick && step.id <= currentStep; // Allow clicking on current or previous steps

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-1">
                <button
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={`
                    flex items-center justify-center w-12 h-12 rounded-full font-semibold text-sm transition-all duration-200
                    ${
                      isCompleted
                        ? "bg-brand-500 text-white"
                        : isCurrent
                        ? "bg-brand-500 text-white ring-4 ring-brand-100 dark:ring-brand-500/20"
                        : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
                    }
                    ${isClickable ? "cursor-pointer hover:scale-110" : "cursor-default"}
                  `}
                >
                  {isCompleted ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </button>
                <div className="mt-3 text-center">
                  <p
                    className={`text-sm font-medium ${
                      isCurrent || isCompleted
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex items-center justify-center" style={{ width: "100%", maxWidth: "120px" }}>
                  <div
                    className={`h-1 w-full transition-all duration-300 ${
                      currentStep > step.id
                        ? "bg-brand-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Step {currentStep} of {steps.length}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {Math.round((currentStep / steps.length) * 100)}% Complete
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 overflow-hidden">
          <div
            className="bg-brand-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
        <div className="mt-4">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {steps.find((s) => s.id === currentStep)?.title}
          </p>
          {steps.find((s) => s.id === currentStep)?.description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {steps.find((s) => s.id === currentStep)?.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
