import { i18nSlice } from "../src/app/state/i18nSlice";

const initialState = i18nSlice.getInitialState();

describe("i18nSlice", () => {
  test("all languages have the same keys for all textContent objects", () => {
    const languages = Object.keys(initialState.textContent);
    const referenceLanguage = "en";
    const referenceKeys = new Set(
      Object.keys(initialState.textContent[referenceLanguage])
    );

    languages.forEach((lang) => {
      if (lang !== referenceLanguage) {
        const langKeys = new Set(Object.keys(initialState.textContent[lang]));
        const missingKeys = Array.from(referenceKeys).filter(
          (x) => !langKeys.has(x)
        );
        const extraKeys = Array.from(langKeys).filter(
          (x) => !referenceKeys.has(x)
        );

        if (missingKeys.length > 0) {
          console.error(
            `Missing keys in "${lang}" that are present in "${referenceLanguage}": ${missingKeys.join(
              ", "
            )}`
          );
        }

        if (extraKeys.length > 0) {
          console.error(
            `Extra keys in "${lang}" that are not present in "${referenceLanguage}": ${extraKeys.join(
              ", "
            )}`
          );
        }

        expect(missingKeys.length).toBe(0);
        expect(extraKeys.length).toBe(0);
      }
    });
  });
});
