import styles from "./ToggleSwitch.module.css";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
}

export default function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
  return (
    <label className={styles.switch}>
      <input type="checkbox" checked={checked} onChange={onChange} className={styles.input} />
      <span className={styles.slider}></span>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
}
