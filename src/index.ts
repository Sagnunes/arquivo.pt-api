import axios from 'axios';
import * as xlsx from 'xlsx';

interface Capture {
    linkToArchive: string;
    tstamp: string;
}

interface ApiResponse {
    estimated_nr_results: number;
    response_items: Capture[];
}

const sites = [
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
];

const pageSize = 50;

function formatTimestamp(tstamp: string): string {
    if (tstamp.length < 8) return tstamp;
    return `${tstamp.slice(0, 4)}-${tstamp.slice(4, 6)}-${tstamp.slice(6, 8)}`;
}

async function fetchAllPagesForSite(site: string): Promise<{ timestamp: string; linkToArchive: string }[]> {
    let allCaptures: { timestamp: string; linkToArchive: string }[] = [];
    let offset = 0;
    let totalResults = 0;

    while (true) {
        const url = `https://arquivo.pt/textsearch?versionHistory=${site}&offset=${offset}`;
        console.log(`A obter dados de ${site} com offset=${offset}...`);
        const response = await axios.get<ApiResponse>(url);
        const data = response.data;

        totalResults = data.estimated_nr_results;
        const capturesPage = data.response_items || [];
        if (capturesPage.length === 0) break;

        const formattedPage = capturesPage.map(capture => ({
            timestamp: formatTimestamp(capture.tstamp),
            linkToArchive: capture.linkToArchive || '',
        }));

        allCaptures = allCaptures.concat(formattedPage);

        offset += pageSize;

        if (allCaptures.length >= totalResults) break;
    }

    console.log(`Total recolhido para ${site}: ${allCaptures.length} de ${totalResults} estimados.`);
    return allCaptures;
}

async function main() {
    const wb = xlsx.utils.book_new();

    for (const site of sites) {
        try {
            const captures = await fetchAllPagesForSite(site);
            const rows = [...captures];
            rows.push({ timestamp: '', linkToArchive: `Total de ficheiros encontrados: ${captures.length}` });

            const sheetName = site.length > 31 ? site.substring(0, 31) : site;
            const ws = xlsx.utils.json_to_sheet(rows);

            xlsx.utils.sheet_add_aoa(ws, [['Timestamp', 'Link to Archive']], { origin: 'A1' });
            xlsx.utils.sheet_add_json(ws, rows, { origin: 'A2', skipHeader: true });

            xlsx.utils.book_append_sheet(wb, ws, sheetName);
        } catch (error) {
            console.error(`Erro a processar site ${site}:`, error);
        }
    }

    xlsx.writeFile(wb, 'arquivo_pt_sites.xlsx');
    console.log('Ficheiro Excel criado: arquivo_pt_multiplos_sites_todos_paginados.xlsx');
}

main().catch(error => console.error('Erro na execução:', error));
