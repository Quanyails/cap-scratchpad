import { Ballot } from "./ballots";

export enum BallotFormat {
  EricGorr = "ericGorr",
  Json = "json",
  Pollkritter = "pollkritter",
}

export const formatEricGorrBallots = (ballots: Ballot[]) => {
  return ballots
    .map((ballot) => ballot.map((line) => line.join("=")).join(">"))
    .join("\n");
};

export const formatJsonBallots = (ballots: Ballot[]) => {
  return JSON.stringify(ballots, null, 4);
};
export const formatPollkritterBallots = (ballots: Ballot[]) => {
  return `poll://${ballots
    .map((ballot) => ballot.map((line) => line.join("=")).join(">"))
    .join(",")}`;
};

export const formatters: Record<BallotFormat, (ballots: Ballot[]) => string> = {
  [BallotFormat.EricGorr]: formatEricGorrBallots,
  [BallotFormat.Json]: formatJsonBallots,
  [BallotFormat.Pollkritter]: formatPollkritterBallots,
};
