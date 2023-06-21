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
  const submission = artSubmissionsHandler.getSubmission(post);
  expect(submission).not.toBeNull();
});

test("Maximal submission", () => {
  const post = buildTestPost({
    imageUrls: [SAMPLE_IMAGE, SAMPLE_IMAGE],
    message: "Final Submission",
  });
  const submission = artSubmissionsHandler.getSubmission(post);
  expect(submission).not.toBeNull();
});

test("Two stage submission", () => {
  const post = buildTestPost({
    imageUrls: [SAMPLE_IMAGE, SAMPLE_IMAGE],
    message: "Final Submission",
  });
  const submission = twoStageArtSubmissionsHandler.getSubmission(post);
  expect(submission).not.toBeNull();
});
