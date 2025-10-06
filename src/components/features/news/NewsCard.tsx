'use client';

import React from 'react';
import { NewsItem } from '@/types/news';
import { PinIcon, PinOffIcon, CalendarIcon, ClockIcon, ExternalLinkIcon, PlusIcon } from '@/components/shared/icons';
import ActionButton from '@/components/shared/ui/button/ActionButton';
import Badge from '@/components/shared/ui/badge/Badge';

interface NewsCardProps {
  item: NewsItem;
  index: number;
  onPinToggle: (item: NewsItem, index: number) => void;
  onViewDetails: (item: NewsItem) => void;
  onAddToBasket: (item: NewsItem) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({
  item,
  index,
  onPinToggle,
  onViewDetails,
  onAddToBasket,
}) => {
  const getSentimentVariant = (sentiment?: string): 'success' | 'warning' | 'danger' | 'info' => {
    switch (sentiment) {
      case 'positive': return 'success';
      case 'negative': return 'danger';
      case 'neutral': return 'info';
      default: return 'info';
    }
  };

  const getImpactVariant = (impact?: string): 'success' | 'warning' | 'danger' | 'info' => {
    switch (impact) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'info';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 hover:shadow-md ${
      item.isPinned ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="p-6 h-full flex flex-col">
        {/* Header with pin button */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 mr-3">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight">
              {item.headline || item.title}
            </h3>
            {item.source && (
              <p className="text-sm text-gray-500 mt-1">{item.source}</p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPinToggle(item, index);
            }}
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0 ${
              item.isPinned ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
            title={item.isPinned ? 'Unpin this news' : 'Pin this news'}
          >
            {item.isPinned ? (
              <PinIcon className="h-5 w-5" />
            ) : (
              <PinOffIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Summary */}
        {item.summary && (
          <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
            {item.summary}
          </p>
        )}

        {/* Tags and badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {item.sentiment && (
            <Badge variant={getSentimentVariant(item.sentiment)} size="sm">
              {item.sentiment}
            </Badge>
          )}
          {item.impact && (
            <Badge variant={getImpactVariant(item.impact)} size="sm">
              {item.impact} impact
            </Badge>
          )}
          {item.category && (
            <Badge variant="info" size="sm">
              {item.category}
            </Badge>
          )}
        </div>

        {/* Date and time */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            <span>{item.date}</span>
          </div>
          {item.time && (
            <div className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              <span>{item.time}</span>
            </div>
          )}
        </div>

        {/* Related stocks */}
        {item.relatedStocks && item.relatedStocks.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">Related Stocks:</p>
            <div className="flex flex-wrap gap-1">
              {item.relatedStocks.slice(0, 3).map((stock, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                >
                  {stock}
                </span>
              ))}
              {item.relatedStocks.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
                  +{item.relatedStocks.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-auto">
          <ActionButton
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(item)}
            className="flex-1"
          >
            View Details
          </ActionButton>
          <ActionButton
            variant="primary"
            size="sm"
            onClick={() => onAddToBasket(item)}
            leftIcon={<PlusIcon className="h-4 w-4" />}
            className="flex-1"
          >
            Add to Basket
          </ActionButton>
          {item.url && (
            <ActionButton
              variant="ghost"
              size="sm"
              onClick={() => window.open(item.url, '_blank')}
              leftIcon={<ExternalLinkIcon className="h-4 w-4" />}
              title="Open in new tab"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
