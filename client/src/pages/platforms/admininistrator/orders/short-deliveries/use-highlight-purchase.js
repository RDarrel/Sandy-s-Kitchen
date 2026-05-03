import { useEffect } from "react";

const getTargetPageForPurchase = ({ rows, purchaseId, pageSize }) => {
  if (!purchaseId || !Array.isArray(rows) || !rows.length) return null;
  const key = String(purchaseId);
  const index = rows.findIndex((purchase) => String(purchase?._id || "") === key);
  if (index < 0) return null;
  return Math.floor(index / pageSize) + 1;
};

const useHighlightPurchase = ({
  highlightPurchaseId = null,
  rows = [],
  page = 1,
  pageSize = 5,
  setPage = () => {},
  setOpenById = () => {},
  setPageDelayMs = 60,
  scrollDelayMs = 250,
  scrollBlock = "center",
} = {}) => {
  useEffect(() => {
    if (!highlightPurchaseId) return;

    const targetPage = getTargetPageForPurchase({
      rows,
      purchaseId: highlightPurchaseId,
      pageSize,
    });

    if (!targetPage || targetPage === page) return;

    const timer = setTimeout(() => setPage(targetPage), setPageDelayMs);
    return () => clearTimeout(timer);
  }, [highlightPurchaseId, page, pageSize, rows, setPage, setPageDelayMs]);

  useEffect(() => {
    if (!highlightPurchaseId) return;

    const key = String(highlightPurchaseId);
    setOpenById((prev) => ({ ...prev, [key]: true }));

    const timer = setTimeout(() => {
      const el = document.getElementById(`short-delivery-${key}`);
      if (!el?.scrollIntoView) return;
      el.scrollIntoView({ behavior: "smooth", block: scrollBlock });
    }, scrollDelayMs);

    return () => clearTimeout(timer);
  }, [highlightPurchaseId, page, scrollBlock, scrollDelayMs, setOpenById]);
};

export default useHighlightPurchase;

