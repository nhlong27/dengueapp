import React, { useState, useEffect } from 'react';
import MainContentCard from './MainContentCard';
import { InfinitySpin } from 'react-loader-spinner';
import { supabase } from '@/shared/api/supabase/supabaseClient';
import { StatisticsCard } from './MainContentCard2';

let loadFacility = {};

const MainContent = (props) => {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [isOpen, setOpen] = useState(false);
  const [isRoom, setIsRoom] = useState({});
  const handleLoad = async () => {
    try {
      loadFacility = {};
      setLoading(true);
      let { data: ROOM, error } = await supabase.from('ROOM').select('*');
      if (error) throw error;
      for (let room of ROOM) {
        loadFacility[`${room.R_Number}`] = { ...room, beds: [], nurses: [] };
        let { data: BED, error } = await supabase
          .from('BED')
          .select('*')
          .eq('R_Number', room.R_Number);
        for (let bed of BED) {
          loadFacility[`${room.R_Number}`].beds.push(bed);
        }
        let { data: NURSEID } = await supabase
          .from('IS_ASSIGNED_TO')
          .select('*')
          .eq('R_Number', room.R_Number);
        for (let id of NURSEID) {
          let { data: NURSE } = await supabase.from('NURSE').select('*').eq('N_Ssn', id.N_Ssn);
          loadFacility[`${room.R_Number}`].nurses.push(NURSE[0]);
        }
      }
      if (error) throw error;
      console.log('load facilty success!');
      setContent(loadFacility);
    } catch (error) {
      console.log(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(async () => {
    handleLoad();
  }, [props.refresh]);

  let style1 = '';
  let style2 = '';
  if (isOpen) {
    style1 = '';
    style2 = 'w-[40%]';
  } else {
    style1 = '-mr-[32rem] opacity-0';
    style2 = 'w-[100%]';
  }
  if (!loading) {
    return (
      <div className="absolute h-screen w-[95%]">
        <div
          className={`${style2} flex min-h-[99%] flex-col items-center justify-start gap-16 rounded-lg bg-gray-300 p-8 transition-all duration-700`}
        >
          {Object.values(content).map((room, index) => {
            return (
              // <MainContentCard
              //   setInfoOpen={setOpen}
              //   open={isOpen}
              //   key={index}
              //   component={room}
              //   setIsRoom={setIsRoom}
              // />
              <div className="w-[100%]" key={index}>
                <StatisticsCard
                  component={room}
                  // setInfoOpen={setOpen}
                  // open={isOpen}
                  // component={room}
                  setIsRoom={setIsRoom}
                />
              </div>
            );
          })}
        </div>

        <div
          className={` ${style1} absolute top-0 right-0 z-20 h-[100%] w-[50%]  rounded-l-lg bg-auto-white shadow-2xl transition-all duration-500 ease-in-out`}
        >
          <div className="sticky top-0 right-0 flex w-[100%] flex-col items-center justify-start gap-4 p-4">
            <button
              onClick={() => {
                setOpen(false);
              }}
              className="absolute top-[14rem] -left-[2.8rem] rounded bg-blue-600 p-4 font-bold text-white shadow-lg hover:bg-blue-800 hover:text-white"
            >
              Close
            </button>
            <div className="flex w-[100%] flex-row items-center justify-between bg-auto-white text-large font-extrabold text-auto-black shadow-sm">
              Room Details
            </div>
            {isRoom && (
              <div className="flex flex-row flex-wrap items-center justify-between rounded bg-auto-white p-2 shadow-lg shadow-gray-200 ring-2 ring-gray-200 hover:bg-white hover:ring-2 hover:ring-gray-300">
                {isRoom.beds &&
                  Object.values(isRoom.beds).map((bed, index) => {
                    return (
                      <div key={index} className="text-[18px] font-bold tracking-wider">
                        {bed.B_Number}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex items-center justify-center">
        <InfinitySpin width="300" color="#475569" />;
      </div>
    );
  }
};

export default MainContent;