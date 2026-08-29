import { capitalize, isNumber } from "lodash";
import { memo, useMemo } from "react";
import Menu from "./menu";

import { Badge } from "@/components/ui/badge";
import { CircleCheck, ListChecks, TriangleAlert, Utensils } from "lucide-react";

import LimitInput from "./limitInput";
import { cn } from "@/lib/utils";

const Cluster = ({
  title = "",
  subtitle = "",
  emptyTitle = "",
  emptyDescription = "",
  isMainCourse = false,
  targetPax = 0,
  icon,
  menuCategories = [],
  onUpdateCategoryLimit = () => {},
}) => {
  const menusCount = useMemo(() => {
    return menuCategories.reduce(
      (acc, curr) => acc + (curr?.choices?.length || 0),
      0,
    );
  }, [menuCategories]);

  // Total selection capacity configured across all categories.
  const categoryCapacity = useMemo(() => {
    return menuCategories.reduce(
      (acc, curr) => acc + (isNumber(curr?.limit) ? curr.limit : 1),
      0,
    );
  }, [menuCategories]);

  // Number of additional selections required to satisfy the overall limit.
  const remainingCapacity = Math.max(targetPax - categoryCapacity, 0);

  const hasEnoughCapacity = categoryCapacity >= targetPax;

  return (
    <section className="rounded-sm border border-border bg-card shadow-sm">
      {/* =========================================================
          CLUSTER HEADER
          ========================================================= */}
      <div
        className="
          sticky top-0 z-[40]
          grid gap-3
          rounded-t-md
          border-b
          bg-background
          px-4 py-3
          lg:grid-cols-[minmax(0,1fr)_auto]
          lg:items-center
        "
      >
        {/* TITLE */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            {icon}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold leading-5 text-foreground">
              {title}
            </p>

            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Badge variant="secondary" className="rounded-full px-2.5 py-1">
            <ListChecks className="mr-1 size-3.5" />
            {menusCount} {menusCount === 1 ? "menu" : "menus"}
          </Badge>

          <Badge variant="outline" className="rounded-full px-2.5 py-1">
            {menuCategories.length}{" "}
            {menuCategories.length === 1 ? "category" : "categories"}
          </Badge>
        </div>
      </div>

      {/* =========================================================
          EMPTY STATE
          ========================================================= */}
      {menuCategories.length === 0 ? (
        <div className="flex min-h-40 flex-col items-center justify-center gap-3 px-4 py-8 text-center">
          <div className="flex size-11 items-center justify-center rounded-md border border-dashed bg-muted/30 text-muted-foreground">
            <Utensils className="size-5" />
          </div>

          <div>
            <p className="text-sm font-medium text-foreground">{emptyTitle}</p>

            <p className="mt-1 text-xs text-muted-foreground">
              {emptyDescription}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3">
          {/* =====================================================
              MAIN COURSE CAPACITY
              Only shown for Main Course.
              ===================================================== */}
          {isMainCourse && (
            <div
              className={cn(
                " mb-3",
                !hasEnoughCapacity && "sticky top-16 z-[30]",
              )}
            >
              <div
                className={cn(
                  `
                    flex items-center justify-between gap-4
                    rounded-md
                    border
                    px-3 py-2
                  `,
                  hasEnoughCapacity
                    ? "border-border bg-background"
                    : "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950",
                )}
              >
                {/* CUSTOMER LIMIT */}
                <div className="flex min-w-0 items-start gap-2.5">
                  {hasEnoughCapacity ? (
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                  ) : (
                    <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  )}

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground">
                      Customer can select up to{" "}
                      <span className="font-semibold">
                        {targetPax} {targetPax === 1 ? "menu" : "menus"}
                      </span>
                    </p>

                    <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
                      {hasEnoughCapacity
                        ? "Category selection limits meet the requirement."
                        : `Increase one or more category selection limits by ${remainingCapacity} ${
                            remainingCapacity === 1 ? "menu" : "menus"
                          }.`}
                    </p>
                  </div>
                </div>

                {/* CATEGORY CAPACITY */}
                <div className="shrink-0 border-l pl-4 text-right">
                  <p className="text-[11px] text-muted-foreground">
                    Total category limits
                  </p>

                  <p className="mt-0.5 text-sm font-semibold leading-4 text-foreground">
                    {categoryCapacity} / {targetPax}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              CATEGORIES
              ===================================================== */}
          <div className="space-y-2.5">
            {menuCategories.map(({ category, choices, limit = 1 }) => (
              <Category
                choices={choices}
                category={category}
                limit={limit}
                key={category?._id}
                isMainCourse={isMainCourse}
                hasEnoughCapacity={hasEnoughCapacity}
                onUpdateCategoryLimit={onUpdateCategoryLimit}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default memo(Cluster);

/* ===============================================================
   CATEGORY
   =============================================================== */

const Category = memo(
  ({
    category,
    choices,
    limit,
    isMainCourse,
    onUpdateCategoryLimit,
    hasEnoughCapacity,
  }) => {
    return (
      <div className="rounded-md border border-border bg-background">
        <div
          className={cn(
            `
              sticky
              z-[20]
              grid gap-3
              rounded-t-md
              border-b
              bg-muted
              px-3 py-2
              lg:grid-cols-[minmax(0,1fr)_auto_auto]
              lg:items-center
            `,
            isMainCourse && !hasEnoughCapacity ? "top-[7.5rem]" : "top-16",
          )}
        >
          {/* CATEGORY NAME */}
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">
              {capitalize(category.name)}
            </p>

            <Badge
              variant="outline"
              className="shrink-0 rounded-full px-2 py-0.5 text-[11px]"
            >
              {choices.length} {choices.length === 1 ? "menu" : "menus"}
            </Badge>
          </div>

          {/* SELECTION LIMIT */}
          <LimitInput
            label="Selection Limit"
            limit={limit}
            menuCount={choices.length}
            isMainCourse={isMainCourse}
            categoryId={category?._id}
            onUpdateCategoryLimit={onUpdateCategoryLimit}
          />

          <span className="hidden lg:block" />
        </div>

        {/* =====================================================
            MENU LIST
            ===================================================== */}
        <div className="divide-y">
          {choices.map((menu, idx) => (
            <Menu menu={menu} key={idx} />
          ))}
        </div>
      </div>
    );
  },
);
