import { useState, useContext, useCallback, useEffect } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Vector3 } from 'three';
import { focusNode, defocusNode, getRootNode, isValidNode, isPersonNode, isMetaResourceNode } from '../lib/nodes/utils';

import RenderContext from './RenderContext.js';
import Person from '../lib/Person';
import { setPerson as setFocusedPerson, clearPerson as clearFocusedPerson } from '../store/focusedPersonReducer';
import { setSelectedMeta, setMetadata, setPerson as setSelectedPerson } from '../store/selectedPersonReducer';
import { setPoint } from '../store/runtimeReducer';
import { loadMetadata } from './../mylib/Connect.js';

const getForeground = (state) => state.layout.foreground;
const getHighlight = (state) => state.layout.highlight;
const getSelectedPerson = (state) => state.selectedPerson.person;
  
function Intersector(props) {
  const { persons = [] } = props;
  const { renderer } = useContext(RenderContext);

  const [intersectedObj, setIntersectedObj] = useState(null);

  const findPerson  = useCallback((id) => persons.find((p) => p.id === id), [persons]);
  const dispatch = useDispatch();
  const foreground = useSelector(getForeground);
  const highlight = useSelector(getHighlight);
  const selectedPerson = useSelector(getSelectedPerson);
  
  useEffect(() => {
    const rootNode = getRootNode(intersectedObj);
    const currentPerson = findPerson(rootNode?.userData?.refId);

    let isSelected = currentPerson?.id === selectedPerson?.id;
    const selectFocusedPerson = () => {
      const targetPosition = new Vector3();
      intersectedObj.getWorldPosition(targetPosition);
      const cameraPosition = targetPosition.clone();
      cameraPosition.add(new Vector3(10, 0, 0));
      renderer.transition(targetPosition, 1, cameraPosition);
      renderer.unregisterEventCallback('click', selectFocusedPerson);

      if (currentPerson) {
        dispatch(clearFocusedPerson());
        dispatch(setSelectedPerson(currentPerson.serialize()));

        isSelected = true;

        async function loadCurrentMetadata() {
          const metadata = await loadMetadata(currentPerson.id);
          dispatch(setMetadata([...metadata]));
        };
        loadCurrentMetadata();

      }
    };

    const selectFocusedMetaResource = () => {
      renderer.unregisterEventCallback('click', selectFocusedMetaResource);
      dispatch(setSelectedMeta(intersectedObj.userData.refId));
    };

    if (isPersonNode(intersectedObj) && !isSelected) {
      renderer.registerEventCallback('click', selectFocusedPerson);
      focusNode(intersectedObj, { highlight });

      if (currentPerson) {
        dispatch(setFocusedPerson(currentPerson.serialize()));
      }
    }

    if (isMetaResourceNode(intersectedObj)) {
      renderer.registerEventCallback('click', selectFocusedMetaResource);
      focusNode(intersectedObj, { scale: 1.2 });

      if (currentPerson) {
        dispatch(setFocusedPerson(currentPerson.serialize()));
      }
    }

    return () => {
      if (isPersonNode(intersectedObj) && !isSelected) {
        defocusNode(intersectedObj, { foreground });
        dispatch(clearFocusedPerson());
        renderer.unregisterEventCallback('click', selectFocusedPerson);
      }

      if (isMetaResourceNode(intersectedObj)) {
        defocusNode(intersectedObj);
        renderer.unregisterEventCallback('click', selectFocusedMetaResource);
      }
    };
   }, [renderer, intersectedObj, dispatch, foreground, highlight, selectedPerson]);

  useEffect(() => {
    if (!renderer) return;

    const setIntersected = (event, intersected) => {

      if (intersected.length) {
        const maybeObj = intersected[0].object;
        if (intersectedObj?.uuid !== maybeObj.uuid && isValidNode(maybeObj)) {
          setIntersectedObj(maybeObj);
        }

        const p = { x: event.clientX, y: event.clientY };
        dispatch(setPoint(p));

      } else if (intersectedObj && !intersected.length) {
        setIntersectedObj(null);
      }
    };

    renderer.registerEventCallback('move', setIntersected);

    return () => {
      if (renderer) renderer.unregisterEventCallback('move', setIntersected);
    };
  }, [renderer, intersectedObj]);

  return null;
};

function mapStateToProps(state) {
  const persons = state.persons.map((data) => new Person(data));
  return { persons };
}

export default connect(mapStateToProps)(Intersector);
