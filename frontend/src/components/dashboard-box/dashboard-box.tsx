import styles from "./dashboard-box.module.css";
import chartCorner from "../../assets/chart-corner.svg";
import chartExpand from "../../assets/chart-expand.svg";

type DashboardBoxProps = {
  title: string;
  children: React.ReactNode;
};

export default function DashboardBox({ title, children }: DashboardBoxProps) {
  return (
    <section className={styles.dashboardBoxContainer}>
      <h3 className="font-chart-heading">{title}</h3>
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
