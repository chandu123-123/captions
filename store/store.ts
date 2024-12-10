import { combineReducers, configureStore } from "@reduxjs/toolkit";
import counterReducer from "@/store/createslice"; // Adjust the import as needed
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import { PersistedState } from "redux-persist/es/types";

// Define the persist config
const persistConfig = {
  key: 'root',
  storage,
};

// Combine reducers
const rootReducer = combineReducers({
  counter: counterReducer,
});

// Define the RootState type by inferring it from the rootReducer
export type RootState = ReturnType<typeof rootReducer>;

// Apply persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create and export the store
export const makeStore = () => {
  return configureStore({
    reducer: persistedReducer,
  });
};

// Type for the store's dispatch function
export type AppDispatch = ReturnType<typeof makeStore>['dispatch'];
