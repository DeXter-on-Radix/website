import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./state/store";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getLocalStoragePaginationValue,
  setLocalStoragePaginationValue,
} from "utils";

// Define an enum for the operating system types
export enum OperatingSystem {
  MAC = "MAC",
  WINDOWS = "WINDOWS",
  LINUX = "LINUX",
  UNKNOWN = "UNKNOWN",
}

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

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkIfMobile = () => {
      try {
        const userAgent = navigator.userAgent.toLowerCase();
        if (
          userAgent.match(/Android/i) ||
          userAgent.match(/webOS/i) ||
          userAgent.match(/avantgo/i) ||
          userAgent.match(/iPhone/i) ||
          userAgent.match(/iPad/i) ||
          userAgent.match(/iPod/i) ||
          userAgent.match(/BlackBerry/i) ||
          userAgent.match(/bolt/i) ||
          userAgent.match(/Windows Phone/i) ||
          userAgent.match(/Phone/i)
        ) {
          return true;
        }
        return false;
      } catch (err) {
        console.error(err);
        return window.innerWidth < 768;
      }
    };
    setIsMobile(checkIfMobile());
  }, []);
  return isMobile;
};

export const useOperatingSystem = () => {
  const [operatingSystem, setOperatingSystem] = useState<OperatingSystem>(
    OperatingSystem.UNKNOWN
  );
  useEffect(() => {
    const detectOperatingSystem = (): OperatingSystem => {
      if (typeof window === "undefined" || typeof navigator === "undefined") {
        return OperatingSystem.UNKNOWN;
      }
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes("mac os")) {
        return OperatingSystem.MAC;
      } else if (userAgent.includes("windows")) {
        return OperatingSystem.WINDOWS;
      } else if (userAgent.includes("linux")) {
        return OperatingSystem.LINUX;
      } else {
        return OperatingSystem.UNKNOWN;
      }
    };
    const os = detectOperatingSystem();
    setOperatingSystem(os);
  }, []);
  return operatingSystem;
};

export function useBrowserLanguage(defaultLanguage: string = "en") {
  const [language, setLanguage] = useState<string>(defaultLanguage);
  const detectBrowserLanguage = (defaultLanguage: string = "en"): string => {
    const toLngCode = (str: string) => str.substring(0, 2).toLowerCase();
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      if (Array.isArray(navigator.languages) && navigator.languages.length) {
        return toLngCode(navigator.languages[0]);
      }
      if (navigator.language) {
        return toLngCode(navigator.language);
      }
      if ((navigator as any).userLanguage) {
        return toLngCode((navigator as any).userLanguage);
      }
      if ((navigator as any).browserLanguage) {
        return toLngCode((navigator as any).browserLanguage);
      }
      if ((navigator as any).systemLanguage) {
        return toLngCode((navigator as any).systemLanguage);
      }
    }
    return defaultLanguage;
  };
  useEffect(() => {
    const browserLanguage = detectBrowserLanguage(defaultLanguage);
    setLanguage(browserLanguage);
  }, [defaultLanguage]);
  return language;
}

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
    [data, startIndex, endIndex]
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
