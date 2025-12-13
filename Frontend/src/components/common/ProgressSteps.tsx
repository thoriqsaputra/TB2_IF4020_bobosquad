import React from 'react';
import clsx from 'clsx';

interface ProgressStepsProps {
  steps: string[];
  activeIndex: number;
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({ steps, activeIndex }) => (
  <div className="flex flex-col gap-3">
    {steps.map((step, idx) => {
      const isActive = idx === activeIndex;
      const isDone = idx < activeIndex;
      return (
        <div
          key={step}
          className={clsx(
            'flex items-center gap-3 rounded-lg border px-3 py-2 text-sm',
            isActive && 'border-primary bg-blue-50 text-primary',
            isDone && 'border-green-200 bg-green-50 text-green-700',
          )}
        >
          <span
            className={clsx(
              'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
              isDone && 'bg-green-500 text-white',
              isActive && !isDone && 'bg-blue-500 text-white',
              !isActive && !isDone && 'bg-gray-200 text-gray-600',
            )}
          >
            {isDone ? '✓' : idx + 1}
          </span>
          <span>{step}</span>
        </div>
      );
    })}
  </div>
);
