import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImageIcon, XIcon, ZoomInIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
const Files = ({
  files = [],
  loadingImages,
  setSelectedImage = () => {},
  setLoadingImages = () => {},
  setIsPreviewLoading = () => {},
  removeFile = () => {},
}) => {
  return (
    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {files.map((src, idx) => (
        <div
          key={`venue-img${idx}`}
          className="group/item relative aspect-square"
        >
          {src ? (
            <>
              {loadingImages[idx] !== false && (
                <div className="bg-muted/50 rounded-lg absolute inset-0 flex items-center justify-center border">
                  <Spinner className="text-muted-foreground size-6" />
                </div>
              )}
              <img
                src={src}
                alt={`no-img-found${idx}`}
                onLoad={() =>
                  setLoadingImages((prev) => ({
                    ...prev,
                    [idx]: false,
                  }))
                }
                className={cn(
                  "rounded-lg h-full w-full border object-cover transition-all group-hover/item:scale-105",
                )}
              />
            </>
          ) : (
            <div className="bg-muted rounded-lg flex h-full w-full items-center justify-center border">
              <ImageIcon className="text-muted-foreground h-8 w-8" />
            </div>
          )}

          {/* Overlay */}
          <div className="bg-black/50 absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover/item:opacity-100">
            {/* View Button */}
            {src && (
              <Button
                onClick={() => {
                  setSelectedImage(src);
                  setIsPreviewLoading(true);
                }}
                variant="secondary"
                size="icon"
                className="size-7"
                type="button"
              >
                <ZoomInIcon className="opacity-100/80" />
              </Button>
            )}

            {/* Remove Button */}
            <Button
              onClick={() => removeFile(idx)}
              variant="secondary"
              size="icon"
              className="size-7"
              type="button"
            >
              <XIcon className="opacity-100/8" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Files;
