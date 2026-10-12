import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./slices/uiSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      ui: uiReducer,
    },
  });
