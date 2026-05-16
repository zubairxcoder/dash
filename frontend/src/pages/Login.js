import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Login() {
  const [form, setForm]   = useState({ email: 'ahmad@devops.pk', password: 'password123' });
  const [loading, setLoading] = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const submit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    await login(form.email.trim(), form.password);

    toast.success('Login successful');
    navigate('/');
  } catch (err) {
    console.log(err);

    toast.error(
      err?.response?.data?.message ||
      err?.message ||
      'Login failed'
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{
      minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
      background:'radial-gradient(ellipse at 20% 50%,rgba(37,99,235,0.08) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(124,58,237,0.08) 0%,transparent 60%),#070b14',
      padding:16,
    }}>
      <div style={{ width:'100%',maxWidth:420 }}>
        <div style={{ textAlign:'center',marginBottom:32 }}>
          <div style={{
            width:56,height:56,borderRadius:16,
            background:'linear-gradient(135deg,#2563eb,#7c3aed)',
            display:'flex',alignItems:'center',justifyContent:'center',
            margin:'0 auto 14px',boxShadow:'0 8px 24px rgba(37,99,235,0.35)',
          }}>
            <i className="ti ti-terminal-2" style={{ color:'#fff',fontSize:26 }} />
          </div>
          <h1 style={{ fontSize:24,fontWeight:800,letterSpacing:'-0.03em',color:'#f1f5f9',marginBottom:6 }}>
            DevOps AI
          </h1>
          <p style={{ fontSize:13,color:'#475569' }}>Developer Management Dashboard</p>
        </div>

        <div style={{
          background:'rgba(12,20,38,0.95)',border:'1px solid rgba(99,179,237,0.12)',
          borderRadius:18,padding:32,boxShadow:'0 20px 60px rgba(0,0,0,0.5)',
        }}>
          <h2 style={{ fontSize:18,fontWeight:700,color:'#f1f5f9',marginBottom:6 }}>Welcome back</h2>
          <p style={{ fontSize:13,color:'#475569',marginBottom:24 }}>Sign in to your workspace</p>

          <form onSubmit={submit}>
            <div className="form-group" style={{ marginBottom:14 }}>
              <div className="form-label">Email Address</div>
              <input className="form-input" type="email" placeholder="you@example.com"
                value={form.email} onChange={(e)=>setForm(f=>({...f,email:e.target.value}))} required />
            </div>
            <div className="form-group" style={{ marginBottom:24 }}>
              <div className="form-label">Password</div>
              <input className="form-input" type="password" placeholder="••••••••"
                value={form.password} onChange={(e)=>setForm(f=>({...f,password:e.target.value}))} required />
            </div>
            <button className="btn btn-primary" style={{ width:'100%',justifyContent:'center',padding:'11px 0' }} disabled={loading}>
              {loading ? <span className="spinner" /> : <><i className="ti ti-login" />Sign In</>}
            </button>
          </form>

          <div style={{
            marginTop:20,padding:'12px 14px',
            background:'rgba(37,99,235,0.08)',borderRadius:10,
            border:'1px solid rgba(37,99,235,0.15)',
          }}>
            <div style={{ fontSize:11,fontWeight:700,color:'#60a5fa',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.07em' }}>
              Demo Credentials
            </div>
            <div style={{ fontSize:12,color:'#64748b',lineHeight:1.8 }}>
              <span style={{ color:'#94a3b8' }}>Email:</span> ahmad@devops.pk<br/>
              <span style={{ color:'#94a3b8' }}>Pass:</span> password123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
