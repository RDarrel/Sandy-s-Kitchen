import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

const Preview = ({
  isPreviewLoading = false,
  selectedImage,
  setSelectedImage = () => {},
  setIsPreviewLoading = () => {},
}) => {
  return (
    <Dialog
      open={!!selectedImage}
      onOpenChange={(open) => !open && setSelectedImage(null)}
    >
      <DialogContent className="[&_[data-slot=dialog-close]]:text-muted-foreground [&_[data-slot=dialog-close]]:hover:text-foreground [&_[data-slot=dialog-close]]:bg-background w-full border-none bg-transparent p-0 shadow-none sm:max-w-xl [&_[data-slot=dialog-close]]:-end-7 [&_[data-slot=dialog-close]]:-top-7 [&_[data-slot=dialog-close]]:size-7 [&_[data-slot=dialog-close]]:rounded-full">
        <DialogHeader className="sr-only">
          <DialogTitle>Image Preview</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center">
          {selectedImage && (
            <>
              {isPreviewLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Spinner className="size-8 text-white" />
                </div>
              )}
              <img
                src={selectedImage}
                alt="Preview"
                onLoad={() => setIsPreviewLoading(false)}
                className={cn(
                  "rounded-lg h-full w-auto object-contain transition-opacity duration-300",
                  isPreviewLoading ? "opacity-0" : "opacity-100",
                )}
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Preview;
