import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the initial state and its type
interface CounterState {
  credits: number;
}

const initialState: CounterState = {
  credits: 100,
};

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    // Increment action
    increment: (state) => {
      console.log(state.credits);
      state.credits += 100; // Increment the credits by 100
    },
    // Decrement action with payload of type number
    decrement: (state, action: PayloadAction<number>) => {
      console.log(state.credits);
      state.credits -= action.payload; // Decrease credits by the value in payload
      console.log(state.credits);
    },
    // Update action with payload of type number
    update: (state, action: PayloadAction<number>) => {
      state.credits = action.payload; // Set the credits to the value in payload
    },
  },
});

// Action creators are generated for each case reducer function
export const { increment, decrement, update } = counterSlice.actions;

export default counterSlice.reducer;
