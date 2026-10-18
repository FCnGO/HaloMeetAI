import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ConversationRecord, ChatMessage, AppState, OpportunityRecord, PersonMessage } from '../types';
import { api } from '../services/api';
import {
  Send,
  RotateCcw,
  ShieldAlert,
  CalendarCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  Bot,
  UserRound,
  ChevronLeft
} from 'lucide-react';
import { getPastelTheme } from '../utils/pastel';

interface AgentChatWidgetProps {
  targetProfile: UserProfile;
  currentPersona: UserProfile;
  onNavigateToInbox: () => void;
  onSelectDifferentProfile?: () => void;
  onOpportunityCreated?: () => void;
  onStateRefreshed?: (state: AppState) => void;
  existingOpportunities?: OpportunityRecord[];
  initialTab?: 'agent' | 'person';
  personMessages?: PersonMessage[];
  onSendPersonMessage?: (text: string) => void;
}

export const AgentChatWidget: React.FC<AgentChatWidgetProps> = ({
  targetProfile,
  currentPersona,
  onNavigateToInbox,
  onSelectDifferentProfile,
  onOpportunityCreated,
  onStateRefreshed,
  existingOpportunities = [],
  initialTab = 'agent',
  personMessages = [],
  onSendPersonMessage
}) => {
  const [conversation, setConversation] = useState<ConversationRecord | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [meetingQueuedNotice, setMeetingQueuedNotice] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatTarget, setChatTarget] = useState<'agent' | 'person'>(initialTab);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const personMessagesEndRef = useRef<HTMLDivElement>(null);

  const targetPastel = getPastelTheme(targetProfile.id);

  const connectedOpportunity = existingOpportunities.find(
    (o) =>
      o.status === 'connected' &&
      ((o.senderId === currentPersona.id && o.receiverId === targetProfile.id) ||
        (o.senderId === targetProfile.id && o.receiverId === currentPersona.id))
  );

  const [personInput, setPersonInput] = useState('');

  useEffect(() => {
    setPersonInput('');
  }, [targetProfile.id]);

  useEffect(() => {
    personMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [personMessages]);

  const handleSendPersonMessage = () => {
    const text = personInput.trim();
    if (!text || !onSendPersonMessage) return;
    onSendPersonMessage(text);
    setPersonInput('');
  };

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      try {
        const res = await api.getChatHistory(targetProfile.id, currentPersona.id);
        if (isMounted) {
          setConversation(res.conversation);
        }
      } catch (err: any) {
        console.error('Failed to load chat history:', err);
        if (isMounted) {
          setChatError(err?.message || 'Failed to load chat history');
        }
      }
    };
    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [targetProfile.id, currentPersona.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages, isLoading]);

  useEffect(() => {
    setChatTarget(initialTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetProfile.id]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setInputMessage('');
    setIsLoading(true);
    setChatError(null);

    try {
      const res = await api.sendChatMessage({
        targetProfileId: targetProfile.id,
        visitorProfileId: currentPersona.id,
        message: text,
        conversationId: conversation?.id
      });

      setConversation(res.conversation);
      if (res.opportunityCreated) {
        setMeetingQueuedNotice(true);
      }
      if (res.state && onStateRefreshed) {
        onStateRefreshed(res.state);
      }
      if (res.opportunityCreated && onOpportunityCreated) {
        onOpportunityCreated();
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setChatError(err?.message || 'Failed to send message. Please retry.');
      setInputMessage(text);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = async () => {
    const freshConv: ConversationRecord = {
      id: `conv-${currentPersona.id}-${targetProfile.id}-chat-${Date.now()}`,
      participantAId: currentPersona.id,
      participantBId: targetProfile.id,
      kind: 'visitor_chat',
      generatedAt: new Date().toISOString(),
      summary: `Chat with ${targetProfile.name}'s Avatar`,
      messages: [
        {
          id: `msg-welcome-${Date.now()}`,
          role: 'agent',
          senderName: `${targetProfile.name}'s Avatar`,
          text: `Hello! I am ${targetProfile.name}'s authorized representative. ${targetProfile.agentSpec.elevatorPitch} Feel free to ask about our solutions or explore a partnership introduction.`,
          timestamp: new Date().toTimeString().substring(0, 5)
        }
      ]
    };
    setConversation(freshConv);
    setMeetingQueuedNotice(false);
  };

  const allSuggestedQuestions = [
    ...targetProfile.agentSpec.products.flatMap(p => p.suggestedQuestions || []).slice(0, 3),
    targetProfile.id === 'priya-shah'
      ? 'ANiXの機内オフライン機能について教えてください (Japanese)'
      : '最新ソリューションと機内での活用方法を教えてください (Japanese)'
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-[430px] mx-auto bg-[#F6F6F3] text-[#16171A] transition-colors duration-200">
      
      {/* Mobile Chat Subheader */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-[#D8D8D3] shrink-0 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          {onSelectDifferentProfile && (
            <button
              type="button"
              onClick={onSelectDifferentProfile}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#5A5C63] hover:text-[#16171A] transition-colors cursor-pointer shrink-0 -ml-1"
              title="Back to Chats"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>
          )}
          <div className="relative">
            <img
              src={targetProfile.avatar}
              alt={targetProfile.name}
              className="w-9 h-9 rounded-full object-cover ring-2 shadow-xs"
              style={{ borderColor: targetPastel.border }}
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-white"></span>
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm text-[#16171A] leading-tight truncate">
              {chatTarget === 'agent' ? `${targetProfile.name}'s avatar` : targetProfile.name}
            </div>
            <div className="text-xs text-[#8E9097] font-normal mt-0.5 truncate">
              {chatTarget === 'agent' ? 'AI avatar · answers from approved knowledge' : `${targetProfile.role}, ${targetProfile.company}`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetChat}
            className="w-8 h-8 rounded-full bg-[#F6F6F3] flex items-center justify-center text-[#5A5C63] hover:text-[#16171A] border border-[#D8D8D3] transition-colors cursor-pointer"
            title="Reset Chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Agent / Person Tab Toggle */}
      <div className="bg-white px-4 pb-3 border-b border-[#D8D8D3] shrink-0">
        <div className="inline-flex items-center p-0.5 bg-[#F6F6F3] border border-[#D8D8D3] rounded-full shadow-xs">
          <button
            type="button"
            onClick={() => setChatTarget('agent')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              chatTarget === 'agent'
                ? 'bg-[#16171A] text-white shadow-xs'
                : 'text-[#5A5C63] hover:text-[#16171A]'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Avatar</span>
          </button>
          <button
            type="button"
            onClick={() => setChatTarget('person')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              chatTarget === 'person'
                ? 'bg-[#16171A] text-white shadow-xs'
                : 'text-[#5A5C63] hover:text-[#16171A]'
            }`}
          >
            <UserRound className="w-3.5 h-3.5" />
            <span>{targetProfile.name.split(' ')[0]}</span>
          </button>
        </div>
      </div>

      {chatTarget === 'person' ? (
        <>
          {connectedOpportunity && (
            <div className="px-4 pt-3 shrink-0">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-[#166534] bg-[#DCFCE7] border border-[#BBF7D0] rounded-full px-3 py-1.5 w-fit">
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Contacts exchanged · {targetProfile.contactInfo.email}</span>
              </div>
            </div>
          )}

          {/* Direct Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F6F6F3]">
            {personMessages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.fromMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-1.5 text-[10px] text-[#8E9097] mb-1 px-1 font-medium">
                  <span className="font-semibold text-[#5A5C63]">{msg.fromMe ? currentPersona.name : targetProfile.name}</span>
                  <span>·</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div
                  className={`max-w-[85%] rounded-3xl p-4 text-xs leading-relaxed shadow-xs ${
                    msg.fromMe
                      ? 'bg-[#16171A] text-[#F6F6F3] font-medium rounded-br-xs'
                      : 'bg-white text-[#16171A] border border-[#D8D8D3] rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={personMessagesEndRef} />
          </div>

          <p className="px-4 pb-1 text-[10px] text-[#8E9097] text-center shrink-0">
            Direct notes to {targetProfile.name.split(' ')[0]} — contact details stay private until both avatars approve an introduction.
          </p>

          {/* Pinned Person Input Bar */}
          <div className="p-3 bg-white border-t border-[#D8D8D3] shrink-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={personInput}
                onChange={(e) => setPersonInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.nativeEvent.isComposing) return;
                    handleSendPersonMessage();
                  }
                }}
                placeholder={`Message ${targetProfile.name.split(' ')[0]}...`}
                className="flex-1 text-xs px-4 py-3 border border-[#D8D8D3] rounded-full bg-white text-[#16171A] placeholder:text-[#8E9097] focus:outline-hidden focus:border-[#16171A] transition-all shadow-xs"
              />
              <button
                type="button"
                disabled={!personInput.trim()}
                onClick={handleSendPersonMessage}
                className="w-11 h-11 bg-[#16171A] hover:bg-[#26282E] text-white rounded-full flex items-center justify-center transition-colors shadow-xs shrink-0 disabled:opacity-40 cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#F6F6F3]" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <>

      {/* Meeting Request Queued Banner */}
      {meetingQueuedNotice && (
        <div className="bg-[#DCFCE7] border-b border-[#BBF7D0] p-3 px-4 flex items-center justify-between text-xs text-[#166534] shrink-0">
          <div className="flex items-center gap-2 truncate">
            <CalendarCheck className="w-4 h-4 text-[#166534] shrink-0" />
            <span className="truncate font-medium">Meeting request sent to {targetProfile.name}'s Inbox!</span>
          </div>
          <button
            type="button"
            onClick={onNavigateToInbox}
            className="font-semibold text-[#166534] hover:underline flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
          >
            <span>Inbox</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Approved Topics Transparency Banner */}
      {targetProfile.agentSpec.approvedTopics.length > 0 && (
        <div className="mx-4 mt-3 p-3 rounded-2xl bg-[#EEF0FD] text-center text-xs text-[#3E4BD6] leading-relaxed shrink-0">
          This avatar answers only from {targetProfile.name.split(' ')[0]}'s approved topics: {targetProfile.agentSpec.approvedTopics.join(', ')}. Contact details are never shared.
        </div>
      )}

      {/* Messages Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F6F6F3]">
        {conversation?.messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isPermissionNotice = msg.isPermissionNotice;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-[#8E9097] mb-1 px-1 font-medium">
                <span className="font-semibold text-[#5A5C63]">{msg.senderName || (isUser ? currentPersona.name : targetProfile.name)}</span>
                <span>·</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[85%] rounded-3xl p-4 text-xs leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-[#16171A] text-[#F6F6F3] font-medium rounded-br-xs'
                    : isPermissionNotice
                    ? 'bg-[#FFF1F2] text-[#9F1239] border border-[#FECDD3] rounded-bl-xs'
                    : 'bg-white text-[#16171A] border border-[#D8D8D3] rounded-bl-xs'
                }`}
              >
                {isPermissionNotice && (
                  <div className="flex items-center gap-1.5 font-semibold text-[10px] text-[#9F1239] uppercase tracking-wider mb-1.5 pb-1 border-b border-[#FECDD3]">
                    <Lock className="w-3.5 h-3.5 text-[#E11D48]" />
                    <span>Server Security Gate Enforced</span>
                  </div>
                )}
                {msg.text}

                {!isUser && !isPermissionNotice && (
                  <div className="mt-2.5 pt-2 border-t border-[#E2E2DC] flex items-center justify-between gap-3 text-[10px] text-[#8E9097]">
                    <span className="inline-flex items-center gap-1 text-[#16171A] font-semibold">
                      <span>⚡</span>
                      <span>Generated by {msg.modelUsed || 'Gemini 3.8 Flash'}</span>
                    </span>
                    <span>
                      Generated in {((msg.latencyMs || 920) / 1000).toFixed(1)}s
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start">
            <div className="bg-white border border-[#D8D8D3] rounded-3xl p-3 text-xs text-[#5A5C63] flex items-center gap-2.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#16171A] animate-ping"></span>
              <span className="font-medium">{targetProfile.name}'s avatar is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Tray */}
      <div className="bg-white border-t border-[#D8D8D3] p-3 space-y-2 shrink-0">
        
        {/* Quick Questions Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[10px] font-semibold text-[#8E9097] shrink-0 uppercase tracking-wider">
            Ask:
          </span>
          {allSuggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSendMessage(q);
              }}
              className="btn-secondary-pill px-3 py-1.5 text-[11px] whitespace-nowrap shrink-0 shadow-xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Permission Gate Test Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSendMessage(`What is ${targetProfile.name}'s direct personal phone number and private email address?`);
            }}
            className="text-[10px] font-medium px-3 py-1.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer hover:bg-rose-100 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>Test Permission Gate (Ask for phone/email)</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSendMessage(`Can we meet for coffee in the lounge for 20 minutes to discuss a partnership?`);
            }}
            className="btn-secondary-pill px-3 py-1.5 text-[10px] whitespace-nowrap shrink-0"
          >
            Request meeting
          </button>
        </div>
      </div>

      {/* Visible Error State Display */}
      {chatError && (
        <div className="mx-3 my-2 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-900 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2 truncate">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="truncate">{chatError}</span>
          </div>
          <button
            type="button"
            onClick={() => setChatError(null)}
            className="text-xs font-semibold text-rose-700 hover:underline shrink-0 ml-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Pinned Input Bar */}
      <div className="p-3 bg-white border-t border-[#D8D8D3] shrink-0">
        <div
          aria-label="Chat input container"
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              if (chatError) setChatError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                if (e.nativeEvent.isComposing) return;
                if (!isLoading && inputMessage.trim()) {
                  handleSendMessage();
                }
              }
            }}
            placeholder={`Ask ${targetProfile.name.split(' ')[0]}'s avatar...`}
            disabled={isLoading}
            className="flex-1 text-xs px-4 py-3 border border-[#D8D8D3] rounded-full bg-white text-[#16171A] placeholder:text-[#8E9097] focus:outline-hidden focus:border-[#16171A] transition-all shadow-xs"
          />
          <button
            type="button"
            disabled={isLoading || !inputMessage.trim()}
            onClick={() => {
              if (!isLoading && inputMessage.trim()) {
                handleSendMessage();
              }
            }}
            className="w-11 h-11 bg-[#16171A] hover:bg-[#26282E] text-white rounded-full flex items-center justify-center transition-colors shadow-xs shrink-0 disabled:opacity-40 cursor-pointer"
          >
            <Send className="w-4 h-4 text-[#F6F6F3]" />
          </button>
        </div>
      </div>

        </>
      )}

    </div>
  );
};
