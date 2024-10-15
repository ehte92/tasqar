'use client';

import { useEffect, useRef, useState } from 'react';

import { motion } from 'framer-motion';
import { FileText, Lock, Mail, Upload, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';

import { ContentLayout } from '@/components/layouts/content-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface UserData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export default function AccountPage() {
  const { t } = useTranslation('account');
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
      setPasswordError(t('passwordsDontMatch'));
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
      setPasswordError(data.error || t('failedToUpdatePassword'));
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
    return <div>{t('loading')}</div>;
  }

  return (
    <ContentLayout title={t('account')}>
      <motion.div
        className="container mx-auto py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <FileText className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            <h1 className="text-3xl font-bold">{t('account')}</h1>
          </div>
        </div>

        <motion.div
          className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              <Avatar
                className="h-16 w-16 border-2 border-dotted border-gray-400 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <AvatarImage
                  src={user.image || ''}
                  alt={user.name || t('user')}
                />
                <AvatarFallback>
                  <User className="h-8 w-8 text-gray-600" />
                </AvatarFallback>
              </Avatar>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
              />
            </div>
            <h2 className="text-2xl font-semibold">{user.name || t('user')}</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center"
                >
                  <User className="h-4 w-4 mr-2" />
                  {t('name')}
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
                  {t('email')}
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
                {t('saveChanges')}
              </Button>
            </div>
          </form>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 shadow rounded-lg p-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-semibold mb-4">{t('changePassword')}</h3>
          <form onSubmit={handlePasswordChange}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="currentPassword"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {t('currentPassword')}
                </label>
                <Input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCurrentPassword(e.target.value)
                  }
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
                  {t('newPassword')}
                </label>
                <Input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewPassword(e.target.value)
                  }
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
                  {t('confirmNewPassword')}
                </label>
                <Input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setConfirmPassword(e.target.value)
                  }
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
                {t('changePassword')}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </ContentLayout>
  );
}
