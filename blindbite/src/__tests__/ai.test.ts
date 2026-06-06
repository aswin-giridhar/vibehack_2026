import { describe, it, expect } from 'vitest';
import { parseAIJson } from '@/lib/ai';

describe('parseAIJson', () => {
  it('should parse valid JSON string', () => {
    const input = '{"name": "test", "value": 42}';
    const result = parseAIJson<{ name: string; value: number }>(input);
    expect(result).toEqual({ name: 'test', value: 42 });
  });

  it('should parse valid JSON array', () => {
    const input = '[{"id": 1}, {"id": 2}]';
    const result = parseAIJson<Array<{ id: number }>>(input);
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('should parse JSON from markdown code block with json label', () => {
    const input = `Here is the result:
\`\`\`json
{"vibe_summary": "Cozy spot", "tags": ["cozy", "warm"]}
\`\`\``;
    const result = parseAIJson<{ vibe_summary: string; tags: string[] }>(input);
    expect(result).toEqual({ vibe_summary: 'Cozy spot', tags: ['cozy', 'warm'] });
  });

  it('should parse JSON from markdown code block without json label', () => {
    const input = `Result:
\`\`\`
{"name": "Dishoom", "tags": ["indian", "brunch"]}
\`\`\`
Done.`;
    const result = parseAIJson<{ name: string; tags: string[] }>(input);
    expect(result).toEqual({ name: 'Dishoom', tags: ['indian', 'brunch'] });
  });

  it('should extract JSON object from mixed text', () => {
    const input = `Based on your craving I suggest: {"restaurant": "O Pescador", "cuisine": "Portuguese"} Hope you enjoy!`;
    const result = parseAIJson<{ restaurant: string; cuisine: string }>(input);
    expect(result).toEqual({ restaurant: 'O Pescador', cuisine: 'Portuguese' });
  });

  it('should extract JSON array from mixed text', () => {
    const input = `Here are my suggestions [{"name": "A"}, {"name": "B"}] let me know`;
    const result = parseAIJson<Array<{ name: string }>>(input);
    expect(result).toEqual([{ name: 'A' }, { name: 'B' }]);
  });

  it('should throw on unparseable input', () => {
    const input = 'This is just plain text with no JSON at all';
    expect(() => parseAIJson(input)).toThrow('Failed to parse AI JSON');
  });

  it('should throw on empty string', () => {
    expect(() => parseAIJson('')).toThrow('Failed to parse AI JSON');
  });

  it('should handle nested JSON objects', () => {
    const input = '{"outer": {"inner": {"deep": "value"}}, "items": [1, 2, 3]}';
    const result = parseAIJson<Record<string, unknown>>(input);
    expect(result).toEqual({ outer: { inner: { deep: 'value' } }, items: [1, 2, 3] });
  });
});
