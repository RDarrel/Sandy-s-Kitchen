import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Pen, Trash, MoreVertical } from "lucide-react";
const Actions = ({ item, handleAction = () => {} }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={"icon"} className="h-7 w-4 p-0">
          <MoreVertical size={50} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[9rem]">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleAction("update", item)}>
            <Pen />
            Update
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction("delete", item)}>
            <Trash />
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Actions;
