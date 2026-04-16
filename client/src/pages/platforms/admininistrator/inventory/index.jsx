import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Eye, PackagePlus, Pencil, Search, Trash2 } from "lucide-react";
import { capitalize } from "lodash";

const typeOptions = [
  { label: "Ingredient", value: "ingredient" },
  { label: "Resell", value: "resell" },
];

const categoryOptions = [
  { label: "Meat", value: "meat" },
  { label: "Vegetable", value: "vegetable" },
  { label: "Seafood", value: "seafood" },
  { label: "Grain", value: "grain" },
  { label: "Dairy", value: "dairy" },
  { label: "Condiment", value: "condiment" },
  { label: "Beverage", value: "beverage" },
  { label: "Snack", value: "snack" },
  { label: "Other", value: "other" },
];

const measurementOptions = [
  { label: "Weight", value: "weight", unit: "g" },
  { label: "Volume", value: "volume", unit: "ml" },
  { label: "Count", value: "count", unit: "pcs" },
];

const unitMap = {
  weight: "g",
  volume: "ml",
  count: "pcs",
};

const sampleInventory = [
  {
    _id: "item-1",
    name: "Chicken Breast",
    type: "ingredient",
    category: "meat",
    measurement: "weight",
    baseUnit: "g",
    currentStock: 6300,
    description: "Prepared for marinated meals and rice bowls.",
  },
  {
    _id: "item-2",
    name: "Cooking Oil",
    type: "ingredient",
    category: "condiment",
    measurement: "volume",
    baseUnit: "ml",
    currentStock: 2400,
    description: "Daily frying and saute inventory.",
  },
  {
    _id: "item-3",
    name: "Soft Drinks Can",
    type: "resell",
    category: "beverage",
    measurement: "count",
    baseUnit: "pcs",
    currentStock: 28,
    description: "Display chiller stock for walk-in customers.",
  },
  {
    _id: "item-4",
    name: "Garlic",
    type: "ingredient",
    category: "vegetable",
    measurement: "weight",
    baseUnit: "g",
    currentStock: 900,
    description: "Fresh aromatics for sauces and toppings.",
  },
  {
    _id: "item-5",
    name: "Rice Pack",
    type: "resell",
    category: "grain",
    measurement: "count",
    baseUnit: "pcs",
    currentStock: 12,
    description: "Take-out add-on rice portions.",
  },
];

const emptyForm = {
  _id: "",
  name: "",
  type: "ingredient",
  category: "other",
  measurement: "weight",
  baseUnit: "g",
  currentStock: "",
  description: "",
};

const buildPayload = (form) => ({
  ...form,
  currentStock: Number(form.currentStock) || 0,
  baseUnit: unitMap[form.measurement],
});

const getStockStatus = (item) => {
  const stock = Number(item.currentStock) || 0;

  if (item.measurement === "count") {
    if (stock <= 10) return "critical";
    if (stock <= 30) return "low";
    return "healthy";
  }

  if (stock <= 1000) return "critical";
  if (stock <= 3000) return "low";
  return "healthy";
};

const statusClasses = {
  healthy:
    "border-[color:color-mix(in_srgb,var(--color-chart-2)_35%,white)] bg-[color:color-mix(in_srgb,var(--color-chart-2)_14%,white)] text-[color:color-mix(in_srgb,var(--color-chart-4)_78%,black)]",
  low: "border-accent/40 bg-accent/15 text-accent-foreground",
  critical: "border-destructive/30 bg-destructive/10 text-destructive",
};

