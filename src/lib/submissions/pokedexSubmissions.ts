import { Post } from "../posts";

import { FINAL_SUBMISSION_TEXT, SubmissionHandler } from "../slater";

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
}): PokedexSubmission | null => {
  const [finalSubmissionText, nameAndCategoryLine, ...entryLines] =
    textLines.filter((_, i) => i % 2 === 0);

  const isFinalSubmission =
    finalSubmissionText.toLowerCase() === FINAL_SUBMISSION_TEXT;
  if (!isFinalSubmission) {
    return null;
  }

  // Doesn't have enough fields
  if (
    nameAndCategoryLine === undefined ||
    entryLines.length < requiredEntryCount
  ) {
    console.warn(`${username} has an illegal submission!`);
    console.warn("The following submission doesn't have all required lines:");
    console.warn(textLines.join("\n"));
    return null;
  }

  const issues: string[] = [];

  const nameAndCategoryMatch = Array.from(
    nameAndCategoryLine.matchAll(/(.*), the (.*) (Pokemon|Pokémon)/g)
  );
  if (
    nameAndCategoryMatch.length === 0 ||
    nameAndCategoryMatch[0].length !== 4
  ) {
    issues.push(`${nameAndCategoryLine} is not formatted correctly!`);
  }

  const [, name, category] = nameAndCategoryMatch[0];
  if (!isCategoryRightLength(category)) {
    issues.push(
      `'${category}' is longer than the max length of ${MAX_CATEGORY_CHARACTER_LENGTH}!`
    );
  }

  const entries: { content: string; game: string }[] = [];
  for (const entryLine of entryLines) {
    const entryMatch = Array.from(entryLine.matchAll(/(.*): (.*)/g));
    if (entryMatch.length === 0 || entryMatch[0].length !== 3) {
      issues.push(`${entryLine} is not formatted correctly!`);
    } else {
      const [, game, content] = entryMatch[0];

      if (!isEntryRightLength(content)) {
        issues.push(
          `'${content}' is longer than the max length of ${MAX_ENTRY_CHARACTER_LENGTH}!`
        );
      }
      if (!isEntryWordsRightLength(content)) {
        issues.push(
          `'${content}' has more than ${MAX_ENTRY_WORD_COUNT} words!`
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
    console.warn(`${username} has an illegal submission!`);
    issues.forEach((s) => console.warn(s));
    return null;
  }

  return {
    category,
    entries,
    name,
    postId: id,
    username,
  };
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
  getSubmission: (post) => getSubmissionBase({ post, requiredEntryCount: 2 }),
};
