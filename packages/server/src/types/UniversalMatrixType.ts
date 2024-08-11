// This is approximate copy of "react-spreadsheet" types

type CellBase<Value = any> = {
  /** Whether the cell should not be editable */
  readOnly?: boolean;
  /** Class to be given for the cell element */
  className?: string;
  /** The value of the cell */
  value: Value;
  /** Custom component to render when the cell is edited, if not defined would default to the component defined for the Spreadsheet */
  DataEditor?: React.ComponentType<any>;
  /** Custom component to render when the cell is viewed, if not defined would default to the component defined for the Spreadsheet */
  DataViewer?: React.ComponentType<any>;
};

type Matrix<T> = Array<Array<T | undefined>>;

export type UniversalCell = CellBase & { [key: string]: any };

export type UniversalMatrix = Matrix<UniversalCell>;
