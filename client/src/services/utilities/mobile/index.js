const mobile = (contacts) => {
  if (!contacts) return "-";

  return `+63 ${contacts.slice(0, 3)}-${contacts.slice(3, 6)}-${contacts.slice(
    6,
    10
  )}`;
};

export default mobile;
