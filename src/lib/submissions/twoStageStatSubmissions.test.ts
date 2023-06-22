import { twoStageStatsSubmissionsHandler } from "./twoStageStatSubmissions";
import { buildTestPost } from "../posts";
test("Minimal submission", () => {
  const post = buildTestPost({
    message: `Final Submission
    
    Stage 1: 1/2/3/4/5/6 (BST: 7)
    
    Stage 2: 1/2/3/4/5/6 (BST: 7)
`,
  });

  const result = twoStageStatsSubmissionsHandler.parseSubmission(post);
  expect(result.submission).not.toBeNull();
});

test("Maximal submission", () => {
  const post = buildTestPost({
    message: `Final Submission
    
    Stage 1: 1 HP / 2 Atk / 3 Def / 4 SpA / 5 Spd / Spe (BST: 7)
    
    Supporting text for stage 1.
    
    Stage 2: 1 HP / 2 Atk / 3 Def / 4 SpA / 5 Spd / Spe (BST: 7)
    
    Supporting text for stage 2.
`,
  });
  const result = twoStageStatsSubmissionsHandler.parseSubmission(post);
  expect(result.submission).not.toBeNull();
});
