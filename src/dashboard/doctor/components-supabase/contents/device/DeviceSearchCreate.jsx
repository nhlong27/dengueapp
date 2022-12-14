import React, { useContext, useEffect, useState } from 'react';
import { Field, Form, Formik, setNestedObjectValues } from 'formik';
import { Typography } from '@mui/material';
import TransitionsModal from '@/shared/utilities/Modal';
import SelectFormField from '@/shared/utilities/form/SelectFormField';
import TextFormField from '@/shared/utilities/form/TextFormField';
import { client } from '@/shared/api/initClient_tenant';
import * as yup from 'yup';
import SearchBar from '../../components/SearchBar';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { supabase } from '@/shared/api/supabase/supabaseClient';
// import { AppContext } from '@/dashboard/doctor/App';
import { InfinitySpin } from 'react-loader-spinner';
import { BiRefresh } from 'react-icons/bi';
import { userSession } from '@/dashboard/Auth';
import { useAtom } from 'jotai';

const device_schema = yup.object({
  label: yup.string().min(1).max(30),
  type: yup.string().min(1).max(30),
  token: yup.string().nullable(),
});

const DeviceSearchCreate = (props) => {
  const [session] = useAtom(userSession);

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);

  const handleSubmit = async (values) => {
    try {
      //Setting device and access token on thingsboard
      setLoading(true);
      const success = await client.connect();
      if (success) {
        let device = await client.createUpdateDevice(
          {
            name: values.label,
            type: values.type,
            label: values.label,
            deviceProfileId: {
              id: import.meta.env.VITE_DEVICE_PROFILE,
              entityType: 'DEVICE_PROFILE',
            },
            additionalInfo: {},
          },
          `?accessToken=${values.token}`,
        );

        let credentials = await client.getDeviceCredentials(device.id.id);
        values.token = credentials.credentialsId;

        // Add device to db
        await supabase.from('DEVICE').insert([
          {
            D_Id: device.id.id,
            Label: values.label,
            Type: values.type,
            Token: values.token,
            D_Ssn: session.user.id,
          },
        ]);
      }

      console.log('add device success!');
    } catch (error) {
      console.log(error.error_description || error.message);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <div className="ml-8 flex h-[80%] w-[50%] items-center justify-center rounded-[3rem] bg-black p-2 shadow-lg">
        <SearchBar search={props.search} setSearch={props.setSearch} />
      </div>
      <div className="ml-8 flex h-[80%] w-[15%] items-center justify-center rounded-[3rem] bg-blue-600 py-2 shadow-lg ring-2 ring-black  hover:bg-blue-700">
        <button
          className="duration-600 h-[80%] w-[80%] rounded text-[18px] tracking-widest text-white transition-all  "
          onClick={handleOpen}
        >
          Create
        </button>
        <TransitionsModal open={open}>
          <button
            onClick={() => setOpen(false)}
            className="absolute -top-[1rem] -right-[1rem] rounded-full bg-white"
          >
            <AiOutlineCloseCircle size={30} />
          </button>
          <FacilityFormContent
            schema={device_schema}
            handleSubmit={handleSubmit}
            loading={loading}
          />
        </TransitionsModal>
      </div>
      <button
        className="duration-600 ml-6 flex h-[80%] max-w-[10%] items-center justify-center rounded-[3rem] bg-gray-300 p-3 text-[18px] tracking-wider text-white ring-2 ring-black transition-all hover:bg-gray-400 hover:text-[20px] hover:tracking-[1px] focus:bg-gray-400"
        onClick={() => props.setRefresh((state) => !state)}
      >
        <BiRefresh size={30} color="black" />
      </button>
    </>
  );
};

const FacilityFormContent = (props) => {
  return (
    <Formik
      validateOnChange={false}
      validationSchema={props.schema}
      initialValues={{
        label: '',
        type: '',
        token: '',
      }}
      onSubmit={(values) => {
        props.handleSubmit({ ...values });
      }}
    >
      {({ values }) => (
        <Form>
          <div className="flex flex-col items-start justify-start">
            <div className="mb-4 text-large font-bold tracking-wider text-blue-500">
              Add a new device
            </div>
            <div className="text-[18px] text-blue-500">
              Please fill in all the necessary information. <br />
              The <span className="italic text-red-500">access token</span> must be the
              same with a real device's
            </div>
            <div className={`mt-6`}>
              <Field
                name="label"
                component={TextFormField}
                required
                id="label-required"
                label={`Device Name`}
                helperText={`Please type the name of your device`}
              />
              <Field
                name="type"
                component={TextFormField}
                required
                id="type-required"
                label={`Device Type`}
                placeholder={`Temperature Sensor`}
                helperText={`Please indicate the type of your device`}
              />
              <Field
                name="token"
                component={TextFormField}
                id="token-required"
                label={`Device Token`}
                placeholder={`s6n9ipfzJhdpvpXtuqPC`}
                helperText={`An Access Token will be auto generated if not specified `}
              />
            </div>

            {props.loading ? (
              <div className="absolute bottom-[2rem] right-[3rem]">
                <InfinitySpin width="300" color="#475569" />
              </div>
            ) : (
              <>
                <button
                  className="absolute bottom-[4.5rem] right-[4rem] rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-400  "
                  type="submit"
                >
                  Submit
                </button>
                <div className="mt-4 rounded-lg p-2 text-[16px] text-gray-500 ring-2 ring-gray-500">
                  You can also create virtual devices
                </div>
              </>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
};
export default DeviceSearchCreate;
