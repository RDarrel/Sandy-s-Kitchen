import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ShoppingCart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import DatePicker from "@/components/shared/datePicker";
import { Button } from "@/components/ui/button";
import { SetReviewOpen } from "@/services/redux/slices/procurement/purchases";
const Header = ({
  date,
  dateRange,
  search,
  setSearch,
  handleDateRangeChange = () => {},
  setDate = () => {},
}) => {
  const { cart } = useSelector(({ purchases }) => purchases);
  const dispatch = useDispatch();
  return (
    <CardHeader className="space-y-4">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="min-w-0 space-y-3">
          <div className="space-y-1">
            <CardTitle className="text-2xl text-foreground">
              Stock Planning
            </CardTitle>

            <CardDescription>
              Review projected stock levels, incoming supplies, and purchase
              requirements for upcoming demand.
            </CardDescription>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Select value={dateRange} onValueChange={handleDateRangeChange}>
              <SelectTrigger
                className="w-full sm:w-[180px]"
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

            {dateRange === "custom" && (
              <div className="w-full max-w-[235px] sm:flex-1">
                <DatePicker
                  mode="range"
                  min={new Date()}
                  highlightToday={false}
                  date={date}
                  setDate={setDate}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Search ingredients..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full sm:w-[220px]"
            aria-label="Search ingredients"
          />

          <Button
            disabled={cart.length === 0}
            className="w-full shrink-0 sm:w-auto"
            onClick={() => dispatch(SetReviewOpen())}
          >
            <ShoppingCart className="mr-2 size-4" />
            Create Order
            {cart.length > 0 && <span>({cart.length})</span>}
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};

export default Header;
