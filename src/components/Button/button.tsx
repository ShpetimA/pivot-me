import Styles from "./button.module.css";

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: "primary" | "secondary";
};

const Button = ({ className, variant = "primary", ...props }: ButtonProps) => {
  return (
    <button
      data-variant={variant}
      className={[Styles.button, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
};

export default Button;
