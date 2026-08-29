import React, { useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ListChecks } from "lucide-react";
import Seperator from "./seperator";
import Available from "./available";
import Selected from "./selected";
import Header from "./header";

const Menus = ({
  menus,
  availableSubtitle = "",
  selectedSubtitle = "",
  selectionLimitLabel = "Selection limit",
  selectionLimitItemLabel = "menus",
  selectionLimitValue = "",
  isMainCourse = false,
  menuCategories = [],
  setForm = () => {},
}) => {
  const [menuSearch, setMenuSearch] = useState("");
  const [selectedSearch, setSelectedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [availCategory, setAvailCategory] = useState("all");

  const selectedIds = useMemo(() => {
    return new Set(
      menuCategories?.flatMap((section) =>
        section.choices.map((choice) => choice?._id),
      ),
    );
  }, [menuCategories]);

  const matchesKeyWord = (keyword, menu) =>
    [menu.name, menu.description, menu?.category?.name].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(keyword),
    );

  const availMenus = useMemo(() => {
    if (availCategory === "all") return menus;
    return menus.filter(({ category }) => category?._id === availCategory);
  }, [availCategory, menus]);

  const filteredMenus = useMemo(() => {
    const keyword = menuSearch.trim().toLowerCase();

    if (!keyword) return availMenus;

    return availMenus.filter((menu) => matchesKeyWord(keyword, menu));
  }, [menuSearch, availMenus]);

  const availCategories = useMemo(() => {
    return [
      ...new Map(
        menus.map(({ category }) => [category?._id, category]),
      ).values(),
    ];
  }, [menus]);

  const selectedCategories = useMemo(() => {
    return menuCategories.map(({ category }) => category);
  }, [menuCategories]);

  const selectedMenusByCategory = useMemo(() => {
    if (selectedCategory === "all") return menuCategories;
    return menuCategories.filter(
      ({ category }) => category._id === selectedCategory,
    );
  }, [selectedCategory, menuCategories]);

  const filteredSelectedMenus = useMemo(() => {
    const keyword = selectedSearch.trim().toLowerCase();

    if (!keyword) return selectedMenusByCategory;
    const results = selectedMenusByCategory.map((section) => {
      const { choices = [] } = section;
      const results = choices.filter(({ menu }) =>
        matchesKeyWord(keyword, menu),
      );
      return { ...section, choices: results };
    });
    return results.filter(({ choices }) => choices.length);
  }, [selectedMenusByCategory, selectedSearch]);

  const clusterKey = isMainCourse ? "mainCourses" : "sideMenus";

  const toggleMenu = useCallback(
    (menu) => {
      setForm((prev) => {
        const updated = [...prev[clusterKey]];
        const index = updated.findIndex(
          ({ category }) => category?._id === menu?.category?._id,
        );
        if (index > -1) {
          const existing = {
            ...updated[index],
            choices: [menu, ...updated[index].choices],
          };
          updated.splice(index, 1);
          updated.unshift(existing);
        } else {
          updated.unshift({ category: menu?.category, choices: [menu] });
        }
        return { ...prev, [clusterKey]: updated };
      });
    },
    [clusterKey],
  );

  const removeSelectedMenu = useCallback(
    (cId, mId) => {
      setForm((prev) => {
        console.log(cId, mId);
        const updated = [...prev[clusterKey]];
        const pIdx = updated.findIndex(({ category }) => category?._id === cId);
        if (pIdx < 0) return prev;

        const choices = [...updated[pIdx].choices];
        const cIdx = choices.findIndex(({ _id }) => _id === mId);

        if (cIdx < 0) return prev;
        choices.splice(cIdx, 1);

        if (choices.length === 0) {
          //if the choices is empty remove the parent category
          updated.splice(pIdx, 1);
        } else {
          updated[pIdx] = {
            ...updated[pIdx],
            choices,
          };
        }
        return { ...prev, [clusterKey]: updated };
      });
    },
    [clusterKey],
  );

  const setSelectionLimitValue = (value) =>
    setForm((prev) => ({ ...prev, mainCourseLimit: Number(value) }));

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
            subTitle={availableSubtitle}
            placeholder="Search..."
            categories={availCategories}
            setSearch={setMenuSearch}
            setActiveCategory={setAvailCategory}
          />
          <Available
            menus={filteredMenus}
            selectedIds={selectedIds}
            toggleMenu={toggleMenu}
            removeSelectedMenu={removeSelectedMenu}
            clearFilters={() => {
              setAvailCategory("all");
              setMenuSearch("");
            }}
          />
        </div>

        <Seperator />

        <div className="flex min-h-0 flex-col border rounded-sm">
          <Header
            isSelected={isMainCourse}
            activeCategory={selectedCategory}
            menusCount={
              <Badge variant="secondary" className="shrink-0 rounded-full">
                <ListChecks className="mr-1 size-3.5" />
                {selectedIds.size}
              </Badge>
            }
            search={selectedSearch}
            title="Selected menus"
            subTitle={selectedSubtitle}
            placeholder="Search menus..."
            categories={selectedCategories}
            selectionLimitLabel={selectionLimitLabel}
            selectionLimitValue={selectionLimitValue}
            selectionLimitDescription={
              isMainCourse ? (
                <>
                  The customer can select up to{" "}
                  <span className="font-semibold text-foreground">
                    {selectionLimitValue}
                  </span>{" "}
                  {selectionLimitItemLabel}.{" "}
                  <span className="font-semibold text-foreground">
                    {selectedIds.size} selected.
                  </span>
                </>
              ) : (
                selectedSubtitle
              )
            }
            setSearch={setSelectedSearch}
            setActiveCategory={setSelectedCategory}
            setSelectionLimitValue={setSelectionLimitValue}
          />

          <Selected
            menus={filteredSelectedMenus}
            removeSelectedMenu={removeSelectedMenu}
            search={selectedSearch}
            clearFilters={() => {
              setSelectedCategory("all");
              setSelectedSearch("");
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Menus;
