const isJSON = str => {
  try {
    JSON.parse(str);
  } catch (error) {
    return false;
  }

  return true;
};

const handleQuery = object => {
  let query = {};
  for (const key in object) {
    const item = object[key];
    if (typeof item === "string" && isJSON(item)) {
      query[key] = JSON.parse(item);
    } else {
      query[key] = item;
    }
  }

  return query;
};

module.exports = handleQuery;
