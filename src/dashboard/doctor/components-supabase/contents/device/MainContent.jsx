import React, { useState, useEffect, useContext } from 'react';
import MainContentCard from './MainContentCard';
import { InfinitySpin } from 'react-loader-spinner';
import { supabase } from '@/shared/api/supabase/supabaseClient';
import { client } from '@/shared/api/initClient_tenant';
// import { handleTelemetry } from '../../ContentContainer';
// import { ContentContainerContext } from '../../ContentContainer';
import { useAtom } from 'jotai';
import { deviceList, telemetries } from '@/dashboard/doctor/App';

const MainContent = (props) => {
  const [isOpen, setOpen] = useState(false);
  const [isDevice, setIsDevice] = useState({});
  const [devices] = useAtom(deviceList);
  const [status, setStatus] = useState('Paused');

  const listenStatusUdate = () => {
    const DEVICE = supabase
      .channel('custom-update-channel')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'DEVICE' },

        async (payload) => {
          let obj = {};
          const { data } = await supabase.from('DEVICE').select('D_Id, Status');
          for (let pair of data) {
            obj[`${pair.D_Id}`] = pair.Status;
          }
          setStatus(() => obj);
        },
      )
      .subscribe();
  };

  useEffect(() => {
    listenStatusUdate();
  }, [status]);

  let style1 = '';
  let style2 = '';
  if (isOpen) {
    style1 = '';
    style2 = 'w-[50%]';
  } else {
    style1 = '-mr-[32rem] opacity-0';
    style2 = 'w-[100%]';
  }

  return (
    <>
      <div
        className={`${style2} flex min-h-[100%] flex-col items-center justify-start gap-4 rounded-lg bg-gray-300 p-4 transition-all duration-700`}
      >
        <div className="w-[100%] rounded-2xl bg-auto-white p-4">
          {devices.length === 0 && (
            <div className="flex w-[100%] items-center justify-center font-bold tracking-[5px] text-gray-500">
              NO DEVICE AVAILABLE
            </div>
          )}
          {devices.map((device, index) => {
            return (
              <MainContentCard
                setInfoOpen={setOpen}
                infoOpen={isOpen}
                key={index}
                component={device}
                setIsDevice={setIsDevice}
                status={status}
                setIsUpdate={props.setIsUpdate}
              />
            );
          })}
        </div>
      </div>

      <div
        className={` ${style1} absolute top-4 right-0 z-20 h-[95%] w-[50%] rounded-l-lg bg-auto-white  shadow-2xl ring-2 ring-black transition-all duration-500 ease-in-out`}
      >
        <div className="sticky top-0 right-0 flex w-[100%] flex-col items-center justify-start gap-4 p-4">
          <button
            onClick={() => {
              setOpen(false);
            }}
            className="absolute top-[14rem] -left-[2.8rem] rounded-lg bg-blue-600 p-4 font-bold text-white shadow-lg ring-2 ring-black ring-offset-1 ring-offset-white hover:bg-blue-700 hover:text-white"
          >
            Close
          </button>
          <div className="flex h-[100%] w-[100%] flex-row items-center justify-between bg-auto-white text-large font-extrabold text-auto-black shadow-sm">
            Device Details
          </div>
          {isDevice && (
            <div className="flex w-[100%] flex-col items-center justify-start">
              <div className="flex w-[100%] flex-row items-center justify-between rounded bg-auto-white p-2 shadow-lg shadow-gray-200 border-x-2 border-t-2 border-gray-200">
                <div className="text-[14px] tracking-[2px] font-bold text-gray-500">LABEL</div>
                <div className="text-[14px] tracking-[2px] font-bold text-gray-500">TYPE</div>
                <div className="text-[14px] tracking-[2px] font-bold text-gray-500">ASSIGN</div>
              </div>
              <div className="flex w-[100%] flex-row items-center justify-between rounded bg-auto-white p-2 shadow-lg shadow-gray-200 border-x-2 border-b-2 border-gray-200">
                <div className="text-[18px] font-bold tracking-wider">
                  {isDevice.Label}
                </div>
                <div className="text-blue-600">{isDevice.Type}</div>

                {isDevice.Assign === 'No' ? (
                  <div className="text-red-500">Not assigned</div>
                ) : (
                  <div className="text-green-500">Assigned</div>
                )}
              </div>
              <div className="text-gray-500 ring-2 ring-gray-500 p-4 rounded-lg mt-8">Access Token: {isDevice.Token}</div>
            </div>
          )}
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
