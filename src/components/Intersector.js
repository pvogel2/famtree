import { useState, useContext, useCallback, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { showPersonDialog } from './../store/dialogsReducer';
import { focusNode, defocusNode } from '../lib/nodes/utils';

import RenderContext from './RenderContext.js';
import Person from '../lib/Person';
import { setPerson, clearPerson } from '../store/focusedPersonReducer';
import { setPoint } from '../store/runtimeReducer';

function Intersector(props) {
  const { persons = [] } = props;
  const { renderer } = useContext(RenderContext);
  const [intersectedObj, setIntersectedObj] = useState(null);

  const findPerson  = useCallback((id) => persons.find((p) => p.id === id), [persons]);
  const dispatch = useDispatch();

  useEffect(() => {
    const intersectCallback = () => {
      const config = { edit: intersectedObj?.userData.id };
      dispatch(showPersonDialog(config));
    };

    if (intersectedObj) {
      renderer.registerEventCallback('click', intersectCallback);
      focusNode(intersectedObj);

      const focusedPerson = findPerson(intersectedObj.userData.id);
      if (focusedPerson) {
        dispatch(setPerson(focusedPerson.serialize()));
      }
    }

    return () => {
      if (intersectedObj) {
        defocusNode(intersectedObj);
        dispatch(clearPerson());
        renderer.unregisterEventCallback('click', intersectCallback);
      }
    };
   }, [renderer, intersectedObj, dispatch]);

  useEffect(() => {
    if (!renderer) return;

    const setIntersected = (event, intersected) => {
      if (intersected.length) {
        setIntersectedObj(intersected[0].object);

        const p = { move: { x: event.clientX, y: event.clientY } };
        dispatch(setPoint(p));

      } else if (!intersected.length) {
        setIntersectedObj(null);
      }
    };

    renderer.registerEventCallback('move', setIntersected);

    return () => {
      if (renderer) renderer.unregisterEventCallback('move', setIntersected);
    };
  }, [renderer]);

  return null;
};

function mapStateToProps(state) {
  const persons = state.persons.map((data) => new Person(data));
  return { persons };
}

export default connect(mapStateToProps)(Intersector);
