import { createSlice } from '@reduxjs/toolkit';

const selectedPersonSlice = createSlice({
  name: 'selectedPerson',
  initialState: {
    person: null,
    metadata: [],
    selectedMeta: null,
  },
  reducers: {
    setPerson(_, action) {
      return { person: { ...action.payload }, metadata: [], selectedMeta: null };
    },
    setMetadata(state, action) {
      const metadata = action.payload.map((m) => ({ ...m }));
      // only renew target objects
      return { ...state, metadata, selectedMeta: null };
    },
    setSelectedMeta(state, action) {
      const metadata = state.metadata.map((m) => ({ ...m }));
      const selectedMeta = metadata.find((md) => parseInt(md.id) === parseInt(action.payload));
      // only renew target objects
      return { ...state, selectedMeta };
    },
    clearPerson(_) {
      return { person: null, metadata: [], selectedMeta: null };
    },
 },
})

export const { setSelectedMeta, setMetadata, setPerson, clearPerson } = selectedPersonSlice.actions;
export default selectedPersonSlice.reducer;
