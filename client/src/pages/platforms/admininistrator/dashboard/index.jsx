import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import {
  GET_INCOMING_DELIVERIES,
  GET_INVENTORY_OVERVIEW,
  GET_SUMMARY,
  GET_TOP_SELLING_ITEMS,
  GET_UPCOMING_BOOKINGS,
} from "@/services/redux/slices/dashboard";
import { getCustomDateRange, getPeriodRange } from "./data";

import Summary from "./summary";
import Overview from "./overview";
import Upcoming from "./upcoming";
import TopSelling from "./topSelling";
import Inventory from "./inventory";
import IncomingDeliveries from "./incomingDeliveries";
import Header from "./header";

const Dashboard = () => {
  const [period, setPeriod] = useState("month");
  const [now] = useState(() => new Date());
  const [customDate, setCustomDate] = useState(() => {
    const initialRange = getPeriodRange("month", now);
    return { from: initialRange.start, to: initialRange.end };
  });
  const [customRange, setCustomRange] = useState(() =>
    getCustomDateRange(customDate),
  );
  const dispatch = useDispatch();
  const { summary, errors = {} } = useSelector((state) => state.dashboard);

  const range = useMemo(
    () => (period === "custom" ? customRange : getPeriodRange(period, now)),
    [period, customRange, now],
  );

  const { startDate, endDate } = range;

  const handlePeriodChange = (value) => {
    if (value === "custom") {
      const nextDate = { from: range.start, to: range.end };
      setCustomDate(nextDate);
      setCustomRange(getCustomDateRange(nextDate));
    }
    setPeriod(value);
  };

  const handleCustomDateChange = (nextDate) => {
    setCustomDate(nextDate);
    const nextRange = getCustomDateRange(nextDate);
    if (nextRange) setCustomRange(nextRange);
  };

  useEffect(() => {
    const requests = [
      dispatch(GET_SUMMARY({ startDate, endDate })),
      dispatch(GET_TOP_SELLING_ITEMS({ startDate, endDate })),
    ];
    return () => requests.forEach((request) => request.abort());
  }, [dispatch, startDate, endDate]);

  useEffect(() => {
    const requests = [
      dispatch(GET_UPCOMING_BOOKINGS()),
      dispatch(GET_INVENTORY_OVERVIEW()),
      dispatch(GET_INCOMING_DELIVERIES()),
    ];
    return () => requests.forEach((request) => request.abort());
  }, [dispatch]);

  const data = {
    label: range.label,
    bookings: Number(summary?.verifiedPayments ?? 0),
    orders: Number(summary?.posTransactions ?? 0),
    outstanding: Number(summary?.outstandingBalance ?? 0),
  };

  return (
    <div className="min-h-full bg-background p-4 text-foreground md:p-6 xl:p-7">
      <div className="mx-auto max-w-[1440px] space-y-5">
        <Header
          data={data}
          period={period}
          handlePeriodChange={handlePeriodChange}
          handleCustomDateChange={handleCustomDateChange}
          customDate={customDate}
        />

        {errors.summary && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs text-destructive"
          >
            <span>Could not load the summary: {errors.summary}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(GET_SUMMARY({ startDate, endDate }))}
            >
              Retry
            </Button>
          </div>
        )}

        <Summary errors={errors} />
        <Overview range={range} errors={errors} />

        <div className="grid items-stretch gap-5 lg:grid-cols-12">
          <Upcoming errors={errors} />
          <TopSelling
            startDate={startDate}
            endDate={endDate}
            errors={errors}
            label={data?.label}
          />
        </div>
        <div className="grid items-stretch gap-5 lg:grid-cols-2">
          <Inventory errors={errors} />

          <IncomingDeliveries errors={errors} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
