import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CloudUpload, ImageIcon, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ImageUpload = ({
  className = "h-full",
  accept = "image/*",
  maxSize = 5 * 1024 * 1024,
  onImageChange = () => {},
}) => {
  const inputRef = useRef(null);

  const [preview, setPreview] = useState(null);

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

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const url = URL.createObjectURL(file);

    setPreview(url);
    onImageChange(file);
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    const file = e.dataTransfer.files[0];

    handleFile(file);
  };

  const removeImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    onImageChange(null);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={cn(
          "relative overflow-hidden  h-full rounded-md border transition border-dashed  transition-all duration-200   hover:border-primary  ",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          id="cover-upload"
          onChange={handleChange}
        />

        {preview ? (
          <div className="group h-full relative bg-red-200">
            <img
              src={preview}
              alt="Preview"
              className=" h-full w-full object-cover  "
            />

            <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/0 opacity-0 transition duration-200 group-hover:bg-black/40 group-hover:opacity-100">
              <Button
                type="button"
                onClick={() => inputRef.current.click()}
                size={"sm"}
              >
                <Upload />
                Change Cover
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={removeImage}
                size={"sm"}
              >
                <X />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="flex h-full cursor-pointer flex-col items-center justify-center gap-4 p-8 hover:bg-primary/10"
            onClick={() => inputRef.current.click()}
          >
            <div className="rounded-full bg-primary/10 p-4">
              <CloudUpload className="size-5 text-primary" />
            </div>

            <div className="text-center grid gap-2">
              <h3 className="text-md font-semibold">Upload Cover Image</h3>

              <p className="text-xs text-muted-foreground">
                Drag & drop an image here or click to browse.
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                JPG, PNG, WebP • Max 5MB
              </p>
            </div>

            <Button type="button" variant="outline">
              <ImageIcon className="mr-2 size-4" />
              Browse Files
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
