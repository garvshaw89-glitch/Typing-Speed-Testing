import { DifficultyLevel, TextType } from '../types';
import { EASY_WORDS, MEDIUM_WORDS, HARD_WORDS } from '../data/wordLists';
import { EASY_SENTENCES, MEDIUM_SENTENCES, HARD_SENTENCES } from '../data/sentences';
import { EASY_CODE_SNIPPETS, MEDIUM_CODE_SNIPPETS, HARD_CODE_SNIPPETS } from '../data/codeSnippets';
import { EASY_PARAGRAPHS, MEDIUM_PARAGRAPHS, HARD_PARAGRAPHS } from '../data/paragraphs';
import { WARMUP_PASSAGES } from '../data/warmupTexts';

export function generateWarmupText(): string {
  const randomIndex = Math.floor(Math.random() * WARMUP_PASSAGES.length);
  return WARMUP_PASSAGES[randomIndex];
}

export function generateTargetText(
  difficulty: DifficultyLevel,
  textType: TextType,
  wordCountTarget: number = 100
): string {
  if (textType === 'words') {
    let sourceWords = MEDIUM_WORDS;
    if (difficulty === 'easy') sourceWords = EASY_WORDS;
    if (difficulty === 'hard') sourceWords = HARD_WORDS;

    const result: string[] = [];
    for (let i = 0; i < wordCountTarget; i++) {
      const randomIndex = Math.floor(Math.random() * sourceWords.length);
      result.push(sourceWords[randomIndex]);
    }
    return result.join(' ');
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
