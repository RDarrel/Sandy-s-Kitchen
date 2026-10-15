const { attachRecipes } = require("../../menu/helpers/attachRecipe");

const attachRecipesToDishes = async (bookings) => {
  if (bookings?.length === 0) return [];
  const menusMap = new Map();

  const menus = [
    ...new Map(
      bookings.flatMap(({ catering }) => {
        const { mainDishes = [], sideDishes = [] } = catering ?? {};

        return [...(mainDishes ?? []), ...(sideDishes ?? [])]
          .map(({ menu }) => menu)
          .filter((menu) => menu?._id)
          .map((menu) => [menu._id.toString(), menu]);
      }),
    ).values(),
  ];

  if (!menus.length) return bookings;

  const menusWithRecipes = await attachRecipes(menus);

  //attach menu to new mapmay ne

  menusWithRecipes.forEach((menu) => menusMap.set(String(menu?._id), menu));

  return bookings?.map((booking) => {
    if (booking?.bookingType === "venue") return booking;

    const { mainDishes = [], sideDishes = [] } = booking?.catering;
    const getDishesWithRecipe = (datas = []) =>
      datas.map((data) => ({
        ...data,
        menu: menusMap.get(String(data?.menu?._id)),
      }));

    return {
      ...booking,
      catering: {
        ...booking?.catering,
        mainDishes: getDishesWithRecipe(mainDishes),
        sideDishes: getDishesWithRecipe(sideDishes),
      },
    };
  });
};
module.exports = {
  attachRecipesToDishes,
};
