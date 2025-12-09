import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select } from "~/components/Select/select";
import ColumnDimensionsField from "./ColumnDimensionsField";
import Styles from "./GeneratePivotForm.module.css";
import Button from "~/components/Button/button";
import { schema, type TForm } from "~/lib/schemas/generate-pivot";
import { GROUPABLE_DIMENSIONS } from "~/constants/group-fields";

const ROW_DIMENSION_OPTIONS = GROUPABLE_DIMENSIONS.map((dim) => ({
  value: dim,
  label: dim,
}));

type GeneratePivotProps = {
  onGenerate: (data: TForm) => void;
  onClose?: () => void;
  dialogProps: React.ComponentProps<"dialog">;
};

const GeneratePivotForm = ({
  onGenerate,
  onClose,
  dialogProps,
}: GeneratePivotProps) => {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      rowDimension: "year",
      columnDimensions: ["transaction_type", "status"] as const,
    },
  });

  const handleSubmit = form.handleSubmit(onGenerate);

  return (
    <dialog className={Styles.pivotFormDialog} {...dialogProps}>
      <div className={Styles.dialogHeader}>
        <h1>Generate Pivot Form</h1>
        <Button variant="secondary" type="button" onClick={onClose}>
          X
        </Button>
      </div>
      <FormProvider {...form}>
        <form className={Styles.form} onSubmit={handleSubmit}>
          <RowDimensionField />
          <ColumnDimensionsField errors={form.formState.errors} />
          <Button type="submit">Generate Pivot</Button>
        </form>
      </FormProvider>
    </dialog>
  );
};

export default GeneratePivotForm;

const RowDimensionField = () => {
  const { register, watch, formState } = useFormContext<TForm>();
  const columnDimensions = watch("columnDimensions");

  const filteredOptions = ROW_DIMENSION_OPTIONS.filter(
    (option) => !columnDimensions.includes(option.value)
  );

  return (
    <Select
      label="Row Dimension:"
      {...register("rowDimension")}
      options={filteredOptions}
      placeholder="Select dimension"
      error={formState.errors.rowDimension?.message}
    />
  );
};
