'use client';

import React, { useState, useRef, useCallback } from 'react';
import { 
  ChevronDownIcon, 
  ChevronRightIcon, 
  GripVerticalIcon, 
  Maximize2Icon, 
  Minimize2Icon,
  ActivityIcon,
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  AlertCircleIcon,
  InfoIcon
} from '@/components/shared/icons';

interface TechnicalAnalysis {
  symbol: string;
  date: string;
  overall_signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  technical_indicators_snapshot: {
    price: number;
    volume: number;
    exponential_moving_average?: Record<string, number>;
    simple_moving_average?: Record<string, number>;
    relative_strength_index?: number;
    moving_average_convergence_divergence?: {
      MACD_LINE?: number;
      MACD_SIGNAL_LINE?: number;
      MACD_HISTOGRAM_LINE?: number;
    };
    stochastic_oscillator?: {
      STOCHASTIC_K_LINE?: number;
      STOCHASTIC_D_LINE?: number;
    };
    directional_indicator?: {
      POSITIVE_DIRECTIONAL_INDICATOR?: number;
      AVERAGE_DIRECTIONAL_INDICATOR?: number;
      NEGATIVE_DIRECTIONAL_INDICATOR?: number;
    };
    bollinger_bands?: {
      BOLLINGER_BAND_UPPER?: number;
      BOLLINGER_BAND_MIDDLE?: number;
      BOLLINGER_BAND_LOWER?: number;
      BOLLINGER_BAND_WIDTH?: number;
    };
    keltner_channel?: {
      KELTNER_CHANNEL_MIDDLE_LINE?: number;
      KELTNER_CHANNEL_UPPER_LINE?: number;
      KELTNER_CHANNEL_LOWER_LINE?: number;
    };
    volume_indicators?: {
      ON_BALANCE_VOLUME?: number;
      ACCUMULATION_DISTRIBUTION_LINE?: number;
      CHAIKIN_MONEY_FLOW?: number;
      VOLUME_SMA_20?: number;
      VOLUME_RATIO?: number;
      VOLUME_TREND_LAST_2_DAYS?: string;
      VOLUME_TREND_LAST_3_DAYS?: string;
      VOLUME_TREND_LAST_5_DAYS?: string;
    };
    price_indicators?: {
      PRICE_TREND_LAST_2_DAYS?: string;
      PRICE_TREND_LAST_3_DAYS?: string;
      PRICE_TREND_LAST_5_DAYS?: string;
    };
    last_3_trade_patterns?: Record<string, boolean>;
    most_recent_trade_patterns?: Record<string, boolean>;
    [key: string]: any;
  };
  [key: string]: any;
}

interface DetailedAnalysisProps {
  analysisData: TechnicalAnalysis[];
}

interface IndicatorRowProps {
  id: string;
  label: string;
  color: string;
  values: { value: number | string | undefined; date: string }[];
  defaultOpen?: boolean;
  formatter?: (value: number | string | undefined) => string;
  index: number;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
  sectionId: string;
}

// Helper formatting functions
function formatNumber(value: number | string | undefined): string {
  if (value === undefined || value === null) return 'N/A';
  if (typeof value === 'string') return value;
  if (isNaN(Number(value))) return 'N/A';
  return Number(value).toFixed(2);
}

function formatVolume(value: number | string | undefined): string {
  if (value === undefined || value === null) return 'N/A';
  if (typeof value === 'string') return value;
  if (isNaN(Number(value))) return 'N/A';
  return Number(value).toLocaleString();
}

