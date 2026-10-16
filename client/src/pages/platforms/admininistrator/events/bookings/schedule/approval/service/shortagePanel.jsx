import { Badge } from "@/components/ui/badge";
import { Stock } from "@/services/utilities";
import { AlertTriangle, PackageSearch } from "lucide-react";

const ShortagePanel = ({ service, shortages = [], floating = false, mode }) => {
  return (
    <div
      className={
        floating
          ? "mt-2 w-full xl:absolute xl:left-[calc(100%+1.5rem)] xl:top-0 xl:z-50 xl:mt-0 xl:w-[310px]"
          : "w-full"
      }
    >
      <div
        className="
          relative
          rounded-lg
          border
          border-border
          bg-background
          xl:shadow-xl
        "
      >
        <div className="absolute -left-6 top-5 z-20 hidden h-4 w-6 -translate-y-1/2 items-center xl:flex">
          <span className="absolute inset-x-0 h-0.5 rounded-full bg-amber-400/70" />

          <span className="absolute left-0 size-2 -translate-x-1/2 rounded-full border-2 border-background bg-amber-500" />

          <span className="absolute right-0 size-2 translate-x-1/2 rounded-full border-2 border-background bg-amber-500" />
        </div>

        <div className="rounded-t-lg border-b bg-muted/10 px-3 py-2.5">
          <div className="flex items-start gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-background text-amber-700">
              <PackageSearch className="size-4" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">
                  {service?.label} Shortage
                </p>

                <Badge
                  variant="outline"
                  className="h-5 shrink-0 border-amber-300/70 bg-background px-1.5 text-[10px] text-amber-700"
                >
                  {shortages.length}
                </Badge>
              </div>

              <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
                Some ingredients have insufficient stock. Required quantities
                are combined across all selected dishes.
              </p>
            </div>
          </div>
        </div>

        <div className="max-h-[220px] overflow-y-auto [scrollbar-width:thin]">
          {shortages.map((shortage, index) => (
            <ShortageItem
              key={shortage.inventory || shortage._id || index}
              shortage={shortage}
              showDivider={index !== shortages.length - 1}
            />
          ))}
        </div>

        <div className="rounded-b-lg border-t bg-muted/10 px-3 py-2">
          <div className="flex items-start gap-1.5">
            <AlertTriangle className="mt-0.5 size-3 shrink-0 text-amber-700" />

            <p className="text-[11px] leading-4 text-muted-foreground">
              {["approve", "update"].includes(mode)
                ? "Approval is still allowed. Review ingredient shortages before preparation."
                : "Setup cannot proceed until all ingredient shortages are resolved."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortagePanel;

const ShortageItem = ({ shortage, showDivider = false }) => {
  return (
    <div className={`min-w-0 px-3 py-2.5 ${showDivider ? "border-b" : ""}`}>
      <div className="grid gap-2">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">
              {shortage?.name || "Ingredient"}
            </p>
          </div>

          {shortage?.missingStockData && (
            <Badge
              variant="outline"
              className="h-5 shrink-0 border-amber-300/70 bg-background px-1.5 text-[10px] text-amber-700"
            >
              No stock
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-3 gap-1">
          <ShortageMetric
            label="Required"
            value={Stock.formatQuantity(
              shortage?.requiredQty,
              shortage?.baseUnit,
            )}
          />

          <ShortageMetric
            label="Available"
            value={
              shortage?.missingStockData
                ? "-"
                : Stock.formatQuantity(
                    shortage?.currentStock,
                    shortage?.baseUnit,
                  )
            }
          />

          <ShortageMetric
            label="Shortage"
            value={
              shortage?.missingStockData
                ? "Unknown"
                : Stock.formatQuantity(
                    shortage?.shortageQty,
                    shortage?.baseUnit,
                  )
            }
            isWarning
          />
        </div>
      </div>
    </div>
  );
};

const ShortageMetric = ({ label, value, isWarning = false }) => (
  <div
    className={`min-w-0 rounded-md border px-1.5 py-1 text-center text-[10px] ${
      isWarning ? "border-amber-300/60 bg-background" : "bg-muted/10"
    }`}
  >
    <span className="block text-muted-foreground">{label}</span>

    <span
      className={`block truncate font-semibold ${
        isWarning ? "text-amber-800" : "text-foreground"
      }`}
    >
      {value}
    </span>
  </div>
);
