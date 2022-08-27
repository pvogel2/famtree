import { createSlice } from '@reduxjs/toolkit';

const layoutSlice = createSlice({
  name: 'layout',
  initialState: {
    foreground: '#888888',
    background: '#CCCCCC',
    text: '#333333',
    highlight: '#770000',
  },
  reducers: {
    setForeground(state, action) {
      return { ...state, foreground: action.payload };
    },
    setBackground(state, action) {
      return { ...state, background: action.payload };
    },
    setText(state, action) {
      return { ...state, text: action.payload };
    },
    setHighlight(state, action) {
      return { ...state, highlight: action.payload };
    },
 },
})

export const { setForeground, setBackground, setText, setHighlight } = layoutSlice.actions;
export default layoutSlice.reducer;
