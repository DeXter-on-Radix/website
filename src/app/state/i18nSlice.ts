import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// INSTRUCTIONS_add_namespace_1:
// -> if you want to add a new namespace, this is a manual process.
// -> create for each supported language, a file with your namespace name
//    e.g. if you want to create about_us namespace, you would create
//    src/app/state/locales/en/about_us.json
//    src/app/state/locales/pt/about_us.json
//    src/app/state/locales/../about_us.json  // add all supported languages

// INSTRUCTIONS_add_namespace_2:
// -> once you created the files, you need to load all files manually below:
//    e.g.:
//    import enAboutUs from "./locales/en/about_us.json";
//    import ptAboutUs from "./locales/pt/about_us.json";

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

// INSTRUCTIONS_add_namespace_3:
// -> add all your namespaces to the list in textContent
// -> e.g.
//    textContent: {
//      en: { ...enTrade, ...enFooter, ...enAboutUs },
//      pt: { ...ptTrade, ...ptFooter, ...ptAboutUs },
//    },

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
