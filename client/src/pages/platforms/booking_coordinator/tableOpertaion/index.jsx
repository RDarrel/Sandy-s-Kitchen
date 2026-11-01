import { useState } from "react";
import {
  ArrowDown, ChevronDown, ChevronLeft, ChevronRight,
  CalendarDays, Check, Eye, MoreHorizontal, Pencil, Search, SlidersHorizontal, Wallet, X,
} from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { STATUS_DOTS } from "../../admininistrator/events/bookings/constant";
import { bookings as sampleBookings, previewEmptyTable } from "./data";
import { toBookingRow } from "./bookingRow";

const money = (value) => new Intl.NumberFormat("en-PH", {
  style: "currency", currency: "PHP", maximumFractionDigits: 0,
}).format(value);
const dateLabel = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
  month: "short", day: "2-digit", year: "numeric",
}) : "Not scheduled";
const statuses = ["All bookings", "Pending", "Approved", "Confirmed", "Setup", "Completed"];
const scheduleDate = (schedule) => schedule.endDate && schedule.endDate !== schedule.date
  ? `${dateLabel(schedule.date)} – ${dateLabel(schedule.endDate)}`
  : dateLabel(schedule.date);
const pageSize = 5;
const paymentOptions = [
  { value: "all", label: "All payments", matches: () => true },
  { value: "balance", label: "With balance", matches: (booking) => booking.paid > 0 && booking.paid < booking.amount },
  { value: "verification", label: "Pending verification", matches: (booking) => (booking.pendingPayment || 0) > 0 },
  { value: "paid", label: "Fully paid", matches: (booking) => booking.paid >= booking.amount },
  { value: "unpaid", label: "Unpaid", matches: (booking) => booking.paid === 0 && !booking.pendingPayment },
];

