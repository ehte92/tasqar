import { ConnectionStatus } from '@prisma/client';

export interface UserConnection {
  id: string;
  status: ConnectionStatus;
  createdAt: Date;
  updatedAt: Date;
  senderId: string;
  receiverId: string;
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
}
