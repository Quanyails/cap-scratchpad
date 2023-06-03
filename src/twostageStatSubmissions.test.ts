import { twoStageStatsSubmissionsHandler } from "./twoStageStatSubmissions";
import { buildTestPost } from "./posts";
test("Minimal submission", () => {
  const post = buildTestPost(`Final Submission
    
    Stage 1: 1/2/3/4/5/6 (BST: 7)
    
    Stage 2: 1/2/3/4/5/6 (BST: 7)
`);

  const submission = twoStageStatsSubmissionsHandler.getSubmission(
    {} as HTMLElement,
    post
  );
  expect(submission).not.toBeNull();
});

test("Maximal submission", () => {
  const post = buildTestPost(`Final Submission
    
    Stage 1: 1 HP / 2 Atk / 3 Def / 4 SpA / 5 Spd / Spe (BST: 7)
    
    Supporting text for stage 1.
    
    Stage 2: 1 HP / 2 Atk / 3 Def / 4 SpA / 5 Spd / Spe (BST: 7)
    
    Supporting text for stage 2.
`);
  const submission = twoStageStatsSubmissionsHandler.getSubmission(
    {} as HTMLElement,
    post
  );
  expect(submission).not.toBeNull();
});
