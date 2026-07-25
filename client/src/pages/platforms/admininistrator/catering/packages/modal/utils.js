export const buildData = (form) => {
  const { mainCourses = [], sideMenus = [], inclusions = [], ...rest } = form;
  const menuCategoriesFormatted = (datas) =>
    datas.map(({ choices, category, limit = 1 }) => {
      const _choices = choices.map(({ _id }) => _id);
      return { choices: _choices, limit, category: category._id };
    });
  const data = {
    ...rest,
    mainCourseCategories: menuCategoriesFormatted(mainCourses),
    ...(sideMenus?.length > 0 && {
      sideMenuCategories: menuCategoriesFormatted(sideMenus),
    }),
    ...(inclusions?.length > 0 && {
      inclusions: inclusions.map((data) => ({
        ...data,
        item: data.item?._id,
      })),
    }),
  };
  return data;
};
