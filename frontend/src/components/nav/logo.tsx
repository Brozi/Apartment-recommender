import styles from "./nav.module.css";

export default function Logo() {
  return (
    <div className={styles.logoContainer}>
      <div className={styles.iconContainer}>
        <img src="../../assets/logo.svg" alt="logo icon" />
      </div>
      <span className="font-logo">APRTS</span>
    </div>
  );
}
