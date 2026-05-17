import { Formatter } from "@/services/utilities";

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const getPoint = (fromElOrPoint) => {
  if (fromElOrPoint?.getBoundingClientRect) {
    const cardEl = fromElOrPoint?.closest?.("[data-menu-card]") || null;
    const sourceEl = cardEl || fromElOrPoint;
    const rect = sourceEl.getBoundingClientRect();
    if (!rect || rect.width < 8 || rect.height < 8) return null;
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, cardEl, rect };
  }

  const x = Number(fromElOrPoint?.x);
  const y = Number(fromElOrPoint?.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return { x, y, cardEl: null, rect: null };
};

const animateAddToOrder = (fromElOrPoint, menu, options = {}) => {
  try {
    if (typeof window === "undefined" || typeof document === "undefined")
      return Promise.resolve();
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches)
      return Promise.resolve();

    const point = getPoint(fromElOrPoint);
    if (!point) return Promise.resolve();

    const fromX = point.x;
    const fromY = point.y;
    const cardEl = point.cardEl;
    const fromRect = point.rect;

    const overrideTargetEl = options?.targetEl || null;
    const targetAlign = options?.targetAlign || "center";
    if (overrideTargetEl?.scrollIntoView) {
      try {
        overrideTargetEl.scrollIntoView({
          block: "center",
          inline: "nearest",
          behavior: "auto",
        });
      } catch {
        // ignore
      }
    }

    const fallbackCartButton = document.querySelector(
      "[data-cashier-cart-button]",
    );
    const primaryTargetEl = overrideTargetEl || fallbackCartButton;
    const targetRect = primaryTargetEl?.getBoundingClientRect?.();
    const useFallback =
      !targetRect ||
      targetRect.width < 8 ||
      targetRect.height < 8 ||
      targetRect.bottom < 0;
    const fallbackRect = fallbackCartButton?.getBoundingClientRect?.();
    const toRect = useFallback ? fallbackRect : targetRect;
    if (!toRect || toRect.width < 8 || toRect.height < 8)
      return Promise.resolve();

    const toX = toRect.left + toRect.width / 2;
    const toY =
      overrideTargetEl && !useFallback
        ? targetAlign === "top"
          ? toRect.top + Math.min(toRect.height * 0.18, 72)
          : toRect.top + toRect.height / 2
        : toRect.top + Math.min(toRect.height * 0.35, 120);

    const dx = toX - fromX;
    const dy = toY - fromY;

    const flyer = cardEl ? cardEl.cloneNode(true) : document.createElement("div");

    if (!cardEl) {
      flyer.className =
        "pointer-events-none fixed z-[60] w-[220px] select-none rounded-2xl border bg-background/95 shadow-lg backdrop-blur";
      flyer.innerHTML = `
          <div class="px-3 pt-2 text-xs font-semibold text-foreground">
            ${escapeHtml(menu?.name || "Added item")}
          </div>
          <div class="px-3 pb-2 text-[11px] font-semibold text-muted-foreground">
            ${escapeHtml(Formatter.amount(Number(menu?.price) || 0))}
          </div>
        `;
      flyer.style.left = `${fromX}px`;
      flyer.style.top = `${fromY}px`;
      flyer.style.transform = "translate(-50%, -50%)";
    } else if (fromRect) {
      const computed = window.getComputedStyle(cardEl);
      flyer.style.position = "fixed";
      flyer.style.left = `${fromRect.left}px`;
      flyer.style.top = `${fromRect.top}px`;
      flyer.style.width = `${fromRect.width}px`;
      flyer.style.height = `${fromRect.height}px`;
      flyer.style.margin = "0";
      flyer.style.pointerEvents = "none";
      flyer.style.zIndex = "60";
      flyer.style.background = computed.backgroundColor;
      flyer.style.borderRadius = computed.borderRadius;
      flyer.style.overflow = "hidden";
      flyer.style.boxShadow =
        "0 18px 48px rgba(0,0,0,.18), 0 8px 18px rgba(0,0,0,.12)";
      flyer.style.transformOrigin = "center";
      flyer.style.willChange = "transform, opacity, filter";
    }

    document.body.appendChild(flyer);

    if (cardEl?.animate) {
      cardEl.animate(
        [
          { transform: "translate3d(0,0,0) scale(1)" },
          { transform: "translate3d(0,0,0) scale(0.985)" },
          { transform: "translate3d(0,0,0) scale(1)" },
        ],
        { duration: 160, easing: "cubic-bezier(0.2, 0.9, 0.2, 1)" },
      );
    }

    const duration = 650;
    const easing = "cubic-bezier(0.22, 1, 0.36, 1)";

    const midX = dx * 0.7;
    const midY = dy * 0.7;

    const start = cardEl
      ? "translate3d(0px, 0px, 0) scale(1) rotate(0deg)"
      : "translate(-50%, -50%) translate3d(0px, 0px, 0) scale(1) rotate(0deg)";
    const mid = cardEl
      ? `translate3d(${midX}px, ${midY}px, 0) scale(0.94) rotate(0deg)`
      : `translate(-50%, -50%) translate3d(${midX}px, ${midY}px, 0) scale(0.94) rotate(0deg)`;
    const end = cardEl
      ? `translate3d(${dx}px, ${dy}px, 0) scale(0.2) rotate(0deg)`
      : `translate(-50%, -50%) translate3d(${dx}px, ${dy}px, 0) scale(0.2) rotate(0deg)`;

    const anim = flyer.animate(
      [
        { transform: start, opacity: 1 },
        { transform: mid, opacity: 1, offset: 0.6 },
        { transform: end, opacity: 1, offset: 0.9 },
        { transform: end, opacity: 0, offset: 1 },
      ],
      { duration, easing, fill: "both" },
    );

    const cleanup = () => flyer.remove();

    const arrivalMs = Math.max(0, Math.round(duration * 0.55));
    let resolved = false;
    let timer = null;
    let resolveArrival = null;

    const arrivalPromise = new Promise((resolve) => {
      resolveArrival = () => {
        if (resolved) return;
        resolved = true;
        resolve();
      };
      timer = window.setTimeout(resolveArrival, arrivalMs);
    });

    anim.onfinish = () => {
      if (timer) window.clearTimeout(timer);
      resolveArrival?.();
      cleanup();
    };
    anim.oncancel = () => {
      if (timer) window.clearTimeout(timer);
      resolveArrival?.();
      cleanup();
    };

    return arrivalPromise;
  } catch {
    // ignore animation errors
  }

  return Promise.resolve();
};

export default animateAddToOrder;

