import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PackagePlus, Search } from "lucide-react";
import {
  categoryOptions,
  measurementOptions,
  stockOptions,
  typeOptions,
} from "./config";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import {
  BROWSE,
  FILTER,
  SEARCH,
  SetCREATE,
} from "@/services/redux/slices/inventory/inventoryItems";

const FilterSelect = ({
  value,
  onValueChange,
  placeholder,
  options = [],
  allLabel,
}) => (
  <Select value={value} onValueChange={onValueChange}>
    <SelectTrigger className="w-full">
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">{allLabel}</SelectItem>
      {options?.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

const InventoryHeader = () => {
  const { token, search } = useSelector(({ auth }) => auth);
  const { params } = useSelector(({ inventoryItems }) => inventoryItems);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(BROWSE({ token }));
  }, [dispatch, token]);
  return (
    <>
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle className="text-2xl text-foreground">
              Inventory List
            </CardTitle>
            <CardDescription>
              Search items and narrow results by type, category, measurement,
              and stock condition.
            </CardDescription>
          </div>
          <Button
            onClick={() => dispatch(SetCREATE())}
            className="lg:self-start"
          >
            <PackagePlus className="h-4 w-4" />
            New Inventory
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.6fr_repeat(4,minmax(0,1fr))]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => dispatch(SEARCH(event.target.value))}
              placeholder="Search inventory item..."
              className="pl-9"
              type="search"
            />
          </div>

          <FilterSelect
            value={params.type || "all"}
            onValueChange={(value) =>
              dispatch(FILTER({ ...params, type: value, category: "all" }))
            }
            placeholder="Type"
            options={typeOptions}
            allLabel="All types"
          />
          <FilterSelect
            value={params.category || "all"}
            onValueChange={(value) =>
              dispatch(FILTER({ ...params, category: value }))
            }
            placeholder="Category"
            options={params.type !== "all" ? categoryOptions[params.type] : []}
            allLabel="All categories"
          />
          <FilterSelect
            value={params.measurement || "all"}
            onValueChange={(value) =>
              dispatch(FILTER({ ...params, measurement: value }))
            }
            placeholder="Measurement"
            options={measurementOptions}
            allLabel="All measurements"
          />
          <FilterSelect
            value={params.status || "all"}
            onValueChange={(value) =>
              dispatch(FILTER({ ...params, status: value }))
            }
            placeholder="Stock status"
            options={stockOptions}
            allLabel="All stock levels"
          />
        </div>
      </CardHeader>
    </>
  );
};

export default InventoryHeader;
