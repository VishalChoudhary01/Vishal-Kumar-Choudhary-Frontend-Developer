import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mobileMenuOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleMobileMenu(state) {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    closeMobileMenu(state) {
      state.mobileMenuOpen = false;
    },
    openMobileMenu(state) {
      state.mobileMenuOpen = true;
    },
  },
});

export const { toggleMobileMenu, closeMobileMenu, openMobileMenu } =
  uiSlice.actions;
export default uiSlice.reducer;
