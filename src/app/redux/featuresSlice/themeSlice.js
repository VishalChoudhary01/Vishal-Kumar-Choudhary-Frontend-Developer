import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  DarkMode: false,
  ready:false,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.DarkMode = !state.DarkMode;
    },
    setDarkMode: (state, action) => {
      state.DarkMode = action.payload;
      state.ready = true;
    },
  },
});

export const { toggleDarkMode, setDarkMode } = themeSlice.actions;
export default themeSlice.reducer;