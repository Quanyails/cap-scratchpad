import { getCombinations } from "./combinatorics";

test("combinations", () => {
  const result = getCombinations(4, 2);
  expect(result).toEqual([
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 2],
    [1, 3],
    [2, 3],
  ]);
});
