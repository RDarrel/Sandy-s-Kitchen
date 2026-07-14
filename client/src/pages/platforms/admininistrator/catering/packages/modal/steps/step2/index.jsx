import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { capitalize } from "lodash";
import {
  ChevronRight,
  ListChecks,
  Minus,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Cloudinary from "@/services/utilities/cloudinary";

const Step2 = ({ selectedMenus = [], setSelectedMenus = () => {} }) => {
  const { collections: menus } = useSelector(({ menus }) => menus);
  const [actCategory, setActCategory] = useState(
    menus[0]?.category?.name || "",
  );
  const [menuSearch, setMenuSearch] = useState("");
  const [selectedSearch, setSelectedSearch] = useState("");

  const menusGrouped = useMemo(() => {
    if (menus.length === 0) return [];
    return menus.reduce((acc, curr) => {
      const { category } = curr;
      const key = category?.name || "Uncategorized";
      if (!acc[key]) {
        acc[key] = [curr];
      } else {
        acc[key].push(curr);
      }
      return acc;
    }, {});
  }, [menus]);

  const selectedIds = useMemo(
    () => new Set(selectedMenus.map(({ _id }) => _id)),
    [selectedMenus],
  );

  const filteredMenus = useMemo(() => {
    const keyword = menuSearch.trim().toLowerCase();

    if (!keyword) return menus;

    return menus.filter((menu) =>
      [menu?.name, menu?.description].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(keyword),
      ),
    );
  }, [menuSearch, menus]);

  const filteredSelectedMenus = useMemo(() => {
    const groupedMenus = (datas) => {
      const grouped = datas.reduce((acc, curr) => {
        const index = acc.findIndex(({ _id }) => _id === curr.category?._id);
        if (index > -1) {
          const menus = [...acc[index]?.menus];
          menus.unshift(curr);
          acc[index] = { ...acc[index], menus };
        } else {
          acc.push({ ...curr.category, menus: [curr] });
        }
        return acc;
      }, []);

      return grouped;
    };
    const keyword = selectedSearch.trim().toLowerCase();

    if (!keyword) return groupedMenus(selectedMenus);
    const results = selectedMenus.filter((menu) =>
      [menu?.name, menu?.description, menu?.category?.name].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(keyword),
      ),
    );
    return groupedMenus(results);
  }, [selectedMenus, selectedSearch]);

  const toggleMenu = useCallback(
    (menu) => {
      setSelectedMenus((prev) => {
        const isSelected = prev.some(({ _id }) => menu._id === _id);

        if (isSelected) {
          return prev.filter(({ _id }) => menu._id !== _id);
        }

        return [menu, ...prev];
      });
    },
    [setSelectedMenus],
  );
  const removeSelectedMenu = useCallback(
    (menuId) => {
      setSelectedMenus((prev) => prev.filter(({ _id }) => _id !== menuId));
    },
    [setSelectedMenus],
  );

  return (
    <div className="max-h-[30rem] overflow-hidden rounded-[7px] border border-border bg-card">
      <div className="h-[30rem] grid gap-4 p-4 xl:grid-cols-[1fr_24px_1fr] xl:items-stretch">
        <div className="flex min-h-0 flex-col border rounded-sm">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b bg-muted/20 px-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                Available menus
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Select your preferred main courses.
              </p>
            </div>

            <Badge variant="secondary" className="shrink-0 rounded-full">
              {filteredMenus.length}
            </Badge>
          </div>

          <div className="shrink-0 border-b p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2 size-4 text-muted-foreground" />
              <Input
                className="h-8 pl-8"
                value={menuSearch}
                onChange={({ target }) => setMenuSearch(target.value)}
                placeholder="Search available menu"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted/35">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-14 text-center">Add</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredMenus.length > 0 ? (
                  filteredMenus.map((menu) => {
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
                              src={Cloudinary.getMenuImg(
                                menu?.imgId,
                                menu?._id,
                              )}
                            />
                            <div className="flex flex-col">
                              <p className="truncate text-sm font-medium text-foreground">
                                {capitalize(menu?.name || "")}
                              </p>
                              {menu?.description && (
                                <p className="truncate w-70 text-xs text-muted-foreground ">
                                  {menu.description}
                                </p>
                              )}
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
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="h-32 text-center text-sm text-muted-foreground"
                    >
                      No available menus found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="hidden items-center justify-center xl:flex">
          <div className="flex h-full items-center justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white shadow-sm">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
        <div className="flex min-h-0 flex-col border rounded-sm">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b bg-muted/20 px-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                Selected menus
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Menus included in this package.
              </p>
            </div>

            <Badge variant="secondary" className="shrink-0 rounded-full">
              <ListChecks className="mr-1 size-3.5" />
              {selectedMenus.length}
            </Badge>
          </div>

          <div className="shrink-0 border-b p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2 size-4 text-muted-foreground" />
              <Input
                className="h-8 pl-8"
                value={selectedSearch}
                onChange={({ target }) => setSelectedSearch(target.value)}
                placeholder="Search selected menu"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted/35">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-16 text-center">Remove</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredSelectedMenus.length > 0 ? (
                  filteredSelectedMenus.map((category, idx) => (
                    <React.Fragment key={idx}>
                      <TableRow>
                        <TableCell colSpan={2} className={"font-semibold"}>
                          {category?.name} ({category?.menus?.length})
                        </TableCell>
                      </TableRow>
                      {category.menus.map((menu, cIdx) => (
                        <TableRow key={cIdx}>
                          <TableCell>
                            <div className="flex min-w-0 items-center gap-3 ml-3">
                              <img
                                className="h-12 w-12 rounded-xl object-cover"
                                alt={`No-image-${menu?._id}`}
                                src={Cloudinary.getMenuImg(
                                  menu?.imgId,
                                  menu?._id,
                                )}
                              />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-foreground">
                                  {capitalize(menu?.name || "")}
                                </p>
                                <p className="truncate w-70 text-xs text-muted-foreground">
                                  {capitalize(
                                    menu?.description || "Uncategorized",
                                  )}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              aria-label={`Remove ${menu?.name || "menu"}`}
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
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="h-70 text-center text-sm text-muted-foreground"
                    >
                      No selected menus yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2;
