import { describe, it, expect } from 'vitest';
import { 
  parseToMillis, 
  normalizeTempo, 
  normalizeTimeSended, 
  processHistory, 
  groupMessagesByDay,
  ApiInteraction
} from './history';

describe('History Utils', () => {
  describe('parseToMillis', () => {
    it('should parse valid date strings', () => {
      const millis = parseToMillis('2024-03-25T15:00:00Z');
      expect(millis).toBe(Date.parse('2024-03-25T15:00:00Z'));
    });

    it('should parse timestamps in seconds', () => {
      const millis = parseToMillis(1711378800); // 2024-03-25T15:00:00Z in seconds
      expect(millis).toBe(1711378800000);
    });

    it('should parse timestamps in milliseconds', () => {
      const millis = parseToMillis(1711378800000);
      expect(millis).toBe(1711378800000);
    });
    
    it('should handle SQL like date strings', () => {
      const millis = parseToMillis('2024-03-25 15:00:00');
      expect(millis).toBe(Date.parse('2024-03-25T15:00:00'));
    });
  });

  describe('normalizeTempo', () => {
    it('should convert UTC assumed as local by subtracting 3 hours', () => {
      // 15:00 UTC without Z
      const originalString = '2024-03-25 15:00:00';
      const result = normalizeTempo(originalString);
      
      const expectedMillis = Date.parse('2024-03-25T15:00:00') - (3 * 60 * 60 * 1000);
      expect(result).toBe(expectedMillis);
    });

    it('should not subtract 3 hours if string has timezone info (Z)', () => {
      const originalString = '2024-03-25T15:00:00Z';
      const result = normalizeTempo(originalString);
      expect(result).toBe(Date.parse(originalString));
    });
  });

  describe('processHistory', () => {
    it('should split interactions into client and agent messages and sort them by time', () => {
      const mockInteractions: ApiInteraction[] = [
        {
          id: '1',
          from: '123',
          msg: 'Hello',
          tempo: '2024-03-25 15:00:00', // UTC sem Z -> vai subtrair 3h
          send_msg: 'Hi there',
          time_sended: '2024-03-25 12:05:00', // BR time (já está em BR, não subtrai)
        }
      ];

      const result = processHistory(mockInteractions);
      
      expect(result).toHaveLength(2);
      
      // Client message
      expect(result[0].sender).toBe('client');
      expect(result[0].text).toBe('Hello');
      
      // Agent message
      expect(result[1].sender).toBe('agent');
      expect(result[1].text).toBe('Hi there');
      
      // Check order (client first because 15:00 UTC -> 12:00 BR, agent is 12:05 BR)
      expect(result[0].timestamp).toBeLessThan(result[1].timestamp);
    });
    
    it('should handle malformed dates gracefully', () => {
      const mockInteractions: ApiInteraction[] = [
        {
          id: '1',
          from: '123',
          msg: 'Hello',
          tempo: 'invalid-date',
        }
      ];

      const result = processHistory(mockInteractions);
      expect(result).toHaveLength(1);
      expect(result[0].timestamp).toBeTypeOf('number'); // Fills with Date.now() fallback
    });
  });

  describe('groupMessagesByDay', () => {
    it('should group messages by day correctly', () => {
      const mockInteractions: ApiInteraction[] = [
        {
          id: '1',
          from: '123',
          msg: 'Day 1 msg',
          tempo: '2024-03-24 15:00:00',
        },
        {
          id: '2',
          from: '123',
          msg: 'Day 2 msg',
          tempo: '2024-03-25 15:00:00',
        }
      ];

      const messages = processHistory(mockInteractions);
      const grouped = groupMessagesByDay(messages);
      
      expect(grouped).toHaveLength(2);
      // Older first
      expect(grouped[0].messages[0].text).toBe('Day 1 msg');
      expect(grouped[1].messages[0].text).toBe('Day 2 msg');
    });
  });
});
