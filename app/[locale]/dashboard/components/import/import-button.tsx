"use client";

import React, { useState, useRef, useEffect, useCallback, Component } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
 UploadIcon,
 type UploadIconHandle,
} from "@/components/animated-icons/upload";
import { saveTradesAction } from "@/server/database";
import ImportTypeSelection, { ImportType } from "./import-type-selection";
import FileUpload from "./file-upload";
import HeaderSelection from "./header-selection";
import AccountSelection from "./account-selection";
import { useDashboardActions } from "@/context/data-provider";
import ColumnMapping from "./column-mapping";
import { useI18n } from "@/locales/client";
import { logger } from "@/lib/logger";
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
import { createTradeWithDefaults } from "@/lib/trade-factory";
import type { ImportTradeDraft } from "@/lib/trade-types";

type ImportErrorBoundaryState = { hasError: boolean; error: Error | null };

class ImportErrorBoundary extends Component<
<<<<<<< HEAD
 { children: React.ReactNode; onReset: () => void },
 ImportErrorBoundaryState
> {
 constructor(props: { children: React.ReactNode; onReset: () => void }) {
 super(props);
 this.state = { hasError: false, error: null };
 }

 static getDerivedStateFromError(error: Error): ImportErrorBoundaryState {
 return { hasError: true, error };
 }

 componentDidCatch(error: Error, info: React.ErrorInfo) {
 logger.error({ error, componentStack: info.componentStack },"Import dialog error");
 }

 render() {
 if (this.state.hasError) {
 return (
 <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
 <p className="text-sm text-v2-text-muted">Something went wrong loading this import.</p>
 <Button
 variant="outline"
 size="sm"
 onClick={() => {
 this.setState({ hasError: false, error: null });
 this.props.onReset();
 }}
 >
 Try again
 </Button>
 </div>
 );
 }
 return this.props.children;
 }
=======
  { children: React.ReactNode; onReset: () => void },
  ImportErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; onReset: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ImportErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error({ error, componentStack: info.componentStack }, "Import dialog error");
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-sm text-v2-text-muted">Something went wrong loading this import.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              this.props.onReset();
            }}
          >
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
>>>>>>> origin/main
}

type ColumnConfig = {
 [key: string]: {
 defaultMapping: string[];
 required: boolean;
 };
};

