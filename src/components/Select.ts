import { ChangeEvent, createElement, useCallback } from "react";
import { LABEL_STYLES } from "../styles";

export const Select = <T>({
  items,
  label,
  onChange,
  selectedItem,
  toValue,
}: {
  items: T[];
  label: string;
  onChange: (submittedItem: T) => void;
  selectedItem: T;
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
    [items, onChange, toValue]
  );

  return createElement(
    "label",
    {
      style: LABEL_STYLES,
    },
    createElement("span", {}, label),
    createElement(
      "select",
      {
        onChange: handleChange,
        value: toValue(selectedItem),
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
