import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { endOfMonth, format, isValid, startOfMonth } from "date-fns";
import {
  AlertCircle,
  Clock3,
  CreditCard,
  Eye,
  Loader2,
  Search,
  Wallet,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GET_PAYMENT_REPORT } from "@/services/redux/slices/report/Booking";
import { fullName } from "@/services/utilities";
import DatePicker from "@/components/shared/datePicker";
import PaymentDetails from "./paymentDetails";
import CustomPagination from "@/components/shared/pagination";

const EMPTY_REPORT = { summary: {}, payments: [] };
const getCustomerName = (payment) => {
  const name = payment.booking?.customer?.fullName;
  return name ? fullName(name) : "Unavailable";
};
const STATUS_STYLES = {
  verified:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  pending:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  voided: "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400",
};
const peso = (value = 0) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  }).format(date);
};

const Payment = () => {
  const dispatch = useDispatch();
  const [report, setReport] = useState(EMPTY_REPORT);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(10);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return { from: startOfMonth(today), to: endOfMonth(today) };
  });
  const startDate = isValid(date?.from) ? format(date.from, "yyyy-MM-dd") : "";
  const endDate = isValid(date?.to) ? format(date.to, "yyyy-MM-dd") : "";

  useEffect(() => {
    if (!startDate || !endDate || startDate > endDate) return;

    let active = true;
    setIsLoading(true);
    setError("");
    setPage(1);

    dispatch(GET_PAYMENT_REPORT({ startDate, endDate }))
      .unwrap()
      .then((response) => {
        // The report endpoint returns { data }, while the slice reads payload.
        const data = response?.data ?? response?.payload;
        if (!data?.summary || !Array.isArray(data?.payments)) {
          throw new Error("The payment report response is incomplete.");
        }
        if (active) setReport(data);
      })
      .catch((err) => {
        if (active) {
          setReport(EMPTY_REPORT);
          setError(err?.message || "Unable to load the payment report.");
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [dispatch, startDate, endDate]);

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return report.payments.filter((payment) => {
      const matchesSearch = [
        payment.booking?.reference,
        getCustomerName(payment),
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      );
      return (
        matchesSearch &&
        (statusFilter === "all" || payment.status === statusFilter)
      );
    });
  }, [report.payments, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPayments.length / maxPage),
  );
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * maxPage;
  const visiblePayments = filteredPayments.slice(
    pageStart,
    pageStart + maxPage,
  );
  const { summary } = report;
  const summaryCards = [
    {
      title: "Payments Collected",
      value: peso(summary.totalCollected),
      description: `${summary.totalVerified ?? 0} verified payments`,
      icon: Wallet,
      tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Pending Review",
      value: peso(summary.pendingAmount),
      description: `${summary.totalPending ?? 0} pending payments`,
      icon: Clock3,
      tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      title: "Voided Payments",
      value: peso(summary.voidedAmount),
      description: `${summary.totalVoided ?? 0} voided payments`,
      icon: XCircle,
      tone: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    },
    {
      title: "Total Payments",
      value: summary.totalPayments ?? 0,
      description: `${peso(summary.averagePayment)} average verified payment`,
      icon: CreditCard,
      tone: "bg-muted text-muted-foreground",
    },
  ];

  return (
    <div className="bg-background p-4 md:p-6">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <Card className="border-border shadow-sm">
          <CardHeader className="gap-4 sm:flex sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1.5">
              <CardTitle className="text-2xl text-foreground">
                Booking Payments Report
              </CardTitle>
              <CardDescription>
                Monitor verified collections and payments awaiting review.
              </CardDescription>
            </div>
            <div
              className="min-w-0 space-y-1.5 sm:ml-auto sm:shrink-0"
              role="group"
              aria-labelledby="payment-report-date-range-label"
            >
              <p
                id="payment-report-date-range-label"
                className="text-xs font-medium text-muted-foreground"
              >
                Report Period
              </p>
              <DatePicker mode="range" date={date} setDate={setDate} />
            </div>
          </CardHeader>

          <CardContent className="space-y-6" aria-busy={isLoading}>
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map(({ title, value, description, icon, tone }) => {
                const Icon = icon;
                return (
                  <div
                    key={title}
                    className="rounded-lg border bg-muted/10 p-3.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        {title}
                      </p>
                      <div className={`rounded-md p-1.5 ${tone}`}>
                        <Icon className="size-3.5" aria-hidden="true" />
                      </div>
                    </div>
                    <p className="mt-2 text-xl font-semibold tabular-nums tracking-tight">
                      {isLoading || error ? "—" : value}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {isLoading
                        ? "Loading report…"
                        : error
                          ? "Report unavailable"
                          : description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <Search
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  aria-label="Search booking reference or customer"
                  placeholder="Reference or customer…"
                  className="pl-9"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger
                  aria-label="Payment status"
                  className="w-full sm:w-[150px]"
                >
                  <SelectValue placeholder="Payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="voided">Voided</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Booking / Customer</TableHead>
                    <TableHead>Payment Details</TableHead>
                    <TableHead>Reviewed By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="w-16 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading || error || visiblePayments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
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
                            ? "Loading payments…"
                            : error
                              ? "Payment report unavailable."
                              : report.payments.length === 0
                                ? "No payments recorded yet."
                                : "No payments match your search or status filter."}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    visiblePayments.map((payment) => (
                      <TableRow key={payment._id}>
                        <TableCell className="py-3 text-xs">
                          <p className="font-medium">
                            {payment.booking?.reference || "Unavailable"}
                          </p>
                          <p className="mt-1 text-muted-foreground">
                            {getCustomerName(payment)}
                          </p>
                        </TableCell>
                        <TableCell className="py-3 text-xs">
                          <p className="font-medium capitalize">
                            {payment.method?.name || "Unavailable"}
                          </p>
                          <p className="mt-1 text-muted-foreground">
                            {formatDate(payment.createdAt)}
                          </p>
                        </TableCell>
                        <TableCell className="py-3 text-xs">
                          <p className="font-medium">
                            {payment.reviewedBy?.fullName
                              ? fullName(payment.reviewedBy.fullName)
                              : "Unavailable"}
                          </p>
                          <p className="mt-1 text-muted-foreground">
                            {payment.reviewedAt
                              ? formatDate(payment.reviewedAt)
                              : "Not yet reviewed"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`capitalize ${STATUS_STYLES[payment.status] || ""}`}
                          >
                            {payment.status || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell className=" font-medium tabular-nums">
                          {peso(payment.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label="View payment details"
                            title="View payment details"
                            onClick={() => setSelectedPayment(payment)}
                          >
                            <Eye className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {!isLoading && !error && (
              <CustomPagination
                page={currentPage}
                maxPage={maxPage}
                datas={filteredPayments}
                title="payment"
                setPage={setPage}
                setMaxPage={(value) => {
                  setMaxPage(value);
                  setPage(1);
                }}
              />
            )}
          </CardContent>
        </Card>
        {selectedPayment && (
          <PaymentDetails
            isOpen={Boolean(selectedPayment)}
            setIsOpen={(open) => {
              if (!open) setSelectedPayment(null);
            }}
            booking={selectedPayment.booking}
            payment={selectedPayment}
          />
        )}
      </div>
    </div>
  );
};

export default Payment;
