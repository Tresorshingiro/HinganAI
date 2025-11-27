import { Card } from '@/components/ui/card';
import { Activity } from 'lucide-react';

export default function ActivityPage() {
  return (
    <div className="bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
        <p className="text-gray-600 mt-1">Monitor user activity and system events</p>
      </div>

      <Card className="p-12 text-center">
        <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Activity Logs Coming Soon</h3>
        <p className="text-gray-600">
          This page will display detailed activity logs and user interactions.
        </p>
      </Card>
    </div>
  );
}
