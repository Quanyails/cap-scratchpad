import { CSSProperties } from "react";

const BG_SELECTOR = ".offCanvasMenu-content";
const STYLESHEET_PATH = "/forums/css.php";

const styleSheet =
  Array.from(document.styleSheets).find((s) =>
    s.href?.includes(STYLESHEET_PATH)
  ) ?? new CSSStyleSheet();

const rules = Array.from(styleSheet.cssRules).filter(
  (rule): rule is CSSStyleRule => rule instanceof CSSStyleRule
);

export const CSS_UNIT = 8;
export const SCRIM_Z_INDEX = 493;

export const FORM_STYLES: CSSProperties = {
  display: "grid",
  gap: CSS_UNIT,
};

export const SIDEBAR_STYLES: CSSProperties = {
  boxShadow: "0 2px 5px 0 rgba(0,0,0,0.25)", // mirror of BG_SELECTOR boxShadow
  backgroundColor:
    rules
      .filter((rule) => rule.selectorText.includes(BG_SELECTOR))
      .find((rule) => rule.style.backgroundColor)?.style.backgroundColor ??
    "transparent",
  transition:
    rules
      .filter((rule) => rule.selectorText.includes(BG_SELECTOR))
      .find((rule) => rule.style.transition)?.style.transition ?? "none",
};

export const SELECT_STYLES: CSSProperties = {
  alignItems: "center",
  display: "flex",
  gap: CSS_UNIT,
};
