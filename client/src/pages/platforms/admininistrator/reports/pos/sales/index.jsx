import DatePicker from "@/components/shared/datePicker";
import CustomPagination from "@/components/shared/pagination";
import ListingSkeleton from "./listingSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import posSalesToExcel from "@/services/utilities/export/excel/posSalesToExcel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { GET_SALES_REPORT } from "@/services/redux/slices/report/pos";
import {
  capitalize,
  Formatter,
  fullName,
  handlePagination,
} from "@/services/utilities";
import { startOfMonth, endOfMonth, isValid, format, addDays } from "date-fns";
import {
  FileText,
  Download,
  Loader2,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const manilaDate = (value) => {
  const parsed = value ? new Date(value) : null;
  if (!isValid(parsed)) return null;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(parsed);
  const getPart = (type) =>
    Number(parts.find((part) => part.type === type).value);
  return new Date(getPart("year"), getPart("month") - 1, getPart("day"));
};

const groupLabel = (value, frequency, weekNumber) => {
  const date = manilaDate(value);
  if (!date) return "Unknown date";

  if (frequency === "weekly") {
    return `Week ${weekNumber} (${format(date, "MMMM d, yyyy")} to ${format(addDays(date, 6), "MMMM d, yyyy")})`;
  }
  if (frequency === "monthly") return format(date, "MMMM yyyy");
  if (frequency === "yearly") return format(date, "yyyy");
  return format(date, "MMMM d, yyyy");
};

const Sales = () => {
  const { auth } = useSelector(({ auth }) => auth);
  const { salesReport, isLoading } = useSelector(({ posReport }) => posReport);
  const { summary = {}, salesBreakdown = [] } = salesReport || {};
  const [date, setDate] = useState(() => {
    const today = new Date();

    return {
      from: startOfMonth(today),
      to: endOfMonth(today),
    };
  });

  const [frequency, setFrequency] = useState("daily");
  const [isExporting, setIsExporting] = useState(false);
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(10);
  const dispatch = useDispatch();
  const startDate = isValid(date?.from) ? format(date.from, "yyyy-MM-dd") : "";
  const endDate = isValid(date?.to) ? format(date.to, "yyyy-MM-dd") : "";

  useEffect(() => {
    if (!startDate || !endDate || startDate > endDate) return;

    setPage(1);
    dispatch(GET_SALES_REPORT({ startDate, endDate, frequency }));
  }, [dispatch, startDate, endDate, frequency]);

  const salesRows = useMemo(
    () =>
      salesBreakdown.flatMap((group, index) =>
        (group.items || []).map((item) => ({
          item,
          date: group.date,
          weekNumber: salesBreakdown.length - index,
        })),
      ),
    [salesBreakdown],
  );
  const groupTotals = useMemo(
    () =>
      new Map(
        salesBreakdown.map((group) => [
          group.date,
          (group.items || []).reduce(
            (total, item) => total + Number(item.amount ?? 0),
            0,
          ),
        ]),
      ),
    [salesBreakdown],
  );
  const visibleGroups = useMemo(
    () =>
      handlePagination(salesRows, page, maxPage).reduce((groups, row) => {
        const lastGroup = groups[groups.length - 1];
        if (lastGroup?.date === row.date) {
          lastGroup.items.push(row.item);
        } else {
          groups.push({
            date: row.date,
            weekNumber: row.weekNumber,
            items: [row.item],
          });
        }
        return groups;
      }, []),
    [salesRows, page, maxPage],
  );

  const handleExport = async () => {
    if (
      isLoading ||
      isExporting ||
      !salesRows.length ||
      !startDate ||
      !endDate ||
      startDate > endDate
    )
      return;
    setIsExporting(true);
    try {
      await posSalesToExcel({
        array: salesBreakdown.map((group, index) => ({
          ...group,
          label: groupLabel(
            group.date,
            frequency,
            salesBreakdown.length - index,
          ),
        })),
        options: {
          date,
          frequency,
          createdBy: auth?.fullName
            ? typeof auth.fullName === "string"
              ? auth.fullName
              : fullName(auth.fullName)
            : "Administrator",
        },
      });
    } catch (error) {
      console.error("Failed to export POS sales:", error);
      toast.error("Unable to export POS sales. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-background p-4 md:p-6">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <Card className="border-border shadow-sm">
          <CardHeader className="gap-4 xl:flex xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0 space-y-1.5">
              <CardTitle className="text-2xl text-foreground">
                POS Sales Report
              </CardTitle>

              <CardDescription>
                View and analyze POS sales by day, week, month, or year.
              </CardDescription>
            </div>

            <div className="flex min-w-0 flex-col gap-3 sm:ml-auto sm:flex-row sm:items-end">
              <div className="space-y-1.5">
                <p
                  id="sales-report-frequency-label"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Frequency
                </p>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger
                    aria-labelledby="sales-report-frequency-label"
                    className="w-full sm:w-[140px]"
                  >
                    <SelectValue placeholder="Frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div
                className="min-w-0 space-y-1.5 sm:shrink-0"
                role="group"
                aria-labelledby="sales-report-date-range-label"
              >
                <p
                  id="sales-report-date-range-label"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Report Period
                </p>
                <DatePicker
                  mode="range"
                  captionLayout="dropdown"
                  date={date}
                  setDate={setDate}
                  highlightToday={false}
                />
              </div>
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={
                  isLoading ||
                  isExporting ||
                  !salesRows.length ||
                  !startDate ||
                  !endDate ||
                  startDate > endDate
                }
                aria-busy={isExporting}
                className="shrink-0"
              >
                {isExporting ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="size-4" aria-hidden="true" />
                )}
                Export to Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6" aria-busy={isLoading}>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title: "Total Sales",
                  value: Formatter.amount(Number(summary.totalSales ?? 0)),
                  description: "Total revenue from POS sales",
                  icon: FileText,
                  tone: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                },
                {
                  title: "Cost of Goods Sold (COGS)",
                  value: Formatter.amount(Number(summary.totalCost ?? 0)),
                  description: "Total cost of goods sold",
                  icon: Wallet,
                  tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                },
                {
                  title: "Gross Profit",
                  value: Formatter.amount(Number(summary.grossProfit ?? 0)),
                  description: "Total sales minus cost of goods sold",
                  icon: TrendingUp,
                  tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                },
                {
                  title: "Total Orders",
                  value: Number(summary.totalOrders ?? 0).toLocaleString(),
                  description: "Total number of POS transactions",
                  icon: ShoppingBag,
                  tone: "bg-muted text-muted-foreground",
                },
              ].map((card) => (
                <SummaryCard key={card.title} {...card} isLoading={isLoading} />
              ))}
            </div>
            <div className="overflow-hidden rounded-sm border border-border [&_tr>*:first-child]:border-l-0 [&_tr>*:last-child]:border-r-0 [&_tr:first-child>*]:border-t-0 [&_tr:last-child>*]:border-b-0">
              <Table>
                <TableBody>
                  {isLoading ? (
                    <ListingSkeleton />
                  ) : salesRows.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={5}
                        className="h-64 whitespace-normal text-center"
                      >
                        <div
                          role="status"
                          className="flex flex-col items-center justify-center gap-2 px-4 py-8"
                        >
                          <div className="mb-2 rounded-full bg-muted p-3 text-muted-foreground">
                            <ShoppingBag
                              aria-hidden="true"
                              className="size-6"
                            />
                          </div>
                          <p className="text-sm font-semibold text-foreground">
                            No sales found
                          </p>
                          <p className="max-w-sm text-sm text-muted-foreground">
                            No POS sales were recorded within the selected
                            report period. Try selecting another date range.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleGroups.map((group) => (
                      <Fragment key={group.date}>
                        <TableRow className="bg-[#FAEAEA] text-[#8B2424] hover:bg-[#FAEAEA] border-l-4 border-l-primary dark:bg-primary/15 dark:text-foreground dark:hover:bg-primary/15">
                          <TableCell
                            colSpan={3}
                            className="border-y border-l border-border py-3 text-sm font-semibold"
                          >
                            {groupLabel(
                              group.date,
                              frequency,
                              group.weekNumber,
                            )}
                          </TableCell>
                          <TableCell
                            colSpan={2}
                            className="border-y border-r border-border py-3 text-sm font-semibold"
                          >
                            <div className="text-right tabular-nums">
                              {Formatter.amount(
                                groupTotals.get(group.date) ?? 0,
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow className="bg-background hover:bg-background">
                          {[
                            "Menu",
                            "Qty",
                            "Total Sales",
                            "Total Cost",
                            "Gross Profit",
                          ].map((label, index) => (
                            <TableHead
                              key={label}
                              scope="col"
                              className={`border border-border text-left font-semibold text-foreground ${index === 0 ? "min-w-[180px]" : "whitespace-nowrap"}`}
                            >
                              {label}
                            </TableHead>
                          ))}
                        </TableRow>
                        {(group.items || []).map((item) => (
                          <TableRow
                            key={
                              item._id ||
                              `${group.date}-${item.date}-${item.menu?._id}`
                            }
                          >
                            <TableCell className="border border-border text-sm font-medium">
                              {capitalize(item.menu?.name || "Unknown menu")}
                            </TableCell>
                            <TableCell className="border border-border text-left tabular-nums">
                              {item.quantity ?? 0}
                            </TableCell>
                            <TableCell className="border border-border text-left text-sm tabular-nums">
                              {Formatter.amount(Number(item.amount ?? 0))}
                            </TableCell>
                            <TableCell className="border border-border text-left text-sm tabular-nums">
                              {Formatter.amount(Number(item.totalCost ?? 0))}
                            </TableCell>
                            <TableCell className="border border-border text-left text-sm font-semibold tabular-nums">
                              {Formatter.amount(
                                Number(item.amount ?? 0) -
                                  Number(item.totalCost ?? 0),
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {!isLoading && salesRows.length > 0 && (
              <div className="overflow-x-auto [&>div]:mt-0">
                <CustomPagination
                  page={page}
                  maxPage={maxPage}
                  datas={salesRows}
                  title="sale"
                  setPage={setPage}
                  setMaxPage={(value) => {
                    setMaxPage(value);
                    setPage(1);
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Sales;

const SummaryCard = ({ title, value, description, icon, tone, isLoading }) => {
  const Icon = icon;
  return (
    <div className="rounded-lg border bg-muted/10 px-3.5 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <div className={`rounded-md p-1.5 ${tone}`}>
          <Icon className="size-3.5" aria-hidden="true" />
        </div>
      </div>
      {isLoading ? (
        <div role="status" aria-label={`Loading ${title}`}>
          <Skeleton className="mt-1 h-7 w-32 max-w-full" aria-hidden="true" />
          <Skeleton className="mt-0.5 h-4 w-28 max-w-full" aria-hidden="true" />
        </div>
      ) : (
        <>
          <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight">
            {value}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </>
      )}
    </div>
  );
};
