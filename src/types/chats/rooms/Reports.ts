interface Reports {
  user_id: number;
  reported_id?: number;
  report_issue: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  id: number;
}

export default Reports;
