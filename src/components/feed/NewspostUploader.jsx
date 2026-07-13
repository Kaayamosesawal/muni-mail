import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faTimes, faImage } from '@fortawesome/free-solid-svg-icons';

const NewspostUploader = ({ onFileSelect }) => {
  const [preview, setPreview] = useState(null);
  const [fileSize, setFileSize] = useState(0);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 750 * 1024) {
        alert("Image size must be less than 750KB"); // Replace with toast in parent if needed
        e.target.value = null;
        return;
      }
      setFileSize(file.size);
      setPreview(URL.createObjectURL(file));
      onFileSelect(file);
    }
  };

  const removeFile = () => {
    setPreview(null);
    setFileSize(0);
    onFileSelect(null);
  };

  return (
    <div className="mt-4">
      {!preview ? (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-all group">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <FontAwesomeIcon icon={faCloudUploadAlt} className="text-slate-300 group-hover:text-brand mb-2 text-2xl" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Add Media</p>
            <p className="text-[9px] text-slate-400 mt-1">Max 750KB</p>
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={handleFile} />
        </label>
      ) : (
        <div className="relative rounded-[2rem] overflow-hidden border border-slate-100">
          <img 
            src={preview} 
            alt="Upload Preview" 
            className="w-full h-48 object-cover" 
          />
          <button 
            onClick={removeFile}
            className="absolute top-3 right-3 w-8 h-8 bg-black/60 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} size="xs" />
          </button>
          
          {fileSize > 0 && (
            <div className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
              {(fileSize / 1024).toFixed(0)}KB
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NewspostUploader;