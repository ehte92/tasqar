'use client';

import { useEffect, useRef, useState } from 'react';

import { FileText, Lock, Mail, Upload, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

import { ContentLayout } from '@/components/layouts/content-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface UserData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export default function AccountPage() {
  const { data: session } = useSession();
  const [user, setUser] = useState<UserData | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const response = await fetch('/api/users/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        console.error('Failed to fetch user data');
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prevUser) => (prevUser ? { ...prevUser, [name]: value } : null));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const response = await fetch('/api/users/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: user.name }),
    });

    if (response.ok) {
      console.log('User data updated successfully');
    } else {
      console.error('Failed to update user data');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    const response = await fetch('/api/users/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (response.ok) {
      console.log('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      const data = await response.json();
      setPasswordError(data.error || 'Failed to update password');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch('/api/users/avatar', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      setUser((prevUser) =>
        prevUser ? { ...prevUser, image: data.image } : null
      );
    } else {
      console.error('Failed to upload avatar');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <ContentLayout title="Account">
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <FileText className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            <h1 className="text-3xl font-bold">Account</h1>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || 'User'}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-600" />
                </div>
              )}
              <Button
                size="sm"
                className="absolute bottom-0 right-0"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
              />
            </div>
            <h2 className="text-2xl font-semibold">{user.name || 'User'}</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center"
                >
                  <User className="h-4 w-4 mr-2" />
                  Name
                </label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={user.name || ''}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={user.email}
                  readOnly
                  className="w-full bg-gray-100 dark:bg-gray-700"
                />
              </div>
            </div>
            <div className="mt-6">
              <Button type="submit" className="w-full sm:w-auto">
                Save Changes
              </Button>
            </div>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Change Password</h3>
          <form onSubmit={handlePasswordChange}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="currentPassword"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Current Password
                </label>
                <Input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="newPassword"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  New Password
                </label>
                <Input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full"
                  required
                />
              </div>
            </div>
            {passwordError && (
              <p className="text-red-500 mt-2">{passwordError}</p>
            )}
            <div className="mt-6">
              <Button type="submit" className="w-full sm:w-auto">
                Change Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ContentLayout>
  );
}
