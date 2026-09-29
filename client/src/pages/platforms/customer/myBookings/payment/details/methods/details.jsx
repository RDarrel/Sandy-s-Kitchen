import { Banknote, Copy, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { TYPE_META } from "../../constant";
import SectionHeader from "../../sectionHeader";
import Cloudinary from "@/services/utilities/cloudinary";

const MethodDetails = ({ method }) => {
  const isCash = method.type === "cash";

  const qrUrl = method.qrImgId
    ? Cloudinary.getPaymentMethodImg(method.qrImgId, method._id, "qr")
    : "";

  const handleDownloadQR = async () => {
    if (!qrUrl) return;

    try {
      const response = await fetch(qrUrl);

      if (!response.ok) {
        throw new Error("Failed to download QR code.");
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = `${method.name}-qr-code.png`;

      document.body.appendChild(link);

      link.click();

      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("QR DOWNLOAD ERROR:", error);
      toast.error("Unable to download QR code.");
    }
  };

  return (
    <div>
      <SectionHeader
        title="Payment details"
        description={
          isCash
            ? "Complete your payment directly at Sandy's Kitchenette."
            : "Scan or click the QR code to download it, or use the account details below."
        }
      />

      <div className="mt-2.5 overflow-hidden rounded-md border border-border/70 bg-muted/5">
        {isCash ? (
          <div className="flex items-start gap-2.5 px-2.5 py-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background">
              <Banknote className="size-4 text-muted-foreground" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="rounded-md border border-border/70 bg-background px-2">
                <CompactDetail label="Method" value={method.name} />
                <CompactDetail label="Type" value="Cash payment" />
              </div>

              {method.instructions && (
                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                  {method.instructions}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="grid items-start justify-items-center gap-2 px-2.5 py-2 sm:grid-cols-[7.25rem_minmax(0,1fr)] sm:justify-items-stretch">
            {qrUrl ? (
              <button
                type="button"
                onClick={handleDownloadQR}
                className="flex aspect-square w-full max-w-[8rem] cursor-pointer items-center justify-center overflow-hidden rounded-md border border-border/70 bg-background p-1.5 transition hover:border-primary/30 sm:min-h-[7.25rem] sm:w-[7.25rem]"
                title="Download QR code"
                aria-label={`Download ${method.name} QR code`}
              >
                <img
                  src={qrUrl}
                  alt={`${method.name} QR code`}
                  className="h-full w-full object-contain"
                />
              </button>
            ) : (
              <div className="flex aspect-square w-full max-w-[8rem] flex-col items-center justify-center rounded-md border border-dashed border-border/70 bg-background text-muted-foreground sm:min-h-[7.25rem] sm:w-[7.25rem]">
                <CreditCard className="size-4" />

                <span className="mt-1 text-xs font-medium">No QR</span>
              </div>
            )}

            <div className="grid min-h-[7.25rem] w-full min-w-0 rounded-md border border-border/70 bg-background px-2">
              <CompactDetail label="Method" value={method.name} />

              <CompactDetail
                label="Type"
                value={TYPE_META[method.type]?.label || "Payment method"}
              />

              {method.accountName && (
                <CompactDetail
                  label="Account name"
                  value={method.accountName}
                />
              )}

              {method.accountNumber && (
                <CompactDetail
                  label="Account number"
                  value={method.accountNumber}
                  copyable
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MethodDetails;

const CompactDetail = ({ label, value, copyable = false }) => {
  const handleCopy = async () => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(String(value));

      toast.success(`${label} copied.`);
    } catch (error) {
      console.error("COPY ERROR:", error);

      toast.error("Unable to copy. Please copy it manually.");
    }
  };

  return (
    <div className="flex min-h-0 items-center justify-between gap-3 border-b last:border-b-0">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>

      <span className="flex min-w-0 items-center justify-end gap-1.5">
        {copyable && value && (
          <button
            type="button"
            onClick={handleCopy}
            className="mr-1 flex size-5 shrink-0 items-center justify-center rounded border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
            title={`Copy ${label.toLowerCase()}`}
          >
            <Copy className="size-3" />
          </button>
        )}

        <span className="break-all text-right text-[13px] font-semibold">
          {value || "-"}
        </span>
      </span>
    </div>
  );
};
