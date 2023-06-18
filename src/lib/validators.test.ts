import { buildTestPost } from "./posts";
import { validateDuplicatePosts } from "./validators";

afterEach(() => {
  jest.restoreAllMocks();
});
test("validate post count", () => {
  const spy = jest.spyOn(console, "warn");

  const post1 = buildTestPost({ message: "message1", username: "user1" });
  const post2 = buildTestPost({ message: "message2", username: "user1" });

  validateDuplicatePosts([post1, post2], 1);

  expect(spy).toBeCalled();
});
