import { buildTestPost } from "./posts";
import { validateUniqueBallot, validateUniqueUsers } from "./validators";

afterEach(() => {
  jest.restoreAllMocks();
});

test("validate ballot count", () => {
  const spy = jest.spyOn(console, "warn");

  const ballot = [["foo"], ["foo", "bar"]];

  validateUniqueBallot(ballot, 1);

  expect(spy).toBeCalled();
});
test("validate post count", () => {
  const spy = jest.spyOn(console, "warn");

  const post1 = buildTestPost({ message: "message1", username: "user1" });
  const post2 = buildTestPost({ message: "message2", username: "user1" });

  validateUniqueUsers([post1, post2], 1);

  expect(spy).toBeCalled();
});
