import { createSlice } from '@reduxjs/toolkit';

const runtimeSlice = createSlice({
  name: 'runtime',
  initialState: {
    move: null,
  },
  reducers: {
    setPoint(_, action) {
      return { move: { ...action.payload } };
    },
 },
})

export const { setPoint } = runtimeSlice.actions;
export default runtimeSlice.reducer;
