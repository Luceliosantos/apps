import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes, TableHTMLAttributes } from "react";

interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  children: ReactNode;
}

export default function Table({ children, className = "", ...props }: TableProps) {
  return (
    <div className="w-full overflow-auto rounded-lg border border-border">
      <table
        className={`w-full text-sm text-left ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function TableHeader({ children, className = "" }: TableHeaderProps) {
  return (
    <thead className={`bg-bg-secondary border-b border-border ${className}`}>
      {children}
    </thead>
  );
}

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

export function TableBody({ children, className = "" }: TableBodyProps) {
  return <tbody className={`divide-y divide-border ${className}`}>{children}</tbody>;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function TableRow({ children, className = "", hoverable = true }: TableRowProps) {
  return (
    <tr
      className={`
        ${hoverable ? "hover:bg-bg-card transition-colors" : ""}
        ${className}
      `}
    >
      {children}
    </tr>
  );
}

interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
}

export function TableHead({ children, className = "", ...props }: TableHeadProps) {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
}

export function TableCell({ children, className = "", ...props }: TableCellProps) {
  return (
    <td className={`px-4 py-3 text-text-primary ${className}`} {...props}>
      {children}
    </td>
  );
}
