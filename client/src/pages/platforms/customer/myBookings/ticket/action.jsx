import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Action = ({ action }) => {
  const Icon = action.icon;

  return (
    <div
      className={`mt-1.5 flex min-w-0 flex-col gap-1.5 rounded-md border px-2 py-1.5 sm:flex-row sm:items-center sm:justify-between ${
        action.variant === "payment"
          ? "border-amber-200 bg-amber-50/60"
          : action.variant === "success"
            ? "border-emerald-200 bg-emerald-50/50"
            : action.variant === "danger"
              ? "border-red-200 bg-red-50/50"
              : action.variant === "preparing"
                ? "border-violet-200 bg-violet-50/50"
                : "border-border bg-muted/10"
      }`}
    >
      <div className="flex min-w-0 items-start gap-1.5 sm:items-center">
        <Icon
          className={`mt-0.5 size-3 shrink-0 sm:mt-0 sm:size-3.5 ${
            action.variant === "payment"
              ? "text-amber-700"
              : action.variant === "success"
                ? "text-emerald-700"
                : action.variant === "danger"
                  ? "text-red-700"
                  : action.variant === "preparing"
                    ? "text-violet-700"
                    : "text-muted-foreground"
          }`}
        />

        <p
          className={`text-[11px] leading-4 sm:text-xs ${
            action.variant === "payment"
              ? "font-medium text-amber-800"
              : action.variant === "success"
                ? "font-medium text-emerald-800"
                : action.variant === "danger"
                  ? "font-medium text-red-700"
                  : action.variant === "preparing"
                    ? "font-medium text-violet-700"
                    : "text-muted-foreground"
          }`}
        >
          {action.message}
        </p>
      </div>

      {action.buttonLabel && (
        <Button
          type="button"
          size="sm"
          className="h-6 w-full shrink-0 gap-1 px-2 text-[9px] sm:w-auto sm:text-[10px]"
        >
          {action.buttonLabel}

          <ArrowRight className="size-3" />
        </Button>
      )}
    </div>
  );
};

export default Action;
