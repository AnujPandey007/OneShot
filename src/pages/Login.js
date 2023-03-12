import React from "react"
import { useAuth } from "../context/authContext"
import { useNavigate } from "react-router-dom"
import { useUser } from '../context/userContext';
import { auth } from '../config/firebaseConfig';

export default function Login({isAuth, setIsAuth, setAlert}) {
  const { loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();
  const {setUserData} = useUser();

  React.useEffect(() => {
    if(isAuth){
      navigate('/');
    }
 }, [isAuth, navigate]);

  async function signInWithGoogle(){
    try{
      setIsLoading(true);
      await loginWithGoogle();
      await addUserDataToDb();
      navigate("/");
    }catch(e){
      setAlert("Failed to log in", "danger");
      console.log(e);
    }
    
  }

  const addUserDataToDb = async()=> {
    const blogApi="http://localhost:3000/auth/register";

    const jsonData={ 
      "userName": auth.currentUser.displayName,
      "userEmail": auth.currentUser.email,
      "userPriority": 1,
      "userImage": auth.currentUser.photoURL,
    }
    
    const requestOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(jsonData)
    };
    
    const authData = await fetch(blogApi, requestOptions);
    let jsonAuthData = await authData.json();
    // console.log(jsonAuthData); 
    localStorage.setItem("isAuth", true);
    localStorage.setItem("userData", JSON.stringify(jsonAuthData));
    setIsAuth(true);
    setUserData(JSON.stringify(jsonAuthData));
  }

  if(isLoading){
    return ( <div className='text-center'>
        <div className="spinner-border" role="status">
          <span className="sr-only"></span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="container py-10 px-10 mx-0 min-w-full flex flex-col items-center">
        <button type="button" onClick={signInWithGoogle} className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 mr-2 mb-2">
          <svg className="w-4 h-4 mr-2 -ml-1" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
          Sign in with Google
        </button>
      </div>
    </div>
  )
}
