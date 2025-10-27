# Consolidation Screening Module

## Overview

The Consolidation Screening Module is a comprehensive feature that allows users to identify stocks in consolidation (sideways) phases using quantitative analysis. This module provides tools to create custom screening criteria, run screenings across NSE stocks, and analyze results.

## Features

### 1. Criteria Management
- **Create Custom Criteria**: Build consolidation screening criteria with 12 configurable parameters
- **Preset Configurations**: Quick setup with predefined configurations (Tight, Broad, Conservative)
- **Criteria Rating**: Rate and track performance of different criteria configurations
- **Active/Inactive Management**: Enable or disable criteria as needed

### 2. Screening Execution
- **Run Screenings**: Execute consolidation screening across all NSE stocks
- **Real-time Results**: Get immediate feedback on screening results
- **Progress Tracking**: Monitor screening progress and completion

### 3. Results Analysis
- **Category Classification**: Results categorized as EXCELLENT, GOOD, FAIR, WEAK, or FAILED
- **Detailed Metrics**: View comprehensive analysis data for each stock
- **Filtering & Sorting**: Filter by category, search by symbol, sort by score
- **Export Functionality**: Export results to CSV format

## Technical Implementation

### File Structure
```
src/
├── types/
│   └── consolidation-screening.ts          # Type definitions
├── lib/hooks/
│   └── useConsolidationScreening.ts        # API hooks and utilities
├── app/ui/consolidation-screening/
│   └── page.tsx                           # Main page component
└── components/features/consolidation-screening/
    ├── ConsolidationCriteriaForm.tsx       # Criteria creation form
    ├── ConsolidationCriteriaDashboard.tsx  # Criteria management
    ├── ConsolidationResultsDashboard.tsx   # Results display
    └── index.ts                           # Component exports
```

### Key Components

#### 1. ConsolidationCriteriaForm
- Interactive form with sliders and input fields
- Real-time parameter validation
- Preset configuration support
- Parameter descriptions and tooltips

#### 2. ConsolidationCriteriaDashboard
- Grid layout showing active and inactive criteria
- Performance metrics and statistics
- Quick actions (run, edit, rate, activate/deactivate)
- Rating modal for criteria evaluation

#### 3. ConsolidationResultsDashboard
- Summary statistics and category breakdown
- Filterable and sortable results table
- Export functionality
- Detailed result metrics

### API Integration

The module uses custom hooks for API integration:

- `useConsolidationCriteria`: Criteria management operations
- `useConsolidationScreening`: Screening execution and results
- `useConsolidationUtils`: Utility functions and health checks
- `useParameterValidation`: Form validation logic

### Parameter Configuration

The system supports 12 configurable parameters:

#### Core Parameters
- **N**: Consolidation Window Length (5-30 sessions)
- **X**: Price Range Threshold (1.0-10.0%)
- **Y**: Upward Drift Tolerance (0.5-5.0%)
- **Z**: Volatility Percentile Threshold (10-50)
- **M**: Volume Baseline Period (20-100 sessions)

#### Volume Parameters
- **V_frac**: Volume Contraction Ratio (0.3-1.0)
- **P**: Low Volume Days Requirement (50.0-90.0%)
- **Q**: Low Volume Percentile (10-40)
- **S**: Volume Spike Limit (1.5-5.0)

#### Additional Parameters
- **R**: Range Centering Width (20.0-60.0%)
- **min_median_volume**: Minimum Median Volume (1000-100000)
- **min_price**: Minimum Price Threshold (0.1-50.0)

## Usage

### 1. Creating Criteria
1. Navigate to Consolidation Screening
2. Click "Create Criteria"
3. Fill in criteria name and creator
4. Configure parameters using sliders or presets
5. Save the criteria

### 2. Running Screenings
1. Go to Criteria Management
2. Click "Run Screening" on desired criteria
3. Wait for screening to complete
4. View results in the Results Dashboard

### 3. Analyzing Results
1. Filter results by category or search by symbol
2. Sort by score, symbol, or category
3. Click "View Details" for comprehensive analysis
4. Export results to CSV if needed

## API Endpoints

The module integrates with the following API endpoints:

- `POST /screening/criteria/CONSOLIDATION` - Create criteria
- `GET /screening/criteria/CONSOLIDATION` - Get all criteria
- `POST /screening/run/CONSOLIDATION/{criteria_id}` - Run screening
- `GET /screening/results/{criteria_id}` - Get results
- `PUT /screening/criteria/{criteria_id}/rating` - Rate criteria
- `PUT /screening/criteria/{criteria_id}/activate` - Activate criteria

## Error Handling

The module includes comprehensive error handling:
- API error display with user-friendly messages
- Form validation with real-time feedback
- Loading states for long-running operations
- Graceful fallbacks for failed requests

## Future Enhancements

- **Comparison Tools**: Compare multiple criteria side-by-side
- **Historical Analysis**: Track criteria performance over time
- **Advanced Filtering**: More sophisticated result filtering options
- **Automated Scheduling**: Schedule regular screenings
- **Performance Analytics**: Detailed performance metrics and charts

## Dependencies

- React 18+
- Next.js 14+
- TypeScript
- Tailwind CSS
- Custom UI components (Button, Input, Select, Badge)

## Contributing

When contributing to this module:
1. Follow the existing code structure and patterns
2. Add proper TypeScript types for new features
3. Include error handling for new API calls
4. Update this documentation for significant changes
5. Test thoroughly with different parameter configurations

