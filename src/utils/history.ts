/**
 * Utilitários para processamento e formatação de histórico de conversas.
 * 
 * Formato esperado de ENTRADA (ApiInteraction):
 * - id: string único da interação
 * - msg: texto da mensagem do cliente
 * - send_msg: texto da resposta do agente
 * - tempo: data/hora da mensagem do cliente (em UTC)
 * - time_sended: data/hora da resposta do agente (já em fuso horário de Brasília)
 * 
 * Formato esperado de SAÍDA (NormalizedMessage e GroupedMessages):
 * - Mensagens separadas individualmente (cliente e agente)
 * - Timestamps normalizados para milissegundos
 * - Ordenação cronológica crescente (mais antigo para mais recente)
 * - Agrupamento por dia (YYYY-MM-DD)
 */

export interface ApiInteraction {
  id: string;
  from: string;
  msg?: string;
  send_msg?: string;
  timestamp?: string | number;
  tempo?: string | number;
  id_agente?: string;
  time_sended?: string | number | null;
  redesocial?: string;
  stats_atend?: string;
}

export interface NormalizedMessage {
  id: string;
  interactionId: string;
  text: string;
  sender: 'client' | 'agent';
  agentName?: string;
  timestamp: number;
  dateStr: string; // YYYY-MM-DD for grouping
}

export interface GroupedMessages {
  dateStr: string;
  messages: NormalizedMessage[];
}

/**
 * Parses a date value into milliseconds.
 */
export const parseToMillis = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined) return null;
  
  // If it's a number, check if it's in seconds or milliseconds
  if (typeof value === "number") {
    return value < 1e12 ? value * 1000 : value;
  }
  
  if (typeof value === "string") {
    // Check if it's purely numeric string
    const n = Number(value);
    if (!isNaN(n) && value.trim() !== "") {
      return n < 1e12 ? n * 1000 : n;
    }
    
    // Replace custom formats if necessary, e.g., "YYYY-MM-DD HH:mm:ss" to ISO
    let dateStr = value.trim();
    // If it's a typical SQL date without 'T' or 'Z', let's normalize it to parse correctly
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateStr)) {
      dateStr = dateStr.replace(' ', 'T');
    }
    
    const d = Date.parse(dateStr);
    if (!isNaN(d)) return d;
  }
  
  return null;
};

/**
 * Normalizes the 'tempo' field which is in UTC, converting it to BR timezone (UTC-3)
 * If the date was parsed as local, we need to subtract 3 hours to represent the correct local time
 * equivalent to the BR time.
 */
export const normalizeTempo = (tempoValue: string | number | null | undefined): number | null => {
  const millis = parseToMillis(tempoValue);
  if (millis === null) return null;
  
  // Se o valor de tempo veio como string e não tem 'Z' no final, o JS faz o parse como tempo local
  // Se ele estava em UTC na verdade, precisamos subtrair as 3 horas do fuso BR (10800000 ms)
  // Para ser mais seguro e atender o requisito: "Converta o campo 'tempo' para o fuso horário brasileiro"
  
  // Verificando se a string original indicava timezone
  const isString = typeof tempoValue === 'string';
  const hasTimezone = isString && (tempoValue.endsWith('Z') || tempoValue.includes('+') || (tempoValue.includes('-') && tempoValue.lastIndexOf('-') > 7));
  
  if (isString && !hasTimezone) {
    // Se não tinha fuso explícito, o Date.parse assumiu fuso local.
    // Mas o valor era UTC. Então o valor lido está "adiantado" em relação ao BRT (que é UTC-3).
    // Ex: "15:00" lido no BRT virou 15:00 BRT, mas era 15:00 UTC (que seria 12:00 BRT).
    // Então subtraímos 3 horas para que a visualização final fique correta.
    return millis - (3 * 60 * 60 * 1000);
  }
  
  return millis;
};

/**
 * Normalizes 'time_sended' which is already in BR timezone.
 */
export const normalizeTimeSended = (timeValue: string | number | null | undefined): number | null => {
  return parseToMillis(timeValue);
};

/**
 * Processa e planifica as interações em mensagens individuais (cliente e agente separadas),
 * ordenando-as cronologicamente.
 */
