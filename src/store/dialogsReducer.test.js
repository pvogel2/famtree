import dialogsReducer, { showPersonDialog, hidePersonDialog } from './dialogsReducer';

const defaultConfig = { edit: null };
const editConfig = { edit: 'p0' };

it('should return the initial state', () => {
  expect(dialogsReducer(undefined, {})).toEqual(expect.objectContaining(defaultConfig));
});

it('configures the persons dialog to defaults', () => {
  const previeousState = defaultConfig;
  const emptyDialogConfig = { ...defaultConfig, edit: '' };

  expect(dialogsReducer(previeousState, showPersonDialog())).toEqual(expect.objectContaining(emptyDialogConfig));
});

it('configures the persons dialog to config', () => {
  const previeousState = defaultConfig;
  const updatedConfig = { ...defaultConfig, ...editConfig };
  expect(dialogsReducer(previeousState, showPersonDialog(editConfig))).toEqual(updatedConfig);
});

it('resets the config', () => {
  const previeousState = { ...defaultConfig, ...editConfig };
  expect(dialogsReducer(previeousState, hidePersonDialog())).toEqual(expect.objectContaining(defaultConfig));
});
