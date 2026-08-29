import React from "react";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { capitalize } from "lodash";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListChecks, Trash2, Search } from "lucide-react";
import Cloudinary from "@/services/utilities/cloudinary";
const Selected = ({
  search,
  menus,
  clearFilters = () => {},
  removeSelectedMenu = () => {},
}) => {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <Table className={"w-full"}>
        <TableBody>
          {menus.length > 0 ? (
            menus.map(({ category, choices }, idx) => (
              <React.Fragment key={`${category._id}-${idx} `}>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableCell colSpan={2}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">
                          {capitalize(category.name)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Included menus
                        </p>
                      </div>

                      <Badge variant="secondary" className="rounded-full">
                        {choices.length}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>

                {choices.map((menu, cIdx) => (
                  <TableRow
                    key={`${cIdx}-${menu?._id}-selected`}
                    className="transition-colors hover:bg-muted/20"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3 pl-5">
                        <img
                          className="h-12 w-12 rounded-lg border object-cover shadow-sm"
                          alt={`No-image-${menu._id}`}
                          src={Cloudinary.getMenuImg(menu.imgId, menu._id)}
                        />

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">
                            {capitalize(menu.name)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="w-16 text-center">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Remove ${menu.name}`}
                        onClick={() => {
                          removeSelectedMenu(category?._id, menu._id);
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))
          ) : (
            <TableRow className={"h-[320px] hover:bg-transparent"}>
              <TableCell colSpan={2} className="h-full p-0">
                {search ? (
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
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                    <ListChecks className="h-8 w-8 text-muted-foreground" />

                    <div>
                      <p className="font-medium">No menus selected</p>
                      <p className="text-sm text-muted-foreground">
                        Selected menus will appear here.
                      </p>
                    </div>
                  </div>
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Selected;
