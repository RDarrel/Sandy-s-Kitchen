import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "@/services/fakeDB";
import Cloudinary from "@/services/utilities/cloudinary";
import { ChevronRight, Search } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";

const getBundleItemId = (item) => item?._id || item?.id;

const Bundles = ({ form, setForm = () => {} }) => {
  const { collections } = useSelector(({ menu }) => menu);
  const [bundleSearch, setBundleSearch] = useState("");
  const [bundleCategory, setBundleCategory] = useState("All");
  const bundleCandidates = collections.filter((item) => item.type !== "bundle");

  const filteredBundleItems = bundleCandidates.filter((item) => {
    const keyword = bundleSearch.trim().toLowerCase();
    const matchesCategory =
      bundleCategory === "All" || item.category === bundleCategory;

    const matchesKeyword =
      !keyword ||
      item.name?.toLowerCase().includes(keyword) ||
      item.category?.toLowerCase().includes(keyword);

    return matchesCategory && matchesKeyword;
  });
  const handleBundleQuantityChange = (id, value) => {
    const quantity = Math.max(1, Number(value) || 1);

    setForm((current) => ({
      ...current,
      bundleItems: current.bundleItems.map((item) =>
        getBundleItemId(item) === id ? { ...item, quantity } : item,
      ),
    }));
  };

  const removeBundleItem = (id) => {
    setForm((current) => ({
      ...current,
      bundleItems: current.bundleItems.filter(
        (item) => getBundleItemId(item) !== id,
      ),
    }));
  };

  const toggleBundleItem = (item) => {
    const itemId = getBundleItemId(item);

    setForm((current) => {
      const exists = current.bundleItems.some(
        (selectedItem) => getBundleItemId(selectedItem) === itemId,
      );

      return {
        ...current,
        bundleItems: exists
          ? current.bundleItems.filter(
              (selectedItem) => getBundleItemId(selectedItem) !== itemId,
            )
          : [...current.bundleItems, { ...item, id: itemId, quantity: 1 }],
      };
    });
  };

  return (
    <section className="rounded-[24px] border border-border bg-white shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <p className="text-sm font-semibold text-foreground">
          Bundle Composition
        </p>
        <p className="text-xs text-muted-foreground">
          Add items on the left and review quantities on the right.
        </p>
      </div>

      <div className="grid gap-4 p-4 xl:grid-cols-[1fr_24px_1fr]">
        <div className="min-w-0 overflow-hidden rounded-[20px] border border-border bg-white">
          <div className="border-b border-border bg-white px-4 py-3">
            <p className="text-sm font-semibold">Available Menu Items</p>
            <div className="mt-3 grid gap-2 md:grid-cols-[1fr_180px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={bundleSearch}
                  onChange={(event) => setBundleSearch(event.target.value)}
                  placeholder="Search menu items..."
                  className="pl-9"
                />
              </div>
              <Select value={bundleCategory} onValueChange={setBundleCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Filter Category</SelectLabel>
                    <SelectItem value="All">All Categories</SelectItem>
                    {Category.collections.map((category, index) => (
                      <SelectItem key={index} value={category.value}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto bg-white">
            {filteredBundleItems?.length > 0 ? (
              filteredBundleItems.map((item) => {
                const itemId = getBundleItemId(item);
                const isSelected = form?.bundleItems?.some(
                  (selectedItem) => getBundleItemId(selectedItem) === itemId,
                );

                return (
                  <button
                    key={itemId}
                    type="button"
                    onClick={() => toggleBundleItem(item)}
                    className={`grid w-full grid-cols-[56px_1fr_auto] items-center gap-3 border-b border-border px-4 py-3 text-left transition last:border-b-0 ${
                      isSelected
                        ? "border-l-4 border-l-primary bg-[color:color-mix(in_srgb,var(--color-primary)_8%,white)]"
                        : "hover:bg-muted/15"
                    }`}
                  >
                    <img
                      src={Cloudinary.getMenuImg(item.imgId, itemId)}
                      alt={item.name}
                      className="h-12 w-12 rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">P{item.price}</p>
                      <p
                        className={`text-xs font-medium ${
                          isSelected
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        {isSelected ? "Added" : "Add"}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="bg-white px-4 py-10 text-center text-sm text-muted-foreground">
                No menu items matched your search.
              </div>
            )}
          </div>
        </div>

        <div className="hidden items-center justify-center xl:flex">
          <div className="flex h-full items-center justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white shadow-sm">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-[20px] border border-border bg-white">
          <div className="border-b border-border bg-white px-4 py-3">
            <p className="text-sm font-semibold">Selected for Bundle</p>
            <p className="text-xs text-muted-foreground">
              Set quantity for each selected item.
            </p>
          </div>

          <div className="max-h-80 overflow-y-auto bg-white">
            {form.bundleItems?.length > 0 ? (
              form.bundleItems.map((item) => (
                <div
                  key={getBundleItemId(item)}
                  className="grid grid-cols-[56px_1fr_84px_auto] items-center gap-3 border-b border-border bg-white px-4 py-3 last:border-b-0"
                >
                  <img
                    src={Cloudinary.getMenuImg(item.imgId, getBundleItemId(item))}
                    alt={item.name}
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      P{item.price} each
                    </p>
                  </div>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event) =>
                      handleBundleQuantityChange(
                        getBundleItemId(item),
                        event.target.value,
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeBundleItem(getBundleItemId(item))}
                  >
                    Remove
                  </Button>
                </div>
              ))
            ) : (
              <div className="bg-white px-4 py-10 text-center text-sm text-muted-foreground">
                No items selected yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Bundles;
