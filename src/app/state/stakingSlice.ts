import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export enum AssetToStake {
  DEXTR = "DEXTR",
  XRD = "XRD",
}
export enum StakeType {
  STAKE = "STAKE",
  UNSTAKE = "UNSTAKE",
}
export interface StakeState {
  totalDextrStaked?: number; // global staked tokens
  userDextrStaked?: number; // needed to calculate APY: userDextrStaked / totalDextrStaked * (stakingEmission + averageRevenue)
  unstakingClaims: UnstakeClaim[]; // to populate the
  asset: AssetToStake;
  type: StakeType;
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
  asset: AssetToStake.DEXTR,
  type: StakeType.STAKE,
};

export const stakeSlice = createSlice({
  name: "stake",
  initialState,

  reducers: {
    setAsset: (state, action) => {
      state.asset = action.payload;
    },
    setType: (state, action) => {
      state.type = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(stakeDextr.fulfilled, (state, action) => {
        // Update staking amounts after successful stake
        if (state.userDextrStaked !== undefined) {
          state.userDextrStaked += action.payload.amount;
        }
        if (state.totalDextrStaked !== undefined) {
          state.totalDextrStaked += action.payload.amount;
        }
      })
      .addCase(unstake.fulfilled, (state, action) => {
        // Add new unstaking claim
        state.unstakingClaims.push(action.payload.claim);
        // Update staking amounts
        if (state.userDextrStaked !== undefined) {
          state.userDextrStaked -= action.payload.claim.unstakeAmount;
        }
        if (state.totalDextrStaked !== undefined) {
          state.totalDextrStaked -= action.payload.claim.unstakeAmount;
        }
      })
      .addCase(claimUnstakedDextr.fulfilled, (state, action) => {
        // Mark claim as claimed
        if (state.unstakingClaims[action.payload.claimIndex]) {
          state.unstakingClaims[action.payload.claimIndex].claimed = true;
        }
      })
      .addCase(fetchStakingData.fulfilled, (state, action) => {
        // Update all staking data
        state.totalDextrStaked = action.payload.totalDextrStaked;
        state.userDextrStaked = action.payload.userDextrStaked;
        state.unstakingClaims = action.payload.unstakingClaims;
      })
      .addCase(fetchUnstakeClaims.fulfilled, (state, action) => {
        // Update only the unstaking claims
        state.unstakingClaims = action.payload;
      });
  },
});

export const stakeDextr = createAsyncThunk(
  "stake",
  async (amount: number, { getState }) => {
    try {
      // TODO: Replace with your actual staking transaction
      // const result = await stakingContract.stake(amount);
      return {
        status: "SUCCESS",
        amount,
      };
    } catch (error) {
      throw error;
    }
  }
);

export const unstake = createAsyncThunk(
  "unstake",
  async (amount: number, { getState }) => {
    try {
      // TODO: Replace with your actual unstaking transaction
      // const result = await stakingContract.unstake(amount);
      const unstakeStarted = new Date();
      const unstakeEnded = new Date(
        unstakeStarted.getTime() + 7 * 24 * 60 * 60 * 1000
      ); // 7 days later
      const claimDate = unstakeEnded;

      return {
        status: "SUCCESS",
        claim: {
          unstakeStarted,
          unstakeEnded,
          claimDate,
          unstakeAmount: amount,
          claimed: false,
        },
      };
    } catch (error) {
      throw error;
    }
  }
);

export const claimUnstakedDextr = createAsyncThunk(
  "stake/claimUnstakedDextr",
  async (claimIndex: number, { getState }) => {
    try {
      // TODO: Replace with your actual claim transaction
      // const result = await stakingContract.claim(claimIndex);
      return {
        status: "SUCCESS",
        claimIndex,
      };
    } catch (error) {
      throw error;
    }
  }
);

// Data fetching thunks
export const fetchStakingData = createAsyncThunk(
  "stake/fetchStakingData",
  async (_, { getState }) => {
    try {
      // TODO: Replace with your actual data fetching
      // const data = await stakingContract.getStakingData();
      return {
        totalDextrStaked: 0,
        userDextrStaked: 0,
        unstakingClaims: [],
      };
    } catch (error) {
      throw error;
    }
  }
);

export const fetchUnstakeClaims = createAsyncThunk(
  "stake/fetchUnstakeClaims",
  async (_, { getState }) => {
    try {
      // TODO: Replace with actual fetch logic
      return [] as UnstakeClaim[];
    } catch (error) {
      throw error;
    }
  }
);

export const fetchTotalDextrStaked = createAsyncThunk(
  "stake/fetchTotalDextrStaked",
  async (_, { getState }) => {
    try {
      // TODO: Replace with actual fetch logic
      return 0;
    } catch (error) {
      throw error;
    }
  }
);

export const fetchUserDextrStaked = createAsyncThunk(
  "stake/fetchUserDextrStaked",
  async (_, { getState }) => {
    try {
      // TODO: Replace with actual fetch logic
      return 0;
    } catch (error) {
      throw error;
    }
  }
);

export const { setAsset, setType } = stakeSlice.actions;
export default stakeSlice.reducer;
