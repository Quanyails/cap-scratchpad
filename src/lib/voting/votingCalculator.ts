import { Ballot } from "../ballots/ballots";
import { Approbation, Borda, RankedPairs, utils } from "votes";

export const getApproval = (ballots: Ballot[]) => {
  const weightedBallots = utils.toWeightedBallots(ballots);
  const candidates = utils.candidatesFromBallots(weightedBallots).sort();

  return new Approbation({
    ballots: weightedBallots,
    candidates: candidates,
  });
};

export const getBordaCount = (ballots: Ballot[]) => {
  const weightedBallots = utils.toWeightedBallots(ballots);
  const candidates = utils.candidatesFromBallots(weightedBallots).sort();

  return new Borda({
    ballots: weightedBallots,
    candidates,
  });
};

export const getRankedPairs = (ballots: Ballot[]) => {
  const weightedBallots = utils.toWeightedBallots(ballots);
  const candidates = utils.candidatesFromBallots(weightedBallots).sort();
  const matrix = utils.matrixFromBallots(weightedBallots, candidates);
  return new RankedPairs(matrix);
};
