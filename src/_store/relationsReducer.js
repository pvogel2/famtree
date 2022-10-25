import { createSlice } from '@reduxjs/toolkit';

function updateStateRelation(state, u) {
  const idx = state.findIndex((r) => r.id === u.id);
  if (idx > -1) {
    state.splice(idx, 1, u);
  }
}

function removeStateRelation(state, rId) {
  const idx = state.findIndex((r) => r.id === rId);
  if (idx > -1) {
    state.splice(idx, 1);
  }
}

let maxId = 0;


const relationsSlice = createSlice({
  name: 'relations',
  initialState: [],
  reducers: {
    setRelations(state, action) {
      const newState = state.splice();
      newState.push(...action.payload);
      return newState.length ? newState : [];
    },
    updateRelation(state, action) {
      const update = { ...action.payload };
      const newState = [...state];
      updateStateRelation(newState, update);
      return newState;
    },
    
    addRelation(state, action) {
      maxId = state.length;

      state.forEach((r) => {
        if (r.id >= maxId) {
          maxId = r.id + 1;
        }
      });

      const newState = [...state];
      action.payload.id = maxId;
      newState.push({ ...action.payload });
      return newState;
    },

    removeRelation(state, action) {
      const relId = action.payload;
      const newState = [...state];

      removeStateRelation(newState, relId);
      return newState;
    }
  },
})

export const { setRelations, updateRelation, addRelation, removeRelation } = relationsSlice.actions;
export default relationsSlice.reducer;
