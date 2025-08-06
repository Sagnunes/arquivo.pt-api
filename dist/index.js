"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const xlsx = __importStar(require("xlsx"));
const promises_1 = require("timers/promises");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Load sites from JSON file
const sitesFilePath = path.join(__dirname, 'sites.json');
const sitesData = JSON.parse(fs.readFileSync(sitesFilePath, 'utf8'));
// Configuration
const CONFIG = {
    sites: sitesData.sites,
    pageSize: 50,
    apiBaseUrl: 'https://arquivo.pt/textsearch',
    outputFile: 'arquivo_pt_sites.xlsx',
    maxConcurrentRequests: 3,
    requestDelayMs: 300,
};
/**
 * Formats a timestamp from YYYYMMDD to YYYY-MM-DD
 */
function formatTimestamp(tstamp) {
    if (tstamp.length < 8)
        return tstamp;
    return `${tstamp.slice(0, 4)}-${tstamp.slice(4, 6)}-${tstamp.slice(6, 8)}`;
}
/**
 * Fetches all pages of data for a specific site
 */
function fetchAllPagesForSite(site) {
    return __awaiter(this, void 0, void 0, function* () {
        const allCaptures = [];
        let offset = 0;
        let totalResults = 0;
        try {
            while (true) {
                const url = `${CONFIG.apiBaseUrl}?versionHistory=${site}&offset=${offset}`;
                console.log(`A obter dados de ${site} com offset=${offset}...`);
                // Add delay to respect rate limits
                if (offset > 0) {
                    yield (0, promises_1.setTimeout)(CONFIG.requestDelayMs);
                }
                const { data } = yield axios_1.default.get(url);
                totalResults = data.estimated_nr_results;
                const capturesPage = data.response_items || [];
                if (capturesPage.length === 0)
                    break;
                // Process the current page of results
                capturesPage.forEach(capture => {
                    allCaptures.push({
                        timestamp: formatTimestamp(capture.tstamp),
                        linkToArchive: capture.linkToArchive || '',
                    });
                });
                offset += CONFIG.pageSize;
                if (allCaptures.length >= totalResults)
                    break;
            }
            console.log(`Total recolhido para ${site}: ${allCaptures.length} de ${totalResults} estimados.`);
            return allCaptures;
        }
        catch (error) {
            console.error(`Erro a obter dados para ${site}:`, error);
            throw error;
        }
    });
}
/**
 * Creates an Excel worksheet for a site's data
 */
function createWorksheet(site, captures) {
    // Create worksheet with headers
    const ws = xlsx.utils.aoa_to_sheet([['Timestamp', 'Link to Archive']]);
    // Add data rows
    xlsx.utils.sheet_add_json(ws, captures, { origin: 'A2', skipHeader: true });
    // Add total row
    xlsx.utils.sheet_add_json(ws, [{
            timestamp: '',
            linkToArchive: `Total de ficheiros encontrados: ${captures.length}`
        }], { origin: `A${captures.length + 2}`, skipHeader: true });
    return ws;
}
/**
 * Process sites in batches to limit concurrency
 */
function processSitesInBatches(sites) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = new Map();
        const batches = [];
        // Create batches of sites to process concurrently
        for (let i = 0; i < sites.length; i += CONFIG.maxConcurrentRequests) {
            batches.push(sites.slice(i, i + CONFIG.maxConcurrentRequests));
        }
        // Process each batch
        for (const batch of batches) {
            const batchPromises = batch.map((site) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const captures = yield fetchAllPagesForSite(site);
                    return { site, captures };
                }
                catch (error) {
                    console.error(`Erro a processar site ${site}:`, error);
                    return { site, captures: [] };
                }
            }));
            const batchResults = yield Promise.all(batchPromises);
            // Store results
            batchResults.forEach(({ site, captures }) => {
                if (captures.length > 0) {
                    results.set(site, captures);
                }
            });
        }
        return results;
    });
}
/**
 * Sanitizes a string to be used as an Excel sheet name
 * Removes characters that are not allowed in Excel sheet names: : \ / ? * [ ]
 */
function sanitizeSheetName(name) {
    // Replace invalid characters with underscores
    return name.replace(/[:\/\\?*\[\]]/g, '_');
}
/**
 * Main function to orchestrate the data fetching and Excel generation
 */
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Iniciando extração de dados para ${CONFIG.sites.length} sites...`);
        try {
            // Process all sites with controlled concurrency
            const siteData = yield processSitesInBatches(CONFIG.sites);
            // Create Excel workbook
            const wb = xlsx.utils.book_new();
            // Add a worksheet for each site
            for (const [site, captures] of siteData.entries()) {
                // Excel sheet names are limited to 31 characters and must not contain invalid characters
                let sheetName = site.length > 31 ? site.substring(0, 31) : site;
                sheetName = sanitizeSheetName(sheetName);
                const ws = createWorksheet(site, captures);
                xlsx.utils.book_append_sheet(wb, ws, sheetName);
            }
            // Write the Excel file
            xlsx.writeFile(wb, CONFIG.outputFile);
            console.log(`Ficheiro Excel criado: ${CONFIG.outputFile}`);
        }
        catch (error) {
            console.error('Erro na execução:', error);
        }
    });
}
// Run the application
main();
