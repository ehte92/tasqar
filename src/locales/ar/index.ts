import 'dayjs/locale/ar';

import account from './account.json';
import common from './common.json';
import connection from './connection.json';
import landing from './landing.json';
import menu from './menu.json';
import project from './project.json';
import task from './task.json';

export default {
  common,
  landing,
  menu,
  connection,
  task,
  project,
  account,
} as const;
