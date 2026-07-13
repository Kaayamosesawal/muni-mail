import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faImage, 
  faPollH, 
  faCalendarPlus, 
  faGlobeAfrica,
  faLock,
  faPaperPlane
} from '@fortawesome/free-solid-svg-icons';
import { useAuthContext } from '../../context/AuthContext';

const PostComposer = ({ isOpen, onClose, onPost }) => {
  const { profile } = useAuthContext();
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState('Public');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 750 * 1024) {
        alert("Image must be under 750KB");
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) return;

    setIsSubmitting(true);
    
    const success = await onPost({
      content,
      privacy,
      imageFile,
      authorId: profile?.uid,
      authorRole: profile?.role || "Student",
      faculty: profile?.faculty || "General",
      
      author: {
        uid: profile?.uid,
        displayName: profile?.displayName || profile?.username || "Muni Student",
        photoURL: profile?.photoURL,
        isVerified: profile?.isVerified || false,
        timestamp: new Date().toISOString(),
        category: profile?.faculty || 'Student',
        role: profile?.role || "Student"
      },

      votes: {},
      reactions: { happy: 0, sad: 0, funny: 0, surprised: 0 },
      createdAt: new Date().toISOString()
    });

    if (success) {
      setContent('');
      removeImage();
      onClose();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      <div className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50 dark:border-slate-800">
            <h3 className="font-syne font-bold text-lg text-slate-900 dark:text-white">Create Post</h3>
            <button 
              type="button"
              onClick={onClose}
              className="w-10 h-10 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-2xl flex items-center justify-center transition-all"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <div className="flex gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-brand/5 overflow-hidden flex-shrink-0">
                <img 
                  src={profile?.photoURL || `https://ui-avatars.com/api/?name=${profile?.username}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-syne font-bold text-slate-900 dark:text-white leading-none mb-2">
                  {profile?.displayName || profile?.username || "Muni Student"}
                </h4>
                <div className="relative inline-block">
                  <select 
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value)}
                    className="appearance-none bg-slate-50 dark:bg-slate-800 border-none text-[10px] font-bold uppercase tracking-widest text-slate-400 py-1.5 pl-3 pr-8 rounded-lg outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                  >
                    <option value="Public">Public</option>
                    <option value="Circle">My Circle</option>
                  </select>
                  <FontAwesomeIcon 
                    icon={privacy === 'Public' ? faGlobeAfrica : faLock} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-300 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <textarea 
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening at Muni?"
              className="w-full min-h-[120px] bg-transparent border-none focus:ring-0 text-xl font-dm text-slate-700 dark:text-slate-200 placeholder:text-slate-300 resize-none p-0"
            ></textarea>
            
            {previewUrl && (
              <div className="relative mt-4 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-80 object-cover" />
                <button 
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 w-9 h-9 bg-slate-900/50 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} size="sm" />
                </button>
              </div>
            )}
          </div>

          <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <div className="flex gap-2">
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                accept="image/*" 
                onChange={handleImageChange} 
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className={`w-11 h-11 rounded-xl transition-all flex items-center justify-center border ${
                  previewUrl 
                    ? 'bg-brand text-white border-brand' 
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-brand hover:bg-brand hover:text-white'
                }`}
              >
                <FontAwesomeIcon icon={faImage} />
              </button>
              <button type="button" className="w-11 h-11 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-accent rounded-xl hover:bg-accent hover:text-white transition-all">
                <FontAwesomeIcon icon={faPollH} />
              </button>
              <button type="button" className="w-11 h-11 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                <FontAwesomeIcon icon={faCalendarPlus} />
              </button>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting || (!content.trim() && !imageFile)}
              className="bg-brand text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-brand-deep transition-all shadow-xl shadow-brand/20 disabled:opacity-50 disabled:shadow-none active:scale-95 flex items-center gap-2"
            >
              <span>{isSubmitting ? 'Posting...' : 'Post to Circle'}</span>
              {!isSubmitting && <FontAwesomeIcon icon={faPaperPlane} size="sm" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostComposer;