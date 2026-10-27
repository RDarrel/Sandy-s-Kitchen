import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { Formatter, fullName } from "@/services/utilities";
import { Eye } from "lucide-react";

const STATUS_STYLES = {
  verified:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  pending:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  voided: "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

const Payment = ({
  payment,
  setSelectedPayment = () => {},
  getCustomerName = () => {},
}) => {
  const formatDate = (date) => Formatter.date(date, true);
  const isRefund = payment?.transactionType === "refund";
  const amountPrefix = isRefund
    ? payment?.status === "completed"
      ? "- "
      : ""
    : payment?.status === "verified"
      ? "+ "
      : "";
  return (
    <TableRow>
      <TableCell className="py-3 text-xs">
        <p className="font-medium">
          {payment.booking?.reference || "Unavailable"}
        </p>
        <p className="mt-1 text-muted-foreground">{getCustomerName(payment)}</p>
      </TableCell>
      <TableCell className="whitespace-nowrap py-3 text-xs font-medium">
        {isRefund ? "Refund" : "Payment"}
      </TableCell>
      <TableCell className="py-3 text-xs">
        <p className="font-medium capitalize">
          {payment.method?.name || "Unavailable"}
        </p>
        <p className="mt-1 text-muted-foreground">
          {formatDate(payment.createdAt)}
        </p>
      </TableCell>
      {/* <TableCell className="py-3 text-xs">
        <p className="font-medium">
          {payment.reviewedBy?.fullName
            ? fullName(payment.reviewedBy.fullName)
            : "Unavailable"}
        </p>
        <p className="mt-1 text-muted-foreground">
          {payment.reviewedAt
            ? formatDate(new Date(payment.reviewedAt))
            : "Not yet reviewed"}
        </p>
      </TableCell> */}
      <TableCell>
        <Badge
          variant="outline"
          className={`capitalize ${STATUS_STYLES[payment.status] || ""}`}
        >
          {payment.status || "Unknown"}
        </Badge>
      </TableCell>
      <TableCell className=" font-medium tabular-nums">
        {amountPrefix}
        {Formatter.amount(payment.amount)}
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
  );
};

export default Payment;
