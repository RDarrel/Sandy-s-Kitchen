const Menu = require("../../models/menu/Menu");
const MenuComposition = require("../../models/menu/MenuComposition");
const MenuAddOn = require("../../models/menu/addons/MenuAddOn");
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

const normalizeRecommendedAddOns = (value = []) => {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => entry?._id || entry)
    .filter(Boolean)
    .map((entry) => String(entry));
};

const buildMenuPayload = (
  body = {},
  normalizedIngredients = [],
  normalizedBundleItems = [],
) => {
  const primaryIngredient = normalizedIngredients[0] || null;
  const type = body.type || "prepared";
  const shouldSetAvailability = Object.prototype.hasOwnProperty.call(
    body,
    "isAvailable",
  );
  const hasSetup =
    type === "bundle"
      ? normalizedBundleItems.length > 0
      : normalizedIngredients.length > 0;

  return {
    name: body.name,
    price: Number(body.price) || 0,
    description: body.description || "",
    type,
    category: body.category,
    hasRecipe: type === "prepared" ? normalizedIngredients.length > 0 : false,
    inventory: type === "bundle" ? null : primaryIngredient?.inventory || null,
    qtyPerOrder:
      type === "bundle" ? null : primaryIngredient?.qtyPerOrder || null,
    unit: type === "bundle" ? null : primaryIngredient?.unit || null,
    ...(shouldSetAvailability
      ? { isAvailable: Boolean(body.isAvailable) && hasSetup }
      : {}),
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

const syncMenuAddOns = async (menuId, addOnIds = []) => {
  const normalizedMenuId = String(menuId || "").trim();
  if (!normalizedMenuId) return;

  const normalizedAddOnIds = Array.from(
    new Set((Array.isArray(addOnIds) ? addOnIds : []).map(String)),
  ).filter(Boolean);

  const currentLinks = await MenuAddOn.find({ menu: menuId }).lean();
  const linksByAddOnId = currentLinks.reduce((accumulator, link) => {
    const addOnId = String(link.addOn);
    if (!accumulator.has(addOnId)) {
      accumulator.set(addOnId, []);
    }
    accumulator.get(addOnId).push(link);
    return accumulator;
  }, new Map());
  const desiredSet = new Set(normalizedAddOnIds);
  const deletedAt = new Date();

  const operations = [];

  linksByAddOnId.forEach((links, addOnId) => {
    const shouldKeep = desiredSet.has(addOnId);
    const primaryLink = links.find((link) => !link.deletedAt) || links[0];

    links.forEach((link) => {
      if (String(link._id) === String(primaryLink._id)) return;
      if (link.deletedAt) return;

      operations.push({
        updateOne: {
          filter: { _id: link._id },
          update: { $set: { deletedAt } },
        },
      });
    });

    if (shouldKeep && primaryLink.deletedAt) {
      operations.push({
        updateOne: {
          filter: { _id: primaryLink._id },
          update: { $set: { deletedAt: null } },
        },
      });
    }

    if (!shouldKeep && !primaryLink.deletedAt) {
      operations.push({
        updateOne: {
          filter: { _id: primaryLink._id },
          update: { $set: { deletedAt } },
        },
      });
    }
  });

  normalizedAddOnIds.forEach((addOnId) => {
    if (linksByAddOnId.has(addOnId)) return;

    operations.push({
      insertOne: {
        document: {
          menu: menuId,
          addOn: addOnId,
          deletedAt: null,
        },
      },
    });
  });

  if (operations.length) {
    await MenuAddOn.bulkWrite(operations);
  }
};

const attachRecommendedAddOns = async (menus = []) => {
  if (!menus.length) return [];

  const menuIds = menus.map((menu) => menu._id);

  const links = await MenuAddOn.find({
    menu: { $in: menuIds },
    ...ACTIVE_FILTER,
  })
    .populate("addOn", "name price description group")
    .lean();

  const addOnsByMenuId = links.reduce((accumulator, link) => {
    const menuId = String(link.menu);
    const addOn = link.addOn || null;

    if (!accumulator.has(menuId)) {
      accumulator.set(menuId, []);
    }

    if (addOn) {
      accumulator.get(menuId).push(addOn);
    }

    return accumulator;
  }, new Map());

  return menus.map((menu) => ({
    ...menu,
    recommendedAddOns: addOnsByMenuId.get(String(menu._id)) || [],
  }));
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
  const menusWithCompositions = await attachCompositions(menusWithRecipes);
  return attachRecommendedAddOns(menusWithCompositions);
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
    const normalizedRecommendedAddOns = normalizeRecommendedAddOns(
      req.body.recommendedAddOns,
    );
    const normalizedBundleItems =
      req.body.type === "bundle"
        ? normalizeBundleItems(req.body.bundleItems)
        : [];

    if (
      req.body.type === "bundle" &&
      normalizedBundleItems.length === 1 &&
      Boolean(req.body.isAvailable)
    ) {
      return res.status(400).json({
        error: "Bundle composition must include at least 2 menu items.",
      });
    }

    const menu = await Menu.create(
      buildMenuPayload(req.body, normalizedIngredients, normalizedBundleItems),
    );

    await syncRecipe(
      menu._id,
      req.body.type === "bundle" ? [] : normalizedIngredients,
    );
    await syncComposition(menu._id, normalizedBundleItems);
    await syncMenuAddOns(menu._id, normalizedRecommendedAddOns);

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
    const station = req?.query?.station || "";
    var menus = [];
    if (station === "cashier") {
      menus = await Menu.find(ACTIVE_FILTER)
        .sort({ createdAt: -1 })
        .populate("category", "name")
        .lean();
    } else {
      menus = await Menu.find(ACTIVE_FILTER).sort({ createdAt: -1 }).lean();
    }

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
    const normalizedRecommendedAddOns = normalizeRecommendedAddOns(
      req.body.recommendedAddOns,
    );
    const normalizedBundleItems =
      req.body.type === "bundle"
        ? normalizeBundleItems(req.body.bundleItems)
        : [];

    if (
      req.body.type === "bundle" &&
      normalizedBundleItems.length === 1 &&
      Boolean(req.body.isAvailable)
    ) {
      return res.status(400).json({
        error: "Bundle composition must include at least 2 menu items.",
      });
    }

    const updatedMenu = await Menu.findByIdAndUpdate(
      _id,
      buildMenuPayload(req.body, normalizedIngredients, normalizedBundleItems),
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
    await syncMenuAddOns(_id, normalizedRecommendedAddOns);

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
    await MenuAddOn.updateMany({ menu: _id, ...ACTIVE_FILTER }, { deletedAt });

    res.status(200).json({
      success: "Menu Deleted Successfully",
      payload: deletedMenu,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.availability = async (req, res) => {
  try {
    const { _id, isAvailable } = req.body;

    if (!_id) {
      return res.status(400).json({ error: "Menu ID is required." });
    }

    const existingMenu = await findMenu(_id);
    if (!existingMenu) {
      return res.status(404).json({ error: "Menu not found." });
    }

    const hasSetup =
      existingMenu.type === "bundle"
        ? (existingMenu.bundleItems || []).length > 0
        : existingMenu.type === "resell"
          ? Boolean(existingMenu.inventory)
          : (existingMenu.ingredients || []).length > 0;

    const nextAvailability = Boolean(isAvailable) && hasSetup;

    const updatedMenu = await Menu.findByIdAndUpdate(
      _id,
      { isAvailable: nextAvailability },
      { new: true, runValidators: true },
    ).lean();

    if (!updatedMenu) {
      return res.status(404).json({ error: "Menu not found." });
    }

    res.status(200).json({
      success: "Menu Availability Updated Successfully",
      payload: await findMenu(_id),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
