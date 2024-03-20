import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./state/store";

// https://redux-toolkit.js.org/tutorials/typescript#define-typed-hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// A custom hook that returns the translation function
export const useTranslations = () => {
  const currentLanguage = useSelector(
    (state: RootState) => state.i18n.language
  );
  const textContent = useSelector((state: RootState) => state.i18n.textContent);
  // The translation function that closures over the current language and text content
  const t = (key: string): string => {
    return textContent[currentLanguage]?.[key] || key;
  };
  return t;
};