export default function TableOperation({ bookings = sampleBookings }) {
  const tableBookings = previewEmptyTable ? [] : bookings.map(toBookingRow);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All bookings");
  const [service, setService] = useState("All services");
  const [payment, setPayment] = useState("all");
  const [page, setPage] = useState(1);
  const [ascending, setAscending] = useState(true);
  const [selected, setSelected] = useState(null);
  const [paymentReview, setPaymentReview] = useState(null);
  const paymentOption = paymentOptions.find((option) => option.value === payment);

  const filtered = tableBookings.filter((booking) =>
    (status === "All bookings" || booking.status === status) &&
    (service === "All services" || booking.service === service) &&
    paymentOption.matches(booking) &&
    `${booking.id} ${booking.customer} ${booking.email} ${booking.event}`
      .toLowerCase().includes(query.trim().toLowerCase()),
  ).sort((a, b) => ascending ? a.sortAt - b.sortAt : b.sortAt - a.sortAt);
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
                  const count = label === "All bookings" ? tableBookings.length : tableBookings.filter((item) => item.status === label).length;
                  return (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={active}
                      onClick={() => { setStatus(label); setPage(1); }}
                      className={`relative inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-t-lg border px-3.5 text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ring motion-reduce:transition-none ${active ? "border-primary/40 border-b-card bg-card font-semibold text-primary" : "border-transparent font-medium text-muted-foreground hover:text-primary"}`}
                    >
                      {label}
                      {count > 0 && <span className={`inline-flex h-5 min-w-5 items-center justify-center rounded-md px-1.5 text-xs font-semibold tabular-nums ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{count}</span>}
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
              <div className="relative min-w-0 flex-1 sm:w-72 sm:flex-none">
                <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  aria-label={`Search ${scopeLabel.toLowerCase()}`}
                  placeholder="Search customer or reference..."
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
                <DropdownMenuContent align="end" sideOffset={6} className="w-56 rounded-lg p-1.5">
                  <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Filter by service</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={service} onValueChange={(value) => { setService(value); setPage(1); }}>
                    {["All services", "Catering", "Venue", "Catering + Venue"].map((option) => (
                      <DropdownMenuRadioItem key={option} value={option} className="cursor-pointer rounded-md py-2 text-sm data-[state=checked]:bg-primary/5 data-[state=checked]:text-primary">
                        {option}
                      </DropdownMenuRadioItem>
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
          <Table className="min-w-[1200px] table-fixed text-sm leading-5">
            <colgroup>
              <col className="w-[14%]" />
              <col className="w-[23%]" />
              <col className="w-[22%]" />
              <col className="w-[8%]" />
              <col className="w-[15%]" />
              <col className="w-[11%]" />
              <col className="w-[7%]" />
            </colgroup>
            <TableHeader className="border-b border-border bg-card [&_th]:h-11 [&_th]:px-4 [&_th]:text-[13px] [&_th]:font-semibold [&_th]:text-foreground">
              <TableRow className="hover:bg-transparent">
                <TableHead>Booking</TableHead>
                <TableHead>Customer / Event</TableHead>
                <TableHead aria-sort={ascending ? "ascending" : "descending"}>
                  <button type="button" onClick={() => setAscending(!ascending)} className="flex cursor-pointer items-center gap-1.5 rounded hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
                    Schedule<ArrowDown aria-hidden="true" className={`size-3 transition-transform ${ascending ? "" : "rotate-180"}`} />
                  </button>
                </TableHead>
                <TableHead className="text-right">Guests</TableHead>
                <TableHead className="text-right">Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&_td]:px-4 [&_td]:py-3.5">
              {visible.map((booking) => (
                <TableRow key={booking._id} className="border-border/60 hover:bg-muted/20">
                  <TableCell>
                    <button type="button" onClick={() => setSelected(booking)} className="cursor-pointer rounded font-semibold text-primary decoration-primary/30 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring">{booking.id}</button>
                    <p className="mt-1 text-xs leading-4 text-muted-foreground">{booking.service}</p>
                  </TableCell>
                  <TableCell>
                    <p title={booking.customer} className="truncate font-semibold">{booking.customer}</p>
                    <p title={booking.event} className="mt-1 truncate text-xs leading-4 text-muted-foreground">{booking.event}</p>
                  </TableCell>
                  <TableCell>
                    {booking.serviceSchedules ? (
                      <div>
                        {booking.serviceSchedules.filter((schedule) => schedule.service === "Venue").map((schedule) => (
                          <div key={schedule.service} title="Venue schedule">
                            <p className="font-medium tabular-nums">{scheduleDate(schedule)}</p>
                            <p className="mt-1 text-xs leading-4 text-muted-foreground">{schedule.time}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <p className="font-medium tabular-nums">{dateLabel(booking.date)}</p>
                        <p className="mt-1 text-xs leading-4 text-muted-foreground">{booking.time}</p>
                      </>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {booking.serviceSchedules ? (
                      <div className="ml-auto grid w-max grid-cols-[auto_auto] items-baseline gap-x-3 gap-y-1">
                        {booking.serviceSchedules.map((schedule) => (
                          <div key={schedule.service} className="contents" aria-label={`${schedule.service}: ${schedule.guests} guests`}>
                            <span title={schedule.service} className="text-left text-xs leading-4 text-muted-foreground">{schedule.service === "Catering" ? "C" : "V"}</span>
                            <span className="text-right font-medium tabular-nums">{schedule.guests}</span>
                          </div>
                        ))}
                      </div>
                    ) : booking.guests}
                  </TableCell>
                  <TableCell className="text-right">
                    <p className="font-semibold tabular-nums">{money(booking.amount)}</p>
                    <p className={`mt-1 text-xs leading-4 ${booking.pendingPayment ? "text-amber-700 dark:text-amber-400" : booking.paid === booking.amount ? "text-teal-700 dark:text-teal-400" : "text-muted-foreground"}`}>
                      {booking.pendingPayment ? "Pending verification" : booking.paid === booking.amount ? "Fully paid" : booking.paid ? `${money(booking.paid)} paid` : "Unpaid"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-background/60 px-2 py-1 text-xs font-medium leading-4">
                      <span aria-hidden="true" className={`size-1.5 rounded-full ${STATUS_DOTS[booking.record.status] || "bg-muted-foreground"}`} />{booking.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="size-8 rounded-md border-border bg-card text-muted-foreground shadow-none hover:border-primary/30 hover:bg-primary/5 hover:text-primary" aria-label={`Actions for booking ${booking.id}`}>
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" sideOffset={6} className="w-60 rounded-lg p-1.5">
                        <DropdownMenuLabel className="px-2 py-2">
                          <span className="block text-sm font-semibold">Booking actions</span>
                          <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{booking.id}</span>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => setSelected(booking)} className="cursor-pointer gap-2.5 rounded-md py-2 text-sm"><Eye className="size-4 text-muted-foreground" />View booking details</DropdownMenuItem>
                        <DropdownMenuItem disabled className="gap-2.5 rounded-md py-2 text-sm"><Pencil className="size-4" />Edit booking</DropdownMenuItem>
                        {booking.status === "Pending" && <DropdownMenuItem disabled className="gap-2.5 rounded-md py-2 text-sm"><Check className="size-4" />Approve booking</DropdownMenuItem>}
                        {(booking.pendingPayment > 0 || booking.paid < booking.amount) && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Payments</DropdownMenuLabel>
                            {booking.pendingPayment > 0 && (
                              <DropdownMenuItem onSelect={() => setPaymentReview(booking)} className="cursor-pointer gap-2.5 rounded-md py-2 text-sm font-medium text-primary focus:bg-primary/5 focus:text-primary">
                                <Wallet className="size-4" />Review payment
                                <span aria-hidden="true" className="ml-auto size-1.5 rounded-full bg-accent" />
                              </DropdownMenuItem>
                            )}
                            {booking.paid < booking.amount && <DropdownMenuItem disabled className="gap-2.5 rounded-md py-2 text-sm"><Wallet className="size-4" />Record a payment</DropdownMenuItem>}
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled className="gap-2.5 rounded-md py-2 text-sm text-destructive"><X className="size-4" />Cancel booking</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!visible.length && (
            <div role="status" className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center">
              <span aria-hidden="true" className="mb-4 flex size-12 items-center justify-center rounded-xl border border-border bg-muted/40 text-muted-foreground">
                {hasFilters ? <Search className="size-5" /> : <CalendarDays className="size-5" />}
              </span>
              <p className="text-base font-semibold text-foreground">{hasFilters ? "No matching bookings" : tableBookings.length ? `No ${status.toLowerCase()} bookings` : "No bookings yet"}</p>
              <p className="mt-1.5 max-w-xs text-sm leading-6 text-muted-foreground">
                {hasFilters ? "Try a different search or adjust your filters." : tableBookings.length ? "Bookings with this status will appear here." : "Reservations will appear here once customers submit their bookings."}
              </p>
              {hasFilters && <Button variant="outline" size="sm" onClick={resetFilters} className="mt-4 rounded-lg">Clear filters</Button>}
            </div>
          )}
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
      <Dialog open={Boolean(paymentReview)} onOpenChange={(open) => { if (!open) setPaymentReview(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review payment</DialogTitle>
            <DialogDescription>{paymentReview?.id} · {paymentReview?.customer} · Sample payment</DialogDescription>
          </DialogHeader>
          {paymentReview && (
            <>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Amount awaiting verification</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{money(paymentReview.pendingPayment)}</p>
                <p className="mt-1 text-xs text-muted-foreground">Verified payments: {money(paymentReview.paid)}</p>
              </div>
              <div className="flex min-h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background px-4 py-6 text-center">
                <Wallet aria-hidden="true" className="mb-2 size-5 text-muted-foreground" />
                <p className="text-sm font-medium">Proof of payment</p>
                <p className="mt-1 text-xs text-muted-foreground">No attachment in this sample record.</p>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">Preview only</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled><X className="size-4" />Reject</Button>
                  <Button size="sm" disabled><Check className="size-4" />Verify payment</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selected?.event}</DialogTitle><DialogDescription>{selected?.id} · Sample booking</DialogDescription></DialogHeader>
          {selected && (
            <dl className="grid grid-cols-2 gap-x-5 gap-y-5 border-t border-border pt-5">
              {[
                ["Customer", selected.customer], ["Email", selected.email],
                ["Service", selected.service], ["Location", selected.location],
                ...(selected.serviceSchedules
                  ? selected.serviceSchedules.flatMap((schedule) => [
                    [`${schedule.service} schedule`, `${scheduleDate(schedule)} · ${schedule.time}`],
                    [`${schedule.service} guests`, schedule.guests],
                  ])
                  : [["Event date", dateLabel(selected.date)], ["Time", selected.time], ["Guests", selected.guests]]),
                ["Status", selected.status],
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


