import { Button } from "@/components/ui/button";

const Stats = ({
  files,
  maxFiles,
  formatBytes = () => {},
  clearFiles = () => {},
}) => {
  return (
    <div className="mt-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h4 className="text-sm font-medium">
          Gallery ({files.length}/{maxFiles})
        </h4>
        {/* <div className="text-muted-foreground text-xs">
          Total:{" "}
          {formatBytes(files.reduce((acc, file) => acc + file.file.size, 0))}
        </div> */}
      </div>
      <Button onClick={clearFiles} variant="outline" size="sm">
        Clear all
      </Button>
    </div>
  );
};

export default Stats;
