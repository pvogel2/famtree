import { useRef } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { Card, CardContent } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';

import ExtendedDialogTitle from './ExtendedDialogTitle';
import PersonDetails from './PersonDetails';
import Person from '../../lib/Person';

function InfoDialog() {
  const position = useSelect((select) => select('famtree/runtime').getPoint());

  const { focusedPerson, selectedPerson } = useSelect((select) => {
    const store = select('famtree/families');
    return {
      focusedPerson: store.getFocused(),
      selectedPerson: store.getSelected(),
    };
  }, []);

  const elementRef = useRef(null);

  if (selectedPerson || !focusedPerson || !elementRef) {
    return null;
  }

   const currentPerson = new Person(focusedPerson);

  const pointOffset = 30;
  const currentWidth = elementRef.current?.clientWidth;
  const currentHeight = elementRef.current?.clientHeight;

  const rect = elementRef.current?.offsetParent.getBoundingClientRect();

  const deltaX = rect?.left || 0;
  const deltaY = rect?.top || 0;  
  const styles = {
    left: position?.x + pointOffset - deltaX || 20,
    top: position?.y + pointOffset - deltaY || 50,
  };

  if (window.innerWidth < (styles.left + currentWidth)) {
    styles.right = pointOffset;
    delete styles.left;
  }

  if (window.innerHeight < (styles.top + currentHeight)) {
    styles.bottom = pointOffset;
    delete styles.top;
  }

  return <Card
    qa="info-dialog"
    sx={{
      position: 'absolute',
      opacity: rect ? 0.9 : 0,
      ...styles,
    }}
    ref={ elementRef }
  >
    <ExtendedDialogTitle
      title={ currentPerson.name }
      portrait={ currentPerson.portraitUrl }
      icon={ <PersonIcon /> }
    />
      <PersonDetails person={ currentPerson } component={ CardContent } />
  </Card>
}

export default InfoDialog;
