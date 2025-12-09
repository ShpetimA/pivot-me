import type { Transaction } from "~/types/transaction";
import styles from "./TransactionTable.module.css";

interface TransactionTableProps {
  data: Transaction[];
}

export function TransactionTable({ data }: TransactionTableProps) {
  if (!data || data.length === 0) {
    return <div className={styles.noData}>No transactions available.</div>;
  }

  const columns = Object.keys(data[0]);

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            {columns.map((col) => (
              <th key={col} className={styles.th}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {data.map((row) => (
            <tr key={row.transaction_number} className={styles.tr}>
              {columns.map((col) => (
                <td key={col} className={styles.td}>
                  {row[col as keyof Transaction]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
