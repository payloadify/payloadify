import { toggleButtonClasses } from "@/components/ui/formClasses";
import { WalkthroughStep } from "@/lib/jwt/walkthroughSteps";

export function WalkthroughGuide({
  step,
  stepIndex,
  totalSteps,
  onNext,
  onBack,
  onClose,
}: {
  step: WalkthroughStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4">
      <div className="flex w-full max-w-2xl flex-col gap-2 rounded-lg border border-zinc-300 bg-white p-4 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
        <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Step {stepIndex + 1} of {totalSteps}
        </div>
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{step.title}</div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{step.body}</p>
        <div className="mt-1 flex items-center justify-between">
          <button type="button" onClick={onClose} className="text-xs text-zinc-500 underline hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200">
            Skip walkthrough
          </button>
          <div className="flex gap-2">
            <button type="button" disabled={isFirst} className={`${toggleButtonClasses(false)} disabled:opacity-30`} onClick={onBack}>
              Back
            </button>
            <button type="button" className={toggleButtonClasses(true)} onClick={isLast ? onClose : onNext}>
              {isLast ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
