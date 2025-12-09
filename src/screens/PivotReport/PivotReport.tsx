import { useQuery } from "@tanstack/react-query";
import { transactions } from "~/constants/data";
import { generatePivot, type PivotData } from "~/lib/pivot";
import { useRef, useState } from "react";
import GeneratePivotForm, {
  type TForm,
} from "~/screens/PivotReport/components/GeneratePivotForm";
import PivotTable from "~/components/PivotTable/PivotTable";
import type { Transaction } from "~/types/transaction";
import { TransactionTable } from "~/components/TransactionTable/TransactionTable";
import Styles from "./PivotReport.module.css";

const PivotReport = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
    return <div>Loading...</div>;
  }

  return (
    <div className={Styles.screenContainer}>
      <button type="button" onClick={() => dialogRef.current?.showModal()}>
        Gen
      </button>
      {pivotData && (
        <button type="button" onClick={() => setPivotData(null)}>
          Clear Pivot
        </button>
      )}
      <dialog ref={dialogRef} className={Styles.pivotFormDialog}>
        <GeneratePivotForm onGenerate={handleGeneratePivot} />
      </dialog>
      <Table pivotData={pivotData} transactions={transactions} />
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
    return <TransactionTable data={transactions}></TransactionTable>;
  }

  return <PivotTable pivotData={pivotData} />;
};
