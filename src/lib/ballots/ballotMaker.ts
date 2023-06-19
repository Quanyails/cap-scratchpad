import { fetchThread } from "../threads";
import { makeBallot } from "./ballots";
import { BallotFormat } from "./ballotFormatter";
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

  return postBallots.map(({ ballot }) => ballot);
};
