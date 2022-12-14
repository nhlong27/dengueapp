import React, { useState, useEffect } from 'react';
import { InfinitySpin } from 'react-loader-spinner';
import { supabase } from '@/shared/api/supabase/supabaseClient';
import { useAtom } from 'jotai';
import { userSession } from '@/dashboard/Auth';

export default function Avatar(props) {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [update, setUpdate] = useState(false);

  const [session] = useAtom(userSession);

  useEffect(() => {
    downloadImage('avatar.png');
  }, [update]);

  const downloadImage = async (path) => {
    try {
      const { data, error } = await supabase.storage
        .from(`doctors/${session.user.id}`)
        .download(path);
      if (error) {
        throw error;
      }
      if (data) {
        const url = URL.createObjectURL(data);
        setAvatarUrl(url);
      }
    } catch (error) {
      console.log('Error downloading image: ', error.message);
    }
  };

  const uploadAvatar = async (event) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      // const fileExt = file.name.split('.').pop();
      // const fileName = `avatar.${fileExt}`;
      // const filePath = `${fileName}`;
      if (avatarUrl) {
        const { data, error: updateError } = await supabase.storage
          .from(`doctors/${session.user.id}`)
          .update('avatar.png', file, {
            cacheControl: '3600',
            upsert: false,
          });
        if (updateError) {
          throw updateError;
        }
      } else {
        let { error: uploadError } = await supabase.storage
          .from(`doctors/${session.user.id}`)
          .upload('avatar.png', file);
        if (uploadError) {
          throw uploadError;
        }
      }
      setUpdate((state) => !state);
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="mb-4 flex items-end justify-start">
      <img
        className="ring-2 ring-black"
        src={avatarUrl ? avatarUrl : `https://place-hold.it/150x150`}
        alt={avatarUrl ? 'Avatar' : 'No image'}
        style={{ height: 150, width: 150 }}
      />
      {uploading ? (
        <InfinitySpin width="100" color="#475569" />
      ) : (
        <div className="ml-8">
          <label className="text-blue-600" htmlFor="single">
            Upload an avatar
          </label>
          <div>
            <input
              type="file"
              id="single"
              accept="image/*"
              onChange={uploadAvatar}
              disabled={uploading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
