import type { PivotData } from "~/lib/pivot";
import { TableHeaders } from "~/components/PivotTable/PivotHeaders";
import Styles from "./PivotTable.module.css";
import { formatAmount } from "~/lib/format";

type PivotTableProps = {
  pivotData: PivotData | null;
};

const PivotTable = ({ pivotData }: PivotTableProps) => {
  if (!pivotData) {
    return <div>No pivot data to display</div>;
  }

  return (
    <div className={Styles.tableContainer}>
      <table className={Styles.pivotTable}>
        <TableHeaders
          columnHierarchy={pivotData.columnTree}
          rowDimension={pivotData.config.rowDimension}
        />
        <tbody>
          {pivotData.rows.map((row) => (
            <PivotRow key={row} row={row} pivotData={pivotData} />
          ))}
        </tbody>
        <PivotFoot pivotData={pivotData} />
      </table>
    </div>
  );
};

export default PivotTable;

type PivotRowProps = {
  row: string;
  pivotData: PivotData;
};

const PivotRow = ({ row, pivotData }: PivotRowProps) => {
  return (
    <tr>
      <td>{row}</td>
      {pivotData.columns.map((col) => (
        <td key={col}>
          {pivotData.data[row][col]
            ? formatAmount(pivotData.data[row][col])
            : formatAmount(0)}
        </td>
      ))}
      <td className={Styles.rowTotal}>
        {formatAmount(pivotData.totalRows[row])}
      </td>
    </tr>
  );
};

type PivotFootProps = {
  pivotData: PivotData;
};

const PivotFoot = ({ pivotData }: PivotFootProps) => {
  const grandTotal = Object.values(pivotData.totalColumns).reduce(
    (sum, val) => sum + val,
    0
  );

  return (
    <tfoot>
      <tr>
        <td>Total</td>
        {pivotData.columns.map((col) => (
          <td key={col}>{formatAmount(pivotData.totalColumns[col])}</td>
        ))}
        <td className={Styles.rowTotal}>{formatAmount(grandTotal)}</td>
      </tr>
    </tfoot>
  );
};
