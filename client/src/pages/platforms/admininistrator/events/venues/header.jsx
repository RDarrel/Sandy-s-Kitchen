import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SEARCH } from "@/services/redux/slices/events/venues";
import { Plus, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
const Header = ({ toggleCreate = () => {} }) => {
  const { search } = useSelector(({ venues }) => venues),
    dispatch = useDispatch();
  return (
    <CardHeader>
      <div className="flex flex-row justify-between ">
        <div>
          <CardTitle className="text-2xl text-foreground">Venues</CardTitle>
          <CardDescription>
            Manage venue details, pricing, capacity, event compatibility, and
            available amenities.
          </CardDescription>
        </div>
        <div className="flex align-items-center gap-4">
          <div className="relative h-9">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => dispatch(SEARCH(event.target.value))}
              placeholder="Search venue..."
              className="pl-9"
              type="search"
            />
          </div>
          <Button onClick={toggleCreate}>
            <Plus className="h-4 w-4" />
            Add Venue
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};

export default Header;
