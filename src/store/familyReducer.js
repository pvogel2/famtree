import { createSlice } from '@reduxjs/toolkit';

const familySlice = createSlice({
  name: 'family',
  initialState: 'default',
  reducers: {
    setFamily(state, action) {
      const newFamily = action.payload;
      if (newFamily && typeof newFamily === 'string') {
        return newFamily;
      }
      return state;
    },
  },
})

export const { setFamily } = familySlice.actions;
export default familySlice.reducer;
