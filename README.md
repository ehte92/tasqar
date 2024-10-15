# Tasqar - Collaborative Task Management Platform

Tasqar is a modern, feature-rich task management application built with Next.js, React, and TypeScript. It provides teams with a powerful set of tools to collaborate, organize, and track their projects and tasks efficiently.

## Features

- **User Authentication**: Secure login and registration system with email verification.
- **Dashboard**: Personalized overview of tasks, projects, and team activities.
- **Task Management**: Create, assign, update, and delete tasks with ease.
- **Project Management**: Organize tasks into projects and track project progress.
- **Kanban Board**: Visual task management with drag-and-drop functionality.
- **Team Collaboration**: Connect with team members and assign tasks collaboratively.
- **Real-time Updates**: Stay informed with instant notifications on task and project changes.
- **Responsive Design**: Seamless experience across desktop and mobile devices.
- **Dark Mode**: Toggle between light and dark themes for comfortable viewing.
- **Internationalization**: Support for multiple languages (currently English and Arabic).

## Tech Stack

- **Frontend**: React, Next.js, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI, Radix UI
- **State Management**: Zustand, TanStack React Query
- **Form Handling**: React Hook Form, Zod
- **Authentication**: NextAuth.js
- **Database**: Prisma ORM with PostgreSQL
- **API**: Next.js API Routes
- **Internationalization**: react-i18next
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or Yarn
- PostgreSQL database

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/tasqar.git
   cd tasqar
   ```

2. Install dependencies:

   ```
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:

   - Copy the `.env.example` file to `.env.local`
   - Fill in the required environment variables, including database connection string and NextAuth secret

4. Set up the database:

   ```
   npx prisma migrate dev
   ```

5. Run the development server:

   ```
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Running Tests

To run the test suite:

```
npm run test
# or
yarn test
```

## Deployment

The project is set up for easy deployment on Vercel. Connect your GitHub repository to Vercel and it will automatically deploy your main branch.

For other deployment options, refer to the [Next.js deployment documentation](https://nextjs.org/docs/deployment).

## Contributing

We welcome contributions to Tasqar! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) file for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org) for the awesome React framework
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- [Shadcn UI](https://ui.shadcn.com) for beautiful and accessible UI components
- [Vercel](https://vercel.com) for hosting and deployment

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.

---

Happy task managing with Tasqar! 🚀
