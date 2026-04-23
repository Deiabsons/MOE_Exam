import { Question } from '../types';
import { PART1_QUESTIONS } from './part1';
import { PART2_1_QUESTIONS } from './part2_1';
import { PART2_2_QUESTIONS } from './part2_2';
import { PART2_3_QUESTIONS } from './part2_3';
import { PART2_4_QUESTIONS } from './part2_4';

export const QUESTIONS: Question[] = [
  ...PART1_QUESTIONS,
  ...PART2_1_QUESTIONS,
  ...PART2_2_QUESTIONS,
  ...PART2_3_QUESTIONS,
  ...PART2_4_QUESTIONS
];
