const isImgURL = (value) => {
  if (typeof value !== "string") return false;

  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export default isImgURL;
