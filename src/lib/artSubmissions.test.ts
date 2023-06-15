import { buildTestPost } from "./posts";
import { artSubmissionsHandler } from "./artSubmissions";

const SAMPLE_IMAGE = "https://placekitten.com/640/640";
test("Minimal submission", () => {
  const parser = new DOMParser();
  const el = parser.parseFromString(
    `
<div class="bbWrapper"><b>Final Submission</b>
    <br>
	<div class="lbContainer lbContainer--inline" title="" data-xf-init="lightbox" data-lb-single-image="1" data-lb-container-zoom="1" data-lb-trigger=".js-lbImage-_xfUid-1-1685809746" data-lb-id="_xfUid-1-1685809746">
        <div class="lbContainer-zoomer js-lbImage-_xfUid-1-1685809746" data-src="${SAMPLE_IMAGE}" aria-label="Zoom"></div>
		<img src="${SAMPLE_IMAGE}" data-url="${SAMPLE_IMAGE}" class="bbImage" data-zoom-target="1" style="">
	</div>
</div>
`,
    "text/html"
  ).documentElement;

  const post = buildTestPost("Final Submission");

  const submission = artSubmissionsHandler.getSubmission(el, post);

  expect(submission).not.toBeNull();
});
