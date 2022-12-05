import React from 'react';
import { useRef, useState, useEffect } from 'react';
import { useContext } from 'react';
// import { AppContext } from '../App';
import { supabase } from '@/shared/api/supabase/supabaseClient';
import { GrSchedulePlay } from 'react-icons/gr';
import { BiMessageSquareDots } from 'react-icons/bi';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { InfinitySpin } from 'react-loader-spinner';
// import {useLocation} from 'react-router-dom'

const Navbar = (props) => {
  // const { session } = useContext(AppContext);
  const [username, setUsername] = useState('');
  const { avatar_url, setAvatarUrl } = useState('');
  const [isOpen, setDropDown] = useState(false);
  const [title, setTitle] = useState('Dashboard');
  // const location = useLocation();
  // switch(location.pathname){
  //   case '/pages/dashboard/doctor/facilities':
  //     setTitle('Facilities')
  //     break;
  //   case '/pages/dashboard/doctor/nurses':
  //     setTitle('Nurses')
  //     break;
  //   case '/pages/dashboard/doctor/devices':
  //     setTitle('Devices')
  //     break;
  //   case '/pages/dashboard/doctor/schedules':
  //     setTitle('Schedules')
  //     break;
  //   case '/pages/dashboard/doctor/notifs':
  //     setTitle('Notifications')
  //     break;
  //   default:
  //     setTitle('Dashboard')
  // }


  // const { user } = session;
  // console.log(session);
  // const getProfile = async () => {
  //   let { data } = await supabase
  //     .from('profiles')
  //     .select(`Email`)
  //     .eq('id', user.id)
  //     .single();
  //   if (data) {
  //     setUsername(data.Email);
  //   }
  // };
  useEffect(() => {}, []);
  return (
    <nav className="flex h-[10%] w-[100%] items-center justify-between bg-auto-white p-8 shadow-sm">
      <div className="p-4 text-center text-[28px] font-extrabold tracking-[5px] text-blue-600">
        {props.location}
      </div>
      <div className="relative flex items-center justify-center gap-4 p-4 text-[22px]">
        <button>
          <GrSchedulePlay />
        </button>
        <button>
          <BiMessageSquareDots />
        </button>
        <button>
          <IoMdNotificationsOutline />
        </button>
        <span className="flex items-center justify-center rounded-2xl p-2 text-[18px] ring-2 ring-cyan-100">
          {/* {user.email} */}
        </span>
        <button
          onClick={(e) => {
            setDropDown((state) => !state);
            e.stopPropagation();
          }}
        >
          {avatar_url ? (
            <img
              className="ml-2 inline-block h-8 w-8 rounded-full bg-auto-black ring-2 ring-cyan-100 hover:opacity-70"
              alt=""
              src={avatar_url}
            ></img>
          ) : (
            <InfinitySpin width="100" color="#475569" />
          )}
        </button>
        {isOpen && <DropDownMenu />}
      </div>
    </nav>
  );
};

export const DropDownMenu = (props) => {
  return (
    <div
      className={`w-[13rem] p-4 absolute top-[4rem] right-[2rem] z-20 origin-top-right rounded-lg bg-black text-white shadow-lg ring-2 ring-white ring-opacity-100`}
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="menu-button"
      tabIndex={-1}
    >
      <div className="py-1" role="none">
        <a
          className="block w-full px-4 py-2 text-left text-sm  hover:bg-slate-200 hover:text-black"
          href="/pages/dashboard/doctor/account"
        >
          Profile
        </a>
        <a
          className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-200 hover:text-black"
          href="#"
        >
          Account Settings
        </a>
        <a
          className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-200 hover:text-black"
          href="#"
        >
          Support
        </a>

        <button
          type="button"
          className="block w-full border-t-2 border-gray-100 px-4 py-2 text-left text-sm hover:bg-slate-200 hover:text-black"
          role="menuitem"
          tabIndex={-1}
          id="menu-item-3"
          onClick={async () => {
            let { error } = await supabase.auth.signOut();
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
};
export default Navbar;
// const menuRef = useRef();
// const closeOpenMenus = (e)=> {
//   if (isOpen && !menuRef.current.contains(e.target)) {
//     setDropDown(false);
//   }
// };
// useEffect(() => {
//   if (typeof window !== "undefined") {
//     window.addEventListener("mousedown", (e) => closeOpenMenus(e));
//   }
//   return () => {
//     if (typeof window !== "undefined") {
//       window.removeEventListener("mousedown", (e) => closeOpenMenus(e));
//     }
//   };
// }, []);