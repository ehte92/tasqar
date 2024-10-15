'use client';

import { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { PlusIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

import { ProjectForm } from './project-form';

export function CreateProjectButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation('project');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg">
            <PlusIcon className="mr-2 h-4 w-4" />
            {t('createProject')}
          </Button>
        </motion.div>
      </DialogTrigger>
      <AnimatePresence>
        {isOpen && (
          <DialogContent className="sm:max-w-[425px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <ProjectForm onSuccess={() => setIsOpen(false)} />
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
