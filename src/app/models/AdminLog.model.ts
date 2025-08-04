export interface AdminLog {
  id?: number;
  action: string;
  performedBy: string;
  details?: string;
  timestamp: string; // ISO string
}
