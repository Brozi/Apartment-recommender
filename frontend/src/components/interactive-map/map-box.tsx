import styles from "#/components/interactive-map/interactive-map.module.css";

type MapBoxProps = {
  children?: React.ReactNode;
};

export default function MapBox({ children }: MapBoxProps) {
  return (
    <section className={styles.MapBoxContainer}>
      {children}
      {/* <img
        src={chartCorner}
        alt="Chart corner icon"
        className={styles.chartCorner}
      />
      <img
        src={chartCorner}
        alt="Chart corner icon"
        className={styles.chartCorner}
      /> */}
      <div className={styles.topBgAddon} />
      <div className={styles.bottomBgAddon} />
    </section>
  );
}
