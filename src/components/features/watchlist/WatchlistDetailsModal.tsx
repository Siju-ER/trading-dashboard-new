'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { WatchlistItem } from './WatchlistContainer';
import Modal from '@/components/shared/ui/modal/Modal';
import { XIcon, AlertCircleIcon, FileTextIcon, BookOpenIcon, NewsLetterIcon } from '@/components/shared/icons';
import type { Components } from 'react-markdown';

interface WatchlistDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: WatchlistItem | null;
  modalContent: 'news' | 'notes' | 'investment_case';
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
        <code className="px-1 py-0.5 rounded text-sm font-mono bg-slate-100 dark:bg-slate-800 text-red-600 dark:text-red-400" {...props}>
          {children}
        </code>
      ) : (
        <div className="rounded p-4 my-4 overflow-x-auto text-sm font-mono bg-slate-800 text-slate-200">
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
        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
        {...props}
      >
        {children}
      </a>
    ),
    h1: ({ node, children, ...props }) => (
      <h1 className="text-2xl font-bold mt-6 mb-4 text-slate-800 dark:text-slate-100" {...props}>
        {children}
      </h1>
    ),
    h2: ({ node, children, ...props }) => (
      <h2 className="text-xl font-bold mt-5 mb-3 text-slate-800 dark:text-slate-100" {...props}>
        {children}
      </h2>
    ),
    h3: ({ node, children, ...props }) => (
      <h3 className="text-lg font-bold mt-4 mb-2 text-slate-800 dark:text-slate-100" {...props}>
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
      <blockquote className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 py-1 my-4 italic text-slate-600 dark:text-slate-400" {...props}>
        {children}
      </blockquote>
    ),
    hr: ({ node, ...props }) => (
      <hr className="my-6 border-t border-slate-300 dark:border-slate-700" {...props} />
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
      showCloseButton={false}
    >
      <div className="h-[90vh] flex flex-col rounded-xl shadow-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <div className="flex items-center">
              {modalInfo.icon}
              <h2 className="text-xl font-bold">
                {modalInfo.title} - <span className="text-blue-600 dark:text-blue-400">{selectedItem.symbol}</span>
              </h2>
            </div>
            <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">
              {modalInfo.description}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            aria-label="Close"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content Area */}
        <div className="flex-grow p-6 overflow-hidden">
          <div className="h-full overflow-y-auto rounded-lg bg-slate-50 dark:bg-slate-900 shadow-inner p-6">
            {!content ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400">
                <AlertCircleIcon className="h-16 w-16 mb-4 opacity-40" />
                <h3 className="text-lg font-medium mb-2">No content available</h3>
                <p className="max-w-md">
                  There is no {modalContent.replace('_', ' ')} information available for {selectedItem.symbol} at this time.
                </p>
              </div>
            ) : modalContent === 'notes' ? (
              <ReactMarkdown 
                // className="prose prose-slate dark:prose-invert prose-sm max-w-none text-slate-800 dark:text-slate-300"
                components={components}
              >
                {content}
              </ReactMarkdown>
            ) : (
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-slate-800 dark:text-slate-300">
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