import { createSlice } from "@reduxjs/toolkit";

export interface StakeState {
  totalDextrStaked?: number; // global staked tokens
  userDextrStaked?: number; // needed to calculate APY: userDextrStaked / totalDextrStaked * (stakingEmission + averageRevenue)
  unstakingClaims: UnstakeClaim[]; // to populate the
}

// Draft, will be adapted depending on data structure used on scrypto side
interface UnstakeClaim {
  unstakeStarted: Date;
  unstakeEnded: Date;
  claimDate: Date;
  unstakeAmount: number;
  claimed: boolean;
}

const initialState: StakeState = {
  totalDextrStaked: undefined,
  userDextrStaked: undefined,
  unstakingClaims: [],
};

export const stakeSlice = createSlice({
  name: "stake",
  initialState,

  // synchronous reducers: TBD
  reducers: {},

  // async thunks (actions), for simplicity only the fulfilled case is added
  // extraReducers: (builder) => {
  //   builder
  //     // Action1: stake DEXTR
  //     .addCase(stakeDextr.fulfilled, (state) => {})
  //     // Action2: unstake DEXTR
  //     .addCase(unstakeDextr.fulfilled, (state) => {})
  //     // Action3: claim unstaked DEXTR
  //     .addCase(claimUnstakedDextr.fulfilled, (state) => {})
  //     // FETCHING DATA (from the radix ledger) could too be async thunks
  //     .addCase(fetchUnstakeClaims.fulfilled, (state) => {})
  //     .addCase(fetchTotalDextrStaked.fulfilled, (state) => {})
  //     .addCase(fetchUserDextrStaked.fulfilled, (state) => {});
  // },
});
