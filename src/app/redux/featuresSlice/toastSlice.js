// toastSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  visible: false,
  message: "",
  iconType: null // Store icon type as string instead of React element
};

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    showToast: (state, action) => {
      state.visible = true;
      state.message = action.payload.text;
      state.iconType = action.payload.iconType; 
    },
    hideToast: (state) => {
      state.visible = false;
      state.message = "";
      state.iconType = null;
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;