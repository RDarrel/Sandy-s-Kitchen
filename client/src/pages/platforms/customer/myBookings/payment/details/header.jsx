import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Header = ({ booking, fallbackReference, onBack }) => {
  return (
    <div className="bg-background px-3 py-3 sm:px-4">
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-1 size-7 shrink-0 p-0 text-muted-foreground"
            onClick={onBack}
            aria-label="Back to my bookings"
          >
            <ArrowLeft className="size-4" />
          </Button>

          <h1 className="min-w-0 flex-1 truncate text-base font-semibold tracking-tight">
            Complete your payment
          </h1>

          <span className="max-w-[42%] shrink-0 truncate rounded-md border bg-muted/20 px-2 py-1 font-mono text-xs text-muted-foreground sm:max-w-none">
            #{booking?.reference || fallbackReference}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Header;
