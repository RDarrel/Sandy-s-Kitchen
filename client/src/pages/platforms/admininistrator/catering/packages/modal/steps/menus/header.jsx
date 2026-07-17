import { Badge } from "@/components/ui/badge";
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
  categories = [],
  setSearch = () => {},
  setActiveCategory = () => {},
}) => {
  return (
    <>
      <div className="flex shrink-0 items-center justify-between gap-3 border-b bg-muted/20 px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {title}
          </p>
          {isSelected ? (
            <div className="grid grid-rows-2">
              <div className="flex items-center gap-2">
                <p className="text-xs text-foreground">Main Course Limit</p>
                <Input className={"h-7 w-15"} type={"number"} />
              </div>
              <p className="text-xs text-foreground">
                The customer can select up to 3 main courses.
              </p>
            </div>
          ) : (
            <p className="truncate text-xs text-muted-foreground">{subTitle}</p>
          )}
        </div>

        {menusCount}
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
