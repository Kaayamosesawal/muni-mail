import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

const EditProfileModal = ({ profile, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    bio: profile?.bio || '',
    faculty: profile?.faculty || '',
    year: profile?.year || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input 
          label="Display Name" 
          value={formData.displayName}
          onChange={(e) => setFormData({...formData, displayName: e.target.value})}
        />
        
        <div className="space-y-2">
          <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1">Bio</label>
          <textarea 
            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-dm text-slate-700 resize-none h-32 outline-none focus:ring-2 focus:ring-brand/10"
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Faculty" 
            value={formData.faculty}
            onChange={(e) => setFormData({...formData, faculty: e.target.value})}
          />
          <Input 
            label="Year" 
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({...formData, year: e.target.value})}
          />
        </div>

        <div className="pt-4 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" className="flex-1">Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;