# Arquivo.pt Data Extraction and Export to Excel

This **TypeScript** project allows you to query the [Arquivo.pt](https://arquivo.pt) API, retrieve all archived captures for multiple Portuguese sites, and export this data into an Excel file with separate sheets for each site.

---

## Features

- Automatic paginated requests to fetch all results (captures) for each listed site.
- Extraction of archived links (`linkToArchive`) and formatted capture dates (`timestamp`).
- Creation of an Excel (.xlsx) file with separate sheets, one per site.
- A final row in each sheet indicating the total number of captures found.
- Parallel processing with controlled concurrency for faster data retrieval.
- Rate limiting to be respectful to the Arquivo.pt API.
- Comprehensive error handling to ensure robustness.
- Modular code organization with clear separation of concerns.

---

## Configuration

The application can be configured by modifying the `CONFIG` object in `src/index.ts`:

```typescript
const CONFIG = {
    sites: [
        // List of sites to query
        'bene.madeira.gov.pt',
        // Add or remove sites as needed
    ],
    pageSize: 50,                // Number of results per API request
    apiBaseUrl: 'https://arquivo.pt/textsearch',
    outputFile: 'arquivo_pt_sites.xlsx',
    maxConcurrentRequests: 3,    // Control parallel processing
    requestDelayMs: 300,         // Rate limiting delay in milliseconds
};
```

---

## Requirements

- Node.js (version 14+ recommended)
- npm for package management

---

## Installation

Clone this repository and install dependencies:

```bash
git clone <repository-url>
cd arquivopt
npm install
```

## Usage

To run the application:

```bash
npm run start
```

This will compile the TypeScript code and execute the application, which will:
1. Fetch data from all configured sites
2. Process the data
3. Generate an Excel file with the results

