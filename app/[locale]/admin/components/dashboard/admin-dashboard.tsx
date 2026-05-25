'use client'

import Link from "next/link"
import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { getNewsletterStats, getUserStats } from '../../actions/stats'
import { Badge } from '@/components/ui/badge'
import {
	unifiedChipClassName,
	unifiedInsetPanelClassName,
	unifiedSectionPanelClassName,
} from '@/components/layout/unified-page-recipes'
import { cn } from '@/lib/utils'
import { FreeUsersTable } from './free-users-table'
import {
	Building2,
	Mail,
	MessageSquareText,
	Send,
	Sparkles,
	UserPlus,
	BarChart3,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionsTable } from "@/app/[locale]/admin/components/payments/transactions-table"
import { SubscriptionsTable } from "@/app/[locale]/admin/components/payments/subscriptions-table"
import { getTransactionsAction, getSubscriptionsAction } from "@/app/[locale]/admin/actions/payment-actions"

const UserGrowthChart = dynamic(() => import('./user-growth-chart').then(m => ({ default: m.UserGrowthChart })), {
	loading: () => <div className="h-[400px] animate-pulse rounded-lg bg-muted/30" />,
})

interface User {
	id: string
	email: string
	created_at: string
}

interface DashboardTransaction {
	id: string
	amount: number
	status: string
	type: string
	createdAt: Date
	user: {
		email: string
	}
}

interface DashboardSubscription {
	id: string
	userId: string
	plan: string
	status: string
	interval: string | null
	endDate: Date | null
	user: {
		email: string
	}
}

function valueFormatter(number: number) {
	return `${Intl.NumberFormat('us').format(number).toString()}`
}

