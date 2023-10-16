import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UiState {
  decimalSeparator: string;
  thousandsSeparator: string;
}

const initialState: UiState = {
  decimalSeparator: ".",
  thousandsSeparator: " ",
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,

  // synchronous reducers
  reducers: {
    setDecimalSeparator: (state: UiState, action: PayloadAction<string>) => {
      state.decimalSeparator = action.payload;
    },
    setThousandsSeparator: (state: UiState, action: PayloadAction<string>) => {
      state.thousandsSeparator = action.payload;
    },
  },
});
