import styles from "#/components/info-box/info-box.module.css";

export default function InfoBoxLineWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className={styles.infoBoxLineWrapper}>{children}</section>;
}
