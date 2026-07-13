import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Integration point for your AuthContext and Firebase logic
    console.log("Logging in...", { email });
    navigate('/feed');
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand/20">
            <span className="text-white font-syne font-black text-3xl">M</span>
          </div>
          <h2 className="text-3xl font-syne font-bold text-slate-900">MuniCircle</h2>
          <p className="text-slate-400 font-dm text-sm mt-2 font-medium uppercase tracking-widest">Education for Transformation</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input 
            label="University Email" 
            type="email" 
            placeholder="e.g. s200100@muni.ac.ug"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button variant="primary" className="w-full py-4" icon={faSignInAlt} type="submit">
            Access the Circle
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;