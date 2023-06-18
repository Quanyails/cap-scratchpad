import { fetchThread } from "../threads";
import { makeBallot } from "./ballots";
import {
  BallotFormat,
  formatEricGorrBallots,
  formatJsonBallots,
  formatPollkritterBallots,
} from "./ballotFormatter";
import { validateUniqueBallot, validateUniqueUsers } from "../validators";

export const makeBallots = async (
  ballotStyle: BallotFormat,
  url: string,
  {
    skipFirst,
    skipLast,
  }: {
    skipFirst: boolean;
    skipLast: boolean;
  }
) => {
  const data = await fetchThread(url);
  const postBallots = data
    .flatMap(({ el, post }) => {
      const ballot = makeBallot(el, post);
      return ballot === null ? [] : [{ post, ballot }];
    })
    .slice(skipFirst ? 1 : 0, skipLast ? -1 : Infinity);

  postBallots.forEach(({ ballot }) => validateUniqueBallot(ballot, 1));
  validateUniqueUsers(
    postBallots.map(({ post }) => post),
    1
  );

  const ballots = postBallots.map(({ ballot }) => ballot);

  switch (ballotStyle) {
    case BallotFormat.EricGorr: {
      return formatEricGorrBallots(ballots);
    }
    case BallotFormat.Json: {
      return formatJsonBallots(ballots);
    }
    case BallotFormat.Pollkritter: {
      return formatPollkritterBallots(ballots);
    }
    default: {
      throw new Error(`Unexpected ballot style: ${ballotStyle}`);
    }
  }
};
