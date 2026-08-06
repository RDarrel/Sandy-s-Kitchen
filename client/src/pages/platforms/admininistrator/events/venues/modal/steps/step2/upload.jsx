import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImageIcon, UploadIcon } from "lucide-react";

const Upload = ({
  isDragging,
  maxSize,
  maxFiles,
  openFileDialog = () => {},
  handleDragEnter = () => {},
  handleDragLeave = () => {},
  handleDragOver = () => {},
  handleDrop = () => {},
  getInputProps = () => {},
  formatBytes = () => {},
}) => {
  return (
    <div
      className={cn(
        "rounded-lg relative border border-dashed p-8 text-center transition-colors",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/50",
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input {...getInputProps()} className="sr-only" />

      <div className="flex flex-col items-center gap-4">
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full",
            isDragging ? "bg-primary/10" : "bg-muted",
          )}
        >
          <ImageIcon
            className={cn(
              "h-5 w-5",
              isDragging ? "text-primary" : "text-muted-foreground",
            )}
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Upload Venue Images</h3>
          <p className="text-muted-foreground text-sm">
            Drag and drop images here or click to browse
          </p>
          <p className="text-muted-foreground text-xs">
            PNG, JPG, GIF up to {formatBytes(maxSize)} each (max {maxFiles}{" "}
            files)
          </p>
        </div>

        <Button onClick={openFileDialog} type="button">
          <UploadIcon className="h-4 w-4" />
          Select images
        </Button>
      </div>
    </div>
  );
};

export default Upload;
