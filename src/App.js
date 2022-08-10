import React from 'react';
import { Vector3 } from 'three';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { StyledEngineProvider } from '@mui/material/styles';

import personsReducer from './store/personsReducer';
import focusedPersonReducer from './store/focusedPersonReducer';
import familyReducer from './store/familyReducer';
import dialogsReducer from './store/dialogsReducer';
import runtimeReducer from './store/runtimeReducer';
import RenderProvider from './components/RenderProvider';
import PedigreeRenderer from './components/PedegreeRenderer';

import LoadFamily from './components/ui/LoadFamily';
import InfoDialog from './components/ui/InfoDialog';
import Intersector from './components/Intersector';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const store = configureStore({ reducer: {
  persons: personsReducer,
  family: familyReducer,
  config: dialogsReducer,
  focusedPerson: focusedPersonReducer,
  runtime: runtimeReducer,
}});

function App() {
  const cameraPosition= new Vector3(30.0, 30.0, 30.0);
  const cameraTarget = new Vector3(0, 0, 0);

  return (
    <LocalizationProvider dateAdapter={ AdapterDateFns }>
      <StyledEngineProvider injectFirst>
        <Provider store={ store }>
          <RenderProvider
            position={ cameraPosition }
            target={ cameraTarget }
          >
            <PedigreeRenderer />
            <Intersector />
          </RenderProvider>
          <LoadFamily />
          <InfoDialog />
        </Provider>
      </StyledEngineProvider>
    </LocalizationProvider>
  );
}

export default App;

//https://github.com/LearnWebCode/brads-boilerplate-wordpress/blob/main/brads-boilerplate-block-plugin/src/frontend.js
//https://www.youtube.com/watch?v=NKqogVcqDHA
