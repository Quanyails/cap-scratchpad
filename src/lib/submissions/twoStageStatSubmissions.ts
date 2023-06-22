import { Post } from "../posts";
import { formatStats, parseStats, Stats } from "../stats";
import { SubmissionHandler } from "../slater";
import { FINAL_SUBMISSION_TEXT, Parsed } from "./submissions";

interface TwoStageStatsSubmission {
  postUrl: string;
  stage1: Stats;
  stage2: Stats;
  username: string;
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

const getSubmission = ({
  textLines,
  username,
  url,
}: Post): Parsed<TwoStageStatsSubmission> => {
  const [finalSubmissionText] = textLines;

  const isFinalSubmission =
    finalSubmissionText.toLowerCase() === FINAL_SUBMISSION_TEXT;
  if (!isFinalSubmission) {
    return Parsed.issues([]);
  }

  const stage1 = findStats(textLines, STAGE_1_TEXT);
  const stage2 = findStats(textLines, STAGE_2_TEXT);

  const issues = [
    ...(stage1 === undefined
      ? [`${username} did not submit stats properly for stage 1!`]
      : []),
    ...(stage2 === undefined
      ? [`${username} did not submit stats properly for stage 2!`]
      : []),
  ];
  if (issues.length > 0) {
    return Parsed.issues(issues);
  }

  return Parsed.of({
    postUrl: url,
    stage1: stage1 as Stats,
    stage2: stage2 as Stats,
    username,
  });
};

const formatBbCode = ({
  postUrl,
  stage1,
  stage2,
  username,
}: TwoStageStatsSubmission): string => {
  return `[URL="${postUrl}"]${username}[/URL]: ${formatStats(
    stage1
  )} -> ${formatStats(stage2)}`;
};

export const twoStageStatsSubmissionsHandler: SubmissionHandler<TwoStageStatsSubmission> =
  {
    formatBbCode,
    parseSubmission: getSubmission,
  };
