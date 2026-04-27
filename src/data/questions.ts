import { Question } from '../types';
import { MOE_MANDATORY_QUESTIONS } from './moe_mandatory';
import { MOE_PART1_QUESTIONS } from './moe_part1';
import { MOE_PART2_1_QUESTIONS } from './moe_part2_1';
import { MOE_PART2_2_QUESTIONS } from './moe_part2_2';
import { MOE_PART2_3_QUESTIONS } from './moe_part2_3';
import { MOE_PART3_QUESTIONS } from './moe_part3';
import { MOE_APPENDICES_QUESTIONS } from './moe_appendices';

export const QUESTIONS: Question[] = [
  ...MOE_MANDATORY_QUESTIONS,
  ...MOE_PART1_QUESTIONS,
  ...MOE_PART2_1_QUESTIONS,
  ...MOE_PART2_2_QUESTIONS,
  ...MOE_PART2_3_QUESTIONS,
  ...MOE_PART3_QUESTIONS,
  ...MOE_APPENDICES_QUESTIONS
];