export type Step =
 |"select-import-type"
 |"upload-file"
 |"select-headers"
 |"map-columns"
 |"select-account"
 |"preview-trades"
 |"complete"
 |"process-file";

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
 const [processedTrades, setProcessedTrades] = useState<Partial<ImportTradeDraft>[]>([]);
 const [isLoading, setIsLoading] = useState<boolean>(false);
 const uploadIconRef = useRef<UploadIconHandle>(null);
 const [text, setText] = useState<string>("");
 const [selectedAccountNumbers, setSelectedAccountNumbers] = useState<string[]>([]);
 const user = useUserStore((state) => state.user);
 const supabaseUser = useUserStore((state) => state.supabaseUser);
 const accounts = useUserStore((state) => state.accounts);
 const trades = useTradingDomainStore((state) => state.trades);
 const { refreshTradesOnly, refreshUserDataOnly } = useDashboardActions();
 const t = useI18n();

 const handleSave = useCallback(async () => {
 // Accept either hydrated app user or Supabase auth user.
 // Requiring both blocks valid sessions during partial hydration.
 if (!user && !supabaseUser) {
 toast.error(t("import.error.auth"), {
 description: t("import.error.authDescription"),
 });
 return;
 }

 setIsSaving(true);
 try {
 // Filter trades for ATAS based on selectedAccountNumbers
 let tradesToSave = processedTrades;
 if (importType ==="atas" && selectedAccountNumbers.length > 0) {
 tradesToSave = processedTrades.filter(
 (trade) =>
 trade.accountNumber &&
 selectedAccountNumbers.includes(trade.accountNumber)
 );
 }

 if (tradesToSave.length === 0) {
 toast.error(t("import.error.noTradesAdded"), {
 description: t("import.error.noTradesAddedDescription"),
 });
 return;
 }

 const knownAccounts = Array.from(
 new Set(
 [...accounts.map((account) => account.number), ...trades.map((trade) => trade.accountNumber)]
 .map((account) => account?.trim())
 .filter((account): account is string => Boolean(account))
 )
 );
 const hasMissingAccountNumber = tradesToSave.some(
 (trade) => !trade.accountNumber || !String(trade.accountNumber).trim()
 );

 if (accountNumbers.length === 0 && hasMissingAccountNumber) {
 if (knownAccounts.length === 1) {
 const fallbackAccount = knownAccounts[0];
 tradesToSave = tradesToSave.map((trade) => ({
 ...trade,
 accountNumber: trade.accountNumber?.trim() || fallbackAccount,
 }));
 } else if (knownAccounts.length === 0) {
 toast.error("No account found", {
 description: "You don't have any trading accounts yet. Go back to the Account Selection step and create a new account.",
 });
 return;
 } else {
 toast.error(t("import.error.invalidData"), {
 description: "Some trades are missing account numbers. Select an account on the previous step to assign them.",
 });
 return;
 }
 }

 let newTrades: ImportTradeDraft[] = [];
 // If accountNumbers is empty, we should just save processedTrades with the accountNumber from the processedTrades
 if (accountNumbers.length === 0) {
 newTrades = tradesToSave.map((trade) => {
 return createTradeWithDefaults({
 ...trade,
 accountNumber: trade.accountNumber,
 });
 });
 } else {
 for (const accountNumber of accountNumbers) {
 newTrades = [
 ...newTrades,
 ...tradesToSave.map((trade) => {
 return createTradeWithDefaults({
 ...trade,
 accountNumber: accountNumber,
 });
 }),
 ];
 }
 }

 const result = await saveTradesAction(newTrades);

<<<<<<< HEAD
 if (result.error) {
 if (result.error ==="DUPLICATE_TRADES") {
 toast.error(t("import.error.duplicateTrades"), {
 description: t("import.error.duplicateTradesDescription"),
 });
 } else if (result.error ==="INVALID_DATA") {
 const detailStr = String(result.details ||"");
 if (detailStr.includes("future entry date")) {
 toast.error(t("import.error.futureDate"), {
 description: t("import.error.futureDateDescription"),
 });
 } else {
 toast.error(t("import.error.invalidData"), {
 description:
 typeof result.details ==="string"
 ? result.details
 : t("import.error.invalidDataDescription"),
 });
 }
 } else if (result.error ==="NO_TRADES_ADDED") {
 toast.error(t("import.error.noTradesAdded"), {
 description: t("import.error.noTradesAddedDescription"),
 });
 } else {
 const details =
 typeof result.details ==="string"
 ? result.details
 : t("import.error.failedDescription");
 toast.error(t("import.error.failed"), {
 description: details,
 });
 }
 // Don't proceed further if there's an error - close dialog to prevent freezing
 setIsOpen(false);
 setTimeout(() => resetImportState(), 100);
 return;
 }
=======
      if (result.error) {
        if (result.error === "DUPLICATE_TRADES") {
          toast.error(t("import.error.duplicateTrades"), {
            description: t("import.error.duplicateTradesDescription"),
          });
        } else if (result.error === "INVALID_DATA") {
          const detailStr = String(result.details || "");
          if (detailStr.includes("future entry date")) {
            toast.error(t("import.error.futureDate"), {
              description: t("import.error.futureDateDescription"),
            });
          } else {
            toast.error(t("import.error.invalidData"), {
              description:
                typeof result.details === "string"
                  ? result.details
                  : t("import.error.invalidDataDescription"),
            });
          }
        } else if (result.error === "NO_TRADES_ADDED") {
          toast.error(t("import.error.noTradesAdded"), {
            description: t("import.error.noTradesAddedDescription"),
          });
        } else {
          const details =
            typeof result.details === "string"
              ? result.details
              : t("import.error.failedDescription");
          toast.error(t("import.error.failed"), {
            description: details,
          });
        }
        // Don't proceed further if there's an error - close dialog to prevent freezing
        setIsOpen(false);
        setTimeout(() => resetImportState(), 100);
        return;
      }
>>>>>>> origin/main

 // Show success message
 toast.success(t("import.success"), {
 description: t("import.successDescription", {
 numberOfTradesAdded: result.numberOfTradesAdded,
 }),
 });

<<<<<<< HEAD
 // Close dialog immediately to prevent UI freezing
 setIsOpen(false);
 
 // Reset state with a small delay to allow UI to update
 setTimeout(() => {
 resetImportState();
 }, 200);

 // Refresh data in the background without blocking UI
 refreshTradesOnly({ force: true }).catch((refreshError) => {
 logger.error({ error: refreshError },"Background data refresh failed after import ");
 });
 refreshUserDataOnly({ force: true }).catch((refreshError) => {
 logger.error({ error: refreshError },"Background user refresh failed after import ");
 });
 
 } catch (error) {
 const message =
 error instanceof Error ? error.message : t("import.error.failedDescription");
 logger.error({ error },"Error saving trades:");
 toast.error(t("import.error.failed"), {
 description: message,
 });
 
 // Ensure dialog closes on error to prevent freezing
 setIsOpen(false);
 setTimeout(() => resetImportState(), 100);
 } finally {
 setIsSaving(false);
 }
 }, [
 processedTrades,
 accountNumbers,
 selectedAccountNumbers,
 importType,
 user,
 supabaseUser,
 accounts,
 trades,
 t,
 refreshTradesOnly,
 refreshUserDataOnly,
 ]);
=======
      // Close dialog immediately to prevent UI freezing
      setIsOpen(false);
      
      // Reset state with a small delay to allow UI to update
      setTimeout(() => {
        resetImportState();
      }, 200);

      // Refresh data in the background without blocking UI
      refreshTradesOnly({ force: true }).catch((refreshError) => {
        logger.error({ error: refreshError }, "Background data refresh failed after import");
      });
      refreshUserDataOnly({ force: true }).catch((refreshError) => {
        logger.error({ error: refreshError }, "Background user refresh failed after import");
      });
      
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("import.error.failedDescription");
      logger.error({ error }, "Error saving trades:");
      toast.error(t("import.error.failed"), {
        description: message,
      });
      
      // Ensure dialog closes on error to prevent freezing
      setIsOpen(false);
      setTimeout(() => resetImportState(), 100);
    } finally {
      setIsSaving(false);
    }
  }, [
    processedTrades,
    accountNumbers,
    selectedAccountNumbers,
    importType,
    user,
    supabaseUser,
    accounts,
    trades,
    t,
    refreshTradesOnly,
    refreshUserDataOnly,
  ]);
