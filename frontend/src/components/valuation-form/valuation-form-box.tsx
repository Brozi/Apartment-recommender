import styles from "./valuation-form.module.css";
import TopCornerImage from "../../assets/right-corner-32.svg";
import BottomCornerImage from "../../assets/left-corner-32.svg";

type ValuationFormBoxProps = {
  children: React.ReactNode;
};

export default function ValuationFormBox({ children }: ValuationFormBoxProps) {
  return (
    <section className={styles.valuationFormBox}>
      {children}
      <img src={TopCornerImage} className={styles.topCornerImage} />
      <img src={BottomCornerImage} className={styles.bottomCornerImage} />
    </section>
  );
}
