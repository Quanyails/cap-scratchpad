import { groupBy } from "lodash";
import { Post } from "./posts";

export const validateDuplicatePosts = (posts: Post[], max: number) => {
  const userPosts = groupBy(posts, (p) => p.username);
  Object.entries(userPosts).forEach(([username, posts]) => {
    if (posts.length > max) {
      console.warn(
        `${username} has made ${posts.length} valid posts, which is more than the maximum of ${max}.`
      );
    }
  });
};
