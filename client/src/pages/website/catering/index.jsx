import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BROWSE } from "@/services/redux/slices/events/cateringPackages";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Package from "./package";
import Pagination from "./pagination";
import "./style.css";
import PackageSkeleton from "./package/skeleton";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 4;

const Catering = ({ isWebsite = true, onSelect = () => {} }) => {
  const { auth } = useSelector(({ auth }) => auth);
  const { collections: packages, isLoading } = useSelector(
      ({ cateringPackages }) => cateringPackages,
    ),
    [currentPage, setCurrentPage] = useState(1),
    navigate = useNavigate(),
    dispatch = useDispatch();

  useEffect(() => {
    dispatch(BROWSE());
  }, [dispatch]);

  const totalPages = Math.ceil(packages.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const visiblePackages = useMemo(
    () => packages.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [startIndex, packages],
  );

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  const handleInquire = useCallback((item) => {
    if (!isWebsite) return onSelect(item);
    sessionStorage.setItem(
      "inquiry",
      JSON.stringify({
        type: "package",
        id: item._id,
      }),
    );
    navigate("/authentication/sign-in");
  }, []);
  return (
    <section className="catering-page grid grid-cols-1 md:grid-cols-[auto_1fr] max-w-6xl mx-auto gap-5 items-start  ">
      <div
        className={cn(
          `sticky hidden md:block w-60 self-start rounded-md border bg-card p-4 shadow-sm z-10 `,
          `top-${auth?._id ? 4 : 22}`,
        )}
      >
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-muted-foreground" />
            <h3 className="font-semibold">Find Your Package</h3>
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            Find the right package for your event.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2 ">
            <Label>Number of Guests</Label>

            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select guests" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="1-30">1–30 guests</SelectItem>
                <SelectItem value="31-50">31–50 guests</SelectItem>
                <SelectItem value="51-100">51–100 guests</SelectItem>
                <SelectItem value="101-150">101–150 guests</SelectItem>
                <SelectItem value="150+">150+ guests</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Budget</Label>

            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select budget" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="under-15k">Under ₱15,000</SelectItem>
                <SelectItem value="15k-30k">₱15,000 – ₱30,000</SelectItem>
                <SelectItem value="30k-50k">₱30,000 – ₱50,000</SelectItem>
                <SelectItem value="50k-plus">₱50,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Sort By</Label>
            <Select defaultValue="default">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 border-t pt-4">
          <div className="grid gap-2">
            <Button className="w-full">Find Package</Button>

            <Button variant="ghost" className="w-full">
              Reset Filters
            </Button>
          </div>
        </div>
      </div>
      <div className="catering-page__innerr">
        <Pagination
          placement="top"
          totalPages={totalPages}
          currentPage={currentPage}
          goToPage={goToPage}
        />

        <div className="catering-packages">
          {!isLoading
            ? visiblePackages.map((item, idx) => {
                return (
                  <Package
                    key={idx}
                    item={item}
                    handleInquire={handleInquire}
                  />
                );
              })
            : Array.from({ length: 3 }).map((_, idx) => (
                <PackageSkeleton key={idx} />
              ))}
        </div>

        <Pagination
          placement="bottom"
          totalPages={totalPages}
          currentPage={currentPage}
          goToPage={goToPage}
        />
      </div>
    </section>
  );
};

export default Catering;
