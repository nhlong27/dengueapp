import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/shared/api/supabase/supabaseClient';
import { useAtom } from 'jotai';
import { userSession } from '@/dashboard/Auth';

const ChatContainer = (props) => {
  const [session] = useAtom(userSession);
  const [imgSource, setImgSource] = useState({});

  const downloadImage = async () => {
    const { data: NURSE } = await supabase
      .from('NURSE')
      .select('*')
      .eq('N_Ssn', session.user.id)
      .single();
    const { data: MESSAGE } = await supabase
      .from('MESSAGE')
      .select('*')
      .eq('Type', 'image');
    for (let n of MESSAGE) {
      const { data } = await supabase.storage
        .from(`doctors/${NURSE.D_Ssn}/messages`)
        .download(n.Content);
      const url = URL.createObjectURL(data);
      setImgSource((imgSource) => ({ ...imgSource, [n.Content]: url }));
    }
  };

  useEffect(() => {
    downloadImage();
  }, []);

  return (
    <div className="flex min-h-[100%] w-[95%] flex-col items-start justify-start gap-10 bg-gradient-to-b from-gray-800 to-gray-500 pb-8">
      {props.messages.map((message, index) => {
        return (
          <div key={index} className="relative flex w-[100%] items-center justify-start">
            <div className="absolute -top-8 right-[35%] text-[10px] text-gray-200">
              {new Date(message.created_at).toLocaleString()}
            </div>
            {message.Signature === session.user.id ? (
              <>
                <div className="absolute -top-6 right-4 text-[12px] tracking-wider text-gray-100">
                  {message.Username}
                </div>
                {message.Type === 'text' && (
                  <div className="ml-auto mr-4 max-w-[50%] rounded-2xl bg-auto-white bg-gradient-to-t from-white to-gray-200 px-4 py-2 shadow-lg">
                    {message.Content}
                  </div>
                )}
                {message.Type === 'image' && (
                  <div className="ml-auto mr-4 rounded-sm bg-white shadow-lg ring-2 ring-black">
                    <img
                      src={
                        imgSource
                          ? imgSource[`${message.Content}`]
                          : `https://place-hold.it/150x150`
                      }
                      alt={imgSource ? 'Image' : 'No image'}
                      style={{ height: 150, width: 150 }}
                    />
                  </div>
                )}
                <div className="absolute -right-4 h-[4px] w-[4px] rounded-full bg-black"></div>
              </>
            ) : (
              <>
                <div className="absolute -top-6 left-0 text-[12px] tracking-wider text-white">
                  {message.Username}
                </div>
                <div className="h-[2rem]  w-[2rem] rounded-full bg-cyan-300">Ava</div>
                <div
                  className="ml-4 max-w-[50%] rounded-2xl bg-auto-white bg-gradient-to-t from-white to-gray-200 px-4 py-2 shadow-lg"
                  key={index}
                >
                  {message.Content}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChatContainer;
