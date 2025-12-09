import type { Transaction } from "~/types/transaction";

export type PivotData = {
  rows: string[];
  columns: string[];
  totalColumns: Record<string, number>;
  totalRows: Record<string, number>;
  data: GroupedData;
  config: Config<Transaction>;
  columnTree: ColumnNode[];
};

export type Config<T extends Transaction> = {
  rowDimension: keyof T;
  columnDimensions: Array<keyof T>;
};

export type GroupedData = Record<string, Record<string, number>>;

interface Column {
  key: string;
  path: string[];
  labels: string[];
}

export type ColumnNode = {
  label: string;
  colspan: number;
  level: number;
  children: ColumnNode[] | null;
};

const getKey = <T extends Transaction>(transaction: T, config: Config<T>) => {
  const rowKey: string = transaction[config.rowDimension as keyof Transaction];

  const cols = config.columnDimensions.map((col) => transaction[col]);

  return {
    rowKey: rowKey,
    colKey: cols.join("|"),
  };
};

export const groupByColAndRow = <T extends Transaction>(
  data: T[],
  config: Config<T>
) => {
  const rows = new Set<string>();
  const colPaths = new Set<string>();

  const groupedData = data.reduce<GroupedData>((acc, curr) => {
    const { colKey, rowKey } = getKey(curr, config);
    if (!acc[rowKey]) {
      rows.add(rowKey);
      acc[rowKey] = {};
    }

    if (!acc[rowKey][colKey]) {
      colPaths.add(colKey);
      acc[rowKey][colKey] = Number(curr.amount);
    } else {
      acc[rowKey][colKey] = acc[rowKey][colKey] + Number(curr.amount);
    }

    return acc;
  }, {});

  return {
    rowPaths: Array.from(rows).sort((a, b) => b.localeCompare(a)),
    colPaths: Array.from(colPaths).sort(),
    data: groupedData,
  };
};

const sumCols = (
  cols: Array<string>,
  rows: Array<string>,
  data: GroupedData
) => {
  const colTotal: Record<string, number> = {};
  cols.forEach((col) => {
    colTotal[col] = 0;
    rows.forEach((row) => {
      colTotal[col] += data[row][col] || 0;
    });
  });

  return colTotal;
};

const sumRows = (rows: Array<string>, data: GroupedData) => {
  const rowTotal = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row] = Object.values(data[row]).reduce<number>(
      (sum, val) => sum + val,
      0
    );
    return acc;
  }, {});
  return rowTotal;
};

export const buildColumnTree = (colPaths: string[]): ColumnNode[] => {
  const columns: Column[] = colPaths.map((colPath) => {
    const labels = colPath.split("|");
    return {
      key: colPath,
      path: labels,
      labels,
    };
  });

  if (columns.length === 0) return [];
  const maxDepth = columns[0].path.length;

  const buildLevel = (cols: Column[], depth: number): ColumnNode[] | null => {
    if (depth >= maxDepth) return null;

    const grouped = new Map<string, Column[]>();

    cols.forEach((col) => {
      const label = col.path[depth];
      if (!grouped.has(label)) {
        grouped.set(label, []);
      }
      grouped.get(label)?.push(col);
    });

    return Array.from(grouped.entries()).map(([label, childCols]) => {
      const children = buildLevel(childCols, depth + 1);
      return {
        label,
        colspan: childCols.length,
        level: depth,
        children,
      };
    });
  };

  return buildLevel(columns, 0) || [];
};

export const generatePivot = <T extends Transaction>(
  data: T[],
  config: Config<T>
) => {
  const {
    colPaths,
    data: groupedData,
    rowPaths,
  } = groupByColAndRow(data, config);

  return {
    rows: rowPaths,
    columns: colPaths,
    totalColumns: sumCols(colPaths, rowPaths, groupedData),
    totalRows: sumRows(rowPaths, groupedData),
    data: groupedData,
    config,
    columnTree: buildColumnTree(colPaths),
  };
};

export function getMaxDepth(hierarchy: ColumnNode[]): number {
  if (!hierarchy || hierarchy.length === 0) return 0;
  let maxDepth = 1;
  hierarchy.forEach((node) => {
    if (node.children) {
      maxDepth = Math.max(maxDepth, 1 + getMaxDepth(node.children));
    }
  });
  return maxDepth;
}
