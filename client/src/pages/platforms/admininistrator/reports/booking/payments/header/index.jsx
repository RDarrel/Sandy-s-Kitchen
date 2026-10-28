import { useEffect } from "react";
import { format, isValid } from "date-fns";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DatePicker from "@/components/shared/datePicker";
import { useDispatch } from "react-redux";
import { GET_PAYMENT_REPORT } from "@/services/redux/slices/report/booking";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Header = ({ setPage, date, setDate, frequency, setFrequency }) => {
  const dispatch = useDispatch();
  const startDate = isValid(date?.from) ? format(date.from, "yyyy-MM-dd") : "";
  const endDate = isValid(date?.to) ? format(date.to, "yyyy-MM-dd") : "";

  useEffect(() => {
    if (!startDate || !endDate || startDate > endDate) return;
    setPage(1);
    dispatch(GET_PAYMENT_REPORT({ startDate, endDate, frequency }));
  }, [dispatch, startDate, endDate, frequency, setPage]);

  return (
    <CardHeader className="gap-4 xl:flex xl:flex-row xl:items-center xl:justify-between">
      <div className="min-w-0 space-y-1.5">
        <CardTitle className="text-2xl text-foreground">
          Booking Transactions Report
        </CardTitle>
        <CardDescription>
          Track booking payments, refunds, and transaction history.
        </CardDescription>
      </div>
      <div className="flex min-w-0 flex-col gap-3 sm:ml-auto sm:flex-row sm:items-end">
        <div className="space-y-1.5">
          <p
            id="payment-report-frequency-label"
            className="text-xs font-medium text-muted-foreground"
          >
            Frequency
          </p>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger
              aria-labelledby="payment-report-frequency-label"
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
          aria-labelledby="payment-report-date-range-label"
        >
          <p
            id="payment-report-date-range-label"
            className="text-xs font-medium text-muted-foreground"
          >
            Report Period
          </p>
          <DatePicker
            mode="range"
            date={date}
            setDate={setDate}
            highlightToday={false}
            captionLayout="dropdown"
          />
        </div>
      </div>
    </CardHeader>
  );
};

export default Header;
