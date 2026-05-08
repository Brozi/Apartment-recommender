import { formatNumber } from "../../lib/utils";
import styles from "./info-box.module.css";

type InfoBoxLineProps = {
  title: string;
  value: number;
  unit: string | "";
};

export default function InfoBoxLine({ title, value, unit }: InfoBoxLineProps) {
  const hasDecimal = value % 1 !== 0;
  const integerPart = Math.floor(value);
  const decimalPart = hasDecimal ? value.toFixed(2).split(".")[1] : null;

  return (
    <section className={styles.infoBoxLine}>
      <p className="font-paragraph">{title}</p>
      <span className="font-chart-highlight">
        {formatNumber(integerPart)}
        {decimalPart !== null ? `.${decimalPart}` : ""} {unit ?? ""}
      </span>
    </section>
  );
}
