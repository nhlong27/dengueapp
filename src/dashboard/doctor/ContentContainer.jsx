import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PatientContent from './components-supabase/contents/patient/PatientContent';
import FacilityContent from './components-supabase/contents/facility/FacilityContent';
import NurseContent from './components-supabase/contents/nurse/NurseContent';
import DeviceContent from './components-supabase/contents/device/DeviceContent';
import Account from './components-supabase/profile/Account';
import { createContext } from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '@/shared/api/supabase/supabaseClient';
import { InfinitySpin } from 'react-loader-spinner';
import { client } from '@/shared/api/initClient_tenant';
import { useAtom, atom } from 'jotai';
import { telemetries, deviceList, facilityList } from './App';
import Schedules from './components-supabase/contents/schedule/Schedules';
import Messages from './components-supabase/contents/message/Messages';
// import { useLocation, useNavigate } from 'react-router-dom';

// export let telemetryTable = {};
// export const handleTelemetry = (deviceId, temperature, SpO2, HrtPressure, connection) => {
//   telemetryTable[`${deviceId}`] = {
//     temperature: temperature,
//     SpO2: SpO2,
//     HrtPressure: HrtPressure,
//     connected: connection,
//   };
// };

// export const ContentContainerContext = createContext();
const now = Date.now();
const mtd = now - 3600000;
let loadFacility = {};

