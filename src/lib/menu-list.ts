import {
  Users,
  Settings,
  SquarePen,
  LayoutGrid,
  LucideIcon,
} from 'lucide-react';

export type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

export type MenuItem = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

export type MenuGroup = {
  groupLabel: string;
  menus: MenuItem[];
};

export function getMenuList(pathname: string): MenuGroup[] {
  return [
    {
      groupLabel: '',
      menus: [
        {
          href: '/dashboard',
          label: 'Dashboard',
          active: pathname.includes('/dashboard'),
          icon: LayoutGrid,
          submenus: [],
        },
        {
          href: '/tasks',
          label: 'Tasks',
          active: pathname.includes('/tasks'),
          icon: SquarePen,
          submenus: [],
        },
      ],
    },
    // {
    //   groupLabel: "Contents",
    //   menus: [
    //     {
    //       href: "",
    //       label: "Posts",
    //       active: pathname.includes("/posts"),
    //       icon: SquarePen,
    //       submenus: [
    //         {
    //           href: "/posts",
    //           label: "All Posts"
    //         },
    //         {
    //           href: "/posts/new",
    //           label: "New Post"
    //         }
    //       ]
    //     },
    //     {
    //       href: "/categories",
    //       label: "Categories",
    //       active: pathname.includes("/categories"),
    //       icon: Bookmark
    //     },
    //     {
    //       href: "/tags",
    //       label: "Tags",
    //       active: pathname.includes("/tags"),
    //       icon: Tag
    //     }
    //   ]
    // },
    {
      groupLabel: 'Settings',
      menus: [
        {
          href: '/users',
          label: 'Users',
          active: pathname.includes('/users'),
          icon: Users,
        },
        {
          href: '/account',
          label: 'Account',
          active: pathname.includes('/account'),
          icon: Settings,
        },
      ],
    },
  ];
}
