import React from 'react';
import { useEffect } from 'react';
import { Vector3 } from 'three';
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
import RenderProvider from './components/RenderProvider';
import PedigreeRenderer from './components/PedegreeRenderer';
import { setFamilyContext, loadFamily } from './lib/Connect';

import { setPersons } from './store/personsReducer';
import { setFamily } from './store/familyReducer';
import { setFamilies } from './store/familiesReducer';
import { setForeground, setBackground, setText } from './store/layoutReducer';

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
}});

function App(props) {
  const {
    family = '',
    persons = null,
    families = null,
    familyFAB = false,
    readonly = false,
    text,
    background,
    foreground,
  } = props;

  const cameraPosition= new Vector3(30.0, 30.0, 30.0);
  const cameraTarget = new Vector3(0, 0, 0);

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

      if (!persons || !families) {
        const loadedData = await loadFamily();
        await store.dispatch(setPersons(loadedData.persons));
        await store.dispatch(setFamilies(loadedData.families));
      } else {
        await store.dispatch(setPersons(persons));
        await store.dispatch(setFamilies(families));
      }
    }
  }, [family, persons, families]);

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
