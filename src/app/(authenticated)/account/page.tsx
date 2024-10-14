import { ContentLayout } from '@/components/layouts/content-layout';
import { FileText } from 'lucide-react';

export default function AccountPage() {
  return (
    <ContentLayout title="Account">
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <h1 className="text-2xl font-bold">Account</h1>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}
