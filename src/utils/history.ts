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
  dateStr: string;
}

export interface GroupedMessages {
  dateStr: string;
  messages: NormalizedMessage[];
}

export const parseToMillis = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined) return null;
  
  if (typeof value === "number") {
    return value < 1e12 ? value * 1000 : value;
  }
  
  if (typeof value === "string") {
    const n = Number(value);
    if (!isNaN(n) && value.trim() !== "") {
      return n < 1e12 ? n * 1000 : n;
    }
    
    let dateStr = value.trim();
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateStr)) {
      dateStr = dateStr.replace(' ', 'T');
    }
    
    const d = Date.parse(dateStr);
    if (!isNaN(d)) return d;
  }
  
  return null;
};

export const normalizeTempo = (tempoValue: string | number | null | undefined): number | null => {
  const millis = parseToMillis(tempoValue);
  if (millis === null) return null;
  
  const isString = typeof tempoValue === 'string';
  const hasTimezone = isString && (tempoValue.endsWith('Z') || tempoValue.includes('+') || (tempoValue.includes('-') && tempoValue.lastIndexOf('-') > 7));
  
  if (isString && !hasTimezone) {
    return millis - (3 * 60 * 60 * 1000);
  }
  
  return millis;
};

export const normalizeTimeSended = (timeValue: string | number | null | undefined): number | null => {
  return parseToMillis(timeValue);
};

export const processHistory = (interactions: ApiInteraction[]): NormalizedMessage[] => {
  const messages: NormalizedMessage[] = [];

  interactions.forEach((interaction, index) => {
    const clientText = interaction.msg?.trim() ?? "";
    const agentText = interaction.send_msg?.trim() ?? "";
    const isMirroredAgentPayload =
      clientText !== "" &&
      agentText !== "" &&
      clientText === agentText &&
      !!interaction.id_agente;

    if (clientText !== "" && !isMirroredAgentPayload) {
      const rawTempo = interaction.tempo ?? interaction.timestamp;
      let timestamp = normalizeTempo(rawTempo);
      
      if (timestamp === null) {
        timestamp = Date.now();
      }
      
      messages.push({
        id: `${interaction.id || index}-client`,
        interactionId: interaction.id || String(index),
        text: clientText,
        sender: 'client',
        timestamp: timestamp,
        dateStr: formatDateStr(timestamp)
      });
    }

    if (agentText !== "") {
      let timestamp = normalizeTimeSended(interaction.time_sended);
      
      if (timestamp === null) {
        const clientTempo = normalizeTempo(interaction.tempo ?? interaction.timestamp);
        if (clientTempo !== null) {
          timestamp = clientTempo + 1;
        } else {
          timestamp = Date.now();
        }
      }

      messages.push({
        id: `${interaction.id || index}-agent`,
        interactionId: interaction.id || String(index),
        text: agentText,
        sender: 'agent',
        agentName: interaction.id_agente || "Assistente Virtual (IA)",
        timestamp: timestamp,
        dateStr: formatDateStr(timestamp)
      });
    }
  });

  const sortedMessages = messages.sort((a, b) => a.timestamp - b.timestamp);
  
  return sortedMessages;
};

export const formatDateStr = (timestamp: number): string => {
  const d = new Date(timestamp);
  return d.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split('/').reverse().join('-');
};

export const formatTimeStr = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const groupMessagesByDay = (messages: NormalizedMessage[]): GroupedMessages[] => {
  const groupsMap = new Map<string, NormalizedMessage[]>();
  
  messages.forEach(msg => {
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

  return groups.sort((a, b) => a.dateStr.localeCompare(b.dateStr));
};

export const formatDisplayDate = (dateStr: string): string => {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    if (parts[2].length === 4) {
      return `${parts[0]}/${parts[1]}/${parts[2]}`;
    }
  }
  return dateStr;
};
