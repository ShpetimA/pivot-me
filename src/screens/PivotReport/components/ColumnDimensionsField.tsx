import {
  useFieldArray,
  useFormContext,
  useWatch,
  type FieldErrors,
} from "react-hook-form";
import { Select } from "~/components/Select/select";
import Styles from "./ColumnDimension.module.css";
import Button from "~/components/Button/button";
import { GROUPABLE_DIMENSIONS } from "~/constants/group-fields";
import type { TForm } from "~/lib/schemas/generate-pivot";

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
            <Button
              variant="secondary"
              type="button"
              onClick={() => remove(index)}
            >
              ×
            </Button>
          </div>
        ))}
      </div>
      <Button
        variant="secondary"
        type="button"
        disabled={!hasAvailableOptions}
        className={Styles.addDimensionButton}
        onClick={() => append("")}
      >
        + Add Dimension
      </Button>
      {errors.columnDimensions && <p>{errors.columnDimensions.message}</p>}
    </div>
  );
};

export default ColumnDimensionsField;
