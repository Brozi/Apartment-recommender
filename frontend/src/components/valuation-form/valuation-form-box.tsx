import styles from "./valuation-form.module.css";
import TopCornerImage from "../../assets/right-corner-32.svg";
import BottomCornerImage from "../../assets/left-corner-32.svg";
import { cn } from "#/lib/utils";

type ValuationFormBoxProps = {
  children: React.ReactNode;
  className?: string;
};

export default function ValuationFormBox({
  children,
  className,
}: ValuationFormBoxProps) {
  return (
    <section className={cn(styles.valuationFormBox, className)}>
      {children}
      <img src={TopCornerImage} className={styles.topCornerImage} />
      <img src={BottomCornerImage} className={styles.bottomCornerImage} />
    </section>
  );
}
