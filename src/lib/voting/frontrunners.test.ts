import { getFrontrunners } from "./frontrunners";

test("no frontrunners", () => {
  const result = getFrontrunners([["foo"], ["bar"]], {
    array: [
      [0, 1],
      [1, 0],
    ],
    candidates: ["foo", "bar"],
  });
  expect(result).toEqual([]);
});

test("one frontrunner", () => {
  const result = getFrontrunners([["foo", "bar"]], {
    array: [
      [0, 2],
      [0, 0],
    ],
    candidates: ["foo", "bar"],
  });
  expect(result).toEqual(["foo"]);
});

test("two frontrunners", () => {
  const result = getFrontrunners([["foo"], ["bar"], ["baz"]], {
    array: [
      [0, 0, 2],
      [0, 0, 2],
      [0, 0, 0],
    ],
    candidates: ["foo", "bar", "baz"],
  });
  expect(result).toEqual(["foo", "bar"]);
});
