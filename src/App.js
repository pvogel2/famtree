import React from 'react';
import { useEffect } from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { StyledEngineProvider } from '@mui/material/styles';
import { createTheme, ThemeProvider } from "@mui/material/styles";

import personsReducer from './store/personsReducer';
import focusedPersonReducer from './store/focusedPersonReducer';
import selectedPersonReducer from './store/selectedPersonReducer';
import familyReducer from './store/familyReducer';
import familiesReducer from './store/familiesReducer';
import runtimeReducer from './store/runtimeReducer';
import relationsReducer from './store/relationsReducer';
import RenderProvider from './components/RenderProvider';
import PedigreeRenderer from './components/PedegreeRenderer';
import { loadFamily } from './mylib/Connect';

import { setPersons } from './store/personsReducer';
import { setFounder } from './store/familyReducer';
import { setFamilies } from './store/familiesReducer';
import { setForeground, setBackground, setText, setHighlight } from './store/layoutReducer';
import { setRelations } from './store/relationsReducer';

import LoadFamily from './components/ui/LoadFamily';
import InfoDialog from './components/ui/InfoDialog';
import DetailsDialog from './components/ui/DetailsDialog';
import Intersector from './components/Intersector';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import layoutReducer from './store/layoutReducer';

const store = configureStore({ reducer: {
  persons: personsReducer,
  founder: familyReducer,
  families: familiesReducer,
  focusedPerson: focusedPersonReducer,
  selectedPerson: selectedPersonReducer,
  runtime: runtimeReducer,
  layout: layoutReducer,
  relations: relationsReducer,
}});

function App(props) {
  const {
    founder = -1,
    persons = null,
    families = null,
    relations = null, // TODO needed?
    founderFAB = false,
    readonly = false,
    text,
    background,
    foreground,
    highlight,
  } = props;

  const cameraPosition= { x: 30.0, y: 30.0, z: 30.0 };
  const cameraTarget = { x: 0, y: 0, z: 0 };

  const theme = createTheme({
    palette: {
      primary: {
        main: foreground,
        contrastText: '#ffffff',
      },
    },
  });

  useEffect(async () => {
    if (founder) {
      await store.dispatch(setFounder(founder));

      async function updateData(data) {
        await store.dispatch(setPersons(data.persons));
        await store.dispatch(setRelations(data.relations));

        const founders = data.persons.filter((p) => p.root).map((p) => p.id);

        await store.dispatch(setFamilies(founders));

      }

      if (!persons || !relations) {
        const loadedData = await loadFamily();
        await updateData(loadedData);
      } else {
        await updateData({ persons, relations });
      }
    }
  }, [founder, persons, families, relations]);

  useEffect(async () => {
    if (foreground) {
      await store.dispatch(setForeground(foreground));
    }
  }, [foreground]);

  useEffect(async () => {
    if (background) {
      await store.dispatch(setBackground(background));
    }
  }, [background]);

  useEffect(async () => {
    if (text) {
      await store.dispatch(setText(text));
    }
  }, [text]);

  useEffect(async () => {
    if (highlight) {
      await store.dispatch(setHighlight(highlight));
    }
  }, [highlight]);

  return (
    <LocalizationProvider dateAdapter={ AdapterDateFns }>
      <ThemeProvider theme={theme}>
      <StyledEngineProvider injectFirst>
        <Provider store={ store }>
          <RenderProvider
            position={ cameraPosition }
            target={ cameraTarget }
          >
            <PedigreeRenderer />
            <Intersector />
            {founderFAB && <LoadFamily readonly={ readonly } /> }
            <InfoDialog readonly={ readonly } />
            <DetailsDialog />
          </RenderProvider>
        </Provider>
      </StyledEngineProvider>
      </ThemeProvider>
    </LocalizationProvider>
  );
}

export default App;

//https://github.com/LearnWebCode/brads-boilerplate-wordpress/blob/main/brads-boilerplate-block-plugin/src/frontend.js
//https://www.youtube.com/watch?v=NKqogVcqDHA
