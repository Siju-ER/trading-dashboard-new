export interface MyBucketItem {
  id: string;
  symbol: string;
  company_name: string;
  category: string;
  logged_date: string;
  logged_price: number;
  current_price: number;
  logged_volume: number;
  current_volume: number;
  gain: number;
  max_gain: number;
  notes: string;
  sector: string;
  industry: string;
  business_summary: string;
  market_cap: number;
  country: string;
  is_reviewed: boolean;
  created_at: string;
  updated_at: string;
}

export interface PrefilledData {
  symbol?: string;
  company_name?: string;
  date?: string;
  logged_price?: number;
}

export interface Stock {
  symbol: string;
  company_name: string;
  current_price?: number;
}
