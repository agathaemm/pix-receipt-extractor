# Pix Receipts XLS 📊✨

Uma aplicação web moderna, robusta e **pronta para produção** construída com **React + TypeScript** (Frontend) e **Node.js + Express + TypeScript** (Backend) para a leitura automatizada de comprovantes Pix (PDFs digitais, fotos e capturas de tela) através de OCR e heurísticas inteligentes, com visualização em tabela interativa editável e exportação para planilhas Excel (.xlsx) profissionais.

---

## 🚀 Principais Recursos

- **Upload de Múltiplos Arquivos**: Suporte drag-and-drop avançado para carregar dezenas de comprovantes simultaneamente.
- **Processamento Híbrido OCR & Parser de PDFs**:
  - **PDF-Parse**: Leitura instantânea e com **100% de acerto** para PDFs digitais/vetoriais gerados pelos aplicativos bancários.
  - **Sharp + Tesseract.js**: Otimizador gráfico integrado (redimensionamento inteligente, escala de cinzas, aumento de contraste e nitidez) para maximizar a precisão da leitura de imagens ou capturas de tela (*prints*) de celular de baixa qualidade.
- **Heurística Inteligente Multi-Bancos**: Parser regex especializado calibrado para identificar e normalizar informações de layouts variáveis de mais de 10 instituições financeiras brasileiras (ex: *Nubank, Itaú, Santander, Bradesco, Banco do Brasil, Caixa, Inter, C6 Bank, Mercado Pago, PicPay, Neon*).
- **Tabela Interativa e Edição Inline**: Exibição dos dados antes da geração do arquivo final. Destaques automáticos em vermelho e badges de alerta para dados faltantes. Permite edição rápida do conteúdo com um duplo clique na célula (*inline editing*).
- **Exportação Excel Profissional (`exceljs`)**:
  - Uma linha por comprovante com cabeçalhos estruturados.
  - Formatação nativa de moeda (valores numéricos prontos para fórmulas e não meras strings).
  - Destaque em cores suaves nas células onde informações originais do comprovante estavam ausentes (exibindo `"Dado não disponível no comprovante"` ou `"Não informado"`).
- **Dark Mode Premium & Responsividade**: Interface moderna de alto impacto visual com temática escura, glassmorphism e efeitos dinâmicos de luzes, otimizada para Desktop e Mobile.

---

## 🛠️ Stack Tecnológica

### Frontend
- **React (v18)** & **TypeScript**
- **Vite** (Build tool ultra-rápido)
- **TailwindCSS** (Estilização premium)
- **Zustand** (Estado global leve e performático)
- **React Query (TanStack Query)** (Gerenciamento e cache de requisições de upload)
- **Axios** (Integração de APIs com progresso em tempo real)
- **React Dropzone** & **Lucide React** (Upload avançado e iconografia moderna)

### Backend
- **Node.js** & **Express** em **TypeScript**
- **Multer** (Gerenciamento de uploads direto em memória RAM)
- **pdf-parse** (Leitura direta e rápida de PDFs nativos)
- **Tesseract.js** (Motor OCR local executado em Node/WASM)
- **Sharp** (Processamento gráfico de imagens em C++ de altíssima performance)
- **exceljs** (Geração e estilização sofisticada de arquivos `.xlsx`)

### DevOps / Qualidade
- **Docker & Docker Compose** (Containerização isolada)
- **ESLint & Prettier** (Consistência de código)

---

## 📂 Arquitetura de Pastas do Projeto

```text
pix-receipt-extractor/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Roteamento final e envio de respostas
│   │   ├── services/         # Núcleo lógico (OCR, PDF parse, parser regex, exceljs)
│   │   ├── middlewares/      # Interceptador e validador Multer
│   │   ├── types/            # Tipos e interfaces TypeScript globais
│   │   ├── app.ts            # Configurações do Express e CORS
│   │   └── index.ts          # Inicializador do Servidor
│   ├── tsconfig.json
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes React (Header, Dropzone, ResultsTable)
│   │   ├── store/            # Estado global com Zustand (useAppStore.ts)
│   │   ├── services/         # Conexão com a API via Axios (api.ts)
│   │   ├── types/            # Tipagens globais do cliente
│   │   ├── App.tsx           # Dashboard unificado e lógica de telas
│   │   ├── index.css         # Variáveis, fontes Inter e glassmorphism
│   │   └── main.tsx
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml        # Orquestrador local do ecossistema completo
├── .gitignore
└── README.md
```

