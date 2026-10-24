import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Filter = ({
  setSearch,
  setPage,
  search,
  setStatusFilter,
  statusFilter,
  transactionType,
  setTransactionType,
}) => {
  const statusOptions = [
    { value: "pending", label: "Pending" },
    ...(transactionType !== "refund"
      ? [{ value: "verified", label: "Verified" }, { value: "voided", label: "Voided" }]
      : []),
    ...(transactionType !== "payment"
      ? [{ value: "completed", label: "Completed" }]
      : []),
  ];
  return (
    <>
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
          value={transactionType}
          onValueChange={(value) => {
            setTransactionType(value);
            setStatusFilter("all");
            setPage(1);
          }}
        >
          <SelectTrigger aria-label="Transaction type" className="w-full sm:w-[180px]">
            <SelectValue placeholder="Transaction type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All transactions</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
            <SelectItem value="refund">Refund</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger
            aria-label="Transaction status"
            className="w-full sm:w-[150px]"
          >
            <SelectValue placeholder="Transaction status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {statusOptions.map(({ value, label }) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default Filter;
