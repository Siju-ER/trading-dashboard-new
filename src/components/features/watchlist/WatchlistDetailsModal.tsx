'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { WatchlistItem } from '@/types/watchlist';
import Modal from '@/components/shared/ui/modal/Modal';
import { XIcon, AlertCircleIcon, FileTextIcon, BookOpenIcon, NewsLetterIcon, BarChart2Icon } from '@/components/shared/icons';
import type { Components } from 'react-markdown';

interface WatchlistDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: WatchlistItem | null;
  modalContent: 'news' | 'notes' | 'investment_case' | 'business_summary';
}

const WatchlistDetailsModal: React.FC<WatchlistDetailsModalProps> = ({
  isOpen,
  onClose,
  selectedItem,
  modalContent,
}) => {
  if (!isOpen || !selectedItem) return null;
  
  const getContent = () => {
    if (modalContent === 'news') return selectedItem?.news || '';
    if (modalContent === 'investment_case') return selectedItem?.investment_case || '';
    if (modalContent === 'business_summary') return selectedItem?.business_summary || '';
    return selectedItem?.notes || '';
  };

  const getModalInfo = () => {
    if (modalContent === 'news') {
      return { 
        title: 'News', 
        icon: <NewsLetterIcon className="h-5 w-5 mr-2" />,
        description: 'Latest news and market updates'
      };
    }
    if (modalContent === 'investment_case') {
      return { 
        title: 'Investment Case', 
        icon: <BookOpenIcon className="h-5 w-5 mr-2" />,
        description: 'Analysis and investment rationale'
      };
    }
    if (modalContent === 'business_summary') {
      return { 
        title: 'Business Summary', 
        icon: <BarChart2Icon className="h-5 w-5 mr-2" />,
        description: 'Company business overview and operations'
      };
    }
    return { 
      title: 'Notes', 
      icon: <FileTextIcon className="h-5 w-5 mr-2" />,
      description: 'Personal notes and observations'
    };
  };

  const modalInfo = getModalInfo();
  const content = getContent();

  const components: Components = {
    code: ({ node, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      const isInline = !match && !className;

      return isInline ? (
        <code className="px-1 py-0.5 rounded text-sm font-mono bg-gray-100 text-red-600" {...props}>
          {children}
        </code>
      ) : (
        <div className="rounded p-4 my-4 overflow-x-auto text-sm font-mono bg-gray-800 text-gray-200">
          <pre>
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
        </div>
      );
    },
    a: ({ node, className, children, href, ...props }) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 hover:underline"
        {...props}
      >
        {children}
      </a>
    ),
    h1: ({ node, children, ...props }) => (
      <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-800" {...props}>
        {children}
      </h1>
    ),
    h2: ({ node, children, ...props }) => (
      <h2 className="text-xl font-bold mt-5 mb-3 text-gray-800" {...props}>
        {children}
      </h2>
    ),
    h3: ({ node, children, ...props }) => (
      <h3 className="text-lg font-bold mt-4 mb-2 text-gray-800" {...props}>
        {children}
      </h3>
    ),
    ul: ({ node, children, ...props }) => (
      <ul className="list-disc pl-6 my-4" {...props}>
        {children}
      </ul>
    ),
    ol: ({ node, children, ...props }) => (
      <ol className="list-decimal pl-6 my-4" {...props}>
        {children}
      </ol>
    ),
    blockquote: ({ node, children, ...props }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 py-1 my-4 italic text-gray-600" {...props}>
        {children}
      </blockquote>
    ),
    hr: ({ node, ...props }) => (
      <hr className="my-6 border-t border-gray-300" {...props} />
    ),
    p: ({ node, children, ...props }) => (
      <p className="my-3" {...props}>
        {children}
      </p>
    ),
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      maxWidth="5xl"
      showCloseButton={true}
    >
      <div className="h-[90vh] flex flex-col text-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 border-b border-purple-100">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center">
                {modalInfo.icon}
                <h2 className="text-xl font-bold text-gray-900">
                  {modalInfo.title} - <span className="text-blue-600">{selectedItem.symbol}</span>
                </h2>
              </div>
              <p className="text-sm mt-1 text-gray-700">
                {modalInfo.description}
              </p>
            </div>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-grow p-6 overflow-hidden">
          <div className="h-full overflow-y-auto rounded-lg bg-white shadow-inner p-6 border border-gray-100">
            {!content ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-700">
                <AlertCircleIcon className="h-16 w-16 mb-4 opacity-40" />
                <h3 className="text-lg font-medium mb-2 text-gray-900">No content available</h3>
                <p className="max-w-md text-gray-600">
                  There is no {modalContent.replace('_', ' ')} information available for {selectedItem.symbol} at this time.
                </p>
              </div>
            ) : modalContent === 'business_summary' ? (
              <div className="space-y-6">
                {/* Company Information Cards */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl mb-6 border border-purple-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Symbol</div>
                      <div className="text-lg font-bold text-gray-900">{selectedItem.symbol}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Sector</div>
                      <div className="text-sm font-semibold text-gray-900">{selectedItem.sector || 'N/A'}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Industry</div>
                      <div className="text-sm font-semibold text-gray-900">{selectedItem.industry || 'N/A'}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Country</div>
                      <div className="text-sm font-semibold text-gray-900">{selectedItem.country || 'N/A'}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Market Cap</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {selectedItem.market_cap 
                          ? `₹${(selectedItem.market_cap / 10000000).toFixed(2)} Cr`
                          : 'N/A'
                        }
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Current Price</div>
                      <div className="text-sm font-semibold text-gray-900">₹{selectedItem.current_price?.toFixed(2) || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Business Summary Content */}
                <div className="bg-white border border-gray-100 p-6 rounded-lg shadow-sm">
                  <div className="flex items-center mb-4">
                    <BarChart2Icon className="h-5 w-5 text-orange-600 mr-2" />
                    <h4 className="text-lg font-semibold text-gray-900">Business Summary</h4>
                  </div>
                  <div className="prose prose-slate prose-sm max-w-none">
                    <p className="text-gray-900 leading-relaxed text-base whitespace-pre-wrap">
                      {content}
                    </p>
                  </div>
                </div>
              </div>
            ) : modalContent === 'notes' ? (
              <ReactMarkdown 
                components={components}
              >
                {content}
              </ReactMarkdown>
            ) : (
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-gray-900">
                {content}
              </pre>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default WatchlistDetailsModal;