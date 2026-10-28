import { money } from "./data";

const panel = "min-w-0 rounded-2xl border border-border bg-card shadow-sm";

function RankingCard({ config, rows }) {
  const { icon: Icon, title, subtitle, label, tone, bar } = config;
  return (
    <section className={panel}>
      <div className="flex items-start justify-between gap-3 p-5">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tone}`}
          >
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-semibold sm:text-base">{title}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto px-5 pb-3">
        <table className="w-full min-w-[410px] text-left text-xs">
          <caption className="sr-only">
            {title}, ranked within the selected period
          </caption>
          <thead>
            <tr className="border-y border-border/60 bg-muted/35 text-muted-foreground">
              <th scope="col" className="w-9 py-2.5 pl-2 font-medium">
                #
              </th>
              <th scope="col" className="py-2.5 font-medium">
                {label}
              </th>
              <th scope="col" className="px-3 py-2.5 text-right font-medium">
                Units sold
              </th>
              <th scope="col" className="px-3 py-2.5 text-right font-medium">
                Sales
              </th>
              <th
                scope="col"
                className="w-28 py-2.5 pr-2 text-right font-medium"
                title="Percentage of POS sales in the selected period"
              >
                Sales share
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row._id}
                className="border-b border-border/45 last:border-0 hover:bg-muted/20"
              >
                <td className="py-3.5 pl-2">
                  <span
                    className={`flex size-5 items-center justify-center rounded-md text-[10px] font-semibold ${index === 0 ? tone : "text-muted-foreground"}`}
                  >
                    {index + 1}
                  </span>
                </td>
                <th scope="row" className="py-3.5 pr-2 font-medium">
                  {row.name}
                </th>
                <td className="px-3 py-3.5 text-right font-semibold tabular-nums">
                  {row.unitsSold}
                </td>
                <td className="whitespace-nowrap px-3 py-3.5 text-right text-muted-foreground tabular-nums">
                  {money(row.value)}
                </td>
                <td className="py-3.5 pr-2">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-[11px] tabular-nums">
                      {row.percentage.toFixed(1)}%
                    </span>
                    <div className="h-1.5 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${bar}`}
                        style={{ width: `${row.percentage}%` }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-6 text-center text-muted-foreground"
                >
                  No POS sales in the selected period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default RankingCard;
