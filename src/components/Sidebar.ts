import { createElement, ReactNode, useState } from "react";
import { CSS_UNIT, SCRIM_Z_INDEX, SIDEBAR_STYLES } from "../styles";

export const Sidebar = ({ children }: { children: ReactNode[] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return createElement(
    "div",
    {
      style: {
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        right: 0,
        top: 0,
        transform: `translateX(${isOpen ? 0 : 100}%)`,
        zIndex: SCRIM_Z_INDEX,
        ...SIDEBAR_STYLES,
      },
    },
    createElement(
      "div",
      {
        onClick: () => setIsOpen((b) => !b),
        style: {
          cursor: "pointer",
          padding: 3 * CSS_UNIT,
          position: "absolute",
          right: "100%",
          top: "50%",
          transform: `translateY(${-50}%)`,
        },
      },
      isOpen ? "▶" : "◀"
    ),
    createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          gap: CSS_UNIT,
          padding: 3 * CSS_UNIT,
        },
      },
      ...children
    )
  );
};
