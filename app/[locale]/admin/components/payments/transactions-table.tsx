'use client'

import { useState } from 'react'
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
import { refundTransactionAction } from '../../actions/payment-actions'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface Transaction {
    id: string
    amount: number
    status: string
    type: string
    createdAt: Date
    user: {
        email: string
    }
}

interface TransactionsTableProps {
    transactions: Transaction[]
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
    const [isRefunding, setIsRefunding] = useState<string | null>(null)

    const handleRefund = async (transactionId: string) => {
        setIsRefunding(transactionId)
        try {
            const result = await refundTransactionAction(transactionId)
            if (result.success) {
                toast.success("Transaction refunded successfully")
            } else {
                toast.error(result.error || "Failed to refund transaction")
            }
        } catch {
            toast.error("An error occurred")
        } finally {
            setIsRefunding(null)
        }
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((txn) => (
                        <TableRow key={txn.id}>
                            <TableCell>{new Date(txn.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>{txn.user.email}</TableCell>
                            <TableCell>${(txn.amount / 100).toFixed(2)}</TableCell>
                            <TableCell>
                                <BadgeV2 variant="outline">{txn.type}</BadgeV2>
                            </TableCell>
                            <TableCell>
                                <BadgeV2
                                    variant={
                                        txn.status === 'COMPLETED' ? 'default' :
                                            txn.status === 'PENDING' ? 'secondary' : 'error'
                                    }
                                >
                                    {txn.status}
                                </BadgeV2>
                            </TableCell>
                            <TableCell>
                                {txn.status === 'COMPLETED' && (
                                    <ButtonV2 
                                        variant="ghost"
                                        size="sm"
                                        className="text-semantic-error hover:text-semantic-error hover:bg-semantic-error-bg"
                                        onClick={() => handleRefund(txn.id)}
                                        disabled={isRefunding === txn.id}
                                    >
                                        {isRefunding === txn.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            'Refund'
                                        )}
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
