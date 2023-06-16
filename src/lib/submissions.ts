import { Post } from "./posts";
import {
  artSubmissionsHandler,
  twoStageArtSubmissionsHandler,
} from "./artSubmissions";
import { nameSubmissionsHandler } from "./nameSubmissions";
import { pokedexSubmissionsHandler } from "./pokedexSubmissions";
import { twoStageStatsSubmissionsHandler } from "./twoStageStatSubmissions";
import { fetchThread } from "./threads";

export interface SubmissionHandler<T> {
  formatBbCode: (post: Post, submission: T) => string;
  getSubmission: (el: HTMLElement, post: Post) => T | null;
}

export enum SubmissionType {
  Art = "art",
  Name = "name",
  Pokedex = "pokedex",
  TwoStageArt = "twoStageArt",
  TwoStageStats = "twoStageStats",
}

export const FINAL_SUBMISSION_TEXT = "final submission";

export const makeSlate = async (type: SubmissionType, url: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatter: SubmissionHandler<any> = {
    [SubmissionType.Art]: artSubmissionsHandler,
    [SubmissionType.Name]: nameSubmissionsHandler,
    [SubmissionType.Pokedex]: pokedexSubmissionsHandler,
    [SubmissionType.TwoStageArt]: twoStageArtSubmissionsHandler,
    [SubmissionType.TwoStageStats]: twoStageStatsSubmissionsHandler,
  }[type];

  const data = await fetchThread(url);
  const bbCodes: string[] = data.flatMap(({ el, post }) => {
    const submission = formatter.getSubmission(el, post);
    return submission === null
      ? []
      : [formatter.formatBbCode(post, submission)];
  });
  return bbCodes.join("\n");
};
