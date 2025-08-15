export interface WatchlistItem {
  _id: string | { $oid: string };
  date: { $date: string };
  symbol: string;
  close: number;
  current_price: number;
  high: number;
  low: number;
  open: number;
  volume: number;
  current_volume?: number;
  trend: string;
  news: string;
  notes: string;
  investment_case: string;
  following_price?: number;
  add_to_wishlist?: boolean;
  created_at?: string;
  followStatus?: string;
}

export interface WatchlistFilters {
  trend?: string;
  follow_status?: string;
  start_date?: string;
  end_date?: string;
  add_to_wishlist?: string;
}

export interface WatchlistSortConfig {
  key: string;
  direction: 'asc' | 'desc';
}