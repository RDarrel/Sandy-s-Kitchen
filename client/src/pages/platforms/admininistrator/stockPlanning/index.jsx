import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useMemo, useState } from "react";
import { Formatter, Stock } from "@/services/utilities";
import { useDispatch, useSelector } from "react-redux";
import {
  RESET as RESET_INVENTORY,
  STOCK_PLANNING,
} from "@/services/redux/slices/inventory/inventoryItems";
import { BROWSE as BROWSE_SUPPLIERS } from "@/services/redux/slices/procurement/suppliers";
import {
  RESET as RESET_PURCHASES,
  CartAdd,
  CartAddMany,
} from "@/services/redux/slices/procurement/purchases";
import Header from "./header";
import Legend from "./legend";
import Item from "./item";
import ReviewOrderModal from "../orders/create-order/review-modal";
import ItemEmpty from "./itemEmpty";
import TableLoading from "@/components/shared/loading/table";

const StockPlanning = () => {
  const { collections: inventories = [], isLoading } = useSelector(
    ({ inventoryItems }) => inventoryItems,
  );

  const { cart = [] } = useSelector(({ purchases }) => purchases);

  const dispatch = useDispatch();

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
  useEffect(() => {
    if (date?.from && date?.to) {
      dispatch(CartAddMany([]));
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

    return () => {
      dispatch(RESET_INVENTORY());
      dispatch(RESET_PURCHASES());
    };
  }, [dispatch]);

  const filteredItems = useMemo(() => {
    const priority = {
      shortage: 0,
      below: 1,
      sufficient: 2,
    };

    return inventories
      .filter((item) =>
        `${item?.name ?? ""} ${item?.category ?? ""}`
          .toLowerCase()
          .includes(search.trim().toLowerCase()),
      )
      .sort((a, b) => {
        const priorityA = priority[a?.stockAlert?.type] ?? 3;
        const priorityB = priority[b?.stockAlert?.type] ?? 3;

        // First: Sort by stock alert priority
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        // Second: Sort by highest purchase quantity
        return (
          (Number(b?.toPurchaseQty) || 0) - (Number(a?.toPurchaseQty) || 0)
        );
      });
  }, [inventories, search]);

  // Select All only applies to ingredients with a recommended purchase quantity.
  const eligibleItems = useMemo(
    () =>
      filteredItems.filter(
        (item) =>
          Number(Stock.getPurchaseDetails(item)?.toPurchaseQty ?? 0) > 0,
      ),
    [filteredItems],
  );

  const isSelected = (item) =>
    cart.some(({ inventory }) => String(inventory?._id) === String(item?._id));

  const allSelected =
    eligibleItems.length > 0 && eligibleItems.every(isSelected);

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

  // Manual selection is allowed even when toPurchaseQty is zero.
  const toggleItem = (item) => {
    if (!item) return;

    const { toPurchaseQty = 0 } = Stock.getPurchaseDetails(item);
    const recommendedQty = Number(toPurchaseQty);

    const [quantity] = Stock.formatQuantity(
      recommendedQty > 0 ? recommendedQty : 1,
      item.baseUnit,
      true,
    ).split(" ");

    // CartAdd retains the existing selection/toggle behavior of your slice.
    dispatch(
      CartAdd({
        ...item,
        quantity,
      }),
    );
  };

  const toggleAllItems = (checked) => {
    // Preserve manually selected ingredients that are not eligible for Select All.
    const manuallySelectedItems = cart
      .filter(({ inventory }) => {
        const itemId = String(inventory?._id);

        const isEligibleForSelectAll = eligibleItems.some(
          (item) => String(item?._id) === itemId,
        );

        return !isEligibleForSelectAll;
      })
      .map(({ inventory, quantity }) => ({
        ...inventory,
        quantity,
      }));

    dispatch(CartAddMany([]));

    if (checked === true) {
      dispatch(
        CartAddMany([
          ...manuallySelectedItems,
          ...eligibleItems.filter(
            (item) =>
              !manuallySelectedItems.some(
                (selected) => String(selected?._id) === String(item?._id),
              ),
          ),
        ]),
      );
    } else if (manuallySelectedItems.length > 0) {
      dispatch(CartAddMany(manuallySelectedItems));
    }
  };

  return (
    <div className="min-w-0 bg-background p-3 sm:p-4 md:p-6">
      <div className="mx-auto w-full max-w-7xl min-w-0">
        <Card className="min-w-0 border-border shadow-sm">
          <Header
            date={date}
            dateRange={dateRange}
            search={search}
            setSearch={setSearch}
            setDate={setDate}
            handleDateRangeChange={handleDateRangeChange}
          />

          <CardContent className="-mt-2 min-w-0">
            {isLoading ? (
              <TableLoading hasPagination={false} />
            ) : (
              <div className="w-full min-w-0 overflow-hidden rounded-md border border-border">
                {/* One table keeps the header and body columns aligned. */}
                <div
                  className="max-h-[420px] w-full overflow-auto overscroll-contain"
                  role="region"
                  aria-label="Stock planning table"
                  tabIndex={0}
                >
                  <Table className="w-full min-w-[1163px] table-fixed">
                    <colgroup>
                      <col className="w-12" />
                      <col className="w-[220px]" />
                      <col className="w-[175px]" />
                      <col className="w-[220px]" />
                      <col className="w-[145px]" />
                      <col className="w-[190px]" />
                      <col className="w-[165px]" />
                    </colgroup>

                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky top-0 z-20 bg-muted">
                          <Checkbox
                            checked={allSelected}
                            onCheckedChange={toggleAllItems}
                            aria-label="Select all ingredients requiring purchase"
                          />
                        </TableHead>

                        <TableHead className="sticky top-0 z-20 bg-muted">
                          Ingredient
                        </TableHead>

                        <TableHead className="sticky top-0 z-20 bg-muted">
                          Available Stock
                        </TableHead>

                        <TableHead className="sticky top-0 z-20 bg-muted">
                          Total Needed
                        </TableHead>

                        <TableHead className="sticky top-0 z-20 bg-muted">
                          Projected Stock
                        </TableHead>

                        <TableHead className="sticky top-0 z-20 bg-muted">
                          Stock Alert
                        </TableHead>

                        <TableHead className="sticky top-0 z-20 bg-muted">
                          To Purchase
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {filteredItems.length > 0 ? (
                        filteredItems.map((item) => {
                          return (
                            <Item
                              key={item?._id}
                              item={item}
                              toggleItem={toggleItem}
                              isSelected={isSelected}
                            />
                          );
                        })
                      ) : (
                        <ItemEmpty search={search} />
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <Legend />
          </CardContent>
        </Card>
      </div>

      <ReviewOrderModal />
    </div>
  );
};

export default StockPlanning;
