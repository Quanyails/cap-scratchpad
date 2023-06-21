import { buildTestPost } from "../posts";
import { makeBallot } from "./ballots";

test("empty ballot", () => {
  const post = buildTestPost({ message: "" });
  const ballot = makeBallot(post);
  expect(ballot).toBeNull();
});

test("minimal ballot", () => {
  const post = buildTestPost({ message: "foo" });
  const ballot = makeBallot(post);
  expect(ballot).toEqual([["foo"]]);
});

test("maximal ballot", () => {
  const post = buildTestPost({
    message: `foo
bar, baz
qux, quux, corge

comment
`,
  });
  const ballot = makeBallot(post);
  expect(ballot).toEqual([["foo"], ["bar", "baz"], ["qux", "quux", "corge"]]);
});
