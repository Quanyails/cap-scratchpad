import { Post } from "../posts";

import { SubmissionHandler } from "../slater";
import { FINAL_SUBMISSION_TEXT, Parsed } from "./submissions";
import _ from "lodash";

const MAX_CATEGORY_CHARACTER_LENGTH = 13;
const MAX_ENTRY_CHARACTER_LENGTH = 153;
const MAX_ENTRY_WORD_COUNT = 30;

interface Entry {
  content: string;
  game: string;
}

interface Stage {
  category: string;
  entries: Entry[];
  name: string;
}

interface PokedexSubmission {
  postId: number;
  stages: Stage[];
  username: string;
}

const isCategoryRightLength = (category: string): boolean => {
  return category.length <= MAX_CATEGORY_CHARACTER_LENGTH;
};

const isEntryRightLength = (entry: string): boolean => {
  return entry.length <= MAX_ENTRY_CHARACTER_LENGTH;
};

const isEntryWordsRightLength = (entry: string): boolean => {
  return entry.split(" ").length <= MAX_ENTRY_WORD_COUNT;
};

const parseEntry = ({
  line,
  username,
}: {
  line: string;
  username: string;
}): Parsed<Entry> => {
  const entryMatch = Array.from(line.matchAll(/(.*): (.*)/g));
  if (entryMatch.length === 0 || entryMatch[0].length !== 3) {
    return Parsed.issues([
      `${username}'s line "${line}" is missing required lines.`,
    ]);
  }

  const issues: string[] = [];
  const [, game, content] = entryMatch[0];

  if (!isEntryRightLength(content)) {
    issues.push(
      `${username}'s entry "${content}" is longer than the max length of ${MAX_ENTRY_CHARACTER_LENGTH}.`
    );
  }
  if (!isEntryWordsRightLength(content)) {
    issues.push(
      `${username}'s entry "${content}" has more than ${MAX_ENTRY_WORD_COUNT} words.`
    );
  }
  return issues.length === 0
    ? Parsed.of({
        content,
        game,
      })
    : Parsed.issues(issues);
};

const parseStage = ({
  entryCount,
  lines,
  username,
}: {
  entryCount: number;
  lines: string[];
  username: string;
}): Parsed<Stage> => {
  const issues: string[] = [];

  const [nameAndCategoryLine, ...entryLines] = lines;

  const nameAndCategoryMatch = Array.from(
    nameAndCategoryLine.matchAll(/(.*), the (.*) (Pokemon|Pokémon)/g)
  );
  if (
    nameAndCategoryMatch.length === 0 ||
    nameAndCategoryMatch[0].length !== 4
  ) {
    return Parsed.issues([
      `${username}'s line "${nameAndCategoryLine}" is missing required lines.`,
    ]);
  }

  const [, name, category] = nameAndCategoryMatch[0];
  if (!isCategoryRightLength(category)) {
    issues.push(
      `${username}'s category "${category}" is longer than the max length of ${MAX_CATEGORY_CHARACTER_LENGTH}.`
    );
  }
  const parsedEntries = entryLines.map((l) =>
    parseEntry({ line: l, username })
  );
  const entryIssues = parsedEntries.flatMap((e) =>
    e.validationResult.isValid ? [] : e.validationResult.issues
  );
  const entries = parsedEntries.flatMap((e) =>
    e.validationResult.isValid && e.submission ? e.submission : []
  );
  issues.push(...entryIssues);
  if (entries.length < entryCount) {
    issues.push(
      `${username} submitted ${entries.length} entries but expected ${entryCount}.`
    );
  }

  if (issues.length > 0) {
    return Parsed.issues(issues);
  }
  return Parsed.of({
    category,
    entries,
    name,
  });
};

const getSubmissionBase = ({
  options: { entryCount, stageCount },
  post: { id, textLines, username },
}: {
  options: {
    entryCount: number;
    stageCount: number;
  };
  post: Post;
}): Parsed<PokedexSubmission> => {
  const relevantLines = textLines.filter((_, i) => i % 2 === 0);

  const [finalSubmissionText, ...rest] = relevantLines;

  const isFinalSubmission =
    finalSubmissionText.toLowerCase() === FINAL_SUBMISSION_TEXT;
  if (!isFinalSubmission) {
    return Parsed.issues([]);
  }

  // Each submission has the following # of lines:
  // n stages
  // 1 line for name + category per stage
  // m lines per entry per stage
  const submissionLines = rest.slice(0, stageCount * (1 + entryCount));
  // Doesn't have enough fields
  if (submissionLines.length === 0) {
    return Parsed.issues([
      `${username}'s submission is missing required lines.`,
    ]);
  }

  const stageLines = _.chunk(submissionLines, 1 + entryCount).slice(
    0,
    stageCount
  );
  const parsedStages = stageLines.map((ls) =>
    parseStage({ entryCount, lines: ls, username })
  );
  const issues = parsedStages.flatMap((s) =>
    s.validationResult.isValid ? [] : s.validationResult.issues
  );
  const stages = parsedStages.flatMap((s) =>
    s.validationResult.isValid && s.submission ? s.submission : []
  );

  return issues.length === 0
    ? Parsed.of({
        stages,
        postId: id,
        username,
      })
    : Parsed.issues(issues);
};

const formatEntry = ({ content, game }: Entry) => {
  return `[B]${game}[/B]: ${content}`;
};

const formatStage = ({ category, entries, name }: Stage) => {
  return [
    `[B]${name}[/B], the [B]${category}[/B] Pokémon`,
    ...entries.map((e) => formatEntry(e)),
  ].join("\n\n");
};

const formatBbCode = ({
  postId,
  stages,
  username,
}: PokedexSubmission): string => {
  return stages
    .map((s) => {
      const formatted = formatStage(s);

      return [
        `${username}`,
        `[QUOTE="${username}, post: ${postId}"]`,
        formatted,
        "[/QUOTE]",
      ].join("\n\n");
    })
    .join("\n\n");
};

export const pokedexSubmissionsHandler: SubmissionHandler<PokedexSubmission> = {
  formatBbCode,
  parseSubmission: (post) =>
    getSubmissionBase({
      options: {
        entryCount: 2,
        stageCount: 1,
      },
      post,
    }),
};

export const twoStagePokedexSubmissionsHandler: SubmissionHandler<PokedexSubmission> =
  {
    formatBbCode,
    parseSubmission: (post) =>
      getSubmissionBase({
        options: {
          entryCount: 2,
          stageCount: 2,
        },
        post,
      }),
  };
