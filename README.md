# Projeto de Extração e Exportação do Arquivo.pt para Excel

Este projeto em **TypeScript** permite consultar a API do [Arquivo.pt](https://arquivo.pt), recolher todas as capturas arquivadas para vários sites portugueses, e exportar esses dados num ficheiro Excel com uma folha separada para cada site.

---

## Funcionalidades

- Consulta paginada automática para obter todos os resultados (capturas) de cada site listado.
- Extração dos links arquivados (`linkToArchive`) e datas formatadas das capturas (`timestamp`).
- Criação de um ficheiro Excel (.xlsx) com folhas separadas, uma para cada site.
- Linha final em cada folha indicando o total de capturas arquivadas.
- Tratamento simples de erros para impedir que um erro num site pare o processo.

---

## Requisitos

- Node.js (versão 14+ recomendada)
- npm para gerir pacotes

---

## Instalação

Clona este repositório e instala as dependências:

