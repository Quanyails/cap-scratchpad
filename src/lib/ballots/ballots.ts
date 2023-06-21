import { Post } from "../posts";

export type Ballot = string[][];

export const makeBallot = ({ textLines }: Post): Ballot | null => {
  // The part of the post that contains the ballot is the part of the post
  // up to the first two newlines in that post, or the full post otherwise.
  const emptyIndex = textLines.indexOf("");
  const ballotLines =
    emptyIndex === -1 ? textLines : textLines.slice(0, emptyIndex);
  const ballots = ballotLines.map((line) =>
    line.split(",").map((b) => b.trim())
  );
  return ballots.length === 0 ? null : ballots;
};
