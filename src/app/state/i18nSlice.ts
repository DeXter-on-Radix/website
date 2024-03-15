import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import enTrade from "./locales/en/trade.json";
import enFooter from "./locales/en/footer.json";
import ptTrade from "./locales/pt/trade.json";
import ptFooter from "./locales/pt/footer.json";

interface TextContent {
  [key: string]: string;
}

interface I18nState {
  language: string;
  textContent: {
    [languageCode: string]: TextContent;
  };
}

const initialState: I18nState = {
  language: "en",
  textContent: {
    en: { ...enTrade, ...enFooter },
    pt: { ...ptTrade, ...ptFooter },
  },
};

export const i18nSlice = createSlice({
  name: "i18n",
  initialState,

  // synchronous reducers
  reducers: {
    changeLanguage: (state: I18nState, action: PayloadAction<string>) => {
      if (state.textContent.hasOwnProperty(action.payload)) {
        state.language = action.payload;
      }
    },
  },
});
