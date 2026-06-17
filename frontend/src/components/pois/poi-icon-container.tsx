import styles from "./poi-icon-container.module.css";
import Triangle from "#/assets/triangle-12.svg";

type PoiIconContainerProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export default function PoiIconContainer({
  children,
  style,
}: PoiIconContainerProps) {
  return (
    <div style={style} className={styles.iconContainer}>
      <div className={styles.iconWrapper}>{children}</div>
      <img
        src={Triangle}
        alt="triangle image"
        className={styles.triangleTopLeft}
      />
      <img
        src={Triangle}
        alt="triangle image"
        className={styles.triangleTopRight}
      />
      <img
        src={Triangle}
        alt="triangle image"
        className={styles.triangleBottomLeft}
      />
      <img
        src={Triangle}
        alt="triangle image"
        className={styles.triangleBottomRight}
      />
    </div>
  );
}
