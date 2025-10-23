# Consolidation Screening System - API Documentation & UI Guide

## Table of Contents
1. [System Overview](#system-overview)
2. [API Endpoints](#api-endpoints)
3. [Parameter Details](#parameter-details)
4. [Data Models](#data-models)
5. [UI Implementation Guide](#ui-implementation-guide)
6. [Example Workflows](#example-workflows)
7. [Error Handling](#error-handling)

---

## System Overview

The Consolidation Screening System identifies stocks in consolidation (sideways) phases using quantitative analysis. It allows users to:

- **Create custom screening criteria** with configurable parameters
- **Run screenings** across all NSE stocks
- **Rate and compare** different criteria configurations
- **Store and retrieve** screening results with categorization
- **Track performance** of different screening approaches

### Key Concepts
- **Criteria**: A set of parameters that define how consolidation screening is performed
- **Screening**: The process of analyzing stocks using specific criteria
- **Results**: Individual stock analysis results linked to criteria
- **Categories**: EXCELLENT, GOOD, FAIR, WEAK, FAILED based on consolidation quality

---

## API Endpoints

### Base URL
```
/screening
```

### 1. Criteria Management

#### Create Consolidation Criteria
```http
POST /screening/criteria/consolidation
```

**Request Body:**
```json
{
    "name": "Tight Consolidation v1.0",
    "config": {
        "N": 10,
        "X": 4.0,
        "Y": 1.0,
        "Z": 25,
        "M": 50,
        "V_frac": 0.6,
        "P": 70.0,
        "Q": 25,
        "S": 2.0,
        "R": 40.0,
        "min_median_volume": 10000,
        "min_price": 1.0
    },
    "created_by": "admin"
}
```

**Response:**
```json
{
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Tight Consolidation v1.0",
    "type": "CONSOLIDATION",
    "message": "Consolidation criteria created successfully"
}
```

#### Create Resistance Criteria
```http
POST /screening/criteria/resistance
```

#### Create Support Criteria
```http
POST /screening/criteria/support
```

#### Get Criteria by Type
```http
GET /screening/criteria/{screening_type}
```

**Parameters:**
- `screening_type`: CONSOLIDATION, RESISTANCE_LEVEL, SUPPORT_LEVEL

**Response:**
```json
{
    "screening_type": "CONSOLIDATION",
    "criteria": [
        {
            "id": "64f8a1b2c3d4e5f6a7b8c9d0",
            "name": "Tight Consolidation v1.0",
            "type": "CONSOLIDATION",
            "criteria_config": {...},
            "rating": 8.5,
            "is_active": true,
            "created_at": "2025-01-06T10:00:00Z",
            "last_run_at": "2025-01-06T15:30:00Z",
            "run_count": 5,
            "success_rate": 75.0,
            "created_by": "admin"
        }
    ]
}
```

#### Get Active Criteria
```http
GET /screening/criteria/{screening_type}/active
```

#### Get Best Criteria
```http
GET /screening/criteria/{screening_type}/best?limit=5
```

**Parameters:**
- `limit`: Number of results (1-20, default: 5)

#### Rate Criteria Performance
```http
PUT /screening/criteria/{criteria_id}/rating
```

**Request Body:**
```json
{
    "rating": 8.5
}
```

#### Activate/Deactivate Criteria
```http
PUT /screening/criteria/{criteria_id}/activate
PUT /screening/criteria/{criteria_id}/deactivate
```

### 2. Screening Execution

#### Run Consolidation Screening
```http
POST /screening/run/consolidation/{criteria_id}
```

**Response:**
```json
{
    "criteria_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "criteria_name": "Tight Consolidation v1.0",
    "screening_type": "CONSOLIDATION",
    "total_screened": 1500,
    "passed_count": 45,
    "pass_rate": 3.0,
    "category_breakdown": {
        "EXCELLENT": 5,
        "GOOD": 12,
        "FAIR": 18,
        "WEAK": 10,
        "FAILED": 1455
    },
    "screening_date": "2025-01-06T15:30:00Z",
    "results": [...]
}
```

### 3. Results Management

#### Get Screening Results
```http
GET /screening/results/{criteria_id}
```

**Response:**
```json
{
    "criteria_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "summary": {
        "total": 1500,
        "passed": 45,
        "failed": 1455,
        "pass_rate": 3.0,
        "categories": {
            "EXCELLENT": 5,
            "GOOD": 12,
            "FAIR": 18,
            "WEAK": 10,
            "FAILED": 1455
        },
        "latest_run": "2025-01-06T15:30:00Z"
    },
    "results": [
        {
            "id": "64f8a1b2c3d4e5f6a7b8c9d1",
            "symbol": "RELIANCE",
            "passed": true,
            "score": 8.5,
            "category": "EXCELLENT",
            "screening_date": "2025-01-06T15:30:00Z",
            "result_data": {...}
        }
    ]
}
```

#### Get Passed Results Only
```http
GET /screening/results/{criteria_id}/passed
```

#### Compare Criteria Performance
```http
POST /screening/compare
```

**Request Body:**
```json
["criteria_id_1", "criteria_id_2", "criteria_id_3"]
```

### 4. Utility Endpoints

#### Health Check
```http
GET /screening/health
```

#### Get Default Configuration
```http
GET /screening/default-consolidation-config
```

---

## Parameter Details

### Consolidation Screening Parameters

#### Core Parameters

| Parameter | Type | Default | Range | Description | UI Component |
|-----------|------|---------|-------|-------------|---------------|
| **N** | integer | 10 | 5-30 | **Consolidation Window Length**<br/>Number of recent trading sessions to analyze for consolidation. Longer windows (15-20) catch broader consolidations, shorter windows (5-10) catch tighter patterns. | Slider/Number Input |
| **X** | float | 4.0 | 1.0-10.0 | **Price Range Threshold (%)**<br/>Maximum allowed price range as percentage of median close price. Lower values (2-3%) find tighter consolidations, higher values (6-8%) find broader ones. | Slider with % suffix |
| **Y** | float | 1.0 | 0.5-5.0 | **Upward Drift Tolerance (%)**<br/>Maximum allowable upward price drift between first and second half of consolidation period. Prevents trending stocks from being flagged. | Slider with % suffix |
| **Z** | integer | 25 | 10-50 | **Volatility Percentile Threshold**<br/>Maximum percentile rank for price volatility vs 1-year history. Lower values (15-20) find very low volatility, higher values (30-40) allow more volatility. | Slider with percentile |
| **M** | integer | 50 | 20-100 | **Volume Baseline Period**<br/>Number of prior sessions used to calculate baseline volume for comparison. Longer periods (60-80) provide more stable baselines. | Slider/Number Input |

#### Volume Parameters

| Parameter | Type | Default | Range | Description | UI Component |
|-----------|------|---------|-------|-------------|---------------|
| **V_frac** | float | 0.6 | 0.3-1.0 | **Volume Contraction Ratio**<br/>Maximum ratio of current average volume to prior period average. 0.6 means current volume must be ≤60% of prior average. Lower values (0.4-0.5) require stronger volume contraction. | Slider with ratio display |
| **P** | float | 70.0 | 50.0-90.0 | **Low Volume Days Requirement (%)**<br/>Percentage of consolidation days that must have low volume. Higher values (80-90%) require more consistent low volume. | Slider with % suffix |
| **Q** | integer | 25 | 10-40 | **Low Volume Percentile**<br/>Percentile threshold for defining "low volume" vs 1-year distribution. Lower values (15-20) define stricter low volume criteria. | Slider with percentile |
| **S** | float | 2.0 | 1.5-5.0 | **Volume Spike Limit**<br/>Maximum allowed single-day volume spike as multiple of median prior volume. Prevents stocks with volume spikes from passing. | Slider with multiplier |

#### Additional Parameters

| Parameter | Type | Default | Range | Description | UI Component |
|-----------|------|---------|-------|-------------|---------------|
| **R** | float | 40.0 | 20.0-60.0 | **Range Centering Width (%)**<br/>Width of acceptable range for recent close position within consolidation range. Ensures price is not near breakout edges. | Slider with % suffix |
| **min_median_volume** | integer | 10000 | 1000-100000 | **Minimum Median Volume**<br/>Minimum median daily volume over 1 year to include stock. Filters out low-liquidity stocks. | Number Input with comma formatting |
| **min_price** | float | 1.0 | 0.1-50.0 | **Minimum Price Threshold**<br/>Minimum median price to avoid micro-cap noise. Higher values (5-10) focus on larger stocks. | Number Input with currency |

### Parameter Relationships & UI Tips

#### Tight Consolidation Setup
- **N**: 8-12 (shorter window)
- **X**: 2.0-3.0 (tighter range)
- **V_frac**: 0.4-0.5 (strong volume contraction)
- **P**: 80-90 (high low-volume days)

#### Broad Consolidation Setup
- **N**: 15-20 (longer window)
- **X**: 5.0-7.0 (broader range)
- **V_frac**: 0.6-0.7 (moderate volume contraction)
- **P**: 60-70 (moderate low-volume days)

#### Conservative Setup
- **Z**: 15-20 (very low volatility)
- **Q**: 15-20 (stricter low volume)
- **S**: 1.5-2.0 (strict spike limit)
- **min_median_volume**: 50000+ (high liquidity)

---

## Data Models

### ScreenerCriteria
```json
{
    "id": "ObjectId",
    "name": "string",
    "type": "CONSOLIDATION | RESISTANCE_LEVEL | SUPPORT_LEVEL",
    "criteria_config": "object",
    "rating": "number (0-10)",
    "is_active": "boolean",
    "created_at": "datetime",
    "last_run_at": "datetime | null",
    "run_count": "integer",
    "success_rate": "number (0-100)",
    "created_by": "string"
}
```

### ScreenerResult
```json
{
    "id": "ObjectId",
    "criteria_id": "ObjectId",
    "symbol": "string",
    "screening_type": "string",
    "result_data": "object",
    "passed": "boolean",
    "score": "number (0-10)",
    "category": "EXCELLENT | GOOD | FAIR | WEAK | FAILED",
    "screening_date": "datetime",
    "metadata": "object"
}
```

### Result Data Structure
```json
{
    "ticker": "string",
    "consolidating_flag": "boolean",
    "score": "number",
    "category": "string",
    "N_range_abs": "number",
    "N_range_pct": "number",
    "close_std_N": "number",
    "vol_ratio_to_M": "number",
    "pct_low_vol_days": "number",
    "max_volume_spike_multiple": "number",
    "recent_close_position_pct": "number",
    "last_N_closes": "array",
    "last_N_volumes": "array",
    "screening_date": "string"
}
```

---

## UI Implementation Guide

### 1. Criteria Creation Form

#### Form Layout
```
┌─────────────────────────────────────────────────────────┐
│ Create Consolidation Criteria                           │
├─────────────────────────────────────────────────────────┤
│ Criteria Name: [________________]                       │
│ Created By: [________________]                          │
│                                                         │
│ ┌─ Core Parameters ─┐  ┌─ Volume Parameters ─┐        │
│ │ N: [10] sessions   │  │ V_frac: [0.6] ratio │        │
│ │ X: [4.0] %         │  │ P: [70.0] %         │        │
│ │ Y: [1.0] %         │  │ Q: [25] percentile  │        │
│ │ Z: [25] percentile  │  │ S: [2.0] multiple  │        │
│ │ M: [50] sessions    │  │                     │        │
│ └────────────────────┘  └─────────────────────┘       │
│                                                         │
│ ┌─ Additional Parameters ─┐                            │
│ │ R: [40.0] %             │                            │
│ │ min_volume: [10000]     │                            │
│ │ min_price: [1.0]        │                            │
│ └─────────────────────────┘                            │
│                                                         │
│ [Save Criteria] [Reset to Defaults] [Preview]           │
└─────────────────────────────────────────────────────────┘
```

#### UI Components

**Parameter Input Components:**
- **Sliders**: For percentage values (X, Y, R, P) with real-time preview
- **Number Inputs**: For counts (N, M, Z, Q) with validation
- **Ratio Display**: For V_frac showing "Current ≤ 60% of Prior"
- **Multiplier Display**: For S showing "Max Spike ≤ 2.0x Median"

**Validation Rules:**
- N: 5-30, must be integer
- X: 1.0-10.0, must be positive
- Y: 0.5-5.0, must be positive
- Z: 10-50, must be integer
- M: 20-100, must be integer
- V_frac: 0.3-1.0, must be decimal
- P: 50.0-90.0, must be positive
- Q: 10-40, must be integer
- S: 1.5-5.0, must be positive
- R: 20.0-60.0, must be positive
- min_median_volume: 1000-100000, must be integer
- min_price: 0.1-50.0, must be positive

### 2. Criteria Management Dashboard

#### Layout
```
┌─────────────────────────────────────────────────────────┐
│ Consolidation Criteria Management                        │
├─────────────────────────────────────────────────────────┤
│ [Create New] [Import] [Export]                          │
│                                                         │
│ ┌─ Active Criteria ─┐  ┌─ Inactive Criteria ─┐        │
│ │ ✓ Tight Range v1.0 │  │ ○ Broad Range v2.0  │        │
│ │   Rating: 8.5      │  │   Rating: 6.2       │        │
│ │   Runs: 15         │  │   Runs: 3           │        │
│ │   Last: 2h ago     │  │   Last: 1d ago      │        │
│ │   [Run] [Edit] [⋮] │  │   [Activate] [⋮]    │        │
│ └────────────────────┘  └─────────────────────┘       │
│                                                         │
│ ┌─ Performance Summary ─┐                              │
│ │ Total Criteria: 8     │                              │
│ │ Active: 3             │                              │
│ │ Avg Rating: 7.2       │                              │
│ │ Total Runs: 45        │                              │
│ └───────────────────────┘                              │
└─────────────────────────────────────────────────────────┘
```

### 3. Screening Results Dashboard

#### Layout
```
┌─────────────────────────────────────────────────────────┐
│ Consolidation Screening Results                         │
├─────────────────────────────────────────────────────────┤
│ Criteria: Tight Range v1.0 | Last Run: 2h ago          │
│ [Run Again] [Export] [Compare]                         │
│                                                         │
│ ┌─ Summary Stats ─┐  ┌─ Category Breakdown ─┐          │
│ │ Total Screened: 1500 │ │ EXCELLENT: 5 (0.3%) │        │
│ │ Passed: 45 (3.0%)   │ │ GOOD: 12 (0.8%)     │        │
│ │ Failed: 1455 (97%)  │ │ FAIR: 18 (1.2%)     │        │
│ │ Avg Score: 2.1      │ │ WEAK: 10 (0.7%)     │        │
│ └────────────────────┘ │ FAILED: 1455 (97%)   │        │
│                        └─────────────────────┘       │
│                                                         │
│ ┌─ Top Results ─┐                                      │
│ │ RELIANCE   8.5 EXCELLENT [View Details]              │
│ │ TCS        8.2 EXCELLENT [View Details]              │
│ │ INFY       7.8 GOOD      [View Details]              │
│ │ HDFC       7.5 GOOD      [View Details]              │
│ │ [View All Results]                                   │
│ └───────────────────────┘                              │
└─────────────────────────────────────────────────────────┘
```

### 4. Parameter Presets

#### Quick Setup Options
```json
{
    "presets": {
        "tight_consolidation": {
            "name": "Tight Consolidation",
            "description": "Finds stocks in very tight consolidation ranges",
            "config": {
                "N": 8, "X": 2.5, "Y": 0.8, "Z": 20,
                "M": 40, "V_frac": 0.45, "P": 85.0,
                "Q": 20, "S": 1.8, "R": 35.0,
                "min_median_volume": 25000, "min_price": 5.0
            }
        },
        "broad_consolidation": {
            "name": "Broad Consolidation",
            "description": "Finds stocks in broader consolidation patterns",
            "config": {
                "N": 15, "X": 6.0, "Y": 1.5, "Z": 30,
                "M": 60, "V_frac": 0.65, "P": 65.0,
                "Q": 30, "S": 2.5, "R": 45.0,
                "min_median_volume": 15000, "min_price": 2.0
            }
        },
        "conservative": {
            "name": "Conservative Setup",
            "description": "Very strict criteria for high-quality consolidations",
            "config": {
                "N": 12, "X": 3.0, "Y": 1.0, "Z": 15,
                "M": 50, "V_frac": 0.5, "P": 80.0,
                "Q": 15, "S": 1.5, "R": 30.0,
                "min_median_volume": 50000, "min_price": 10.0
            }
        }
    }
}
```

---

## Example Workflows

### 1. Create and Test New Criteria

```javascript
// 1. Create criteria
const createCriteria = async () => {
    const response = await fetch('/screening/criteria/consolidation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'My Custom Consolidation',
            config: {
                N: 12, X: 3.5, Y: 1.2, Z: 25,
                M: 50, V_frac: 0.55, P: 75.0,
                Q: 25, S: 2.0, R: 40.0,
                min_median_volume: 20000, min_price: 2.0
            },
            created_by: 'user123'
        })
    });
    return await response.json();
};

// 2. Run screening
const runScreening = async (criteriaId) => {
    const response = await fetch(`/screening/run/consolidation/${criteriaId}`, {
        method: 'POST'
    });
    return await response.json();
};

// 3. Rate performance
const rateCriteria = async (criteriaId, rating) => {
    const response = await fetch(`/screening/criteria/${criteriaId}/rating`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
    });
    return await response.json();
};
```

### 2. Compare Multiple Criteria

```javascript
const compareCriteria = async (criteriaIds) => {
    const response = await fetch('/screening/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(criteriaIds)
    });
    return await response.json();
};
```

---

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
    "detail": "Invalid parameter value: N must be between 5 and 30"
}
```

#### 404 Not Found
```json
{
    "detail": "Criteria not found"
}
```

#### 500 Internal Server Error
```json
{
    "detail": "Error running consolidation screening: Insufficient data"
}
```

### Error Handling in UI

```javascript
const handleApiError = (error) => {
    if (error.status === 400) {
        // Show validation errors
        showValidationErrors(error.detail);
    } else if (error.status === 404) {
        // Show not found message
        showNotFoundMessage();
    } else if (error.status === 500) {
        // Show server error message
        showServerErrorMessage(error.detail);
    }
};
```

---

## UI Best Practices

### 1. Parameter Input Guidelines
- **Use sliders** for percentage values with real-time preview
- **Show tooltips** explaining what each parameter does
- **Provide presets** for common configurations
- **Validate inputs** in real-time with clear error messages
- **Show parameter relationships** (e.g., "Tighter range requires more volume contraction")

### 2. Results Display
- **Use color coding** for categories (EXCELLENT=green, GOOD=blue, etc.)
- **Show progress indicators** during screening runs
- **Provide export options** (CSV, JSON)
- **Enable sorting and filtering** of results
- **Show detailed metrics** on hover/click

### 3. Performance Considerations
- **Implement pagination** for large result sets
- **Use loading states** for long-running operations
- **Cache criteria configurations** locally
- **Implement retry logic** for failed requests

### 4. User Experience
- **Save draft configurations** automatically
- **Provide undo/redo** for parameter changes
- **Show parameter impact** on expected results
- **Enable criteria cloning** for easy modification
- **Provide help documentation** accessible from UI

---

## Integration Notes

### API Authentication
- All endpoints require authentication
- Include authorization headers in requests
- Handle token expiration gracefully

### Rate Limiting
- Screening operations may take 30-60 seconds
- Implement proper loading states
- Consider implementing progress updates for long operations

### Data Refresh
- Results are cached for performance
- Implement refresh mechanisms
- Show data freshness indicators

This documentation provides everything needed to build a comprehensive UI for the consolidation screening system. The parameter explanations are detailed enough for users to understand what each setting does and how it affects the screening results.

