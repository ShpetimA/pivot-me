import type { SelectHTMLAttributes } from "react";
import styles from "./select.module.css";

export type SelectOption = {
  value: string;
  label: string;
};

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  ref: React.Ref<HTMLSelectElement>;
}

export const Select = ({
  label,
  error,
  options,
  placeholder,
  className,
  ref,
  ...props
}: SelectProps) => {
  return (
    <div className={styles.container}>
      {label && (
        <label htmlFor={props.id} className={styles.label}>
          {label}
        </label>
      )}
      <select ref={ref} className={[styles.select, className].filter(Boolean).join(" ")} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};

Select.displayName = "Select";
