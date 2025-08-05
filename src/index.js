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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var xlsx = require("xlsx");
var sites = [
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
var pageSize = 50;
function formatTimestamp(tstamp) {
    if (tstamp.length < 8)
        return tstamp;
    return "".concat(tstamp.slice(0, 4), "-").concat(tstamp.slice(4, 6), "-").concat(tstamp.slice(6, 8));
}
function fetchAllPagesForSite(site) {
    return __awaiter(this, void 0, void 0, function () {
        var allCaptures, offset, totalResults, url, response, data, capturesPage, formattedPage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    allCaptures = [];
                    offset = 0;
                    totalResults = 0;
                    _a.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 3];
                    url = "https://arquivo.pt/textsearch?versionHistory=".concat(site, "&offset=").concat(offset);
                    console.log("A obter dados de ".concat(site, " com offset=").concat(offset, "..."));
                    return [4 /*yield*/, axios_1.default.get(url)];
                case 2:
                    response = _a.sent();
                    data = response.data;
                    totalResults = data.estimated_nr_results;
                    capturesPage = data.response_items || [];
                    if (capturesPage.length === 0)
                        return [3 /*break*/, 3];
                    formattedPage = capturesPage.map(function (capture) { return ({
                        timestamp: formatTimestamp(capture.tstamp),
                        linkToArchive: capture.linkToArchive || '',
                    }); });
                    allCaptures = allCaptures.concat(formattedPage);
                    offset += pageSize;
                    if (allCaptures.length >= totalResults)
                        return [3 /*break*/, 3];
                    return [3 /*break*/, 1];
                case 3:
                    console.log("Total recolhido para ".concat(site, ": ").concat(allCaptures.length, " de ").concat(totalResults, " estimados."));
                    return [2 /*return*/, allCaptures];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var wb, _i, sites_1, site, captures, rows, sheetName, ws, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wb = xlsx.utils.book_new();
                    _i = 0, sites_1 = sites;
                    _a.label = 1;
                case 1:
                    if (!(_i < sites_1.length)) return [3 /*break*/, 6];
                    site = sites_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fetchAllPagesForSite(site)];
                case 3:
                    captures = _a.sent();
                    rows = __spreadArray([], captures, true);
                    rows.push({ timestamp: '', linkToArchive: "Total de ficheiros encontrados: ".concat(captures.length) });
                    sheetName = site.length > 31 ? site.substring(0, 31) : site;
                    ws = xlsx.utils.json_to_sheet(rows);
                    xlsx.utils.sheet_add_aoa(ws, [['Timestamp', 'Link to Archive']], { origin: 'A1' });
                    xlsx.utils.sheet_add_json(ws, rows, { origin: 'A2', skipHeader: true });
                    xlsx.utils.book_append_sheet(wb, ws, sheetName);
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error("Erro a processar site ".concat(site, ":"), error_1);
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    xlsx.writeFile(wb, 'arquivo_pt_sites.xlsx');
                    console.log('Ficheiro Excel criado: arquivo_pt_multiplos_sites_todos_paginados.xlsx');
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (error) { return console.error('Erro na execução:', error); });
