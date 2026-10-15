import { memo, useEffect, useMemo } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, Info, RotateCcw } from "lucide-react";
import { formatItemName } from "../../utils";
import {
  convertIngredientQty,
  formatIngredientName,
  getIngredientKey,
  getIngredientUnitOptions,
  getMenuIngredients,
  getMenuKey,
  getPrecalculatedIngredient,
} from "./utils";
import Cloudinary from "@/services/utilities/cloudinary";
import { EmptyPanel, SectionTitle } from "../../components";
import { Stock } from "@/services/utilities";

const Dishes = ({
  isPending,
  isViewOnly,
  title,
  type = "mainDishes",
  items,
  catering = {},
  openMenuKey,
  invalidDishTarget = null,
  handleDishPreparationChange = () => {},
  setOpenMenuKey = () => {},
}) => {
  useEffect(() => {
    if (invalidDishTarget?.dishType !== type) return;

    const invalidItem = items.find(
      (item) => item?.menu?._id === invalidDishTarget?.menuId,
    );

    if (invalidItem) {
      setOpenMenuKey(`${title}-${getMenuKey(invalidItem)}`);
    }
  }, [invalidDishTarget, items, setOpenMenuKey, title, type]);

  return (
    <section className="rounded-md border bg-muted/10 p-2.5">
      <SectionTitle title={title} />

      {items.length > 0 ? (
        <div className="grid gap-1">
          {items.map((item) => {
            const menuKey = `${title}-${getMenuKey(item)}`;

            return (
              <MenuItemPanel
                key={menuKey}
                type={type}
                item={item}
                isPending={isPending}
                isViewOnly={isViewOnly}
                catering={catering}
                isOpen={openMenuKey === menuKey}
                onOpenChange={(isOpen) =>
                  setOpenMenuKey(isOpen ? menuKey : null)
                }
                invalidDishTarget={invalidDishTarget}
                handleDishPreparationChange={handleDishPreparationChange}
              />
            );
          })}
        </div>
      ) : (
        <EmptyPanel label={`No ${title.toLowerCase()} selected`} />
      )}
    </section>
  );
};

export default memo(Dishes);

const MenuItemPanel = memo(
  ({
    isViewOnly,
    isPending,
    type,
    item,
    catering,
    isOpen,
    onOpenChange,
    handleDishPreparationChange,
  }) => {
    const { servings, bookingIngredients } = useMemo(() => {
      const dishes = [...(catering[type] ?? [])];
      const { servings = null, ingredients = [] } =
        dishes.find(({ menu }) => menu?._id === item?.menu?._id) || {};

      return {
        servings: servings === null ? catering?.pax : servings,
        bookingIngredients: ingredients,
      };
    }, [catering, item?.menu?._id, type]);

    const menu = item?.menu;
    const recipeIngredients = getMenuIngredients(item);
    const recipeYield = Math.max(
      Number(item?.recipeYield || menu?.recipeYield || 1),
      1,
    );

    const menuRecipeYield = Math.max(Number(menu?.recipeYield || 1), 1);

    const handleServingsChanges = (servings) => {
      handleDishPreparationChange(
        true,
        type,
        { menuId: item?.menu?._id },
        { servings },
      );
    };

    return (
      <Collapsible
        open={isOpen}
        onOpenChange={onOpenChange}
        className="rounded-md border bg-background transition-colors data-[state=open]:border-primary/25 data-[state=open]:bg-primary/5 data-[state=open]:shadow-xs"
      >
        <div className="grid grid-cols-[minmax(0,1fr)_8.75rem] items-center gap-2 px-2 py-1.5">
          <CollapsibleTrigger
            type="button"
            className="flex min-w-0 cursor-pointer items-center gap-2 rounded-sm text-left transition-colors hover:text-primary"
          >
            <img
              className="size-9 shrink-0 rounded-md border object-cover"
              alt={`${formatItemName(menu || item)} preview`}
              src={Cloudinary.getMenuImg(menu?.imgId, menu?._id)}
            />

            <span className="min-w-0">
              <span className="block truncate text-xs font-semibold">
                {formatItemName(menu || item)}
              </span>
              <span className="block truncate text-[10px] text-muted-foreground">
                Recipe Yield:{" "}
                <span className="font-semibold text-foreground">
                  {menuRecipeYield}{" "}
                  {menuRecipeYield === 1 ? "person" : "persons"}
                </span>
              </span>
            </span>
          </CollapsibleTrigger>

          <div className="grid gap-0.5">
            <span className="text-[10px] font-medium text-muted-foreground">
              Servings
            </span>

            <div className="grid grid-cols-[minmax(0,1fr)_1.75rem] gap-1">
              <Input
                type="number"
                min="1"
                required
                readOnly={isViewOnly}
                name={`${type}-${item?.menu?._id}-servings`}
                value={String(servings || "")}
                onInvalid={() => onOpenChange(true)}
                onChange={({ target }) =>
                  handleServingsChanges(Number(target.value))
                }
                className="h-7 px-2 text-xs"
              />

              <CollapsibleTrigger
                type="button"
                aria-label={`Toggle ${formatItemName(menu || item)} ingredients`}
                className="group flex size-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronDown className="size-3.5 transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
            </div>
          </div>
        </div>

        <CollapsibleContent className="border-t bg-muted/10 px-2 py-2">
          {isPending && isViewOnly && (
            <div className="mb-1.5 flex items-start gap-1.5 rounded-sm border bg-muted/20 px-2 py-1.5">
              <Info className="mt-0.5 size-3 shrink-0 text-muted-foreground" />

              <div className="min-w-0">
                <p className="text-[11px] font-medium">Estimated ingredients</p>
                <p className="text-[10px] leading-tight text-muted-foreground">
                  Based on current recipe and requested servings.
                </p>
              </div>
            </div>
          )}
          {recipeIngredients.length > 0 ? (
            <div className="grid gap-1">
              {recipeIngredients.map((ingredient, index) => (
                <IngredientRow
                  key={getIngredientKey(ingredient, index)}
                  type={type}
                  bookingIngredients={bookingIngredients}
                  isPending={isPending}
                  isViewOnly={isViewOnly}
                  ingredient={ingredient}
                  servings={servings}
                  menuId={menu?._id}
                  recipeYield={recipeYield}
                  handleDishPreparationChange={handleDishPreparationChange}
                />
              ))}
            </div>
          ) : (
            <EmptyPanel label="No ingredients listed" />
          )}
        </CollapsibleContent>
      </Collapsible>
    );
  },
);

