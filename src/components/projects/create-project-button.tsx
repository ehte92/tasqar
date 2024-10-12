'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProjectForm } from './project-form';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

export function CreateProjectButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Create Project</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <ProjectForm onSuccess={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
