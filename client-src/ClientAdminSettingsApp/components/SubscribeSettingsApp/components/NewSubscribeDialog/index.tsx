import React, { useState } from 'react';
import AdminDialog from '../../../../../components/AdminDialog';
import AdminInput from '../../../../../components/AdminInput';
import { NewSubscribeDialogProps } from '../../types';

export const NewSubscribeDialog: React.FC<NewSubscribeDialogProps> = ({
  isOpen,
  setIsOpen,
  onAdd
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [url, setUrl] = useState('');
  const [image, setImage] = useState('');

  const handleSubmit = () => {
    onAdd({
      name,
      type,
      url,
      image,
      enabled: true,
      editable: true
    });
    setIsOpen(false);
    // Reset form
    setName('');
    setType('');
    setUrl('');
    setImage('');
  };

  return (
    <AdminDialog
      title="Add Subscribe Method"
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      <div className="space-y-4">
        <AdminInput
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Apple Podcasts"
        />
        <AdminInput
          label="Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="e.g., apple podcasts"
        />
        <AdminInput
          label="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="e.g., https://podcasts.apple.com/podcast/id123456789"
        />
        <AdminInput
          label="Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="e.g., /assets/brands/subscribe/apple.jpg"
        />
        <div className="flex justify-end">
          <button
            type="button"
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!name || !type || !url || !image}
          >
            Add Method
          </button>
        </div>
      </div>
    </AdminDialog>
  );
};

export default NewSubscribeDialog;