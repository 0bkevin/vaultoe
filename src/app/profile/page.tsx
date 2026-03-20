'use client';

import { useState } from 'react';
import { useStacks } from '@/components/providers/StacksProvider';
import { Navbar } from '@/components/layout/Navbar';
import { toast } from 'sonner';

export default function Profile() {
  const { userData, profile, refreshProfile } = useStacks();
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [description, setDescription] = useState(profile?.description || '');
  const [role, setRole] = useState(profile?.role || 'BUILDER');
  const [githubUrl, setGithubUrl] = useState(profile?.githubUrl || '');
  const [websiteUrl, setWebsiteUrl] = useState(profile?.websiteUrl || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          principal: userData.profile.stxAddress.testnet,
          name,
          description,
          role,
          githubUrl,
          websiteUrl,
        }),
      });

      if (!res.ok) throw new Error('Failed to save profile');
      
      await refreshProfile();
      toast.success('PROFILE_UPDATED_SUCCESSFULLY');
    } catch (error) {
      console.error(error);
      toast.error('ERR_PROFILE_UPDATE_FAILED');
    } finally {
      setIsSaving(false);
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#ff4500] selection:text-white">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          
          <div className="relative z-10 border border-[#ff4500] bg-[#050505] p-8 max-w-md w-full mx-4">
            <div className="absolute top-0 left-0 w-2 h-2 bg-[#ff4500] -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-0 right-0 w-2 h-2 bg-[#ff4500] translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#ff4500] -translate-x-1/2 translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#ff4500] translate-x-1/2 translate-y-1/2"></div>
            
            <div className="text-center space-y-6">
              <div className="font-mono text-[#ff4500] text-sm tracking-widest">STATUS: UNAUTHORIZED</div>
              <h2 className="text-3xl font-heading font-bold uppercase tracking-tight">Connect Wallet<br/>To View Profile</h2>
              <p className="text-white/60 font-mono text-sm">Authentication required to access configuration panel.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#ff4500] selection:text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-3xl relative">
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none"></div>

        <div className="relative z-10 mb-12 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-2 w-2 bg-[#ff4500]"></div>
            <h1 className="text-4xl font-heading font-bold uppercase tracking-tighter">User_Profile</h1>
          </div>
          <p className="text-white/60 font-mono text-sm uppercase tracking-widest">System Configuration Panel // ID: {userData.profile.stxAddress.testnet.slice(0, 8)}</p>
        </div>

        <div className="relative z-10 border border-white/10 bg-[#050505] p-1">
          <div className="border border-white/10 p-6 sm:p-8">
            <div className="flex justify-between items-start mb-8 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-xl font-heading font-bold uppercase tracking-tight">Identity_Settings</h2>
                <p className="text-white/40 font-mono text-xs mt-1">Modify public parameters</p>
              </div>
              <div className="border border-[#ff4500] text-[#ff4500] px-3 py-1 font-mono text-xs uppercase tracking-widest">
                {profile?.role || 'BUILDER'}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label htmlFor="principal" className="block font-mono text-xs text-white/60 uppercase tracking-widest">Wallet_Address [Read-Only]</label>
                <input 
                  id="principal" 
                  value={userData.profile.stxAddress.testnet}
                  disabled
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 font-mono text-sm text-white/40 cursor-not-allowed focus:outline-none rounded-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label htmlFor="name" className="block font-mono text-xs text-[#ff4500] uppercase tracking-widest">Display_Name *</label>
                  <input 
                    id="name" 
                    placeholder="Enter designation..." 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent border border-white/20 px-4 py-3 font-mono text-sm text-white focus:border-[#ff4500] focus:outline-none transition-colors rounded-none placeholder:text-white/20"
                  />
                </div>

                <div className="space-y-3">
                  <label htmlFor="role" className="block font-mono text-xs text-[#ff4500] uppercase tracking-widest">Primary_Role *</label>
                  <div className="relative">
                    <select 
                      id="role"
                      value={role}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRole(e.target.value)}
                      className="w-full bg-transparent border border-white/20 px-4 py-3 font-mono text-sm text-white focus:border-[#ff4500] focus:outline-none transition-colors rounded-none appearance-none cursor-pointer"
                    >
                      <option value="DAO" className="bg-[#050505] text-white">DAO / Payer</option>
                      <option value="BUILDER" className="bg-[#050505] text-white">Builder / Developer</option>
                      <option value="INVESTOR" className="bg-[#050505] text-white">Investor</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#ff4500] font-mono text-xs">
                      ▼
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="description" className="block font-mono text-xs text-white/60 uppercase tracking-widest">Description_Log</label>
                <textarea 
                  id="description" 
                  placeholder="Enter operational details..." 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-transparent border border-white/20 px-4 py-3 font-mono text-sm text-white focus:border-[#ff4500] focus:outline-none transition-colors rounded-none placeholder:text-white/20 resize-y"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label htmlFor="github" className="block font-mono text-xs text-white/60 uppercase tracking-widest">GitHub_URI</label>
                  <input 
                    id="github" 
                    placeholder="https://github.com/..." 
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full bg-transparent border border-white/20 px-4 py-3 font-mono text-sm text-white focus:border-[#ff4500] focus:outline-none transition-colors rounded-none placeholder:text-white/20"
                  />
                </div>

                <div className="space-y-3">
                  <label htmlFor="website" className="block font-mono text-xs text-white/60 uppercase tracking-widest">Website_URI</label>
                  <input 
                    id="website" 
                    placeholder="https://..." 
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full bg-transparent border border-white/20 px-4 py-3 font-mono text-sm text-white focus:border-[#ff4500] focus:outline-none transition-colors rounded-none placeholder:text-white/20"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full bg-[#ff4500] hover:bg-[#ff4500]/80 text-white font-heading font-bold uppercase tracking-widest py-4 px-8 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="animate-pulse">Processing_Update...</span>
                    </>
                  ) : (
                    <>
                      <span>Execute_Save</span>
                      <span className="font-mono text-xs opacity-70">↵</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
