import PaginationButton from "#/components/dashboard-pagination/pagination-button";
import arrowLeft from "#/assets/arrow-left.svg";
import arrowRight from "#/assets/arrow-right.svg";
import styles from "#/components/dashboard-pagination/pagination.module.css";
import PaginationInfoWrapper from "#/components/dashboard-pagination/pagination-info-wrapper";
import type { PaginationModel } from "#/store/paginationModels";

type PaginationProps = {
  model: PaginationModel | null;
  style?: React.CSSProperties;
};

export default function Pagination({ model, style }: PaginationProps) {
  if (!model) return null;

  return (
    <section className={styles.pagination} style={style}>
      {model.type === "nav" && (
        <>
          <PaginationButton path={model.prevPath}>
            <img src={arrowLeft} alt="Arrow left icon" />
          </PaginationButton>

          <PaginationInfoWrapper
            type={model.type}
            currentIndex={model.currentIndex}
            totalSteps={model.totalSteps}
            label={model.label}
          />

          <PaginationButton path={model.nextPath}>
            <img src={arrowRight} alt="Arrow right icon" />
          </PaginationButton>
        </>
      )}
      {model.type === "action" && model.label && (
        <>
          <PaginationButton type="action" onClick={model.onPrev}>
            <img src={arrowLeft} alt="Arrow left icon" />
          </PaginationButton>

          <PaginationInfoWrapper
            type={model.type}
            currentIndex={model.currentIndex}
            totalSteps={model.totalSteps}
            label={model.label}
          />

          <PaginationButton type="action" onClick={model.onNext}>
            <img src={arrowRight} alt="Arrow right icon" />
          </PaginationButton>
        </>
      )}
    </section>
  );
}
