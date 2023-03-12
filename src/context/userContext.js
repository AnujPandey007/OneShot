import React from 'react';
import { useContext, useEffect, useState } from 'react';

const UserContext = React.createContext()

export function useUser(){
    return useContext(UserContext)
}

export function UserProvider({children}) {

    const [userData, setUserData] = useState(JSON.parse(localStorage.getItem("userData")));

    const value = {
        userData,
        setUserData
    }

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("userData"));
        if(user){
          setUserData(user);
          // console.log("user data fetched");
        }
        // eslint-disable-next-line 
    }, [localStorage.getItem("userData")]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}
