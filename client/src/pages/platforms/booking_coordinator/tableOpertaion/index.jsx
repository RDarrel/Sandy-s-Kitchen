import { useState } from "react";
import {
  ArrowDown, ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight,
  Search, SlidersHorizontal, Wallet, X,
} from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuLabel,
  DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { STATUS_DOTS } from "../../admininistrator/events/bookings/constant";
import { bookings } from "./data";

const money = (value) => new Intl.NumberFormat("en-PH", {
  style: "currency", currency: "PHP", maximumFractionDigits: 0,
}).format(value);
const dateLabel = (value) => new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
  month: "short", day: "2-digit", year: "numeric",
});
const statuses = ["All bookings", "Pending", "Approved", "Confirmed"];
const pageSize = 5;
const paymentOptions = [
  { value: "all", label: "All payments", matches: () => true },
  { value: "balance", label: "With balance", matches: (booking) => booking.paid > 0 && booking.paid < booking.amount },
  { value: "verification", label: "Pending verification", matches: (booking) => (booking.pendingPayment || 0) > 0 },
  { value: "paid", label: "Fully paid", matches: (booking) => booking.paid >= booking.amount },
  { value: "unpaid", label: "Unpaid", matches: (booking) => booking.paid === 0 && !booking.pendingPayment },
];

