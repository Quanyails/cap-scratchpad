import { FINAL_SUBMISSION_TEXT, SubmissionHandler } from "./submissions";
import { Post } from "./posts";

interface ArtSubmission {
  hasSupportingMaterial: boolean;
  imageUrls: string[];
}

// Art submission selectors
const IMG_SELECTOR = ".bbImage";
const IMG_SRC = "src";

const HR =
  "--------------------------------------------------------------------------------------------";

const getSubmission = (
  el: HTMLElement,
  { textLines, username }: Post
): ArtSubmission | null => {
  const isFinalSubmission =
    textLines[0].toLowerCase() === FINAL_SUBMISSION_TEXT;
  if (!isFinalSubmission) {
    return null;
  }
  const hasSupportingMaterial = textLines.some(
    (line) => line.toLowerCase() === "supporting material"
  );
  const imgUrls = Array.from(el.querySelectorAll(IMG_SELECTOR)).map((img) => {
    const src = img.getAttribute(IMG_SRC) ?? "";
    return new URL(src, location.href).href;
  });
  if (imgUrls.length === 0) {
    console.warn(`${username} declared a final submission without an image.`);
    return null;
  }
  return {
    hasSupportingMaterial,
    imageUrls: imgUrls,
  };
};

const formatBbCode = (
  { url, username }: Post,
  { hasSupportingMaterial, imageUrls }: ArtSubmission
): string => {
  return (
    hasSupportingMaterial
      ? [
          HR,
          `[B]${username}[/B]`,
          `[IMG]${imageUrls[0]}[/IMG]`,
          `[URL=${url}]Supporting Material[/URL]`,
          HR,
        ]
      : [HR, `[B]${username}[/B]`, `[IMG]${imageUrls[0]}[/IMG]`, HR]
  ).join("\n");
};

export const artSubmissionsHandler: SubmissionHandler<ArtSubmission> = {
  formatBbCode,
  getSubmission,
};
