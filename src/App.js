import { useEffect, useMemo } from '@wordpress/element';
import { StyledEngineProvider } from '@mui/material/styles';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { RegistryProvider, createRegistry } from '@wordpress/data';

import RenderProvider from './components/RenderProvider';
import FamTreeRenderer from './components/FamTreeRenderer';

import registerFamiliesStore from './store/families';
import registerRuntimeStore from './store/runtime';

import { loadFamily } from './lib/Connect';

import LoadFamily from './components/ui/LoadFamily';
import InfoDialog from './components/ui/InfoDialog';
import DetailsDialog from './components/ui/DetailsDialog';
import Intersector from './components/Intersector';
import PersonSelector from './components/PersonSelector';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

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
    selection,
    instanceId ='famtree0',
  } = props;

  const registry = useMemo(() => {
    const r = createRegistry( {} );
    r.register(registerFamiliesStore());
    r.register(registerRuntimeStore());
    return r;
  }, []);

  const { setPersons, setFamilies, setFounder, setRelations } = registry.dispatch('famtree/families');
  const { setForeground, setBackground, setText, setHighlight, setSelection } = registry.dispatch('famtree/runtime');

  const theme = createTheme({
    palette: {
      primary: {
        main: foreground,
        contrastText: '#ffffff',
      },
    },
  });

  useEffect(() => {
    async function switchFounder() {
      if (founder) {
        await setFounder(founder);

        async function updateData(data) {
          const founders = data.persons.filter((p) => p.root).map((p) => p.id);
          registry.batch(async () => {
            await setPersons(data.persons);
            await setRelations(data.relations);
            await setFamilies(founders);
          });
        }

        if (!persons || !relations) {
          const loadedData = await loadFamily();
          await updateData(loadedData);
        } else {
          await updateData({ persons, relations });
        }
      }
    };
    switchFounder();
  }, [founder, persons, families, relations]);

  useEffect(() => {
    if (foreground) {
      setForeground(foreground);
    }
  }, [foreground]);

  useEffect(() => {
    if (background) {
      setBackground(background);
    }
  }, [background]);

  useEffect(() => {
    if (text) {
      setText(text);
    }
  }, [text]);

  useEffect(() => {
    if (highlight) {
      setHighlight(highlight);
    }
  }, [highlight]);

  useEffect(() => {
    if (selection) {
      setSelection(selection);
    }
  }, [selection]);

  return (
    <LocalizationProvider dateAdapter={ AdapterDateFns }>
      <ThemeProvider theme={theme}>
      <StyledEngineProvider injectFirst>
        <RegistryProvider value={ registry}>
          <RenderProvider instanceId={ instanceId }>
            <FamTreeRenderer />
            <Intersector />
            <PersonSelector />
            { founderFAB && <LoadFamily readonly={ readonly } instanceId={ instanceId } /> }
            { !readonly && <InfoDialog /> }
            { !readonly && <DetailsDialog /> }
          </RenderProvider>
        </RegistryProvider>
      </StyledEngineProvider>
      </ThemeProvider>
    </LocalizationProvider>
  );
}

export default App;

//https://github.com/LearnWebCode/brads-boilerplate-wordpress/blob/main/brads-boilerplate-block-plugin/src/frontend.js
//https://www.youtube.com/watch?v=NKqogVcqDHA
