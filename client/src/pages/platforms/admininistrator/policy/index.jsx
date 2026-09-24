import { createElement, useEffect, useState } from "react";

import {
  CalendarClock,
  Clock3,
  CreditCard,
  Save,
  Settings2,
  ShieldCheck,
  Undo2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useDispatch, useSelector } from "react-redux";
import { BROWSE, UPDATE } from "@/services/redux/slices/events/bookingPolicy";
import { toast } from "sonner";

const Policy = () => {
  const { policy: savedPolicy, isLoading, formSubmitted } = useSelector(
    ({ bookingPolicy }) => bookingPolicy,
  );
  const [policy, setPolicy] = useState({});
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(BROWSE());
  }, [dispatch]);

  useEffect(() => {
    setPolicy(savedPolicy || {});
  }, [savedPolicy]);

  const hasChanges = JSON.stringify(policy) !== JSON.stringify(savedPolicy || {});
  const isBusy = isLoading || formSubmitted;

  const handleChange = (field, value) => {
    setPolicy((prev) => ({
      ...prev,
      [field]: value === "" ? "" : Number(value),
    }));
  };

  const handleDiscard = () => {
    setPolicy({ ...savedPolicy });
  };

  const handleSave = () => {
    dispatch(UPDATE({ data: policy }))
      .unwrap()
      .then((payload) => toast.success(payload?.success))
      .catch((error) => toast.error(error?.message || error));
  };

  return (
    <div className="bg-background p-3 md:p-5">
      <div className="mx-auto w-full max-w-4xl">
        <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
          {/* Header */}
          <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                <Settings2 className="size-4 text-muted-foreground" />
              </div>

              <div className="min-w-0">
                <h1 className="text-base font-semibold tracking-tight text-foreground">
                  Booking Policy
                </h1>

                <p className="text-xs text-muted-foreground">
                  Set the rules for booking confirmation, reservation holds,
                  cancellations, and payment due dates.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-28" />
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!hasChanges || isBusy}
                    onClick={handleDiscard}
                    className="h-8 gap-1.5 px-3 text-xs"
                  >
                    <Undo2 className="size-3.5" />
                    Discard
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    disabled={!hasChanges || isBusy}
                    onClick={handleSave}
                    className="h-8 gap-1.5 px-3 text-xs"
                  >
                    {formSubmitted ? (
                      <Spinner className="size-3.5" />
                    ) : (
                      <Save className="size-3.5" />
                    )}
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Policies */}
          {isLoading ? (
            <PolicySkeleton />
          ) : (
            <div className="divide-y">
              <PolicyRow
                icon={CreditCard}
                title="Required Down Payment"
                description="Percentage of the booking total the customer must pay to confirm the reservation."
              >
                <FieldWithSuffix
                  id="depositPercent"
                  value={policy.depositPercent}
                  suffix="%"
                  min={1}
                  max={100}
                  disabled={isBusy}
                  onChange={(value) => handleChange("depositPercent", value)}
                />
              </PolicyRow>

              <PolicyRow
                icon={Clock3}
                title="Reservation Hold Period"
                description="How long an approved booking is held while waiting for the required down payment."
              >
                <FieldWithSuffix
                  id="reservationHoldHours"
                  value={policy.reservationHoldHours}
                  suffix="hours"
                  min={1}
                  disabled={isBusy}
                  onChange={(value) =>
                    handleChange("reservationHoldHours", value)
                  }
                />
              </PolicyRow>

              <PolicyRow
                icon={CalendarClock}
                title="Cancellation Cutoff"
                description="Customers cannot cancel once the event is within this number of days."
              >
                <FieldWithSuffix
                  id="cancellationDeadlineDays"
                  value={policy.cancellationDeadlineDays}
                  suffix="days"
                  min={0}
                  disabled={isBusy}
                  onChange={(value) =>
                    handleChange("cancellationDeadlineDays", value)
                  }
                />
              </PolicyRow>

              <PolicyRow
                icon={ShieldCheck}
                title="Remaining Balance Due"
                description="Number of days before the event when the remaining balance is expected to be paid."
              >
                <FieldWithSuffix
                  id="balanceDueDaysBeforeEvent"
                  value={policy.balanceDueDaysBeforeEvent}
                  suffix="days"
                  min={0}
                  disabled={isBusy}
                  onChange={(value) =>
                    handleChange("balanceDueDaysBeforeEvent", value)
                  }
                />
              </PolicyRow>
            </div>
          )}

          {/* Footer */}
          <div className="border-t bg-muted/20 px-4 py-2.5">
            <p className="text-[11px] leading-4 text-muted-foreground">
              Policy changes apply to newly approved bookings only. Existing
              approved bookings keep their original terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PolicySkeleton = () => {
  return (
    <div className="divide-y">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          className="grid gap-3 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_140px] sm:items-center"
          key={index}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <Skeleton className="size-7 shrink-0 rounded-md" />

            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-4 w-44 max-w-full" />
              <Skeleton className="h-3 w-full max-w-[28rem]" />
            </div>
          </div>

          <div className="flex justify-start sm:justify-end">
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
};

const PolicyRow = ({ icon, title, description, children }) => {
  return (
    <div className="grid gap-3 px-4 py-3 transition-colors hover:bg-muted/20 sm:grid-cols-[minmax(0,1fr)_140px] sm:items-center">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-background">
          {createElement(icon, {
            className: "size-3.5 text-muted-foreground",
          })}
        </div>

        <div className="min-w-0">
          <Label className="text-sm font-medium leading-none text-foreground">
            {title}
          </Label>

          <p className="mt-1 text-xs leading-4 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="flex justify-start sm:justify-end">{children}</div>
    </div>
  );
};

const FieldWithSuffix = ({
  id,
  value,
  suffix,
  min = 0,
  max,
  disabled = false,
  onChange,
}) => {
  return (
    <div className="relative w-32">
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 pr-14 text-right text-sm font-medium"
      />

      <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[11px] text-muted-foreground">
        {suffix}
      </span>
    </div>
  );
};

export default Policy;
