import CardWrapper from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { Suspense } from 'react';
import DashboardSkeleton, { RevenueChartSkeleton } from '@/app/ui/skeletons';


export default async function Overview() {
	return (
	<main>
			<Suspense fallback={<DashboardSkeleton />}>
				<CardWrapper />
			</Suspense>
			<div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-3">
				<Suspense fallback={<RevenueChartSkeleton />}>
					<RevenueChart />
					<LatestInvoices />
				</Suspense>
				</div>
	</main>
	);
}