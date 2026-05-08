import InfoBoxLine from "./info-box-line";
import InfoBoxLineWrapper from "./info-box-line-wrapper";
import styles from "./info-box.module.css";
import chartCorner from "../../assets/chart-corner.svg";
import chartExpand from "../../assets/chart-expand.svg";

type InfoBoxProps = {
  title: string;
  firstLineTitle: string;
  firstLineValue: number;
  secondLineTitle: string;
  secondLineValue: number;
  unit: string | "";
};

export default function InfoBox({
  title,
  firstLineTitle,
  firstLineValue,
  secondLineTitle,
  secondLineValue,
  unit,
}: InfoBoxProps) {
  return (
    <section className={styles.infoBoxContainer}>
      <h3 className="font-chart-heading">{title}</h3>
      <div className={styles.divider} />

      <InfoBoxLineWrapper>
        <InfoBoxLine
          title={firstLineTitle}
          value={firstLineValue}
          unit={unit}
        />
        <InfoBoxLine
          title={secondLineTitle}
          value={secondLineValue}
          unit={unit}
        />
      </InfoBoxLineWrapper>

      <img
        src={chartCorner}
        alt="Chart corner icon"
        className={styles.chartCorner}
      />
      <img
        src={chartExpand}
        alt="Chart expand icon"
        className={styles.chartExpand}
      />
      <div className={styles.topBgAddon} />
      <div className={styles.bottomBgAddon} />
    </section>
  );
}
