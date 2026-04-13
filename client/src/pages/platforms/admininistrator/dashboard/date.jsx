import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, ChevronDown } from "lucide-react";

const MonthSelect = ({ month, setMonth = () => {} }) => {
  const today = new Date();

  // values: YYYY-MM format
  const currentValue = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;
  const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthValue = `${lastMonthDate.getFullYear()}-${String(
    lastMonthDate.getMonth() + 1
  ).padStart(2, "0")}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-[#F5F2ED] border border-[#DDD] h-[30px] hover:bg-[#EAE6D7] flex items-center">
          <Calendar className="text-[#696969]" />
          <span className="text-[#696969]">{month?.label || "Select"}</span>
          <ChevronDown className="text-[#696969] " />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[150px]">
        <DropdownMenuItem
          onClick={() => setMonth({ label: "This Month", value: currentValue })}
        >
          This Month
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            setMonth({ label: "Last Month", value: lastMonthValue })
          }
        >
          Last Month
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MonthSelect;
