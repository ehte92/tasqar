import React from 'react';

import { ConnectionStatus, UserConnection } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Clock,
  MessageSquare,
  MoreHorizontal,
  UserCheck,
  UserX,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
  const { t } = useTranslation('connection');
  const otherUser =
    connection.senderId === currentUserId
      ? connection.receiver
      : connection.sender;
  const isPending = connection.status === ConnectionStatus.PENDING;
  const isReceiver = connection.receiverId === currentUserId;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-md transition-all duration-300 bg-gradient-to-br from-background to-secondary/10">
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
                <span>
                  {isPending ? t('cancelRequest') : t('removeConnection')}
                </span>
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
                  ? t(isReceiver ? 'received' : 'sent', {
                      time: formatDistanceToNow(new Date(connection.createdAt)),
                    })
                  : t('connected', {
                      time: formatDistanceToNow(new Date(connection.updatedAt)),
                    })}
              </CardDescription>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {isPending && isReceiver ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  className="w-full"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button className="w-full" onClick={onAccept}>
                    <UserCheck className="mr-2 h-4 w-4" />
                    {t('accept')}
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>{t('acceptTooltip')}</TooltipContent>
            </Tooltip>
          ) : isPending ? (
            <Button variant="secondary" className="w-full" disabled>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              {t('pending')}
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  className="w-full"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button variant="secondary" className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {t('message')}
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>{t('messageTooltip')}</TooltipContent>
            </Tooltip>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