>>>>>>> origin/main

 const resetImportState = () => {
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
 };

 const handleNextStep = useCallback(async () => {
 const platform =
 platforms.find((p) => p.type === importType) ||
 platforms.find((p) => p.platformName ==="csv-ai");
 if (!platform) {
 toast.error("Unable to find platform configuration", {
 description:"Please select a different import type",
 });
 logger.warn("[ImportButton] Platform not found", { importType });
 return;
 }

 const currentStepIndex = platform.steps.findIndex((s) => s.id === step);
 if (currentStepIndex === -1) return;

 // Handle PDF upload step
 if (step ==="upload-file" && importType ==="pdf") {
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
 platforms.find((p) => p.platformName ==="csv-ai");
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
 platforms.find((p) => p.platformName ==="csv-ai");
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
 new Set([
 ...accounts.map((account) => account.number),
 ...trades.map((trade) => trade.accountNumber),
 ])
 )}
 tradesAccountNumbers={Array.from(
 new Set(
 processedTrades
 .map((trade) => trade.accountNumber)
 .filter((a): a is string => Boolean(a?.trim()))
 )
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
 userId={user?.id || supabaseUser?.id ||""}
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
 platforms.find((p) => p.platformName ==="csv-ai");
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
 importType ==="tradovate" &&
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

 return false;
 };

 return (
 <div>
 <Button 
 onClick={() => setIsOpen(true)}
 variant="outline"
 className={cn("group h-9 w-auto justify-center gap-2 rounded-full border border-transparent bg-transparent px-3.5 text-v2-text-secondary shadow-none transition-colors hover:bg-v2-bg-hover/70 hover:text-v2-text-primary md:px-4"
 )}
 id="import-data"
 onMouseEnter={() => uploadIconRef.current?.startAnimation()}
 onMouseLeave={() => uploadIconRef.current?.stopAnimation()}
 >
 <UploadIcon ref={uploadIconRef} className="h-4 w-4" />
 <span className="hidden md:block text-[10px] font-semibold uppercase tracking-[0.18em]">{t("import.button")}</span>
 </Button>

<<<<<<< HEAD
 <Dialog
 open={isOpen}
 onOpenChange={(open) => {
 if (!open) {
 setIsOpen(false);
 // Defer state reset to after dialog close animation completes
 // to prevent heavy re-renders during animation that freeze the UI
 requestAnimationFrame(() => {
 resetImportState();
 });
 } else {
 setIsOpen(true);
 }
 }}
 >
 <DialogContent
 className={cn("flex h-[92dvh] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex-col overflow-hidden border-v2-border bg-v2-bg-surface p-0 text-v2-text-primary shadow-[0_36px_100px_-28px_rgba(0,0,0,0.85)] sm:h-[80vh] sm:max-w-[80vw]",
 )}
 onPointerDownOutside={(e) => {
 // Prevent accidental closes during import flow
 if (step !== 'select-import-type') {
 e.preventDefault();
 }
 }}
 onEscapeKeyDown={(e) => {
 // Only allow escape on first step
 if (step !== 'select-import-type') {
 e.preventDefault();
 }
 }}
 >
 <ImportDialogHeader step={step} importType={importType} />

 <div className="flex-1 overflow-hidden p-6">
 <ImportErrorBoundary onReset={resetImportState}>
 {renderStep()}
 </ImportErrorBoundary>
 </div>
=======
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsOpen(false);
            // Defer state reset to after dialog close animation completes
            // to prevent heavy re-renders during animation that freeze the UI
            requestAnimationFrame(() => {
              resetImportState();
            });
          } else {
            setIsOpen(true);
          }
        }}
      >
        <DialogContent
          className={cn(
            "flex h-[92dvh] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex-col overflow-hidden border-v2-border bg-v2-bg-surface p-0 text-v2-text-primary shadow-[0_36px_100px_-28px_rgba(0,0,0,0.85)] sm:h-[80vh] sm:max-w-[80vw]",
          )}
          onPointerDownOutside={(e) => {
            // Prevent accidental closes during import flow
            if (step !== 'select-import-type') {
              e.preventDefault();
            }
          }}
          onEscapeKeyDown={(e) => {
            // Only allow escape on first step
            if (step !== 'select-import-type') {
              e.preventDefault();
            }
          }}
        >
          <ImportDialogHeader step={step} importType={importType} />

          <div className="flex-1 overflow-hidden p-6">
            <ImportErrorBoundary onReset={resetImportState}>
              {renderStep()}
            </ImportErrorBoundary>
          </div>
>>>>>>> origin/main

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
