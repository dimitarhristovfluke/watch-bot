export interface ProcessInfo {
  processid: string;
  pname: string;
  pending: number;
  errors?: number;
  count?: number;
  lastcheck?: Date;
  detailsurl: string;
  cserverid?: string;
  stalled?: number;
}