const ContentContainer = (props) => {
  const [isUpdate, setIsUpdate] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useAtom(deviceList);
  const [tele, setTelemetries] = useAtom(telemetries);
  const [isSocket, setIsSocket] = useState(false);
  const [facilities, setFacilities] = useAtom(facilityList);

  const handleLoadDevice = async () => {
    try {
      setLoading(true);
      let { data: DEVICE, error } = await supabase.from('DEVICE').select('*');

      console.log('load devices success!');
      await setDevices(() => DEVICE);
    } catch (error) {
      console.log(error.error_description || error.message);
    }
  };

  const handleLoadFacility = async () => {
    try {
      loadFacility = {};
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
          let { data: NURSE } = await supabase
            .from('NURSE')
            .select('*')
            .eq('N_Ssn', id.N_Ssn);
          loadFacility[`${room.R_Number}`].nurses.push(NURSE[0]);
        }
      }

      console.log('load facilties success!');
      setFacilities(loadFacility);
    } catch (error) {
      console.log(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocket = async () => {
    try {
      setLoading(true);
      let { data: DEVICE, error } = await supabase.from('DEVICE').select('*');
      if (error) throw error;

      let token = await client.connect();
      const obj = {};
      for (let device of DEVICE) {
        obj[`${device.D_Id}`] = atom({ temperature: 0, HrtPressure: 0, SpO2: 0 });
        openSocket(device.D_Id);
      }

      setTelemetries((prev) => ({ ...prev, ...obj }));
    } catch (error) {
      console.log(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  const openSocket = async (deviceId) => {
    console.log('socket opened!');
    let params = {
      cmdId: 10,
      entityId: deviceId,
      startTs: mtd,
      endTs: now,
      // close: close
    };
    let timeElapse = 0;
    let status = 'none';
    client.subscribe(params, async function (response) {
      if (Object.keys(response.data).length !== 0) {
        console.log('response - streaming');
        await supabase
          .from('DEVICE')
          .update({ Status: 'Streaming' })
          .eq('D_Id', deviceId);

        if (response.data.temperature[0][1] < 37) {
          timeElapse = status !== 'Normal' ? timeElapse + 4 : 0;
          if (timeElapse >= 10) {
            status = 'Normal';

            const { error } = await supabase
              .from('PATIENT')
              .update({ Status: status })
              .eq('D_Id', deviceId);
            if (error) throw error;
          }
          const { error } = await supabase.from('TELEMETRY').insert([
            {
              D_Id: deviceId,
              Time: Date.now(),
              Temperature: response.data.temperature[0][1],
              SpO2: response.data.SpO2[0][1],
              Pressure: response.data.HrtPressure[0][1],
              Elapse: timeElapse,
              Status: status,
            },
          ]);
          if (error) throw error;
        } else if (
          response.data.temperature[0][1] >= 37.5 &&
          response.data.temperature[0][1] <= 38.5
        ) {
          timeElapse = status !== 'Incubation' ? timeElapse + 4 : 0;
          if (timeElapse >= 10) {
            status = 'Incubation';

            const { error } = await supabase
              .from('PATIENT')
              .update({ Status: status })
              .eq('D_Id', deviceId);
            if (error) throw error;
          }
          const { error } = await supabase.from('TELEMETRY').insert([
            {
              D_Id: deviceId,
              Time: Date.now(),
              Temperature: response.data.temperature[0][1],
              SpO2: response.data.SpO2[0][1],
              Pressure: response.data.HrtPressure[0][1],
              Elapse: timeElapse,
              Status: status,
            },
          ]);
          if (error) throw error;
        } else if (
          response.data.temperature[0][1] >= 39 &&
          response.data.temperature[0][1] <= 40
        ) {
          timeElapse = status !== 'Febrile' ? timeElapse + 4 : 0;
          if (timeElapse >= 10) {
            status = 'Febrile';
            const { error } = await supabase
              .from('PATIENT')
              .update({ Status: status })
              .eq('D_Id', deviceId);
            if (error) throw error;
          }
          const { error } = await supabase.from('TELEMETRY').insert([
            {
              D_Id: deviceId,
              Time: Date.now(),
              Temperature: response.data.temperature[0][1],
              SpO2: response.data.SpO2[0][1],
              Pressure: response.data.HrtPressure[0][1],
              Elapse: timeElapse,
              Status: status,
            },
          ]);
          if (error) throw error;
        } else if (
          response.data.temperature[0][1] >= 37 &&
          response.data.temperature[0][1] <= 37.5
        ) {
          timeElapse = status !== 'Recovery' ? timeElapse + 4 : 0;
          if (timeElapse >= 10) {
            status = 'Recovery';
            const { error } = await supabase
              .from('PATIENT')
              .update({ Status: status })
              .eq('D_Id', deviceId);
            if (error) throw error;
          }
          const { error } = await supabase.from('TELEMETRY').insert([
            {
              D_Id: deviceId,
              Time: Date.now(),
              Temperature: response.data.temperature[0][1],
              SpO2: response.data.SpO2[0][1],
              Pressure: response.data.HrtPressure[0][1],
              Elapse: timeElapse,
              Status: status,
            },
          ]);
          if (error) throw error;
        }
        const telePayload = atom({
          temperature: response.data.temperature[0][1],
          SpO2: response.data.SpO2[0][1],
          HrtPressure: response.data.HrtPressure[0][1],
        });
        setTimeout(async () => {
          await supabase.from('DEVICE').update({ Status: 'Paused' }).eq('D_Id', deviceId);
        }, 20000);

        setTelemetries((prev) => ({ ...prev, [deviceId]: telePayload }));
      }
    });
  };

  useEffect(async () => {
    console.log('loading devices and facilities..')
    await handleLoadDevice();
    await handleLoadFacility();
  }, [isUpdate, refresh]);

  useEffect(async () => {
    console.log('opening sockets..')
    await handleSocket();
  }, [refresh]);

  if (!loading) {
    return (
      // <ContentContainerContext.Provider value={{ telemetries, setTelemetries }}>
      <div className="flex w-[75%] flex-auto flex-col">
        <Routes>
          <Route path="/" element={<PatientContent setIsChart={props.setIsChart} />} />
          <Route path="/account" element={<Account session={props.session} />} />
          <Route
            path="/facilities"
            element={
              <FacilityContent setRefresh={setRefresh} setIsUpdate={setIsUpdate} />
            }
          />
          <Route path="/nurses" element={<NurseContent />} />
          <Route
            path="/devices"
            element={<DeviceContent setRefresh={setRefresh} setIsUpdate={setIsUpdate} />}
          />
          <Route path="/schedules" element={<Schedules />} />
          <Route path="/messages" element={<Messages />} />
        </Routes>
      </div>

      // </ContentContainerContext.Provider>
    );
  } else {
    return (
      <div className="flex w-[75%] items-center justify-center">
        <InfinitySpin width="300" color="#475569" />;
      </div>
    );
  }
};

export default ContentContainer;