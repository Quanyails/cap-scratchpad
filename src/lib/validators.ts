import { groupBy } from "lodash";
import { Post } from "./posts";
import { Ballot } from "./ballots/ballots";

export const validateUniqueBallot = (ballot: Ballot, max: number) => {
  const options = groupBy(ballot.flat(2), (option) => option);
  Object.entries(options).forEach(([option, repeats]) => {
    if (repeats.length > max) {
      console.warn(
        `Found a ballot with ${repeats.length} instances of ${option}, which is more than the max of ${max}.`
      );
    }
  });
};
export const validateUniqueUsers = (posts: Post[], max: number) => {
  const userPosts = groupBy(posts, (p) => p.username);
  Object.entries(userPosts).forEach(([username, posts]) => {
    if (posts.length > max) {
      console.warn(
        `${username} has made ${posts.length} valid posts, which is more than the maximum of ${max}.`
      );
    }
  });
};
