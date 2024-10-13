import React from 'react';
import { ConnectionStatus, UserConnection } from '@prisma/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  UserX,
  MessageSquare,
  UserCheck,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export type ExtendedUserConnection = UserConnection & {
  sender: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  receiver: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

interface ConnectionCardProps {
  connection: ExtendedUserConnection;
  currentUserId: string;
  onRemove: () => void;
  onAccept?: () => void;
}

export function ConnectionCard({
  connection,
  currentUserId,
  onRemove,
  onAccept,
}: ConnectionCardProps) {
  const otherUser =
    connection.senderId === currentUserId
      ? connection.receiver
      : connection.sender;
  const isPending = connection.status === ConnectionStatus.PENDING;
  const isReceiver = connection.receiverId === currentUserId;

  return (
    <Card className="hover:shadow-md transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {otherUser.name || otherUser.email}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onRemove}>
              <UserX className="mr-2 h-4 w-4" />
              <span>{isPending ? 'Cancel Request' : 'Remove Connection'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage
              src={otherUser.image || undefined}
              alt={otherUser.name || 'User'}
            />
            <AvatarFallback>
              {otherUser.name?.[0] || otherUser.email[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{otherUser.email}</p>
            <CardDescription className="text-xs">
              {isPending
                ? `${isReceiver ? 'Received' : 'Sent'} ${formatDistanceToNow(new Date(connection.createdAt))} ago`
                : `Connected ${formatDistanceToNow(new Date(connection.updatedAt))} ago`}
            </CardDescription>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {isPending && isReceiver ? (
          <Button className="w-full" onClick={onAccept}>
            <UserCheck className="mr-2 h-4 w-4" />
            Accept Request
          </Button>
        ) : isPending ? (
          <Button variant="secondary" className="w-full" disabled>
            <Clock className="mr-2 h-4 w-4" />
            Pending
          </Button>
        ) : (
          <Button variant="secondary" className="w-full">
            <MessageSquare className="mr-2 h-4 w-4" />
            Message
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
