import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectItem,
  SelectGroup,
} from "@/components/ui/select";
import { Search } from "lucide-react";

const Header = ({
  activeCategory = "",
  menusCount = 0,
  search = "",
  title = "",
  subTitle = "",
  placeholder = "",
  isSelected = false,
  selectionLimitLabel = "Selection limit",
  selectionLimitValue = "",
  selectionLimitDescription = "",
  categories = [],
  setSearch = () => {},
  setActiveCategory = () => {},
  setSelectionLimitValue = () => {},
}) => {
  return (
    <>
      <div className="flex shrink-0 items-center justify-between gap-3 border-b bg-muted/20 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {title}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {isSelected ? selectionLimitDescription || subTitle : subTitle}
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
                onChange={({ target }) => setSelectionLimitValue(target.value)}
                placeholder="0"
                type="number"
                value={selectionLimitValue}
              />
            </label>
          ) : (
            menusCount
          )}
        </div>
      </div>

      <div className="shrink-0 border-b p-3 grid grid-cols-2 gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2 size-4 text-muted-foreground" />
          <Input
            className="h-9 pl-8"
            value={search}
            onChange={({ target }) => setSearch(target.value)}
            placeholder={placeholder}
          />
        </div>
        <Select value={activeCategory} onValueChange={setActiveCategory}>
          <SelectTrigger className="w-full max-w-48 ">
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Filter by Category</SelectLabel>
              <SelectItem value="all">All</SelectItem>
              {categories.map((category, idx) => (
                <SelectItem key={idx} value={category?._id}>
                  {category?.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default Header;
