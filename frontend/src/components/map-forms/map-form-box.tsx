import styles from "./map-form-box.module.css";
import CloseIcon from "../icons/close-icon";
import Button from "../ui/button";
import FilterForm from "./filter-form";
import RecommendationForm from "./recommendation-form";
import { cn } from "#/lib/utils";

type MapFormBoxProps = {
  isActive: boolean;
  type: "filter" | "recommendation";
  onCloseForm: () => void;
};

export default function MapFormBox({
  isActive,
  type,
  onCloseForm,
}: MapFormBoxProps) {
  const formStep = type === "filter" ? 1 : 2;
  const formTitle = type === "filter" ? "Filter" : "Recommendation";
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

        <section className={styles.formContainer}>
          {type === "filter" && <FilterForm />}
          {type === "recommendation" && <RecommendationForm />}
        </section>

        <div className={styles.divider} />

        <section className={styles.formActions}>
          <Button
            variant="secondary"
            label="Clear filters"
            onClick={() => {}}
          />
          {type === "filter" && (
            <Button variant="primary" label="Next step" onClick={() => {}} />
          )}
          {type === "recommendation" && (
            <Button variant="primary" label="See results" onClick={() => {}} />
          )}
        </section>
      </section>
    </div>
  );
}
