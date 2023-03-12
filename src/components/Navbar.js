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
    <nav className="bg-white border-gray-200 px-2 sm:px-4 py-2.5 rounded dark:bg-gray-900">
        <div className="container flex flex-wrap items-center justify-between mx-auto">
            <Link to="/" className="flex items-center">
                <img src="https://media.licdn.com/dms/image/C4D0BAQHhJ_TEVwqDwA/company-logo_200_200/0/1630397378021?e=1686787200&v=beta&t=gL44LU_HPbJV_guAs_CqVTy5ujWiKackwpD32DiGDi0" className="h-6 mr-3 sm:h-9" alt="Flowbite Logo" />
                <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">OneShot</span>
            </Link>
            <button data-collapse-toggle="navbar-default" type="button" className="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-default" aria-expanded="false">
            <span className="sr-only">Open main menu</span>
            <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
            </button>
            <div className="hidden w-full md:block md:w-auto" id="navbar-default">
            <ul className="flex flex-col p-4 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                {isAuth && <li>
                <Link to="/" className="block py-2 pl-3 pr-4 text-white bg-black rounded md:bg-transparent md:text-black md:p-0 dark:text-white" aria-current="page">Home</Link>
                </li>}
                {isAuth&&<li>
                <Link onClick={handleLogout} className="block py-2 pl-3 pr-4 text-gray-400 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-black md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Logout</Link>
                </li>}
            </ul>
            </div>
        </div>
    </nav>

  );
}
