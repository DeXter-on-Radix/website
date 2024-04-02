/**
 * Wrapper component and service for 'react-hot-toast' notifications
 * to generate dexter branded toast notifications.
 * https://react-hot-toast.com/
 */

import { Toaster, toast, ToastPosition } from "react-hot-toast";

// Styling for toastOptions
const fontSize = "1rem";
const padding = "8px";
const dexterGreen = "#CAFC40";
const dexterRed = "#D22D2D";
const dexterBG = "#1A1C1E";
const almostWhite = "#FFFAEE";
const grey = "#74787b";

const toastOptions = {
  loading: {
    style: {
      fontSize: fontSize,
      background: dexterBG,
      border: "1px solid rgba(255,255,255,0.2)",
      padding: padding,
      color: almostWhite,
    },
    iconTheme: {
      primary: grey,
      secondary: almostWhite,
    },
  },
  success: {
    style: {
      fontSize: fontSize,
      background: dexterBG,
      border: "1px solid rgba(255,255,255,0.2)",
      padding: padding,
      color: almostWhite,
    },
    iconTheme: {
      primary: dexterGreen,
      secondary: dexterBG,
    },
  },
  error: {
    style: {
      fontSize: fontSize,
      background: dexterRed,
      padding: padding,
      color: almostWhite,
    },
    iconTheme: {
      primary: almostWhite,
      secondary: dexterRed,
    },
  },
};

interface DexterToasterProps {
  toastPosition: string;
}

export function DexterToaster(props: DexterToasterProps) {
  return (
    <>
      <Toaster
        toastOptions={toastOptions}
        position={props.toastPosition as ToastPosition}
      />
    </>
  );
}

/**
 * Wrapper that exposes toaster API for internal usage
 */
export const DexterToast = {
  success(message: string) {
    toast.success(message);
  },

  error(message: string) {
    toast.error(message);
  },

  promise<T>(
    func: () => Promise<T>,
    loadingMsg: string,
    successMsg: string,
    errorMsg: string
  ) {
    toast.promise(
      (async () => {
        try {
          await func(); // Await the original function's promise
        } catch (error) {
          throw error; // Ensure errors are propagated
        }
      })(),
      {
        loading: loadingMsg,
        success: successMsg,
        error: errorMsg,
      }
    );
  },
};
