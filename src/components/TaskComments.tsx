'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Comment {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
    };
    content: string;
    createdAt: string;
}

interface TaskCommentsProps {
    taskId: string;
    currentUserEmail?: string; // To highlight own comments
}

export default function TaskComments({ taskId, currentUserEmail }: TaskCommentsProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const commentsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchComments();
    }, [taskId]);

    // Auto-scroll to bottom when comments change
    useEffect(() => {
        if (commentsEndRef.current) {
            commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [comments]);

    const fetchComments = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/tasks/${taskId}/comments`);
            const data = await res.json();
            if (data.comments) {
                setComments(data.comments);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/tasks/${taskId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment })
            });
            const data = await res.json();
            if (data.comment) {
                setComments(prev => [...prev, data.comment]);
                setNewComment('');
            }
        } catch (error) {
            console.error('Error sending comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50/50 rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-3 border-b border-gray-100 bg-white/50 backdrop-blur-sm">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Comments</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[300px]">
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        No comments yet. Start the discussion!
                    </div>
                ) : (
                    comments.map((comment) => {
                        const isMe = currentUserEmail && comment.userId.email === currentUserEmail;
                        return (
                            <div key={comment._id} className={cn("flex gap-3", isMe ? "flex-row-reverse" : "flex-row")}>
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-navy-900/10 flex items-center justify-center text-xs font-bold text-navy-900">
                                    {comment.userId.name.charAt(0)}
                                </div>
                                <div className={cn(
                                    "max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                                    isMe ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-gray-700 rounded-tl-none border border-gray-100"
                                )}>
                                    <div className="flex justify-between items-baseline gap-4 mb-1 border-b border-white/10 pb-1">
                                        <span className={cn("text-[10px] font-bold opacity-80", isMe ? "text-blue-100" : "text-navy-900")}>
                                            {comment.userId.name}
                                        </span>
                                        <span className={cn("text-[10px]", isMe ? "text-blue-200" : "text-gray-400")}>
                                            {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={commentsEndRef} />
            </div>

            <div className="p-3 bg-white border-t border-gray-100">
                <div className="relative flex items-end gap-2">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none min-h-[40px] max-h-[100px]"
                        rows={1}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!newComment.trim() || isSubmitting}
                        className="p-2.5 bg-navy-900 text-white rounded-xl hover:bg-navy-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-navy-900/20"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>
                <div className="text-[10px] text-gray-400 mt-1 pl-2">
                    Press Enter to send
                </div>
            </div>
        </div>
    );
}
