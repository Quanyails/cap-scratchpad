import { ValidationResult } from "../validation";

export enum SubmissionType {
  Art = "art",
  Name = "name",
  Pokedex = "pokedex",
  TwoStageArt = "twoStageArt",
  TwoStageStats = "twoStageStats",
}

export interface Parsed<T> {
  submission: T | null;
  validationResult: ValidationResult;
}

export const FINAL_SUBMISSION_TEXT = "final submission";

export const Parsed = {
  issues: (issues: string[]): Parsed<never> => {
    return {
      submission: null,
      validationResult: {
        issues,
        isValid: false,
      },
    };
  },
  of: <T>(submission: T): Parsed<T> => {
    return {
      submission,
      validationResult: {
        issues: [],
        isValid: true,
      },
    };
  },
};
