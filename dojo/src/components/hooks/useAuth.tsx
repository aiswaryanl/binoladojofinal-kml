// src/store/authSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { authAPI } from "../utils/loginApi";
import type { LoginResponse } from "../constants/types";

interface User {
  email: string;
  first_name: string;
  last_name: string;
  employeeid: string;
  role: string;
  hq: string;
  factory: string;
  department: string;
  status: boolean;
  permissions: string[]; // <--- ADD THIS: Array of keys like ['dashboard_main', 'planning_main']
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
};

// ✅ Async thunk for login
export const login = createAsyncThunk<LoginResponse, { email: string; password: string }>(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Login failed");
    }
  }
);

// ✅ Async thunk for logout
export const logout = createAsyncThunk<void, void, { state: { auth: AuthState } }>(
  "auth/logout",
  async (_, { getState }) => {
    const { auth } = getState();
    try {
      if (auth.refreshToken && auth.accessToken) {
        await authAPI.logout(auth.refreshToken, auth.accessToken);
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    // 🔹 Login reducers
    builder.addCase(login.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
      // state.user = action.payload.user;
            // 🔍 DEBUG: Log the entire response to see what the backend is sending
      console.log("--- LOGIN SUCCESS DATA ---");
      console.log("Full Payload:", action.payload);
      console.log("User Object:", action.payload.user);
      console.log("Permissions List:", action.payload.user.permissions);
      console.log("--------------------------");
      
      
      // state.user = action.payload.user;
      // Use spread operator to ensure all fields (including permissions) are mapped
      state.user = {
        ...action.payload.user,
        // If the backend occasionally sends null, default to an empty array
        permissions: action.payload.user.permissions || [] 
      };
      state.accessToken = action.payload.access_token;
      state.refreshToken = action.payload.refresh_token;
      state.isAuthenticated = true;
      state.loading = false;

      // persist in localStorage
      localStorage.setItem("auth", JSON.stringify({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }));
    });
    builder.addCase(login.rejected, (state) => {
      state.loading = false;
      state.isAuthenticated = false;
    });

    // 🔹 Logout reducers
    builder.addCase(logout.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.loading = false;

      //clear localStorage
      localStorage.removeItem("auth");
    });
  },
});

export const { clearAuth } = authSlice.actions;
export default authSlice.reducer;
