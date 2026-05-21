import { PixReceipt } from '../types';

export class ParserService {
  private static DADO_AUSENTE = 'Dado não disponível no comprovante';

  /**
   * Cleans and normalizes raw text extracted from PDF or OCR.
   */
  private static normalizeText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/ {2,}/g, ' ')
      .trim();
  }

  /**
   * Parses the text and returns a structured PixReceipt.
   */
  public static parse(rawText: string, filename: string): PixReceipt {
    const text = this.normalizeText(rawText);

    const { pagadorSec } = this.splitIntoSections(text);

    const pagador = this.extractName(pagadorSec, text, 'pagador');
    const valor = this.extractValue(text);
    const data = this.extractDate(text);
    const hora = this.extractTime(text);
    const transacao_id = this.extractTransactionId(text);

    const fieldsToCheck: Record<string, string> = { pagador, valor, data, hora, transacao_id };

    const campos_ausentes: string[] = [];
    Object.entries(fieldsToCheck).forEach(([key, val]) => {
      if (val === this.DADO_AUSENTE || val === 'Não informado') {
        campos_ausentes.push(key);
      }
    });

    // If pagador section was not found in the text at all (no heading), it means the
    // receipt layout simply doesn't include payer info (e.g. Nubank "Pix enviado" screens
    // only show the recipient). Treat as aviso rather than erro so it doesn't block export.
    const pagadorSectionAbsent = pagadorSec === '' && pagador === this.DADO_AUSENTE;

    let status_processamento: PixReceipt['status_processamento'] = 'sucesso';
    if (valor === this.DADO_AUSENTE || (!pagadorSectionAbsent && pagador === this.DADO_AUSENTE)) {
      status_processamento = 'erro';
    } else if (campos_ausentes.length > 0) {
      status_processamento = 'aviso';
    }

    return {
      id: Math.random().toString(36).substring(2, 11).toUpperCase(),
      filename,
      pagador,
      data,
      hora,
      valor,
      transacao_id,
      status_processamento,
      campos_ausentes
    };
  }

  /**
   * Splits text into sections based on typical keywords.
   */
  private static splitIntoSections(text: string): { pagadorSec: string; recebedorSec: string; geralSec: string } {
    const lines = text.split('\n');
    let pagadorIndex = -1;
    let recebedorIndex = -1;
    let geralIndex = -1;

    // Search for keywords that denote sections
    const pagadorKeywords = [/dados do pagador/i, /quem pagou/i, /dados de quem pagou/i, /^\s*origem\s*:?\s*$/i, /^\s*de:\s*$/i, /^\s*pagador\s*:?\s*$/i, /^\s*remetente\s*:?\s*$/i];
    const recebedorKeywords = [/dados do recebedor/i, /dados do destinatário/i, /quem recebeu/i, /destinatário/i, /recebedor/i, /beneficiário/i, /para:/i, /destinatário final/i];
    const geralKeywords = [/dados da transação/i, /detalhes da transferência/i, /dados da transferência/i, /informações/i, /autenticação/i];

    lines.forEach((line, i) => {
      if (pagadorIndex === -1 && pagadorKeywords.some(rx => rx.test(line))) {
        pagadorIndex = i;
      }
      if (recebedorIndex === -1 && recebedorKeywords.some(rx => rx.test(line))) {
        recebedorIndex = i;
      }
      if (geralIndex === -1 && geralKeywords.some(rx => rx.test(line))) {
        geralIndex = i;
      }
    });

    // Extract segments
    let pagadorSec = '';
    let recebedorSec = '';
    let geralSec = '';

    const indices = [
      { type: 'pagador', idx: pagadorIndex },
      { type: 'recebedor', idx: recebedorIndex },
      { type: 'geral', idx: geralIndex },
      { type: 'end', idx: lines.length }
    ].filter(item => item.idx !== -1).sort((a, b) => a.idx - b.idx);

    for (let k = 0; k < indices.length - 1; k++) {
      const current = indices[k];
      const next = indices[k + 1];
      const segment = lines.slice(current.idx, next.idx).join('\n');
      if (current.type === 'pagador') pagadorSec = segment;
      if (current.type === 'recebedor') recebedorSec = segment;
      if (current.type === 'geral') geralSec = segment;
    }

    return { pagadorSec, recebedorSec, geralSec };
  }

  /**
   * Extracts Name (Pagador or Recebedor).
   */
  private static extractName(sectionText: string, fullText: string, type: 'pagador' | 'recebedor'): string {
    const textToSearch = sectionText || fullText;

    // Strategy 1: first non-label line after the section heading (handles BB, Sicredi, etc.)
    if (sectionText) {
      const candidate = this.extractFirstNameFromSection(sectionText);
      if (candidate) return candidate;
    }

    // Strategy 2: regex-based (capture group uses literal space, not \s, to stop at line boundary)
    const regexes = type === 'pagador' ? [
        /(?:nome do pagador|nome do pagante|pagador|pagante|remetente|de:)\s*[:\n]+\s*([A-Za-zÀ-ÖØ-öø-ÿ' ]{3,60})/i,
        /(?:quem pagou|origem)\s*\n+([A-Za-zÀ-ÖØ-öø-ÿ' ]{3,60})/i,
      ] : [
        /(?:nome do recebedor|recebedor|destinatário|destinatario|beneficiário|beneficiario|para:)\s*[:\n]+\s*([A-Za-zÀ-ÖØ-öø-ÿ' ]{3,60})/i,
        /(?:quem recebeu|destino)\s*\n+([A-Za-zÀ-ÖØ-öø-ÿ' ]{3,60})/i,
      ];

    for (const rx of regexes) {
      const match = rx.exec(textToSearch) ?? (sectionText ? rx.exec(fullText) : null);
      if (match?.[1]) {
        const cleaned = match[1].trim();
        if (cleaned.length > 3 &&
            !/comprovante/i.test(cleaned) &&
            !/valor/i.test(cleaned) &&
            !/cpf/i.test(cleaned) &&
            !/cnpj/i.test(cleaned) &&
            !/instituição/i.test(cleaned)) {
          return this.capitalizeName(cleaned);
        }
      }
    }

    // Strategy 3: strict fallback for "Dados do Pagador/Recebedor" layouts
    if (type === 'pagador') {
      const strictRx = /(?:dados do pagador|dados de quem pagou)\s*\n+\s*(?:nome[:\s]*)?\s*([A-Za-zÀ-ÖØ-öø-ÿ' ]+)/i;
      const match = strictRx.exec(fullText);
      const name = match?.[1]?.trim();
      if (name) return this.capitalizeName(name);
    } else {
      const strictRx = /(?:dados do recebedor|dados do destinatário|dados do beneficiário)\s*\n+\s*(?:nome[:\s]*)?\s*([A-Za-zÀ-ÖØ-öø-ÿ' ]+)/i;
      const match = strictRx.exec(fullText);
      const name = match?.[1]?.trim();
      if (name) return this.capitalizeName(name);
    }

    return this.DADO_AUSENTE;
  }

  /**
   * Finds the first line in a section that looks like a person/company name,
   * skipping the section heading and common field labels.
   * Works for layouts where the name appears directly after the section header (BB, Sicredi, etc.).
   */
  private static extractFirstNameFromSection(sectionText: string): string | null {
    const labelPattern = /^(CPF|CNPJ|Agência|Agencia|Conta|Instituição|Instituicao|Chave|Banco|Tipo|Pagador|Recebedor|Dados|Informações|Informacoes|Nome$|Cidade|Estado|Endereço|Endereco|CEP|E-mail|Telefone|Número|Numero|Valor|Data|Hora|Pix|Chave\s+Pix)/i;
    const lines = sectionText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (
        line.length >= 5 &&
        line.split(' ').length >= 2 &&
        /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ .'&-]+$/.test(line) &&
        !labelPattern.test(line) &&
        !/^\d/.test(line)
      ) {
        return this.capitalizeName(line);
      }
    }
    return null;
  }

  private static capitalizeName(name: string): string {
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.length > 2 ? word.charAt(0).toUpperCase() + word.slice(1) : word)
      .join(' ');
  }

  /**
   * Extracts Value.
   */
  private static extractValue(text: string): string {
    // Regex for values: R$ 123,45 or R$1.234,56 or even without R$ but with label "Valor:"
    const regexes = [
      /(?:r\$|valor|valor recebido|valor da transação|importância|valor total)\s*\n*\s*([\d\.,]+)/i,
      /(?:r\$\s*)([\d\.,]+)/i,
      /valor[\s:]+([\d\.,]+)/i,
      /([\d]{1,3}(?:\.\d{3})*,\d{2})/i
    ];

    for (const rx of regexes) {
      const match = rx.exec(text);
      if (match && match[1]) {
        const valStr = match[1]?.trim();
        // Ensure it looks like a valid currency value (has decimal comma or ends with digits)
        if (valStr.includes(',') && valStr.length >= 4) {
          return `R$ ${valStr}`;
        }
      }
    }

    // Try a broad currency search
    const broadRx = /\b\d{1,3}(?:\.\d{3})*,\d{2}\b/g;
    const matches = text.match(broadRx);
    if (matches && matches.length > 0) {
      return `R$ ${matches[0]}`;
    }

    return this.DADO_AUSENTE;
  }

  /**
   * Extracts Date.
   */
  private static extractDate(text: string): string {
    // Date formats: DD/MM/YYYY or DD/MM/YY
    const dateRx = /\b(\d{2})[\/-](\d{2})[\/-](\d{4}|\d{2})\b/;
    const match = dateRx.exec(text);
    if (match) {
      let year = match[3];
      if (year.length === 2) {
        year = `20${year}`; // standard century fallback
      }
      return `${match[1]}/${match[2]}/${year}`;
    }

    // Contextual dates like "Data da transação: 12 mai 2026"
    const textDateRx = /(?:data|realizado em|pago em)[\s:]*(\d{2}\s+[a-z]{3}\s+\d{4})/i;
    const textMatch = textDateRx.exec(text);
    if (textMatch) {
      return textMatch[1]?.trim();
    }

    return this.DADO_AUSENTE;
  }

  /**
   * Extracts Time.
   */
  private static extractTime(text: string): string {
    // Time formats: HH:MM or HH:MM:SS
    const timeRx = /\b(\d{2}):(\d{2})(?::(\d{2}))?\b/;
    const match = timeRx.exec(text);
    if (match) {
      // Ensure it is a valid hour-minute format
      const h = parseInt(match[1]);
      const m = parseInt(match[2]);
      if (h >= 0 && h < 24 && m >= 0 && m < 60) {
        return `${match[1]}:${match[2]}`;
      }
    }

    return this.DADO_AUSENTE;
  }

  /**
   * Extracts Pix Transaction ID (EndToEndID).
   */
  private static extractTransactionId(text: string): string {
    // Pix standard ID: E[A-Za-z0-9]{31} (32 characters, starts with E)
    const pixIdRx = /\b([Ee][A-Za-z0-9]{31})\b/;
    const match = pixIdRx.exec(text);
    if (match) {
      return match[1].toUpperCase();
    }

    // Generic transaction ID labels
    const genericIdRx = /(?:id transação|id da transação|transação|código da transação|id:|código de controle|autenticação)\s*:\s*([A-Za-z0-9]+)/i;
    const genMatch = genericIdRx.exec(text);
    if (genMatch && genMatch[1] && genMatch[1].length > 6) {
      return genMatch[1]?.trim().toUpperCase();
    }

    return this.DADO_AUSENTE;
  }

}