const IngredientRow = memo(
  ({
    isViewOnly,
    type,
    menuId,
    ingredient,
    servings,
    recipeYield,
    bookingIngredients = [],
    handleDishPreparationChange,
  }) => {
    const precalculated = getPrecalculatedIngredient(
      ingredient,
      servings,
      recipeYield,
    );

    const { qty, unit } = useMemo(() => {
      const bookingIngredient =
        bookingIngredients?.find(
          ({ inventory }) => inventory === ingredient?.inventory?._id,
        ) || null;

      if (!bookingIngredient) {
        return getPrecalculatedIngredient(ingredient, servings, recipeYield);
      } else {
        return {
          qty: bookingIngredient?.requiredQty,
          unit: bookingIngredient?.unit,
        };
      }
    }, [bookingIngredients, ingredient, recipeYield, servings]);

    const unitOptions = getIngredientUnitOptions(ingredient);

    const handleUnitChange = (nextUnit) => {
      handleChange(convertIngredientQty(qty, unit, nextUnit), nextUnit);
    };

    const handleReset = () => {
      handleChange(precalculated?.qty, precalculated?.unit);
    };

    const handleChange = (ingredientQty, unit) => {
      handleDishPreparationChange(
        false,
        type,
        {
          menuId,
          ingredientId: ingredient?.inventory?._id,
        },
        {
          ingredientQty: Number(ingredientQty),
          unit,
        },
      );
    };

    const hasAdjustment =
      Stock.convertToBaseUnit(qty, unit) !==
      Stock.convertToBaseUnit(precalculated?.qty, precalculated?.unit);

    return (
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-sm bg-background px-2 py-1 text-[11px]">
        <span className="truncate font-medium">
          {formatIngredientName(ingredient)}
        </span>

        <div className="flex items-center justify-end gap-2">
          <Input
            type="number"
            readOnly={isViewOnly}
            min={unit === "pcs" ? "1" : "0.01"}
            step={unit === "pcs" ? "1" : "0.01"}
            required
            name={`${type}-${menuId}-${ingredient?.inventory?._id}-qty`}
            value={String(qty || "")}
            onChange={({ target }) => handleChange(target.value, unit)}
            className="h-7 w-20 px-2 text-xs"
          />

          <Select
            required
            name={`${type}-${menuId}-${ingredient?.inventory?._id}-unit`}
            value={unit}
            onValueChange={handleUnitChange}
            disabled={isViewOnly}
          >
            <SelectTrigger
              size="sm"
              className="!h-7 !min-h-7 w-15 !px-2 text-xs leading-4
      disabled:opacity-100
      disabled:text-foreground
      disabled:bg-background
      disabled:cursor-default
      [&_svg]:!size-3
      [&_[data-slot=select-value]]:text-foreground"
            >
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {unitOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasAdjustment && !isViewOnly && (
            <button
              type="button"
              aria-label={`Reset ${formatIngredientName(ingredient)} quantity`}
              onClick={handleReset}
              className="flex size-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  },
);