// Indicator Row component with drag functionality
const IndicatorRow: React.FC<IndicatorRowProps> = ({ 
  id,
  label, 
  color, 
  values,
  defaultOpen = false,
  formatter = formatNumber,
  index,
  moveRow,
  sectionId
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const rowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // For drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ id, index, sectionId, type: 'indicator' }));
    setIsDragging(true);
  };
  
  // For drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  // For drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.type === 'indicator' && data.sectionId === sectionId && data.index !== index) {
        moveRow(data.index, index);
      }
    } catch (error) {
      console.error('Error parsing drag data:', error);
    }
  };
  
  // For drag end
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div 
      ref={rowRef}
      className={`border border-gray-200 rounded-lg mb-2 ${isDragging ? 'opacity-40' : 'opacity-100'} transition-all`}
      draggable={true}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
      data-index={index}
      data-section={sectionId}
      data-id={id}
    >
      <div className="w-full px-4 py-2 flex items-center hover:bg-gray-50 rounded-lg transition-colors">
        <div 
          className="cursor-grab active:cursor-grabbing mr-2"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <GripVerticalIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <button
          className="flex-grow text-left flex items-center justify-between"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between w-full">
            <div 
              className="text-sm font-medium px-3 py-1 rounded"
              style={{ backgroundColor: `${color}15`, color }}
            >
              {label}
            </div>
            {isOpen ? (
              <ChevronDownIcon className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRightIcon className="h-4 w-4 text-gray-500" />
            )}
          </div>
        </button>
      </div>
      
      {isOpen && (
        <div className="p-2">
          <div className="overflow-x-auto">
            <div className="flex space-x-1" style={{ minWidth: 'max-content' }}>
              {values.map((item, idx) => {
                const nextValue = values[idx + 1]?.value;
                let colorClass = 'bg-gray-50';
                
                if (nextValue !== undefined && item.value !== undefined) {
                  const current = Number(item.value);
                  const next = Number(nextValue);
                  if (!isNaN(current) && !isNaN(next)) {
                    colorClass = current > next 
                      ? 'bg-green-50' 
                      : current < next 
                        ? 'bg-red-50' 
                        : 'bg-gray-50';
                  }
                }

                return (
                  <div
                    key={`${label}-${idx}`}
                    className={`flex-none w-24 p-2 text-center rounded-md ${colorClass}`}
                  >
                    <div className="text-xs text-gray-500 mb-1 truncate">
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      {formatter(item.value)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Section component to group indicators
interface SectionProps {
  title: string;
  id: string;
  indicators: Array<{
    id: string;
    label: string;
    color: string;
    values: { value: number | string | undefined; date: string }[];
    defaultOpen?: boolean;
    formatter?: (value: number | string | undefined) => string;
  }>;
  onMoveRow: (sectionId: string, dragIndex: number, hoverIndex: number) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  index: number;
  onMoveSection: (dragIndex: number, hoverIndex: number) => void;
  icon?: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ 
  title, 
  id, 
  indicators, 
  onMoveRow, 
  isCollapsed,
  onToggleCollapse,
  index,
  onMoveSection,
  icon
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // For section drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', JSON.stringify({ id, index, type: 'section' }));
    setIsDragging(true);
  };
  
  // For section drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  // For section drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.type === 'section' && data.index !== index) {
        onMoveSection(data.index, index);
      }
    } catch (error) {
      console.error('Error parsing drag data:', error);
    }
  };
  
  // For section drag end
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div 
      ref={sectionRef}
      className={`space-y-2 border-b border-gray-200 pb-4 mb-4 ${isDragging ? 'opacity-40' : 'opacity-100'} transition-opacity`}
      draggable={true}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
      data-index={index}
      data-id={id}
    >
      <div className="flex justify-between items-center section-header bg-gray-50 p-3 rounded-lg cursor-move transition-colors">
        <div className="flex items-center">
          <GripVerticalIcon className="h-5 w-5 text-gray-400 mr-2" />
          <div className="text-gray-700 h-5 w-5 mr-2">
            {icon}
          </div>
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse();
          }} 
          className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
          title={isCollapsed ? "Expand section" : "Collapse section"}
        >
          {isCollapsed ? (
            <Maximize2Icon className="h-4 w-4 text-gray-500" />
          ) : (
            <Minimize2Icon className="h-4 w-4 text-gray-500" />
          )}
        </button>
      </div>
      
      {!isCollapsed && indicators.map((indicator, index) => (
        <IndicatorRow
          key={indicator.id}
          id={indicator.id}
          label={indicator.label}
          color={indicator.color}
          values={indicator.values}
          defaultOpen={indicator.defaultOpen}
          formatter={indicator.formatter || formatNumber}
          index={index}
          moveRow={(dragIndex, hoverIndex) => onMoveRow(id, dragIndex, hoverIndex)}
          sectionId={id}
        />
      ))}
    </div>
  );
};

// Map section IDs to icons
const getSectionIcon = (sectionId: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'price-volume': <ChartBarIcon />,
    'moving-averages': <ActivityIcon />,
    'rsi': <ActivityIcon />,
    'macd': <ActivityIcon />,
    'stochastic': <ActivityIcon />,
    'directional': <TrendingUpIcon />,
    'bollinger': <ActivityIcon />,
    'keltner': <ActivityIcon />,
    'volume-indicators': <ChartBarIcon />,
    'price-trends': <TrendingUpIcon />
  };
  
  return iconMap[sectionId] || <ActivityIcon />;
};

