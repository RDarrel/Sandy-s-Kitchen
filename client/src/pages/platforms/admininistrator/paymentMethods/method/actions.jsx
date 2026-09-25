import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit3, MoreHorizontal, Power, PowerOff } from "lucide-react";

const Actions = ({ method, onEdit, onStatusChange }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
        >
          <MoreHorizontal className="size-4" />

          <span className="sr-only">Payment method actions</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => onEdit(method)}>
            <Edit3 className="mr-2 size-4" />
            Edit method
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => onStatusChange(method)}>
            {method.isActive ? (
              <>
                <PowerOff className="mr-2 size-4" />
                Deactivate
              </>
            ) : (
              <>
                <Power className="mr-2 size-4" />
                Activate
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default Actions;
