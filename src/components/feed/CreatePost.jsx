import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faPollH, faPaperPlane, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useAuthContext } from '../../context/AuthContext';

const CreatePost = ({ onPostSubmit }) => {
  const { profile } = useAuthContext();
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 750 * 1024) {
        alert("Image size must be less than 750KB"); // You can replace with toast later
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) return;

    setIsSubmitting(true);
    
    const success = await onPostSubmit({
      content,
      imageFile,
      votes: {},
      reactions: { happy: 0, sad: 0, funny: 0, surprised: 0 },
      authorRole: profile?.role || "Student", // Added for status filtering consistency
      faculty: profile?.faculty || "General",
      createdAt: new Date().toISOString() // For immediate display if needed
    });

    if (success) {
      setContent('');
      removeImage();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-sm border-[0.5px] border-slate-100 dark:border-slate-800 mb-6">
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden">
          {profile?.photoURL ? (
            <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-brand/5">
              <span className="font-bold text-brand">{profile?.username?.[0]?.toUpperCase()}</span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <textarea 
            placeholder="Share something with the Circle..."
            className="w-full bg-transparent border-none focus:ring-0 text-lg font-dm resize-none py-2 dark:text-white"
            rows="2"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>

          {previewUrl && (
            <div className="relative mt-3 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
              <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-64 object-cover" />
              <button 
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 w-8 h-8 bg-slate-900/50 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} size="sm" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
        <div className="flex gap-2">
          <label className="p-2.5 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-colors flex items-center gap-2 text-sm font-medium cursor-pointer">
            <FontAwesomeIcon icon={faImage} className="text-brand" />
            <span>Photo</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
          </label>
          <button type="button" className="p-2.5 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-colors flex items-center gap-2 text-sm font-medium">
            <FontAwesomeIcon icon={faPollH} className="text-accent" />
            <span>Poll</span>
          </button>
        </div>
        
        <button 
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting || (!content.trim() && !imageFile)}
          className="bg-brand text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-deep transition-all shadow-lg shadow-brand/10 flex items-center gap-2 disabled:opacity-50 disabled:grayscale"
        >
          <span>{isSubmitting ? 'Posting...' : 'Post'}</span>
          <FontAwesomeIcon icon={faPaperPlane} size="sm" />
        </button>
      </div>
    </div>
  );
};

export default CreatePost;