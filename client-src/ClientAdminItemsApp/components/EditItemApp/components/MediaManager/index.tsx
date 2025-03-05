import React, { useState, useEffect } from 'react';
import { MediaManagerProps, MediaFile } from '../../types';
import AdminInput from '../../../../../components/AdminInput';
import AdminRadio from '../../../../../components/AdminRadio';
import { getPublicBaseUrl } from '../../../../../common/ClientUrlUtils';

const DEFAULT_MEDIA_FILE: MediaFile = {
  category: 'audio',
  url: '',
  sizeByte: 0,
  durationSecond: 0,
  contentType: ''
};

const MediaManager: React.FC<MediaManagerProps> = ({
  labelComponent,
  feed,
  initMediaFile,
  onMediaFileUpdated
}) => {
  const [mediaFile, setMediaFile] = useState<MediaFile>({
    ...DEFAULT_MEDIA_FILE,
    ...initMediaFile
  });

  const webGlobalSettings = feed.settings.webGlobalSettings || {};
  const publicBucketUrl = webGlobalSettings.publicBucketUrl || '';

  useEffect(() => {
    // Ensure all required fields are present
    if (mediaFile && mediaFile.url && mediaFile.category) {
      onMediaFileUpdated(mediaFile as MediaFile);
    }
  }, [mediaFile]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMediaFile(prev => ({
      ...prev,
      url: e.target.value
    }));
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMediaFile(prev => ({
      ...prev,
      sizeByte: parseInt(e.target.value, 10) || 0
    }));
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMediaFile(prev => ({
      ...prev,
      durationSecond: parseInt(e.target.value, 10) || 0
    }));
  };

  const handleContentTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMediaFile(prev => ({
      ...prev,
      contentType: e.target.value
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMediaFile(prev => ({
      ...prev,
      category: e.target.value
    }));
  };

  return (
    <div>
      <div className="mb-4">
        {labelComponent}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <AdminRadio
          labelComponent={<span className="text-sm font-medium">Media Type</span>}
          groupName="media-category"
          buttons={[
            {
              name: 'Audio',
              value: 'audio',
              checked: mediaFile.category === 'audio'
            },
            {
              name: 'Video',
              value: 'video',
              checked: mediaFile.category === 'video'
            }
          ]}
          onChange={handleCategoryChange}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AdminInput
          labelComponent={<span className="text-sm font-medium">Media URL</span>}
          value={mediaFile.url || ''}
          onChange={handleUrlChange}
        />

        <div className="grid grid-cols-3 gap-4">
          <AdminInput
            type="number"
            labelComponent={<span className="text-sm font-medium">Size (bytes)</span>}
            value={(mediaFile.sizeByte || 0).toString()}
            onChange={handleSizeChange}
          />

          <AdminInput
            type="number"
            labelComponent={<span className="text-sm font-medium">Duration (seconds)</span>}
            value={(mediaFile.durationSecond || 0).toString()}
            onChange={handleDurationChange}
          />

          <AdminInput
            labelComponent={<span className="text-sm font-medium">Content Type</span>}
            value={mediaFile.contentType || ''}
            onChange={handleContentTypeChange}
          />
        </div>
      </div>

      {mediaFile.url && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Media Preview:</p>
          {mediaFile.category === 'audio' && (
            <audio controls className="w-full">
              <source src={mediaFile.url} type={mediaFile.contentType || 'audio/mpeg'} />
              Your browser does not support the audio element.
            </audio>
          )}
          {mediaFile.category === 'video' && (
            <video controls className="w-full max-h-72">
              <source src={mediaFile.url} type={mediaFile.contentType || 'video/mp4'} />
              Your browser does not support the video element.
            </video>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaManager;
