import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./state/store";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getLocalStoragePaginationValue,
  setLocalStoragePaginationValue,
} from "utils";

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

// Hook to fix hydration errors by delaying rendering until client-side mount
export const useHydrationErrorFix = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};

export function usePagination<T>(data: T[], paginationId?: string) {
  const [currentPage, setCurrentPage] = useState(0);

  const [pageSize, setPageSize] = useState(
    getLocalStoragePaginationValue() ?? 20
  );
  const totalDataLength = useMemo(() => data.length, [data]);

  const startIndex = useMemo(
    () => currentPage * pageSize,
    [currentPage, pageSize]
  );
  const endIndex = useMemo(() => startIndex + pageSize, [startIndex, pageSize]);

  const paginatedData = useMemo(
    () => data.slice(startIndex, endIndex),
    [data, currentPage]
  );

  const updatePsize = useCallback(
    (psize: number) => {
      setLocalStoragePaginationValue(psize, paginationId);
      setPageSize(psize);
    },
    [paginationId, setPageSize]
  );

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize: updatePsize,
    paginatedData,
    totalDataLength,
  };
}
