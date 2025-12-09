export type AggFunc = "sum" | "count" | "avg" | "min" | "max";

export interface PivotConfig {
  rowDimension: string;
  columnDimensions: string[];
  valueDimension: string;
  aggFunc: AggFunc;
}

export interface ColumnNode {
  label: string;
  colspan: number;
  level: number;
  children: ColumnNode[] | null;
  isLeaf: boolean;
}

export interface Column {
  key: string;
  path: string[];
  labels: string[];
}

export interface PivotResult {
  rows: string[];
  columns: Column[];
  columnHierarchy: ColumnNode[];
  data: Record<string, Record<string, number>>;
  rowTotals: Record<string, number>;
  columnTotals: Record<string, number>;
  grandTotal: number;
  config: PivotConfig;
}

const aggregators: Record<AggFunc, (arr: number[]) => number> = {
  sum: (arr) => arr.reduce((a, b) => a + b, 0),
  count: (arr) => arr.length,
  avg: (arr) =>
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0,
  min: (arr) => (arr.length > 0 ? Math.min(...arr) : 0),
  max: (arr) => (arr.length > 0 ? Math.max(...arr) : 0),
};

function buildColumnHierarchy(columns: Column[]): ColumnNode[] {
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
      grouped.get(label)!.push(col);
    });

    return Array.from(grouped.entries()).map(([label, childCols]) => {
      const children = buildLevel(childCols, depth + 1);
      return {
        label,
        colspan: childCols.length,
        level: depth,
        children,
        isLeaf: children === null,
      };
    });
  };

  return buildLevel(columns, 0) || [];
}

export function buildPivotTable<T extends Record<string, unknown>>(
  data: T[],
  config: PivotConfig
): PivotResult {
  const { rowDimension, columnDimensions, valueDimension, aggFunc } = config;
  const aggregate = aggregators[aggFunc];

  const groups = new Map<
    string,
    {
      rowKey: string;
      columnPath: string[];
      columnKey: string;
      values: number[];
    }
  >();
  const rowSet = new Set<string>();
  const columnPathsSet = new Set<string>();

  data.forEach((record) => {
    const rowKey = String(record[rowDimension] ?? "(blank)");
    const columnPath = columnDimensions.map((dim) =>
      String(record[dim] ?? "(blank)")
    );
    const columnKey = columnPath.join("|");
    const rawValue = record[valueDimension];
    const value =
      typeof rawValue === "number"
        ? rawValue
        : parseFloat(String(rawValue)) || 0;

    rowSet.add(rowKey);
    columnPathsSet.add(columnKey);

    const groupKey = `${rowKey}::${columnKey}`;
    if (!groups.has(groupKey)) {
      groups.set(groupKey, { rowKey, columnPath, columnKey, values: [] });
    }
    groups.get(groupKey)!.values.push(value);
  });

  const rows = Array.from(rowSet).sort();
  const columnPaths = Array.from(columnPathsSet).sort();
  const columns: Column[] = columnPaths.map((key) => ({
    key,
    path: key.split("|"),
    labels: key.split("|"),
  }));

  const pivotData: Record<string, Record<string, number>> = {};
  rows.forEach((rowKey) => {
    pivotData[rowKey] = {};
  });

  groups.forEach((group) => {
    const { rowKey, columnKey, values } = group;
    pivotData[rowKey][columnKey] = aggregate(values);
  });

  const columnHierarchy = buildColumnHierarchy(columns);

  // Calculate totals
  const rowTotals: Record<string, number> = {};
  rows.forEach((rowKey) => {
    rowTotals[rowKey] = Object.values(pivotData[rowKey]).reduce(
      (sum, val) => sum + val,
      0
    );
  });

  const columnTotals: Record<string, number> = {};
  columns.forEach((col) => {
    columnTotals[col.key] = rows.reduce((sum, rowKey) => {
      return sum + (pivotData[rowKey]?.[col.key] ?? 0);
    }, 0);
  });

  const grandTotal = rows.reduce((sum, rowKey) => sum + rowTotals[rowKey], 0);

  return {
    rows,
    columns,
    columnHierarchy,
    data: pivotData,
    rowTotals,
    columnTotals,
    grandTotal,
    config,
  };
}

export function formatNumber(num: number): string {
  if (num === 0) return "0";
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

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
