import _ from "lodash";

// TODO: Find a good, high-quality library for extracting combinations.
// I can't seem to find a library that:
// 1. Has an efficient solution.
// 2. Is well-maintained.
//
// Libraries looked at:
// - d3-array: Has support for Cartesian product but not generic combinations.
// - generatorics: Good implementation but could be better-maintained.
// - js-combinatorics: Good implementation but could be better-maintained.
// - just-cartesian-product: Has good support for Cartesian product but not
//     generic combinations.
// - mathjs: Has support for Cartesian product but not generic combinations.
// - simple-statistics: Has support for combinations but is naively implemented.
export const getCombinations = (n: number, k: number): number[][] => {
  if (n < k) {
    return [];
  }
  if (k < 1) {
    return [];
  }
  if (k === 1) {
    return _.range(n).map((i) => [i]);
  }
  // Case where we took the first element
  const taken = getCombinations(n - 1, k - 1).map((arr) =>
    arr.map((i) => i + 1)
  );
  // Case where we did not take the first element
  const untaken = getCombinations(n - 1, k).map((arr) => arr.map((i) => i + 1));
  const withTaken = taken.map((arr) => [0, ...arr]);

  return [...withTaken, ...untaken];
};
