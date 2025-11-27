import { Card } from '@/components/ui/card';
import { Database } from 'lucide-react';

export default function StatsPage() {
  return (
    <div className="bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Statistics</h1>
        <p className="text-gray-600 mt-1">Detailed system performance metrics and analytics</p>
      </div>

      <Card className="p-12 text-center">
        <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">System Stats Coming Soon</h3>
        <p className="text-gray-600">
          This page will display comprehensive system statistics and performance metrics.
        </p>
      </Card>
    </div>
  );
}
