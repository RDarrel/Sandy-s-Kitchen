import React, { useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ListChecks } from "lucide-react";
import Seperator from "./seperator";
import Available from "./available";
import Selected from "./selected";
import Header from "./header";

const Step2 = ({ menus, selectedMenus = [], setSelectedMenus = () => {} }) => {
  const [menuSearch, setMenuSearch] = useState("");
  const [selectedSearch, setSelectedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [availCategory, setAvailCategory] = useState("all");

  const selectedIds = useMemo(
    () => new Set(selectedMenus.map(({ _id }) => _id)),
    [selectedMenus],
  );

  const availMenus = useMemo(() => {
    if (availCategory === "all") return menus;
    return menus.filter(({ category }) => category?._id === availCategory);
  }, [availCategory, menus]);

  const filteredMenus = useMemo(() => {
    const keyword = menuSearch.trim().toLowerCase();

    if (!keyword) return availMenus;

    return availMenus.filter((menu) =>
      [menu?.name, menu?.description].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(keyword),
      ),
    );
  }, [menuSearch, availMenus]);

  const availCategories = useMemo(() => {
    return [
      ...new Map(
        menus.map(({ category }) => [category?._id, category]),
      ).values(),
    ];
  }, [menus]);

  const selectedCategories = useMemo(() => {
    return [
      ...new Map(
        selectedMenus.map(({ category }) => [category?._id, category]),
      ).values(),
    ];
  }, [selectedMenus]);

  const selectedMenusByCategory = useMemo(() => {
    if (selectedCategory === "all") return selectedMenus;
    return selectedMenus.filter(
      ({ category }) => category?._id === selectedCategory,
    );
  }, [selectedCategory, selectedMenus]);

  const filteredSelectedMenus = useMemo(() => {
    const groupedMenus = (datas) => {
      const grouped = datas.reduce((acc, curr) => {
        const index = acc.findIndex(({ _id }) => _id === curr.category?._id);
        if (index > -1) {
          const menus = [...acc[index]?.menus];
          menus.push(curr);
          acc[index] = { ...acc[index], menus };
        } else {
          acc.push({ ...curr.category, menus: [curr] });
        }
        return acc;
      }, []);

      return grouped;
    };
    const keyword = selectedSearch.trim().toLowerCase();

    if (!keyword) return groupedMenus(selectedMenusByCategory);
    const results = selectedMenusByCategory.filter((menu) =>
      [menu?.name, menu?.description, menu?.category?.name].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(keyword),
      ),
    );
    return groupedMenus(results);
  }, [selectedMenusByCategory, selectedSearch]);

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
          <Header
            activeCategory={availCategory}
            menusCount={
              <Badge variant="secondary" className="shrink-0 rounded-full">
                {filteredMenus.length}
              </Badge>
            }
            search={menuSearch}
            title="Available menus"
            subTitle="Select your preferred main courses."
            placeholder="Search menus..."
            categories={availCategories}
            setSearch={setMenuSearch}
            setActiveCategory={setAvailCategory}
          />
          <Available
            menus={filteredMenus}
            selectedIds={selectedIds}
            toggleMenu={toggleMenu}
            clearFilters={() => {
              setAvailCategory("");
              setMenuSearch("");
            }}
          />
        </div>

        <Seperator />

        <div className="flex min-h-0 flex-col border rounded-sm">
          <Header
            activeCategory={selectedCategory}
            menusCount={
              <Badge variant="secondary" className="shrink-0 rounded-full">
                <ListChecks className="mr-1 size-3.5" />
                {selectedMenus.length}
              </Badge>
            }
            search={selectedSearch}
            title="Selected menus"
            subTitle="Review your selected main courses."
            placeholder="Search menus..."
            categories={selectedCategories}
            setSearch={setSelectedSearch}
            setActiveCategory={setSelectedCategory}
          />

          <Selected
            menus={filteredSelectedMenus}
            removeSelectedMenu={removeSelectedMenu}
          />
        </div>
      </div>
    </div>
  );
};

export default Step2;
