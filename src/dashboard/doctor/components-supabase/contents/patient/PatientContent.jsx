import React, { useState } from 'react';
import TransitionsModal from '@/shared/utilities/Modal';
import PatientSearchCreate from './PatientSearchCreate';
import MainContent from './MainContent';

//Big model with selection
//Assign bed, device
//Magic link through email
const PatientContent = (props) => {

  const [search, setSearch] = useState('');
  
  return (
    <>
      <div className="flex items-center justify-start p-2 shadow-sm">
        <PatientSearchCreate
          search={search}
          setSearch={setSearch}
          setRefresh={props.setRefresh}
        />
      </div>
      <div className="scrollbar relative flex-grow overflow-x-hidden overflow-y-scroll p-8">
        <MainContent  setIsChart={props.setIsChart} handleLoadPatient={props.handleLoadPatient}/>
      </div>
    </>
  );
};

export default PatientContent;
