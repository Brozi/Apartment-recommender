import styles from "./info-box.module.css";

export default function InfoBoxLineWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className={styles.infoBoxLineWrapper}>{children}</section>;
}
