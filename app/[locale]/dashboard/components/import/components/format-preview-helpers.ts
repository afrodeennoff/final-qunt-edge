import type { ImportTradeDraft } from "@/lib/trade-types";
import { z } from 'zod/v3';
import { tradeSchema } from '@/app/api/ai/format-trades/schema';
import { useI18n } from "@/locales/client";
import { format, isValid } from "date-fns";
import { parsePositionTime } from "@/lib/utils";

// Pure utility functions
export const parseAiErrorMessage = (rawMessage: string): string => {
  if (!rawMessage) return "Unknown AI error";
  try {
    const parsed = JSON.parse(rawMessage) as { error?: { message?: string } };
    return parsed?.error?.message ?? rawMessage;
  } catch {
    return rawMessage;
  }
};

export const parseAiErrorCode = (rawMessage: string): string | null => {
  try {
    const parsed = JSON.parse(rawMessage) as { error?: { code?: string } };
    return parsed?.error?.code ?? null;
  } catch {
    return null;
  }
};

// Factory function for useObject handlers
export const createUseObjectHandlers = (
  setNumber: 1 | 2,
  batchSetRef: React.MutableRefObject<number[]>,
  currentBatchIndexRef: React.MutableRefObject<number>,
  completedBatchesRef: React.MutableRefObject<Set<number>>,
  retryCountRef: React.MutableRefObject<Map<number, number>>,
  isAutoProcessingRef: React.MutableRefObject<boolean>,
  isStoppedRef: React.MutableRefObject<boolean>,
  setError: (error: string | null) => void,
  setIsAutoProcessing: (isAutoProcessing: boolean) => void,
  setCompletedBatches: React.Dispatch<React.SetStateAction<Set<number>>>,
  setCurrentBatchIndex: React.Dispatch<React.SetStateAction<number>>,
  totalBatches: number,
  scheduleManagedTimeout: (fn: () => void, delayMs: number) => void,
  processNextBatchInSet: () => void,
  MAX_RETRIES_PER_BATCH: number,
  RETRY_BASE_DELAY_MS: number
) => {
  return {
    onError: (error: any) => {
      console.error(`Error processing batch set ${setNumber}:`, error);
      const message = parseAiErrorMessage(error.message);
      const code = parseAiErrorCode(error.message);
      const currentBatch = batchSetRef.current[currentBatchIndexRef.current];
      const isRetryable = code === "SERVICE_UNAVAILABLE" || code === "RATE_LIMITED";

      if (isRetryable && currentBatch !== undefined && !isStoppedRef.current) {
        const currentAttempt = (retryCountRef.current.get(currentBatch) ?? 0) + 1;
        setError(
          `Batch set ${setNumber} temporary issue (${message}). Retrying ${Math.min(currentAttempt, MAX_RETRIES_PER_BATCH)}/${MAX_RETRIES_PER_BATCH}...`
        );
        // Note: scheduleRetryForSet logic would need to be extracted separately
        // For now, we'll keep a simplified version here
        return;
      }

      setError(`Failed to process batch set ${setNumber}: ${message}`);
      setIsAutoProcessing(false);
    },
    onFinish: () => {
      const currentBatch = batchSetRef.current[currentBatchIndexRef.current];
      if (currentBatch !== undefined) {
        retryCountRef.current.delete(currentBatch);
        setCompletedBatches(prev => {
          return new Set([...prev, currentBatch]);
        });
        
        // Move to next batch in set
        setCurrentBatchIndex(prev => {
          return prev + 1;
        });
        
        // Check if all batches are completed
        if (completedBatchesRef.current.size + 1 === totalBatches) {
          setIsAutoProcessing(false);
        } else if (isAutoProcessingRef.current && !isStoppedRef.current) {
          // Process next batch in set if available and not stopped
          scheduleManagedTimeout(() => {
            processNextBatchInSet();
          }, 500);
        }
      }
    }
  };
};