---

## ⚙️ Como Executar a Aplicação

Você pode rodar a aplicação localmente de duas formas: usando **Docker** (recomendado para evitar a necessidade de instalar dependências nativas como o compilador do `sharp`) ou **diretamente em sua máquina**.

### Opção A: Executando via Docker Compose (Recomendado)

Certifique-se de possuir o [Docker](https://www.docker.com/) instalado em sua máquina.

1. Navegue até a pasta raiz do projeto:
   ```bash
   cd /Users/agathaemm/Desktop/projetos/sandbox/pix-receipt-extractor
   ```

2. Execute o comando para baixar/compilar as imagens e subir os containers:
   ```bash
   docker compose up --build
   ```

3. **Pronto!**
   - O **Frontend** estará acessível em: [http://localhost:3000](http://localhost:3000)
   - O **Backend** estará rodando em: [http://localhost:3001](http://localhost:3001)

---

### Opção B: Executando Localmente (Sem Docker)

Você precisará do **Node.js (versão 18 ou superior)** instalado localmente.

#### Passo 1: Inicializando o Backend
1. Entre na pasta do backend:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor em modo de desenvolvimento (hot reload):
   ```bash
   npm run dev
   ```
   *O backend rodará na porta `3001`.*

#### Passo 2: Inicializando o Frontend
1. Abra uma nova aba no terminal e entre na pasta do frontend:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor Vite:
   ```bash
   npm run dev
   ```
   *O frontend rodará na porta `3000` (e criará um proxy automático para a API na porta `3001`).*

---

## 📡 Endpoints do Backend

### 1. Upload de Comprovantes
- **Endpoint**: `POST /api/upload`
- **Formato**: `multipart/form-data`
- **Campo**: `files` (permite até 50 arquivos simultâneos)
- **Resposta**: Retorna um array JSON estruturado com os dados lidos:
  ```json
  [
    {
      "id": "A4B7D9FE",
      "filename": "comprovante_nubank.png",
      "pagador": "João Silva",
      "recebedor": "Maria Souza",
      "cpf_pagador": "123.456.789-00",
      "cpf_recebedor": "Dado não disponível no comprovante",
      "banco_origem": "Nubank",
      "banco_destino": "Itaú",
      "valor": "R$ 150,00",
      "data": "12/05/2026",
      "hora": "14:33",
      "transacao_id": "E123ABC4567890123456789012345678",
      "chave_pix": "maria@souza.com",
      "tipo_chave": "E-mail",
      "instituicao": "Nubank",
      "status": "Concluído",
      "status_processamento": "aviso",
      "campos_ausentes": ["cpf_recebedor"]
    }
  ]
  ```

### 2. Exportação de Planilha Excel
- **Endpoint**: `POST /api/export`
- **Formato**: `application/json`
- **Body**: Array JSON contendo a lista de comprovantes estruturados (incluindo as possíveis edições manuais feitas pelo usuário na interface).
- **Resposta**: Retorna um binário de download (.xlsx) com a planilha estilizada profissionalmente.

---

## 🛡️ Tratamento de Falhas e Robustez
1. **Batch Upload Sem Travamento**: Se um comprovante da fila de upload estiver corrompido ou falhar na leitura OCR, o sistema **não trava o processamento dos demais**. Ele retorna a linha do respectivo arquivo com o status `"erro"` e mensagem correspondente, preenchendo todos os dados como `"Dado não disponível no comprovante"` e permitindo que o usuário digite os dados manualmente na tabela de visualização.
2. **Normalização de Nomes e CPFs**: Filtra quebras de linhas no meio de frases lidas por OCR, capitaliza nomes automaticamente e normaliza pontuações de CPFs/CNPJs mascarados ou completos.
3. **Escrituração Excel com Tipagem Forte**: Valores em dinheiro são exportados convertidos para números reais formatados nas células em vez de strings normais, permitindo ao usuário efetuar fórmulas de soma (`=SOMA(...)`) diretamente na planilha final baixada.
