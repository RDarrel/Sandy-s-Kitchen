import DatePicker from "@/components/shared/datePicker";
import CustomPagination from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GET_TRANSACTIONS_REPORT } from "@/services/redux/slices/report/pos";
import { Formatter, fullName, handlePagination } from "@/services/utilities";
import { endOfMonth, startOfMonth, isValid, format } from "date-fns";
import { Download, Eye, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import posTransactionsToExcel from "@/services/utilities/export/excel/posTransactionsToExcel";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ViewReceiptModal from "@/components/shared/view-receipt";
import MethodBreakdown from "./method-breakdown";
import TableLoading from "@/components/shared/loading/table";

const getCashierName = (transaction) => {
  const name = transaction?.created?.by?.fullName;
  return name
    ? typeof name === "string"
      ? name
      : fullName(name)
    : "Unknown cashier";
};

const formatTransactionDate = (transaction) => {
  const value = transaction?.created?.at || transaction?.createdAt;
  const parsed = value ? new Date(value) : null;
  return isValid(parsed) ? format(parsed, "MMM dd, yyyy • hh:mm a") : "—";
};

const Transactions = () => {
  const { auth } = useSelector(({ auth }) => auth);
  const [isExporting, setIsExporting] = useState(false);
  const {
    transactionsReport,
    isLoading,
    message: reportError,
  } = useSelector(({ posReport }) => posReport);
  const {
    totalAmount = 0,
    totalCount = 0,
    transactions = [],
    cashiers = [],
  } = transactionsReport || {};
  const [search, setSearch] = useState("");
  const [cashier, setCashier] = useState("all");
  const [selected, setSelected] = useState({});
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(10);
  const [date, setDate] = useState(() => {
    const today = new Date();

    return {
      from: startOfMonth(today),
      to: endOfMonth(today),
    };
  });
  const startDate = isValid(date?.from) ? format(date.from, "yyyy-MM-dd") : "";
  const endDate = isValid(date?.to) ? format(date.to, "yyyy-MM-dd") : "";
  const dispatch = useDispatch();

  useEffect(() => {
    if (!startDate || !endDate || startDate > endDate) return;

    setPage(1);
    setCashier("all");
    dispatch(GET_TRANSACTIONS_REPORT({ startDate, endDate }));
  }, [dispatch, startDate, endDate]);

  const filteredTransactions = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return transactions.filter((transaction) => {
      const matchesSearch =
        !keyword ||
        String(transaction?._id || "")
          .toLowerCase()
          .includes(keyword) ||
        getCashierName(transaction).toLowerCase().includes(keyword);
      const matchesCashier =
        cashier === "all" || String(transaction?.created?.by?._id) === cashier;

      return matchesSearch && matchesCashier;
    });
  }, [transactions, search, cashier]);

  const handleExport = async () => {
    if (
      isLoading ||
      isExporting ||
      !filteredTransactions.length ||
      !startDate ||
      !endDate ||
      startDate > endDate
    )
      return;
    setIsExporting(true);
    try {
      await posTransactionsToExcel({
        array: filteredTransactions,
        options: {
          date,
          createdBy: auth?.fullName
            ? typeof auth.fullName === "string"
              ? auth.fullName
              : fullName(auth.fullName)
            : "Administrator",
        },
      });
    } catch (error) {
      console.error("Failed to export POS transactions:", error);
      toast.error("Unable to export POS transactions. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-background p-4 md:p-6">
      <div className="mx-auto grid w-full max-w-[1600px] items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="min-w-0 border-border shadow-sm">
          <CardHeader className="gap-4 lg:flex lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 space-y-1.5">
              <CardTitle className="text-xl leading-tight text-foreground 2xl:text-2xl">
                POS Transactions Report
              </CardTitle>

              <CardDescription>
                Review sales and payments by cashier.
              </CardDescription>
            </div>

            <div className="flex min-w-0 flex-col gap-3 sm:ml-auto sm:flex-row sm:items-end lg:shrink-0">
              <div
                className="min-w-0 space-y-1.5 sm:shrink-0"
                role="group"
                aria-labelledby="transactions-report-date-range-label"
              >
                <p
                  id="transactions-report-date-range-label"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Report period
                </p>
                <DatePicker
                  mode="range"
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
                  !filteredTransactions.length ||
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
                {isExporting ? "Exporting…" : "Export to Excel"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4" aria-busy={isLoading}>
            {/* <SummaryLine
              isLoading={isLoading}
              value={`${totalCount} transaction${totalCount === 1 ? "" : "s"}`}
              label={Formatter.amount(totalAmount)}
            /> */}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <Search
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  aria-label="Search by transaction ID or cashier"
                  placeholder="Search by transaction ID or cashier…"
                  className="pl-9"
                />
              </div>
              <Select
                value={cashier}
                onValueChange={(value) => {
                  setCashier(value);
                  setPage(1);
                }}
              >
                <SelectTrigger
                  aria-label="Filter by cashier"
                  className="w-full sm:w-[220px]"
                >
                  <SelectValue placeholder="All cashiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All cashiers</SelectItem>
                  {cashiers.map((person) => (
                    <SelectItem key={person._id} value={String(person._id)}>
                      {getCashierName({ created: { by: person } })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-hidden rounded-lg border">
              {isLoading ? (
                <TableLoading />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="min-w-[210px]">
                        Transaction / date
                      </TableHead>
                      <TableHead className="min-w-[150px]">Cashier</TableHead>
                      <TableHead className="text-right">Items</TableHead>
                      <TableHead className="whitespace-nowrap text-right">
                        Amount
                      </TableHead>
                      <TableHead className="w-16 text-right">Receipt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading || filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-32 text-center text-muted-foreground"
                        >
                          <div
                            role="status"
                            className="flex items-center justify-center gap-2"
                          >
                            {isLoading && (
                              <Loader2 className="size-4 animate-spin" />
                            )}
                            {isLoading
                              ? "Loading transactions…"
                              : transactions.length === 0
                                ? "No transactions were found for the selected period."
                                : "No transactions match your search or cashier filter."}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      handlePagination(filteredTransactions, page, maxPage).map(
                        (transaction) => {
                          const amount = Number(transaction.amount ?? 0);

                          return (
                            <TableRow key={transaction._id}>
                              <TableCell className="py-3 text-xs">
                                <div className="space-y-1">
                                  <p className="font-medium">
                                    {transaction._id.slice(-8).toUpperCase()}
                                  </p>
                                  <p className="text-muted-foreground">
                                    {formatTransactionDate(transaction)}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">
                                {getCashierName(transaction)}
                              </TableCell>
                              <TableCell className="text-right tabular-nums">
                                {transaction.items?.length ?? 0}
                              </TableCell>
                              <TableCell className="text-right text-sm font-semibold tabular-nums">
                                {Formatter.amount(amount)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="size-8"
                                  title="View receipt"
                                  aria-label="View receipt"
                                  onClick={() => setSelected(transaction)}
                                >
                                  <Eye className="size-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        },
                      )
                    )}
                  </TableBody>
                </Table>
              )}
            </div>

            {!isLoading && (
              <div className="overflow-x-auto [&>div]:mt-0">
                <CustomPagination
                  page={page}
                  maxPage={maxPage}
                  datas={filteredTransactions}
                  title="transaction"
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

        <MethodBreakdown
          date={date}
          transactions={filteredTransactions}
          isLoading={isLoading}
          error={reportError}
        />
      </div>

      <ViewReceiptModal
        isOpen={Boolean(selected?._id)}
        setIsOpen={() => {
          setSelected(null);
        }}
        order={selected}
      />
    </div>
  );
};

export default Transactions;

const SummaryLine = ({ label, value, isLoading = false }) => (
  <div className="flex items-center gap-3">
    {isLoading ? (
      <Skeleton aria-hidden="true" className="h-7 w-28 shrink-0" />
    ) : (
      <span className="shrink-0 text-xl font-bold tabular-nums text-primary">
        {label}
      </span>
    )}

    <span className="h-0 flex-1 border-t border-dashed border-border/80" />

    {isLoading ? (
      <Skeleton aria-hidden="true" className="h-6 w-32 shrink-0" />
    ) : (
      <span className="shrink-0 text-base font-semibold text-foreground">
        {value}
      </span>
    )}
  </div>
);
