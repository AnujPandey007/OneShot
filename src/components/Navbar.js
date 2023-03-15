import React from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { useAuth } from "../context/authContext"

export default function Navbar({isAuth, setIsAuth}) {

  let navigate = useNavigate();
  const { logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
      localStorage.clear();
      setIsAuth(false);
      navigate("/login")
    } catch(e) {
      console.log(e);
    }
  }

  return (
    
    <nav className="bg-white border-gray-200 px-2 sm:px-4 py-2.5 rounded">
        <div className="container flex flex-wrap items-center justify-between mx-auto">
            <Link to="/" className="flex items-center">
                <img src="https://media.licdn.com/dms/image/C4D0BAQHhJ_TEVwqDwA/company-logo_200_200/0/1630397378021?e=1686787200&v=beta&t=gL44LU_HPbJV_guAs_CqVTy5ujWiKackwpD32DiGDi0" className="h-6 mr-3 sm:h-9" alt="Flowbite Logo" />
                <span className="self-center text-xl font-semibold whitespace-nowrap">OneShot</span>
            </Link>

            <div className="block w-auto" id="navbar-default">
              <ul className='flex flex-row p-10 text-sm font-medium bg-white'>
                {isAuth && <li>
                  <Link to="/" className="block py-2 px-6 bg-white text-black" aria-current="page">Home</Link>
                </li>}
                {isAuth && <li>
                  <Link onClick={handleLogout} className="block py-2 text-gray-400 hover:text-black">Logout</Link>
                </li>}
              </ul>
            </div>

        </div>
    </nav>

  );
}
