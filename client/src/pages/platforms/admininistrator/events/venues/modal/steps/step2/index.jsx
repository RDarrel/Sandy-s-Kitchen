import { useState } from "react";
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload";
import { cn } from "@/lib/utils";
import Preview from "./preview";
import Files from "./files";
import Stats from "./stats";
import Upload from "./upload";
import ErrorDisplay from "./errorDisplay";

const Step2 = ({
  maxFiles = 4,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = "image/*",
  multiple = true,
  className,
  form,
  setForm = () => {},
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [loadingImages, setLoadingImages] = useState({});
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const onFilesChange = (images) => setForm((prev) => ({ ...prev, images }));
  const [
    { files = [], isDragging, errors },
    {
      removeFile,
      clearFiles,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
  ] = useFileUpload({
    maxFiles,
    maxSize,
    accept,
    multiple,
    initialFiles: form?.images || [],
    onFilesChange,
  });

  return (
    <div className={cn("w-full max-w-4xl", className)}>
      {/* Upload Area */}
      <Upload
        isDragging={isDragging}
        maxFiles={maxFiles}
        maxSize={maxSize}
        handleDragEnter={handleDragEnter}
        handleDragLeave={handleDragLeave}
        handleDrop={handleDrop}
        handleDragOver={handleDragOver}
        getInputProps={getInputProps}
        formatBytes={formatBytes}
        openFileDialog={openFileDialog}
      />

      {/* Gallery Stats */}
      {files.length > 0 && (
        <Stats
          files={files}
          maxFiles={maxFiles}
          formatBytes={formatBytes}
          clearFiles={clearFiles}
        />
      )}

      {files.length > 0 && (
        <Files
          files={files}
          loadingImages={loadingImages}
          removeFile={removeFile}
          setSelectedImage={setSelectedImage}
          setLoadingImages={setLoadingImages}
          setIsPreviewLoading={setIsPreviewLoading}
        />
      )}

      {errors.length > 0 && <ErrorDisplay errors={errors} />}
      <Preview
        isPreviewLoading={isPreviewLoading}
        setSelectedImage={setSelectedImage}
        selectedImage={selectedImage}
        setIsPreviewLoading={setIsPreviewLoading}
      />
    </div>
  );
};
export default Step2;
