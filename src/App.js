import React from 'react';
import { useEffect } from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { StyledEngineProvider } from '@mui/material/styles';
import { createTheme, ThemeProvider } from "@mui/material/styles";

import personsReducer from './store/personsReducer';
import focusedPersonReducer from './store/focusedPersonReducer';
import familyReducer from './store/familyReducer';
import familiesReducer from './store/familiesReducer';
import dialogsReducer from './store/dialogsReducer';
import runtimeReducer from './store/runtimeReducer';
import relationsReducer from './store/relationsReducer';
import RenderProvider from './components/RenderProvider';
import PedigreeRenderer from './components/PedegreeRenderer';
import { setFamilyContext, loadFamily } from './mylib/Connect';

import { setPersons } from './store/personsReducer';
import { setFamily } from './store/familyReducer';
import { setFamilies } from './store/familiesReducer';
import { setForeground, setBackground, setText, setHighlight } from './store/layoutReducer';
import { setRelations } from './store/relationsReducer';

import LoadFamily from './components/ui/LoadFamily';
import InfoDialog from './components/ui/InfoDialog';
import Intersector from './components/Intersector';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import layoutReducer from './store/layoutReducer';

const store = configureStore({ reducer: {
  persons: personsReducer,
  family: familyReducer,
  families: familiesReducer,
  config: dialogsReducer,
  focusedPerson: focusedPersonReducer,
  runtime: runtimeReducer,
  layout: layoutReducer,
  relations: relationsReducer,
}});

function App(props) {
  const {
    family = '',
    persons = null,
    families = null,
    relations = null, // TODO needed?
    familyFAB = false,
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
    if (family) {
      setFamilyContext(family);
      await store.dispatch(setFamily(family));

      if (!persons || !families || !relations) {
        const loadedData = await loadFamily();
        await store.dispatch(setPersons(loadedData.persons));
        await store.dispatch(setFamilies(loadedData.families));
        await store.dispatch(setRelations(loadedData.relations));
      } else {
        await store.dispatch(setPersons(persons));
        await store.dispatch(setFamilies(families));
        await store.dispatch(setRelations(relations));
      }
    }
  }, [family, persons, families, relations]);

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
          </RenderProvider>
          {familyFAB && <LoadFamily readonly={ readonly } /> }
          <InfoDialog readonly={ readonly } />
        </Provider>
      </StyledEngineProvider>
      </ThemeProvider>
    </LocalizationProvider>
  );
}

export default App;

//https://github.com/LearnWebCode/brads-boilerplate-wordpress/blob/main/brads-boilerplate-block-plugin/src/frontend.js
//https://www.youtube.com/watch?v=NKqogVcqDHA
