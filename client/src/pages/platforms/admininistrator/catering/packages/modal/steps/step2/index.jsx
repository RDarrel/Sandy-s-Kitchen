import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Menu from "./menu";
import Category from "./category";

const Step2 = ({ selectedMenus, setSelectedMenus = () => {} }) => {
  const { collections: menus } = useSelector(({ menus }) => menus);
  const [actCategory, setActCategory] = useState(
    menus[0]?.category?.name || "",
  );
  const [menuSearch, setMenuSearch] = useState("");

  const menusGrouped = useMemo(() => {
    if (menus.length === 0) return [];
    return menus.reduce((acc, curr) => {
      const { category } = curr;
      const key = category.name;
      if (!acc[key]) {
        acc[key] = [curr];
      } else {
        acc[key].push(curr);
      }
      return acc;
    }, {});
  }, [menus]);

  const activeMenus = useMemo(
    () => menusGrouped[actCategory] || [],
    [menusGrouped, actCategory],
  );
  const filteredMenus = useMemo(() => {
    const keyword = menuSearch.trim().toLowerCase();

    if (!keyword) return activeMenus;

    return activeMenus.filter((menu) =>
      [menu?.name, menu?.description].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(keyword),
      ),
    );
  }, [activeMenus, menuSearch]);

  useEffect(() => {
    if (!actCategory && menus[0]?.category?.name) {
      setActCategory(menus[0].category.name);
    }
  }, [actCategory, menus]);

  const toggleMenu = useCallback(
    (menu) => {
      setSelectedMenus((prev) => {
        const isSelected = prev.some(({ _id }) => menu._id === _id);

        if (isSelected) {
          return prev.filter(({ _id }) => menu._id !== _id);
        }

        return [...prev, menu];
      });
    },
    [setSelectedMenus],
  );

  return (
    <div className="max-h-[26rem] overflow-hidden rounded-[7px] border border-border">
      <div className="grid h-[26rem] grid-cols-3">
        <div className="col-span-1 flex min-h-0 flex-col border-r bg-muted/20 p-3">
          <div className="shrink-0">
            <p className="text-sm font-semibold text-foreground">Categories</p>
            <p className="text-xs text-muted-foreground">
              Select a category to view menus.
            </p>
          </div>

          <Input className="my-3 h-8 shrink-0" placeholder="Search category" />

          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
            {Object.keys(menusGrouped).map((category) => {
              return (
                <Category
                  key={category}
                  variant={actCategory === category ? "default" : "outline"}
                  setActCategory={setActCategory}
                  category={category}
                />
              );
            })}

            {Object.keys(menusGrouped).length === 0 && (
              <p className="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
                No categories found.
              </p>
            )}
          </div>
        </div>

        <div className="col-span-2 flex min-h-0 flex-col bg-card">
          <div className="flex shrink-0 items-center justify-between border-b bg-muted/20 px-3 py-2.5">
            <div>
              <p className="text-sm font-semibold text-foreground">Menus</p>
              <p className="text-xs text-muted-foreground">
                Tick the menus included in this package.
              </p>
            </div>

            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {selectedMenus.length} selected
            </span>
          </div>

          <div className="shrink-0 border-b p-3">
            <Input
              className="h-8"
              value={menuSearch}
              onChange={({ target }) => setMenuSearch(target.value)}
              placeholder="Search menu"
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted/35">
                <TableRow>
                  <TableHead className="w-20 text-center">Select</TableHead>
                  <TableHead>Name</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredMenus.length > 0 ? (
                  filteredMenus.map((menu) => {
                    const id = String(menu?._id || menu?.name || "");
                    const isSelected = selectedMenus?.some(
                      ({ _id }) => _id === menu?._id,
                    );
                    return (
                      <Menu
                        key={id}
                        isSelected={isSelected}
                        menu={menu}
                        toggleMenu={toggleMenu}
                      />
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="h-28 text-center text-sm text-muted-foreground"
                    >
                      No menus found.
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
