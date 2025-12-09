import Styles from "./loading.module.css";

const LoadingFullScreen = () => {
  return (
    <div className={Styles.loadingContainer}>
      <div className={Styles.loadingSpinner} />
    </div>
  );
};

export default LoadingFullScreen;

export const LoadingInline = () => {
  return <div className={Styles.loadingSpinner} />;
};
