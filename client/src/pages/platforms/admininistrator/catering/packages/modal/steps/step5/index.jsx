import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { capitalize } from "lodash";
import {
  BriefcaseBusiness,
  Check,
  PackageCheck,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

const serviceOptions = [
  { _id: "event-styling", name: "Event styling" },
  { _id: "food-attendants", name: "Food attendants" },
  { _id: "buffet-setup", name: "Buffet setup" },
  { _id: "ingress-egress", name: "Ingress and egress" },
  { _id: "table-skirtings", name: "Table skirtings" },
];

const Step5 = () => {
  const { collections: equipment = [] } = useSelector(
    ({ equipment }) => equipment,
  );

  return (
    <div className="grid max-h-[64vh] gap-2 overflow-y-auto pr-1 md:max-h-none md:overflow-visible md:pr-0 lg:grid-cols-2">
      <InclusionSection
        title="Equipment"
        subtitle="Select equipment included in this package."
        addTitle="Available equipment"
        detailsTitle="Included equipment"
        icon={<PackageCheck className="size-4" />}
        items={equipment}
        type="equipment"
        searchPlaceholder="Search equipment"
        emptyTitle="No equipment found"
      />

      <InclusionSection
        title="Services"
        subtitle="Select services included in this package."
        addTitle="Available services"
        detailsTitle="Included services"
        icon={<BriefcaseBusiness className="size-4" />}
        items={serviceOptions}
        type="service"
        searchPlaceholder="Search services"
        emptyTitle="No services found"
      />
    </div>
  );
};

export default Step5;

const InclusionSection = ({
  title,
  subtitle,
  addTitle,
  detailsTitle,
  icon,
  items = [],
  type = "equipment",
  searchPlaceholder = "Search",
  emptyTitle = "No items found",
}) => {
  const [search, setSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);

  const selectedIds = useMemo(
    () => new Set(selectedItems.map(({ _id }) => _id)),
    [selectedItems],
  );

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return items;

    return items.filter((item) =>
      String(item?.name || "")
        .toLowerCase()
        .includes(keyword),
    );
  }, [items, search]);

  const toggleItem = (item) => {
    setSelectedItems((prev) => {
      if (prev.some(({ _id }) => _id === item?._id)) {
        return prev.filter(({ _id }) => _id !== item?._id);
      }
      return [
        {
          ...item,
          qty: "",
          duration: "",
        },
        ...prev,
      ];
    });
  };

  const updateSelectedItem = (itemId, key, value) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item?._id === itemId
          ? {
              ...item,
              [key]: value,
            }
          : item,
      ),
    );
  };

  return (
    <section className="rounded-[7px] border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b bg-muted/20 px-2.5 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-4 text-foreground">
              {title}
            </p>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              {subtitle}
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="shrink-0 rounded-full">
          {selectedItems.length}
        </Badge>
      </div>

      <div className="space-y-2 p-2">
        <div className="rounded-md border border-border">
          <div className="grid gap-2 border-b bg-muted/20 p-2 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
            <p className="text-xs font-semibold text-foreground">{addTitle}</p>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1.5 size-4 text-muted-foreground" />
              <Input
                className="h-7 pl-8 text-xs"
                value={search}
                onChange={({ target }) => setSearch(target.value)}
                placeholder={searchPlaceholder}
              />
            </div>
          </div>

          <div className="max-h-28 overflow-y-auto">
            {filteredItems.length > 0 ? (
              <div className="divide-y">
                {filteredItems.map((item) => {
                  const isSelected = selectedIds.has(item?._id);

                  return (
                    <button
                      key={item?._id || item?.name}
                      type="button"
                      onClick={() => toggleItem(item)}
                      className={`flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left transition-colors ${
                        isSelected
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted/30"
                      }`}
                    >
                      <span className="min-w-0 truncate text-xs font-medium">
                        {capitalize(item?.name || "")}
                      </span>
                      {isSelected ? (
                        <Check className="size-3.5 shrink-0" />
                      ) : (
                        <Plus className="size-3.5 shrink-0 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <EmptyState title={emptyTitle} />
            )}
          </div>
        </div>

        <div className="rounded-md border border-border bg-muted/10">
          <div className="flex items-center justify-between gap-2 border-b px-2.5 py-2">
            <div>
              <p className="text-xs font-semibold text-foreground">
                {detailsTitle}
              </p>
            </div>
            <Badge variant="outline" className="rounded-full">
              {selectedItems.length}
            </Badge>
          </div>

          <div className="max-h-52 overflow-y-auto p-2">
            {selectedItems.length > 0 ? (
              <div className="space-y-1.5">
                {selectedItems.map((item) => (
                  <div
                    key={`${item?._id}-selected`}
                    className="grid gap-2 rounded-md border border-border bg-background p-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-foreground">
                        {capitalize(item?.name || "")}
                      </p>

                      <div
                        className={`mt-1.5 grid gap-2 ${
                          type === "service"
                            ? "grid-cols-2"
                            : "grid-cols-[minmax(0,9rem)]"
                        }`}
                      >
                        {type === "service" && (
                          <Field
                            label="Duration"
                            value={item.duration}
                            placeholder="e.g. 4 hrs"
                            onChange={(value) =>
                              updateSelectedItem(item?._id, "duration", value)
                            }
                          />
                        )}
                        <Field
                          label={type === "service" ? "Qty" : "Quantity"}
                          value={item.qty}
                          placeholder="0"
                          type="number"
                          onChange={(value) =>
                            updateSelectedItem(item?._id, "qty", value)
                          }
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="size-7 justify-self-end text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Remove ${item?.name || title}`}
                      onClick={() => toggleItem(item)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title={`No ${title.toLowerCase()} included`} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const Field = ({
  label,
  value,
  placeholder = "",
  type = "text",
  onChange = () => {},
}) => (
  <label className="min-w-0">
    <span className="mb-1 block text-[11px] font-medium text-muted-foreground">
      {label}
    </span>
    <Input
      className="h-7 text-xs"
      min={type === "number" ? "0" : undefined}
      placeholder={placeholder}
      type={type}
      value={value}
      onChange={({ target }) => onChange(target.value)}
    />
  </label>
);

const EmptyState = ({ title }) => (
  <div className="flex min-h-20 flex-col items-center justify-center gap-2 px-3 py-4 text-center">
    <Search className="size-5 text-muted-foreground" />
    <p className="text-xs font-medium text-muted-foreground">{title}</p>
  </div>
);
