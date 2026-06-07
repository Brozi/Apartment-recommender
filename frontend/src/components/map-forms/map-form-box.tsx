import styles from "./map-form-box.module.css";
import CloseIcon from "../icons/close-icon";
import { cn } from "#/lib/utils";
import MapForm from "./map-form";
import { useEffect, useRef, useState } from "react";

type MapFormBoxProps = {
  isActive: boolean;
  onCloseForm: () => void;
};

export default function MapFormBox({ isActive, onCloseForm }: MapFormBoxProps) {
  const [step, setStep] = useState(0);
  const formContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      const scrollableContent =
        formContainerRef.current?.querySelector<HTMLElement>(
          '[data-map-form-scroll="true"]',
        );
      scrollableContent?.scrollTo({ top: 0, behavior: "auto" });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [isActive]);

  const formStep = step + 1;
  const formTitle = step === 0 ? "Filter" : "Recommendation";
  return (
    <div
      className={cn(styles.formBg, isActive ? styles.active : styles.disabled)}
    >
      <section className={styles.formBox}>
        <header className={styles.formHeader}>
          <div className={styles.formHeading}>
            <span
              className="font-h2"
              style={{ fontWeight: "500", color: "var(--clr-text)" }}
            >
              [{formStep} / 2]
            </span>
            <h1 className="font-h1">{formTitle}</h1>
          </div>
          <button
            className={styles.closeButton}
            onClick={() => onCloseForm()}
            aria-label="Close form"
          >
            <CloseIcon />
          </button>
        </header>

        <div className={styles.divider} />

        <div ref={formContainerRef} className={styles.formContainer}>
          <MapForm step={step} setStep={setStep} />
        </div>
      </section>
    </div>
  );
}
