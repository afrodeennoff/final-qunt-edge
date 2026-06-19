"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  UploadIcon,
  type UploadIconHandle,
} from "@/components/animated-icons/upload";
import { Trade } from "@/prisma/generated/prisma";
import type { Trade as DomainTrade } from "@/lib/data-types";
import { saveTradesAction } from "@/server/database";
import ImportTypeSelection, { ImportType } from "./import-type-selection";
import FileUpload from "./file-upload";
import HeaderSelection from "./header-selection";
import AccountSelection from "./account-selection";
import { useData } from "@/context/data-provider";
import ColumnMapping from "./column-mapping";
import { useI18n } from "@/locales/client";
import { ImportDialogHeader } from "./components/import-dialog-header";
import { ImportDialogFooter } from "./components/import-dialog-footer";
import { platforms } from "./config/platforms";
import { FormatPreview } from "./components/format-preview";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/user-store";
import { useTradingDomainStore } from "@/store/trading-domain-store";
import { usePdfProcessingStore } from "@/store/pdf-processing-store";
import PdfUpload from "./ibkr-pdf/pdf-upload";
import PdfProcessing from "./ibkr-pdf/pdf-processing";
import AtasFileUpload from "./atas/atas-file-upload";
import { generateTradeHash } from "@/lib/utils";
import { createTradeWithDefaults } from "@/lib/trade-factory";
import type { ImportTradeDraft } from "@/lib/trade-types";

type ColumnConfig = {
  [key: string]: {
    defaultMapping: string[];
    required: boolean;
  };
};

export type Step =
  | "select-import-type"
  | "upload-file"
  | "select-headers"
  | "map-columns"
  | "select-account"
  | "preview-trades"
  | "complete"
  | "process-file";

