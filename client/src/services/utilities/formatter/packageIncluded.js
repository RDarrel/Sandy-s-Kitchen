const MAX_VISIBLE_MENUS = 6;
const MAX_VISIBLE_MENUS_WITH_MORE = 5;

const flattedData = (datas) =>
  datas.flatMap(({ choices }) => choices.map((choice) => choice));

const getLength = (datas) =>
  datas.reduce((acc, curr) => acc + curr?.choices?.length, 0);

const packageIncluded = (item) => {
  const { mainCourseCategories = [], sideMenuCategories = [] } = item;
  const mainMenus = flattedData(mainCourseCategories);
  const sideMenus = flattedData(sideMenuCategories);
  const included = [...mainMenus, sideMenus];

  const totalLength =
    getLength(mainCourseCategories) + getLength(sideMenuCategories);

  const hasHiddenInclusions = totalLength > MAX_VISIBLE_MENUS;
  const visibleLimit = hasHiddenInclusions
    ? MAX_VISIBLE_MENUS_WITH_MORE
    : MAX_VISIBLE_MENUS;
  const visibleMenus = included.slice(0, visibleLimit);
  const hiddenInclusions = totalLength - visibleMenus.length;

  return { hiddenInclusions, visibleMenus, hasHiddenInclusions };
};

export default packageIncluded;