export default function TableOperation() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All bookings");
  const [service, setService] = useState("All services");
  const [payment, setPayment] = useState("all");
  const [page, setPage] = useState(1);
  const [ascending, setAscending] = useState(true);
  const [selected, setSelected] = useState(null);
  const paymentOption = paymentOptions.find((option) => option.value === payment);

  const filtered = bookings.filter((booking) =>
    (status === "All bookings" || booking.status === status) &&
    (service === "All services" || booking.service === service) &&
    paymentOption.matches(booking) &&
    `${booking.id} ${booking.customer} ${booking.email} ${booking.event}`
      .toLowerCase().includes(query.trim().toLowerCase()),
  ).sort((a, b) => ascending ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const hasFilters = Boolean(query || service !== "All services" || payment !== "all");
  const resetFilters = () => {
    setQuery(""); setService("All services"); setPayment("all"); setPage(1);
  };
  const scopeLabel = status === "All bookings" ? "All bookings" : `${status} bookings`;

  return (
    <section aria-label="Booking table" className="mx-auto w-full max-w-[1600px] px-4 pt-2 pb-8 sm:px-6">
      <div className="min-w-0">
          <div className="flex min-w-0 flex-col xl:flex-row xl:items-end xl:gap-5">
            <div className="relative z-10 order-2 min-w-0 overflow-x-auto xl:order-1 xl:shrink-0">
              <div role="group" aria-label="Filter bookings by status" className="flex w-max items-end gap-0.5 pt-1">
                {statuses.map((label, index) => {
                  const active = status === label;
                  const count = label === "All bookings" ? bookings.length : bookings.filter((item) => item.status === label).length;
                  return (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={active}
                      onClick={() => { setStatus(label); setPage(1); }}
                      className={`relative inline-flex h-11 min-w-[128px] cursor-pointer items-center justify-between gap-3 whitespace-nowrap rounded-t-lg border px-3.5 text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ring motion-reduce:transition-none ${active ? "border-primary/40 border-b-card bg-card font-semibold text-primary" : "border-transparent font-medium text-muted-foreground hover:text-primary"}`}
                    >
                      {label}
                      <span className={`inline-flex h-5 min-w-5 items-center justify-center rounded-md px-1.5 text-xs font-semibold tabular-nums ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{count}</span>
                      {!active && index < statuses.length - 1 && statuses[index + 1] !== status && (
                        <span aria-hidden="true" className="pointer-events-none absolute -right-0.5 top-1/2 h-4 -translate-y-1/2 border-r border-border" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        <div className={`relative z-0 -mt-px min-w-0 overflow-hidden rounded-b-xl rounded-tr-xl border border-primary/40 bg-card shadow-xs ${status === "All bookings" ? "rounded-tl-none" : "rounded-tl-xl"}`}>
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
            <div role="group" aria-label={`Search and filters for ${scopeLabel.toLowerCase()}`} className="flex min-w-0 items-center gap-2">
              <div className="flex min-w-0 flex-1 items-center rounded-lg border border-border bg-card shadow-xs transition-colors focus-within:border-primary/40">
              <div className="relative min-w-0 flex-1 sm:w-52 sm:flex-none">
                <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  aria-label={`Search ${scopeLabel.toLowerCase()}`}
                  placeholder={`Search ${scopeLabel.toLowerCase()}...`}
                  value={query}
                  onChange={(event) => { setQuery(event.target.value); setPage(1); }}
                  className="h-9 rounded-l-lg rounded-r-none border-0 bg-transparent pr-7 pl-8 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30 md:text-sm"
                />
                {query && (
                  <button type="button" aria-label="Clear search" onClick={() => { setQuery(""); setPage(1); }} className="absolute top-1/2 right-1 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
                    <X className="size-3" />
                  </button>
                )}
              </div>
              <span aria-hidden="true" className="h-5 w-px shrink-0 bg-border" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    aria-label={`Filter ${scopeLabel.toLowerCase()} by service: ${service}`}
                    className={`h-9 shrink-0 gap-2 rounded-l-none rounded-r-lg px-3 text-sm font-medium hover:bg-muted/50 data-[state=open]:bg-muted/50 ${service === "All services" ? "text-muted-foreground" : "bg-primary/5 text-primary"}`}
                  >
                    <SlidersHorizontal aria-hidden="true" className="size-3.5" />
                    {service}
                    <ChevronDown aria-hidden="true" className="size-3.5 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-lg">
                  <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Service · {scopeLabel}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={service} onValueChange={(value) => { setService(value); setPage(1); }}>
                    {["All services", "Catering", "Venue", "Catering + Venue"].map((option) => (
                      <DropdownMenuRadioItem key={option} value={option} className="cursor-pointer py-2 text-sm">{option}</DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
              {hasFilters && <Button variant="ghost" size="icon" className="size-8 shrink-0 text-muted-foreground" aria-label={`Clear all filters for ${scopeLabel.toLowerCase()}`} onClick={resetFilters}><X className="size-3.5" /></Button>}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  aria-label={`Filter ${scopeLabel.toLowerCase()} by payment: ${paymentOption.label}`}
                  className={`ml-auto h-9 gap-2 rounded-lg text-sm shadow-xs ${payment === "all" ? "border-border bg-card text-muted-foreground" : "border-primary/30 bg-primary/5 text-primary"}`}
                >
                  <Wallet aria-hidden="true" className="size-4" />
                  {paymentOption.label}
                  <ChevronDown aria-hidden="true" className="size-3.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-lg">
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Payment · {scopeLabel}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={payment} onValueChange={(value) => { setPayment(value); setPage(1); }}>
                  {paymentOptions.map((option) => (
                    <DropdownMenuRadioItem key={option.value} value={option.value} className="cursor-pointer py-2 text-sm">{option.label}</DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Table className="min-w-[1040px] text-sm leading-5">
            <TableHeader className="border-b border-border bg-card [&_th]:h-11 [&_th]:px-4 [&_th]:text-[13px] [&_th]:font-semibold [&_th]:text-foreground">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[140px]">Booking</TableHead>
                <TableHead>Customer / Event</TableHead>
                <TableHead aria-sort={ascending ? "ascending" : "descending"}>
                  <button type="button" onClick={() => setAscending(!ascending)} className="flex cursor-pointer items-center gap-1.5 rounded hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
                    Schedule<ArrowDown aria-hidden="true" className={`size-3 transition-transform ${ascending ? "" : "rotate-180"}`} />
                  </button>
                </TableHead>
                <TableHead className="text-right">Guests</TableHead>
                <TableHead className="text-right">Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"><span className="sr-only">Booking details</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&_td]:px-4 [&_td]:py-3.5">
              {visible.map((booking) => (
                <TableRow key={booking.id} className="border-border/60 hover:bg-muted/20">
                  <TableCell>
                    <button type="button" onClick={() => setSelected(booking)} className="cursor-pointer rounded font-semibold text-primary decoration-primary/30 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring">{booking.id}</button>
                    <p className="mt-1 text-xs leading-4 text-muted-foreground">{booking.service}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/50 text-xs font-semibold text-muted-foreground">{booking.customer.split(" ").map((part) => part[0]).join("")}</span>
                      <div>
                        <p className="font-semibold">{booking.customer}</p>
                        <p className="mt-1 text-xs leading-4 text-muted-foreground">{booking.event}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium tabular-nums">{dateLabel(booking.date)}</p>
                    <p className="mt-1 text-xs leading-4 text-muted-foreground">{booking.time}</p>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{booking.guests}</TableCell>
                  <TableCell className="text-right">
                    <p className="font-semibold tabular-nums">{money(booking.amount)}</p>
                    <p className={`mt-1 text-xs leading-4 ${booking.pendingPayment ? "text-amber-700 dark:text-amber-400" : booking.paid === booking.amount ? "text-teal-700 dark:text-teal-400" : "text-muted-foreground"}`}>
                      {booking.pendingPayment ? "Pending verification" : booking.paid === booking.amount ? "Fully paid" : booking.paid ? `${money(booking.paid)} paid` : "Unpaid"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-background/60 px-2 py-1 text-xs font-medium leading-4">
                      <span aria-hidden="true" className={`size-1.5 rounded-full ${STATUS_DOTS[booking.status.toLowerCase()]}`} />{booking.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="size-7 rounded-md text-muted-foreground hover:bg-primary/5 hover:text-primary" aria-label={`View booking ${booking.id}`} onClick={() => setSelected(booking)}><ArrowUpRight className="size-3.5" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {!visible.length && (
                <TableRow><TableCell colSpan={7} className="h-52 text-center">
                  <Search aria-hidden="true" className="mx-auto mb-3 size-5 text-muted-foreground/50" />
                  <p className="font-medium">No matching bookings</p>
                  <p className="mt-1 text-xs text-muted-foreground">Try another search or adjust your filters.</p>
                  <Button variant="link" onClick={resetFilters} className="mt-1 h-8 text-xs">Clear filters</Button>
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex flex-col items-center justify-between gap-3 border-t border-border bg-muted/20 px-4 py-3 sm:flex-row">
            <p className="text-[13px] text-muted-foreground">
              Showing <span className="font-semibold text-foreground tabular-nums">{filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)}</span> of <span className="font-semibold text-foreground tabular-nums">{filtered.length}</span> bookings
            </p>
            <nav aria-label="Booking pagination" className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="mr-1 h-8 gap-1 rounded-md border-border bg-card px-2.5 text-xs shadow-none hover:bg-secondary/40 disabled:opacity-40"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
              >
                <ChevronLeft aria-hidden="true" className="size-3.5" />Previous
              </Button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
                <Button
                  key={pageNumber}
                  variant="ghost"
                  size="icon"
                  aria-label={`Go to page ${pageNumber}`}
                  aria-current={currentPage === pageNumber ? "page" : undefined}
                  onClick={() => setPage(pageNumber)}
                  className={`size-8 rounded-md text-sm font-medium tabular-nums ${currentPage === pageNumber ? "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:text-primary-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-secondary-foreground"}`}
                >
                  {pageNumber}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="ml-1 h-8 gap-1 rounded-md border-border bg-card px-2.5 text-xs shadow-none hover:bg-secondary/40 disabled:opacity-40"
                disabled={currentPage === pageCount}
                onClick={() => setPage(currentPage + 1)}
              >
                Next<ChevronRight aria-hidden="true" className="size-3.5" />
              </Button>
            </nav>
          </div>
        </div>
      </div>
      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selected?.event}</DialogTitle><DialogDescription>{selected?.id} · Sample booking</DialogDescription></DialogHeader>
          {selected && (
            <dl className="grid grid-cols-2 gap-x-5 gap-y-5 border-t border-border pt-5">
              {[
                ["Customer", selected.customer], ["Email", selected.email],
                ["Service", selected.service], ["Location", selected.location],
                ["Event date", dateLabel(selected.date)], ["Time", selected.time],
                ["Guests", selected.guests], ["Status", selected.status],
                ["Total amount", money(selected.amount)], ["Remaining balance", money(selected.amount - selected.paid)],
                ["Awaiting verification", money(selected.pendingPayment || 0)],
              ].map(([label, value]) => (
                <div key={label} className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm font-medium">{value}</dd></div>
              ))}
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}


