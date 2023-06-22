import { Post } from "../posts";
import { SubmissionHandler } from "../slater";
import { Message } from "../../message";
import { FINAL_SUBMISSION_TEXT, Parsed } from "./submissions";

const SUPPORTING_MATERIAL_TEXT = "supporting material";

interface ArtSubmission {
  hasSupportingMaterial: boolean;
  imageUrls: string[];
  postUrl: string;
  username: string;
}

const getSubmissionBase = ({
  post: { imageUrls, textLines, url, username },
  requiredImageCount,
}: {
  post: Post;
  requiredImageCount: number;
}): Parsed<ArtSubmission> => {
  const isFinalSubmission =
    textLines[0].toLowerCase() === FINAL_SUBMISSION_TEXT;
  if (!isFinalSubmission) {
    return Parsed.issues([]);
  }
  const hasSupportingMaterial = textLines.some(
    (line) => line.toLowerCase() === SUPPORTING_MATERIAL_TEXT
  );
  if (imageUrls.length < requiredImageCount) {
    return Parsed.issues([
      `${username} needs ${requiredImageCount} images for a final submission but only provided ${imageUrls.length}.`,
    ]);
  }
  return Parsed.of({
    hasSupportingMaterial,
    imageUrls,
    postUrl: url,
    username,
  });
};

const formatBbCodeBase = ({
  artSubmission: { hasSupportingMaterial, imageUrls, postUrl, username },
  requiredImageCount,
}: {
  artSubmission: ArtSubmission;
  requiredImageCount: number;
}): string => {
  const imageBbCodes = imageUrls
    .slice(0, requiredImageCount)
    .map((url) => `[IMG]${url}[/IMG]`);
  return (
    hasSupportingMaterial
      ? [
          Message.Divider,
          `[B]${username}[/B]`,
          ...imageBbCodes,
          `[URL=${postUrl}]Supporting Material[/URL]`,
          Message.Divider,
        ]
      : [
          Message.Divider,
          `[B]${username}[/B]`,
          ...imageBbCodes,
          Message.Divider,
        ]
  ).join("\n");
};

export const artSubmissionsHandler: SubmissionHandler<ArtSubmission> = {
  formatBbCode: (submission) =>
    formatBbCodeBase({
      artSubmission: submission,
      requiredImageCount: 1,
    }),
  parseSubmission: (post) =>
    getSubmissionBase({
      post,
      requiredImageCount: 1,
    }),
};

export const twoStageArtSubmissionsHandler: SubmissionHandler<ArtSubmission> = {
  formatBbCode: (submission) =>
    formatBbCodeBase({
      artSubmission: submission,
      requiredImageCount: 2,
    }),
  parseSubmission: (post) =>
    getSubmissionBase({
      post,
      requiredImageCount: 2,
    }),
};
