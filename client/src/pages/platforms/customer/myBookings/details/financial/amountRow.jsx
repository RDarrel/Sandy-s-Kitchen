import { Formatter } from "@/services/utilities";

const AmountRow = ({
  label,
  value,
  detail,
  strong = false,
  positive = false,
  pending = false,
}) => {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span
        className={
          strong ? "font-semibold text-foreground" : "text-muted-foreground"
        }
      >
        {detail ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1 rounded-full bg-muted-foreground/40" />

            {label}

            <span className="text-[11px] font-normal text-muted-foreground/80">
              {detail}
            </span>
          </span>
        ) : (
          label
        )}
      </span>

      <span
        className={[
          strong ? "font-semibold" : "font-medium",
          positive ? "text-emerald-700 dark:text-emerald-400" : "",
          pending ? "text-amber-700 dark:text-amber-400" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {Formatter.amount(value || 0)}
      </span>
    </div>
  );
};

export default AmountRow;
