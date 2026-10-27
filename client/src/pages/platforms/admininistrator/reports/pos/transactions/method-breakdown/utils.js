export const getMethodBreakdown = (transactions = [], methods = []) => {
  const groups = new Map(
    methods.map((method) => [
      String(method._id),
      { ...method, amount: 0, count: 0 },
    ]),
  );
  let total = 0;

  for (const transaction of transactions) {
    const method = transaction.method;
    const id = String(method?._id || method || "unknown");
    if (!groups.has(id)) {
      groups.set(id, {
        ...(typeof method === "object" && method),
        _id: id,
        name: method?.name || "Unspecified method",
        amount: 0,
        count: 0,
      });
    }

    const value = Number(transaction.amount ?? 0);
    const amount = Number.isFinite(value) ? value : 0;
    const group = groups.get(id);
    group.amount += amount;
    group.count += 1;
    total += amount;
  }

  const breakdown = [...groups.values()]
    .map((method) => ({
      ...method,
      share: total > 0 ? (method.amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount || a.name.localeCompare(b.name));

  return { total, count: transactions.length, breakdown };
};
