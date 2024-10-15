'use client';

import { useRef, useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock, Mail, Upload, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

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

// Custom hook for fetching user data
const useUserData = () => {
  return useQuery<UserData, Error>({
    queryKey: ['userData'],
    queryFn: async () => {
      const response = await fetch('/api/users/me');
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      return response.json();
    },
  });
};

// Custom hook for updating user profile
const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userData: Partial<UserData>) => {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userData'] });
    },
  });
};

// Custom hook for changing password
const useChangePassword = () => {
  return useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update password');
      }
      return response.json();
    },
  });
};

// Custom hook for uploading avatar
const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userData'] });
    },
  });
};

export default function AccountPage() {
  const { t } = useTranslation('account');
  const { data: session } = useSession();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: user, isLoading: isLoadingUser } = useUserData();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const uploadAvatar = useUploadAvatar();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateProfile.mutate({ [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateProfile.mutateAsync({ name: user.name });
      toast.success(t('profileUpdated'), {
        description: t('profileUpdatedDescription'),
      });
    } catch (error) {
      toast.error(t('error'), {
        description: (error as Error).message,
      });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError(t('passwordsDontMatch'));
      return;
    }

    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      toast.success(t('passwordUpdated'), {
        description: t('passwordUpdatedDescription'),
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordError((error as Error).message);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadAvatar.mutateAsync(file);
      toast.success(t('avatarUploaded'), {
        description: t('avatarUploadedDescription'),
      });
    } catch (error) {
      toast.error(t('error'), {
        description: (error as Error).message,
      });
    }
  };

  if (isLoadingUser) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex justify-center items-center h-screen"
      >
        {t('loading')}
      </motion.div>
    );
  }

  if (!user) {
    return <div>{t('userNotFound')}</div>;
  }

  return (
    <ContentLayout title={t('account')}>
      <motion.div
        className="container mx-auto py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center space-x-4 mb-6">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
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
              <motion.div
                className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Upload className="h-4 w-4" />
              </motion.div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
              />
            </motion.div>
            <h2 className="text-2xl font-semibold">{user.name || t('user')}</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <AnimatePresence>
                {['name', 'email'].map((field) => (
                  <motion.div
                    key={field}
                    className="space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label
                      htmlFor={field}
                      className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center"
                    >
                      {field === 'name' ? (
                        <User className="h-4 w-4 mr-2" />
                      ) : (
                        <Mail className="h-4 w-4 mr-2" />
                      )}
                      {t(field)}
                    </label>
                    <Input
                      type={field === 'email' ? 'email' : 'text'}
                      id={field}
                      name={field}
                      value={user[field as keyof UserData] || ''}
                      onChange={handleInputChange}
                      readOnly={field === 'email'}
                      className={`w-full ${
                        field === 'email' ? 'bg-gray-100 dark:bg-gray-700' : ''
                      }`}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <motion.div
              className="mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? t('saving') : t('saveChanges')}
              </Button>
            </motion.div>
          </form>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 shadow rounded-lg p-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-xl font-semibold mb-4">{t('changePassword')}</h3>
          <form onSubmit={handlePasswordChange}>
            <div className="space-y-4">
              <AnimatePresence>
                {['currentPassword', 'newPassword', 'confirmPassword'].map(
                  (field) => (
                    <motion.div
                      key={field}
                      className="space-y-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <label
                        htmlFor={field}
                        className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        {t(field)}
                      </label>
                      <Input
                        type="password"
                        id={field}
                        value={
                          field === 'currentPassword'
                            ? currentPassword
                            : field === 'newPassword'
                              ? newPassword
                              : confirmPassword
                        }
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          field === 'currentPassword'
                            ? setCurrentPassword(e.target.value)
                            : field === 'newPassword'
                              ? setNewPassword(e.target.value)
                              : setConfirmPassword(e.target.value)
                        }
                        className="w-full"
                        required
                      />
                    </motion.div>
                  )
                )}
              </AnimatePresence>
            </div>
            <AnimatePresence>
              {passwordError && (
                <motion.p
                  className="text-red-500 mt-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {passwordError}
                </motion.p>
              )}
            </AnimatePresence>
            <motion.div
              className="mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={changePassword.isPending}
              >
                {changePassword.isPending ? t('changing') : t('changePassword')}
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </ContentLayout>
  );
}
