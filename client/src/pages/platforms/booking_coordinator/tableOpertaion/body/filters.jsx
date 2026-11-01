import {
  ChevronDown,
  Search,
  SlidersHorizontal,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PAYMENT_OPTIONS } from "../constant";
import { getPaymentLabel, getStatusLabel } from "../utils";

const Filters = ({
  query,
  service,
  setService,
  setQuery,
  payment,
  setPayment,
  setPage,
  resetFilters,
  status,
}) => {
  const hasFilters = Boolean(service || query);
  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
      <div role="group" className="flex min-w-0 items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center rounded-lg border border-border bg-card shadow-xs transition-colors focus-within:border-primary/40">
          <div className="relative min-w-0 flex-1 sm:w-72 sm:flex-none">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search customer or reference..."
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              className="h-9 rounded-l-lg rounded-r-none border-0 bg-transparent pr-7 pl-8 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30 md:text-sm"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  setPage(1);
                }}
                className="absolute top-1/2 right-1 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
          <span aria-hidden="true" className="h-5 w-px shrink-0 bg-border" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={`h-9 shrink-0 gap-2 rounded-l-none rounded-r-lg px-3 text-sm font-medium hover:bg-muted/50 data-[state=open]:bg-muted/50 ${service === "All services" ? "text-muted-foreground" : "bg-primary/5 text-primary"}`}
              >
                <SlidersHorizontal aria-hidden="true" className="size-3.5" />
                {service}
                <ChevronDown
                  aria-hidden="true"
                  className="size-3.5 opacity-60"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={6}
              className="w-56 rounded-lg p-1.5"
            >
              <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Filter by service
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={service}
                onValueChange={(value) => {
                  setService(value);
                  setPage(1);
                }}
              >
                {["All services", "Catering", "Venue", "Catering + Venue"].map(
                  (option) => (
                    <DropdownMenuRadioItem
                      key={option}
                      value={option}
                      className="cursor-pointer rounded-md py-2 text-sm data-[state=checked]:bg-primary/5 data-[state=checked]:text-primary"
                    >
                      {option}
                    </DropdownMenuRadioItem>
                  ),
                )}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 text-muted-foreground"
            onClick={resetFilters}
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`ml-auto h-9 gap-2 rounded-lg text-sm shadow-xs ${payment === "all" ? "border-border bg-card text-muted-foreground" : "border-primary/30 bg-primary/5 text-primary"}`}
          >
            <Wallet aria-hidden="true" className="size-4" />
            {getPaymentLabel(payment)}
            <ChevronDown aria-hidden="true" className="size-3.5 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 rounded-lg">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Payment · {getStatusLabel(status)}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={payment}
            onValueChange={(value) => {
              setPayment(value);
              setPage(1);
            }}
          >
            {PAYMENT_OPTIONS.map((option) => (
              <DropdownMenuRadioItem
                key={option.value}
                value={option.value}
                className="cursor-pointer py-2 text-sm"
              >
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Filters;
