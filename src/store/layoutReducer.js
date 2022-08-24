import { createSlice } from '@reduxjs/toolkit';

const layoutSlice = createSlice({
  name: 'layout',
  initialState: {
    foreground: '#888888',
    background: '#CCCCCC',
  },
  reducers: {
    setForeground(state, action) {
      return { ...state, foreground: action.payload };
    },
    setBackground(state, action) {
      return { ...state, background: action.payload };
    },
 },
})

export const { setForeground, setBackground } = layoutSlice.actions;
export default layoutSlice.reducer;