export const processHistory = (interactions: ApiInteraction[]): NormalizedMessage[] => {
  const messages: NormalizedMessage[] = [];
  
  console.log(`[ProcessHistory] Iniciando processamento de ${interactions.length} interações`);

  interactions.forEach((interaction, index) => {
    // Mensagem do Cliente
    if (interaction.msg && interaction.msg.trim() !== "") {
      // Usa 'tempo' ou 'timestamp'
      const rawTempo = interaction.tempo ?? interaction.timestamp;
      let timestamp = normalizeTempo(rawTempo);
      
      if (timestamp === null) {
        console.warn(`[ProcessHistory] Data inválida para mensagem do cliente no índice ${index}. ID: ${interaction.id}. Valor: ${rawTempo}. Usando Date.now().`);
        timestamp = Date.now();
      }
      
      messages.push({
        id: `${interaction.id || index}-client`,
        interactionId: interaction.id || String(index),
        text: interaction.msg,
        sender: 'client',
        timestamp: timestamp,
        dateStr: formatDateStr(timestamp)
      });
    }

    // Mensagem do Agente/Bot
    if (interaction.send_msg && interaction.send_msg.trim() !== "") {
      let timestamp = normalizeTimeSended(interaction.time_sended);
      
      // Se não tiver time_sended válido, usa o tempo do cliente + 1ms para manter a ordem
      if (timestamp === null) {
        const clientTempo = normalizeTempo(interaction.tempo ?? interaction.timestamp);
        if (clientTempo !== null) {
          console.warn(`[ProcessHistory] time_sended inválido para agente no índice ${index}. ID: ${interaction.id}. Usando tempo do cliente + 1ms.`);
          timestamp = clientTempo + 1;
        } else {
          console.warn(`[ProcessHistory] Datas inválidas para cliente e agente no índice ${index}. ID: ${interaction.id}. Usando Date.now().`);
          timestamp = Date.now();
        }
      }

      messages.push({
        id: `${interaction.id || index}-agent`,
        interactionId: interaction.id || String(index),
        text: interaction.send_msg,
        sender: 'agent',
        agentName: interaction.id_agente || "Assistente Virtual (IA)",
        timestamp: timestamp,
        dateStr: formatDateStr(timestamp)
      });
    }
  });

  // Ordenar todas as mensagens por data/hora (crescente)
  const sortedMessages = messages.sort((a, b) => a.timestamp - b.timestamp);
  console.log(`[ProcessHistory] Processamento concluído. ${sortedMessages.length} mensagens normalizadas e ordenadas.`);
  
  return sortedMessages;
};

/**
 * Retorna uma string de data YYYY-MM-DD para o timezone do Brasil
 */
export const formatDateStr = (timestamp: number): string => {
  const d = new Date(timestamp);
  // Garante o formato no fuso horário do Brasil para agrupamento
  return d.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split('/').reverse().join('-'); // Retorna YYYY-MM-DD se o toLocaleDateString retornar DD/MM/YYYY
};

/**
 * Formata um timestamp para exibição de hora (HH:mm)
 */
export const formatTimeStr = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Agrupa as mensagens por dia (YYYY-MM-DD)
 */
export const groupMessagesByDay = (messages: NormalizedMessage[]): GroupedMessages[] => {
  const groupsMap = new Map<string, NormalizedMessage[]>();
  
  messages.forEach(msg => {
    // Corrige a string de data que pode vir invertida
    // pt-BR toLocaleDateString retorna DD/MM/YYYY, o split('/').reverse().join('-') faz YYYY-MM-DD
    const dateStr = msg.dateStr; 
    
    if (!groupsMap.has(dateStr)) {
      groupsMap.set(dateStr, []);
    }
    groupsMap.get(dateStr)!.push(msg);
  });

  const groups: GroupedMessages[] = Array.from(groupsMap.entries()).map(([dateStr, msgs]) => ({
    dateStr,
    messages: msgs
  }));

  // Garante que os dias sejam exibidos sequencialmente do mais antigo para o mais recente
  return groups.sort((a, b) => a.dateStr.localeCompare(b.dateStr));
};

export const formatDisplayDate = (dateStr: string): string => {
  // Recebe YYYY-MM-DD ou similar e formata para exibição
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    // Se for YYYY-MM-DD, a inversão acima já funcionou
    if (parts[0].length === 4) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    // Se já estiver DD-MM-YYYY, inverte e ajusta
    if (parts[2].length === 4) {
      return `${parts[0]}/${parts[1]}/${parts[2]}`;
    }
  }
  return dateStr;
};
