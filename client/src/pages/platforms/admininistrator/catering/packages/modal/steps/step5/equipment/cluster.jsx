import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Search, Minus, Plus } from "lucide-react";
import { capitalize } from "lodash";
import {
  Select,
  SelectLabel,
  SelectGroup,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
const Cluster = ({ isSelected = false }) => {
  const { collections } = useSelector(({ equipment }) => equipment);

  return (
    <div className="border border rounded-sm">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b bg-muted/20 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            Available Equipment
          </p>
          <p className="truncate text-xs text-muted-foreground">
            Choose equipment what you want
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isSelected ? (
            <label
              className="flex h-7 items-center gap-1.5 rounded-md border bg-background px-2 text-xs text-muted-foreground"
              title={selectionLimitLabel}
            >
              <span className="font-medium">Limit</span>
              <Input
                aria-label={selectionLimitLabel}
                className="h-6 w-10 border-0 bg-transparent p-0 text-center text-xs font-semibold shadow-none focus-visible:ring-0"
                min="1"
                // onChange={({ target }) =>
                //   setSelectionLimitValue(target.value)
                // }
                placeholder="0"
                type="number"
                // value={selectionLimitValue}
              />
            </label>
          ) : (
            30
          )}
        </div>
      </div>

      <div className="shrink-0 border-b p-3 grid grid-cols-2 gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2 size-4 text-muted-foreground" />
          <Input
            className="h-9 pl-8"
            // value={search}
            // onChange={({ target }) => setSearch(target.value)}
            placeholder={"Search equipment"}
          />
        </div>
        <Select>
          <SelectTrigger className="w-full max-w-48 ">
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Filter by Category</SelectLabel>
              <SelectItem value="all">All</SelectItem>
              {/* {categories.map((category, idx) => (
                    <SelectItem key={idx} value={category?._id}>
                      {category?.name}
                    </SelectItem>
                  ))} */}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableBody>
          {collections.length > 0 ? (
            collections.map((menu) => {
              // const isSelected = selectedIds.has(menu?._id);
              return (
                <TableRow
                  key={menu?._id || menu?.name}
                  className={`cursor-pointer transition-colors  ${isSelected ? " hover:bg-primary/10 border-l-4 border-l-primary bg-[color:color-mix(in_srgb,var(--color-primary)_8%,white)]" : "hover:bg-muted/20"}`}
                  // onClick={() => toggle(menu, isSelected)}
                >
                  <TableCell>
                    <div className="min-w-0 flex items-center gap-2">
                      <div className="flex flex-col">
                        <p className="truncate text-sm font-medium text-foreground">
                          {capitalize(menu?.name || "")}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="size-8 text-primary hover:bg-primary/10 hover:text-primary"
                      aria-label={`Add ${menu?.name || "menu"}`}
                      // onClick={(event) => {
                      //   event.stopPropagation();
                      //   toggle(menu, isSelected);
                      // }}
                    >
                      {isSelected ? (
                        <Minus className="size-4" />
                      ) : (
                        <Plus className="size-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow className="h-[325px] hover:bg-transparent">
              <TableCell colSpan={2} className="h-full p-0">
                <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                  <Search className="size-10 text-muted-foreground" />

                  <p className="text-sm font-semibold text-foreground">
                    No matching menus
                  </p>

                  <p className="mt-2 max-w-xs text-sm text-wrap leading-5 text-muted-foreground">
                    Try a different keyword or choose another category to find
                    available menus.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-6"
                    //   onClick={clearFilters}
                  >
                    Clear filters
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Cluster;
