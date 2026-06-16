export interface DashboardData {
  totalLimit: number;
  used: number;
  history: Array<{ date: string; tokens: number }>;
  logs: Array<{
    id: number;
    action: string;
    model: string;
    tokens: number;
    timestamp: string;
    status: 'success' | 'error';
  }>;
}

export type ViewState = 'dashboard' | 'api-keys' | 'playground' | 'settings' | 'docs' | 'profile' | 'admin';
