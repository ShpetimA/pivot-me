# Pivot Me

A React application for creating pivot tables from transaction data. Group and summarize transactions by various dimensions (year, transaction type, status).

## Running the App

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open http://localhost:5173 in your browser.

## Running Tests

```bash
pnpm test
```

## Assumptions & Limitations

- **Data source**: Uses hardcoded transaction data (`src/constants/data.ts`). No backend/API integration.
- **Aggregation**: Only supports SUM aggregation on the `amount` field.
- **Dimensions**: Limited to 3 groupable dimensions: `year`, `transaction_type`, `status`.
- **Single measure**: Cannot pivot on multiple numeric fields simultaneously.