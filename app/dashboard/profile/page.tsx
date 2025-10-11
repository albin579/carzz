"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3001/api/profile', {
        headers: { 'x-auth-token': token },
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3001/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        // Optionally show a success message
        console.log('Profile updated successfully');
      }
    } catch (error) {
      console.error('Failed to update profile', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <h1 className="text-4xl font-bold">Profile Information</h1>
      <form onSubmit={handleUpdate} className="space-y-8 max-w-4xl">
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label htmlFor="first_name" className="text-base">First name</Label>
            <Input id="first_name" name="first_name" value={profile.first_name || ''} onChange={handleChange} className="h-12 text-base" />
          </div>
          <div className="space-y-3">
            <Label htmlFor="last_name" className="text-base">Last name</Label>
            <Input id="last_name" name="last_name" value={profile.last_name || ''} onChange={handleChange} className="h-12 text-base" />
          </div>
        </div>
        <div className="space-y-3">
          <Label htmlFor="email" className="text-base">Primary email</Label>
          <Input id="email" name="email" type="email" value={profile.email || ''} onChange={handleChange} className="h-12 text-base" />
          <p className="text-sm text-muted-foreground">Primary email is used for account notifications.</p>
        </div>
        <div className="space-y-3">
          <Label htmlFor="phone" className="text-base">Phone</Label>
          <Input id="phone" name="phone" value={profile.phone || ''} onChange={handleChange} className="h-12 text-base" />
          <p className="text-sm text-muted-foreground">Phone appears as a display name throughout the dashboard.</p>
        </div>
        <div className="flex justify-end">
          <Button type="submit" size="lg">Save</Button>
        </div>
      </form>
    </div>
  );
}
