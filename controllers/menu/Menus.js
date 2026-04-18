const Menu = require("../../models/menu/Menu");
const MenuComposition = require("../../models/menu/MenuComposition");
const Recipe = require("../../models/recipe/Recipe");

const ACTIVE_FILTER = {
  $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
};

const normalizeUnit = (unit = "") => String(unit || "").toLowerCase();

const normalizeIngredients = (body = {}) => {
  const sourceIngredients =
    body.type === "resell" && body.inventory
      ? [
          {
            inventory: body.inventory,
            qtyPerOrder: body.qtyPerOrder || 1,
            unit: body.unit,
          },
        ]
      : body.ingredients;

  if (!Array.isArray(sourceIngredients)) return [];

  return sourceIngredients
    .map((entry) => ({
      inventory: entry?.inventory?._id || entry?.inventory || null,
      qtyPerOrder: Number(entry?.qtyPerOrder) || 0,
      unit: normalizeUnit(entry?.unit),
    }))
    .filter(
      (entry) =>
        entry.inventory && entry.qtyPerOrder > 0 && Boolean(entry.unit),
    );
};

const normalizeBundleItems = (bundleItems = []) => {
  if (!Array.isArray(bundleItems)) return [];

  return bundleItems
    .map((entry) => ({
      menu: entry?._id || entry?.id || entry?.menu?._id || entry?.menu || null,
      qty: Math.max(1, Number(entry?.quantity || entry?.qty || 1)),
    }))
    .filter((entry) => entry.menu);
};

const buildMenuPayload = (body = {}, normalizedIngredients = []) => {
  const primaryIngredient = normalizedIngredients[0] || null;
  const type = body.type || "prepared";

  return {
    name: body.name,
    price: Number(body.price) || 0,
    description: body.description || "",
    type,
    category: body.category,
    hasRecipe: type === "prepared" ? normalizedIngredients.length > 0 : false,
    inventory:
      type === "bundle" ? null : primaryIngredient?.inventory || null,
    qtyPerOrder:
      type === "bundle" ? null : primaryIngredient?.qtyPerOrder || null,
    unit: type === "bundle" ? null : primaryIngredient?.unit || null,
  };
};

const syncRecipe = async (menuId, ingredients = []) => {
  const recipe = await Recipe.findOne({
    parentId: menuId,
    parentType: "Menu",
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
    parentId: menuId,
    parentType: "Menu",
    ingredients: recipeIngredients,
  });
};

const syncComposition = async (menuId, bundleItems = []) => {
  const composition = await MenuComposition.findOne({ menu: menuId });

  if (!bundleItems.length) {
    if (composition && !composition.deletedAt) {
      composition.deletedAt = new Date();
      await composition.save();
    }

    return;
  }

  if (composition) {
    composition.item = bundleItems;
    composition.deletedAt = null;
    await composition.save();
    return;
  }

  await MenuComposition.create({
    menu: menuId,
    item: bundleItems,
  });
};

const attachRecipes = async (menus = []) => {
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
        inventory: entry.inventory,
        qtyPerOrder: entry.qty,
        unit: normalizeUnit(entry.unit),
      })) || [];
    const primaryIngredient = ingredients[0] || null;

    return {
      ...menu,
      ingredients,
      inventory: primaryIngredient?.inventory || menu.inventory || null,
      qtyPerOrder: primaryIngredient?.qtyPerOrder || menu.qtyPerOrder || null,
      unit: primaryIngredient?.unit || menu.unit || null,
    };
  });
};

const attachCompositions = async (menus = []) => {
  if (!menus.length) return [];

  const compositions = await MenuComposition.find({
    menu: { $in: menus.map((item) => item._id) },
    ...ACTIVE_FILTER,
  })
    .populate("item.menu", "name price category imgId type")
    .lean();

  const compositionMap = new Map(
    compositions.map((composition) => [String(composition.menu), composition]),
  );

  return menus.map((menu) => {
    const composition = compositionMap.get(String(menu._id));
    const bundleItems =
      composition?.item?.map((entry) => ({
        ...(entry.menu || {}),
        id: entry?.menu?._id || entry?.menu || null,
        quantity: entry.qty,
      })) || [];

    return {
      ...menu,
      bundleItems,
    };
  });
};

const hydrateMenus = async (menus = []) => {
  const menusWithRecipes = await attachRecipes(menus);
  return attachCompositions(menusWithRecipes);
};

const findMenu = async (_id) => {
  const menu = await Menu.findById(_id).lean();
  if (!menu) return null;

  const [hydratedMenu] = await hydrateMenus([menu]);
  return hydratedMenu;
};

exports.save = async (req, res) => {
  try {
    const normalizedIngredients = normalizeIngredients(req.body);
    const normalizedBundleItems =
      req.body.type === "bundle"
        ? normalizeBundleItems(req.body.bundleItems)
        : [];
    const menu = await Menu.create(
      buildMenuPayload(req.body, normalizedIngredients),
    );

    await syncRecipe(
      menu._id,
      req.body.type === "bundle" ? [] : normalizedIngredients,
    );
    await syncComposition(menu._id, normalizedBundleItems);

    res.status(201).json({
      success: "Menu Created Successfully",
      payload: await findMenu(menu._id),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.browse = async (req, res) => {
  try {
    const menus = await Menu.find(ACTIVE_FILTER).sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: "Menu Fetched Successfully",
      payload: await hydrateMenus(menus),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { _id } = req.body;
    const normalizedIngredients = normalizeIngredients(req.body);
    const normalizedBundleItems =
      req.body.type === "bundle"
        ? normalizeBundleItems(req.body.bundleItems)
        : [];
    const updatedMenu = await Menu.findByIdAndUpdate(
      _id,
      buildMenuPayload(req.body, normalizedIngredients),
      {
        new: true,
        runValidators: true,
      },
    ).lean();

    if (!updatedMenu) {
      return res.status(404).json({ error: "Menu not found." });
    }

    await syncRecipe(
      _id,
      req.body.type === "bundle" ? [] : normalizedIngredients,
    );
    await syncComposition(_id, normalizedBundleItems);

    res.status(200).json({
      success: "Menu Updated Successfully",
      payload: await findMenu(_id),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.destroy = async (req, res) => {
  try {
    const { _id } = req.body;
    const deletedAt = new Date();

    const deletedMenu = await Menu.findByIdAndUpdate(
      _id,
      { deletedAt },
      {
        new: true,
      },
    ).lean();

    await Recipe.updateMany(
      { parentId: _id, parentType: "Menu", ...ACTIVE_FILTER },
      { deletedAt },
    );
    await MenuComposition.updateMany(
      { menu: _id, ...ACTIVE_FILTER },
      { deletedAt },
    );

    res.status(200).json({
      success: "Menu Deleted Successfully",
      payload: deletedMenu,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
