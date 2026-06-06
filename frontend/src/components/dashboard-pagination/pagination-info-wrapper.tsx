import { useEffect, useRef } from "react";
import styles from "#/components/dashboard-pagination/pagination.module.css";

type PaginationInfoWrapperProps = {
  currentIndex: number;
  totalSteps: number;
  label: string;
  type: "nav" | "action";
};

export default function PaginationInfoWrapper({
  currentIndex,
  totalSteps,
  label,
  type = "nav",
}: PaginationInfoWrapperProps) {
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const adjustWidth = () => {
      const el = textRef.current;
      if (!el) return;

      el.style.width = "auto";

      const range = document.createRange();
      range.selectNodeContents(el);
      const rects = range.getClientRects();

      let maxWidth = 0;
      for (const rect of rects) {
        if (rect.width > maxWidth) maxWidth = rect.width;
      }

      if (maxWidth > 0) {
        el.style.width = `${Math.ceil(maxWidth)}px`;
      }
    };

    adjustWidth();
    window.addEventListener("resize", adjustWidth);
    return () => window.removeEventListener("resize", adjustWidth);
  }, [label]);

  return (
    <div className={styles.infoWrapper}>
      <span className="font-addon-main">
        {type === "nav" && (
          <span>
            [{currentIndex + 1} / {totalSteps}]
          </span>
        )}
        {type === "action" && (
          <span>
            [{currentIndex} / {totalSteps}]
          </span>
        )}
      </span>

      <span className="font-h3" ref={textRef}>
        {label}
      </span>
    </div>
  );
}
