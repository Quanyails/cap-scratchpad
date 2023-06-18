import { Ballot } from "./ballots";

export enum BallotFormat {
  EricGorr = "ericGorr",
  Json = "json",
  Pollkritter = "pollkritter",
}

export const formatEricGorrBallots = (ballots: Ballot[]) => {
  return ballots
    .map(({ ranking }) => ranking.map((line) => line.join("=")).join(">"))
    .join("\n");
};

export const formatJsonBallots = (ballots: Ballot[]) => {
  return JSON.stringify(ballots, null, 4);
};
export const formatPollkritterBallots = (ballots: Ballot[]) => {
  return `poll://${ballots
    .map(({ ranking }) => ranking.map((line) => line.join("=")).join(">"))
    .join(",")}`;
};
