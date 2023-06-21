import { buildTestPost } from "./posts";
import { validateUniqueBallotOptions, validateUniqueUsers } from "./validators";

test("validate ballot count", () => {
  const ballot = [["foo"], ["foo", "bar"]];
  const result = validateUniqueBallotOptions(ballot, 1);
  expect(result).toEqual({
    issues: expect.any(Array),
    isValid: false,
  });
});
test("validate post count", () => {
  const post1 = buildTestPost({ message: "message1", username: "user1" });
  const post2 = buildTestPost({ message: "message2", username: "user1" });

  const result = validateUniqueUsers([post1, post2], 1);
  expect(result).toEqual({
    issues: expect.any(Array),
    isValid: false,
  });
});
