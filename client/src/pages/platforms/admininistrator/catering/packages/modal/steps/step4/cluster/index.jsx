import { capitalize } from "lodash";
import { useMemo } from "react";
import Menu from "./menu";
import { Badge } from "@/components/ui/badge";
import { ListChecks, Utensils } from "lucide-react";
import LimitInput from "./limitInput";
const Cluster = ({
  title = "",
  subtitle = "",
  targetPax = 0,
  icon,
  menus = [],
  setDatas = () => {},
}) => {
  const groupedByCategories = useMemo(() => {
    return menus.reduce((acc, curr) => {
      const key = curr.category?._id;
      const index = acc.findIndex(({ _id }) => _id === key);
      if (index > -1) {
        acc[index] = {
          ...acc[index],
          menus: [curr, ...acc[index].menus],
        };
      } else {
        acc.push({ ...curr.category, menus: [curr] });
      }
      return acc;
    }, []);
  }, [menus]);

  return (
    <section className=" border border-border bg-card shadow-sm rounded-sm">
      <div className="sticky top-0 rounded-t-md z-30 bg-background  grid gap-3 border-b  px-4 py-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            {icon}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold leading-5 text-foreground">
              {title}
            </p>
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Badge variant="secondary" className="rounded-full px-2.5 py-1">
            <ListChecks className="mr-1 size-3.5" />
            {menus.length} {menus.length === 1 ? "menu" : "menus"}
          </Badge>
          <Badge variant="outline" className="rounded-full px-2.5 py-1">
            {groupedByCategories.length}{" "}
            {groupedByCategories.length === 1 ? "category" : "categories"}
          </Badge>
        </div>
      </div>

      {menus.length === 0 ? (
        <div className="flex min-h-40 flex-col items-center justify-center gap-3 px-4 py-8 text-center">
          <div className="flex size-11 items-center justify-center rounded-md border border-dashed bg-muted/30 text-muted-foreground">
            <Utensils className="size-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{emptyTitle}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {emptyDescription}
            </p>
          </div>
        </div>
      ) : (
        <div className="  p-3">
          <div className="space-y-2.5">
            {groupedByCategories.map((category, pIdx) => (
              <div
                key={pIdx}
                className=" rounded-md border border-border bg-background"
              >
                <div className="sticky  top-16 z-20 grid gap-3 rounded-t-md border-b bg-muted/90 px-3 py-2 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {capitalize(category.name)}
                    </p>
                    <Badge
                      variant="outline"
                      className="shrink-0 rounded-full px-2 py-0.5 text-[11px]"
                    >
                      {category.menus.length}{" "}
                      {category.menus.length === 1 ? "menu" : "menus"}
                    </Badge>
                  </div>

                  <LimitInput label="Customer can select" />

                  <span className="hidden lg:block" />
                </div>

                <div className="divide-y">
                  {category.menus.map((menu, idx) => {
                    return <Menu menu={menu} key={idx} targetPax={targetPax} />;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default Cluster;
