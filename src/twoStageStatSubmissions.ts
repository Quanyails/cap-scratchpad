import { Post } from "./posts";
import { FINAL_SUBMISSION_TEXT, SubmissionHandler } from "./submissions";
import { formatStats, parseStats, Stats } from "./stats";

interface TwoStageStatsSubmission {
  stage1: Stats;
  stage2: Stats;
}

const STAGE_1_TEXT = "Stage 1:";
const STAGE_2_TEXT = "Stage 2:";

const findStats = (lines: string[], stageText: string): Stats | undefined => {
  const found = lines.flatMap((s) => {
    if (s.toLowerCase().startsWith(stageText.toLowerCase())) {
      const statsAndBstLine = s.slice(stageText.length).trim();

      const statsAndBstMatch = Array.from(
        statsAndBstLine.matchAll(/(.*) \(BST:(.*)\)/g)
      );
      if (statsAndBstMatch.length === 0 || statsAndBstMatch[0].length !== 3) {
        return [];
      }

      const [, spread] = statsAndBstMatch[0];
      const stats = parseStats(spread);

      if (stats === undefined) {
        return [];
      } else {
        return [stats];
      }
    } else {
      return [];
    }
  });

  return found.length === 0 ? undefined : found[0];
};

const getSubmission = (
  el: HTMLElement,
  { textLines, username }: Post
): TwoStageStatsSubmission | null => {
  const [finalSubmissionText] = textLines;

  const isFinalSubmission =
    finalSubmissionText.toLowerCase() === FINAL_SUBMISSION_TEXT;
  if (!isFinalSubmission) {
    return null;
  }

  const stage1 = findStats(textLines, STAGE_1_TEXT);
  const stage2 = findStats(textLines, STAGE_2_TEXT);

  if (stage1 === undefined) {
    console.warn(`${username} did not submit proper stats for stage 1!`);
    return null;
  }
  if (stage2 === undefined) {
    console.warn(`${username} did not submit proper stats for stage 2!`);
    return null;
  }

  return {
    stage1,
    stage2,
  };
};

const formatBbCode = (
  { url, username }: Post,
  { stage1, stage2 }: TwoStageStatsSubmission
): string => {
  return `[URL="${url}"]${username}[/URL]: ${formatStats(
    stage1
  )} -> ${formatStats(stage2)}`;
};

export const twoStageStatsSubmissionsHandler: SubmissionHandler<TwoStageStatsSubmission> =
  {
    formatBbCode,
    getSubmission,
  };
