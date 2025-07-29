# Healthcare Patient Risk Assessment

A React TypeScript application that analyzes patient data from a healthcare API and calculates risk scores based on blood pressure, temperature, and age.

## Features

- Fetches patient data with automatic retry logic for API failures
- Calculates risk scores according to medical guidelines
- Identifies high-risk patients, fever cases, and data quality issues
- Submits assessment results for scoring feedback

## Implementation

### Risk Scoring Rules
- **Blood Pressure**: Normal (1pt) � Elevated (2pt) � Stage 1 (3pt) � Stage 2 (4pt)
- **Temperature**: Normal (0pt) � Low Fever (1pt) � High Fever (2pt)  
- **Age**: <40 or 40-65 (1pt) � >65 (2pt)

### Patient Categories
- **High Risk**: Total score e 4
- **Fever**: Temperature e 99.6�F
- **Data Issues**: Missing/invalid BP, temperature, or age data

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment file and add your API key:
   ```bash
   cp .env.example .env
   ```
4. Edit `.env` and replace `your_api_key_here` with your actual API key:
   ```
   VITE_API_KEY=your_actual_api_key_here
   ```

## Usage

```bash
npm run dev
```

The app loads patient data automatically and displays analysis results with submission capability.

## Architecture

- `src/types/` - TypeScript interfaces
- `src/services/` - API calls with retry logic
- `src/utils/` - Risk calculation and analysis functions
- `src/components/` - React UI components