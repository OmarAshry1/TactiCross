import { AILevel } from '../types/game';

// You must set your OpenAI API key in an environment variable or secure config
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

export async function getAIMove(board: any, level: AILevel): Promise<{ from: { row: number, col: number }, to: { row: number, col: number } } | null> {
  const prompt = generatePrompt(board, level);
  const temperature = level === 'easy' ? 1.2 : level === 'medium' ? 0.7 : 0.2;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: 20
    })
  });
  const data = await response.json();
  if (!data.choices || !data.choices[0]?.message?.content) return null;
  return parseAIMove(data.choices[0].message.content);
}

function generatePrompt(board: any, level: AILevel): string {
  let instructions = '';
  if (level === 'easy') instructions = 'Play a random or not optimal move.';
  else if (level === 'medium') instructions = 'Play a reasonable move.';
  else instructions = 'Play the best possible move to win.';

  return `
You are an AI playing as Player 2 in a 3x3 tactical board game. The board is a 2D array where 1 = Player 1, 2 = Player 2, null = empty. Your pieces can move to adjacent empty cells. Only moved pieces count for winning. Return your move as: fromRow,fromCol -> toRow,toCol.

Board:
${JSON.stringify(board)}

${instructions}
Respond with your move in the format: fromRow,fromCol -> toRow,toCol
`;
}

function parseAIMove(response: string) {
  const match = response.match(/(\d),(\d)\s*->\s*(\d),(\d)/);
  if (!match) return null;
  return {
    from: { row: parseInt(match[1]), col: parseInt(match[2]) },
    to: { row: parseInt(match[3]), col: parseInt(match[4]) }
  };
} 