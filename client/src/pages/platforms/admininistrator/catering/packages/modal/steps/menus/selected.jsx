import React from "react";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { capitalize } from "lodash";
import { Button } from "@/components/ui/button";
import { ListChecks, Trash2 } from "lucide-react";
import Cloudinary from "@/services/utilities/cloudinary";
import { Badge } from "@/components/ui/badge";
const Selected = ({ menus, removeSelectedMenu = () => {} }) => {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <Table className={"w-full"}>
        <TableBody>
          {menus.length > 0 ? (
            menus.map((category) => (
              <React.Fragment key={category._id || category.name}>
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
                        {category.menus.length}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>

                {category.menus.map((menu) => (
                  <TableRow
                    key={menu._id}
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

                          <p className="truncate w-50 text-xs text-muted-foreground">
                            {menu.description || ""}
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
                        onClick={() => removeSelectedMenu(menu._id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))
          ) : (
            <TableRow className={"h-[333px] hover:bg-transparent"}>
              <TableCell colSpan={2} className="h-full p-0">
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <ListChecks className="h-8 w-8 text-muted-foreground" />

                  <div>
                    <p className="font-medium">No menus selected</p>
                    <p className="text-sm text-muted-foreground">
                      Selected menus will appear here.
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Selected;
