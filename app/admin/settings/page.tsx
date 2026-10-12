'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TeamSettingsPage() {
  const [activeTab, setActiveTab] = useState('team');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [platformSettings, setPlatformSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [teamData, templatesData, settingsData] = await Promise.all([
      fetch('/api/admin/team-members').then(r => r.json()),
      supabase.from('marketplace_email_templates').select('*'),
      supabase.from('marketplace_platform_settings').select('*'),
    ]);

    setTeamMembers(teamData || []);
    setEmailTemplates(templatesData.data || []);
    setPlatformSettings(settingsData.data || []);
    setLoading(false);
  };


  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-900">Team Settings</h1>
          <p className="text-slate-600">Manage team access, email templates, and platform settings</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'team'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Team Members
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'email'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Email Templates
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'settings'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Platform Settings
          </button>
        </div>

        {/* Team Members Tab */}
        {activeTab === 'team' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Team Members</h2>
              <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition">
                Add Team Member
              </button>
            </div>

            {teamMembers.length === 0 ? (
              <p className="text-slate-500">No team members yet</p>
            ) : (
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{member.auth.users?.email || 'Unknown'}</p>
                      <p className="text-sm text-slate-500 capitalize">{member.role}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        member.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <button className="text-sm text-indigo-600 hover:text-indigo-700">
                        Edit Role
                      </button>
                      <button className="text-sm text-red-600 hover:text-red-700">
                        Deactivate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Email Templates Tab */}
        {activeTab === 'email' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Email Templates</h2>

            {emailTemplates.length === 0 ? (
              <p className="text-slate-500">No email templates configured</p>
            ) : (
              <div className="space-y-4">
                {emailTemplates.map((template) => (
                  <div key={template.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-slate-900">{template.template_key}</h3>
                        <p className="text-sm text-slate-500">{template.trigger_condition}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        template.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm font-medium text-slate-500">Subject</p>
                      <p className="text-slate-900">{template.subject}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-sm text-indigo-600 hover:text-indigo-700">
                        Edit
                      </button>
                      <button className="text-sm text-slate-600 hover:text-slate-700">
                        {template.is_active ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Platform Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Platform Settings</h2>

            {platformSettings.length === 0 ? (
              <p className="text-slate-500">No platform settings configured</p>
            ) : (
              <div className="space-y-4">
                {platformSettings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{setting.setting_key}</p>
                      <p className="text-sm text-slate-500">{setting.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-900 font-medium">
                        {typeof setting.setting_value === 'object' 
                          ? JSON.stringify(setting.setting_value) 
                          : String(setting.setting_value)}
                      </span>
                      <button className="text-sm text-indigo-600 hover:text-indigo-700">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
