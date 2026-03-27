'use client'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ButtonV2 } from "@/components/ui/v2"
import { BadgeV2 } from "@/components/ui/v2"
import { cancelSubscriptionAction } from '../../actions/payment-actions'
import { toast } from 'sonner'

interface Subscription {
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

interface SubscriptionsTableProps {
    subscriptions: Subscription[]
}

export function SubscriptionsTable({ subscriptions }: SubscriptionsTableProps) {
    const handleCancel = async (userId: string) => {
        if (!confirm('Are you sure you want to cancel this subscription?')) return

        try {
            const result = await cancelSubscriptionAction(userId)
            if (result.success) {
                toast.success("Subscription cancelled successfully")
            } else {
                toast.error(result.error || "Failed to cancel subscription")
            }
        } catch {
            toast.error("An error occurred")
        }
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Interval</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {subscriptions.map((sub) => (
                        <TableRow key={sub.id}>
                            <TableCell>{sub.user.email}</TableCell>
                            <TableCell className="font-medium">{sub.plan}</TableCell>
                            <TableCell>
                                <BadgeV2
                                    variant={sub.status === 'ACTIVE' ? 'default' : 'secondary'}
                                >
                                    {sub.status}
                                </BadgeV2>
                            </TableCell>
                            <TableCell className="capitalize">{sub.interval || '-'}</TableCell>
                            <TableCell>
                                {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'Never'}
                            </TableCell>
                            <TableCell>
                                {sub.status === 'ACTIVE' && (
                                    <ButtonV2 
                                        variant="ghost"
                                        size="sm"
                                        className="text-semantic-error hover:text-semantic-error hover:bg-semantic-error-bg"
                                        onClick={() => handleCancel(sub.userId)}
                                    >
                                        Cancel
                                    </ButtonV2>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
