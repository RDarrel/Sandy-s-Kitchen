import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
} from "lucide-react";
import { Formatter, Stock } from "@/services/utilities";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { capitalize } from "lodash";

const getAlertDetails = (item) => {
  const type = item?.stockAlert?.type ?? "Sufficient";
  const alertDate = item?.stockAlert?.date;

  if (type === "shortage") {
    return {
      label: "Shortage",
      date: alertDate,
      textClass: "text-red-600 dark:text-red-400",
      Icon: CircleAlert,
    };
  }

  if (type === "reorder") {
    return {
      label: "Reorder",
      date: alertDate,
      textClass: "text-amber-600 dark:text-amber-400",
      Icon: AlertTriangle,
    };
  }

  return {
    label: "Sufficient",
    date: null,
    textClass: "text-emerald-600 dark:text-emerald-400",
    Icon: CheckCircle2,
  };
};

const Item = ({ item, isSelected, toggleItem = () => {} }) => {
  const { toPurchaseQty = 0 } = item;
  const selected = isSelected(item);
  const alert = getAlertDetails(item);
  const AlertIcon = alert.Icon;
  const incomingQty = Number(item?.incomingQty ?? 0);

  const hasProjectionBreakdown =
    Object.keys(item?.dailyProjection ?? {}).length > 0;

  return (
    <TableRow
      key={item._id}
      className={`cursor-pointer transition-colors ${
        selected ? "bg-muted/60 hover:bg-muted/80" : "hover:bg-muted/30"
      }`}
      onClick={() => toggleItem(item)}
    >
      <TableCell>
        <Checkbox
          checked={selected}
          onClick={(event) => event.stopPropagation()}
          onCheckedChange={() => toggleItem(item)}
          aria-label={`Select ${item.name}`}
        />
      </TableCell>

      <TableCell>
        <div className="space-y-0.5">
          <p className="break-words font-medium text-foreground">{item.name}</p>

          <p className="text-xs text-muted-foreground">
            {capitalize(item.category ?? "")}
          </p>
        </div>
      </TableCell>

      <TableCell>
        <div>
          <p className="font-medium text-foreground">
            {Stock.formatQuantity(
              item?.currentStock ?? 0,
              item?.baseUnit,
              item?.currentStock === 0,
            )}
          </p>

          {incomingQty > 0 && (
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-sky-700 dark:text-sky-400">
              <ArrowUpRight className="size-3.5 shrink-0" />
              {Stock.formatQuantity(incomingQty, item?.baseUnit)}
            </p>
          )}
        </div>
      </TableCell>

      <TableCell>
        <div>
          <p className="font-medium text-foreground">
            {item?.totalNeeded > 0
              ? Stock.formatQuantity(item.totalNeeded, item.baseUnit)
              : "—"}
          </p>

          <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-500">
              <span className="size-1.5 shrink-0 rounded-full bg-amber-500/70" />
              C:{" "}
              {item?.cateringNeeded > 0
                ? Stock.formatQuantity(item.cateringNeeded, item.baseUnit)
                : "—"}
            </span>

            <span className="inline-flex items-center gap-1 text-teal-700 dark:text-teal-400">
              <span className="size-1.5 shrink-0 rounded-full bg-teal-600/70" />
              P:{" "}
              {item?.estimatedPosNeeded > 0
                ? Stock.formatQuantity(item.estimatedPosNeeded, item.baseUnit)
                : "—"}
            </span>
          </p>
        </div>
      </TableCell>

      <TableCell>
        <div>
          {hasProjectionBreakdown ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={`cursor-help font-medium underline decoration-dotted underline-offset-4 `}
                  >
                    {Stock.formatQuantity(
                      item?.projectedStock,
                      item?.baseUnit,
                      item?.projectedStock === 0,
                    )}
                  </span>
                </TooltipTrigger>

                <TooltipContent side="top" className="w-64 space-y-2">
                  <p className="font-medium">Projected Stock Breakdown</p>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between gap-4">
                      <span>Current stock</span>
                      <span>
                        {Stock.formatQuantity(
                          item?.currentStock ?? 0,
                          item?.baseUnit,
                          item?.currentStock === 0,
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span>Incoming stock</span>
                      <span>
                        +
                        {Stock.formatQuantity(
                          item?.incomingQty ?? 0,
                          item?.baseUnit,
                          item?.incomingQty === 0,
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span>Catering demand</span>
                      <span>
                        −
                        {Stock.formatQuantity(
                          item?.cateringNeeded ?? 0,
                          item?.baseUnit,
                          item?.cateringNeeded === 0,
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span>Estimated POS demand</span>
                      <span>
                        −
                        {Stock.formatQuantity(
                          item?.estimatedPosNeeded ?? 0,
                          item?.baseUnit,
                          item?.estimatedPosNeeded === 0,
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4 border-t pt-2 font-medium">
                      <span>Projected stock</span>
                      <span>
                        {Stock.formatQuantity(
                          item?.projectedStock,
                          item?.baseUnit,
                        )}
                      </span>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <span className="font-medium text-foreground">
              {Stock.formatQuantity(
                item?.projectedStock,
                item?.baseUnit,
                item?.projectedStock === 0,
              )}
            </span>
          )}

          <p className="mt-1 text-xs text-muted-foreground">
            Reorder Level:{" "}
            {Stock.formatQuantity(item?.reorderLevel ?? 0, item?.baseUnit)}
          </p>
        </div>
      </TableCell>

      <TableCell>
        <div>
          <p
            className={`flex items-center gap-1.5 text-sm font-medium ${alert.textClass}`}
          >
            <AlertIcon className="size-3.5 shrink-0" aria-hidden="true" />
            {alert.label}
          </p>

          {alert.date && (
            <p className="mt-1 text-xs text-muted-foreground">
              {Formatter.date(alert.date)}
            </p>
          )}
        </div>
      </TableCell>

      <TableCell>
        {Number(toPurchaseQty) > 0 ? (
          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={`cursor-help font-medium underline decoration-dotted underline-offset-4 ${
                      item?.shortage > 0
                        ? "text-destructive"
                        : "text-foreground"
                    }`}
                  >
                    {Stock.formatQuantity(toPurchaseQty, item?.baseUnit)}
                  </span>
                </TooltipTrigger>

                <TooltipContent side="top" className="space-y-2">
                  <p className="font-medium">Purchase Breakdown</p>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between gap-6">
                      <span>Projected shortage</span>
                      <span>
                        {Stock.formatQuantity(
                          item?.shortage ?? 0,
                          item?.baseUnit,
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between gap-6">
                      <span>Minimum stock target</span>
                      <span>
                        {Stock.formatQuantity(
                          item?.minimumStock ?? 0,
                          item?.baseUnit,
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between gap-6 border-t pt-2 font-medium">
                      <span>Total to purchase</span>
                      <span>
                        {Stock.formatQuantity(toPurchaseQty, item?.baseUnit)}
                      </span>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {item?.includesMinimumStock && (
              <p className="mt-1 text-xs font-normal text-muted-foreground">
                Includes minimum stock
              </p>
            )}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
    </TableRow>
  );
};

export default Item;
