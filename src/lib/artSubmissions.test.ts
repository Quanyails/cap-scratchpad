import { buildTestPost } from "./posts";
import {
  artSubmissionsHandler,
  twoStageArtSubmissionsHandler,
} from "./artSubmissions";

const SAMPLE_IMAGE = "https://placekitten.com/640/640";
test("Minimal submission", () => {
  const parser = new DOMParser();
  const el = parser.parseFromString(
    `
<div class="bbWrapper"><b>Final Submission</b>
    <br>
	<div class="lbContainer lbContainer--inline">
		<img src="${SAMPLE_IMAGE}" data-url="${SAMPLE_IMAGE}" class="bbImage">
	</div>
</div>
`,
    "text/html"
  ).documentElement;

  const post = buildTestPost("Final Submission");
  const submission = artSubmissionsHandler.getSubmission(el, post);
  expect(submission).not.toBeNull();
});

test("Maximal submission", () => {
  const parser = new DOMParser();
  const el = parser.parseFromString(
    `
<div class="bbWrapper"><b>Final Submission</b>
    <br>
	<div class="lbContainer lbContainer--inline">
		<img src="${SAMPLE_IMAGE}" data-url="${SAMPLE_IMAGE}" class="bbImage">
	</div>
	Supporting Material
	<div class="lbContainer lbContainer--inline">
		<img src="${SAMPLE_IMAGE}" data-url="${SAMPLE_IMAGE}" class="bbImage">
	</div>
</div>
`,
    "text/html"
  ).documentElement;

  const post = buildTestPost("Final Submission");
  const submission = artSubmissionsHandler.getSubmission(el, post);
  expect(submission).not.toBeNull();
});

test("Two stage submission", () => {
  const parser = new DOMParser();
  const el = parser.parseFromString(
    `
<div class="bbWrapper"><b>Final Submission</b>
    <br>
	<div class="lbContainer lbContainer--inline">
		<img src="${SAMPLE_IMAGE}" data-url="${SAMPLE_IMAGE}" class="bbImage">
	</div>
	<div class="lbContainer lbContainer--inline">
		<img src="${SAMPLE_IMAGE}" data-url="${SAMPLE_IMAGE}" class="bbImage">
	</div>
</div>
`,
    "text/html"
  ).documentElement;

  const post = buildTestPost("Final Submission");
  const submission = twoStageArtSubmissionsHandler.getSubmission(el, post);
  expect(submission).not.toBeNull();
});
