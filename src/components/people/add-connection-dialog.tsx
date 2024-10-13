'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { UserPlus, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

const addConnectionSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type FormData = z.infer<typeof addConnectionSchema>;

async function addConnection(email: string): Promise<void> {
  const response = await fetch('/api/connections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to add connection');
  }
}

async function checkUserExists(email: string): Promise<boolean> {
  const response = await fetch(
    `/api/users/exists?email=${encodeURIComponent(email)}`
  );
  if (!response.ok) {
    throw new Error('Failed to check user existence');
  }
  return response.json();
}

export function AddConnectionDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const queryClient = useQueryClient();

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
      toast.success('Connection request sent successfully');
      setIsOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(`Failed to add connection: ${error.message}`);
    },
  });

  const onSubmit = (data: FormData) => {
    if (!userExists) {
      toast.error('User does not exist');
      return;
    }
    addConnectionMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Connection
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Connection</DialogTitle>
          <DialogDescription>
            Enter the email address of the person you want to connect with.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>
                  {isCheckingUser && (
                    <p className="text-sm text-gray-500">Checking user...</p>
                  )}
                  {!isCheckingUser && debouncedEmail && (
                    <p
                      className={`text-sm ${userExists ? 'text-green-500' : 'text-red-500'}`}
                    >
                      {userExists ? 'User found' : 'User not found'}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                disabled={
                  addConnectionMutation.isPending ||
                  isCheckingUser ||
                  !userExists
                }
              >
                {addConnectionMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Request'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