const DetailedAnalysis: React.FC<DetailedAnalysisProps> = ({ analysisData }) => {
  if (!analysisData?.length) return null;

  const createValueArray = (getValue: (data: TechnicalAnalysis) => number | string | undefined) => {
    return analysisData.map(data => ({
      value: getValue(data),
      date: data.date
    }));
  };

  // State for section collapse
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSectionCollapse = (sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Define initial sections and their indicators
  const [sections, setSections] = useState([
    {
      id: 'price-volume',
      title: 'Price & Volume',
      indicators: [
        {
          id: 'price',
          label: 'Price',
          color: '#4A5568',
          values: createValueArray(d => d.technical_indicators_snapshot.price),
          defaultOpen: true
        },
        {
          id: 'volume',
          label: 'Volume',
          color: '#2B6CB0',
          values: createValueArray(d => d.technical_indicators_snapshot.volume),
          formatter: formatVolume
        }
      ]
    },
    {
      id: 'moving-averages',
      title: 'Moving Averages',
      indicators: [9, 20, 21, 50, 96, 200].flatMap(period => {
        const indicators = [];
        
        const emaExists = analysisData.some(d => 
          d.technical_indicators_snapshot.exponential_moving_average && 
          d.technical_indicators_snapshot.exponential_moving_average[`EMA_${period}_DAYS`] !== undefined
        );
        
        const smaExists = analysisData.some(d => 
          d.technical_indicators_snapshot.simple_moving_average && 
          d.technical_indicators_snapshot.simple_moving_average[`SMA_${period}_DAYS`] !== undefined
        );
        
        if (emaExists) {
          indicators.push({
            id: `ema-${period}`,
            label: `EMA ${period}`,
            color: '#3182CE',
            values: createValueArray(d => 
              d.technical_indicators_snapshot.exponential_moving_average?.[`EMA_${period}_DAYS`]
            )
          });
        }
        
        if (smaExists) {
          indicators.push({
            id: `sma-${period}`,
            label: `SMA ${period}`,
            color: '#805AD5',
            values: createValueArray(d => 
              d.technical_indicators_snapshot.simple_moving_average?.[`SMA_${period}_DAYS`]
            )
          });
        }
        
        return indicators;
      })
    },
    {
      id: 'rsi',
      title: 'RSI',
      indicators: [
        {
          id: 'rsi',
          label: 'RSI',
          color: '#C53030',
          values: createValueArray(d => d.technical_indicators_snapshot.relative_strength_index)
        }
      ]
    },
    {
      id: 'macd',
      title: 'MACD',
      indicators: [
        {
          id: 'macd-line',
          label: 'MACD Line',
          color: '#6B46C1',
          values: createValueArray(d => 
            d.technical_indicators_snapshot.moving_average_convergence_divergence?.MACD_LINE
          )
        },
        {
          id: 'signal-line',
          label: 'Signal Line',
          color: '#6B46C1',
          values: createValueArray(d => 
            d.technical_indicators_snapshot.moving_average_convergence_divergence?.MACD_SIGNAL_LINE
          )
        },
        {
          id: 'histogram',
          label: 'Histogram',
          color: '#6B46C1',
          values: createValueArray(d => 
            d.technical_indicators_snapshot.moving_average_convergence_divergence?.MACD_HISTOGRAM_LINE
          )
        }
      ]
    },
    {
      id: 'stochastic',
      title: 'Stochastic Oscillator',
      indicators: [
        {
          id: 'k-line',
          label: '%K Line',
          color: '#DD6B20',
          values: createValueArray(d => 
            d.technical_indicators_snapshot.stochastic_oscillator?.STOCHASTIC_K_LINE
          )
        },
        {
          id: 'd-line',
          label: '%D Line',
          color: '#DD6B20',
          values: createValueArray(d => 
            d.technical_indicators_snapshot.stochastic_oscillator?.STOCHASTIC_D_LINE
          )
        }
      ]
    },
    {
      id: 'directional',
      title: 'Directional Indicators',
      indicators: [
        {
          id: 'positive-di',
          label: 'Positive DI',
          color: '#2C7A7B',
          values: createValueArray(d => 
            d.technical_indicators_snapshot.directional_indicator?.POSITIVE_DIRECTIONAL_INDICATOR
          )
        },
        {
          id: 'average-di',
          label: 'Average DI',
          color: '#2C7A7B',
          values: createValueArray(d => 
            d.technical_indicators_snapshot.directional_indicator?.AVERAGE_DIRECTIONAL_INDICATOR
          )
        },
        {
          id: 'negative-di',
          label: 'Negative DI',
          color: '#2C7A7B',
          values: createValueArray(d => 
            d.technical_indicators_snapshot.directional_indicator?.NEGATIVE_DIRECTIONAL_INDICATOR
          )
        }
      ]
    },
    {
      id: 'bollinger',
      title: 'Bollinger Bands',
      indicators: [
        {
          id: 'upper-band',
          label: 'Upper Band',
          color: '#5A67D8',
          values: createValueArray(d => 
            d.technical_indicators_snapshot.bollinger_bands?.BOLLINGER_BAND_UPPER
          )
        },
        {
          id: 'middle-band',
          label: 'Middle Band',
          color: '#5A67D8',
          values: createValueArray(d => 
            d.technical_indicators_snapshot.bollinger_bands?.BOLLINGER_BAND_MIDDLE
          )
        },
        {
          id: 'lower-band',
          label: 'Lower Band',
          color: '#5A67D8',
          values: createValueArray(d => 
            d.technical_indicators_snapshot.bollinger_bands?.BOLLINGER_BAND_LOWER
          )
        },
        {
          id: 'band-width',
          label: 'Band Width',
          color: '#5A67D8',
          values: createValueArray(d => 
            d.technical_indicators_snapshot.bollinger_bands?.BOLLINGER_BAND_WIDTH
          )
        }
      ]
    },
    {
      id: 'keltner',
      title: 'Keltner Channel',
      indicators: [
        {
          id: 'upper-line',
          label: 'Upper Line',
          color: '#319795',
          values: createValueArray(d => 
            d.technical_indicators_snapshot.keltner_channel?.KELTNER_CHANNEL_UPPER_LINE
          )
        },
        {
          id: 'middle-line',
          label: 'Middle Line',
          color: '#319795',
          values: createValueArray(d => 
            d.technical_indicators_snapshot.keltner_channel?.KELTNER_CHANNEL_MIDDLE_LINE
          )
        },
        {
          id: 'lower-line',
          label: 'Lower Line',
          color: '#319795',
          values: createValueArray(d => 
            d.technical_indicators_snapshot.keltner_channel?.KELTNER_CHANNEL_LOWER_LINE
          )
        }
      ]
    },
    {
      id: 'volume-indicators',
      title: 'Volume Indicators',
      indicators: [
        {
          id: 'on-balance-volume',
          label: 'On Balance Volume',
          color: '#4299E1',
          values: createValueArray(d => 
            d.technical_indicators_snapshot.volume_indicators?.ON_BALANCE_VOLUME
          ),
          formatter: formatVolume
        },
        {
          id: 'adl',
          label: 'ADL',
          color: '#4299E1',
          values: createValueArray(d => 
            d.technical_indicators_snapshot.volume_indicators?.ACCUMULATION_DISTRIBUTION_LINE
          ),
          formatter: formatVolume
        },
        {
          id: 'cmf',
          label: 'CMF',
          color: '#4299E1',
          values: createValueArray(d => 
            d.technical_indicators_snapshot.volume_indicators?.CHAIKIN_MONEY_FLOW
          )
        },
        {
          id: 'volume-sma-20',
          label: 'Volume SMA 20',
          color: '#4299E1',
          values: createValueArray(d => 
            d.technical_indicators_snapshot.volume_indicators?.VOLUME_SMA_20
          ),
          formatter: formatVolume
        },
        {
          id: 'volume-ratio',
          label: 'Volume Ratio',
          color: '#4299E1',
          values: createValueArray(d => 
            d.technical_indicators_snapshot.volume_indicators?.VOLUME_RATIO
          )
        }
      ]
    },
    {
      id: 'price-trends',
      title: 'Price Trends',
      indicators: [
        {
          id: '2-days-trend',
          label: '2 Days Trend',
          color: '#718096',
          values: createValueArray(d => 
            d.technical_indicators_snapshot.price_indicators?.PRICE_TREND_LAST_2_DAYS
          ),
          formatter: (value) => String(value || 'N/A')
        },
        {
          id: '3-days-trend',
          label: '3 Days Trend',
          color: '#718096',
          values: createValueArray(d => 
            d.technical_indicators_snapshot.price_indicators?.PRICE_TREND_LAST_3_DAYS
          ),
          formatter: (value) => String(value || 'N/A')
        },
        {
          id: '5-days-trend',
          label: '5 Days Trend',
          color: '#718096',
          values: createValueArray(d => 
            d.technical_indicators_snapshot.price_indicators?.PRICE_TREND_LAST_5_DAYS
          ),
          formatter: (value) => String(value || 'N/A')
        }
      ]
    }
  ]);

  // Handle row movement within a section
  const handleMoveRow = useCallback((sectionId: string, dragIndex: number, hoverIndex: number) => {
    setSections(prevSections => {
      return prevSections.map(section => {
        if (section.id === sectionId) {
          const newIndicators = [...section.indicators];
          const [removed] = newIndicators.splice(dragIndex, 1);
          newIndicators.splice(hoverIndex, 0, removed);
          return { ...section, indicators: newIndicators };
        }
        return section;
      });
    });
  }, []);

  // Handle section movement
  const handleMoveSection = useCallback((dragIndex: number, hoverIndex: number) => {
    setSections(prevSections => {
      const newSections = [...prevSections];
      const [removed] = newSections.splice(dragIndex, 1);
      newSections.splice(hoverIndex, 0, removed);
      return newSections;
    });
  }, []);

  // Function to collapse all sections
  const collapseAllSections = () => {
    const allCollapsed: Record<string, boolean> = {};
    sections.forEach(section => {
      allCollapsed[section.id] = true;
    });
    setCollapsedSections(allCollapsed);
  };

  // Function to expand all sections
  const expandAllSections = () => {
    setCollapsedSections({});
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200" style={{ width: '100%' }}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <ActivityIcon className="h-5 w-5 mr-2 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-800">Technical Indicators</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Showing {analysisData.length} days of data
            </div>
            <div className="flex gap-2">
              <button 
                onClick={expandAllSections}
                className="px-3 py-1.5 text-sm rounded-lg transition-colors bg-blue-50 text-blue-600 hover:bg-blue-100"
              >
                Expand All
              </button>
              <button 
                onClick={collapseAllSections}
                className="px-3 py-1.5 text-sm rounded-lg transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-2 px-3 py-2 text-sm rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
          <div className="flex items-start">
            <InfoIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <p>Drag and drop sections or indicators to customize your view. Click on an indicator to view historical data.</p>
          </div>
        </div>
      </div>

      {/* Full view container without height constraints */}
      <div className="p-6 bg-gray-50/50" style={{ minWidth: '800px' }}>
        <div className="space-y-0">
          {sections.map((section, index) => (
            <Section 
              key={section.id}
              id={section.id}
              title={section.title}
              indicators={section.indicators}
              onMoveRow={handleMoveRow}
              isCollapsed={!!collapsedSections[section.id]}
              onToggleCollapse={() => toggleSectionCollapse(section.id)}
              index={index}
              onMoveSection={handleMoveSection}
              icon={getSectionIcon(section.id)}
            />
          ))}

          {/* Trading Patterns */}
          <div className="space-y-2 mt-4">
            <div className="flex items-center p-3 rounded-lg bg-gray-50">
              <TrendingUpIcon className="h-5 w-5 mr-2 text-indigo-500" />
              <h3 className="text-lg font-medium text-gray-800">Trading Patterns</h3>
            </div>
            <div className="overflow-x-auto mt-2">
              <div className="flex space-x-2">
                {analysisData.map((data, index) => {
                  const patterns = data.technical_indicators_snapshot.last_3_trade_patterns;
                  if (!patterns) return null;
                  
                  const activePatterns = Object.entries(patterns)
                    .filter(([_, value]) => value)
                    .map(([pattern]) => pattern);
                  
                  return (
                    <div 
                      key={`pattern-${data.symbol}-${data.date}-${index}`} 
                      className="flex-none w-48 p-3 border rounded-lg border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-sm mb-2 text-gray-700">
                        {new Date(data.date).toLocaleDateString()}
                      </div>
                      {activePatterns.length ? (
                        activePatterns.map((pattern, patternIndex) => (
                          <div 
                            key={`${data.date}-${pattern}-${patternIndex}`} 
                            className="text-sm py-1 text-gray-600 flex items-center"
                          >
                            <div className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                              pattern.includes('BULLISH') 
                                ? 'bg-green-500' 
                                : pattern.includes('BEARISH') 
                                  ? 'bg-red-500' 
                                  : 'bg-gray-400'
                            }`}></div>
                            {pattern.replace(/_/g, ' ')}
                          </div>
                        ))
                      ) : (
                        <div className="text-sm py-1 text-gray-400 italic">
                          No patterns detected
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer with info */}
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-gray-500 text-xs">
        <p>Technical indicators are calculated based on historical price data and may not predict future market movements.</p>
      </div>
    </div>
  );
};

export default DetailedAnalysis;

