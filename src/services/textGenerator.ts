import { DifficultyLevel, TextType } from '../types';
import { EASY_WORDS, MEDIUM_WORDS, HARD_WORDS } from '../data/wordLists';
import { EASY_SENTENCES, MEDIUM_SENTENCES, HARD_SENTENCES } from '../data/sentences';
import { EASY_CODE_SNIPPETS, MEDIUM_CODE_SNIPPETS, HARD_CODE_SNIPPETS } from '../data/codeSnippets';
import { EASY_PARAGRAPHS, MEDIUM_PARAGRAPHS, HARD_PARAGRAPHS } from '../data/paragraphs';
import { WARMUP_PASSAGES } from '../data/warmupTexts';
import { QUOTES_DATABASE, QuoteItem } from '../data/quotes';

export function generateWarmupText(): string {
  const randomIndex = Math.floor(Math.random() * WARMUP_PASSAGES.length);
  return WARMUP_PASSAGES[randomIndex];
}

export function getRandomQuote(): QuoteItem {
  const randomIndex = Math.floor(Math.random() * QUOTES_DATABASE.length);
  return QUOTES_DATABASE[randomIndex];
}

export function generateWordsText(
  count: number,
  difficulty: DifficultyLevel = 'medium',
  includePunctuation: boolean = false,
  includeNumbers: boolean = false
): string {
  let sourceWords = MEDIUM_WORDS;
  if (difficulty === 'easy') sourceWords = EASY_WORDS;
  if (difficulty === 'hard') sourceWords = HARD_WORDS;

  const result: string[] = [];
  const punctuationMarks = [',', '.', ';', '!', '?', '-', '"'];

  for (let i = 0; i < count; i++) {
    // Occasionally insert a number if requested
    if (includeNumbers && Math.random() < 0.15) {
      result.push(String(Math.floor(Math.random() * 900 + 10)));
      continue;
    }

    const randomIndex = Math.floor(Math.random() * sourceWords.length);
    let word = sourceWords[randomIndex];

    if (includePunctuation && Math.random() < 0.25 && i > 0 && i < count - 1) {
      const p = punctuationMarks[Math.floor(Math.random() * punctuationMarks.length)];
      word = `${word}${p}`;
    }

    result.push(word);
  }

  // Ensure last word has a period if punctuation is enabled
  if (includePunctuation && result.length > 0) {
    const lastWord = result[result.length - 1].replace(/[,;!?-]/g, '');
    result[result.length - 1] = `${lastWord}.`;
  }

  return result.join(' ');
}

export function generateTargetText(
  difficulty: DifficultyLevel,
  textType: TextType,
  wordCountTarget: number = 100,
  includePunctuation: boolean = true,
  includeNumbers: boolean = false
): string {
  if (textType === 'words') {
    return generateWordsText(wordCountTarget, difficulty, includePunctuation, includeNumbers);
  }

  if (textType === 'sentences') {
    let sentences = MEDIUM_SENTENCES;
    if (difficulty === 'easy') sentences = EASY_SENTENCES;
    if (difficulty === 'hard') sentences = HARD_SENTENCES;

    const shuffled = [...sentences].sort(() => 0.5 - Math.random());
    return shuffled.join(' ');
  }

  if (textType === 'code') {
    let snippets = MEDIUM_CODE_SNIPPETS;
    if (difficulty === 'easy') snippets = EASY_CODE_SNIPPETS;
    if (difficulty === 'hard') snippets = HARD_CODE_SNIPPETS;

    const randomIndex = Math.floor(Math.random() * snippets.length);
    return snippets[randomIndex];
  }

  if (textType === 'paragraph') {
    let paragraphs = MEDIUM_PARAGRAPHS;
    if (difficulty === 'easy') paragraphs = EASY_PARAGRAPHS;
    if (difficulty === 'hard') paragraphs = HARD_PARAGRAPHS;

    const randomIndex = Math.floor(Math.random() * paragraphs.length);
    return paragraphs[randomIndex];
  }

  return 'The quick brown fox jumps over the lazy dog.';
}
