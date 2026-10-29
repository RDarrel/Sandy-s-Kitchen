import { Info } from "lucide-react";
import { Formatter } from "@/services/utilities";

const ChargeNotice = ({ children, charge = 0 }) => (
  <div
    role="status"
    className="flex items-start gap-1.5 text-[11px] leading-4 text-amber-800 dark:text-amber-300"
  >
    <Info
      aria-hidden="true"
      className="mt-0.5 size-3 shrink-0 text-amber-600 dark:text-amber-400"
    />
    <p className="min-w-0">
      <strong className="font-semibold">{children}</strong>
      <span aria-hidden="true" className="px-1 text-amber-500 dark:text-amber-600">
        ·
      </span>
      <span className="text-amber-800/80 dark:text-amber-200/80">
        Additional charge:{" "}
      </span>
      <strong className="whitespace-nowrap font-semibold tabular-nums">
        {Formatter.amount(charge)}
      </strong>
    </p>
  </div>
);

export default ChargeNotice;
