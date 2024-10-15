import { NotificationType, PrismaClient } from '@prisma/client';
import { isAfter, subDays } from 'date-fns';

import { notificationService } from '@/services/notification-service';

const prisma = new PrismaClient();

export async function checkTaskDueDates() {
  const now = new Date();
  const twoDaysFromNow = subDays(now, 2);

  const tasks = await prisma.task.findMany({
    where: {
      dueDate: {
        not: null,
      },
      status: {
        not: 'DONE',
      },
    },
    include: {
      assignee: true,
    },
  });

  for (const task of tasks) {
    if (task.dueDate && task.assignee) {
      if (isAfter(now, task.dueDate)) {
        await notificationService.createNotification(
          task.assignee.id,
          NotificationType.TASK_OVERDUE,
          `Task "${task.title}" is overdue`,
          task.id
        );
      } else if (
        isAfter(task.dueDate, twoDaysFromNow) &&
        isAfter(task.dueDate, now)
      ) {
        await notificationService.createNotification(
          task.assignee.id,
          NotificationType.TASK_DUE_SOON,
          `Task "${task.title}" is due in 2 days`,
          task.id
        );
      }
    }
  }
}
