import { IMG_SELECTOR, TITLE_SELECTOR } from "../querySelectors";

export interface Post {
  boldedLines: string[];
  /* Image URLs in the post, if any. */
  imageUrls: string[];
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
const MESSAGE_SELECTOR = ".message-body .bbWrapper";
const MESSAGE_DELETED_SELECTOR = ".message--deleted";
const POST_ID_DATA_ATTR = "data-lb-id";
const POST_ID_SELECTOR = ".message-userContent";
const USERNAME_SELECTOR = ".message-name";

export const buildTestPost = ({
  imageUrls = [],
  message,
  username = "username",
}: {
  imageUrls?: string[];
  message: string;
  username?: string;
}): Post => {
  return {
    boldedLines: [],
    id: -1,
    imageUrls,
    textContent: message.trim(),
    textLines: message
      .trim()
      .split("\n")
      .map((s) => s.trim()),
    url: "https://example.com",
    username,
  };
};

export const getPageTitle = () => {
  return document.querySelector(TITLE_SELECTOR)?.textContent?.trim() ?? "";
};

export const extractSpanText = (el: HTMLElement, tagName: string): string[] => {
  return [el]
    .flatMap((e) => Array.from(e.children) ?? [])
    .filter((e) => e.tagName === tagName)
    .map((e) => e.textContent ?? "")
    .join("")
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s);
};

export const makePost = (el: HTMLElement): Post | null => {
  if (el.matches(MESSAGE_DELETED_SELECTOR)) {
    return null;
  }

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
    // Bold tags can be nested, so check top-level bold tags only.
    boldedLines: el.querySelector(MESSAGE_SELECTOR)
      ? extractSpanText(el.querySelector(MESSAGE_SELECTOR) as HTMLElement, "B")
      : [],
    imageUrls: Array.from(el.querySelectorAll(IMG_SELECTOR)).map((img) => {
      const src = img.getAttribute("src") ?? "";
      return new URL(src, location.href).href;
    }),
    id: Number(
      (
        el.querySelector(POST_ID_SELECTOR)?.getAttribute(POST_ID_DATA_ATTR) ??
        ""
      ).replace("post-", "")
    ),
    textContent,
    textLines,
    url,
    username: el.querySelector(USERNAME_SELECTOR)?.textContent ?? "",
  };
};
