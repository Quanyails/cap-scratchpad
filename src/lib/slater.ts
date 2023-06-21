import {
  artSubmissionsHandler,
  twoStageArtSubmissionsHandler,
} from "./submissions/artSubmissions";
import { nameSubmissionsHandler } from "./submissions/nameSubmissions";
import { pokedexSubmissionsHandler } from "./submissions/pokedexSubmissions";
import { twoStageStatsSubmissionsHandler } from "./submissions/twoStageStatSubmissions";
import { Post } from "./posts";
import { SubmissionType } from "./submissions/submissions";

export interface SubmissionHandler<T> {
  formatBbCode: (submission: T) => string;
  getSubmission: (post: Post) => T | null;
}

export const FINAL_SUBMISSION_TEXT = "final submission";

export const getSubmissionHandler = (
  type: SubmissionType
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): SubmissionHandler<any> => {
  return {
    [SubmissionType.Art]: artSubmissionsHandler,
    [SubmissionType.Name]: nameSubmissionsHandler,
    [SubmissionType.Pokedex]: pokedexSubmissionsHandler,
    [SubmissionType.TwoStageArt]: twoStageArtSubmissionsHandler,
    [SubmissionType.TwoStageStats]: twoStageStatsSubmissionsHandler,
  }[type];
};
