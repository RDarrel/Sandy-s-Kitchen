const AddOn = require("../../../models/menu/addons/AddOn");
const Recipe = require("../../../models/recipe/Recipe");

const ACTIVE_FILTER = {
  $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
};

const normalizeUnit = (unit = "") => String(unit || "").toLowerCase();

const normalizeIngredients = (ingredients = []) => {
  if (!Array.isArray(ingredients)) return [];

  return ingredients
    .map((entry) => ({
      inventory: entry?.inventory || null,
      qtyPerOrder: Number(entry?.qtyPerOrder) || 0,
      unit: normalizeUnit(entry?.unit),
    }))
    .filter(
      (entry) =>
        entry.inventory && entry.qtyPerOrder > 0 && Boolean(entry.unit),
    );
};

const buildAddOnPayload = (body = {}) => ({
  name: body.name,
  price: Number(body.price) || 0,
  description: body.description || "",
  hasRecipe: body.hasRecipe || false,
  group: body.group || "extras",
});

const syncRecipe = async (addOnId, ingredients = []) => {
  const recipe = await Recipe.findOne({
    parentId: addOnId,
    parentType: "AddOn",
  });

  if (!ingredients.length) {
    if (recipe && !recipe.deletedAt) {
      recipe.deletedAt = new Date();
      await recipe.save();
    }

    return;
  }

  const recipeIngredients = ingredients.map((entry) => ({
    inventory: entry.inventory,
    qty: entry.qtyPerOrder,
    unit: entry.unit,
  }));

  if (recipe) {
    recipe.ingredients = recipeIngredients;
    recipe.deletedAt = null;
    await recipe.save();
    return;
  }

  await Recipe.create({
    parentId: addOnId,
    parentType: "AddOn",
    ingredients: recipeIngredients,
  });
};

const attachRecipes = async (addOns = []) => {
  if (!addOns.length) return [];

  const recipes = await Recipe.find({
    parentType: "AddOn",
    parentId: { $in: addOns.map((item) => item._id) },
    ...ACTIVE_FILTER,
  })
    .populate("ingredients.inventory", "name type category measurement")
    .lean();

  const recipeMap = new Map(
    recipes.map((recipe) => [String(recipe.parentId), recipe]),
  );

  return addOns.map((addOn) => {
    const recipe = recipeMap.get(String(addOn._id));
    const ingredients =
      recipe?.ingredients?.map((entry) => ({
        inventory: entry.inventory,
        qtyPerOrder: entry.qty,
        unit: normalizeUnit(entry.unit),
      })) || [];
    const primaryIngredient = ingredients[0] || null;

    return {
      ...addOn,
      ingredients,
      inventory: primaryIngredient?.inventory || null,
      qtyPerOrder: primaryIngredient?.qtyPerOrder || null,
      unit: primaryIngredient?.unit || null,
    };
  });
};

const findAddOn = async (_id) => {
  const addOn = await AddOn.findById(_id).lean();
  if (!addOn) return null;

  const [hydratedAddOn] = await attachRecipes([addOn]);
  return hydratedAddOn;
};

exports.save = async (req, res) => {
  try {
    const ingredients = normalizeIngredients(req.body.ingredients);
    const addOn = await AddOn.create(buildAddOnPayload(req.body));

    await syncRecipe(addOn._id, ingredients);

    res.status(201).json({
      success: "Add-on created successfully",
      payload: await findAddOn(addOn._id),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.browse = async (req, res) => {
  try {
    const addOns = await AddOn.find(ACTIVE_FILTER)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: "Add-ons fetched successfully",
      payload: await attachRecipes(addOns),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { _id } = req.body;
    const ingredients = normalizeIngredients(req.body.ingredients);
    console.log(buildAddOnPayload(req.body));
    const addOn = await AddOn.findByIdAndUpdate(
      _id,
      buildAddOnPayload(req.body),
      {
        new: true,
        runValidators: true,
      },
    );

    if (!addOn) {
      return res.status(404).json({ error: "Add-on not found." });
    }

    await syncRecipe(_id, ingredients);

    res.status(200).json({
      success: "Add-on updated successfully",
      payload: await findAddOn(_id),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.destroy = async (req, res) => {
  try {
    const { _id } = req.body;
    const deletedAt = new Date();

    const addOn = await AddOn.findByIdAndUpdate(
      _id,
      { deletedAt },
      { new: true },
    ).lean();

    await Recipe.updateMany(
      { parentId: _id, parentType: "AddOn", ...ACTIVE_FILTER },
      { deletedAt },
    );

    res.status(200).json({
      success: "Add-on deleted successfully",
      payload: addOn,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
