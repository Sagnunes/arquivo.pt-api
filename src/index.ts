import axios from 'axios';
import * as xlsx from 'xlsx';
import { setTimeout } from 'timers/promises';

// Enhanced type definitions
interface Capture {
    linkToArchive: string;
    tstamp: string;
}

interface FormattedCapture {
    timestamp: string;
    linkToArchive: string;
}

interface ApiResponse {
    estimated_nr_results: number;
    response_items: Capture[];
}

// Configuration
const CONFIG = {
    sites: [
        'bene.madeira.gov.pt',
        'ceha.madeira.gov.pt',
        'aia.madeira.gov.pt',
        'colecaomadeiramusica.conservatorioescoladasartes.com',
        'cultura.madeira.gov.pt',
        'geodiversidade.madeira.gov.pt',
        'hcm.madeira.gov.pt',
        'ifcn.madeira.gov.pt',
        'joram.madeira.gov.pt',
        'lojacidadao.madeira.gov.pt',
    ],
    pageSize: 50,
    apiBaseUrl: 'https://arquivo.pt/textsearch',
    outputFile: 'arquivo_pt_sites.xlsx',
    maxConcurrentRequests: 3,
    requestDelayMs: 300, // Rate limiting to be respectful to the API
};

/**
 * Formats a timestamp from YYYYMMDD to YYYY-MM-DD
 */
function formatTimestamp(tstamp: string): string {
    if (tstamp.length < 8) return tstamp;
    return `${tstamp.slice(0, 4)}-${tstamp.slice(4, 6)}-${tstamp.slice(6, 8)}`;
}

/**
 * Fetches all pages of data for a specific site
 */
async function fetchAllPagesForSite(site: string): Promise<FormattedCapture[]> {
    const allCaptures: FormattedCapture[] = [];
    let offset = 0;
    let totalResults = 0;

    try {
        while (true) {
            const url = `${CONFIG.apiBaseUrl}?versionHistory=${site}&offset=${offset}`;
            console.log(`A obter dados de ${site} com offset=${offset}...`);
            
            // Add delay to respect rate limits
            if (offset > 0) {
                await setTimeout(CONFIG.requestDelayMs);
            }
            
            const { data } = await axios.get<ApiResponse>(url);
            
            totalResults = data.estimated_nr_results;
            const capturesPage = data.response_items || [];
            
            if (capturesPage.length === 0) break;
            
            // Process the current page of results
            capturesPage.forEach(capture => {
                allCaptures.push({
                    timestamp: formatTimestamp(capture.tstamp),
                    linkToArchive: capture.linkToArchive || '',
                });
            });
            
            offset += CONFIG.pageSize;
            
            if (allCaptures.length >= totalResults) break;
        }
        
        console.log(`Total recolhido para ${site}: ${allCaptures.length} de ${totalResults} estimados.`);
        return allCaptures;
    } catch (error) {
        console.error(`Erro a obter dados para ${site}:`, error);
        throw error;
    }
}

/**
 * Creates an Excel worksheet for a site's data
 */
function createWorksheet(site: string, captures: FormattedCapture[]): xlsx.WorkSheet {
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
async function processSitesInBatches(sites: string[]): Promise<Map<string, FormattedCapture[]>> {
    const results = new Map<string, FormattedCapture[]>();
    const batches = [];
    
    // Create batches of sites to process concurrently
    for (let i = 0; i < sites.length; i += CONFIG.maxConcurrentRequests) {
        batches.push(sites.slice(i, i + CONFIG.maxConcurrentRequests));
    }
    
    // Process each batch
    for (const batch of batches) {
        const batchPromises = batch.map(async (site) => {
            try {
                const captures = await fetchAllPagesForSite(site);
                return { site, captures };
            } catch (error) {
                console.error(`Erro a processar site ${site}:`, error);
                return { site, captures: [] };
            }
        });
        
        const batchResults = await Promise.all(batchPromises);
        
        // Store results
        batchResults.forEach(({ site, captures }) => {
            if (captures.length > 0) {
                results.set(site, captures);
            }
        });
    }
    
    return results;
}

/**
 * Main function to orchestrate the data fetching and Excel generation
 */
async function main() {
    console.log(`Iniciando extração de dados para ${CONFIG.sites.length} sites...`);
    
    try {
        // Process all sites with controlled concurrency
        const siteData = await processSitesInBatches(CONFIG.sites);
        
        // Create Excel workbook
        const wb = xlsx.utils.book_new();
        
        // Add a worksheet for each site
        for (const [site, captures] of siteData.entries()) {
            // Excel sheet names are limited to 31 characters
            const sheetName = site.length > 31 ? site.substring(0, 31) : site;
            const ws = createWorksheet(site, captures);
            xlsx.utils.book_append_sheet(wb, ws, sheetName);
        }
        
        // Write the Excel file
        xlsx.writeFile(wb, CONFIG.outputFile);
        console.log(`Ficheiro Excel criado: ${CONFIG.outputFile}`);
        
    } catch (error) {
        console.error('Erro na execução:', error);
    }
}

// Run the application
main();
