import { CalendarDays, MapPin, Package, Wallet } from "lucide-react";
import { money } from "./data";

function Metric({ title, value, detail, description, icon, gold, featured, truncateValue }) {
  const Icon = icon;

  return (
    <div className={`relative flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card px-4 pb-3 pt-3.5 shadow-sm ${featured ? "border-primary/25" : "border-border"}`}>
      <span
        aria-hidden="true"
        className={`absolute left-4 top-0 h-0.5 w-8 rounded-b-full ${gold ? "bg-chart-3/70" : "bg-primary/70"}`}
      />
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-muted-foreground">{title}</p>
          {detail && <p className="mt-0.5 text-[11px] text-muted-foreground/80">{detail}</p>}
        </div>
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${gold ? "bg-chart-3/10 text-chart-3" : "bg-primary/8 text-primary"}`}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p title={truncateValue ? value : undefined} className={`mt-2.5 text-[28px] font-semibold leading-tight tracking-tight tabular-nums ${truncateValue ? "truncate" : "break-words"}`}>{value}</p>
      <div className="mt-auto flex min-h-8 items-center justify-between gap-3 pt-2">
        <p className="text-[11px] font-medium text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

const Summary = ({ data }) => (
  <section aria-label="Booking summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <Metric
      title="Total Bookings"
      value={data.total}
      detail="Bookings within the selected period"
      description="Confirmed, setup & completed"
      icon={CalendarDays}
      featured
    />
    <Metric
      title="Total Booking Value"
      value={money(data.value)}
      detail="Combined value of bookings"
      description={`${money(data.total ? Math.round(data.value / data.total) : 0)} average per booking`}
      icon={Wallet}
    />
    <Metric
      title="Most-Booked Package"
      value={data.packages[0]?.name ?? "No bookings"}
      truncateValue
      detail="Top package in the selected period"
      description={`${data.packages[0]?.bookings ?? 0} bookings · ${(data.packages[0]?.percentage ?? 0).toFixed(1)}% of total bookings`}
      icon={Package}
      gold
    />
    <Metric
      title="Most-Booked Venue"
      value={data.venues[0]?.name ?? "No bookings"}
      truncateValue
      detail="Top venue in the selected period"
      description={`${data.venues[0]?.bookings ?? 0} bookings · ${(data.venues[0]?.percentage ?? 0).toFixed(1)}% of total bookings`}
      icon={MapPin}
      gold
    />
  </section>
);

export default Summary;
