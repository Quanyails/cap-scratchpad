import { buildTestPost } from "../posts";
import {
  artSubmissionsHandler,
  twoStageArtSubmissionsHandler,
} from "./artSubmissions";

const SAMPLE_IMAGE = "https://placekitten.com/640/640";
test("Minimal submission", () => {
  const post = buildTestPost({
    imageUrls: [SAMPLE_IMAGE],
    message: "Final Submission",
  });
  const result = artSubmissionsHandler.parseSubmission(post);
  expect(result.submission).not.toBeNull();
});

test("Maximal submission", () => {
  const post = buildTestPost({
    imageUrls: [SAMPLE_IMAGE, SAMPLE_IMAGE],
    message: "Final Submission",
  });
  const result = artSubmissionsHandler.parseSubmission(post);
  expect(result.submission).not.toBeNull();
});

test("Two stage submission", () => {
  const post = buildTestPost({
    imageUrls: [SAMPLE_IMAGE, SAMPLE_IMAGE],
    message: "Final Submission",
  });
  const result = twoStageArtSubmissionsHandler.parseSubmission(post);
  expect(result.submission).not.toBeNull();
});
