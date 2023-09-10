import { createReduxStore } from '@wordpress/data';
import reducer from './reducer';
import * as actions from './actions';
import * as selectors from './selectors';

export default function(instanceId = 'famtree') {
  const store = createReduxStore( `${instanceId}/families`, {
    reducer,
    actions,
    selectors,
  });
  
  return store;
}
