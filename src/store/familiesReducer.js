import { createSlice } from '@reduxjs/toolkit';

const familiesSlice = createSlice({
  name: 'families',
  initialState: ['default'],
  reducers: {
    setFamilies(state, action) {
      const allFamilies = action.payload;
      if (allFamilies && Array.isArray(allFamilies)) {
        return allFamilies;
      }
      return state;
    },
  },
})

export const { setFamilies } = familiesSlice.actions;
export default familiesSlice.reducer;
