'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Prisma, Trade } from '@/prisma/generated/prisma'
import { decimalToNumber } from '@/lib/trade-types'
import { PlatformProcessorProps } from '../config/platforms'

const newMappings: { [key: string]: string } = {
    "AccountNumber": "accountNumber",
    "Instrument": "instrument",
    "Fill Size": "quantity",
    "Trade P&L": "pnl",
    "Trade Life Span": "timeInPosition",
    "Commission & Fees": "commission",
    "Entry Buy/Sell": "side",
    "Entry Order Number": "entryId",
    "Entry Price": "entryPrice",
    "Entry Time": "entryDate",
    "Exit Order Number": "closeId",
    "Exit Price": "closePrice",
    "Exit Time": "closeDate",
}

export default function RithmicPerformanceProcessor({ headers, csvData, processedTrades, setProcessedTrades }: PlatformProcessorProps) {

    const processTrades = useCallback(() => {
        const newTrades: Trade[] = [];

        csvData.forEach(row => {
            const item: Partial<Trade> = {};
            let quantity = 0;
            headers.forEach((header, index) => {
                const mappingKey = Object.keys(newMappings).find(key => header.includes(key));
                if (mappingKey) {
                    const key = newMappings[mappingKey] as keyof Trade;
                    const cellValue = row[index];
                    switch (key) {
                        case 'quantity':
                            quantity = parseFloat(cellValue) || 0;
                            item[key] = new Prisma.Decimal(quantity) as any;
                            break;
                        case 'pnl':
                            const pnl = parseFloat(cellValue) || 0;
                            item[key] = new Prisma.Decimal(pnl) as any;
                            break;
                        case 'commission':
                            item[key] = new Prisma.Decimal(parseFloat(cellValue) || 0) as any;
                            break;
                        case 'timeInPosition':
                            item[key] = new Prisma.Decimal(parseFloat(cellValue) || 0) as any;
                            break;
                        default:
                            item[key] = cellValue as any;
                    }
                }
            });

            // Ensure time values are stored as ISO strings
            try {
                if (item.entryDate) {
                    item.entryDate = new Date(item.entryDate);
                }
                if (item.closeDate) {
                    item.closeDate = new Date(item.closeDate);
                }
            } catch (e) {
                toast.error("Error", {
                    description: "There was an error processing the trades. Please check the data and try again."
                })
                return;
            }
            // On rithmic performance, the side is stored as 'B' or 'S'.
            // Normalize to lowercase long/short — every other importer and all
            // downstream side-based styling/filtering consumers compare lowercase.
            if (item.side === 'B' || item.side === 'S') {
                item.side = item.side === 'B' ? 'long' : 'short';
            }

            if (item.instrument) {
                item.instrument = item.instrument.slice(0, -2)
            }
            // This is going to be set later
            item.userId = ''
            newTrades.push(item as Trade);
        });

        setProcessedTrades(newTrades);
    }, [csvData, headers, setProcessedTrades]);

    useEffect(() => {
        processTrades();
    }, [processTrades]);

    const totalPnL = useMemo(() => processedTrades.reduce((sum, trade) => sum + decimalToNumber(trade.pnl), 0), [processedTrades]);
    const totalCommission = useMemo(() => processedTrades.reduce((sum, trade) => sum + decimalToNumber(trade.commission), 0), [processedTrades]);
    const uniqueInstruments = useMemo(() => Array.from(new Set(processedTrades.map(trade => trade.instrument))), [processedTrades]);

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold mb-2">Processed Trades</h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Instrument</TableHead>
                            <TableHead>Side</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Entry Price</TableHead>
                            <TableHead>Close Price</TableHead>
                            <TableHead>Entry Date</TableHead>
                            <TableHead>Close Date</TableHead>
                            <TableHead>PnL</TableHead>
                            <TableHead>Time in Position</TableHead>
                            <TableHead>Commission</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {processedTrades.map((trade, index) => (
                            <TableRow key={`rithmic-${index}`}>
                                <TableCell>{trade.instrument}</TableCell>
                                <TableCell>{trade.side}</TableCell>
                                <TableCell>{decimalToNumber(trade.quantity)}</TableCell>
                                <TableCell>{decimalToNumber(trade.entryPrice, null) ?? ''}</TableCell>
                                <TableCell>{decimalToNumber(trade.closePrice, null) ?? '-'}</TableCell>
                                <TableCell>{trade.entryDate ? new Date(trade.entryDate).toLocaleString() : '-'}</TableCell>
                                <TableCell>{trade.closeDate ? new Date(trade.closeDate).toLocaleString() : '-'}</TableCell>
                                <TableCell>{decimalToNumber(trade.pnl).toFixed(2)}</TableCell>
                                <TableCell>{`${Math.floor(decimalToNumber(trade.timeInPosition) / 60)}m ${Math.floor(decimalToNumber(trade.timeInPosition) % 60)}s`}</TableCell>
                                <TableCell>{decimalToNumber(trade.commission).toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex justify-between">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Total PnL</h3>
                    <p className={`text-xl font-bold ${totalPnL >= 0 ? 'text-[color:var(--success)]' : 'text-[color:var(--destructive)]'}`}>
                        {totalPnL.toFixed(2)}
                    </p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2">Total Commission</h3>
                    <p className="text-xl font-bold text-blue-600">
                        {totalCommission.toFixed(2)}
                    </p>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold mb-2">Instruments Traded</h3>
                <div className="flex flex-wrap gap-2">
                    {uniqueInstruments.map((instrument) => (
                        <Button
                            key={instrument}
                            variant="outline"
                        >
                            {instrument}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    )
}