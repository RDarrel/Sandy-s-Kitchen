import { useEffect, useState } from "react";
import { endOfMonth, format, isValid, startOfMonth } from "date-fns";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DatePicker from "@/components/shared/datePicker";
import { useDispatch } from "react-redux";
import { GET_PAYMENT_REPORT } from "@/services/redux/slices/report/booking";

const Header = ({ setPage = () => {} }) => {
  const [date, setDate] = useState(() => {
    const today = new Date();
    return { from: startOfMonth(today), to: endOfMonth(today) };
  });
  const dispatch = useDispatch();
  const startDate = isValid(date?.from) ? format(date.from, "yyyy-MM-dd") : "";
  const endDate = isValid(date?.to) ? format(date.to, "yyyy-MM-dd") : "";

  useEffect(() => {
    if (!startDate || !endDate || startDate > endDate) return;
    setPage(1);
    dispatch(GET_PAYMENT_REPORT({ startDate, endDate }));
  }, [dispatch, startDate, endDate]);

  return (
    <CardHeader className="gap-4 sm:flex sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1.5">
        <CardTitle className="text-2xl text-foreground">
          Booking Payments Report
        </CardTitle>
        <CardDescription>
          View payment collections, statuses, and transaction history for
          bookings.
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
        <DatePicker
          mode="range"
          date={date}
          setDate={setDate}
          highlightToday={false}
        />
      </div>
    </CardHeader>
  );
};

export default Header;
