interface Except {
  code: string;
  errno: number;
  sqlState: string;
  sqlMessage: string;
  sql: string;
}

export default Except;
