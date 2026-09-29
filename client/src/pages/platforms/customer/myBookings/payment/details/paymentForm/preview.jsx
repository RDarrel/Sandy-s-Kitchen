import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatFileSize } from ".";

const ReceiptPreviewDialog = ({ open, onOpenChange, src, file }) => {
  if (!file || !src) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:w-full">
        <DialogHeader className="shrink-0 border-b px-4 py-3 text-left">
          <DialogTitle className="text-sm font-semibold">
            Payment receipt
          </DialogTitle>

          <DialogDescription className="mt-1 flex min-w-0 items-center gap-1.5 text-xs">
            <span className="min-w-0 truncate">{file.name}</span>

            <span className="shrink-0">•</span>

            <span className="shrink-0">{formatFileSize(file.size)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-auto bg-muted/20 p-2 sm:p-3">
          <div className="flex min-h-[16rem] items-center justify-center rounded-md border bg-background p-2 sm:min-h-[28rem] sm:p-3">
            <img
              src={src}
              alt="Payment receipt preview"
              className="max-h-[calc(92dvh-7rem)] max-w-full rounded-sm object-contain"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptPreviewDialog;
