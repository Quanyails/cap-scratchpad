import {
  artSubmissionsHandler,
  twoStageArtSubmissionsHandler,
} from "./submissions/artSubmissions";
import { nameSubmissionsHandler } from "./submissions/nameSubmissions";
import { pokedexSubmissionsHandler } from "./submissions/pokedexSubmissions";
import { twoStageStatsSubmissionsHandler } from "./submissions/twoStageStatSubmissions";
import { Post } from "./posts";
import { Parsed, SubmissionType } from "./submissions/submissions";

export interface SubmissionHandler<T> {
  formatBbCode: (submission: T) => string;
  parseSubmission: (post: Post) => Parsed<T>;
}

export const getSubmissionHandler = (type: SubmissionType) => {
  return {
    [SubmissionType.Art]: artSubmissionsHandler,
    [SubmissionType.Name]: nameSubmissionsHandler,
    [SubmissionType.Pokedex]: pokedexSubmissionsHandler,
    [SubmissionType.TwoStageArt]: twoStageArtSubmissionsHandler,
    [SubmissionType.TwoStageStats]: twoStageStatsSubmissionsHandler,
  }[type];
};
