export interface Post {
  /* The unique ID of the post. */
  id: number;
  /* Post content as plain text. */
  textContent: string;
  /* Post content lines with properly-trimmed whitespace. */
  textLines: string[];
  /* The URL to the post */
  url: string;
  /* The name of the user who made the post */
  username: string;
}

// Post selectors
const LINK_SELECTOR = ".message-attribution-main a";
const MESSAGE_SELECTOR = ".message-body";
const MESSAGE_DELETED_SELECTOR = ".message--deleted";
const POST_ID_DATA_ATTR = "data-lb-id";
const POST_ID_SELECTOR = ".message-userContent";
const USERNAME_SELECTOR = ".message-name";

export const buildTestPost = (message: string): Post => {
  return {
    id: -1,
    textContent: message.trim(),
    textLines: message
      .trim()
      .split("\n")
      .map((s) => s.trim()),
    url: "http://example.com",
    username: "username",
  };
};

export const parsePost = (el: HTMLElement): Post | null => {
  if (el.matches(MESSAGE_DELETED_SELECTOR)) {
    return null;
  }

  const id = Number(
    (
      el.querySelector(POST_ID_SELECTOR)?.getAttribute(POST_ID_DATA_ATTR) ?? ""
    ).replace("post-", "")
  );
  const relativeUrl =
    el.querySelector(LINK_SELECTOR)?.getAttribute("href") ?? "";
  const textContent = (
    el.querySelector(MESSAGE_SELECTOR)?.textContent ?? ""
  ).trim();
  const textLines = textContent
    .split("\n")
    .map((s) => s.trim().replaceAll("\u200b", ""));
  const url = new URL(relativeUrl, location.href).href;

  return {
    id,
    textContent,
    textLines,
    url,
    username: el.querySelector(USERNAME_SELECTOR)?.textContent ?? "",
  };
};
