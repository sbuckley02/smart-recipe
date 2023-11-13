import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from 'react';
import Home from './components/Home';
import DietTracker from './components/DietTracker';
import Recommendations from './components/Recommendations';
import Profile from './components/Profile';
import Login from './components/Login';
import Logout from './components/Logout';
import CreateAccount from './components/CreateAccount';
import useToken from './components/partials/useToken';

function App() {
  const { token, removeToken, setToken } = useToken();
  const [email, setEmail] = useState(null);

  return (
    <div className="App">
      <header className="App-header">
        <BrowserRouter>
          {!token && token!=="" &&token!== undefined ?
            <Routes>
              <Route path="/create-account" index element={<CreateAccount setToken={setToken} setEmail={setEmail} />} />
              <Route path="*" element={<Login setToken={setToken} setEmail={setEmail} />} />
            </Routes>
              
          : (
            <Routes>
              <Route path="/" index element={<Home />} />
              <Route path="/diet-tracker" element={<DietTracker />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/profile" element={<Profile email={email}/>} />
              <Route path="/logout" element={<Logout removeToken={removeToken}/>} />
              <Route path="*" element={<Home />} />
            </Routes>
          )}
        </BrowserRouter>
      </header>
    </div>
  );
}

export default App;
