import styles from "#/components/info-box/info-box.module.css";
import chartCorner from "#/assets/chart-corner.svg";
import chartExpand from "#/assets/chart-expand.svg";
import { cn } from "#/lib/utils";

type BoxProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export default function Box({ title, children, className }: BoxProps) {
  return (
    <section className={cn(styles.infoBoxContainer, className)}>
      <h3 style={{ lineHeight: "1.35" }} className="font-h3">
        {title}
      </h3>
      <div className={styles.divider} />
      {children}
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
