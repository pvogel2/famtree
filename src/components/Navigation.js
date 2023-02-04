import { useSelector } from 'react-redux';


const getFocusedPerson = (state) => state.focusedPerson;

function Navigation() {
  const focusedPerson = useSelector(getFocusedPerson);

  if (focusedPerson) {
    return <div>navi</div>;
  }
  return null;
}

export default Navigation;
