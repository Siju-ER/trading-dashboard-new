'use client';

import React from 'react';
import { NewsItem } from '@/types/news';
import Modal from '@/components/shared/ui/modal/Modal';
import { XIcon, CalendarIcon, ClockIcon, ExternalLinkIcon, PinIcon, PinOffIcon, PlusIcon } from '@/components/shared/icons';
import Badge from '@/components/shared/ui/badge/Badge';
import ActionButton from '@/components/shared/ui/button/ActionButton';

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: NewsItem | null;
  onPinToggle?: (item: NewsItem) => void;
  onAddToBasket?: (item: NewsItem) => void;
}

const NewsModal: React.FC<NewsModalProps> = ({ 
  isOpen, 
  onClose, 
  content, 
  onPinToggle, 
  onAddToBasket 
}) => {
  if (!content) return null;

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
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl">
      <div className="bg-white rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {content.headline || content.title}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {content.source && (
                  <span className="font-medium">{content.source}</span>
                )}
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{content.date}</span>
                </div>
                {content.time && (
                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    <span>{content.time}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onPinToggle && (
                <button
                  onClick={() => onPinToggle(content)}
                  className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                    content.isPinned ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title={content.isPinned ? 'Unpin this news' : 'Pin this news'}
                >
                  {content.isPinned ? (
                    <PinIcon className="h-5 w-5" />
                  ) : (
                    <PinOffIcon className="h-5 w-5" />
                  )}
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tags and badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            {content.sentiment && (
              <Badge variant={getSentimentVariant(content.sentiment)} size="sm">
                {content.sentiment}
              </Badge>
            )}
            {content.impact && (
              <Badge variant={getImpactVariant(content.impact)} size="sm">
                {content.impact} impact
              </Badge>
            )}
            {content.category && (
              <Badge variant="info" size="sm">
                {content.category}
              </Badge>
            )}
            {content.tags && content.tags.map((tag, index) => (
              <Badge key={index} variant="neutral" size="sm">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Summary */}
          {content.summary && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary</h3>
              <p className="text-gray-700 leading-relaxed">{content.summary}</p>
            </div>
          )}

          {/* Full content */}
          {content.content && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Full Article</h3>
              <div className="prose prose-sm max-w-none text-gray-700">
                <p className="whitespace-pre-wrap">{content.content}</p>
              </div>
            </div>
          )}

          {/* Related stocks */}
          {content.relatedStocks && content.relatedStocks.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Related Stocks</h3>
              <div className="flex flex-wrap gap-2">
                {content.relatedStocks.map((stock, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                  >
                    {stock}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Author and metadata */}
          {(content.author || content.publishedAt || content.updatedAt) && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Article Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {content.author && (
                  <div>
                    <span className="text-gray-500">Author:</span>
                    <span className="ml-2 text-gray-900">{content.author}</span>
                  </div>
                )}
                {content.publishedAt && (
                  <div>
                    <span className="text-gray-500">Published:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(content.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {content.updatedAt && (
                  <div>
                    <span className="text-gray-500">Updated:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(content.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {onAddToBasket && (
                <ActionButton
                  variant="primary"
                  size="sm"
                  onClick={() => onAddToBasket(content)}
                  leftIcon={<PlusIcon className="h-4 w-4" />}
                >
                  Add to Basket
                </ActionButton>
              )}
              {content.url && (
                <ActionButton
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(content.url, '_blank')}
                  leftIcon={<ExternalLinkIcon className="h-4 w-4" />}
                >
                  Open Original
                </ActionButton>
              )}
            </div>
            <ActionButton
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              Close
            </ActionButton>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default NewsModal;
