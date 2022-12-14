import React, { useState, useEffect } from 'react';
import MainContentCard from './MainContentCard';
import { InfinitySpin } from 'react-loader-spinner';
import { supabase } from '@/shared/api/supabase/supabaseClient';
import { StatisticsCard } from './MainContentCard2';
import { facilityList } from '@/dashboard/doctor/App';
import { useAtom } from 'jotai';

const MainContent = (props) => {
  const [isOpen, setOpen] = useState(false);
  const [isRoom, setIsRoom] = useState({});
  const [facilities] = useAtom(facilityList);

  const listenUpdateRoom = () => {
    const ROOM = supabase
      .channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ROOM' },
        (payload) => {
          console.log('Change received!', payload);
          props.handleLoadFacility();
        },
      )
      .subscribe();
  };
  const listenUpdateBed = () => {
    const BED = supabase
      .channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'BED' },
        (payload) => {
          console.log('Change received!', payload);
          props.handleLoadFacility();
        },
      )
      .subscribe();
  };

  useEffect(async () => {
    await listenUpdateBed();
    await listenUpdateRoom();
  }, []);

  let style1 = '';
  let style2 = '';
  if (isOpen) {
    style1 = '';
    style2 = 'w-[40%]';
  } else {
    style1 = '-mr-[32rem] opacity-0';
    style2 = 'w-[100%]';
  }
  return (
    <>
      <div
        className={` min-h-[100%]  rounded-lg bg-gray-300 p-4 transition-all duration-700`}
      >
        <div className="flex w-[100%] flex-col items-center justify-start gap-4 rounded-2xl bg-auto-white p-4">
          {Object.keys(facilities).length === 0 && (
            <div className="flex w-[100%] items-center justify-center font-bold tracking-[5px] text-gray-500">
              NO FACILITY AVAILABLE
            </div>
          )}
          {Object.values(facilities).map((room, index) => {
            return (
              <div
                className="w-[100%] overflow-hidden rounded-2xl ring-2 ring-black"
                key={index}
              >
                <StatisticsCard
                  component={room}
                  setIsRoom={setIsRoom}
                  setIsUpdate={props.setIsUpdate}
                />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
  // } else {
  //   return (
  //     <div className="flex items-center justify-center">
  //       <InfinitySpin width="300" color="#475569" />;
  //     </div>
  //   );
  // }
};

export default MainContent;
