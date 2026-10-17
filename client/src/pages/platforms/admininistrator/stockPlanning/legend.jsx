import { ArrowUpRight } from "lucide-react";

const Legend = () => {
  return (
    <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-amber-500/70" />C = Catering
        </span>

        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-teal-600/70" />P = POS
          (Estimated)
        </span>

        <span className="flex items-center gap-1.5">
          <ArrowUpRight className="size-3.5 text-sky-600 dark:text-sky-400" />
          Incoming = Expected delivery
        </span>
      </div>
    </div>
  );
};

export default Legend;
