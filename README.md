# Arquivo.pt Data Extraction and Export to Excel

This **TypeScript** project allows you to query the [Arquivo.pt](https://arquivo.pt) API, retrieve all archived captures for multiple Portuguese sites, and export this data into an Excel file with separate sheets for each site.

---

## Features

- Automatic paginated requests to fetch all results (captures) for each listed site.
- Extraction of archived links (`linkToArchive`) and formatted capture dates (`timestamp`).
- Creation of an Excel (.xlsx) file with separate sheets, one per site.
- A final row in each sheet indicating the total number of captures found.
- Basic error handling to prevent one site’s failure from stopping the whole process.

---

## Requirements

- Node.js (version 14+ recommended)
- npm for package management

---

## Installation

Clone this repository and install dependencies:

