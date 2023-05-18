import { parsePost, Post } from "./posts";

interface Datum {
  el: HTMLElement;
  post: Post;
}

interface Page {
  data: Datum[];
  nextUrl: string | undefined;
}

const NEXT_SELECTOR = "a.pageNav-jump--next";
const POST_SELECTOR = '[data-lb-id^="thread"] .message';

const SMOGON_HOSTNAME = "smogon.com";

const fetchPage = async (url: string): Promise<Page> => {
  if (!location.hostname.includes(SMOGON_HOSTNAME)) {
    throw new Error(`Script must be run on ${SMOGON_HOSTNAME}`);
  }
  const response = await fetch(url);
  const text = await response.text();
  const el = document.createElement("div");
  el.innerHTML = text;

  const nextRelativeUrl: string | null | undefined = el
    .querySelector(NEXT_SELECTOR)
    ?.getAttribute("href");
  const nextUrl: string | undefined = nextRelativeUrl
    ? new URL(nextRelativeUrl, location.href).href
    : undefined;

  const data = Array.from(el.querySelectorAll(POST_SELECTOR)).flatMap((el) => {
    const castEl = el as HTMLElement;
    const post = parsePost(castEl);

    return post ? [{ el: castEl, post }] : [];
  });

  return {
    data,
    nextUrl,
  };
};

export const fetchThread = async (url: string): Promise<Datum[]> => {
  const pageData: Datum[][] = [];
  let nextUrl: string | undefined = url;
  while (nextUrl !== undefined) {
    const page = await fetchPage(nextUrl);
    pageData.push(page.data);
    nextUrl = page.nextUrl;
  }
  return pageData.flat();
};
