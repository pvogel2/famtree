import { useState, useContext, useCallback, useEffect } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import { focusNode, defocusNode, getRootNode, isValidNode, isPersonNode, isMetaResourceNode, isNavigationNode } from '../lib/nodes/utils';

import RenderContext from './RenderContext.js';
import Person from '../lib/Person';


function Intersector() {
  const { renderer } = useContext(RenderContext);

  const [intersectedObj, setIntersectedObj] = useState(null);

  const { persons, selected } = useSelect(
    (select) => {
      const store = select( 'famtree/families' );
      return {
        persons: store.getPersons(),
        selected: store.getSelected(),
      };
    },
  );

  const { foreground, highlight } = useSelect(
    (select) => {
      const store = select( 'famtree/runtime' );
      return {
        foreground: store.getForeground(),
        highlight: store.getHighlight(),
      };
    },
  );

  const findPerson  = useCallback((id) => persons.find((p) => p.id === id), [persons]);

  const { setPoint } = useDispatch('famtree/runtime');
  const { setFocused, setSelected, setSelectedMeta } = useDispatch('famtree/families');

  useEffect(() => {
    const rootNode = getRootNode(intersectedObj);
    const currentPerson = findPerson(rootNode?.userData?.refId);
    const defaultOpacity = intersectedObj?.material?.opacity;

    let isSelected = currentPerson?.id === selected?.id;
    const selectFocusedPerson = () => {
      renderer.unregisterEventCallback('click', selectFocusedPerson);

      if (currentPerson) {
        setFocused();
        setSelected(new Person(currentPerson).serialize());
    
        isSelected = true;
      }
    };

    const selectFocusedMetaResource = () => {
      renderer.unregisterEventCallback('click', selectFocusedMetaResource);
      setSelectedMeta(intersectedObj.userData.refId);
    };

    const onNavigationClick = () => {
      const targetPerson = findPerson(intersectedObj.userData?.refId);
      setSelected(new Person(targetPerson).serialize());

      renderer.parent.style.cursor = 'default';
      renderer.unregisterEventCallback('click', onNavigationClick);
    };

    if (isPersonNode(intersectedObj) && !isSelected) {
      renderer.registerEventCallback('click', selectFocusedPerson);
      focusNode(intersectedObj, { highlight, renderer });

      if (currentPerson) {
        setFocused(new Person(currentPerson).serialize());
      }
    }

    if (isMetaResourceNode(intersectedObj)) {
      renderer.registerEventCallback('click', selectFocusedMetaResource);
      focusNode(intersectedObj, { scale: 1.2, renderer });

      if (currentPerson) {
        setFocused(new Person(currentPerson).serialize());
      }
    }

    if (isNavigationNode(intersectedObj)) {
      renderer.parent.style.cursor = 'pointer';
      renderer.registerEventCallback('click', onNavigationClick);
    }

    return () => {
      if (isPersonNode(intersectedObj) && !isSelected) {
        defocusNode(intersectedObj, { foreground, renderer });
        setFocused();
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
   }, [renderer, intersectedObj, foreground, highlight, selected, findPerson, setFocused, setSelected]);

  useEffect(() => {
    if (!renderer) return;

    const setIntersected = (event, intersected) => {
      if (intersected?.length) {
        const maybeObj = intersected[0].object;
        if (intersectedObj?.uuid !== maybeObj.uuid && isValidNode(maybeObj)) {
          setIntersectedObj(maybeObj);
        }

        const p = { x: event.clientX, y: event.clientY };
        setPoint(p);

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
