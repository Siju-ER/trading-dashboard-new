export interface NewsItem {
  id: string;
  title: string;
  link: string;
  published_date: string;
  source: string;
  news_type: 'Global' | 'Indian';
}

export interface NewsBankResponse {
  status: string;
  data: NewsItem[];
  pagination: {
    page: number;
    per_page: number;
    total_pages: number;
    total_records: number;
  };
}

export interface NewsFilters {
  news_type?: 'Global' | 'Indian';
  published_date?: string;
}

