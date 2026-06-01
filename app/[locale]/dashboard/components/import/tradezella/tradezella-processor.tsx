'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Prisma, Trade } from '@/prisma/generated/prisma'
import { PlatformProcessorProps } from '../config/platforms'

const newMappings: { [key: string]: string } = {
  "Account Name": "accountNumber",
  "Close Date": "closeDate",
  "Close Time": "closeTime",
  "Commission": "commission",
  "Duration": "timeInPosition",
  "Entry Price": "entryPrice",
  "Open Date": "entryDate",
  "Open Time": "entryTime",
  "Exit Price": "closePrice",
  "Fee": "commission",
  "Gross P&L": "pnl",
  "Instrument": "instrument",
  "Quantity": "quantity",
  "Side": "side",
  "Symbol": "instrument",
  "Adjusted Cost": "entryId",
  "Adjusted Proceeds": "closeId",
}



export default function TradezellaProcessor({ headers, csvData, setProcessedTrades }: PlatformProcessorProps) {
  const [trades, setTrades] = useState<Trade[]>([])

  const processTrades = useCallback(() => {
    const newTrades: Trade[] = [];
    //TODO: Ask user for account number using account selection component
    const accountNumber = 'default-account';

    csvData.forEach(row => {
      const item: Partial<Trade> = {};
      const quantity = 0;
      let entryTime = '';
      let closeTime = '';
      headers.forEach((header, index) => {
        if (newMappings[header]) {
          const key = newMappings[header];
          const cellValue = row[index];
          switch (key) {
            case 'entryTime':
              entryTime = cellValue as any;
              break;
            case 'closeTime':
              closeTime = cellValue as any;
              break;
            case 'pnl':
              item.pnl = new Prisma.Decimal(parseFloat(cellValue))
              break;
            case 'commission':
              item.commission = new Prisma.Decimal(parseFloat(cellValue))
              break;
            case 'quantity':
              item.quantity = new Prisma.Decimal(parseFloat(cellValue))
              break;
            case 'timeInPosition':
              item.timeInPosition = new Prisma.Decimal(parseFloat(cellValue))
              break;
            default:
              item[key as keyof Trade] = cellValue as any;
          }
        }
      });
      // If item contains undefined values then skip the row
      if (Object.values(item).some(value => value === undefined)) {
        return
      }


      // Compute entryDate and closeDate with the time from entryTime and closeTime
      if (entryTime && closeTime) {
        item.entryDate = new Date(`${item.entryDate} ${entryTime.slice(0, 8)}`);
        item.closeDate = new Date(`${item.closeDate} ${closeTime.slice(0, 8)}`);
      }

      newTrades.push(item as Trade);
    })

    setTrades(newTrades);
    setProcessedTrades(newTrades);
  }, [csvData, headers, setProcessedTrades]);

  useEffect(() => {
    processTrades();
  }, [processTrades]);

  const totalPnL = useMemo(() => trades.reduce((sum, trade) => sum + (trade.pnl?.toNumber() || 0), 0), [trades]);
  const totalCommission = useMemo(() => trades.reduce((sum, trade) => sum + (trade.commission?.toNumber() || 0), 0), [trades]);
  const uniqueInstruments = useMemo(() => Array.from(new Set(trades.map(trade => trade.instrument))), [trades]);

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
            {trades.map((trade) => (
              <TableRow key={trade.id}>
                <TableCell>{trade.instrument}</TableCell>
                <TableCell>{trade.side}</TableCell>
                <TableCell>{trade.quantity.toNumber()}</TableCell>
                <TableCell>{trade.entryPrice?.toNumber()}</TableCell>
                <TableCell>{trade.closePrice?.toNumber() ?? '-'}</TableCell>
                <TableCell>{new Date(trade.entryDate).toLocaleString()}</TableCell>
                <TableCell>{trade.closeDate ? new Date(trade.closeDate).toLocaleString() : '-'}</TableCell>
                <TableCell>{trade.pnl?.toNumber()?.toFixed(2)}</TableCell>
                <TableCell>{`${Math.floor((trade.timeInPosition?.toNumber() || 0) / 60)}m ${Math.floor((trade.timeInPosition?.toNumber() || 0) % 60)}s`}</TableCell>
                <TableCell>{trade.commission?.toNumber()?.toFixed(2)}</TableCell>
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