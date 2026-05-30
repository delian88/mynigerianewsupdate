import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, UserCheck, UserX, Shield, Calendar, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

interface Profile {
  id: string;
  email: string;
  role: 'super_admin' | 'user';
  created_at: string;
}

export default function UserManagement() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data as Profile[] || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleRoleChange = async (profileId: string, currentRole: 'super_admin' | 'user') => {
    const newRole = currentRole === 'super_admin' ? 'user' : 'super_admin';
    const confirmMsg = `Are you sure you want to change this user's role to ${newRole === 'super_admin' ? 'Super Admin' : 'Standard User'}?`;
    
    if (!window.confirm(confirmMsg)) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', profileId);

      if (error) throw error;

      toast.success(`Role updated to ${newRole}`);
      
      // Update local state
      setProfiles(prev =>
        prev.map(p => p.id === profileId ? { ...p, role: newRole } : p)
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user role');
    }
  };

  const filteredProfiles = profiles.filter(p =>
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-nag-black uppercase tracking-tight">
            User Management
          </h1>
          <p className="text-xs text-nag-gray-deep opacity-60 font-medium">
            Manage system roles, administrative access, and registered accounts.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md bg-white rounded-xl shadow-sm border border-nag-border overflow-hidden">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users by email address..."
          className="w-full pl-11 pr-4 py-3.5 outline-none font-medium text-sm text-nag-black"
        />
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>

      {/* Profiles Grid/Table */}
      <div className="bg-white rounded-3xl border border-nag-border shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-nag-green-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-nag-gray-deep uppercase tracking-widest">Loading accounts...</p>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="p-20 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-nag-gray-bg flex items-center justify-center text-gray-400 mx-auto">
              <Mail size={20} />
            </div>
            <h3 className="font-bold text-nag-black">No accounts found</h3>
            <p className="text-xs text-nag-gray-deep opacity-60">Try searching for another email or register a new user.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-nag-gray-bg border-b border-nag-border text-[9px] font-black uppercase tracking-widest text-nag-gray-deep">
                  <th className="py-4 px-6">User Account</th>
                  <th className="py-4 px-6">Created At</th>
                  <th className="py-4 px-6">System Role</th>
                  <th className="py-4 px-6 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nag-border/60">
                {filteredProfiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-nag-gray-bg/40 transition-colors">
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-nag-green-primary/10 text-nag-green-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {profile.email[0]}
                        </div>
                        <span className="text-sm font-bold text-nag-black truncate max-w-xs">{profile.email}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-1.5 text-xs text-nag-gray-deep font-medium">
                        <Calendar size={12} className="opacity-60" />
                        {new Date(profile.created_at).toLocaleDateString('en-NG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        profile.role === 'super_admin'
                          ? 'bg-nag-green-primary/10 text-nag-green-primary'
                          : 'bg-nag-gray-light text-nag-gray-deep'
                      }`}>
                        <Shield size={10} />
                        {profile.role === 'super_admin' ? 'Super Admin' : 'Standard User'}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <button
                        onClick={() => handleRoleChange(profile.id, profile.role)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          profile.role === 'super_admin'
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-nag-green-primary/5 text-nag-green-primary hover:bg-nag-green-primary hover:text-white'
                        }`}
                      >
                        {profile.role === 'super_admin' ? (
                          <>
                            <UserX size={14} /> Demote to User
                          </>
                        ) : (
                          <>
                            <UserCheck size={14} /> Promote to Admin
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
