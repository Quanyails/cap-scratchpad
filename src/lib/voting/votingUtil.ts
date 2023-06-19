import { Matrix } from "votes";

// Frontrunners are declared if every entry from the top down to the current
// rank has a >= 2/3 pairwise supermajority over every entry in the ranks below
// it.
const FRONTRUNNER_THRESHOLD = 2;
export const getFrontrunners = (
  ranking: string[][],
  { array, candidates }: Matrix
) => {
  const candidateIds = Object.fromEntries(candidates.map((c, i) => [c, i]));
  const flatRanking = ranking.flat();

  for (let i = 1; i < flatRanking.length; i++) {
    const potentialFrontrunners = flatRanking.slice(0, i);
    const tiedOrDefeatedCandidates = flatRanking.slice(i);

    // Cartesian product of frontrunners vs. tied/defeated candidates
    const checkedPairs = potentialFrontrunners.flatMap((c1) => {
      return tiedOrDefeatedCandidates.map((c2) => [c1, c2]);
    });
    const areFrontrunners = checkedPairs.every(([c1, c2]) => {
      const id1 = candidateIds[c1];
      const id2 = candidateIds[c2];
      const fors = array[id1][id2];
      const againsts = array[id2][id1];
      return fors > 0 && fors >= againsts * FRONTRUNNER_THRESHOLD;
    });
    if (areFrontrunners) {
      return potentialFrontrunners;
    }
  }
  return [];
};
