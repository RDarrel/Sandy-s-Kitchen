const formatBatchNumber = (id) => {
  if (!id) return "—";

  return `B-${id.toString().slice(-6).toUpperCase()}`;
};

export default formatBatchNumber;
