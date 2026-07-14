import { ChevronRight } from "lucide-react";

const Seperator = () => {
  return (
    <div className="hidden items-center justify-center xl:flex">
      <div className="flex h-full items-center justify-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white shadow-sm">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
};

export default Seperator;
