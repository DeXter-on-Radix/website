import React from "react";

// fixing TypeError: (0 , import_immer5.enableES5) is not a function
// https://github.com/vercel/next.js/issues/53272

jest.mock("immer", () => ({
  ...(jest.requireActual < typeof ReactDom > "immer"),
  enableES5: jest.fn(),
  isDraftable: jest.fn(),
}));
