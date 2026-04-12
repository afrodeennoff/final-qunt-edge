"use client";

import type React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
import { Button } from "@/components/ui/button";
import { RotateCcw, ChevronDown, MessageSquare, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import type { UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { WidgetSize } from "../../types/dashboard";
import { BotMessage } from "./bot-message";
import { UserMessage } from "./user-message";
import { ChatInput } from "./input";
import { ChatHeader } from "./header";
import { EquityChartMessage } from "./equity-chart-message";
import { Response } from "@/components/ai-elements/response";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { useCurrentLocale } from "@/locales/client";
import { useI18n } from "@/locales/client";
import { useRouter } from "next/navigation";
import { saveChat } from "./actions/chat";
import { useUserStore } from "@/store/user-store";
import { useChatStore } from "@/store/chat-store";
import { format } from "date-fns";
import { logger } from "@/lib/logger";
import { DotStream } from "ldrs/react";
import "ldrs/react/DotStream.css";
import { useMoodStore } from "@/store/mood-store";
import { readStoredChatConversation } from "@/lib/chat-retention";

// Types
interface ChatWidgetProps {
  size?: WidgetSize;
}

export type ChatStatus = "error" | "submitted" | "streaming" | "ready";

type ChatTextPart = {
  type: "text";
  text: string;
};

type ChatReasoningPart = {
  type: "reasoning";
  text?: string;
};

type ChatFilePart = {
  type: "file";
  mediaType?: string;
  url: string;
};

type ChatStepStartPart = {
  type: "step-start";
};

type ChatToolState =
  | "input-available"
  | "call"
  | "partial-call"
  | "result"
  | "output-available"
  | "error"
  | "destructive";

type GenericToolPart = {
  type: `tool-${string}`;
  state: ChatToolState;
  toolCallId: string;
  input?: Record<string, unknown>;
  output?: unknown;
  errorText?: string;
};

type AskForConfirmationToolPart = Omit<GenericToolPart, "type" | "input" | "output"> & {
  type: "tool-askForConfirmation";
  input?: {
    message?: string;
  };
  output?: string;
};

type EquityChartToolOutput = {
  chartData: React.ComponentProps<typeof EquityChartMessage>["chartData"];
  accountNumbers: React.ComponentProps<typeof EquityChartMessage>["accountNumbers"];
  showIndividual: React.ComponentProps<typeof EquityChartMessage>["showIndividual"];
  dateRange: React.ComponentProps<typeof EquityChartMessage>["dateRange"];
  timezone: React.ComponentProps<typeof EquityChartMessage>["timezone"];
  totalTrades: React.ComponentProps<typeof EquityChartMessage>["totalTrades"];
};

type EquityChartToolPart = Omit<GenericToolPart, "type" | "output"> & {
  type: "tool-generateEquityChart";
  output?: EquityChartToolOutput;
};

type ChatPart =
  | ChatTextPart
  | ChatReasoningPart
  | ChatFilePart
  | ChatStepStartPart
  | AskForConfirmationToolPart
  | EquityChartToolPart
  | GenericToolPart;

type ChatInputFile = {
  type: "file";
  mediaType: string;
  url: string;
};

type UIMessageWithParts = UIMessage & {
  content?: string;
  parts?: ChatPart[];
};

function getMessageParts(message: UIMessage): ChatPart[] {
  const { parts } = message as UIMessageWithParts;
  return Array.isArray(parts) ? parts : [];
}

function getMessageContent(message: UIMessage): string {
  const { content } = message as UIMessageWithParts;
  return typeof content === "string" ? content : "";
}

function isToolPart(part: ChatPart): part is GenericToolPart | AskForConfirmationToolPart | EquityChartToolPart {
  return part.type.startsWith("tool-");
}

function normalizeStoredMessage(message: UIMessage): UIMessage {
  const parts = getMessageParts(message);
  if (parts.length > 0) {
    return message;
  }

  const content = getMessageContent(message);
  if (!content) {
    return message;
  }

  return {
    ...message,
    parts: [{ type: "text", text: content }],
  } satisfies UIMessageWithParts;
}

// Removed custom scroll state - using use-stick-to-bottom instead

// Constants
const MESSAGE_BATCH_SIZE = 50;

// Utility functions - throttle removed as we're using use-stick-to-bottom

// Message virtualization hook
function useMessageVirtualization(messages: UIMessage[]) {
  const [showAllRequested, setShowAllRequested] = useState(false);
  const shouldShowAll =
    showAllRequested || messages.length <= MESSAGE_BATCH_SIZE;

  const visibleRange = useMemo(
    () =>
      shouldShowAll
        ? { start: 0, end: messages.length }
        : {
            start: Math.max(0, messages.length - MESSAGE_BATCH_SIZE),
            end: messages.length,
          },
    [messages.length, shouldShowAll]
  );

  const visibleMessages = useMemo(() => {
    if (shouldShowAll) return messages;
    return messages.slice(visibleRange.start, visibleRange.end);
  }, [messages, visibleRange, shouldShowAll]);

  const loadMoreMessages = useCallback(() => {
    setShowAllRequested(true);
  }, []);

  return {
    visibleMessages,
    hasMoreMessages: !shouldShowAll && messages.length > MESSAGE_BATCH_SIZE,
    loadMoreMessages,
  };
}

// Resume Scroll Button Component using StickToBottom context
const ResumeScrollButton = () => {
  const t = useI18n();
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  return (
    <AnimatePresence>
      {!isAtBottom && (
        <motion.div
          className="absolute bottom-20 right-4 z-10"
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <Button 
            onClick={handleScrollToBottom}
            size="sm"
            className="shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_16px_48px_-16px_rgba(0,0,0,0.5)] hover:shadow-xl transition-shadow"
            variant="ghost"
          >
            <ChevronDown className="h-4 w-4 mr-1" />
            {t("chat.overlay.resumeScroll")}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Add new message type components
const ThinkingMessage = () => (
  <div className="flex items-center gap-2 text-muted-foreground text-sm py-2 font-terminal">
    <Loader2 className="h-4 w-4 animate-spin" />
    <span className="terminal-cursor">Thinking...</span>
  </div>
);

const FirstMessageLoading = () => {
  const t = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-4">
      <DotStream size="60" speed="2.5" color="hsl(var(--primary))" />
      <p className="text-muted-foreground text-sm">
        {t("chat.loading.firstMessage")}
      </p>
    </div>
  );
};

const ToolCallMessage = ({
  toolName,
  args,
  state,
}: {
  toolName: string;
  args?: Record<string, unknown>;
  state: string;
}) => {
  const isLoading = state === "call" || state === "partial-call";
  return (
    <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      <div className="flex flex-col">
        <span>
          {state === "result"
            ? `Completed ${toolName}`
            : state === "partial-call"
              ? `Preparing ${toolName}...`
              : `Calling ${toolName}...`}
        </span>
        {args && (
          <span className="text-xs opacity-70">
            {Object.entries(args).map(([key, value]) => (
              <span key={key} className="mr-2">
                {key}: {JSON.stringify(value)}
              </span>
            ))}
          </span>
        )}
      </div>
    </div>
  );
};

// Main Component
export default function ChatWidget({ size = "large" }: ChatWidgetProps) {
  const timezone = useUserStore((state) => state.timezone);
  const { supabaseUser: user } = useUserStore.getState();
  const locale = useCurrentLocale();
  const t = useI18n();
  const router = useRouter();
  const [isStarted, setIsStarted] = useState(false);
  const [hideFirstMessage, setHideFirstMessage] = useState(false);
  const { messages: storedMessages, setMessages: setStoredMessages } =
    useChatStore();
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  // Using use-stick-to-bottom for scroll management
  const moods = useMoodStore((state) => state.moods);
  const setMoods = useMoodStore((state) => state.setMoods);

  // Helper to extract plain text from a UI message
  const getMessageText = useCallback((message: UIMessage) => {
    const parts = getMessageParts(message);

    // Check if this message contains tool results that should be rendered as components
    const toolParts = parts.filter((part) => isToolPart(part));
    if (toolParts.length > 0) {
      // Don't extract text for tool messages - they should be handled by the parts renderer
      return "";
    }

    const textParts = parts
      .filter((part): part is ChatTextPart => part.type === "text")
      .map((part) => part.text);
    if (textParts.length > 0) return textParts.join("\n");
    // Fallback for potential legacy content
    return getMessageContent(message);
  }, []);

  // Load stored messages when component mounts
  // Load from user mood store if no messages are stored
  useEffect(() => {
    const loadStoredMessages = async () => {
      // If user is not logged in or there are stored messages, return
      if (!user?.id || storedMessages.length > 0) return;
      setIsLoadingMessages(true);
      try {
        if (moods.length > 0) {
          // Find current day in moods
          const currentDay = format(new Date(), "yyyy-MM-dd");
          const currentMood = moods.find(
            (mood) => format(mood.day, "yyyy-MM-dd") === currentDay
          );
          if (currentMood && currentMood.conversation) {
            try {
              // Hydrate conversation, parsing JSON and mapping to UIMessage structure (including parts)
              const parsedConversation =
                readStoredChatConversation(currentMood.conversation).map(
                  normalizeStoredMessage
                ) || [];

              setStoredMessages(parsedConversation as UIMessage[]);
              setIsStarted(true);
            } catch (e) {
              logger.error({ error: e }, "Failed to parse conversation");
              setStoredMessages([]);
            }
          }
        }
      } finally {
        setIsLoadingMessages(false);
      }
    };
    loadStoredMessages();
  }, [user?.id, moods, setStoredMessages, storedMessages.length]);

  const [input, setInput] = useState("");
  const [files, setFiles] = useState<ChatInputFile[]>([]);

  const {
    messages,
    sendMessage,
    status,
    stop,
    setMessages,
    addToolResult,
    error,
  } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai/chat",
      body: () => ({
        username:
          user?.user_metadata?.full_name ||
          user?.email?.split("@")[0] ||
          "User",
        locale: locale,
        timezone,
      }),
    }),
    onFinish: async ({ messages }) => {
      if (messages[0].role !== "assistant") {
        messages.shift();
      }
      if (!user?.id) return;
      // Remove first message instruction if it exists
      const updatedMood = await saveChat(messages);
      if (updatedMood) {
        // Find current day in moods
        const currentDay = format(new Date(), "yyyy-MM-dd");
        const currentMoodIndex = moods.findIndex(
          (mood) => format(mood.day, "yyyy-MM-dd") === currentDay
        );

        if (currentMoodIndex !== -1) {
          // Replace existing mood with updated one
          const newMoods = [...moods];
          newMoods[currentMoodIndex] = updatedMood;
          setMoods(newMoods);
        } else {
          // Add new mood if none exists for today
          setMoods([...moods, updatedMood]);
        }
      }
      setStoredMessages(messages);
    },
  });

  const hasPendingToolCalls = useMemo(
    () =>
      messages.some((message) =>
        getMessageParts(message).some(
          (part) =>
            isToolPart(part) &&
            !["result", "output-available", "error"].includes(part.state)
        )
      ),
    [messages]
  );

  const isProcessingResponse =
    status === "streaming" || status === "submitted" || hasPendingToolCalls;

  const uiStatus: ChatStatus = isProcessingResponse
    ? "streaming"
    : (status as ChatStatus);

  // Initialize chat with stored messages (v5 removed initialMessages option)
  useEffect(() => {
    if (storedMessages.length > 0 && messages.length === 0) {
      // Runtime-compatible but TypeScript sees different UIMessage types between versions
      // The message structure is identical, so this is safe
      setMessages(storedMessages as Parameters<typeof setMessages>[0]);
    }
  }, [storedMessages, messages.length, setMessages]);

  // Scroll management is now handled by use-stick-to-bottom

  const { visibleMessages, hasMoreMessages, loadMoreMessages } =
    useMessageVirtualization(messages);

  const handleReset = useCallback(async () => {
    setMessages([]);
    setStoredMessages([]);
    setIsStarted(false);
  }, [setMessages, setStoredMessages, setIsStarted]);

  return (
    <Card className="h-full flex flex-col bg-background border-none shadow-none relative overflow-clip">
      <ChatHeader
        title="AI Assistant"
        onReset={handleReset}
        isLoading={isProcessingResponse}
        size={size}
      />
      <CardContent className="flex-1 flex flex-col min-h-0 p-0 relative">
        <StickToBottom
          className="flex-1 min-h-0 w-full overflow-y-auto"
          initial="smooth"
          resize="smooth"
          role="log"
        >
          <StickToBottom.Content className="p-4">
            {hasMoreMessages && (
              <div className="text-center mb-4">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={loadMoreMessages}
                  className="text-xs"
                >
                  Load earlier messages (
                  {messages.length - visibleMessages.length} more)
                </Button>
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {error && (
                <motion.div
                  className="p-3 rounded-lg wrap-break-word overflow-hidden bg-destructive/10 text-destructive border border-destructive/20 mb-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      An error occurred while processing your message.
                    </span>
                    {/* v5: no reload helper; allow page refresh for now */}
                    <Button 
                      type="button"
                      onClick={() => router.refresh()}
                      size="sm"
                      variant="outline"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Retry
                    </Button>
                  </div>
                </motion.div>
              )}

              {isStarted &&
                messages.filter((message) => message.role === "user").length === 1 &&
                isProcessingResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <FirstMessageLoading />
                  </motion.div>
                )}

              {visibleMessages.map((message, index) => {
                // Hide the first user message (greeting) if hideFirstMessage is true
                if (
                  message.role === "user" &&
                  hideFirstMessage &&
                  index === 0
                ) {
                  return null;
                }

                switch (message.role) {
                  case "user":
                    return (
                      <UserMessage key={message.id}>
                        {getMessageParts(message).length > 0
                          ? getMessageParts(message).map((part, index: number) => {
                            if (part.type === "text") {
                              return (
                                <Response key={`${message.id}-text-${index}`}>
                                  {part.text}
                                </Response>
                              );
                            }
                            if (
                              part.type === "file" &&
                              part.mediaType?.startsWith("image/")
                            ) {
                              return (
                                <div
                                  key={`${message.id}-image-${index}`}
                                  className="mt-2"
                                >
                                  <img
                                    src={part.url}
                                    alt={`attachment-${index}`}
                                    className="rounded-lg max-w-full h-auto max-h-96"
                                  />
                                </div>
                              );
                            }
                            return null;
                          })
                          : getMessageText(message)}
                      </UserMessage>
                    );
                  case "assistant":
                    if (getMessageParts(message).length > 0) {
                      return getMessageParts(message).map((part, index: number) => {
                        switch (part.type) {
                          case "step-start":
                            if (getMessageParts(message).length > index) {
                              return null;
                            }
                            return (
                              <ThinkingMessage
                                key={`${message.id}-step-${index}`}
                              />
                            );
                          case "text":
                            return (
                              <BotMessage
                                key={`${message.id}-${index}`}
                                status={uiStatus}
                              >
                                {part.text}
                              </BotMessage>
                            );
                          case "reasoning":
                            return (
                              <Reasoning
                                key={`${message.id}-reasoning-${index}`}
                                defaultOpen={false}
                                isStreaming={uiStatus === "streaming"}
                              >
                                <ReasoningTrigger />
                                <ReasoningContent>
                                  {part.text ?? ""}
                                </ReasoningContent>
                              </Reasoning>
                            );
                          case "file":
                            if (part.mediaType?.startsWith("image/")) {
                              return (
                                <BotMessage
                                  key={`${message.id}-image-${index}`}
                                  status={uiStatus}
                                >
                                  <div className="mt-2">
                                    <img
                                      src={part.url}
                                      alt={`attachment-${index}`}
                                      className="rounded-lg max-w-full h-auto max-h-96"
                                    />
                                  </div>
                                </BotMessage>
                              );
                            }
                            return null;
                          case "tool-askForConfirmation": {
                            const confirmationPart = part as AskForConfirmationToolPart
                            switch (part.state) {
                              case "input-available":
                                return (
                                  <BotMessage
                                    key={`${part.toolCallId}-input`}
                                    status={uiStatus}
                                  >
                                    {confirmationPart.input?.message}
                                  </BotMessage>
                                );
                              case "call":
                                return (
                                  <BotMessage
                                    key={`${part.toolCallId}-call`}
                                    status={uiStatus}
                                  >
                                    {confirmationPart.input?.message}
                                    <div className="flex gap-2 mt-2">
                                      <Button 
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          addToolResult({
                                            tool: "askForConfirmation",
                                            toolCallId: part.toolCallId,
                                            output: "Yes, confirmed.",
                                          })
                                        }
                                      >
                                        Yes
                                      </Button>
                                      <Button 
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          addToolResult({
                                            tool: "askForConfirmation",
                                            toolCallId: part.toolCallId,
                                            output: "No, denied",
                                          })
                                        }
                                      >
                                        No
                                      </Button>
                                    </div>
                                  </BotMessage>
                                );
                              case "result":
                              case "output-available":
                                return (
                                  <BotMessage
                                    key={`${part.toolCallId}-result`}
                                    status={uiStatus}
                                  >
                                    Response: {confirmationPart.output}
                                  </BotMessage>
                                );
                              default:
                                return null;
                            }
                          }
                          case "tool-generateEquityChart": {
                            const equityChartPart = part as EquityChartToolPart
                            switch (part.state) {
                              case "input-available":
                              case "call":
                                return (
                                  <div
                                    key={`${part.toolCallId}-input`}
                                    className="p-3 rounded-lg bg-muted/50"
                                  >
                                    {t("chat.chart.generating")}
                                  </div>
                                );
                              case "result":
                              case "output-available":
                                const chartData = equityChartPart.output;

                                // Check if we have valid chart data
                                if (
                                  chartData &&
                                  typeof chartData === "object" &&
                                  "chartData" in chartData
                                ) {
                                  return (
                                    <div key={`${part.toolCallId}-result`}>
                                      <EquityChartMessage
                                        chartData={chartData.chartData}
                                        accountNumbers={
                                          chartData.accountNumbers
                                        }
                                        showIndividual={
                                          chartData.showIndividual
                                        }
                                        dateRange={chartData.dateRange}
                                        timezone={chartData.timezone}
                                        totalTrades={chartData.totalTrades}
                                      />
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div
                                      key={`${part.toolCallId}-result`}
                                      className="p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20"
                                    >
                                      Error: Invalid chart data received -
                                      missing required properties
                                    </div>
                                  );
                                }
                              case "error":
                                return (
                                  <div
                                    key={`${part.toolCallId}-error`}
                                    className="p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20"
                                  >
                                    Error: {part.errorText}
                                  </div>
                                );
                              default:
                                return null;
                            }
                          }
                          default:
                            // Handle other tool types generically
                            if (part.type.startsWith("tool-")) {
                              const toolName = part.type.replace("tool-", "");
                              return (
                                <ToolCallMessage
                                  key={`${part.toolCallId}-${part.state}`}
                                  toolName={toolName}
                                  args={part.input}
                                  state={part.state}
                                />
                              );
                            }
                            return null;
                        }
                      });
                    }
                    const messageText = getMessageText(message);
                    return (
                      <BotMessage status={uiStatus} key={message.id}>
                        {messageText}
                      </BotMessage>
                    );
                  case "system":
                    return null;
                  default:
                    return null;
                }
              })}
            </AnimatePresence>
          </StickToBottom.Content>

          <ResumeScrollButton />
        </StickToBottom>

        <ChatInput
          onSend={() => {
            if (!input.trim() && files.length === 0) return;

            const parts: Array<ChatTextPart | ChatInputFile> = [];
            if (input.trim()) {
              parts.push({ type: "text", text: input });
            }
            if (files.length > 0) {
              parts.push(...files);
            }

            sendMessage({
              role: "user",
              parts: parts,
            });
            setInput("");
            setFiles([]);
          }}
          status={uiStatus}
          stop={stop}
          input={input}
          handleInputChange={(e) => setInput(e.target.value)}
          onFilesChange={setFiles}
          files={files}
        />
      </CardContent>
      {!isStarted && !isLoadingMessages && storedMessages.length === 0 && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md p-4 sm:p-6 gap-4 sm:gap-6 text-center">
            <div className="flex justify-center">
              <div className="p-2 sm:p-3 rounded-full bg-primary/10">
                <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
            </div>
            <div className="gap-2">
              <h3 className="text-xl sm:text-2xl font-semibold tracking-tight">
                {t("chat.overlay.welcome")}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t("chat.overlay.description")}
              </p>
            </div>
            <Button 
              onClick={() => {
                setIsStarted(true);
                setHideFirstMessage(true);
                // Send a greeting message to trigger AI response
                sendMessage({ text: t("chat.greeting.message") });
              }}
              size="lg"
              className="w-full text-sm sm:text-base animate-in fade-in zoom-in"
            >
              {t("chat.overlay.startButton")}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
