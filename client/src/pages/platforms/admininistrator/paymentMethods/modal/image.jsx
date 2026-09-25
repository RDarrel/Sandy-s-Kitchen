import { useRef } from "react";
import { CloudUpload, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ImageUpload = ({
  id = "image-upload",
  className,
  previewClassName,
  title = "Upload Image",
  description = "PNG, JPG, or WebP up to 5MB.",
  helperText = "JPG, PNG, WebP - Max 5MB",
  browseLabel = "Upload",
  changeLabel = "Change",
  removeLabel = "Remove",
  accept = "image/*",
  maxSize = 5 * 1024 * 1024,
  image,
  onChange = () => {},
  onRemove = () => {},
}) => {
  const inputRef = useRef(null);
  const previewUrl = image;

  const validateFile = (file) => {
    if (!file) return false;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      return false;
    }

    if (file.size > maxSize) {
      toast.error("Image size must not exceed 5MB.");
      return false;
    }

    return true;
  };

  const handleFile = (file) => {
    if (!validateFile(file)) return;

    const reader = new FileReader();

    reader.onload = ({ target }) => {
      onChange(target.result);
    };

    reader.readAsDataURL(file);
  };

  const handleChange = (event) => {
    handleFile(event.target.files?.[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    handleFile(event.dataTransfer.files?.[0]);
  };

  const removeImage = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }

    onRemove();
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="text-xs font-medium text-foreground">{title}</p>

      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        className={cn(
          "relative min-h-40 overflow-hidden rounded-md border bg-background transition-all duration-200 hover:border-primary",
          previewClassName,
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          id={id}
          onChange={handleChange}
        />

        {previewUrl ? (
          <div className="group relative min-h-40 bg-card">
            <img
              src={previewUrl}
              alt="Preview"
              className="absolute inset-0 h-full w-full object-contain p-3 transition duration-200 group-hover:scale-[1.02] group-hover:blur-[1px]"
            />

            <div className="absolute inset-0 bg-black/0 transition duration-200 group-hover:bg-black/35" />

            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition duration-200 group-hover:opacity-100">
              <Button
                type="button"
                onClick={() => inputRef.current.click()}
                size="sm"
                className="h-8 px-2.5 text-xs"
              >
                <Upload className="size-3.5" />
                {changeLabel}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={removeImage}
                size="sm"
                className="h-8 px-2.5 text-xs"
              >
                <X className="size-3.5" />
                {removeLabel}
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 p-4 text-center hover:bg-primary/10"
            onClick={() => inputRef.current.click()}
          >
            <div className="rounded-full bg-primary/10 p-2.5">
              <CloudUpload className="size-4 text-primary" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">
                {description}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 shrink-0 px-2.5 text-xs"
            >
              {browseLabel}
            </Button>
          </div>
        )}
      </div>

      {!previewUrl && helperText && (
        <p className="text-[11px] text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
};

export default ImageUpload;
