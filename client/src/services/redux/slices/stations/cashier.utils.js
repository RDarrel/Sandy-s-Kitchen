export function createCartLineId() {
  if (globalThis?.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createCartSignature(menuId, addOnIds = []) {
  const normalizedMenuId = String(menuId || "");
  const normalized = (Array.isArray(addOnIds) ? addOnIds : [])
    .map((id) => String(id || ""))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
  return `${normalizedMenuId}::${normalized.join(",")}`;
}

export function normalizeAddOns(addOns = []) {
  return (Array.isArray(addOns) ? addOns : [])
    .map((item) => ({
      _id: String(item?._id || ""),
      name: item?.name || "Untitled add-on",
      price: Number(item?.price) || 0,
      group: item?.group || "extras",
    }))
    .filter((item) => item._id)
    .sort((a, b) => a._id.localeCompare(b._id));
}

export function normalizeCart(cart) {
  const lines = Array.isArray(cart?.lines) ? cart.lines : [];
  const normalizedLines = lines
    .map((line) => ({
      id: String(line?.id || ""),
      menuId: String(line?.menuId || ""),
      quantity: Math.max(0, Number(line?.quantity) || 0),
      addOns: normalizeAddOns(line?.addOns || []),
      signature: String(line?.signature || ""),
      updatedAt: Number(line?.updatedAt) || 0,
      addedAt: Number(line?.addedAt) || 0,
    }))
    .filter((line) => line.id && line.menuId && line.quantity > 0);

  return { version: 2, lines: normalizedLines };
}

export function loadCashierCartFromStorage() {
  try {
    const saved = localStorage.getItem("cashierCart");
    if (!saved) return { version: 2, lines: [] };
    const parsed = JSON.parse(saved);

    if (parsed && typeof parsed === "object" && Array.isArray(parsed.lines)) {
      return normalizeCart(parsed);
    }

    // Legacy object format: { [menuId]: qty }
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const legacyLines = Object.entries(parsed)
        .map(([menuId, qty]) => {
          const quantity = Math.max(0, Number(qty) || 0);
          if (!menuId || !quantity) return null;
          const normalizedMenuId = String(menuId || "");
          return {
            id: createCartLineId(),
            menuId: normalizedMenuId,
            quantity,
            addOns: [],
            signature: createCartSignature(normalizedMenuId, []),
            updatedAt: 0,
            addedAt: 0,
          };
        })
        .filter(Boolean);
      return normalizeCart({ version: 2, lines: legacyLines });
    }

    return { version: 2, lines: [] };
  } catch {
    return { version: 2, lines: [] };
  }
}
