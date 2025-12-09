import {
  useFieldArray,
  useFormContext,
  useWatch,
  type FieldErrors,
} from "react-hook-form";
import { Select } from "~/components/Select/select";
import { GROUPABLE_DIMENSIONS, type TForm } from "./GeneratePivotForm";
import Styles from "./ColumnDimension.module.css";

type ColumnDimensionsFieldProps = {
  errors: FieldErrors<TForm>;
};

const ColumnDimensionsField = ({ errors }: ColumnDimensionsFieldProps) => {
  const { control, register } = useFormContext<TForm>();
  const { fields, append, remove } = useFieldArray({
    name: "columnDimensions",
  });

  const selectedDimensions = useWatch({
    control,
    name: "columnDimensions",
  });

  const getAvailableOptions = (currentIndex: number) => {
    const currentValue = selectedDimensions?.[currentIndex];
    return GROUPABLE_DIMENSIONS.filter(
      (dim) => dim === currentValue || !selectedDimensions?.includes(dim)
    ).map((dim) => ({ value: dim, label: dim }));
  };

  const hasAvailableOptions =
    selectedDimensions?.length < GROUPABLE_DIMENSIONS.length;

  return (
    <div>
      <label htmlFor="columnDimensions">Column Dimensions:</label>
      <div className={Styles.fieldList}>
        {fields.map((field, index) => (
          <div key={field.id} className={Styles.fieldContainer}>
            <Select
              {...register(`columnDimensions.${index}` as const)}
              options={getAvailableOptions(index)}
              placeholder="Select dimension"
              error={errors.columnDimensions?.[index]?.message}
            />
            <button type="button" onClick={() => remove(index)}>
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        disabled={!hasAvailableOptions}
        className={Styles.addDimensionButton}
        onClick={() => append("")}
      >
        + Add Dimension
      </button>
      {errors.columnDimensions && <p>{errors.columnDimensions.message}</p>}
    </div>
  );
};

export default ColumnDimensionsField;
