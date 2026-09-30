import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axioKit } from "../../../utilities";

const url = "events/payments";

const initialState = {
  formSubmitted: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

export const SAVE = createAsyncThunk(`${url}/save`, (form, thunkAPI) => {
  try {
    return axioKit.save(url, form);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();

    return thunkAPI.rejectWithValue(message);
  }
});

export const reduxSlice = createSlice({
  name: url,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(SAVE.pending, (state) => {
        state.formSubmitted = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(SAVE.fulfilled, (state, action) => {
        const { success } = action.payload;

        state.formSubmitted = false;
        state.message = success;
        state.isSuccess = true;
      })
      .addCase(SAVE.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.formSubmitted = false;
      });
  },
});

export default reduxSlice.reducer;
