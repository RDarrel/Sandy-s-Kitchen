import { useId, useState } from "react";
import { Content } from "@radix-ui/react-alert-dialog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDispatch, useSelector } from "react-redux";
import { REQUEST_ACCOUNT_CORRECTION } from "@/services/redux/slices/events/bookings";
import Spinner from "@/components/shared/spinner";

const QUICK_REASONS = [
  {
    label: "Incorrect Account Number",
    message: "Please check and provide the correct refund account number.",
  },
  {
    label: "Account Name Mismatch",
    message:
      "The account name does not match the provided account details. Please verify and update the account holder name.",
  },
  {
    label: "Incomplete Account Details",
    message:
      "Some refund account details are missing. Please provide the complete and correct account information.",
  },
  {
    label: "Unable to Receive Transfers",
    message:
      "The provided account cannot receive the refund transfer. Please update your details or provide another active account.",
  },
];

const RequestCorrection = ({ open, onOpenChange, booking, setBooking }) => {
  const { auth } = useSelector(({ auth }) => auth);
  const { formSubmitted } = useSelector(({ bookings }) => bookings);
  const dispatch = useDispatch();
  const [reason, setReason] = useState("");
  const id = useId();

  const changeOpen = (value) => {
    onOpenChange(value);

    if (!value) {
      setReason("");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(
      REQUEST_ACCOUNT_CORRECTION({
        _id: booking?._id,
        correction: {
          reason,
          date: new Date(),
          userId: auth?._id,
        },
      }),
    )
      .unwrap()
      .then(({ data }) => {
        setBooking((prev) => ({
          ...prev,
          cancellation: {
            ...prev?.cancellation,
            refund: {
              ...prev?.cancellation?.refund,
              accountCorrection: data.correction,
            },
          },
        }));
        onOpenChange();

        toast.success("Account correction request sent successfully.", {
          description:
            "The customer must update their refund account details before the refund can be processed.",
        });
      })
      .catch((error) => {
        console.log("error", error);
        toast.error("Failed to send the correction request.", {
          description: "Please try again.",
        });
      });
  };

  return (
    <AlertDialog open={open} onOpenChange={changeOpen}>
      <AlertDialogPortal>
        <AlertDialogOverlay className="z-[100] bg-black/60" />

        <Content className="fixed left-1/2 top-1/2 z-[110] max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-lg border border-border bg-background text-foreground shadow-xl outline-none">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="space-y-0.5 px-4 pt-3">
              <AlertDialogTitle className="text-lg font-semibold leading-7">
                Request Correction
              </AlertDialogTitle>

              <AlertDialogDescription className="text-xs leading-5">
                Specify which refund details the customer needs to update.
              </AlertDialogDescription>
            </div>

            {/* Content */}
            <div className="space-y-4 px-4 py-4">
              {/* Quick Reasons */}
              <fieldset className="space-y-2">
                <legend className="text-xs font-medium text-muted-foreground">
                  Quick Reasons
                </legend>

                <div className="flex flex-wrap gap-1.5">
                  {QUICK_REASONS.map((option) => {
                    const selected = reason === option.message;

                    return (
                      <Button
                        key={option.label}
                        type="button"
                        variant="outline"
                        size="sm"
                        aria-pressed={selected}
                        className={`h-auto min-h-7 whitespace-normal rounded-md px-2 py-1 text-left text-xs font-normal shadow-none ${
                          selected
                            ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                            : "bg-background text-muted-foreground"
                        }`}
                        onClick={() => setReason(option.message)}
                      >
                        {option.label}
                      </Button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Reason */}
              <div className="space-y-1.5">
                <Label htmlFor={`${id}-reason`} className="text-sm font-medium">
                  Reason for Correction{" "}
                  <span className="text-destructive">*</span>
                </Label>

                <Textarea
                  id={`${id}-reason`}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  required
                  maxLength={1000}
                  placeholder="Explain what needs to be corrected..."
                  className="min-h-28 resize-y bg-background text-sm leading-5 shadow-none md:text-sm"
                  aria-describedby={`${id}-help`}
                />

                <div
                  id={`${id}-help`}
                  className="flex items-start justify-between gap-3 text-xs leading-5 text-muted-foreground"
                >
                  <span>Choose a quick reason or write your own message.</span>

                  <span className="shrink-0 tabular-nums">
                    {reason.length}/1000
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-wrap justify-end gap-2 border-t px-4 py-3">
              <AlertDialogCancel asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-md bg-background text-sm shadow-none"
                >
                  Back
                </Button>
              </AlertDialogCancel>

              <Button
                type="submit"
                size="sm"
                className="rounded-md text-sm shadow-none"
                disabled={formSubmitted}
              >
                Send Correction Request{" "}
                <Spinner formSubmitted={formSubmitted} />
              </Button>
            </div>
          </form>
        </Content>
      </AlertDialogPortal>
    </AlertDialog>
  );
};

export default RequestCorrection;
