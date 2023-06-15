import { ChangeEvent, createElement, useCallback } from "react";
import { SELECT_STYLES } from "../styles";

export const Select = <T>({
  currentItem,
  items,
  label,
  onChange,
  toValue,
}: {
  currentItem: T;
  items: T[];
  label: string;
  onChange: (submittedItem: T) => void;
  toValue: (item: T) => string;
}) => {
  const handleChange = useCallback<(e: ChangeEvent<HTMLSelectElement>) => void>(
    (e) => {
      const changedItem = items.find(
        (t) => toValue(t) === e.currentTarget.value
      );
      if (changedItem) {
        onChange(changedItem);
      }
    },
    [...items]
  );

  return createElement(
    "label",
    {
      style: SELECT_STYLES,
    },
    createElement("span", {}, label),
    createElement(
      "select",
      {
        onChange: handleChange,
        value: toValue(currentItem),
      },
      ...items.map((t, i) => {
        const value = toValue(t);
        return createElement(
          "option",
          {
            key: i,
            value,
          },
          value
        );
      })
    )
  );
};
