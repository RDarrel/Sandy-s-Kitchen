const Recipe = require("../../../../models/recipe/Recipe");

const ACTIVE_FILTER = {
  $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
};
const normalizeUnit = (unit = "") => String(unit || "").toLowerCase();

const attachRecipes = async (menus = []) => {
  try {
    if (!menus.length) return [];

    const recipes = await Recipe.find({
      parentType: "Menu",
      parentId: { $in: menus.map((item) => item._id) },
      ...ACTIVE_FILTER,
    })
      .populate("ingredients.inventory", "name type category measurement cost")
      .lean();
    const recipeMap = new Map(
      recipes.map((recipe) => [String(recipe.parentId), recipe]),
    );

    return menus.map((menu) => {
      const recipe = recipeMap.get(String(menu._id));
      const ingredients =
        recipe?.ingredients?.map((entry) => ({
          _id: entry?.inventory?._id,
          inventory: entry.inventory,
          qtyPerOrder: entry.qty,
          unit: normalizeUnit(entry.unit),
        })) || [];
      const primaryIngredient = ingredients[0] || null;

      return {
        ...menu,
        ingredients:
          menu?.type === "resell"
            ? [
                {
                  isResell: true,
                  inventory: menu?.inventory,
                  qtyPerOrder: quantity,
                  unit: "pcs",
                  menu: menu._id,
                },
              ]
            : ingredients,
        inventory: primaryIngredient?.inventory || menu.inventory || null,
        qtyPerOrder: primaryIngredient?.qtyPerOrder || menu.qtyPerOrder || null,
        unit: primaryIngredient?.unit || menu.unit || null,
      };
    });
  } catch (error) {
    console.log("Error in attachRecipes", error?.message);
  }
};

module.exports = {
  attachRecipes,
};