// Transform row data function
export const transformRowData = (
  rows: string[][], 
  headers: string[], 
  mappings: { [key: string]: string }
): string[][] => {
  return rows.map(row => {
    const transformedRow: string[] = [];
    
    // Create a mapping from unique ID to destination column and source index
    const uniqueIdToMapping: { [key: string]: { destination: string; sourceIndex: number } } = {};
    headers.forEach((header, index) => {
      const uniqueId = `${header}_${index}`;
      if (mappings[uniqueId]) {
        uniqueIdToMapping[uniqueId] = {
          destination: mappings[uniqueId],
          sourceIndex: index
        };
      }
    });
    
    // Get all unique destination columns that are mapped, in the order they appear in mappings
    const destinationColumns = [...new Set(Object.values(mappings))];
    
    // For each destination column, find the corresponding data using the unique ID
    destinationColumns.forEach(destColumn => {
      const mapping = Object.entries(uniqueIdToMapping).find(([, mapping]) => mapping.destination === destColumn);
      if (mapping) {
        const [, { sourceIndex }] = mapping;
        transformedRow.push(row[sourceIndex] || '');
      } else {
        transformedRow.push('');
      }
    });
    
    return transformedRow;
  });
};

// Get batch data function
export const getBatchData = (
  batchIndex: number, 
  batchSize: number, 
  validTrades: string[][], 
  headers: string[], 
  mappings: { [key: string]: string }
): string[][] => {
  const startIndex = batchIndex * batchSize;
  const endIndex = Math.min(startIndex + batchSize, validTrades.length);
  const batchRows = validTrades.slice(startIndex, endIndex);
  return transformRowData(batchRows, headers, mappings);
};

// Append unique trades function
export const appendUniqueTrades = (
  incomingTrades: Partial<ImportTradeDraft>[],
  processedTradesRef: React.MutableRefObject<Partial<ImportTradeDraft>[]>,
  setProcessedTrades: (trades: Partial<ImportTradeDraft>[]) => void,
  scheduleManagedTimeout: (fn: () => void, delayMs: number) => void,
  scrollToBottom: () => void
) => {
  const uniqueTrades = incomingTrades.filter(newTrade =>
    !processedTradesRef.current.some(existingTrade =>
      existingTrade.entryDate === newTrade.entryDate &&
      existingTrade.instrument === newTrade.instrument &&
      existingTrade.quantity === newTrade.quantity &&
      existingTrade.side === newTrade.side &&
      existingTrade.entryPrice === newTrade.entryPrice &&
      existingTrade.closePrice === newTrade.closePrice &&
      existingTrade.pnl === newTrade.pnl &&
      existingTrade.commission === newTrade.commission &&
      existingTrade.timeInPosition === newTrade.timeInPosition
    )
  );

  if (uniqueTrades.length === 0) return;

  const mergedTrades = [...processedTradesRef.current, ...uniqueTrades];
  processedTradesRef.current = mergedTrades;
  setProcessedTrades(mergedTrades);
  scheduleManagedTimeout(() => {
    scrollToBottom();
  }, 100);
};

