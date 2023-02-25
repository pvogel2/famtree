import { useState, useContext, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { focusNode, defocusNode, getRootNode, isValidNode, isPersonNode, isMetaResourceNode, isNavigationNode } from '../lib/nodes/utils';

import RenderContext from './RenderContext.js';
import Person from '../lib/Person';
import { setPerson as setFocusedPerson, clearPerson as clearFocusedPerson } from '../store/focusedPersonReducer';
import { setSelectedMeta, setPerson as setSelectedPerson } from '../store/selectedPersonReducer';
import { setPoint } from '../store/runtimeReducer';

const getForeground = (state) => state.layout.foreground;
const getHighlight = (state) => state.layout.highlight;
const getSelectedPerson = (state) => state.selectedPerson.person;
const getPersons = (state) => state.persons;

function Intersector(_props) {
  const { renderer } = useContext(RenderContext);

  const [intersectedObj, setIntersectedObj] = useState(null);

  const persons = useSelector(getPersons);
  const foreground = useSelector(getForeground);
  const highlight = useSelector(getHighlight);
  const selectedPerson = useSelector(getSelectedPerson);

  const findPerson  = useCallback((id) => persons.find((p) => p.id === id), [persons]);
  const dispatch = useDispatch();

  useEffect(() => {
    const rootNode = getRootNode(intersectedObj);
    const currentPerson = findPerson(rootNode?.userData?.refId);
    const defaultOpacity = intersectedObj?.material?.opacity;

    let isSelected = currentPerson?.id === selectedPerson?.id;
    const selectFocusedPerson = () => {
      renderer.unregisterEventCallback('click', selectFocusedPerson);

      if (currentPerson) {
        dispatch(clearFocusedPerson());
        dispatch(setSelectedPerson(new Person(currentPerson).serialize()));

        isSelected = true;
      }
    };

    const selectFocusedMetaResource = () => {
      renderer.unregisterEventCallback('click', selectFocusedMetaResource);
      dispatch(setSelectedMeta(intersectedObj.userData.refId));
    };

    const onNavigationClick = () => {
      const targetPerson = findPerson(intersectedObj.userData?.refId);
      dispatch(setSelectedPerson(new Person(targetPerson).serialize()));

      renderer.parent.style.cursor = 'default';
      renderer.unregisterEventCallback('click', onNavigationClick);
    };

    if (isPersonNode(intersectedObj) && !isSelected) {
      renderer.registerEventCallback('click', selectFocusedPerson);
      focusNode(intersectedObj, { highlight, renderer });

      if (currentPerson) {
        dispatch(setFocusedPerson(new Person(currentPerson).serialize()));
      }
    }

    if (isMetaResourceNode(intersectedObj)) {
      renderer.registerEventCallback('click', selectFocusedMetaResource);
      focusNode(intersectedObj, { scale: 1.2, renderer });

      if (currentPerson) {
        dispatch(setFocusedPerson(new Person(currentPerson).serialize()));
      }
    }

    if (isNavigationNode(intersectedObj)) {
      renderer.parent.style.cursor = 'pointer';
      renderer.registerEventCallback('click', onNavigationClick);
    }

    return () => {
      if (isPersonNode(intersectedObj) && !isSelected) {
        defocusNode(intersectedObj, { foreground, renderer });
        dispatch(clearFocusedPerson());
        renderer.unregisterEventCallback('click', selectFocusedPerson);
      }

      if (isMetaResourceNode(intersectedObj)) {
        defocusNode(intersectedObj, { renderer, opacity: defaultOpacity });
        renderer.unregisterEventCallback('click', selectFocusedMetaResource);
      }

      if (isNavigationNode(intersectedObj)) {
        renderer.parent.style.cursor = 'default';
        renderer.unregisterEventCallback('click', onNavigationClick);
      }
    };
   }, [renderer, intersectedObj, dispatch, foreground, highlight, selectedPerson, findPerson]);

  useEffect(() => {
    if (!renderer) return;

    const setIntersected = (event, intersected) => {
      if (intersected?.length) {
        const maybeObj = intersected[0].object;
        if (intersectedObj?.uuid !== maybeObj.uuid && isValidNode(maybeObj)) {
          setIntersectedObj(maybeObj);
        }

        const p = { x: event.clientX, y: event.clientY };
        dispatch(setPoint(p));

      } else if (intersectedObj && !intersected?.length) {
        setIntersectedObj(null);
      }
    };
    renderer.registerEventCallback('move', setIntersected);
    renderer.registerEventCallback('click', setIntersected);

    return () => {
      renderer.unregisterEventCallback('move', setIntersected);
      renderer.unregisterEventCallback('click', setIntersected);
    };
  }, [renderer, setIntersectedObj, intersectedObj]);

  return null;
};

export default Intersector;
