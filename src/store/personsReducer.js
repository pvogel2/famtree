import { createSlice } from '@reduxjs/toolkit';
import Person from '../lib/Person';

const dummyPerson = new Person({
  id: 'p0',
  firstName: 'Dummy',
  lastName: 'Person',
});

function updateStatePerson(state, u) {
  const idx = state.findIndex((p) => p.id === u.id);
  if (idx > -1) {
    state.splice(idx, 1, u);
  }
}

const personsSlice = createSlice({
  name: 'persons',
  initialState: [dummyPerson.serialize()],
  reducers: {
    setPersons(state, action) {
      const newState = state.splice();
      newState.push(...action.payload);
      return newState;
    },
    addPerson(state, action) {
      const newState = [...state];
      newState.push({ ...action.payload });
      return newState;
    },
    updatePerson(state, action) {
      const update = { ...action.payload };
      const newState = [...state];
      updateStatePerson(newState, update);
      return newState;
    },
    updatePersons(state, action) {
      const updates = [...action.payload];
      const newState = [...state];
      updates.forEach((u) => {
        updateStatePerson(newState, u);
      });
      return newState;
    }
 },
})

export const { addPerson, setPersons, updatePerson, updatePersons } = personsSlice.actions;
export default personsSlice.reducer;
