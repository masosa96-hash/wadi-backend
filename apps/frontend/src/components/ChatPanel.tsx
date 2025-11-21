import { useEffect, useState } from "react";
import { MessageSquare, Clock, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../config/api";
import { ChatSummary } from "chat-core";
import { cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";

interface ChatPanelProps {
    className?: string;
}

export default function ChatPanel({ className }: ChatPanelProps) {
    const [summary, setSummary] = useState<ChatSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await api.get<{ ok: boolean; data: ChatSummary }>("/api/chat/summary");
                if (response.ok) {
                    setSummary(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch chat summary", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, []);

    return (
        <div className={cn(
            "bg-card border border-border rounded-xl p-6 flex flex-col h-full relative overflow-hidden group",
            className
        )}>
            {/* Background decoration */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />

            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-display font-semibold text-lg leading-none">Conversaciones</h3>
                        <p className="text-xs text-muted-foreground mt-1">Tu historial de chat</p>
                    </div>
                </div>
                {summary && (
                    <div className="text-2xl font-bold font-display text-foreground/80">
                        {summary.total_conversations}
                    </div>
                )}
            </div>

            <div className="flex-1 relative z-10">
                {loading ? (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                        <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                ) : summary?.recent_conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground">
                        <p className="text-sm">No hay conversaciones recientes</p>
                        <button
                            onClick={() => navigate("/chat")}
                            className="mt-3 text-xs text-primary hover:underline"
                        >
                            Iniciar nueva
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {summary?.recent_conversations.map((conv) => (
                            <motion.button
                                key={conv.id}
                                whileHover={{ x: 4 }}
                                onClick={() => navigate(`/chat?id=${conv.id}`)}
                                className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50 group/item"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-sm truncate pr-2 text-foreground/90 group-hover/item:text-primary transition-colors">
                                        {conv.title || "Nueva conversación"}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                                        <Clock className="w-3 h-3" />
                                        {new Date(conv.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                    {conv.message_count} mensajes
                                </p>
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-border/50 relative z-10">
                <button
                    onClick={() => navigate("/chat")}
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors py-2 rounded-lg hover:bg-primary/5"
                >
                    Ir al chat
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
