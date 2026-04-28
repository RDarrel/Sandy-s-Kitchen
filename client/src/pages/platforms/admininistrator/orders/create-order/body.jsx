import { Checkbox } from "@/components/ui/checkbox";
import { CardContent } from "@/components/ui/card";
import TableLoading from "@/components/shared/loading/table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CartAdd,
  CartRemove,
} from "@/services/redux/slices/procurement/purchases";
import { Stock, globalSearch } from "@/services/utilities";
import { capitalize, isEmpty } from "lodash";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

const CreateOrderBody = ({ search = "", type = "all", category = "all" }) => {
  const dispatch = useDispatch();
  const { collections = [], isLoading } = useSelector(
    ({ inventoryItems }) => inventoryItems,
  );
  const { cart } = useSelector(({ purchases }) => purchases);

  const cartIds = useMemo(() => {
    const ids = new Set();
    for (const line of Array.isArray(cart?.lines) ? cart.lines : []) {
      const id = String(line?.inventory || "");
      if (id) ids.add(id);
    }
    return ids;
  }, [cart]);

  const filtered = useMemo(() => {
    const safeCollections = Array.isArray(collections) ? collections : [];
    const byType =
      type && type !== "all"
        ? safeCollections.filter((item) => String(item?.type || "") === type)
        : safeCollections;

    const byCategory =
      category && category !== "all"
        ? byType.filter((item) => String(item?.category || "") === category)
        : byType;

    const keyword = String(search || "").trim();
    if (!keyword) return byCategory;
    return globalSearch(byCategory, keyword.toUpperCase());
  }, [collections, search, type, category]);

  const addToCart = (inventory, unitCost, supplier) => {
    dispatch(
      CartAdd({
        inventory: String(inventory),
        quantity: 1,
        unitCost,
        supplier: String(supplier),
      }),
    );
  };

  const removeFromCart = (inventory) => dispatch(CartRemove(String(inventory)));

  const toggleCart = (item, nextChecked) => {
    const id = String(item?._id || "");
    if (!id) return;

    const currentlyInCart = cartIds.has(id);
    const shouldBeChecked =
      typeof nextChecked === "boolean" ? nextChecked : !currentlyInCart;

    if (shouldBeChecked)
      addToCart(id, Number(item?.cost) || 0, item?.supplier?._id);
    else removeFromCart(id);
  };

  return (
    <CardContent className="space-y-4 pt-0">
      {!isLoading ? (
        <>
          <div className="overflow-hidden rounded-[7px] border border-border bg-card">
            <Table>
              <TableHeader className="bg-muted/70">
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!isEmpty(filtered) ? (
                  filtered.map((item) => {
                    const id = String(item?._id || "");
                    const inCart = id ? cartIds.has(id) : false;

                    return (
                      <TableRow
                        key={id}
                        className={`cursor-pointer transition-colors hover:bg-muted/40 ${inCart ? "bg-accent/10" : ""}`}
                        tabIndex={0}
                        onClick={() => toggleCart(item)}
                        onKeyDown={(event) => {
                          if (!id) return;
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            toggleCart(item);
                          }
                        }}
                      >
                        <TableCell className="whitespace-normal">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={inCart}
                              onCheckedChange={(next) => {
                                toggleCart(item, Boolean(next));
                              }}
                              onClick={(event) => event.stopPropagation()}
                              aria-label={`Select ${item?.name || "item"}`}
                              className="mt-1"
                            />

                            <div className="space-y-1">
                              <p className="font-semibold text-foreground">
                                {capitalize(item?.name || "")}
                              </p>
                              <p className="max-w-xs text-xs leading-5 text-muted-foreground">
                                {item?.description ||
                                  "No description provided."}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {Stock.convertToBaseUnit(
                            item?.currentStock || 0,
                            item?.measurement,
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="py-14 text-center">
                      <div className="space-y-2">
                        <p className="text-base font-semibold text-foreground">
                          No inventory items found
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Try another keyword to show matching records.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <TableLoading numberOfColumns={2} />
      )}
    </CardContent>
  );
};

export default CreateOrderBody;
