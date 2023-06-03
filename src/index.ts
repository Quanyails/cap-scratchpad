import { artSubmissionsHandler } from "./artSubmissions";
import { nameSubmissionsHandler } from "./nameSubmissions";
import { pokedexSubmissionsHandler } from "./pokedexSubmissions";
import { fetchThread } from "./threads";
import { SubmissionHandler } from "./submissions";
import { twoStageStatsSubmissionsHandler } from "./twoStageStatSubmissions";

type SubmissionType = "art" | "name" | "pokedex";

declare global {
  interface Window {
    Breezi: {
      makeSlate: (url: string, type: SubmissionType) => Promise<string>;
    };
  }
}

const makeSlate = async (url: string, type: SubmissionType) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatter: SubmissionHandler<any> = {
    art: artSubmissionsHandler,
    name: nameSubmissionsHandler,
    pokedex: pokedexSubmissionsHandler,
    twoStageStats: twoStageStatsSubmissionsHandler,
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

window.Breezi = {
  makeSlate,
};
