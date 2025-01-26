import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fetchBalances } from "./pairSelectorSlice";
import { RootState } from "./store";
import { calculateAPY } from "utils";

export enum AssetToStake {
  DEXTR = "DEXTR",
  // XRD = "XRD",
}
export enum StakeType {
  STAKE = "STAKE",
  UNSTAKE = "UNSTAKE",
}
export interface StakeState {
  totalDextrStaked: number; // global staked tokens
  userDextrStaked: number; // needed to calculate APY: userDextrStaked / totalDextrStaked * (stakingEmission + averageRevenue)
  unstakingClaims: UnstakeClaim[]; // to populate the
  asset: string;
  type: string;
  balances: Record<string, number>;
  stakingEmission?: number;
  averageRevenue?: number;
  apy?: string;
}

const initialState: StakeState = {
  totalDextrStaked: 0,
  userDextrStaked: 0,
  unstakingClaims: [] as UnstakeClaim[],
  asset: AssetToStake.DEXTR,
  type: StakeType.STAKE,
  balances: {},
  stakingEmission: undefined,
  averageRevenue: undefined,
  apy: "",
};

// Draft, will be adapted depending on data structure used on scrypto side
interface UnstakeClaim {
  unstakeStarted: Date;
  unstakeEnded: Date;
  claimDate: Date;
  unstakeAmount: number;
  claimed: boolean;
}

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
    setBalances: (state, action) => {
      state.balances = action.payload;
    },
    setUserStakedAmount(state, action: PayloadAction<number>) {
      state.userDextrStaked = action.payload;
      if (
        state.userDextrStaked !== undefined &&
        state.totalDextrStaked !== undefined &&
        state.stakingEmission !== undefined &&
        state.averageRevenue !== undefined
      ) {
        state.apy = calculateAPY(
          state.userDextrStaked,
          state.totalDextrStaked,
          state.stakingEmission,
          state.averageRevenue
        );
      }
    },
    setTotalStaked(state, action: PayloadAction<number>) {
      state.totalDextrStaked = action.payload;
    },
    setStakingEmission(state, action: PayloadAction<number>) {
      state.stakingEmission = action.payload;
    },
    setAverageRevenue(state, action: PayloadAction<number>) {
      state.averageRevenue = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchBalances.fulfilled, (state, action) => {
        if (action.payload) {
          state.balances = action.payload;
        }
      })
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
        const newClaim: UnstakeClaim = action.payload.claim;
        state.unstakingClaims.push(newClaim);
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
  "stake/stakeDextr",
  async (amount: number, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;

      // Example: Retrieve user account or contract from state if needed
      // const userAccount = state.user.account; // Replace with actual state key
      // const stakingContract = state.staking.contract; // Replace with actual contract instance
      const userAccount = state.radix.walletData.accounts;

      if (!userAccount) {
        throw new Error("User account or staking contract not found.");
      }

      return {
        status: "SUCCESS",
        amount,
        // transactionHash: result.transactionHash,
      };
    } catch (error: any) {
      // Handle error gracefully
      return rejectWithValue({
        status: "FAILURE",
        message: error.message || "An error occurred during staking.",
      });
    }
  }
);

// export const stakeDextr = createAsyncThunk(
//   "stake",
//   async (amount: number, { getState }) => {
//     try {
//       // TODO: Replace with your actual staking transaction
//       // const result = await stakingContract.stake(amount);
//       return {
//         status: "SUCCESS",
//         amount,
//       };
//     } catch (error) {
//       throw error;
//     }
//   }
// );

export const unstake = createAsyncThunk("unstake", async (amount: number) => {
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
});

export const claimUnstakedDextr = createAsyncThunk(
  "stake/claimUnstakedDextr",
  async (claimIndex: number) => {
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
  async () => {
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

export const fetchUnstakeClaims = createAsyncThunk<UnstakeClaim[]>(
  "stake/fetchUnstakeClaims",
  async () => {
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
  async () => {
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
  async () => {
    try {
      // TODO: Replace with actual fetch logic
      return 0;
    } catch (error) {
      throw error;
    }
  }
);

export const {
  setAsset,
  setType,
  setUserStakedAmount,
  setTotalStaked,
  setStakingEmission,
  setAverageRevenue,
} = stakeSlice.actions;
export default stakeSlice.reducer;
