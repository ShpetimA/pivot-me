import { useQuery } from "@tanstack/react-query";
import { transactions } from "~/constants/data";
import { generatePivot, type PivotData } from "~/lib/pivot";
import { useRef, useState } from "react";
import GeneratePivotForm from "~/screens/PivotReport/components/GeneratePivotForm";
import PivotTable from "~/components/PivotTable/PivotTable";
import type { Transaction } from "~/types/transaction";
import { TransactionTable } from "~/components/TransactionTable/TransactionTable";
import Styles from "./PivotReport.module.css";
import Button from "~/components/Button/button";
import type { TForm } from "~/lib/schemas/generate-pivot";
import LoadingFullScreen from "~/components/Loading/loading";

const PivotReport = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return transactions;
    },
  });
  const [pivotData, setPivotData] = useState<PivotData | null>(null);

  const handleGeneratePivot = (formData: TForm) => {
    setPivotData(
      generatePivot(data || [], {
        rowDimension: formData.rowDimension,
        columnDimensions: formData.columnDimensions,
      })
    );

    dialogRef.current?.close();
  };

  if (isLoading) {
    return <LoadingFullScreen />;
  }

  return (
    <div className={Styles.screenContainer}>
      <header className={Styles.header}>
        <div className={Styles.headerContent}>
          <h1 className={Styles.title}>Pivot Report</h1>
          <p className={Styles.subtitle}>
            {pivotData
              ? "Sum of your transactions grouped by selected dimensions."
              : "Group and summarize your transactions by any dimension."}
          </p>
        </div>
        <div className={Styles.actions}>
          <Button
            type="button"
            variant="primary"
            onClick={() => dialogRef.current?.showModal()}
          >
            {pivotData ? "Edit Pivot" : "Create Pivot"}
          </Button>
          {pivotData && (
            <Button
              variant="secondary"
              type="button"
              className={Styles.secondaryBtn}
              onClick={() => setPivotData(null)}
            >
              Clear
            </Button>
          )}
        </div>
      </header>
      <GeneratePivotForm
        dialogProps={{
          ref: dialogRef,
        }}
        onClose={() => dialogRef.current?.close()}
        onGenerate={handleGeneratePivot}
      />
      <main className={Styles.content}>
        <Table pivotData={pivotData} transactions={transactions} />
      </main>
    </div>
  );
};

export default PivotReport;

type TableProps = {
  pivotData: PivotData | null;
  transactions: Transaction[];
};

const Table = ({ pivotData, transactions }: TableProps) => {
  if (!pivotData) {
    return <TransactionTable data={transactions} />;
  }

  return <PivotTable pivotData={pivotData} />;
};
