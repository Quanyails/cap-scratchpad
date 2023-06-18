import { buildTestPost } from "../posts";
import { makeBallot } from "./ballots";

test("empty ballot", () => {
  const el = document.createElement("div");
  const post = buildTestPost({ message: "" });
  const ballot = makeBallot(el, post);
  expect(ballot).toBeNull();
});

test("minimal ballot", () => {
  const el = document.createElement("div");
  const post = buildTestPost({ message: "foo" });
  const ballot = makeBallot(el, post);
  expect(ballot).toEqual({
    ranking: [["foo"]],
  });
});

test("maximal ballot", () => {
  const el = document.createElement("div");
  const post = buildTestPost({
    message: `foo
bar, baz
qux, quux, corge

comment
`,
  });
  const ballot = makeBallot(el, post);
  expect(ballot).toEqual({
    ranking: [["foo"], ["bar", "baz"], ["qux", "quux", "corge"]],
  });
});
