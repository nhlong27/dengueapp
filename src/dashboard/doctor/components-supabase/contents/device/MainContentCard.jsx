import { client } from '@/shared/api/initClient_tenant';
import React, { useContext, useEffect, useState } from 'react';
import { TbTemperatureCelsius } from 'react-icons/tb';
import { GiMedicalDrip } from 'react-icons/gi';
import { BiHeart } from 'react-icons/bi';
import { GrDevice } from 'react-icons/gr';
// import { telemetries, handleTelemetry } from '../../ContentContainer';
// import { ContentContainerContext } from '../../ContentContainer';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { Field, Form, Formik } from 'formik';
import { Typography } from '@mui/material';
import TransitionsModal from '@/shared/utilities/Modal';
import SelectFormField from '@/shared/utilities/form/SelectFormField';
import TextFormField from '@/shared/utilities/form/TextFormField';
import { InfinitySpin } from 'react-loader-spinner';
import { supabase } from '@/shared/api/supabase/supabaseClient';
import { telemetries } from '@/dashboard/doctor/App';
import { useAtom } from 'jotai';

const MainContentCard = (
  { infoOpen, component, setInfoOpen, setIsDevice, status, setIsUpdate } = {
    infoOpen: null,
    component: '',
    setInfoopen: null,
    setIsDevice: null,
    status: null,
    setIsUpdate: null,
  },
) => {
  const [tele] = useAtom(telemetries);

  const [currTele] = tele[`${component.D_Id}`]
    ? useAtom(tele[`${component.D_Id}`])
    : useAtom(tele.something);

  const [open, setOpen] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // const listenUpdate = () => {
  //   const DEVICE = supabase
  //     .channel('custom-all-channel')
  //     .on(
  //       'postgres_changes',
  //       { event: '*', schema: 'public', table: 'DEVICE' },
  //       (payload) => {
  //         console.log('Change received!', payload);
  //         setIsUpdate((state) => !state);
  //       },
  //     )
  //     .subscribe();
  // };

  const handleUpdate = async (values) => {
    try {
      //Setting device and access token on thingsboard
      console.log('component.D_Id');
      console.log(component.D_Id);
      const success = await client.connect();
      if (success) {
        let device = await client.createUpdateDevice(
          {
            id: {
              id: component.D_Id,
              entityType: 'DEVICE',
            },
            name: values.label,
            type: values.type,
            label: values.label,
            deviceProfileId: {
              id: '3e29a7f0-750f-11ed-81cb-3bc720ab387f',
              entityType: 'DEVICE_PROFILE',
            },
            additionalInfo: {},
          },
          `?accessToken=${component.Token}`,
        );

        // Add device to db
        await supabase
          .from('DEVICE')
          .update({
            Label: values.label,
            Type: values.type,
          })
          .eq('D_Id', component.D_Id);
      }
      console.log('update device success!');
    } catch (error) {
      console.log(error.error_description || error.message);
    } finally {
      setOpen(false);
      setIsUpdate((state) => !state);
    }
  };

  const handleUnassign = async () => {
    try {
      await supabase
        .from('PATIENT')
        .update({
          D_Id: null,
          D_Label: null,
          Status: 'None',
        })
        .eq('D_Id', component.D_Id);
      await supabase.from('DEVICE').update({ Assign: 'No' }).eq('D_Id', component.D_Id);
      console.log('unassign device success!');
    } catch (error) {
      console.log(error.error_description || error.message);
    } finally {
      setIsUpdate((state) => !state);
    }
  };

  const handleDelete = async (values) => {
    try {
      //Setting device and access token on thingsboard
      setLoadingDelete(true);
      const success = await client.connect();
      if (success) {
        let device = await client.deleteDevice(component.D_Id);

        // delete device from db
        await supabase
          .from('PATIENT')
          .update({
            D_Id: null,
          })
          .eq('D_Id', component.D_Id);
        await supabase.from('TELEMETRY').delete().eq('D_Id', component.D_Id);
        await supabase.from('DEVICE').delete().eq('D_Id', component.D_Id);
      }
      if (error) throw error;
      console.log('delete device success!');
    } catch (error) {
      console.log(error.error_description || error.message);
    } finally {
      setIsUpdate((state) => !state);
    }
  };

  // useEffect(() => {
  //   listenUpdate();
  // }, []);
  // useEffect(() => {
  //   console.log('rerender!');
  // }, [isUpdate]);

  return (
    <div className="grid w-[100%] grid-cols-3 gap-4  rounded-2xl bg-auto-white p-4 shadow-lg ring-2 ring-black transition-all duration-300 ease-in-out">
      {loadingDelete ? (
        <div className="w=[100%] flex h-[100%] items-center justify-center text-red-400">
          <div>
            Device {component.Label} with access token {component.Token} has been removed
          </div>
        </div>
      ) : (
        <>
          <div className="col-span-3 flex items-center justify-start">
            {infoOpen ? (
                <div className="flex w-[30%] flex-col items-start justify-start">
                  <div className="relative px-4 text-[22px] font-semibold tracking-widest text-black">
                    <GrDevice />
                    {component.Label}
                  </div>
                </div>
            ) : (
              <>
                <div className="flex w-[30%] flex-col items-start justify-start">
                  <div className="relative px-4 text-[22px] font-semibold tracking-widest text-black">
                    <GrDevice />
                    {component.Label}
                    {status && status[`${component.D_Id}`] === 'Streaming' ? (
                      <div className="absolute -bottom-8 left-[9rem] px-2 rounded-lg text-[14px] text-green-500 ring-2 ring-green-400">
                        STREAMING
                      </div>
                    ) : (
                      <div className="absolute -bottom-8 left-[9rem] px-2 rounded-lg text-[14px] text-red-500 ring-2 ring-red-400">
                        PAUSED
                      </div>
                    )}
                  </div>
                  <div className="px-4 text-[16px] font-semibold text-blue-600">
                    {component.Type}
                  </div>
                  {component.Assign === 'No' ? (
                    <div className="px-4 text-[14px] font-bold text-red-500">
                      Assigned: None
                    </div>
                  ) : (
                    <div className="px-4 text-[14px] font-bold text-green-500">
                      Assigned: {component.Assign}
                    </div>
                  )}
                </div>
                <div className="ml-auto flex h-[100%] w-[100%] items-center justify-center gap-[5rem]">
                  <div className="flex h-[100%] w-[20%] flex-col items-center  justify-between rounded-2xl p-2 text-orange-400 ring-2 ring-orange-400">
                    <div className="">
                      <TbTemperatureCelsius size={40} />
                    </div>
                    <div className="text-[40px] font-extrabold tracking-[5px] text-orange-400">
                      {currTele && currTele.temperature}
                    </div>
                  </div>
                  <div className="flex h-[100%] w-[20%] flex-col items-center justify-between rounded-2xl p-2 text-blue-400 ring-2 ring-blue-400">
                    <div className="">
                      <GiMedicalDrip size={40} />
                    </div>
                    <div className="text-[40px] font-extrabold tracking-[5px] text-blue-400">
                      {currTele && currTele.SpO2}
                    </div>
                  </div>
                  <div className="flex h-[100%] w-[20%] flex-col items-center justify-between rounded-2xl p-2 text-purple-400 ring-2 ring-purple-400">
                    <div className="">
                      <BiHeart size={40} />
                    </div>
                    <div className="text-[40px] font-extrabold tracking-[5px] text-purple-400">
                      {currTele && currTele.HrtPressure}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="col-span-3 flex items-center justify-start gap-4">
            <button
              onClick={() => {
                setInfoOpen(true);
                setIsDevice(component);
              }}
              className="flex items-center justify-center rounded-lg bg-auto-white px-4 py-2 text-black ring-2 ring-gray-300 hover:ring-black "
            >
              Details
            </button>
            <div
              onClick={() => setOpen(true)}
              className="flex items-center justify-center rounded-lg bg-auto-white px-4 py-2 text-black ring-2 ring-gray-300 hover:ring-black"
            >
              <button>Update</button>
              <TransitionsModal open={open}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                  }}
                  className="absolute -top-[1rem] -right-[1rem] rounded-full bg-auto-white"
                >
                  <AiOutlineCloseCircle size={30} />
                </button>
                <DeviceFormContent
                  handleUpdate={handleUpdate}
                  component={component}
                />
              </TransitionsModal>
            </div>
            <button
              onClick={() => {
                handleDelete();
              }}
              className="flex items-center justify-center rounded-lg bg-auto-white px-4 py-2 text-black ring-2 ring-gray-300 hover:ring-black"
            >
              <AiOutlineCloseCircle /> <span>Remove</span>
            </button>
            {component.Assign !== 'No' && (
              <button
                onClick={() => {
                  handleUnassign();
                }}
                className="ml-auto flex items-center justify-center rounded-lg bg-auto-white px-4 py-2 text-black ring-2 ring-gray-300 hover:ring-black"
              >
                <span>Unassign</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const DeviceFormContent = (props) => {
  return (
    <div className="h-[100%] w-[100%] bg-auto-white">
      <Formik
        validateOnChange={false}
        // validationSchema={props.schema}
        initialValues={{
          label: props.component.Label,
          type: props.component.Type,
        }}
        onSubmit={(values) => {
          props.handleUpdate({ ...values });
        }}
      >
        {({ values }) => (
          <Form>
            <div className="flex flex-col items-start justify-start">
              <div className="mb-4 text-large font-bold tracking-wider text-blue-500">
                Update this device.
              </div>
              <div className="text-[16px] text-blue-500">
                {`Assigned to: ${props.component.Assign}`} <br />
                {`Access token: ${props.component.Token}`} <br />
                <span className="text-red-500">
                  Please note that access token cannot be updated.
                </span>
              </div>
              <div className={`mt-6`}>
                <Field
                  name="label"
                  component={TextFormField}
                  required
                  id="label-required"
                  label={`Device Name`}
                  placeholder={`${props.component.Label}`}
                  helperText={`Please update the name of your device`}
                />
                <Field
                  name="type"
                  component={TextFormField}
                  required
                  id="type-required"
                  label={`Device Type`}
                  placeholder={`${props.component.Type}`}
                  helperText={`Please update the type of your device`}
                />
              </div>
              <button
                className="absolute bottom-[4.5rem] right-[4rem] rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-400  "
                type="submit"
              >
                Update
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default MainContentCard;
