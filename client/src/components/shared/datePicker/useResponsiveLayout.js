import { useLayoutEffect, useState } from "react";

export default function useResponsiveLayout(enabled) {
  const [content, setContent] = useState(null);
  const [scale, setScale] = useState(1);
  const [width, setWidth] = useState(undefined);

  useLayoutEffect(() => {
    if (!enabled || !content) return;

    const fitPicker = () => {
      // Measure the natural size before distributing any extra mobile width.
      const previousWidth = content.style.width;
      content.style.width = "max-content";
      const contentWidth = content.offsetWidth;
      content.style.width = previousWidth;
      const isMobile = window.matchMedia("(max-width: 639px)").matches;
      const availableWidth = isMobile
        ? content.parentElement.clientWidth
        : contentWidth;

      if (contentWidth > 0 && availableWidth > 0) {
        const nextScale = Math.min(1, availableWidth / contentWidth);
        setScale(nextScale);
        setWidth(isMobile ? availableWidth / nextScale : undefined);
      }
    };

    fitPicker();
    const observer = new ResizeObserver(fitPicker);
    observer.observe(content);
    observer.observe(content.parentElement);
    window.addEventListener("resize", fitPicker);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fitPicker);
    };
  }, [content, enabled]);

  return {
    ref: enabled ? setContent : undefined,
    style: enabled ? { zoom: scale, width } : undefined,
  };
}
