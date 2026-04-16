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
        item.id === id ? { ...item, quantity } : item,
      ),
    }));
  };

  const removeBundleItem = (id) => {
    setForm((current) => ({
      ...current,
      bundleItems: current.bundleItems.filter((item) => item.id !== id),
    }));
  };

  const toggleBundleItem = (item) => {
    setForm((current) => {
      const exists = current.bundleItems.some(
        (selectedItem) => selectedItem.id === item.id,
      );

      return {
        ...current,
        bundleItems: exists
          ? current.bundleItems.filter(
              (selectedItem) => selectedItem.id !== item.id,
            )
          : [...current.bundleItems, { ...item, quantity: 1 }],
      };
    });
  };

  return (
    <section className="rounded-[24px] border border-border bg-muted/30">
      <div className="border-b border-border px-5 py-4">
        <p className="text-sm font-semibold text-foreground">
          Bundle Composition
        </p>
        <p className="text-xs text-muted-foreground">
          Add items on the left and review quantities on the right.
        </p>
      </div>

      <div className="grid gap-4 p-4 xl:grid-cols-[1fr_24px_1fr]">
        <div className="min-w-0 rounded-[20px] border border-border bg-background">
          <div className="border-b border-border px-4 py-3">
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

          <div className="max-h-80 overflow-y-auto">
            {filteredBundleItems?.length > 0 ? (
              filteredBundleItems.map((item) => {
                const isSelected = form?.bundleItems?.some(
                  (selectedItem) => selectedItem?.id === item.id,
                );

                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => toggleBundleItem(item)}
                    className={`grid w-full grid-cols-[56px_1fr_auto] items-center gap-3 border-b border-border px-4 py-3 text-left transition last:border-b-0 ${
                      isSelected ? "bg-primary/5" : "hover:bg-muted/40"
                    }`}
                  >
                    <img
                      src={Cloudinary.getMenuImg(item.imgId, item._id)}
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
                      <p className="text-xs text-primary">
                        {isSelected ? "Added" : "Add"}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                No menu items matched your search.
              </div>
            )}
          </div>
        </div>

        <div className="hidden items-center justify-center xl:flex">
          <div className="flex h-full items-center justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background shadow-sm">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="min-w-0 rounded-[20px] border border-border bg-background">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold">Selected for Bundle</p>
            <p className="text-xs text-muted-foreground">
              Set quantity for each selected item.
            </p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {form.bundleItems?.length > 0 ? (
              form.bundleItems.map((item) => (
                <div
                  key={item?._id}
                  className="grid grid-cols-[56px_1fr_84px_auto] items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
                >
                  <img
                    src={Cloudinary.getMenuImg(item.imgId, item._id)}
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
                      handleBundleQuantityChange(item.id, event.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeBundleItem(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))
            ) : (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
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
