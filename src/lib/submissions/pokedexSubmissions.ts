import { Post } from "../posts";

import { SubmissionHandler } from "../slater";
import { FINAL_SUBMISSION_TEXT, Parsed } from "./submissions";

const MAX_CATEGORY_CHARACTER_LENGTH = 13;
const MAX_ENTRY_CHARACTER_LENGTH = 153;
const MAX_ENTRY_WORD_COUNT = 30;

interface PokedexSubmission {
  category: string;
  entries: {
    content: string;
    game: string;
  }[];
  name: string;
  postId: number;
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

const getSubmissionBase = ({
  post: { id, textLines, username },
  requiredEntryCount,
}: {
  post: Post;
  requiredEntryCount: number;
}): Parsed<PokedexSubmission> => {
  const [finalSubmissionText, nameAndCategoryLine, ...entryLines] =
    textLines.filter((_, i) => i % 2 === 0);

  const isFinalSubmission =
    finalSubmissionText.toLowerCase() === FINAL_SUBMISSION_TEXT;
  if (!isFinalSubmission) {
    return Parsed.issues([]);
  }

  // Doesn't have enough fields
  if (
    nameAndCategoryLine === undefined ||
    entryLines.length < requiredEntryCount
  ) {
    return Parsed.issues([
      `${username}'s submission is missing required lines.`,
    ]);
  }

  const issues: string[] = [];

  const nameAndCategoryMatch = Array.from(
    nameAndCategoryLine.matchAll(/(.*), the (.*) (Pokemon|Pokémon)/g)
  );
  if (
    nameAndCategoryMatch.length === 0 ||
    nameAndCategoryMatch[0].length !== 4
  ) {
    issues.push(
      `${username}'s line "${nameAndCategoryLine}" is not formatted correctly!`
    );
  }

  const [, name, category] = nameAndCategoryMatch[0];
  if (!isCategoryRightLength(category)) {
    issues.push(
      `${username}'s category "${category}" is longer than the max length of ${MAX_CATEGORY_CHARACTER_LENGTH}!`
    );
  }

  const entries: { content: string; game: string }[] = [];
  for (const entryLine of entryLines) {
    const entryMatch = Array.from(entryLine.matchAll(/(.*): (.*)/g));
    if (entryMatch.length === 0 || entryMatch[0].length !== 3) {
      issues.push(
        `${username}'s line "${entryLine}" is not formatted correctly!`
      );
    } else {
      const [, game, content] = entryMatch[0];

      if (!isEntryRightLength(content)) {
        issues.push(
          `${username}'s entry "${content}" is longer than the max length of ${MAX_ENTRY_CHARACTER_LENGTH}!`
        );
      }
      if (!isEntryWordsRightLength(content)) {
        issues.push(
          `${username}'s entry "${content}" has more than ${MAX_ENTRY_WORD_COUNT} words!`
        );
      }
      if (issues.length === 0) {
        entries.push({
          content: content,
          game: game,
        });
      }
    }
  }

  if (issues.length > 0) {
    return Parsed.issues(issues);
  }

  return Parsed.of({
    category,
    entries,
    name,
    postId: id,
    username,
  });
};

const formatBbCode = ({
  category,
  entries,
  name,
  postId,
  username,
}: PokedexSubmission): string => {
  const entryBbCodes = entries.map(
    ({ content, game }) => `[B]${game}[/B]: ${content}`
  );

  return [
    `${username}`,
    `[QUOTE="${username}, post: ${postId}"]`,
    `[B]${name}[/B], the [B]${category}[/B] Pokémon`,
    ...entryBbCodes,
    "[/QUOTE]",
  ].join("\n\n");
};

export const pokedexSubmissionsHandler: SubmissionHandler<PokedexSubmission> = {
  formatBbCode,
  parseSubmission: (post) => getSubmissionBase({ post, requiredEntryCount: 2 }),
};
