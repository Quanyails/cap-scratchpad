import { getConfidence } from "./confidence";

test("low confidence", () => {
  const result = getConfidence(["foo"], {
    array: [
      [0, 2],
      [1, 0],
    ],
    candidates: ["foo", "bar"],
  });
  expect(result).toBe(0.6875);
});

test("high confidence", () => {
  const result = getConfidence(["foo"], {
    array: [
      [0, 50],
      [25, 0],
    ],
    candidates: ["foo", "bar"],
  });
  expect(result).toBe(0.9980818821241927);
});

test("high confidence with multiple opponents", () => {
  const result = getConfidence(["foo"], {
    array: [
      [0, 50, 50],
      [0, 0, 25],
      [0, 25, 0],
    ],
    candidates: ["foo", "bar", "baz"],
  });
  expect(result).toBe(0.9999999999999991);
});
