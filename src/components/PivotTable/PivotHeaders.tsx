import { getMaxDepth, type ColumnNode } from "~/lib/pivot";

type HeaderRowProps = {
  hierarchy: ColumnNode[];
  depth: number;
  maxDepth: number;
  rowDimension: string;
};

function HeaderRow({
  hierarchy,
  depth,
  maxDepth,
  rowDimension,
}: HeaderRowProps) {
  if (!hierarchy || hierarchy.length === 0) return null;

  return (
    <tr>
      {depth === 0 && <th rowSpan={maxDepth}>{rowDimension}</th>}
      {hierarchy.map((node, idx) => (
        <th key={`${node.label}-${idx}`} colSpan={node.colspan}>
          {node.label}
        </th>
      ))}
      {depth === 0 && <th rowSpan={maxDepth}>Total</th>}
    </tr>
  );
}

type TableHeadersProps = {
  columnHierarchy: ColumnNode[];
  rowDimension: string;
};

export function TableHeaders({
  columnHierarchy,
  rowDimension,
}: TableHeadersProps) {
  const maxDepth = getMaxDepth(columnHierarchy);

  const buildRows = (
    hierarchy: ColumnNode[],
    depth: number = 0
  ): React.ReactNode[] => {
    const rows: React.ReactNode[] = [
      <HeaderRow
        key={depth}
        hierarchy={hierarchy}
        depth={depth}
        maxDepth={maxDepth}
        rowDimension={rowDimension}
      />,
    ];

    if (hierarchy?.length > 0 && hierarchy[0].children) {
      const children = hierarchy.flatMap((node) => node.children || []);
      rows.push(...buildRows(children, depth + 1));
    }

    return rows;
  };

  return <thead>{buildRows(columnHierarchy)}</thead>;
}