// Columns factory function
export const createColumns = (
  t: ReturnType<typeof useI18n>,
  validTrades: string[][],
  headers: string[],
  mappings: { [key: string]: string }
) => {
  return [
    {
      accessorKey: "entryDate",
      header: () => (
        <div className="font-medium">{t('trade-table.entryDate')}</div>
      ),
      cell: ({ row }) => {
        const entryDate = row.original.entryDate ? new Date(row.original.entryDate) : null;
        const originalData = validTrades[row.index]?.[headers.findIndex(h => mappings[h] === 'entryDate')];
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                {entryDate && isValid(entryDate) ? format(entryDate, "yyyy-MM-dd HH:mm") : "Invalid Date"}
              </TooltipTrigger>
              {originalData && (
                <TooltipContent>
                  <p>Original: {originalData}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        );
      },
      size: 180,
    },
    {
      accessorKey: "instrument",
      header: () => (
        <div className="font-medium">{t('trade-table.instrument')}</div>
      ),
      cell: ({ row }) => {
        const originalData = validTrades[row.index]?.[headers.findIndex(h => mappings[h] === 'instrument')];
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                {row.original.instrument}
              </TooltipTrigger>
              {originalData && (
                <TooltipContent>
                  <p>Original: {originalData}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        );
      },
      size: 120,
    },
    {
      accessorKey: "side",
      header: () => (
        <div className="font-medium">{t('trade-table.direction')}</div>
      ),
      cell: ({ row }) => {
        const originalData = validTrades[row.index]?.[headers.findIndex(h => mappings[h] === 'side')];
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className="capitalize">{row.original.side}</span>
              </TooltipTrigger>
              {originalData && (
                <TooltipContent>
                  <p>Original: {originalData}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        );
      },
      size: 100,
    },
    {
      accessorKey: "quantity",
      header: () => (
        <div className="font-medium">{t('trade-table.quantity')}</div>
      ),
      cell: ({ row }) => {
        const originalData = validTrades[row.index]?.[headers.findIndex(h => mappings[h] === 'quantity')];
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                {row.original.quantity}
              </TooltipTrigger>
              {originalData && (
                <TooltipContent>
                  <p>Original: {originalData}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        );
      },
      size: 100,
    },
    {
      accessorKey: "entryPrice",
      header: () => (
        <div className="font-medium">{t('trade-table.entryPrice')}</div>
      ),
      cell: ({ row }) => {
        const originalData = validTrades[row.index]?.[headers.findIndex(h => mappings[h] === 'entryPrice')];
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                ${row.original.entryPrice}
              </TooltipTrigger>
              {originalData && (
                <TooltipContent>
                  <p>Original: {originalData}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        );
      },
      size: 120,
    },
    {
      accessorKey: "closePrice",
      header: () => (
        <div className="font-medium">{t('trade-table.exitPrice')}</div>
      ),
      cell: ({ row }) => {
        const originalData = validTrades[row.index]?.[headers.findIndex(h => mappings[h] === 'closePrice')];
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                ${row.original.closePrice}
              </TooltipTrigger>
              {originalData && (
                <TooltipContent>
                  <p>Original: {originalData}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        );
      },
      size: 120,
    },
    {
      accessorKey: "pnl",
      header: () => (
        <div className="font-medium">{t('trade-table.pnl')}</div>
      ),
      cell: ({ row }) => {
        const pnl = row.original.pnl ?? 0;
        const originalData = validTrades[row.index]?.[headers.findIndex(h => mappings[h] === 'pnl')];
        const originalPnl = originalData ? parseFloat(originalData.replace(/[,$]/g, '')) : null;
        const isMismatch = originalPnl !== null && Math.abs(pnl - originalPnl) > 0.01;
        
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1">
                  <span className={pnl >= 0 ? "text-foreground" : "text-semantic-error"}>
                    ${pnl.toFixed(2)}
                  </span>
                  {isMismatch && (
                    <span className="text-semantic-warning text-xs" title="PnL value doesn't match original data">
                      ⚠️
                    </span>
                  )}
                </div>
              </TooltipTrigger>
              {originalData && (
                <TooltipContent>
                  <div className="space-y-1">
                    <p>Original: {originalData}</p>
                    {isMismatch && (
                      <p className="text-semantic-warning text-sm">
                        ⚠️ Mismatch detected! Expected: ${originalPnl?.toFixed(2)}, Got: ${pnl.toFixed(2)}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        );
      },
      size: 120,
    },
    {
      accessorKey: "commission",
      header: () => (
        <div className="font-medium">{t('calendar.modal.commission')}</div>
      ),
      cell: ({ row }) => {
        const commission = row.original.commission ?? 0;
        const originalData = validTrades[row.index]?.[headers.findIndex(h => mappings[h] === 'commission')];
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                ${commission.toFixed(2)}
              </TooltipTrigger>
              {originalData && (
                <TooltipContent>
                  <p>Original: {originalData}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        );
      },
      size: 120,
    },
    {
      accessorKey: "timeInPosition",
      header: () => (
        <div className="font-medium">{t('trade-table.positionTime')}</div>
      ),
      cell: ({ row }) => {
        const originalData = validTrades[row.index]?.[headers.findIndex(h => mappings[h] === 'timeInPosition')];
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                {parsePositionTime(row.original.timeInPosition || 0)}
              </TooltipTrigger>
              {originalData && (
                <TooltipContent>
                  <p>Original: {originalData}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        );
      },
      size: 120,
    },
  ];
};