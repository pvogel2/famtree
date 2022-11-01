import { createSlice } from '@reduxjs/toolkit';

const founderSlice = createSlice({
  name: 'founder',
  initialState: null,
  reducers: {
    setFounder(state, action) {
      const newFounder = action.payload;
      if (newFounder) {
        return parseInt(newFounder);
      }
      return state;
    },
  },
})

export const { setFounder } = founderSlice.actions;
export default founderSlice.reducer;
