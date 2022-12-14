import React, { useEffect, useState, createContext } from 'react';
import Navbar from './components-supabase/Navbar';
import Sidebar from './components-supabase/Sidebar';
import Chatbox from './components-supabase/Chatbox';
import ContentContainer from './components-supabase/ContentContainer';
import Auth from './Auth';
import { supabase } from '@/shared/api/supabase/supabaseClient';
import { client } from '@/shared/api/initClient_tenant';
import { LineChart } from './components-supabase/contents/patient/SingleLineChart';
import { AiOutlineDown } from 'react-icons/ai';
import {Provider} from 'jotai'
// export const AppContext = createContext();
function App() {
  const [isChart, setIsChart] = useState([false, 'all']);
  const [location, setLocation] = useState('Dashboard');
  const [session, setSession] = useState(null);

  let chartStyle = isChart[0] ? 'opacity-100 z-1' : 'opacity-0 p-0 -z-10';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  console.log('app props.setIsChart');
  console.log(setIsChart);
  return (
    // <AppContext.Provider value={{ session, setSession }}>
    <>
      {!session ? (
        <Auth />
      ) : (
        <div className="flex h-screen w-screen flex-auto bg-auto-white">
          <Sidebar setLocation={setLocation} />
          <div className="relative flex flex-grow flex-col">
            <Navbar setLocation={setLocation} location={location} session={session} />

            <main className="flex h-[90%] w-[100%] flex-auto">
              <Provider>
              <ContentContainer  setIsChart={setIsChart} session={session} />
                    </Provider>

              <div className="ml-auto flex w-[25%] flex-col items-center justify-start overflow-y-scroll bg-auto-white shadow-lg">
                <Chatbox />
              </div>
            </main>

            <div
              className={`${chartStyle} transition-full absolute bottom-0 left-[3rem] h-[35rem] w-[61rem] rounded bg-auto-white p-4 shadow-2xl ring-2 ring-black duration-300`}
            >
              <div className="flex w-[100%] items-center justify-start">
                <button
                  onClick={() => {
                    setIsChart([false, 'all']);
                  }}
                  className="rounded p-2 font-bold"
                >
                  <AiOutlineDown
                    className="hover:text-gray-300"
                    color="black"
                    size={30}
                  />
                </button>
                <span className="text-large font-extrabold tracking-wider text-gray-600">
                  Line Chart
                </span>
                <div className="ml-auto flex divide-x-2 divide-gray-500 rounded-lg bg-gray-300">
                  <button
                    onClick={() => setIsChart([true, 'all'])}
                    className="flex items-center justify-center rounded-l-lg px-8 py-2 tracking-wide text-gray-500 hover:bg-gray-400"
                  >
                    All
                  </button>
                  <button
                    onClick={() => setIsChart([true, 'Temperature'])}
                    className="flex items-center justify-center px-8 py-2 tracking-wide text-gray-500 hover:bg-gray-400"
                  >
                    Temperature
                  </button>
                  <button
                    onClick={() => setIsChart([true, 'SpO2'])}
                    className="flex items-center justify-center px-8 py-2 tracking-wide text-gray-500 hover:bg-gray-400"
                  >
                    SpO2
                  </button>
                  <button
                    onClick={() => setIsChart([true, 'HeartRate'])}
                    className="flex items-center justify-center rounded-r-lg px-8 py-2 tracking-wide text-gray-500 hover:bg-gray-400"
                  >
                    Heart rate
                  </button>
                </div>
              </div>
              <div className="relative h-[80%] w-[100%]">
                <LineChart isChart={isChart} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
    // </AppContext.Provider>
  );
}

export default App;
