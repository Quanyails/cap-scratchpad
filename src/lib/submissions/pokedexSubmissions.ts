import { Post } from "../posts";

import { SubmissionHandler } from "../slater";
import { FINAL_SUBMISSION_TEXT, Parsed } from "./submissions";
import _ from "lodash";

interface Entry {
  content: string;
  game: string;
}

interface Limits {
  categoryLength: number;
  entryLength: number;
  entryWordLength: number;
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

const LIMITS: Record<string, Limits> = {
  sv: {
    categoryLength: 13,
    entryLength: 153,
    entryWordLength: 30,
  },
};

const isEntryLegal = (str: string) => {
  // Strip diacritics. Used to handle "Pokémon" -> "Pokemon".
  const normalized = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return /^[ !.",\-':;A-Za-z0-9]+$/.test(normalized);
};
const parseEntry = ({
  line,
  limits,
  username,
}: {
  line: string;
  limits: Limits;
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

  if (content.length > limits.entryLength) {
    issues.push(
      `${username}'s entry "${content}" is longer than the max length of ${limits.entryLength}.`
    );
  }
  if (content.split(" ").length > limits.entryWordLength) {
    issues.push(
      `${username}'s entry "${content}" has more than ${limits.entryWordLength} words.`
    );
  }
  if (!isEntryLegal(content)) {
    issues.push(
      `${username}'s entry "${content} contains an illegal character.`
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
  limits,
  lines,
  username,
}: {
  entryCount: number;
  limits: Limits;
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
  if (category.length > limits.categoryLength) {
    issues.push(
      `${username}'s category "${category}" is longer than the max length of ${limits.categoryLength}.`
    );
  }
  const parsedEntries = entryLines.map((l) =>
    parseEntry({ limits, line: l, username })
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
  options: { entryCount, limits, stageCount },
  post: { id, textLines, username },
}: {
  options: {
    entryCount: number;
    limits: Limits;
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
    parseStage({ entryCount, limits, lines: ls, username })
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
      ].join("\n");
    })
    .join("\n\n");
};

export const pokedexSubmissionsHandler: SubmissionHandler<PokedexSubmission> = {
  formatBbCode,
  parseSubmission: (post) =>
    getSubmissionBase({
      options: {
        entryCount: 2,
        limits: LIMITS.sv,
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
          limits: LIMITS.sv,
          stageCount: 2,
        },
        post,
      }),
  };
