import { createSlice } from '@reduxjs/toolkit';

const layoutSlice = createSlice({
  name: 'layout',
  initialState: {
    foreground: '#888888',
  },
  reducers: {
    setForeground(state, action) {
      return { ...state, foreground: action.payload };
    },
 },
})

export const { setForeground } = layoutSlice.actions;
export default layoutSlice.reducer;
