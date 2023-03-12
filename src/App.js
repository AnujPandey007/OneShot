import React from 'react'
import {BrowserRouter as Router,Routes,Route} from "react-router-dom";
import Navbar from "./components/Navbar";
import {UserProvider} from './context/userContext';
import { AuthProvider } from './context/authContext';
import Home from "./pages/Home";
import Login from './pages/Login';
import AddPost from './pages/AddPost';
import GetPost from './pages/GetPost';
import Alert from './components/Alert';

function App() {

  const [customAlert, setCustomAlert] =  React.useState(null);

  const [isAuth, setIsAuth] = React.useState(localStorage.getItem("isAuth")??false);

  const setAlert=(message, type)=>{
    let alertObject = {
      message: message,
      type: type
    }
    setCustomAlert(alertObject);

    setTimeout(() => {
      setCustomAlert(null)
    }, 2000);
  }

  return (
    <AuthProvider>
      <UserProvider>
        <Router>
          <Navbar isAuth={isAuth} setIsAuth={setIsAuth}/>
          <Alert customAlert={customAlert}/>
          <Routes>
            <Route path="/login" element={<Login isAuth={isAuth} setIsAuth={setIsAuth} setAlert={setAlert}/>}></Route>
            <Route path="/" element={<Home isAuth={isAuth} />}></Route>
            <Route path="/addpost" element={<AddPost isAuth={isAuth} setAlert={setAlert}/>}></Route>
            <Route path="/getpost/:id" element={<GetPost isAuth={isAuth} setAlert={setAlert}/>}></Route>
          </Routes>
        </Router>
      </UserProvider> 
    </AuthProvider>
  );
}

export default App;
