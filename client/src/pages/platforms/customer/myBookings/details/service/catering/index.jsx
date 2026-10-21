import { Check, UtensilsCrossed } from "lucide-react";
import InclusionDetails from "../inclusions";
import { Section } from "../../components";

const CateringDetails = ({ booking }) => {
  const catering = booking?.catering;
  const item = catering?.item || {};
  const inclusions = catering?.inclusions || item?.inclusions || [];

  return (
    <Section
      title={item?.name || "Catering package"}
      icon={UtensilsCrossed}
      badge="Catering"
    >
      <div className="grid gap-x-7 gap-y-3 sm:grid-cols-2">
        <MenuList title="Main dishes" items={catering?.mainDishes || []} />

        <MenuList title="Side dishes" items={catering?.sideDishes || []} />
      </div>

      <div className="mt-3 border-t pt-3">
        <InclusionDetails items={inclusions} />
      </div>
    </Section>
  );
};

export default CateringDetails;

const MenuList = ({ title, items = [] }) => {
  return (
    <div className="min-w-0 overflow-hidden rounded-md border bg-background">
      <div className="flex items-center justify-between gap-2 border-b bg-muted/30 px-2.5 py-1.5">
        <p className="text-xs font-semibold">{title}</p>

        <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
          {items.length} item
          {items.length === 1 ? "" : "s"}
        </span>
      </div>

      {items.length > 0 ? (
        <div className="px-2">
          {items.map(({ menu: item }, index) => (
            <div
              key={item?._id || item?.name || index}
              className="flex min-w-0 items-start gap-2 border-b py-1.5 last:border-b-0"
            >
              <Check className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />

              <div className="min-w-0">
                <p className="text-xs font-medium">
                  {item?.name || "Menu item"}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="px-2.5 py-2 text-xs text-muted-foreground">
          No items selected.
        </p>
      )}
    </div>
  );
};
