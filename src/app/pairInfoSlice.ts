import * as adex from "alphadex-sdk-js";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface PairInfoState {
  address: string;
}

const initialState: PairInfoState = {
  address: "",
};

export const pairInfoSlice = createSlice({
  name: "pairInfo",
  initialState,

  // synchronous reducers
  reducers: {},

  // asynchronous reducers
  extraReducers: (builder) => {},
});

export default pairInfoSlice.reducer;
