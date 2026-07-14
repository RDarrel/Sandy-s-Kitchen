import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import Cloudinary from "@/services/utilities/cloudinary";
import { capitalize } from "lodash";
import {
  ListChecks,
  PackageCheck,
  Salad,
  Trash2,
  Utensils,
} from "lucide-react";
import { useCallback, useMemo } from "react";

const getCategoryKey = (menu) =>
  menu?.category?._id || menu?.category?.name || "uncategorized";

const getCategoryName = (menu) => menu?.category?.name || "Uncategorized";

const groupMenus = (menus) =>
  menus.reduce((acc, menu) => {
    const key = getCategoryKey(menu);
    const existing = acc.find((category) => category.key === key);

    if (existing) {
      existing.menus.push(menu);
      return acc;
    }

    acc.push({
      key,
      name: getCategoryName(menu),
      menus: [menu],
    });

    return acc;
  }, []);

const ChoiceLimitInput = ({ label = "Can select" }) => (
  <div className="flex min-w-0 items-center gap-2">
    <span className="shrink-0 text-xs font-medium text-muted-foreground">
      {label}
    </span>
    <InputGroup className="h-8 w-36 bg-background shadow-none">
      <InputGroupInput
        className="h-8 min-w-0 text-center text-sm font-medium"
        min="1"
        placeholder="0"
        type="number"
      />
      <InputGroupAddon
        align="inline-end"
        className="pr-2 text-xs font-normal"
      >
        menus
      </InputGroupAddon>
    </InputGroup>
  </div>
);

const MenuReviewSection = ({
  title,
  subtitle,
  icon,
  menus = [],
  emptyTitle,
  emptyDescription,
  sectionLimitLabel,
  onRemove = () => {},
  onUpdateQtyServe = () => {},
}) => {
  const groupedMenus = useMemo(() => groupMenus(menus), [menus]);
  const categoriesCount = groupedMenus.length;
  const totalGuestsServed = useMemo(
    () =>
      menus.reduce(
        (total, menu) => total + Number.parseInt(menu?.qtyServe || 0, 10),
        0,
      ),
    [menus],
  );

  return (
    <section className="overflow-hidden rounded-[7px] border border-border bg-card shadow-sm">
      <div className="grid gap-3 border-b bg-muted/20 px-4 py-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            {icon}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold leading-5 text-foreground">
              {title}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {subtitle}
            </p>
          </div>
        </div>

        {sectionLimitLabel && <ChoiceLimitInput label={sectionLimitLabel} />}

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Badge variant="secondary" className="rounded-full px-2.5 py-1">
            <ListChecks className="mr-1 size-3.5" />
            {menus.length} {menus.length === 1 ? "menu" : "menus"}
          </Badge>
          <Badge variant="outline" className="rounded-full px-2.5 py-1">
            {categoriesCount}{" "}
            {categoriesCount === 1 ? "category" : "categories"}
          </Badge>
          <Badge variant="outline" className="rounded-full px-2.5 py-1">
            {totalGuestsServed || 0} guests
          </Badge>
        </div>
      </div>

      {menus.length === 0 ? (
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
        <div className="max-h-[23rem] overflow-y-auto p-3">
          <div className="space-y-2.5">
            {groupedMenus.map((category) => (
              <div
                key={category.key}
                className="overflow-hidden rounded-md border border-border bg-background"
              >
                <div className="grid gap-3 border-b bg-muted/20 px-3 py-2.5 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {capitalize(category.name)}
                    </p>
                    <Badge
                      variant="outline"
                      className="shrink-0 rounded-full px-2 py-0.5 text-[11px]"
                    >
                      {category.menus.length}{" "}
                      {category.menus.length === 1 ? "menu" : "menus"}
                    </Badge>
                  </div>

                  <ChoiceLimitInput label="Customer can select" />

                  <p className="hidden text-right text-xs text-muted-foreground lg:block">
                    Guest served
                  </p>
                </div>

                <div className="divide-y">
                  {category.menus.map((menu, idx) => (
                    <div
                      key={menu?._id || `${category.key}-${idx}`}
                      className="grid grid-cols-[minmax(0,1fr)_5.5rem_2rem] items-center gap-3 px-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <img
                          className="size-10 rounded-md border object-cover shadow-sm"
                          alt={`${menu?.name || "Menu"} preview`}
                          src={Cloudinary.getMenuImg(menu?.imgId, menu?._id)}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {capitalize(menu?.name || "")}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            Good for{" "}
                            <span className="font-semibold">
                              {menu?.recipeYield || 1} person(s)
                            </span>
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="mb-1 text-right text-[10px] font-medium uppercase text-muted-foreground lg:hidden">
                          Guests
                        </p>
                        <Input
                          className="h-8 text-right"
                          min="1"
                          onChange={({ target }) =>
                            onUpdateQtyServe(menu._id, target.value)
                          }
                          placeholder="0"
                          type="number"
                          value={menu?.qtyServe || ""}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemove(menu._id)}
                        className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Remove ${menu?.name || "menu"}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

const Step4 = ({
  mainCourses = [],
  sideMenus = [],
  setMainCourses = () => {},
  setSideMenus = () => {},
}) => {
  const updateMainCourseQtyServe = useCallback(
    (menuId, qtyServe) => {
      setMainCourses((prev) =>
        prev.map((menu) =>
          menu._id === menuId
            ? {
                ...menu,
                qtyServe,
              }
            : menu,
        ),
      );
    },
    [setMainCourses],
  );

  const updateSideMenuQtyServe = useCallback(
    (menuId, qtyServe) => {
      setSideMenus((prev) =>
        prev.map((menu) =>
          menu._id === menuId
            ? {
                ...menu,
                qtyServe,
              }
            : menu,
        ),
      );
    },
    [setSideMenus],
  );

  const removeMainCourse = useCallback(
    (menuId) => {
      setMainCourses((prev) => prev.filter(({ _id }) => _id !== menuId));
    },
    [setMainCourses],
  );

  const removeSideMenu = useCallback(
    (menuId) => {
      setSideMenus((prev) => prev.filter(({ _id }) => _id !== menuId));
    },
    [setSideMenus],
  );

  return (
    <div className="space-y-5">
      <MenuReviewSection
        title="Main Courses"
        subtitle="Review selected main courses and set the guests served."
        icon={<PackageCheck className="size-5" />}
        menus={mainCourses}
        emptyTitle="No main courses selected yet"
        emptyDescription="Go back to Main Course and choose menus for this package."
        sectionLimitLabel="Main course limit"
        onRemove={removeMainCourse}
        onUpdateQtyServe={updateMainCourseQtyServe}
      />

      <MenuReviewSection
        title="Side Menus"
        subtitle="Review selected side menus and set the guests served."
        icon={<Salad className="size-5" />}
        menus={sideMenus}
        emptyTitle="No side menus selected yet"
        emptyDescription="Go back to Side Menus and choose add-ons for this package."
        onRemove={removeSideMenu}
        onUpdateQtyServe={updateSideMenuQtyServe}
      />
    </div>
  );
};

export default Step4;
