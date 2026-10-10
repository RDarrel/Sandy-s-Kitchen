import { cn } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal } from "lucide-react";
import DatePicker from "@/components/shared/datePicker";
import "./venue/style.css";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { BROWSE, SEARCH_VENUES } from "@/services/redux/slices/events/venues";
import { Formatter } from "@/services/utilities";

const GUEST_OPTIONS = [
  { label: "Any number of guests", value: " " },
  { label: "1–30 guests", value: "1_30" },
  { label: "31–50 guests", value: "31_50" },
  { label: "51–100 guests", value: "51_100" },
  { label: "101–150 guests", value: "101_150" },
  { label: "150+ guests", value: "150_plus" },
];

const BUDGET_OPTIONS = [
  { label: "Any budget", value: " " },
  { label: "Under ₱15,000", value: "under_15000" },
  { label: "₱15,000 – ₱30,000", value: "15000_30000" },
  { label: "₱30,000 – ₱50,000", value: "30000_50000" },
  { label: "₱50,000+", value: "50000_plus" },
];

const SORT_OPTIONS = [
  { label: "Default sorting", value: " " },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

const GUEST_RANGES = {
  "1_30": { minPax: 1, maxPax: 30 },
  "31_50": { minPax: 31, maxPax: 50 },
  "51_100": { minPax: 51, maxPax: 100 },
  "101_150": { minPax: 101, maxPax: 150 },
  "150_plus": { minPax: 150 },
};

const BUDGET_RANGES = {
  under_15000: {
    maxBudget: 14999,
  },
  "15000_30000": {
    minBudget: 15000,
    maxBudget: 30000,
  },
  "30000_50000": {
    minBudget: 30001,
    maxBudget: 50000,
  },
  "50000_plus": {
    minBudget: 50001,
  },
};

const Search = () => {
  const { auth } = useSelector(({ auth }) => auth);
  const [form, setForm] = useState({});
  const dispatch = useDispatch();

  const hasValue = (value) =>
    value !== undefined && value !== null && String(value).trim() !== "";

  const canSearch = Object.values(form).some(hasValue);

  const handleSearch = () => {
    if (!canSearch) return;

    const { budget, date, guests, sortBy, eventType } = form;

    dispatch(
      SEARCH_VENUES({
        ...(hasValue(budget) && BUDGET_RANGES[budget]),
        ...(hasValue(guests) && GUEST_RANGES[guests]),
        ...(hasValue(sortBy) && { sortBy }),
        ...(date && { date: Formatter.localDate(new Date(date)) }),
        ...(hasValue(eventType) && { eventType }),
      }),
    );
  };

  const handleReset = () => {
    dispatch(BROWSE());
    setForm({ date: null });
  };

  return (
    <div
      className={cn(
        `sticky hidden md:block w-60 self-start rounded-md border bg-card p-4 shadow-sm z-10 `,
        auth?._id ? "top-4" : "top-[88px]",
      )}
    >
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          <h3 className="font-semibold">Find Your Venue</h3>
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          Find the perfect venue for your event.
        </p>
      </div>

      <div className="space-y-4">
        {/* Number of Guests */}
        <div className="grid gap-2">
          <Label>Number of Guests</Label>

          <Select
            value={form?.guests || ""}
            onValueChange={(value) =>
              setForm((prev) => ({ ...prev, guests: value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select guests" />
            </SelectTrigger>

            <SelectContent>
              {GUEST_OPTIONS.map(({ label, value }, idx) => (
                <SelectItem value={value} key={idx}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Event Type */}
        <div className="grid gap-2">
          <Label>Event Type</Label>

          <Select
            value={form?.eventType || ""}
            onValueChange={(value) =>
              setForm((prev) => ({ ...prev, eventType: value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value=" ">All event types</SelectItem>
              <SelectItem value="Wedding">Wedding</SelectItem>
              <SelectItem value="Birthday Party">Birthday Party</SelectItem>
              <SelectItem value="Debut">Debut</SelectItem>
              <SelectItem value="Christening / Baptism">
                Christening / Baptism
              </SelectItem>
              <SelectItem value="Corporate Event">Corporate Event</SelectItem>
              <SelectItem value="Seminar / Training">
                Seminar / Training
              </SelectItem>
              <SelectItem value="Conference">Conference</SelectItem>
              <SelectItem value="Team Building">Team Building</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Budget */}
        <div className="grid gap-2">
          <Label>Budget</Label>

          <Select
            value={form?.budget || ""}
            onValueChange={(value) =>
              setForm((prev) => ({ ...prev, budget: value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select budget" />
            </SelectTrigger>

            <SelectContent>
              {BUDGET_OPTIONS.map(({ label, value }, idx) => (
                <SelectItem value={value} key={idx}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Event Date */}
        <div className="grid gap-2">
          <Label>When is your event?</Label>
          <DatePicker
            date={form?.date ?? null}
            setDate={(value) => setForm((prev) => ({ ...prev, date: value }))}
          />
        </div>

        <hr />

        {/* Sort By */}
        <div className="grid gap-2">
          <Label>Sort By</Label>

          <Select
            value={form?.sortBy || ""}
            onValueChange={(value) =>
              setForm((prev) => ({ ...prev, sortBy: value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sort venues by" />
            </SelectTrigger>

            <SelectContent>
              {SORT_OPTIONS.map(({ label, value }, idx) => (
                <SelectItem value={value} key={idx}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6">
        <div className="grid gap-2">
          <Button className="w-full" onClick={handleSearch}>
            Find Venues
          </Button>

          <Button variant="ghost" className="w-full" onClick={handleReset}>
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Search;
