import { AILevel } from '../types/game';
import { getRandomAIMove, getGreedyAIMove, getMinimaxAIMove } from './AISurvival';
import dotenv from 'dotenv';
dotenv.config();

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
// OpenAI API key: For production, use environment variables or secure config. For local dev, fallback to the key in openai_api.txt (do NOT commit real keys in production!)

// OpenAI chat configuration
export const OPENAI_CONFIG = {
  model: 'gpt-4.1-mini',
  temperature: 0.0,
  max_tokens: 2048,
  top_p: 1.0,
  frequency_penalty: 0.0,
  presence_penalty: 0.0,
  response_format: undefined, // e.g. { type: 'json_object' }
  stop: undefined, // e.g. ["\n"]
};

function isValidMove(from: { row: number, col: number }, to: { row: number, col: number }, board: string[][]): boolean {
  // Check if 'from' is a valid AI piece
  if (board[from.row][from.col] !== 'b' && board[from.row][from.col] !== 'B') return false;
  // Check if 'to' is an empty cell
  if (board[to.row][to.col] !== '') return false;
  // Add more rules as needed
  return true;
}

export async function getAIMove(board: any, level: AILevel): Promise<{ from: { row: number, col: number }, to: { row: number, col: number }, reason?: string, newBoard?: string[][] } | null> {
  const boardArray = boardToStringArray(board);
  const prompt = generatePrompt(boardArray, level);
  console.log('Sending board to LLM (as 2D array):\n', boardArray);

  const body: any = {
    model: OPENAI_CONFIG.model,
    messages: [{ role: 'user', content: prompt }],
    temperature: OPENAI_CONFIG.temperature,
    max_tokens: OPENAI_CONFIG.max_tokens,
    top_p: OPENAI_CONFIG.top_p,
    frequency_penalty: OPENAI_CONFIG.frequency_penalty,
    presence_penalty: OPENAI_CONFIG.presence_penalty,
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    console.log('Raw OpenAI API response:', data);
    if (data.choices && data.choices[0]?.message?.content) {
      const move = parseAIMoveJSON(data.choices[0].message.content, boardArray);
      if (move && isValidMove(move.from, move.to, boardArray)) {
        return move;
      }
    }
  } catch (e) {
    console.error('OpenAI API error:', e);
  }

  // Fallback based on level
  if (level === 'easy') return getRandomAIMove(board);
  if (level === 'medium') return getGreedyAIMove(board);
  return getMinimaxAIMove(board);
}

function generatePrompt(boardArray: string[][], level: AILevel): string {
  let instructions = '';
  if (level === 'easy') instructions = 'Play a random or not optimal move, sometimes make mistakes.';
  else if (level === 'medium') instructions = 'Play a reasonable move, but not always the best.';
  else instructions = 'Make the best possible move to win.';

  return `You are the AI ('b' and 'B') playing a 3x3 board game against a human ('a' and 'A'). The board is a 2D array of strings: each cell is 'a', 'A', 'b', 'B', or '' (empty).\n\n
  Rules:\n
  - On your turn, move one of your pieces ('b' or 'B') to any empty cell ('').
  \n- When a piece moves, it becomes capitalized (b -> B, a -> A).\n
  - The game is won when 3 capital letters ('A' or 'B') are in a row, column, or diagonal.\n
  - Only one piece can move per turn. You cannot skip a turn.\n
  - Respond ONLY with a JSON object: { reason: "...", boardState: [[...], [...], [...]] }\n
  - The boardState must be a valid 3x3 array of strings after your move.\n\n
  - prioritize blocking player 1 from winning on their next move, unless you can win on your current turn.
  Current board:\n${JSON.stringify(boardArray)}\n\n
  ${instructions}\n`;
}

function parseAIMove(response: string) {
  // Log the raw LLM response for debugging
  console.log('LLM raw response:', response);
  // Remove newlines and trim
  const cleaned = response.replace(/\n/g, ' ').trim();
  // Try to match the move pattern
  const match = cleaned.match(/(\d),(\d)\s*->\s*(\d),(\d)/);
  if (match) {
    return {
      from: { row: parseInt(match[1]), col: parseInt(match[2]) },
      to: { row: parseInt(match[3]), col: parseInt(match[4]) }
    };
  }
  // Fallback: extract first four numbers
  const nums = cleaned.match(/\d+/g);
  if (nums && nums.length >= 4) {
    return {
      from: { row: parseInt(nums[0]), col: parseInt(nums[1]) },
      to: { row: parseInt(nums[2]), col: parseInt(nums[3]) }
    };
  }
  // If nothing found, return null
  return null;
}

// Convert BoardCell[][] to string[][] for LLM prompt
function boardToStringArray(board: any[][]): string[][] {
  return board.map(row =>
    row.map(cell => {
      if (!cell || cell.owner == null) return '';
      if (cell.owner === 1) return cell.moved ? 'A' : 'a';
      if (cell.owner === 2) return cell.moved ? 'B' : 'b';
      return '';
    })
  );
}

function parseAIMoveJSON(response: string, oldBoard?: string[][]) {
  // Try to parse the JSON response
  try {
    const jsonStart = response.indexOf('{');
    const jsonEnd = response.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) return null;
    const jsonString = response.slice(jsonStart, jsonEnd + 1);
    const obj = JSON.parse(jsonString);
    const newBoard = obj.boardState;
    let from = null, to = null;
    if (oldBoard && newBoard) {
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          if ((oldBoard[r][c] === 'b' || oldBoard[r][c] === 'B') && newBoard[r][c] === '') {
            from = { row: r, col: c };
          }
          if (oldBoard[r][c] === '' && (newBoard[r][c] === 'B')) {
            to = { row: r, col: c };
          }
        }
      }
    }
    if (from && to) {
      return { from, to, reason: obj.reason, newBoard };
    }
    // fallback: just return the new board and reason
    return { from: { row: -1, col: -1 }, to: { row: -1, col: -1 }, reason: obj.reason, newBoard };
  } catch (e) {
    console.error('Failed to parse LLM JSON response:', e, response);
    return null;
  }
} 
