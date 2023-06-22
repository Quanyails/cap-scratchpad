import { Approbation, Borda, RankedPairs, utils } from "votes";
import {
  formatConfidence,
  formatMatrix,
  formatRanking,
  formatScores,
  formatSmithSet,
  getBordaCountHeader,
  getRundownHeader,
} from "./votingResultformatter";
import { getFrontrunners } from "./frontrunners";

export const formatApproval = (approval: Approbation) => {
  return [
    getRundownHeader(),
    formatScores(approval.ranking(), approval.scores()),
  ].join("\n\n");
};
export const formatRankedPairs = (
  bordaCount: Borda,
  rankedPairs: RankedPairs
) => {
  const { matrix } = rankedPairs;
  // Use Ranked Pairs as the primary method of ranking options. If options are
  // tied after determining rankings, use Borda count as a tiebreaker.
  const bordaScores = bordaCount.scores();
  const rpRanking = rankedPairs.ranking();
  const ranking = bordaCount.tieBreak(rpRanking);
  const smithSet = utils.findSmithSet(matrix);
  const frontrunners = getFrontrunners(ranking, matrix);

  return [
    formatMatrix(matrix),
    formatSmithSet(smithSet),
    ...(rpRanking.every((rp) => rp.length === 1)
      ? []
      : [getBordaCountHeader(), formatScores(rpRanking, bordaScores)]),
    getRundownHeader(),
    formatRanking(ranking, frontrunners),
    formatConfidence(ranking, matrix),
  ].join("\n\n");
};