const Inventory = () => {
  const [items, setItems] = useState(sampleInventory);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [measurementFilter, setMeasurementFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("create");
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!modalOpen) {
      setForm(emptyForm);
      setErrors({});
      return;
    }

    if (selected) {
      setForm({
        _id: selected._id,
        name: selected.name || "",
        type: selected.type || "ingredient",
        category: selected.category || "other",
        measurement: selected.measurement || "weight",
        baseUnit: selected.baseUnit || unitMap[selected.measurement] || "g",
        currentStock: selected.currentStock ?? "",
        description: selected.description || "",
      });
      return;
    }

    setForm(emptyForm);
  }, [modalOpen, selected]);

  const filteredItems = items.filter((item) => {
    const keyword = search.trim().toLowerCase();
    const matchesSearch =
      !keyword ||
      [
        item.name,
        item.type,
        item.category,
        item.measurement,
        item.description,
        item.baseUnit,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword);

    const matchesType = typeFilter === "all" || item.type === typeFilter;
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    const matchesMeasurement =
      measurementFilter === "all" || item.measurement === measurementFilter;

    const status = getStockStatus(item);
    const matchesStock = stockFilter === "all" || stockFilter === status;

    return (
      matchesSearch &&
      matchesType &&
      matchesCategory &&
      matchesMeasurement &&
      matchesStock
    );
  });

  const openCreateModal = () => {
    setSelected(null);
    setMode("create");
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setSelected(item);
    setMode("edit");
    setModalOpen(true);
  };

  const openViewModal = (item) => {
    setSelected(item);
    setMode("view");
    setModalOpen(true);
  };

  const openDeleteModal = (item) => {
    setSelected(item);
    setDeleteOpen(true);
  };

  const handleFieldChange = (key, value) => {
    setForm((current) => {
      const next = {
        ...current,
        [key]: value,
      };

      if (key === "measurement") {
        next.baseUnit = unitMap[value];
      }

      return next;
    });

    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = "Item name is required.";
    if (!form.type) nextErrors.type = "Type is required.";
    if (!form.category) nextErrors.category = "Category is required.";
    if (!form.measurement) nextErrors.measurement = "Measurement is required.";

    if (form.currentStock === "" || Number(form.currentStock) < 0) {
      nextErrors.currentStock = "Current stock must be 0 or higher.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (mode === "view") {
      setModalOpen(false);
      return;
    }

    if (!validateForm()) return;

    const payload = buildPayload(form);

    if (mode === "create") {
      setItems((current) => [
        {
          ...payload,
          _id: `item-${Date.now()}`,
        },
        ...current,
      ]);
    }

    if (mode === "edit") {
      setItems((current) =>
        current.map((item) => (item._id === payload._id ? payload : item)),
      );
    }

    setModalOpen(false);
  };

  const handleDelete = () => {
    if (!selected?._id) return;

    setItems((current) => current.filter((item) => item._id !== selected._id));
    setDeleteOpen(false);
    setSelected(null);
  };

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setMeasurementFilter("all");
    setStockFilter("all");
  };

  const modalTitle =
    mode === "create"
      ? "Add Inventory Item"
      : mode === "edit"
        ? "Edit Inventory Item"
        : "Inventory Details";

  const modalDescription =
    mode === "view"
      ? "Review the selected inventory record and stock information."
      : "Manage your inventory records based on the Item model from the backend.";

  return (
    <>
      <div className="bg-background p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <Card className="border-border bg-card py-6 shadow-sm">
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <CardTitle className="text-2xl text-foreground">
                    Inventory List
                  </CardTitle>
                  <CardDescription>
                    Search items and narrow results by type, category,
                    measurement, and stock condition.
                  </CardDescription>
                </div>
                <Button onClick={openCreateModal} className="lg:self-start">
                  <PackagePlus className="h-4 w-4" />
                  New Inventory
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.6fr_repeat(4,minmax(0,1fr))]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search inventory item..."
                    className="pl-9"
                    type="search"
                  />
                </div>

                <FilterSelect
                  value={typeFilter}
                  onValueChange={setTypeFilter}
                  placeholder="Type"
                  options={typeOptions}
                  allLabel="All types"
                />
                <FilterSelect
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                  placeholder="Category"
                  options={categoryOptions}
                  allLabel="All categories"
                />
                <FilterSelect
                  value={measurementFilter}
                  onValueChange={setMeasurementFilter}
                  placeholder="Measurement"
                  options={measurementOptions}
                  allLabel="All measurements"
                />
                <FilterSelect
                  value={stockFilter}
                  onValueChange={setStockFilter}
                  placeholder="Stock status"
                  options={[
                    { label: "Healthy", value: "healthy" },
                    { label: "Low", value: "low" },
                    { label: "Critical", value: "critical" },
                  ]}
                  allLabel="All stock levels"
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="overflow-hidden rounded-[5px] border border-border bg-card">
                <Table>
                  <TableHeader className="bg-muted/70">
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Measurement</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length ? (
                      filteredItems.map((item) => {
                        const status = getStockStatus(item);

                        return (
                          <TableRow key={item._id} className="bg-card">
                            <TableCell className="whitespace-normal">
                              <div className="space-y-1">
                                <p className="font-semibold text-foreground">
                                  {capitalize(item.name)}
                                </p>
                                <p className="max-w-xs text-xs leading-5 text-muted-foreground">
                                  {item.description ||
                                    "No description provided."}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="rounded-full border-accent/35 bg-accent/12 text-accent-foreground"
                              >
                                {capitalize(item.type)}
                              </Badge>
                            </TableCell>
                            <TableCell>{capitalize(item.category)}</TableCell>
                            <TableCell>
                              {capitalize(item.measurement)}
                            </TableCell>
                            <TableCell className="font-medium text-foreground">
                              {formatStock(item.currentStock, item.baseUnit)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`rounded-full ${statusClasses[status]}`}
                              >
                                {capitalize(status)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <ActionButton
                                  title="View"
                                  icon={Eye}
                                  onClick={() => openViewModal(item)}
                                />
                                <ActionButton
                                  title="Edit"
                                  icon={Pencil}
                                  onClick={() => openEditModal(item)}
                                />
                                <ActionButton
                                  title="Delete"
                                  icon={Trash2}
                                  destructive
                                  onClick={() => openDeleteModal(item)}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="py-14 text-center">
                          <div className="space-y-2">
                            <p className="text-base font-semibold text-foreground">
                              No inventory items found
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Try another keyword or reset the filters to show
                              all records.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto border-border bg-card sm:max-w-2xl">
          <DialogHeader className="gap-2">
            <DialogTitle className="text-2xl text-foreground">
              {modalTitle}
            </DialogTitle>
            <DialogDescription>{modalDescription}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-2 md:grid-cols-2">
            <FormField
              label="Item Name"
              error={errors.name}
              content={
                <Input
                  value={form.name}
                  onChange={(event) =>
                    handleFieldChange("name", event.target.value)
                  }
                  placeholder="Enter inventory name"
                  disabled={mode === "view"}
                />
              }
            />

            <FormField
              label="Current Stock"
              error={errors.currentStock}
              content={
                <Input
                  type="number"
                  min="0"
                  value={form.currentStock}
                  onChange={(event) =>
                    handleFieldChange("currentStock", event.target.value)
                  }
                  placeholder="0"
                  disabled={mode === "view"}
                />
              }
            />

            <FormField
              label="Type"
              error={errors.type}
              content={
                <Select
                  value={form.type}
                  onValueChange={(value) => handleFieldChange("type", value)}
                  disabled={mode === "view"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
            />

            <FormField
              label="Category"
              error={errors.category}
              content={
                <Select
                  value={form.category}
                  onValueChange={(value) =>
                    handleFieldChange("category", value)
                  }
                  disabled={mode === "view"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
            />

            <FormField
              label="Measurement"
              error={errors.measurement}
              content={
                <Select
                  value={form.measurement}
                  onValueChange={(value) =>
                    handleFieldChange("measurement", value)
                  }
                  disabled={mode === "view"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select measurement" />
                  </SelectTrigger>
                  <SelectContent>
                    {measurementOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
            />

            <FormField
              label="Base Unit"
              content={
                <Input
                  value={form.baseUnit}
                  disabled
                  className="bg-muted text-muted-foreground"
                />
              }
            />

            <div className="md:col-span-2">
              <FormField
                label="Description"
                content={
                  <Textarea
                    value={form.description}
                    onChange={(event) =>
                      handleFieldChange("description", event.target.value)
                    }
                    placeholder="Add item description or internal notes"
                    rows={5}
                    disabled={mode === "view"}
                  />
                }
              />
            </div>
          </div>

          <div className="rounded-[22px] border border-border bg-muted/55 p-4">
            <p className="text-sm font-semibold text-foreground">
              Live Preview
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge className="rounded-full bg-card text-foreground">
                {capitalize(form.type || "ingredient")}
              </Badge>
              <Badge variant="outline" className="rounded-full bg-card">
                {capitalize(form.category || "other")}
              </Badge>
              <Badge variant="outline" className="rounded-full bg-card">
                {capitalize(form.measurement || "weight")}
              </Badge>
              <Badge variant="outline" className="rounded-full bg-card">
                {formatStock(form.currentStock || 0, form.baseUnit || "g")}
              </Badge>
            </div>
          </div>

          <DialogFooter className="mt-2 gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode !== "view" && (
              <Button onClick={handleSubmit}>
                {mode === "create" ? "Save Item" : "Update Item"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="border-border bg-card shadow-[0_28px_90px_rgba(59,36,24,0.18)]">
          <AlertDialogHeader className="gap-3">
            <AlertDialogTitle className="text-foreground">
              Delete inventory item?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <span className="block">
                You are about to remove{" "}
                <span className="font-semibold text-red-600">
                  {selected?.name || "this item"}
                </span>{" "}
                from the inventory list.
              </span>
              <span className="block rounded-2xl border border-border bg-muted px-4 py-3 text-left text-foreground">
                This demo page removes the item from the current list view right
                away. You can later wire this action to your backend destroy
                endpoint.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const FilterSelect = ({
  value,
  onValueChange,
  placeholder,
  options,
  allLabel,
}) => (
  <Select value={value} onValueChange={onValueChange}>
    <SelectTrigger className="w-full">
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">{allLabel}</SelectItem>
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

const ActionButton = ({ title, icon: Icon, destructive = false, onClick }) => (
  <Button
    type="button"
    size="icon"
    variant="outline"
    onClick={onClick}
    className={
      destructive
        ? "border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        : "hover:bg-accent/15 hover:text-accent-foreground"
    }
  >
    <Icon className="h-4 w-4" />
    <span className="sr-only">{title}</span>
  </Button>
);

const FormField = ({ label, content, error = "" }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    {content}
    {error ? <p className="text-xs text-destructive">{error}</p> : null}
  </div>
);

const formatStock = (stock, unit) => {
  const value = Number(stock) || 0;
  return `${new Intl.NumberFormat().format(value)} ${unit}`;
};

export default Inventory;
