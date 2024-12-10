"use client";
import { Provider } from "react-redux";
import { makeStore } from "../store/store"; // Assuming you have makeStore defined in your store file
import { persistStore } from "redux-persist";
import { PersistGate } from 'redux-persist/integration/react';
import { ReactNode } from 'react';

// Create the store and persistor
const store = makeStore();
const persistor = persistStore(store);

interface StoreProviderProps {
  children: ReactNode;
}

export default function StoreProvider({ children }: StoreProviderProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
