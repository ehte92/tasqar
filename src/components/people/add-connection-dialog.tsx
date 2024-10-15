'use client';

import React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import {
  addConnection,
  checkUserExists,
  inviteUser,
} from '@/lib/api/connections';

const addConnectionSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type FormData = z.infer<typeof addConnectionSchema>;

export function AddConnectionDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const { t } = useTranslation('connection');

  const form = useForm<FormData>({
    resolver: zodResolver(addConnectionSchema),
    defaultValues: {
      email: '',
    },
  });

  const email = form.watch('email');
  const debouncedEmail = useDebounce(email, 300);

  const { data: userExists, isLoading: isCheckingUser } = useQuery({
    queryKey: ['userExists', debouncedEmail],
    queryFn: () => checkUserExists(debouncedEmail),
    enabled: !!debouncedEmail && debouncedEmail.includes('@'),
  });

  const addConnectionMutation = useMutation({
    mutationFn: (data: FormData) => addConnection(data.email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success(t('connectionRequestSentSuccess'));
      setIsOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(t('failedToAddConnection', { error: error.message }));
    },
  });

  const inviteUserMutation = useMutation({
    mutationFn: (email: string) => inviteUser(email),
    onSuccess: () => {
      toast.success(t('invitationSentSuccess'));
      setIsOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(t('failedToSendInvitation', { error: error.message }));
    },
  });

  const onSubmit = (data: FormData) => {
    if (userExists) {
      addConnectionMutation.mutate(data);
    } else {
      inviteUserMutation.mutate(data.email);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          {t('addConnection')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('addNewConnection')}</DialogTitle>
          <DialogDescription>{t('addConnectionDescription')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('emailPlaceholder')} {...field} />
                  </FormControl>
                  <AnimatePresence mode="wait">
                    {isCheckingUser && (
                      <motion.p
                        key="checking"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-gray-500"
                      >
                        {t('checkingUser')}
                      </motion.p>
                    )}
                    {!isCheckingUser && debouncedEmail && (
                      <motion.p
                        key={userExists ? 'found' : 'not-found'}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`text-sm ${
                          userExists ? 'text-green-500' : 'text-yellow-500'
                        }`}
                      >
                        {userExists ? t('userFound') : t('userNotFound')}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                disabled={
                  addConnectionMutation.isPending ||
                  inviteUserMutation.isPending ||
                  isCheckingUser
                }
              >
                {addConnectionMutation.isPending ||
                inviteUserMutation.isPending ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center"
                  >
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {userExists ? t('sendingRequest') : t('inviting')}
                  </motion.div>
                ) : (
                  <motion.span
                    key={userExists ? 'send' : 'invite'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {userExists ? t('sendRequest') : t('inviteUser')}
                  </motion.span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
