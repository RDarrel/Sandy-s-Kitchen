import { ArrowUpRight } from "lucide-react";

const Proof = ({ proofSrc }) => {
  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-lg border bg-background">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2">
        <h3 className="text-sm font-medium">Payment proof</h3>

        {proofSrc && (
          <a
            href={proofSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Open
            <ArrowUpRight className="size-3.5" />
          </a>
        )}
      </div>

      <div className="relative h-72 md:h-auto md:min-h-80 md:flex-1">
        <div className="absolute inset-3">
          <a
            href={proofSrc}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open payment proof"
            className="flex h-full w-full items-center justify-center"
          >
            <img
              src={proofSrc}
              alt="Customer payment proof"
              className="h-full w-full object-contain"
            />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Proof;
