import { extractSpanText } from "./posts";

test("Extract non-tagged", () => {
  const el = document.createElement("div");
  el.innerHTML = "foo bar";
  const extracted = extractSpanText(el, "B");
  expect(extracted).toEqual([]);
});

test("Extract tags", () => {
  const el = document.createElement("div");
  el.innerHTML = "<b>foo bar</b>";
  const extracted = extractSpanText(el, "B");
  expect(extracted).toEqual(["foo bar"]);
});

test("Extract adjacent tagged", () => {
  const el = document.createElement("div");
  el.innerHTML = `<b>foo</b><b>bar</b>`;
  const extracted = extractSpanText(el, "B");
  expect(extracted).toEqual(["foobar"]);
});

test("Extract tagged on multiple lines", () => {
  const el = document.createElement("div");
  el.innerHTML = `<b>foo
bar</b>`;
  const extracted = extractSpanText(el, "B");
  expect(extracted).toEqual(["foo", "bar"]);
});

test("Extract nested tagged", () => {
  const el = document.createElement("div");
  el.innerHTML = `<b><b>foo</b>bar</b>`;
  const extracted = extractSpanText(el, "B");
  expect(extracted).toEqual(["foobar"]);
});

test("Extract complex tagged", () => {
  const el = document.createElement("div");
  el.innerHTML = `foo<b>bar<b>baz
</b><b>
qux</b>quux</b>corge`;
  const extracted = extractSpanText(el, "B");
  expect(extracted).toEqual(["barbaz", "quxquux"]);
});
