import {
  Briefcase,
  LayoutGrid,
  LucideIcon,
  Settings,
  SquarePen,
  Users,
} from 'lucide-react';

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
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
        {
          href: '/projects',
          label: 'Projects',
          active: pathname.includes('/projects'),
          icon: Briefcase,
          submenus: [],
        },
        {
          href: '/people',
          label: 'People',
          active: pathname.includes('/people'),
          icon: Users,
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
        // {
        //   href: '/users',
        //   label: 'Users',
        //   active: pathname.includes('/users'),
        //   icon: Users,
        // },
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
