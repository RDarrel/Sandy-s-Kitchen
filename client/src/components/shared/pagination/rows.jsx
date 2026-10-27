import { Check, ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const AVAILABLE_MAXPAGES = [5, 10, 15, 20, 25];

const Rows = ({ maxPage, setMaxPage }) => {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <p className="whitespace-nowrap text-xs font-medium text-muted-foreground">Rows Per Page</p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            aria-label={`Rows per page: ${maxPage}`}
            size="sm"
            className="h-8 min-w-14 gap-1.5 px-2"
            variant={"outline"}
          >
            <span className="tabular-nums">{maxPage}</span>
            <ChevronDown className="text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[5rem]">
          <DropdownMenuLabel>Rows Per Page</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {AVAILABLE_MAXPAGES.map((max, index) => (
              <DropdownMenuItem
                key={index}
                // checked={maxPage === max}
                className="flex justify-between"
                onClick={() => setMaxPage(max)}
              >
                {max} {max === maxPage && <Check />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Rows;
