import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ArrowUp, RotateCcw } from 'lucide-react';
import { populations, scenarios, getPopulationAffinities } from '../data/scenarios';
import type { Population, Scenario } from '../data/scenarios';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_MESSAGES = 20; // 10 exchanges

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const sidebarFade = {
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
};

const messageFade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
};

// ---------------------------------------------------------------------------
// Population card (sidebar)
// ---------------------------------------------------------------------------

function PopulationCard({
  population,
  isSelected,
  onSelect,
}: {
  population: Population;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left px-3 py-2.5 transition-colors duration-150 cursor-pointer ${
        isSelected
          ? 'bg-surface-warm'
          : 'bg-transparent hover:bg-surface-warm/50'
      }`}
      style={{
        borderLeft: isSelected ? `2px solid ${population.color}` : '2px solid transparent',
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: population.color }}
        />
        <span className="font-semibold text-sm text-ink-800 truncate">
          {population.name}
        </span>
      </div>
      <p className="text-xs text-ink-500 truncate mt-0.5 ml-4">
        {population.description}
      </p>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Scenario pill (sidebar)
// ---------------------------------------------------------------------------

function ScenarioPill({
  scenario,
  isSelected,
  onSelect,
}: {
  scenario: Scenario;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors duration-150 cursor-pointer ${
        isSelected
          ? 'bg-surface border border-ink-200 font-medium text-ink-800'
          : 'text-ink-500 hover:text-ink-600 hover:bg-surface-warm/50'
      }`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: scenario.color }}
      />
      <span className="truncate">{scenario.name}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Chat message bubble
// ---------------------------------------------------------------------------

