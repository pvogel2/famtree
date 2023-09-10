import { useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { isValidId } from '../lib/nodes/utils';

function KeyboardNavigation(props) {
  const { upId, downId, leftId, rightId } = props;

  const persons = useSelect((select) => select( 'famtree/families' ).getPersons(), []);
  const { setSelected } = useDispatch('famtree/families');

  useEffect(() => {
    if (!isValidId(upId) && !isValidId(downId) && !isValidId(leftId) && !isValidId(rightId)) return;

    function setNewSelection(id) {
      const target = persons.find((p) => {
        return p.id === id;
      });
      if (target) {
        setSelected(target);
      }
    }

    const callback = (ev) => {
      if ((ev.ctrlKey && ev.code === 'ArrowUp') || ev.code === 'KeyW') {
        setNewSelection(upId);
      } else if ((ev.ctrlKey && ev.code === 'ArrowDown') || ev.code === 'KeyS') {
        setNewSelection(downId);
      } else if ((ev.ctrlKey && ev.code === 'ArrowLeft') || ev.code === 'KeyA') {
        setNewSelection(leftId);
      } else if ((ev.ctrlKey && ev.code === 'ArrowRight') || ev.code === 'KeyD') {
        setNewSelection(rightId);
      }
    };

    document.addEventListener('keydown', callback);

    return () => {
      document.removeEventListener('keydown', callback);
    };
  }, [upId, downId, leftId, rightId, persons]);

  return null;
}

export default KeyboardNavigation;
