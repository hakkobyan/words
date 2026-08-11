import {A1_WORD_HUNT_SOURCE_DETAILS} from '@/data/wordHuntSourceDetails.a1';
import {A2_WORD_HUNT_SOURCE_DETAILS} from '@/data/wordHuntSourceDetails.a2';
import {B1_WORD_HUNT_SOURCE_DETAILS} from '@/data/wordHuntSourceDetails.b1';
import {B2_WORD_HUNT_SOURCE_DETAILS} from '@/data/wordHuntSourceDetails.b2';
import {C1_WORD_HUNT_SOURCE_DETAILS} from '@/data/wordHuntSourceDetails.c1';
import {C2_WORD_HUNT_SOURCE_DETAILS} from '@/data/wordHuntSourceDetails.c2';

export type WordHuntSourceDetail={example:string;cloze:string};

/** Real examples from the six CEFR noun lists supplied for Word Hunt. */
export const WORD_HUNT_SOURCE_DETAILS:Record<string,WordHuntSourceDetail>={
  ...A1_WORD_HUNT_SOURCE_DETAILS,
  ...A2_WORD_HUNT_SOURCE_DETAILS,
  ...B1_WORD_HUNT_SOURCE_DETAILS,
  ...B2_WORD_HUNT_SOURCE_DETAILS,
  ...C1_WORD_HUNT_SOURCE_DETAILS,
  ...C2_WORD_HUNT_SOURCE_DETAILS,
};
