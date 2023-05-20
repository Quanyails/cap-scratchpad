import { Post } from "./posts";
import { FINAL_SUBMISSION_TEXT, SubmissionHandler } from "./submissions";

const MAX_CATEGORY_LENGTH = 13;
const MAX_CHARACTER_COUNT = 156;
const MAX_WORD_COUNT = 32;

interface PokedexSubmission {
  category: string;
  entries: {
    content: string;
    game: string;
  }[];
  name: string;
}

const isCategoryLegal = (category: string): boolean => {
  return category.length <= MAX_CATEGORY_LENGTH;
};

const isEntryLegal = (entry: string): boolean => {
  return (
    entry.split(" ").length <= MAX_WORD_COUNT &&
    entry.length <= MAX_CHARACTER_COUNT
  );
};

const getSubmission = (
  el: HTMLElement,
  { textLines, username }: Post
): PokedexSubmission | null => {
  // Doesn't have enough fields
  if (textLines.length < 7) {
    return null;
  }
  const [
    finalSubmissionText,
    ,
    nameAndCategoryLine,
    ,
    entryLine1,
    ,
    entryLine2,
  ] = textLines;

  const isFinalSubmission =
    finalSubmissionText.toLowerCase() === FINAL_SUBMISSION_TEXT;
  if (!isFinalSubmission) {
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

  const entries: { content: string; game: string }[] = [];
  for (const entryLine of [entryLine1, entryLine2]) {
    const entryMatch = Array.from(entryLine.matchAll(/(.*): (.*)/g));
    if (entryMatch.length === 0 || entryMatch[0].length !== 3) {
      issues.push(`${entryLine} is not formatted correctly!`);
    } else {
      const [, game, content] = entryMatch[0];
      entries.push({
        content: content,
        game: game,
      });
    }
  }

  if (issues.length > 0) {
    console.warn(`${username} has an illegal submission!`);
    issues.forEach((s) => console.warn(s));
    return null;
  }

  const [, name, category] = nameAndCategoryMatch[0];

  return {
    category,
    entries,
    name,
  };
};

const formatBbCode = (
  { id, username }: Post,
  { category, entries, name }: PokedexSubmission
): string => {
  return [
    `${username}`,
    `[QUOTE="${username}, post: ${id}"]`,
    "",
    `[B]${name}[/B], the [B]${category}[/B] Pokémon`,
    "",
    `[B]${entries[0].game}[/B]: ${entries[0].content}`,
    "",
    `[B]${entries[1].game}[/B]: ${entries[1].content}`,
    "[/QUOTE]",
    "",
  ].join("\n");
};

export const pokedexSubmissionsHandler: SubmissionHandler<PokedexSubmission> = {
  formatBbCode,
  getSubmission,
};