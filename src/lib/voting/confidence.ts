import { Matrix } from "votes";
import cdf from "@stdlib/stats-base-dists-beta-cdf";
import { getCombinations } from "../math/combinatorics";

const THRESHOLD = 0.5;

export const getConfidence = (
  winners: string[],
  { array, candidates }: Matrix
) => {
  const confidences = getCombinations(candidates.length, 2).map(
    ([id1, id2]) => {
      // Calculate the probability the next voter (the + 1 vote) will be for
      // the given candidate or for the opponent. CDF takes the range from 0..n,
      // whereas we want the range from n..1.
      const candidate1 = candidates[id1];
      const candidate2 = candidates[id2];
      const fors = array[id1][id2];
      const againsts = array[id2][id1];
      if (winners.includes(candidate1)) {
        return 1 - cdf(THRESHOLD, fors + 1, againsts + 1);
      } else if (winners.includes(candidate2)) {
        return cdf(THRESHOLD, fors + 1, againsts + 1);
      } else {
        return 1; // no change to confidence
      }
    }
  );

  return confidences.reduce((c1, c2) => c1 * c2, 1);
};
