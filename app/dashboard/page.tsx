import { lusitana } from '@/app/ui/fonts';
import { Suspense } from 'react';
import DashboardSkeleton from '../ui/skeletons';
import Overview from './(overview)/page';

export default async function DashboardPage() {
  return (
  <main>
    <h1 className={`${lusitana.className} b-4 text-xl md:text-2xl`}>Dashboard</h1>
	
		<Suspense fallback={<DashboardSkeleton />}>
     		<Overview />
		</Suspense>
  </main>
  );
}