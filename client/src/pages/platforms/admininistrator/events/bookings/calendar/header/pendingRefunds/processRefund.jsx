import { useId, useRef, useState } from "react";
import { Content } from "@radix-ui/react-alert-dialog";
import { FileCheck2, ImageUp, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Formatter } from "@/services/utilities";
import Cloudinary from "@/services/utilities/cloudinary";
import { useDispatch, useSelector } from "react-redux";
import { UPLOAD } from "@/services/redux/slices/persons/auth";
import { PROCESS_REFUND } from "@/services/redux/slices/events/bookings";
import { toast } from "sonner";
import Spinner from "@/components/shared/spinner";

const ProcessRefund = ({
  open,
  onOpenChange,
  booking,
  methodName,
  goToList,
}) => {
  const { auth } = useSelector(({ auth }) => auth);
  const [isLoading, setIsLoading] = useState(false);
  const [reference, setReference] = useState("");
  const [proof, setProof] = useState(null);
  const [fileError, setFileError] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const dispatch = useDispatch();
  const refund = booking?.cancellation?.refund ?? {};
  const id = useId();
  const fileInput = useRef(null);
  const close = () => {
    onOpenChange(false);
    setReviewing(false);
  };

  const selectProof = (event) => {
    const file = event.target.files?.[0];
    setFileError("");
    setProof(null);
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setFileError("Choose a JPG or PNG file.");
      event.target.value = "";
      return;
    }
    setProof(file);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Failed to read image."));

      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const base64 = await fileToBase64(proof);

      const proofForm = Cloudinary.buildFileForm(
        base64,
        "refunds",
        booking?._id,
        { bookingId: booking?._id },
      );

      // Step 1: Upload refund proof
      try {
        await dispatch(UPLOAD({ data: proofForm })).unwrap();
      } catch (error) {
        console.log("error", error);

        toast.error("Failed to upload refund proof. Please try again.");
        return;
      }

      // Step 2: Process refund
      try {
        await dispatch(
          PROCESS_REFUND({
            _id: booking?._id,
            process: {
              refundedAt: new Date(),
              processedBy: auth?._id,
              reference,
              amount: refund?.amount,
            },
          }),
        ).unwrap();

        toast.success("Refund recorded successfully.");
      } catch (error) {
        console.log("error", error);

        toast.error(
          "Refund proof uploaded, but the refund could not be recorded. Please check the refund status before retrying.",
        );
      }
    } catch (error) {
      console.log("error", error);
      toast.error(
        "Something went wrong while processing the refund. Please try again.",
      );
    } finally {
      setIsLoading(false);
      goToList();
    }
  };
  return (
    <AlertDialog
      open={open}
      onOpenChange={(value) => {
        if (!value) close();
      }}
    >
      <AlertDialogPortal>
        <AlertDialogOverlay className="z-[100] bg-black/60" />
        <Content className="fixed left-1/2 top-1/2 z-[110] max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-lg border border-border bg-background text-foreground shadow-xl outline-none">
          <form onSubmit={handleSubmit}>
            <div className="space-y-0.5 px-3 pt-3 sm:px-4">
              <div className="flex items-center justify-between gap-3">
                <AlertDialogTitle className="text-lg font-semibold leading-7">
                  {reviewing ? "Review Refund" : "Process Refund"}
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-xs leading-5">
                {reviewing
                  ? "Review the refund proof and reference before confirming."
                  : "Transfer the refund, then upload proof of payment."}
              </AlertDialogDescription>
            </div>

            <div className="space-y-4 px-3 py-3 sm:px-4">
              <dl className="space-y-2 px-2">
                <div className="mb-3 space-y-1 border-b pb-3">
                  <dt className="text-xs font-medium uppercase text-muted-foreground">
                    Refund Amount
                  </dt>
                  <dd className="text-xl font-semibold tracking-tight text-foreground tabular-nums">
                    {Formatter.amount(refund.amount ?? 0)}
                  </dd>
                </div>
                <Row
                  label="Booking"
                  value={booking?.reference || "Not available"}
                />
                <Row
                  label="Refund Method"
                  value={methodName || "Not available"}
                />
                <Row
                  label="Account Name"
                  value={refund.accountName || "Not available"}
                />
                <Row
                  label="Account Number"
                  value={refund.accountNumber || "Not available"}
                />
              </dl>

              <div className="space-y-2.5">
                {reviewing ? (
                  <dl className="space-y-3 rounded-lg border p-3">
                    {reference.trim() && (
                      <Row
                        label="Transaction Reference"
                        value={reference.trim()}
                      />
                    )}
                    <Row label="Proof of Refund" value={proof?.name} />
                  </dl>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={`${id}-proof`}
                        className="text-xs font-medium"
                      >
                        Proof of Refund{" "}
                        <span className="text-muted-foreground">*</span>
                      </Label>
                      <div className="relative">
                        <input
                          ref={fileInput}
                          id={`${id}-proof`}
                          type="file"
                          accept="image/jpeg,image/png"
                          className="peer sr-only"
                          onChange={selectProof}
                          required={!proof}
                          aria-invalid={Boolean(fileError)}
                          aria-describedby={
                            fileError ? `${id}-error` : `${id}-proof-help`
                          }
                        />
                        <label
                          htmlFor={`${id}-proof`}
                          className={`flex cursor-pointer items-center gap-2.5 rounded-md border bg-background px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-primary/5 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-ring ${proof ? "min-h-12 pr-10" : "min-h-16"}`}
                        >
                          {proof ? (
                            <FileCheck2
                              aria-hidden="true"
                              className="size-4 shrink-0 text-primary"
                            />
                          ) : (
                            <ImageUp
                              aria-hidden="true"
                              className="size-4 shrink-0 text-muted-foreground"
                            />
                          )}
                          <span className="min-w-0">
                            <span className="block break-all text-xs font-medium leading-4">
                              {proof ? proof.name : "Upload Proof of Refund"}
                            </span>
                            {!proof && (
                              <span className="block text-[11px] leading-4 text-muted-foreground">
                                JPG or PNG
                              </span>
                            )}
                          </span>
                        </label>
                        {proof && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="absolute right-1 top-1 size-7"
                            aria-label="Remove receipt"
                            onClick={() => {
                              setProof(null);
                              if (fileInput.current)
                                fileInput.current.value = "";
                            }}
                          >
                            <X className="size-3.5" />
                          </Button>
                        )}
                      </div>
                      <p
                        id={`${id}-proof-help`}
                        className="text-xs leading-5 text-muted-foreground"
                      >
                        Upload clear evidence of the completed refund.
                      </p>
                      {fileError && (
                        <p
                          id={`${id}-error`}
                          role="alert"
                          className="text-xs text-destructive"
                        >
                          {fileError}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={`${id}-reference`}
                        className="text-xs font-medium"
                      >
                        Transaction Reference{" "}
                        <span className="text-muted-foreground">
                          (Optional)
                        </span>
                      </Label>
                      <Input
                        id={`${id}-reference`}
                        value={reference}
                        onChange={(event) => setReference(event.target.value)}
                        maxLength={150}
                        placeholder="Enter reference number, if available"
                        className="h-8 rounded-full bg-background text-xs shadow-none md:text-xs"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mx-3 border-t py-3 sm:mx-4">
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-md bg-background text-sm shadow-none"
                  onClick={() => (reviewing ? setReviewing(false) : close())}
                  disabled={isLoading}
                >
                  Back
                </Button>
                {reviewing ? (
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-md text-sm shadow-none"
                    disabled
                  >
                    Confirm Refund
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="sm"
                    className="rounded-md text-sm shadow-none"
                    disabled={isLoading}
                  >
                    Review &amp; Confirm <Spinner formSubmitted={isLoading} />
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Content>
      </AlertDialogPortal>
    </AlertDialog>
  );
};

const Row = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 text-xs leading-5">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="max-w-[65%] break-words text-right font-medium">{value}</dd>
  </div>
);

export default ProcessRefund;
