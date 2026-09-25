import { Button } from "@/components/ui/button";
import { CreditCard, Plus } from "lucide-react";

const Header = ({ openCreateModal }) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted/50">
          <CreditCard className="size-5 text-muted-foreground" />
        </div>

        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Payment Methods
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage the payment options available for customer bookings.
          </p>
        </div>
      </div>

      <Button
        type="button"
        size="sm"
        onClick={openCreateModal}
        className="h-9 gap-2 self-start sm:self-auto"
      >
        <Plus className="size-4" />
        Add Payment Method
      </Button>
    </div>
  );
};

export default Header;
