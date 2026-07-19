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
    <div className="grid max-h-[64vh] gap-2 overflow-y-auto pr-1 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-track]:bg-transparent md:max-h-none md:overflow-visible md:pr-0 lg:grid-cols-2">
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
    <section className="flex h-full flex-col rounded-[7px] border border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/5 text-primary">
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
        <Badge variant="outline" className="shrink-0 rounded-full">
          {selectedItems.length} selected
        </Badge>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-2">
        <div className="shrink-0 overflow-hidden rounded-md border border-border bg-background">
          <div className="grid gap-2 border-b p-2 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
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
            <span className="hidden text-xs text-muted-foreground sm:block">
              {filteredItems.length} items
            </span>
          </div>

          <div className="h-24 overflow-y-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-track]:bg-transparent">
            {filteredItems.length > 0 ? (
              <div className="divide-y">
                {filteredItems.map((item) => {
                  const isSelected = selectedIds.has(item?._id);

                  return (
                    <button
                      key={item?._id || item?.name}
                      type="button"
                      onClick={() => toggleItem(item)}
                      className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition-colors ${
                        isSelected
                          ? "bg-primary/5 text-primary"
                          : "hover:bg-muted/25"
                      }`}
                    >
                      <span className="min-w-0 truncate text-xs font-medium">
                        {capitalize(item?.name || "")}
                      </span>
                      <span
                        className={`flex size-6 shrink-0 items-center justify-center rounded-md border ${
                          isSelected
                            ? "border-primary/20 bg-primary/10"
                            : "border-border bg-card"
                        }`}
                      >
                        {isSelected ? (
                          <Check className="size-3.5" />
                        ) : (
                          <Plus className="size-3.5 text-primary" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <EmptyState title={emptyTitle} />
            )}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-primary/25 bg-primary/5">
          <div className="flex items-center justify-between gap-2 border-b border-primary/20 bg-[color:color-mix(in_srgb,var(--color-primary)_8%,white)] px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-3" />
              </span>
              <p className="text-xs font-semibold text-foreground">
                {detailsTitle}
              </p>
            </div>
            <Badge variant="outline" className="rounded-full">
              {selectedItems.length}
            </Badge>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-track]:bg-transparent">
            {selectedItems.length > 0 ? (
              <div>
                <div
                  className={`sticky top-0 z-20 hidden border-b border-primary/15 bg-card px-3 py-1.5 text-[10px] font-medium uppercase text-muted-foreground shadow-sm sm:grid ${
                    type === "service"
                      ? "grid-cols-[minmax(0,1fr)_5.75rem_4.75rem_1.75rem]"
                      : "grid-cols-[minmax(0,1fr)_5rem_1.75rem]"
                  }`}
                >
                  <span>Name</span>
                  {type === "service" && <span>Duration</span>}
                  <span>{type === "service" ? "Qty" : "Quantity"}</span>
                  <span />
                </div>
                {selectedItems.map((item) => (
                  <div
                    key={`${item?._id}-selected`}
                    className={`grid gap-2 border-b border-primary/10 bg-card px-3 py-2.5 last:border-b-0 ${
                      type === "service"
                        ? "sm:grid-cols-[minmax(0,1fr)_5.75rem_4.75rem_auto] sm:items-center"
                        : "grid-cols-[minmax(0,1fr)_5rem_auto] items-center"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-foreground">
                        {capitalize(item?.name || "")}
                      </p>
                    </div>

                    {type === "service" && (
                      <Field
                        label="Duration"
                        value={item.duration}
                        placeholder="Duration"
                        onChange={(value) =>
                          updateSelectedItem(item?._id, "duration", value)
                        }
                      />
                    )}
                    <Field
                      label={"Quantity"}
                      value={item.qty}
                      placeholder={"Qty"}
                      type="number"
                      onChange={(value) =>
                        updateSelectedItem(item?._id, "qty", value)
                      }
                    />

                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="size-7 justify-self-end rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Remove ${item?.name || title}`}
                      onClick={() => toggleItem(item)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title={`No ${title.toLowerCase()} included`}
                className="h-full"
              />
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
    <span className="sr-only">{label}</span>
    <Input
      aria-label={label}
      className="h-7 rounded-md px-2 text-xs"
      min={type === "number" ? "0" : undefined}
      placeholder={placeholder}
      type={type}
      value={value}
      onChange={({ target }) => onChange(target.value)}
    />
  </label>
);

const EmptyState = ({ title, className = "" }) => (
  <div
    className={`flex min-h-20 flex-col items-center justify-center gap-2 px-3 py-4 text-center ${className}`}
  >
    <Search className="size-5 text-muted-foreground" />
    <p className="text-xs font-medium text-muted-foreground">{title}</p>
  </div>
);