export default function ImportButton() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [step, setStep] = useState<Step>("select-import-type");
  const [importType, setImportType] = useState<ImportType>("");
  const [files, setFiles] = useState<File[]>([]);
  const [rawCsvData, setRawCsvData] = useState<string[][]>([]);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<{ [key: string]: string }>({});
  const [accountNumbers, setAccountNumbers] = useState<string[]>([]);
  const [newAccountNumber, setNewAccountNumber] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [processedTrades, setProcessedTrades] = useState<Partial<Trade>[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const uploadIconRef = useRef<UploadIconHandle>(null);
  const [text, setText] = useState<string>("");
  const [selectedAccountNumbers, setSelectedAccountNumbers] = useState<string[]>([]);
  const user = useUserStore((state) => state.user);
  const supabaseUser = useUserStore((state) => state.supabaseUser);
  const trades = useTradingDomainStore((state) => state.trades);
  const setTradesStore = useTradingDomainStore((state) => state.setTrades);
  const { refreshTradesOnly } = useData();
  const t = useI18n();

  const resetImportState = useCallback(() => {
    setImportType("");
    setStep("select-import-type");
    setRawCsvData([]);
    setCsvData([]);
    setHeaders([]);
    setMappings({});
    setAccountNumbers([]);
    setNewAccountNumber("");
    setProcessedTrades([]);
    setError(null);
  }, []);

  const handleSave = useCallback(async () => {
    console.warn("[ImportButton] First:", processedTrades);
    if (!user || !supabaseUser) {
      toast.error(t("import.error.auth"), {
        description: t("import.error.authDescription"),
      });
      return;
    }

    setIsSaving(true);
    try {
      // Filter trades for ATAS based on selectedAccountNumbers
      let tradesToSave = processedTrades;
      if (importType === "atas" && selectedAccountNumbers.length > 0) {
        tradesToSave = processedTrades.filter(
          (trade) =>
            trade.accountNumber &&
            selectedAccountNumbers.includes(trade.accountNumber)
        );
      }

      let newTrades: ImportTradeDraft[] = [];
      const skipped: number[] = [];

      /**
       * Build a draft, injecting the selected account number when the trade
       * itself doesn't carry one. Generic CSV/AI imports select the account in
       * a separate step (accountNumbers state), so it must be applied here —
       * otherwise createTradeWithDefaults throws and the whole save fails.
       */
      const buildDraft = (
        trade: Partial<Trade>,
        accountNumber?: string
      ): ImportTradeDraft | null => {
        const candidate = accountNumber
          ? { ...(trade as object), accountNumber }
          : trade;
        try {
          return createTradeWithDefaults(
            candidate as unknown as Partial<ImportTradeDraft>
          );
        } catch (err) {
          console.warn("[ImportButton] Skipping trade missing required fields:", err);
          return null;
        }
      };

      if (accountNumbers.length === 0) {
        // No account selected: rely on each trade's own accountNumber (broker/platform imports).
        for (const trade of tradesToSave) {
          const draft = buildDraft(trade);
          if (draft) newTrades.push(draft);
          else skipped.push(1);
        }
      } else {
        // Apply each selected account number to every trade (CSV/AI import flow).
        for (const accountNumber of accountNumbers) {
          console.warn("[ImportButton] Account number:", accountNumber);
          for (const trade of tradesToSave) {
            const draft = buildDraft(trade, accountNumber);
            if (draft) newTrades.push(draft);
            else skipped.push(1);
          }
        }
      }

      if (newTrades.length === 0) {
        // All trades were skipped (missing required accountNumber/instrument).
        // Give the user an actionable message instead of a generic failure so
        // the "Save" button doesn't appear to silently do nothing.
        toast.error(t("import.error.failed"), {
          description:
            skipped.length > 0
              ? `${skipped.length} ${t("import.error.skippedDescription")}`
              : t("import.error.failedDescription"),
        });
        return;
      }

      console.warn(
        `[ImportButton] Saving ${newTrades.length} trades (skipped ${skipped.length})`
      );
      const result = await saveTradesAction(newTrades);
      // Surface the server's detailed error so save failures are diagnosable
      // instead of a silent generic toast.
      console.warn("[ImportButton] saveTradesAction result:", result);

      if (result.error) {
        // The server returns the precise validation reason in `details` (e.g.
        // "Trade ES has a future entry date" or "missing account number").
        const detail =
          typeof result.details === "string" && result.details.length > 0
            ? result.details
            : undefined;
        if (result.error === "DUPLICATE_TRADES") {
          toast.error(t("import.error.duplicateTrades"), {
            description: detail ?? t("import.error.duplicateTradesDescription"),
          });
        } else if (result.error === "NO_TRADES_ADDED") {
          toast.error(t("import.error.noTradesAdded"), {
            description: detail ?? t("import.error.noTradesAddedDescription"),
          });
        } else {
          toast.error(t("import.error.failed"), {
            description: detail ?? t("import.error.failedDescription"),
          });
        }
        // Don't proceed further if there's an error
        return;
      }

      // Optimistically merge new trades into local store to avoid full refetch
      const newIds = new Set(newTrades.map((t) => t.id));
      const mergedTrades = [
        ...newTrades,
        ...trades.filter((t) => !newIds.has(t.id)),
      ] as unknown as DomainTrade[];
      setTradesStore(mergedTrades);

      // Force-refresh from server so the optimistic merge is not clobbered by a
      // stale IndexedDB cache (in dev, force:false reads the pre-import cache and
      // wipes the just-merged trades from the store before the cache is rewritten).
      await refreshTradesOnly({ force: true });

      // Show success message
      const successDescription = t("import.successDescription", {
        numberOfTradesAdded: result.numberOfTradesAdded,
      });
      const skippedCount = result.warnings?.length ?? 0;
      toast.success(t("import.success"), {
        description:
          skippedCount > 0
            ? `${successDescription} (${skippedCount} skipped)`
            : successDescription,
      });
      setIsOpen(false);
      // Reset the import process
      resetImportState();
    } catch (error) {
      console.error("Error saving trades:", error);
      toast.error(t("import.error.failed"), {
        description: t("import.error.failedDescription"),
      });
    } finally {
      setIsSaving(false);
    }
  }, [processedTrades, accountNumbers, selectedAccountNumbers, importType, user, supabaseUser, t, refreshTradesOnly, resetImportState]);

  const handleNextStep = useCallback(async () => {
    const platform =
      platforms.find((p) => p.type === importType) ||
      platforms.find((p) => p.platformName === "csv-ai");
    if (!platform) return;

    const currentStepIndex = platform.steps.findIndex((s) => s.id === step);
    if (currentStepIndex === -1) return;

    // Handle PDF upload step
    if (step === "upload-file" && importType === "pdf") {
      if (files.length === 0) {
        setError(t("import.errors.noFilesSelected"));
        return;
      }
      setStep("process-file");
      return;
    }

    // Handle ATAS account selection step - filtering is now done in handleSave
    // No need to filter here since state updates are async and handleSave will filter

    // Handle standard flow
    const nextStep = platform.steps[currentStepIndex + 1];
    if (!nextStep) {
      await handleSave();
      return;
    }

    setStep(nextStep.id);
  }, [step, importType, files, t, handleSave]);

  const handleBackStep = () => {
    const platform =
      platforms.find((p) => p.type === importType) ||
      platforms.find((p) => p.platformName === "csv-ai");
    if (!platform) return;

    const currentStepIndex = platform.steps.findIndex((s) => s.id === step);
    if (currentStepIndex <= 0) return;

    const prevStep = platform.steps[currentStepIndex - 1];
    if (!prevStep) return;

    setStep(prevStep.id);
  };

  const renderStep = () => {
    const platform =
      platforms.find((p) => p.type === importType) ||
      platforms.find((p) => p.platformName === "csv-ai");
    if (!platform) return null;

    const currentStep = platform.steps.find((s) => s.id === step);
    if (!currentStep) return null;

    const Component = currentStep.component;

    // Handle special cases for components that need specific props
    if (Component === ImportTypeSelection) {
      return (
        <div className="flex flex-col gap-4 h-full">
          <Component
            selectedType={importType}
            setSelectedType={setImportType}
            setIsOpen={setIsOpen}
          />
        </div>
      );
    }
    if (Component === PdfUpload) {
      return <Component setText={setText} setFiles={setFiles} />;
    }

    if (Component === FileUpload) {
      return (
        <Component
          importType={importType}
          setRawCsvData={setRawCsvData}
          setCsvData={setCsvData}
          setHeaders={setHeaders}
          setStep={setStep}
          setError={setError}
        />
      );
    }

    if (Component === AtasFileUpload) {
      return (
        <Component
          importType={importType}
          setRawCsvData={setRawCsvData}
          setCsvData={setCsvData}
          setHeaders={setHeaders}
          setStep={setStep}
          setError={setError}
        />
      );
    }

    if (Component === HeaderSelection) {
      return (
        <Component
          rawCsvData={rawCsvData}
          setCsvData={setCsvData}
          setHeaders={setHeaders}
          setError={setError}
        />
      );
    }

    if (Component === AccountSelection) {
      return (
        <Component
          accounts={Array.from(
            new Set(trades.map((trade) => trade.accountNumber))
          )}
          accountNumbers={accountNumbers}
          setAccountNumbers={setAccountNumbers}
          newAccountNumber={newAccountNumber}
          setNewAccountNumber={setNewAccountNumber}
        />
      );
    }


    if (Component === ColumnMapping) {
      return (
        <Component
          headers={headers}
          csvData={csvData}
          mappings={mappings}
          setMappings={setMappings}
          error={error}
          importType={importType}
        />
      );
    }

    if (Component === FormatPreview) {
      return (
        <Component
          trades={csvData}
          processedTrades={processedTrades}
          setProcessedTrades={setProcessedTrades}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
          headers={headers}
          mappings={mappings}
        />
      );
    }

    if (Component === PdfProcessing) {
      return (
        <Component
          setError={setError}
          setStep={setStep}
          processedTrades={processedTrades}
          setProcessedTrades={setProcessedTrades}
          extractedText={text}
          userId={user?.id || ""}
        />
      );
    }

    // Handle processor components - only if the current step component is the processor
    if (
      platform.processorComponent &&
      Component === platform.processorComponent
    ) {
      return (
        <platform.processorComponent
          csvData={csvData}
          headers={headers}
          processedTrades={processedTrades}
          setProcessedTrades={setProcessedTrades}
          accountNumbers={accountNumbers}
          selectedAccountNumbers={selectedAccountNumbers}
          setSelectedAccountNumbers={setSelectedAccountNumbers}
        />
      );
    }

    // Handle custom components
    if (platform.customComponent) {
      return <platform.customComponent setIsOpen={setIsOpen} />;
    }

    return null;
  };

  const isNextDisabled = () => {
    if (isLoading) return true;

    const platform =
      platforms.find((p) => p.type === importType) ||
      platforms.find((p) => p.platformName === "csv-ai");
    if (!platform) return true;

    const currentStep = platform.steps.find((s) => s.id === step);
    if (!currentStep) return true;

    // File upload step
    if (currentStep.component === FileUpload && csvData.length === 0)
      return true;

    // PDF upload step
    if (currentStep.component === PdfUpload && text.length === 0) return true;

    // Account selection for Tradovate
    if (
      currentStep.component === AccountSelection &&
      importType === "tradovate" &&
      accountNumbers.length === 0 &&
      !newAccountNumber
    )
      return true;

    // Account selection for other platforms
    if (
      currentStep.component === AccountSelection &&
      accountNumbers.length === 0 &&
      !newAccountNumber
    )
      return true;

    // Account selection for ATAS (now handled in processor)
    if (
      importType === "atas" &&
      currentStep.component === platform.processorComponent &&
      selectedAccountNumbers.length === 0
    )
      return true;

    return false;
  };

  return (
    <div>
      <Button
        onClick={() => setIsOpen(true)}
        variant="default"
        className={cn("justify-start text-left font-normal w-full")}
        id="import-data"
        onMouseEnter={() => uploadIconRef.current?.startAnimation()}
        onMouseLeave={() => uploadIconRef.current?.stopAnimation()}
      >
        <UploadIcon ref={uploadIconRef} className="h-4 w-4 mr-2" />
        <span className="hidden md:block">{t("import.button")}</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen} >
        <DialogContent className="flex flex-col max-w-[80vw] h-[80vh] p-0">
          <ImportDialogHeader step={step} importType={importType} />

          <div className="flex-1 overflow-hidden p-6">{renderStep()}</div>

          <ImportDialogFooter
            step={step}
            importType={importType}
            onBack={handleBackStep}
            onNext={handleNextStep}
            isSaving={isSaving}
            isNextDisabled={isNextDisabled()}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
