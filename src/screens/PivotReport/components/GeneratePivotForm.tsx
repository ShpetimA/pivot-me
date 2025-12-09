import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Select } from "~/components/Select/select";
import ColumnDimensionsField from "./ColumnDimensionsField";
import Styles from "./GeneratePivotForm.module.css";

const schema = z.object({
  rowDimension: z.union([
    z.literal("year"),
    z.literal("transaction_type"),
    z.literal("status"),
  ]),
  columnDimensions: z
    .array(
      z.union([
        z.literal("year"),
        z.literal("transaction_type"),
        z.literal("status"),
      ])
    )
    .min(1, "Select at least one column dimension"),
});

export type TForm = z.infer<typeof schema>;

const ROW_DIMENSION_OPTIONS: {
  value: GroupableDimensions;
  label: string;
}[] = [
  { value: "year", label: "year" },
  { value: "transaction_type", label: "transaction_type" },
  { value: "status", label: "status" },
];
export const GROUPABLE_DIMENSIONS = [
  "transaction_type",
  "status",
  "year",
] as const;
type GroupableDimensions = (typeof GROUPABLE_DIMENSIONS)[number];

type GeneratePivotProps = {
  onGenerate: (data: TForm) => void;
};

const GeneratePivotForm = ({ onGenerate }: GeneratePivotProps) => {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      rowDimension: "year",
      columnDimensions: ["transaction_type", "status"] as const,
    },
  });

  const handleSubmit = form.handleSubmit(onGenerate);

  return (
    <div>
      <h1>Generate Pivot Form</h1>
      <FormProvider {...form}>
        <form className={Styles.form} onSubmit={handleSubmit}>
          <RowDimensionField />
          <ColumnDimensionsField errors={form.formState.errors} />
          <button type="submit">Generate Pivot</button>
        </form>
      </FormProvider>
    </div>
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
