import { Check } from 'lucide-react';
import { STEPS } from '@/app/auth/signup/form-helpers';

type SignupProgressProps = {
  step: number;
};

export default function SignupProgress({ step }: SignupProgressProps) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-center">
        {STEPS.map((currentStep, index) => (
          <div key={currentStep.number} className={`flex items-center ${index < STEPS.length - 1 ? 'flex-1' : ''}`}>
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                step > currentStep.number
                  ? 'bg-amber-600 text-white'
                  : step === currentStep.number
                    ? 'bg-amber-600 text-white ring-4 ring-amber-100'
                    : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step > currentStep.number ? <Check className="h-5 w-5" strokeWidth={3} /> : currentStep.number}
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`mx-2 h-0.5 flex-1 transition-colors duration-300 ${
                  step > currentStep.number ? 'bg-amber-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 text-center">
        <p className="text-sm font-semibold text-amber-600">{STEPS[step - 1].title}</p>
        <p className="mt-0.5 text-xs text-gray-400">{STEPS[step - 1].description}</p>
      </div>
    </div>
  );
}
