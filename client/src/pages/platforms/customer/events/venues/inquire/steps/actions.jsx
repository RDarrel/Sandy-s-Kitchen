import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
const Actions = ({ currentStep, totalSteps, onBack, onNext }) => {
  if (currentStep === totalSteps) {
    return (
      <div className="mt-4 flex items-center justify-start border-t pt-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1 px-2 text-xs"
          onClick={onBack}
        >
          <ChevronLeft className="size-3.5" />
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 flex items-center justify-between border-t pt-3">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 gap-1 px-2 text-xs"
        onClick={onBack}
        disabled={currentStep === 1}
      >
        <ChevronLeft className="size-3.5" />
        Back
      </Button>

      <Button
        type="button"
        size="sm"
        className="h-8 gap-1.5 px-3 text-xs"
        onClick={onNext}
      >
        Continue
        <ChevronRight className="size-3.5" />
      </Button>
    </div>
  );
};

export default Actions;
