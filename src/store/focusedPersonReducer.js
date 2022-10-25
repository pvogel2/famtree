import { createSlice } from '@reduxjs/toolkit';

const focusedPersonSlice = createSlice({
  name: 'focusedPerson',
  initialState: null,
  reducers: {
    setPerson(_, action) {
      return { ...action.payload };
    },
    clearPerson(_) {
      return null;
    },
 },
})

export const { setPerson, clearPerson } = focusedPersonSlice.actions;
export default focusedPersonSlice.reducer;
