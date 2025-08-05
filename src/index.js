"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var xlsx = require("xlsx");
var promises_1 = require("timers/promises");
// Configuration
var CONFIG = {
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
function formatTimestamp(tstamp) {
    if (tstamp.length < 8)
        return tstamp;
    return "".concat(tstamp.slice(0, 4), "-").concat(tstamp.slice(4, 6), "-").concat(tstamp.slice(6, 8));
}
/**
 * Fetches all pages of data for a specific site
 */
function fetchAllPagesForSite(site) {
    return __awaiter(this, void 0, void 0, function () {
        var allCaptures, offset, totalResults, url, data, capturesPage, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    allCaptures = [];
                    offset = 0;
                    totalResults = 0;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    _a.label = 2;
                case 2:
                    if (!true) return [3 /*break*/, 6];
                    url = "".concat(CONFIG.apiBaseUrl, "?versionHistory=").concat(site, "&offset=").concat(offset);
                    console.log("A obter dados de ".concat(site, " com offset=").concat(offset, "..."));
                    if (!(offset > 0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, promises_1.setTimeout)(CONFIG.requestDelayMs)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [4 /*yield*/, axios_1.default.get(url)];
                case 5:
                    data = (_a.sent()).data;
                    totalResults = data.estimated_nr_results;
                    capturesPage = data.response_items || [];
                    if (capturesPage.length === 0)
                        return [3 /*break*/, 6];
                    // Process the current page of results
                    capturesPage.forEach(function (capture) {
                        allCaptures.push({
                            timestamp: formatTimestamp(capture.tstamp),
                            linkToArchive: capture.linkToArchive || '',
                        });
                    });
                    offset += CONFIG.pageSize;
                    if (allCaptures.length >= totalResults)
                        return [3 /*break*/, 6];
                    return [3 /*break*/, 2];
                case 6:
                    console.log("Total recolhido para ".concat(site, ": ").concat(allCaptures.length, " de ").concat(totalResults, " estimados."));
                    return [2 /*return*/, allCaptures];
                case 7:
                    error_1 = _a.sent();
                    console.error("Erro a obter dados para ".concat(site, ":"), error_1);
                    throw error_1;
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Creates an Excel worksheet for a site's data
 */
function createWorksheet(site, captures) {
    // Create worksheet with headers
    var ws = xlsx.utils.aoa_to_sheet([['Timestamp', 'Link to Archive']]);
    // Add data rows
    xlsx.utils.sheet_add_json(ws, captures, { origin: 'A2', skipHeader: true });
    // Add total row
    xlsx.utils.sheet_add_json(ws, [{
            timestamp: '',
            linkToArchive: "Total de ficheiros encontrados: ".concat(captures.length)
        }], { origin: "A".concat(captures.length + 2), skipHeader: true });
    return ws;
}
/**
 * Process sites in batches to limit concurrency
 */
function processSitesInBatches(sites) {
    return __awaiter(this, void 0, void 0, function () {
        var results, batches, i, _i, batches_1, batch, batchPromises, batchResults;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    results = new Map();
                    batches = [];
                    // Create batches of sites to process concurrently
                    for (i = 0; i < sites.length; i += CONFIG.maxConcurrentRequests) {
                        batches.push(sites.slice(i, i + CONFIG.maxConcurrentRequests));
                    }
                    _i = 0, batches_1 = batches;
                    _a.label = 1;
                case 1:
                    if (!(_i < batches_1.length)) return [3 /*break*/, 4];
                    batch = batches_1[_i];
                    batchPromises = batch.map(function (site) { return __awaiter(_this, void 0, void 0, function () {
                        var captures, error_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, fetchAllPagesForSite(site)];
                                case 1:
                                    captures = _a.sent();
                                    return [2 /*return*/, { site: site, captures: captures }];
                                case 2:
                                    error_2 = _a.sent();
                                    console.error("Erro a processar site ".concat(site, ":"), error_2);
                                    return [2 /*return*/, { site: site, captures: [] }];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(batchPromises)];
                case 2:
                    batchResults = _a.sent();
                    // Store results
                    batchResults.forEach(function (_a) {
                        var site = _a.site, captures = _a.captures;
                        if (captures.length > 0) {
                            results.set(site, captures);
                        }
                    });
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, results];
            }
        });
    });
}
/**
 * Main function to orchestrate the data fetching and Excel generation
 */
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var siteData, wb, _i, _a, _b, site, captures, sheetName, ws, error_3;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log("Iniciando extra\u00E7\u00E3o de dados para ".concat(CONFIG.sites.length, " sites..."));
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, processSitesInBatches(CONFIG.sites)];
                case 2:
                    siteData = _c.sent();
                    wb = xlsx.utils.book_new();
                    // Add a worksheet for each site
                    for (_i = 0, _a = siteData.entries(); _i < _a.length; _i++) {
                        _b = _a[_i], site = _b[0], captures = _b[1];
                        sheetName = site.length > 31 ? site.substring(0, 31) : site;
                        ws = createWorksheet(site, captures);
                        xlsx.utils.book_append_sheet(wb, ws, sheetName);
                    }
                    // Write the Excel file
                    xlsx.writeFile(wb, CONFIG.outputFile);
                    console.log("Ficheiro Excel criado: ".concat(CONFIG.outputFile));
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _c.sent();
                    console.error('Erro na execução:', error_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Run the application
main();
