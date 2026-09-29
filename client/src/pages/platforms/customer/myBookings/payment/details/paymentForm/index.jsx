import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Eye, ImagePlus, Trash2, Upload } from "lucide-react";
import { Formatter } from "@/services/utilities";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import InlineWarning from "./inlineWarning";
import SectionHeader from "../../sectionHeader";
import FormField from "./formField";
import ReceiptPreviewDialog from "./preview";

export const formatFileSize = (bytes) => {
  if (!bytes) return "0 KB";

  const kilobytes = bytes / 1024;

  if (kilobytes < 1024) {
    return `${Math.max(1, Math.round(kilobytes))} KB`;
  }

  return `${(kilobytes / 1024).toFixed(1)} MB`;
};

const PaymentForm = ({
  amountPaid,
  setAmountPaid,
  payment,
  method,
  paidAmount,
  invalidAmount,
  belowDeposit,
  exceedsBalance,
}) => {
  const receiptInputRef = useRef(null);

  const [receipt, setReceipt] = useState(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState("");
  const [isReceiptPreviewOpen, setIsReceiptPreviewOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (receiptPreviewUrl) {
        URL.revokeObjectURL(receiptPreviewUrl);
      }
    };
  }, [receiptPreviewUrl]);

  const handleReceiptChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image receipt.");
      event.target.value = "";
      return;
    }

    if (receiptPreviewUrl) {
      URL.revokeObjectURL(receiptPreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);

    setReceipt(file);
    setReceiptPreviewUrl(previewUrl);
  };

  const handleRemoveReceipt = () => {
    if (receiptPreviewUrl) {
      URL.revokeObjectURL(receiptPreviewUrl);
    }

    setReceipt(null);
    setReceiptPreviewUrl("");
    setIsReceiptPreviewOpen(false);

    if (receiptInputRef.current) {
      receiptInputRef.current.value = "";
    }
  };

  const handleReplaceReceipt = () => {
    receiptInputRef.current?.click();
  };

  return (
    <>
      <div>
        <SectionHeader
          title="Payment information"
          description="Enter the details of the payment you sent."
        />

        <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
          <FormField label="Amount sent">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground">
                ₱
              </span>

              <Input
                type="number"
                min="1"
                max={payment.balance || undefined}
                value={amountPaid}
                onChange={({ target }) => setAmountPaid(target.value)}
                className={`h-9 pl-6 text-[13px] font-semibold ${
                  invalidAmount ? "border-destructive" : ""
                }`}
              />
            </div>
          </FormField>

          <FormField label="Transaction reference">
            <Input
              placeholder="Enter reference number or transaction ID"
              className="h-9 text-[13px]"
            />
          </FormField>
        </div>

        {belowDeposit && (
          <InlineWarning
            message={`Minimum down payment is ${Formatter.amount(
              payment.requiredDeposit,
            )}.`}
          />
        )}

        {exceedsBalance && (
          <InlineWarning
            message={`Amount cannot exceed your balance of ${Formatter.amount(
              payment.balance,
            )}.`}
          />
        )}

        <div className="mt-2.5">
          <FormField label="Proof of payment">
            {!receipt ? (
              <label className="flex h-14 cursor-pointer items-center gap-2.5 rounded-md border border-dashed bg-muted/10 px-3 transition hover:border-primary/30 hover:bg-muted/20">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
                  <ImagePlus className="size-3.5 text-muted-foreground" />
                </span>

                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium">
                    Upload receipt or screenshot
                  </p>

                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or WEBP
                  </p>
                </div>

                <span className="ml-auto shrink-0 text-xs font-medium text-primary">
                  Browse
                </span>

                <input
                  ref={receiptInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={handleReceiptChange}
                />
              </label>
            ) : (
              <div className="flex min-h-14 items-center gap-2.5 rounded-md border bg-background px-2.5 py-2">
                {/* Receipt thumbnail */}
                <button
                  type="button"
                  onClick={() => setIsReceiptPreviewOpen(true)}
                  className="size-10 shrink-0 overflow-hidden rounded-md border bg-muted transition hover:opacity-80"
                  title="View receipt"
                  aria-label="View uploaded receipt"
                >
                  <img
                    src={receiptPreviewUrl}
                    alt="Uploaded payment receipt"
                    className="h-full w-full object-cover"
                  />
                </button>

                {/* File information */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">
                    {receipt.name}
                  </p>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatFileSize(receipt.size)}
                  </p>
                </div>

                {/* Receipt actions */}
                <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsReceiptPreviewOpen(true)}
                    className="h-7 gap-1 px-2 text-xs"
                    title="View receipt"
                  >
                    <Eye className="size-3" />

                    <span className="hidden sm:inline">View</span>
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleReplaceReceipt}
                    className="h-7 gap-1 px-2 text-xs"
                    title="Replace receipt"
                  >
                    <Upload className="size-3" />
                    <span className="hidden sm:inline">Replace</span>
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveReceipt}
                    className="h-7 gap-1 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                    title="Remove receipt"
                    aria-label="Remove receipt"
                  >
                    <Trash2 className="size-3" />

                    <span className="hidden sm:inline">Remove</span>
                  </Button>
                </div>

                <input
                  ref={receiptInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={handleReceiptChange}
                />
              </div>
            )}
          </FormField>
        </div>

        <div className="mt-2.5">
          <FormField label="Notes (optional)">
            <Textarea
              placeholder="Add a note if needed"
              className="min-h-12 resize-none text-[13px]"
            />
          </FormField>
        </div>

        {/* Mobile submit */}
        <div className="mt-3 border-t pt-3 lg:hidden">
          <Button
            className="h-9 w-full gap-1.5 text-[13px]"
            disabled={!method || invalidAmount}
          >
            <CheckCircle2 className="size-3.5" />
            Submit payment · {Formatter.amount(paidAmount)}
          </Button>

          <p className="mt-1.5 text-center text-xs leading-5 text-muted-foreground">
            Your payment will be reviewed before your booking is updated.
          </p>
        </div>
      </div>

      <ReceiptPreviewDialog
        open={isReceiptPreviewOpen}
        onOpenChange={setIsReceiptPreviewOpen}
        src={receiptPreviewUrl}
        file={receipt}
      />
    </>
  );
};

export default PaymentForm;
