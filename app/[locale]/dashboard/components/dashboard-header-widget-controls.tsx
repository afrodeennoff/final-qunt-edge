"use client";

import React from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/app/[locale]/dashboard/dashboard-context";
import { useI18n } from "@/locales/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CheckCircle2, CloudUpload, RotateCcw, Sparkles, Trash2 } from "lucide-react";

const AddWidgetSheet = dynamic(
  () => import("@/app/[locale]/dashboard/components/add-widget-sheet").then((m) => m.AddWidgetSheet),
  { ssr: false }
);

const ShareButton = dynamic(
  () => import("./share-button").then((m) => m.ShareButton),
  { ssr: false }
);

type DashboardHeaderWidgetControlsProps = {
  isMobile: boolean;
};

export function DashboardHeaderWidgetControls({ isMobile }: DashboardHeaderWidgetControlsProps) {
  const t = useI18n();
  const {
    isCustomizing,
    toggleCustomizing,
    addWidget,
    layouts,
    autoSaveStatus,
    flushPendingSaves,
    removeAllWidgets,
    restoreDefaultLayout,
  } = useDashboard();
  const currentLayout = layouts || { desktop: [], mobile: [] };

  const customizeButtonText = getCustomizeButtonText(t, isCustomizing);

  return (
    <div className={getHeaderWrapperClass(isMobile)}>
      <button
        type="button"
        id="customize-mode"
        aria-label={customizeButtonText}
        onClick={toggleCustomizing}
        className={getCustomizeButtonClasses(isMobile, isCustomizing)}
      >
        <div className={getCustomizeIconClasses(isCustomizing)}>
          <CustomizeModeIcon isCustomizing={isCustomizing} />
        </div>
        <span className={getCustomizeLabelClasses(isMobile)}>{customizeButtonText}</span>
      </button>

      {isCustomizing && (
        <CustomizingControls
          t={t}
          isCustomizing={isCustomizing}
          isMobile={isMobile}
          addWidget={addWidget}
          autoSaveStatus={autoSaveStatus}
          flushPendingSaves={flushPendingSaves}
          removeAllWidgets={removeAllWidgets}
          restoreDefaultLayout={restoreDefaultLayout}
        />
      )}

      {!isMobile && (
        <>
          <div className="mx-1 h-4 w-px bg-v2-border/15" />
          <ShareButton currentLayout={currentLayout} />
        </>
      )}
    </div>
  );
}

type CustomizingControlsProps = {
  t: ReturnType<typeof useI18n>;
  isCustomizing: boolean;
  isMobile: boolean;
} & Pick<
  ReturnType<typeof useDashboard>,
  "addWidget" | "autoSaveStatus" | "flushPendingSaves" | "removeAllWidgets" | "restoreDefaultLayout"
>;

function CustomizingControls({
  t,
  isCustomizing,
  isMobile,
  addWidget,
  autoSaveStatus,
  flushPendingSaves,
  removeAllWidgets,
  restoreDefaultLayout,
}: CustomizingControlsProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="mx-0.5 h-4 w-px bg-v2-border/15" />
      <AddWidgetSheet onAddWidget={addWidget} isCustomizing={isCustomizing} />

      {!isMobile && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              aria-label={t("widgets.restoreDefaults")}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-v2-text-secondary transition-colors hover:border-v2-border/20 hover:bg-v2-bg-hover hover:text-v2-text-primary"
              title={t("widgets.restoreDefaults")}
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("widgets.restoreDefaultsConfirmTitle")}</AlertDialogTitle>
              <AlertDialogDescription>{t("widgets.restoreDefaultsConfirmDescription")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={restoreDefaultLayout}>
                {t("widgets.confirmRestoreDefaults")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {!isMobile && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              aria-label={t("widgets.deleteAll")}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-v2-text-secondary transition-colors hover:border-v2-border/20 hover:bg-v2-bg-hover hover:text-v2-text-primary"
              title={t("widgets.deleteAll")}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("widgets.deleteAllConfirmTitle")}</AlertDialogTitle>
              <AlertDialogDescription>{t("widgets.deleteAllConfirmDescription")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={removeAllWidgets}
                className="bg-foreground/10 text-foreground hover:bg-foreground/20 border border-foreground/10"
              >
                {t("widgets.confirmDeleteAll")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {autoSaveStatus.hasPending ? (
        <button
          type="button"
          onClick={flushPendingSaves}
          aria-label="Save pending dashboard changes"
          className={cn(
            "flex items-center justify-center rounded-full border border-v2-accent/20 bg-v2-accent/10 text-v2-text-primary transition-colors animate-pulse",
            isMobile ? "h-11 w-11" : "h-8 w-8"
          )}
          title="Save Changes"
        >
          <CloudUpload className="w-4 h-4" />
        </button>
      ) : (
        <div
          role="status"
          aria-label="All changes saved"
          className={cn(
            "flex items-center justify-center rounded-full border border-v2-border/15 bg-v2-bg-base/55 text-v2-text-secondary",
            isMobile ? "h-11 w-11" : "h-8 w-8"
          )}
          title="All changes saved"
        >
          <CheckCircle2 className="w-4 h-4 text-v2-text-primary" />
        </div>
      )}
    </div>
  );
}

function getHeaderWrapperClass(isMobile: boolean) {
  return cn(
    "ml-0.5 flex shrink-0 items-center gap-1",
    isMobile
      ? "rounded-full border border-v2-border/15 bg-v2-bg-base/70 p-1"
      : "pl-0.5"
  );
}

function getCustomizeButtonClasses(isMobile: boolean, isCustomizing: boolean) {
  return cn(
    "relative group flex items-center gap-2 rounded-lg transition-all duration-200",
    isMobile ? "h-11 w-11 justify-center px-0" : "h-9 px-3.5",
    isCustomizing
      ? "bg-v2-accent text-v2-accent-foreground shadow-sm"
      : "rounded-full border border-transparent bg-transparent text-v2-text-secondary hover:bg-v2-bg-hover/70 hover:text-v2-text-primary"
  );
}

function getCustomizeIconClasses(isCustomizing: boolean) {
  return cn("transition-transform duration-300", isCustomizing && "rotate-180");
}

function getCustomizeLabelClasses(isMobile: boolean) {
  return cn("text-[10px] font-bold uppercase tracking-widest", isMobile && "sr-only");
}

function getCustomizeButtonText(
  t: ReturnType<typeof useI18n>,
  isCustomizing: boolean
) {
  return isCustomizing ? t("widgets.done") : t("widgets.edit");
}

type CustomizeModeIconProps = {
  isCustomizing: boolean;
};

function CustomizeModeIcon({ isCustomizing }: CustomizeModeIconProps) {
  return isCustomizing ? (
    <CheckCircle2 className="h-4 w-4" />
  ) : (
    <Sparkles className="h-4 w-4" />
  );
}
