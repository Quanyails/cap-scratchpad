import { NEXT_SELECTOR, POST_SELECTOR } from "../querySelectors";

interface Page {
  els: HTMLElement[];
  nextUrl: string | undefined;
}

const fetchPage = async (url: string): Promise<Page> => {
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

  return {
    els: Array.from(el.querySelectorAll(POST_SELECTOR)) as HTMLElement[],
    nextUrl,
  };
};

export const fetchThread = async (url: string): Promise<HTMLElement[]> => {
  const pageData: HTMLElement[][] = [];
  let nextUrl: string | undefined = url;
  while (nextUrl !== undefined) {
    const page = await fetchPage(nextUrl);
    pageData.push(page.els);
    nextUrl = page.nextUrl;
  }
  return pageData.flat();
};
