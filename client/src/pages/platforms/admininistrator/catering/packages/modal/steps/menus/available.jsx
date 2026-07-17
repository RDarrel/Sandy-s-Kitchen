import { Button } from "@/components/ui/button";
import { Table, TableCell, TableRow, TableBody } from "@/components/ui/table";
import { capitalize } from "@/services/utilities";
import Cloudinary from "@/services/utilities/cloudinary";
import { Minus, Plus, Search } from "lucide-react";
const Available = ({
  menus = [],
  selectedIds = [],
  clearFilters = () => {},
  toggleMenu = () => {},
}) => {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <Table>
        <TableBody>
          {menus.length > 0 ? (
            menus.map((menu) => {
              const isSelected = selectedIds.has(menu?._id);
              return (
                <TableRow
                  key={menu?._id || menu?.name}
                  className={`cursor-pointer transition-colors  ${isSelected ? " hover:bg-primary/10 border-l-4 border-l-primary bg-[color:color-mix(in_srgb,var(--color-primary)_8%,white)]" : "hover:bg-muted/20"}`}
                  onClick={() => toggleMenu(menu)}
                >
                  <TableCell>
                    <div className="min-w-0 flex items-center gap-2">
                      <img
                        className="h-12 w-12 rounded-xl object-cover"
                        alt={`No-image-${menu?._id}`}
                        src={Cloudinary.getMenuImg(menu?.imgId, menu?._id)}
                      />
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
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleMenu(menu);
                      }}
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
                    onClick={clearFilters}
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

export default Available;
