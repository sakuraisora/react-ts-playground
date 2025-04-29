import './App.css'
import DebounceSearch from './components/debounce-search/DebounceSearch';
import Toast from './components/toast/Toast';

const App = () => {

  return (
    <div className="flex justify-center">
      {/* <DebounceSearch /> */}
      <Toast />
    </div>
  );
};

export default App;
