import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ListFilter, Plus, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import {
  BROWSE,
  SEARCH,
  SetCREATE,
} from "@/services/redux/slices/resources/services";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectValue,
} from "@/components/ui/select";

const Header = () => {
  const { search } = useSelector(({ services }) => services);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(BROWSE({ module: "all" }));
  }, [dispatch]);

  return (
    <CardHeader className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <CardTitle className="text-2xl text-foreground">Services</CardTitle>
          <CardDescription>
            Manage services for catering packages and venue reservations.
          </CardDescription>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-end lg:max-w-xl">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => dispatch(SEARCH(event.target.value))}
              placeholder="Search services..."
              className="pl-9"
              type="search"
            />
          </div>
          <div>
            <Select className="w-25" value="all">
              <SelectTrigger className="w-37">
                <ListFilter className="size-4 text-muted-foreground" />
                <SelectValue value="catering" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Category</SelectLabel>
                  {[
                    { value: "all", label: "All Modules" },
                    { value: "catering", label: "Catering" },
                    { value: "venue", label: "Venue" },
                  ].map(({ value, label }, idx) => (
                    <SelectItem key={idx} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => dispatch(SetCREATE())}>
            <Plus className="h-4 w-4" />
            Add Service
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};

export default Header;
