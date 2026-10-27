import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Download, Loader2 } from "lucide-react";
import { endOfMonth, isValid, startOfMonth } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import bookingTransactionsToExcel from "@/services/utilities/export/excel/bookingTransactionsToExcel";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fullName, handlePagination } from "@/services/utilities";
import PaymentDetails from "./paymentDetails";
import CustomPagination from "@/components/shared/pagination";
import Summary from "./summary";
import Header from "./header";
import PaymentItem from "./payment";
import Filter from "./filter";

const getCustomerName = (payment) => {
  const name = payment.booking?.customer?.fullName;
  return name ? fullName(name) : "Unavailable";
};

const Payment = () => {
  const { auth } = useSelector(({ auth }) => auth);
  const { paymentReport: report, isLoading } = useSelector(
    ({ bookingReport }) => bookingReport,
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [transactionType, setTransactionType] = useState("all");
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(10);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return { from: startOfMonth(today), to: endOfMonth(today) };
  });
  const validPeriod =
    isValid(date?.from) && isValid(date?.to) && date.from <= date.to;

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (report?.payments ?? []).filter((payment) => {
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
        (transactionType === "all" ||
          (payment.transactionType || "payment") === transactionType) &&
        (statusFilter === "all" || payment.status === statusFilter)
      );
    });
  }, [report?.payments, search, statusFilter, transactionType]);

  const handleExport = async () => {
    if (isLoading || isExporting || !filteredPayments.length || !validPeriod)
      return;
    setIsExporting(true);
    try {
      await bookingTransactionsToExcel({
        array: filteredPayments,
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
      console.error("Failed to export booking transactions:", error);
      toast.error("Unable to export booking transactions. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-background p-4 md:p-6">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <Card className="border-border shadow-sm">
          <Header setPage={setPage} date={date} setDate={setDate} />

          <CardContent className="space-y-6" aria-busy={isLoading}>
            <Summary />
            <Filter
              transactionType={transactionType}
              setTransactionType={setTransactionType}
              search={search}
              statusFilter={statusFilter}
              setSearch={setSearch}
              setStatusFilter={setStatusFilter}
              setPage={setPage}
            >
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={
                  isLoading ||
                  isExporting ||
                  !filteredPayments.length ||
                  !validPeriod
                }
                aria-busy={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="size-4" aria-hidden="true" />
                )}
                {isExporting ? "Exporting…" : "Export to Excel"}
              </Button>
            </Filter>
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Booking</TableHead>
                    <TableHead className="whitespace-nowrap">
                      Transaction Type
                    </TableHead>
                    <TableHead>Method / Date</TableHead>
                    <TableHead>Reviewed By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="w-16 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading || filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
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
                            : report.payments.length === 0
                              ? "No payments recorded yet."
                              : "No transactions match your filters."}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    handlePagination(filteredPayments, page, maxPage).map(
                      (payment, idx) => (
                        <PaymentItem
                          payment={payment}
                          key={`${payment?._id}-${idx}`}
                          setSelectedPayment={setSelectedPayment}
                          getCustomerName={getCustomerName}
                        />
                      ),
                    )
                  )}
                </TableBody>
              </Table>
            </div>

            {!isLoading && (
              <CustomPagination
                page={page}
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
