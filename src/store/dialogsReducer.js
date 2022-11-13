import { createSlice } from '@reduxjs/toolkit';

const dialogsSlice = createSlice({
    name: 'config',
    initialState: {
      edit: null,
      details: false,
    },
    reducers: {
      showPersonDialog(state, action) {
        const { edit = '' } = { ...action.payload };
        return { ...state, edit };
      },
      hidePersonDialog(state) {
        return { ...state, edit: null };
      },
    },
  })
  
export const { showPersonDialog, hidePersonDialog } = dialogsSlice.actions;
export default dialogsSlice.reducer;
