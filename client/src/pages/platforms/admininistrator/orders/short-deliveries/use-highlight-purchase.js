import { useEffect } from "react";

const getTargetPageForPurchase = ({ rows, purchaseId, pageSize }) => {
  if (!purchaseId || !Array.isArray(rows) || !rows.length) return null;
  const key = String(purchaseId);
  const index = rows.findIndex(
    (purchase) => String(purchase?._id || "") === key,
  );
  if (index < 0) return null;
  return Math.floor(index / pageSize) + 1;
};

const scrollToPurchaseElement = ({
  purchaseId,
  block = "center",
  behavior = "smooth",
  maxAttempts = 20,
  attemptIntervalMs = 80,
}) => {
  if (!purchaseId) return () => {};
  const key = String(purchaseId);
  const elementId = `short-delivery-${key}`;

  let cancelled = false;
  let attempts = 0;
  let timeoutId = null;

  const tryScroll = () => {
    if (cancelled) return;
    const el = document.getElementById(elementId);

    if (el?.scrollIntoView) {
      el.scrollIntoView({ behavior, block });
      return;
    }

    attempts += 1;
    if (attempts >= maxAttempts) return;
    timeoutId = setTimeout(tryScroll, attemptIntervalMs);
  };

  // Kick off immediately; if DOM isn't ready yet, retry a few times.
  tryScroll();

  return () => {
    cancelled = true;
    if (timeoutId) clearTimeout(timeoutId);
  };
};

const useHighlightPurchase = ({
  highlightPurchaseId = null,
  rows = [],
  page = 1,
  pageSize = 5,
  setPage = () => {},
  setOpenById = () => {},
  setPageDelayMs = 60,
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

    return scrollToPurchaseElement({
      purchaseId: key,
      block: scrollBlock,
    });
  }, [highlightPurchaseId, page, scrollBlock, setOpenById]);
};

export default useHighlightPurchase;
