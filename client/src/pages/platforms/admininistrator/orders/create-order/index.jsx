import { BROWSE } from "@/services/redux/slices/inventory/inventoryItems";
import { Card } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CreateOrderBody from "./body";
import CreateOrderHeader from "./header";
import { BROWSE as BROWSE_SUPPLIERS } from "@/services/redux/slices/procurement/suppliers";
import CreateOrderCart from "./cart";
import { ArrowRight } from "lucide-react";
import ReviewOrderModal from "./review-modal";

const CreateOrder = () => {
  const { token } = useSelector(({ auth }) => auth),
    [search, setSearch] = useState(""),
    [type, setType] = useState("all"),
    [category, setCategory] = useState("all"),
    dispatch = useDispatch();

  const { cart } = useSelector(({ purchases }) => purchases);
  const { collections: suppliers = [] } = useSelector(({ suppliers }) => suppliers);
  const { collections: inventoryCollections = [] } = useSelector(
    ({ inventoryItems }) => inventoryItems,
  );

  const supplierOptions = useMemo(() => {
    return (Array.isArray(suppliers) ? suppliers : [])
      .map((supplier) => ({
        id: String(supplier?._id || ""),
        label: String(supplier?.name || "Supplier"),
      }))
      .filter((option) => option.id);
  }, [suppliers]);

  const inventoryById = useMemo(() => {
    const map = new Map();
    for (const item of Array.isArray(inventoryCollections)
      ? inventoryCollections
      : []) {
      if (item?._id) map.set(String(item._id), item);
    }
    return map;
  }, [inventoryCollections]);

  const entries = useMemo(() => {
    const lines = Array.isArray(cart?.lines) ? cart.lines : [];
    return lines
      .map((line) => ({
        inventory: String(line?.inventory || ""),
        supplierId: String(line?.supplierId || "all"),
        unitCost: Number.isFinite(Number(line?.unitCost))
          ? Number(line?.unitCost)
          : undefined,
        quantity: Math.max(0, Number(line?.quantity) || 0),
      }))
      .filter((line) => line.inventory && line.quantity > 0)
      .map((line) => {
        const item = inventoryById.get(line.inventory);
        if (!item) return null;
        return { line, item };
      })
      .filter(Boolean);
  }, [cart, inventoryById]);

  useEffect(() => {
    if (token) {
      dispatch(BROWSE({ token }));
      dispatch(BROWSE_SUPPLIERS({ token }));
    }
  }, [dispatch, token]);

  return (
    <>
      <div className="bg-background p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:gap-x-3 lg:grid-cols-[1fr_40px_380px] lg:items-start">
            <Card className="border-border py-6 shadow-sm">
              <CreateOrderHeader
                search={search}
                setSearch={setSearch}
                type={type}
                setType={setType}
                category={category}
                setCategory={setCategory}
              />
              <CreateOrderBody search={search} type={type} category={category} />
            </Card>

            <div className="hidden lg:block lg:sticky lg:top-6 h-[calc(100dvh-6.25rem)]">
              <div className="flex h-full items-center justify-center pointer-events-none">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-sm">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

	            <Card className="border-border shadow-sm hidden lg:flex lg:flex-col lg:sticky lg:top-6 h-[calc(100dvh-6.25rem)] overflow-hidden gap-4">
	              <CreateOrderCart />
	            </Card>
          </div>

	          <div className="mt-6 lg:hidden">
	            <Card className="border-border shadow-sm gap-4">
	              <CreateOrderCart />
	            </Card>
	          </div>
	        </div>
	      </div>

	      <ReviewOrderModal entries={entries} supplierOptions={supplierOptions} />
	    </>
	  );
};

export default CreateOrder;
