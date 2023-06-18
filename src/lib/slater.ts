import {
  artSubmissionsHandler,
  twoStageArtSubmissionsHandler,
} from "./submissions/artSubmissions";
import { nameSubmissionsHandler } from "./submissions/nameSubmissions";
import { pokedexSubmissionsHandler } from "./submissions/pokedexSubmissions";
import { twoStageStatsSubmissionsHandler } from "./submissions/twoStageStatSubmissions";
import { fetchThread } from "./threads";
import { Post } from "./posts";
import { SubmissionType } from "./submissions/submissions";
import { validateUniqueUsers } from "./validators";

export interface SubmissionHandler<T> {
  formatBbCode: (post: Post, submission: T) => string;
  getSubmission: (el: HTMLElement, post: Post) => T | null;
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
  const postSubmissions = data.flatMap(({ el, post }) => {
    const submission = formatter.getSubmission(el, post);
    return submission === null ? [] : [{ post, submission }];
  });
  validateUniqueUsers(
    postSubmissions.map(({ post }) => post),
    1
  );

  const bbCodes: string[] = postSubmissions.map(({ post, submission }) => {
    return formatter.formatBbCode(post, submission);
  });
  return bbCodes.join("\n");
};
