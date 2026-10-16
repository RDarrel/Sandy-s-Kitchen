import DatePicker from "@/components/shared/datePicker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { PackageSearch, SearchX, ShoppingCart } from "lucide-react";
import { Formatter, Stock } from "@/services/utilities";
import { useDispatch, useSelector } from "react-redux";
import { STOCK_PLANNING } from "@/services/redux/slices/inventory/inventoryItems";
import { BROWSE as BROWSE_SUPPLIERS } from "@/services/redux/slices/procurement/suppliers";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ReviewOrderModal from "../orders/create-order/review-modal";
import {
  CartAdd,
  CartAddMany,
  SetReviewOpen,
} from "@/services/redux/slices/procurement/purchases";
import { capitalize } from "lodash";

const StockPlanning = () => {
  const { collections: inventories = [] } = useSelector(
    ({ inventoryItems }) => inventoryItems,
  );
  const { cart } = useSelector(({ purchases }) => purchases);

  const [date, setDate] = useState(() => {
    const today = new Date();
    const oneWeekAfter = new Date();
    oneWeekAfter.setDate(today.getDate() + 6);

    return {
      from: today,
      to: oneWeekAfter,
    };
  });
  const [dateRange, setDateRange] = useState("7");
  const [search, setSearch] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    if (date?.from && date?.to) {
      dispatch(
        STOCK_PLANNING({
          startDate: Formatter.localDate(date.from),
          endDate: Formatter.localDate(date.to),
        }),
      );
    }
  }, [date, dispatch]);

  useEffect(() => {
    dispatch(BROWSE_SUPPLIERS());
  }, [dispatch]);

  const filteredItems = useMemo(() => {
    return inventories.filter((item) =>
      `${item?.name ?? ""} ${item?.category ?? ""}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
    );
  }, [inventories, search]);

  const eligibleItems = useMemo(
    () =>
      filteredItems.filter((item) => {
        const { toPurchaseQty } = Stock.getPurchaseDetails(item);
        return toPurchaseQty > 0;
      }),
    [filteredItems],
  );

  const allSelected = useMemo(
    () =>
      eligibleItems.length > 0 &&
      eligibleItems.every((item) =>
        cart.some(
          ({ inventory }) => String(inventory?._id) === String(item?._id),
        ),
      ),
    [eligibleItems, cart],
  );

  const handleDateRangeChange = (value) => {
    const today = new Date();
    const to = new Date();

    if (["7", "30"].includes(value)) {
      to.setDate(today.getDate() + Number(value) - 1);
      setDate({ from: today, to });
    } else {
      setDate({ from: null, to: null });
    }

    setDateRange(value);
  };

  const toggleItem = (item, toPurchaseQty) => {
    const [qty] = Stock.formatQuantity(
      toPurchaseQty,
      item?.baseUnit,
      true,
    ).split(" ");

    dispatch(CartAdd({ ...item, quantity: qty }));
  };

  const toggleAllItems = (checked) => {
    dispatch(CartAddMany([]));
    dispatch(CartAddMany(checked === true ? eligibleItems : []));
  };

  const someSelected = false;

  return (
    <div className="bg-background p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <Card className="border-border shadow-sm">
          <CardHeader className="space-y-4">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="space-y-3">
                <div className="space-y-1">
                  <CardTitle className="text-2xl text-foreground">
                    Stock Planning
                  </CardTitle>

                  <CardDescription>
                    Plan and monitor ingredient requirements for upcoming
                    bookings.
                  </CardDescription>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Select
                    value={dateRange}
                    onValueChange={handleDateRangeChange}
                  >
                    <SelectTrigger
                      className="w-[180px]"
                      aria-label="Planning period"
                    >
                      <SelectValue placeholder="Choose period" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="7">Next 7 Days</SelectItem>
                      <SelectItem value="30">Next 30 Days</SelectItem>
                      <SelectItem value="custom">Custom Date Range</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="min-w-[230px]">
                    {dateRange === "custom" && (
                      <DatePicker
                        mode="range"
                        min={new Date()}
                        highlightToday={false}
                        date={date}
                        setDate={setDate}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Input
                  placeholder="Search ingredients..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full sm:w-[220px]"
                  aria-label="Search ingredients"
                />

                <Button
                  disabled={cart.length === 0}
                  className="shrink-0"
                  onClick={() => dispatch(SetReviewOpen())}
                >
                  <ShoppingCart className="mr-2 size-4" />
                  Create Order
                  {cart.length > 0 && (
                    <span className="ml-1">({cart.length})</span>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="-mt-2">
            <div className="overflow-hidden rounded-md border border-border">
              {/* One scroll container for both header and body */}
              <div className="max-h-[350px] overflow-auto">
                <Table className="w-full min-w-[1100px] table-fixed">
                  <colgroup>
                    <col className="w-12" />
                    <col className="w-[220px]" />
                    <col className="w-[150px]" />
                    <col className="w-[240px]" />
                    <col className="w-[130px]" />
                    <col className="w-[160px]" />
                    <col className="w-[150px]" />
                  </colgroup>

                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky top-0 z-20 bg-muted/95">
                        <Checkbox
                          checked={
                            allSelected
                              ? true
                              : someSelected
                                ? "indeterminate"
                                : false
                          }
                          onCheckedChange={toggleAllItems}
                          aria-label="Select all visible ingredients"
                        />
                      </TableHead>

                      <TableHead className="sticky top-0 z-20 bg-muted/95">
                        Ingredient
                      </TableHead>

                      <TableHead className="sticky top-0 z-20 bg-muted/95">
                        Available Stock
                      </TableHead>

                      <TableHead className="sticky top-0 z-20 bg-muted/95">
                        Total Needed
                      </TableHead>

                      {/* <TableHead className="sticky top-0 z-20 bg-muted/95">
                        On Order
                      </TableHead> */}

                      <TableHead className="sticky top-0 z-20 bg-muted/95">
                        Projected Stock
                      </TableHead>

                      <TableHead className="sticky top-0 z-20 bg-muted/95">
                        Stock Alert
                      </TableHead>

                      <TableHead className="sticky top-0 z-20 bg-muted/95">
                        To Purchase
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item) => {
                        const isSelected = cart.some(
                          ({ inventory }) => inventory?._id === item?._id,
                        );
                        return (
                          <TableRow
                            key={item.id}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-muted/60 hover:bg-muted/80"
                                : "hover:bg-muted/30"
                            }`}
                            onClick={() => toggleItem(item)}
                          >
                            <TableCell>
                              <Checkbox
                                checked={isSelected}
                                onClick={(event) => event.stopPropagation()}
                                onCheckedChange={() => toggleItem(item)}
                                aria-label={`Select ${item.name}`}
                              />
                            </TableCell>

                            <TableCell>
                              <div className="space-y-0.5">
                                <p className="font-medium text-foreground">
                                  {item.name}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  {capitalize(item.category)}
                                </p>
                              </div>
                            </TableCell>

                            <TableCell>
                              {Stock.formatQuantity(
                                item?.currentStock,
                                item?.baseUnit,
                                item?.currentStock === 0,
                              )}
                            </TableCell>

                            <TableCell>
                              <div className="space-y-1">
                                {item?.totalNeeded > 0 ? (
                                  <p className="font-semibold text-foreground">
                                    {Stock.formatQuantity(
                                      item?.totalNeeded,
                                      item?.baseUnit,
                                    )}
                                  </p>
                                ) : (
                                  "—"
                                )}
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <span className="size-1.5 shrink-0 rounded-full bg-amber-500/70" />
                                    {item?.cateringNeeded > 0 ? (
                                      <p>
                                        C:{" "}
                                        {Stock.formatQuantity(
                                          item?.cateringNeeded,
                                          item?.baseUnit,
                                        )}
                                      </p>
                                    ) : (
                                      "-"
                                    )}
                                  </span>

                                  <span className="flex items-center gap-1">
                                    <span className="size-1.5 shrink-0 rounded-full bg-teal-600/70" />
                                    {item?.estimatedPosNeeded > 0 ? (
                                      <p>
                                        P:{" "}
                                        {Stock.formatQuantity(
                                          item?.estimatedPosNeeded,
                                          item?.baseUnit,
                                        )}
                                      </p>
                                    ) : (
                                      "-"
                                    )}
                                  </span>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              {Stock.formatQuantity(
                                item?.projectedStock,
                                item?.baseUnit,
                                item?.projectedStock === 0,
                              )}
                            </TableCell>
                            {/* <TableCell>
                              {item?.incomingQty > 0
                                ? Stock.formatQuantity(
                                    item?.incomingQty,
                                    item?.baseUnit,
                                  )
                                : "—"}
                            </TableCell> */}

                            <TableCell>Shortage</TableCell>
                            <TableCell
                              className={
                                item?.shortage > 0
                                  ? "font-medium text-destructive"
                                  : "text-muted-foreground"
                              }
                            >
                              {item?.toPurchaseQty > 0 ? (
                                <div className="space-y-1">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="cursor-help underline decoration-dotted underline-offset-4">
                                          {Stock.formatQuantity(
                                            item?.toPurchaseQty,
                                            item?.baseUnit,
                                          )}
                                        </span>
                                      </TooltipTrigger>

                                      <TooltipContent
                                        side="top"
                                        className="space-y-2"
                                      >
                                        <p className="font-medium">
                                          Purchase Breakdown
                                        </p>

                                        <div className="space-y-1 text-xs">
                                          <div className="flex justify-between gap-6">
                                            <span>Projected shortage</span>
                                            <span>
                                              {Stock.formatQuantity(
                                                item?.shortage ?? 0,
                                                item?.baseUnit,
                                              )}
                                            </span>
                                          </div>

                                          <div className="flex justify-between gap-6">
                                            <span>Minimum stock target</span>
                                            <span>
                                              {Stock.formatQuantity(
                                                item?.minimumStock,
                                                item?.baseUnit,
                                              )}
                                            </span>
                                          </div>

                                          <div className="flex justify-between gap-6 border-t pt-2 font-medium">
                                            <span>Total to purchase</span>
                                            <span>
                                              {Stock.formatQuantity(
                                                item?.toPurchaseQty,
                                                item?.baseUnit,
                                              )}
                                            </span>
                                          </div>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  {item?.includesMinimumStock && (
                                    <p className="text-xs font-normal text-amber-600 dark:text-amber-500">
                                      Includes minimum stock
                                    </p>
                                  )}
                                </div>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-48 p-6 text-center">
                          {search.trim() ? (
                            <div className="flex flex-col items-center justify-center gap-3">
                              <div className="flex size-11 items-center justify-center rounded-full bg-muted">
                                <SearchX className="size-5 text-muted-foreground" />
                              </div>

                              <div className="flex max-w-xs flex-col items-center gap-1">
                                <p className="font-medium text-foreground">
                                  No matching ingredients
                                </p>
                                <p className="text-center text-sm leading-relaxed text-muted-foreground">
                                  Try a different ingredient name or category.
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-3">
                              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                                <PackageSearch className="size-6 text-muted-foreground" />
                              </div>

                              <div className="flex w-full max-w-md flex-col items-center gap-1">
                                <p className="font-medium text-foreground">
                                  No stock planning data
                                </p>
                                <p className="max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
                                  There are no ingredients to plan for this
                                  period. Try selecting a different planning
                                  period.
                                </p>
                              </div>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-amber-500/70" />C =
                  Catering
                </span>

                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-teal-600/70" />P = POS
                  (Estimated)
                </span>
              </div>

              <p className="text-sm text-muted-foreground">
                {cart.length} ingredient(s) selected
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <ReviewOrderModal />
    </div>
  );
};

export default StockPlanning;
