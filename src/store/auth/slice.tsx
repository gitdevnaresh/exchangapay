import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getAccountInfo,
  getMemberInfo,
  clearAuth,
} from "../../store/auth/thunk";

interface AuthState {
  user: Record<string, any> | null;
  member: Record<string, any> | null;
  loading: string;
}

const initialState: AuthState = {
  user: null,
  member: null,
  loading: "idle",
};

// Helper function to ensure deep serialization (simplified for redux-persist compatibility)
const deepSerialize = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(deepSerialize);

  // For objects, try JSON serialization first (safer for redux-persist)
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    // Fallback to manual serialization
    const serialized: Record<string, any> = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        serialized[key] = deepSerialize(obj[key]);
      }
    }
    return serialized;
  }
};

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Add manual reset action
    resetAuth: (state) => {
      state.user = null;
      state.member = null;
      state.loading = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        getAccountInfo.fulfilled,
        (state, action: PayloadAction<any>) => {
          // Use deep serialization to ensure no mutations
          state.user = deepSerialize(action.payload);
        }
      )
      .addCase(getMemberInfo.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(getMemberInfo.fulfilled, (state, action: PayloadAction<any>) => {
        // Use deep serialization to ensure no mutations
        state.member = deepSerialize(action.payload);
        state.loading = "fulfilled";
      })
      .addCase(getMemberInfo.rejected, (state) => {
        state.loading = "rejected";
      })
      .addCase(clearAuth.fulfilled, (state) => {
        state.user = null;
        state.member = null;
        state.loading = "idle";
      });
  },
});

export const { resetAuth } = slice.actions;
export default slice.reducer;