function MessageBubble({
  message,
  populationColor,
  populationName,
  isFirstAssistant,
}: {
  message: ChatMessage;
  populationColor: string;
  populationName: string;
  isFirstAssistant: boolean;
}) {
  if (message.role === 'user') {
    return (
      <motion.div
        {...messageFade}
        className="flex justify-end"
      >
        <div className="bg-surface border border-ink-150 rounded-xl rounded-br-sm px-4 py-3 max-w-[75%] ml-auto">
          <p className="text-sm text-ink-800 leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      {...messageFade}
      className="flex justify-start"
    >
      <div
        className="pl-4 max-w-[80%]"
        style={{ borderLeft: `2px solid ${populationColor}` }}
      >
        {isFirstAssistant && (
          <div
            className="font-display text-sm mb-1"
            style={{ color: populationColor }}
          >
            {populationName}
          </div>
        )}
        <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <span className="text-ink-300">
          <MessageSquare size={32} className="mx-auto mb-3" />
        </span>
        <p className="text-ink-400 text-sm">
          Select a population and scenario to begin your field interview
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main InterviewView component
// ---------------------------------------------------------------------------

export default function InterviewView() {
  // Selection state
  const [selectedPopulationId, setSelectedPopulationId] = useState<string | null>(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Derived data
  const selectedPopulation = populations.find((p) => p.id === selectedPopulationId) ?? null;
  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId) ?? null;
  const hasSelection = selectedPopulation !== null && selectedScenario !== null;
  const isAtLimit = messages.length >= MAX_MESSAGES;

  // Affinity-sorted scenarios
  const affinityScenarios = selectedPopulationId
    ? getPopulationAffinities(selectedPopulationId)
    : [];
  const affinityIds = new Set(affinityScenarios.map((s) => s.id));
  const nonAffinityScenarios = scenarios.filter((s) => !affinityIds.has(s.id));

  // -------------------------------------------------------------------------
  // Auto-scroll to bottom
  // -------------------------------------------------------------------------

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // -------------------------------------------------------------------------
  // Auto-resize textarea
  // -------------------------------------------------------------------------

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [input]);

  // -------------------------------------------------------------------------
  // Cleanup abort controller on unmount
  // -------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // -------------------------------------------------------------------------
  // Reset conversation
  // -------------------------------------------------------------------------

  const resetConversation = useCallback(() => {
    abortControllerRef.current?.abort();
    setMessages([]);
    setInput('');
    setIsStreaming(false);
  }, []);

  // -------------------------------------------------------------------------
  // Handle population selection
  // -------------------------------------------------------------------------

  const handlePopulationSelect = useCallback(
    (populationId: string) => {
      if (populationId === selectedPopulationId) return;
      setSelectedPopulationId(populationId);
      resetConversation();
    },
    [selectedPopulationId, resetConversation],
  );

  // -------------------------------------------------------------------------
  // Handle scenario selection
  // -------------------------------------------------------------------------

  const handleScenarioSelect = useCallback(
    (scenarioId: string) => {
      if (scenarioId === selectedScenarioId) return;
      setSelectedScenarioId(scenarioId);
      resetConversation();
    },
    [selectedScenarioId, resetConversation],
  );

  // -------------------------------------------------------------------------
  // Send message + stream response
  // -------------------------------------------------------------------------

  const sendMessage = useCallback(async () => {
    if (!hasSelection || !input.trim() || isStreaming || isAtLimit) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsStreaming(true);

    // Create abort controller for this request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Add placeholder assistant message
    const assistantMessage: ChatMessage = { role: 'assistant', content: '' };
    setMessages([...updatedMessages, assistantMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          populationId: selectedPopulationId,
          scenarioId: selectedScenarioId,
          messages: updatedMessages,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data) as { text: string };
              accumulated += parsed.text;
              setMessages([
                ...updatedMessages,
                { role: 'assistant', content: accumulated },
              ]);
            } catch {
              // Skip malformed chunks
            }
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled — expected behavior
        return;
      }
      // Show error in assistant message
      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }, [hasSelection, input, isStreaming, isAtLimit, messages, selectedPopulationId, selectedScenarioId]);

  // -------------------------------------------------------------------------
  // Handle keyboard in textarea
  // -------------------------------------------------------------------------

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage],
  );

  // -------------------------------------------------------------------------
  // Determine if a message is the first assistant message (for name label)
  // -------------------------------------------------------------------------

  const isFirstAssistantMessage = useCallback(
    (index: number): boolean => {
      if (messages[index]?.role !== 'assistant') return false;
      for (let i = 0; i < index; i++) {
        if (messages[i]?.role === 'assistant') return false;
      }
      return true;
    },
    [messages],
  );

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="h-full w-full bg-parchment flex overflow-hidden">
      {/* ----------------------------------------------------------------- */}
      {/* Left Sidebar                                                      */}
      {/* ----------------------------------------------------------------- */}
      <motion.aside
        {...sidebarFade}
        transition={{ duration: 0.35 }}
        className="w-[280px] shrink-0 border-r border-ink-150 bg-surface/60 flex flex-col overflow-y-auto"
      >
        {/* Populations */}
        <div className="px-4 pt-5 pb-2">
          <h2 className="text-[10px] font-semibold tracking-[0.12em] uppercase text-ink-400 mb-2">
            Select a Population
          </h2>
        </div>
        <div className="flex flex-col">
          {populations.map((pop) => (
            <PopulationCard
              key={pop.id}
              population={pop}
              isSelected={pop.id === selectedPopulationId}
              onSelect={() => handlePopulationSelect(pop.id)}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="mx-4 my-3 border-t border-ink-150" />

        {/* Scenarios */}
        <div className="px-4 pb-2">
          <h2 className="text-[10px] font-semibold tracking-[0.12em] uppercase text-ink-400 mb-2">
            Select a Scenario
          </h2>
        </div>
        <div className="px-4 pb-5 flex flex-wrap gap-1.5">
          {selectedPopulationId ? (
            <>
              {/* Affinity scenarios first */}
              {affinityScenarios.map((s) => (
                <ScenarioPill
                  key={s.id}
                  scenario={s}
                  isSelected={s.id === selectedScenarioId}
                  onSelect={() => handleScenarioSelect(s.id)}
                />
              ))}

              {/* Divider between affinity and non-affinity */}
              {affinityScenarios.length > 0 && nonAffinityScenarios.length > 0 && (
                <div className="w-full border-t border-ink-100 my-1" />
              )}

              {/* Non-affinity scenarios */}
              {nonAffinityScenarios.map((s) => (
                <ScenarioPill
                  key={s.id}
                  scenario={s}
                  isSelected={s.id === selectedScenarioId}
                  onSelect={() => handleScenarioSelect(s.id)}
                />
              ))}
            </>
          ) : (
            /* All scenarios when no population selected */
            scenarios.map((s) => (
              <ScenarioPill
                key={s.id}
                scenario={s}
                isSelected={s.id === selectedScenarioId}
                onSelect={() => handleScenarioSelect(s.id)}
              />
            ))
          )}
        </div>
      </motion.aside>

      {/* ----------------------------------------------------------------- */}
      {/* Chat Area                                                         */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Context strip */}
        {hasSelection && (
          <div className="border-b border-ink-150 bg-surface/60 backdrop-blur-sm px-6 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: selectedPopulation.color }}
                />
                <span className="font-medium text-ink-700">
                  {selectedPopulation.name}
                </span>
              </span>
              <span className="text-ink-300">/</span>
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: selectedScenario.color }}
                />
                <span className="font-medium text-ink-700">
                  {selectedScenario.name}
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={resetConversation}
              className="flex items-center gap-1.5 text-xs text-ink-400 hover:text-ink-600 transition-colors duration-150 cursor-pointer"
            >
              <span className="text-ink-400">
                <RotateCcw size={12} />
              </span>
              New Interview
            </button>
          </div>
        )}

        {/* Messages area */}
        {!hasSelection ? (
          <EmptyState />
        ) : (
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="max-w-3xl mx-auto space-y-4">
              <AnimatePresence mode="popLayout">
                {messages.map((msg, i) => (
                  <MessageBubble
                    key={`${i}-${msg.role}`}
                    message={msg}
                    populationColor={selectedPopulation.color}
                    populationName={selectedPopulation.name}
                    isFirstAssistant={isFirstAssistantMessage(i)}
                  />
                ))}
              </AnimatePresence>

              {/* Limit reached message */}
              {isAtLimit && (
                <motion.div
                  {...messageFade}
                  className="text-center py-4"
                >
                  <p className="text-xs text-ink-400">
                    Interview limit reached.{' '}
                    <button
                      type="button"
                      onClick={resetConversation}
                      className="text-topo-sage hover:underline cursor-pointer"
                    >
                      Start a new interview to continue
                    </button>
                  </p>
                </motion.div>
              )}

              {/* Streaming indicator */}
              {isStreaming && messages[messages.length - 1]?.content === '' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1 pl-4 text-ink-400"
                  style={{ borderLeft: `2px solid ${selectedPopulation.color}` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-300 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-300 animate-pulse [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-300 animate-pulse [animation-delay:0.4s]" />
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Input area */}
        {hasSelection && (
          <div className="border-t border-ink-150 bg-surface/80 backdrop-blur-sm p-4 shrink-0">
            <div className="max-w-3xl mx-auto flex items-end gap-3">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about their daily life, fears, hopes..."
                disabled={isStreaming || isAtLimit}
                rows={1}
                className="flex-1 resize-none rounded-xl border border-ink-150 bg-surface px-4 py-3 text-sm text-ink-800 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-topo-sage/30 focus:border-topo-sage/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={isStreaming || !input.trim() || isAtLimit}
                className="w-9 h-9 shrink-0 rounded-full bg-topo-sage text-white flex items-center justify-center transition-opacity duration-150 disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 cursor-pointer"
              >
                <ArrowUp size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