export function AdminDashboard() {
	const [userStats, setUserStats] = useState<{
		totalUsers: number
		dailyData: { date: string, users: number }[]
		allUsers: User[]
	}>({ totalUsers: 0, dailyData: [], allUsers: [] })

	const [newsletterStats, setNewsletterStats] = useState<{
		totalSubscribers: number
		activeSubscribers: number
		inactiveSubscribers: number
	}>({ totalSubscribers: 0, activeSubscribers: 0, inactiveSubscribers: 0 })

	const [paymentData, setPaymentData] = useState<{
		transactions: DashboardTransaction[]
		subscriptions: DashboardSubscription[]
	}>({ transactions: [], subscriptions: [] })

	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		async function fetchData() {
			try {
				const [userData, newsletterData, txnRes, subRes] = await Promise.all([
					getUserStats(),
					getNewsletterStats(),
					getTransactionsAction({ limit: 20 }),
					getSubscriptionsAction(),
				])

				setUserStats({
					totalUsers: userData.totalUsers,
					dailyData: userData.dailyData.map(item => ({
						date: item.date,
						users: Number(item.users)
					})),
					allUsers: userData.allUsers
				})
				setNewsletterStats(newsletterData)
				setPaymentData({
					transactions: txnRes.success
						? (txnRes.transactions || []).map((txn) => ({
							...txn,
							amount: Number(txn.amount),
							createdAt: new Date(txn.createdAt),
						}))
						: [],
					subscriptions: subRes.success
						? (subRes.subscriptions || []).map((sub) => ({
							...sub,
							endDate: sub.endDate ? new Date(sub.endDate) : null,
						}))
						: [],
				})
			} catch (error) {
				console.error('Error fetching admin dashboard data:', error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchData()
	}, [])

	if (isLoading) {
		return (
			<div className="p-6">
				<div className="animate-pulse space-y-4">
					<div className="h-8 w-1/4 rounded bg-muted/50"></div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="h-32 rounded bg-muted/50"></div>
						<div className="h-32 rounded bg-muted/50"></div>
						<div className="h-32 rounded bg-muted/50"></div>
					</div>
					<div className="h-80 rounded bg-muted/50"></div>
				</div>
			</div>
		)
	}


	return (
		<div className="space-y-6 p-4 sm:p-6">
			<Card className={cn(unifiedSectionPanelClassName, 'p-6')}>
				<div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
					<div className="space-y-1">
						<p className="text-sm uppercase tracking-[0.12em] text-muted-foreground">Admin Tools</p>
						<h2 className="text-2xl font-semibold tracking-tight">Operations hub</h2>
						<p className="text-sm text-muted-foreground">
							Fast access to the same internal admin workflows used for newsletters, recap emails, and platform management.
						</p>
					</div>
					<Badge variant="secondary" className={cn(unifiedChipClassName, 'w-fit')}>
						<Sparkles className="mr-2 h-3.5 w-3.5" />
						Internal only
					</Badge>
				</div>

				<div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
					{[
						{
							href:"./newsletter-builder",
							label:"Newsletter Builder",
							description:"Draft, preview, and send product updates.",
							icon: Mail,
						},
						{
							href:"./weekly-recap",
							label:"Weekly Recap",
							description:"Preview the automated trader recap email.",
							icon: BarChart3,
						},
						{
							href:"./welcome-email",
							label:"Welcome Email",
							description:"Tune the onboarding email for new users.",
							icon: UserPlus,
						},
						{
							href:"./send-email",
							label:"Send Email",
							description:"Choose a template and send targeted campaigns.",
							icon: Send,
						},
						{
							href:"./propfirms",
							label:"Prop Firms",
							description:"Manage the prop-firm catalogue and reviews.",
							icon: Building2,
						},
						{
							href:"./reviews",
							label:"Reviews",
							description:"Review and curate prop-firm feedback.",
							icon: MessageSquareText,
						},
					].map((item) => {
						const Icon = item.icon

						return (
							<Link
								key={item.label}
								href={item.href}
								className={cn(unifiedInsetPanelClassName, 'group p-4 transition-[opacity,background-color,border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-primary/18 hover:bg-background/78 hover:shadow-[0_18px_30px_-24px_hsl(var(--foreground)/0.45)]')}
							>
								<div className="flex items-start gap-3">
									<div className="rounded-lg border border-border/30 bg-muted p-2 text-foreground transition-colors group-hover:bg-foreground group-hover:text-background">
										<Icon className="h-4 w-4" />
									</div>
									<div className="space-y-1">
										<div className="font-medium leading-none">{item.label}</div>
										<p className="text-sm text-muted-foreground">{item.description}</p>
									</div>
								</div>
							</Link>
						)
					})}
				</div>
			</Card>

			<div className="grid gap-4 md:grid-cols-3">
				<Card className={cn(unifiedInsetPanelClassName, 'p-5')}>
					<p className="text-sm text-muted-foreground">Active subscribers</p>
					<div className="mt-2 text-3xl font-semibold">{valueFormatter(newsletterStats.activeSubscribers)}</div>
					<p className="mt-1 text-sm text-muted-foreground">
						People currently receiving newsletter sends.
					</p>
				</Card>

				<Card className={cn(unifiedInsetPanelClassName, 'p-5')}>
					<p className="text-sm text-muted-foreground">Paused subscribers</p>
					<div className="mt-2 text-3xl font-semibold">{valueFormatter(newsletterStats.inactiveSubscribers)}</div>
					<p className="mt-1 text-sm text-muted-foreground">
						Unsubscribed or inactive newsletter records.
					</p>
				</Card>

				<Card className={cn(unifiedInsetPanelClassName, 'p-5')}>
					<p className="text-sm text-muted-foreground">Newsletter coverage</p>
					<div className="mt-2 text-3xl font-semibold">
						{userStats.totalUsers > 0
							? `${Math.round((newsletterStats.activeSubscribers / userStats.totalUsers) * 100)}%`
							: '0%'}
					</div>
					<p className="mt-1 text-sm text-muted-foreground">
						Active subscribers compared with total platform users.
					</p>
				</Card>
			</div>

			<Tabs defaultValue="overview" className="w-full">
				<TabsList className="border border-border/30 bg-muted p-1 shadow-[inset_0_1px_0_hsl(var(--primary)/0.06),0_4px_16px_-4px_rgba(0,0,0,0.3)]">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="users">Users</TabsTrigger>
					<TabsTrigger value="payments">Payments</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<Card className="space-y-2 border-border/30 bg-background/30 p-6 shadow-[0_4px_12px_-6px_rgba(0,0,0,0.5)]">
							<div className="flex items-center justify-between">
								<h3 className="text-sm font-medium">Total Users</h3>
								<Badge variant="secondary">Active</Badge>
							</div>
							<div className="text-3xl font-bold">{valueFormatter(userStats.totalUsers)}</div>
						</Card>
					</div>

					<UserGrowthChart
						dailyData={userStats.dailyData}
						allUsers={userStats.allUsers}
					/>
				</TabsContent>

				<TabsContent value="users">
					<Card className="border-border/30 bg-background/30 p-6 shadow-[0_4px_12px_-6px_rgba(0,0,0,0.5)]">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold">Free Users</h3>
							<Badge variant="secondary">Active</Badge>
						</div>
						<FreeUsersTable />
					</Card>
				</TabsContent>

				<TabsContent value="payments" className="space-y-6">
					<Card className="border-border/30 bg-background/30 p-6 shadow-[0_4px_12px_-6px_rgba(0,0,0,0.5)]">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold">Recent Transactions</h3>
						</div>
						<TransactionsTable transactions={paymentData.transactions} />
					</Card>

					<Card className="border-border/30 bg-background/30 p-6 shadow-[0_4px_12px_-6px_rgba(0,0,0,0.5)]">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold">Active Subscriptions</h3>
						</div>
						<SubscriptionsTable subscriptions={paymentData.subscriptions} />
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	)
}
