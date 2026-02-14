interface ProgressBarProps {
  steps: string[];
  currentStep: number;
}

export default function ProgressBar({ steps, currentStep }: ProgressBarProps) {
  return (
    <div className="flex items-center w-full px-4 py-3">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            {/* 원형 스텝 표시 */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  flex h-8 w-8 items-center justify-center rounded-full
                  text-sm font-semibold transition-colors duration-200
                  ${
                    isCompleted
                      ? 'bg-blue-600 text-white'
                      : isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {isCompleted ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`
                  mt-1.5 text-xs whitespace-nowrap
                  ${isCurrent || isCompleted ? 'font-semibold text-blue-600' : 'text-gray-500'}
                `}
              >
                {step}
              </span>
            </div>

            {/* 연결선 */}
            {!isLast && (
              <div
                className={`
                  mx-1 h-0.5 flex-1
                  ${isCompleted ? 'bg-blue-600' : 'bg-gray-200'}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
