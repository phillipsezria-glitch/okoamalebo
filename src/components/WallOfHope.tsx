/**
 * Okoa Malebo - Private Recovery Notes Component
 * Local reflection board with supportive reactions
 */

'use client';

import { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { getWallPosts, saveWallPost, updateWallPostReactions, generateId, now, SUBSTANCE_LABELS } from '@/lib/storage';
import type { WallOfHopePost } from '@/types';

export function WallOfHope() {
  const { profile } = useProfile();
  const [posts, setPosts] = useState<WallOfHopePost[]>(getWallPosts);
  const [newPost, setNewPost] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handleReact = (postId: string, reactionType: 'chapaLuku' | 'simamaImara' | 'barikiwa') => {
    updateWallPostReactions(postId, reactionType);
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, reactions: { ...post.reactions, [reactionType]: post.reactions[reactionType] + 1 } }
        : post
    ));
  };

  const handleSubmitPost = () => {
    if (!profile || !newPost.trim()) return;
    
    setIsPosting(true);
    const post: WallOfHopePost = {
      id: generateId(),
      pseudoHandle: profile.pseudoHandle,
      content: newPost.trim(),
      daysSober: Math.max(0, Math.floor((Date.now() - profile.sobrietyStartTime) / (1000 * 60 * 60 * 24))),
      substance: profile.primarySubstance,
      reactions: { chapaLuku: 0, simamaImara: 0, barikiwa: 0 },
      createdAt: now(),
    };
    saveWallPost(post);
    setPosts(prev => [post, ...prev]);
    setNewPost('');
    setIsPosting(false);
  };

  return (
    <div className="recovery-notes-panel motion-panel min-w-0 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5 shadow-[0_8px_20px_var(--shadow-color)] sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">My Recovery Notes</h3>
          <p className="mt-1 text-xs text-slate-500">Saved privately on this device</p>
        </div>
        <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
          💬 Voices
        </span>
      </div>

      {/* Post input */}
      {profile && (
        <div className="mb-6">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share your win, struggle, or encouragement... (anonymous)"
            rows={3}
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
            maxLength={500}
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-slate-500">{newPost.length}/500</span>
            <button
              onClick={handleSubmitPost}
              disabled={!newPost.trim() || isPosting}
              className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800 disabled:opacity-50"
            >
              {isPosting ? 'Posting...' : 'Post Anonymously'}
            </button>
          </div>
        </div>
      )}

      {/* Posts feed */}
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {posts.map(post => (
          <WallPostCard key={post.id} post={post} onReact={handleReact} />
        ))}
        
        {posts.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <p className="text-lg mb-2">No posts yet</p>
            <p className="text-sm">Be the first to share your journey!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function WallPostCard({ 
  post, 
  onReact 
}: { 
  post: WallOfHopePost; 
  onReact: (postId: string, type: 'chapaLuku' | 'simamaImara' | 'barikiwa') => void;
}) {
  const timeAgo = getTimeAgo(post.createdAt);

  return (
    <div className="rounded-xl border border-slate-200 bg-paper p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded bg-emerald-100 px-2 py-0.5 font-mono text-xs font-medium text-emerald-700">
            {post.pseudoHandle}
          </span>
          <span className="text-xs text-slate-500">
            Day {post.daysSober} • {SUBSTANCE_LABELS[post.substance as keyof typeof SUBSTANCE_LABELS]}
          </span>
        </div>
        <span className="whitespace-nowrap text-xs text-slate-400">{timeAgo}</span>
      </div>
      
      <p className="mb-3 whitespace-pre-wrap text-slate-700">{post.content}</p>
      
      <div className="recovery-reactions grid grid-cols-1 gap-2 border-t border-[var(--line)] pt-2 sm:grid-cols-3">
        <ReactionButton
          icon="🔥"
          label="Chapa Luku!"
          count={post.reactions.chapaLuku}
          onClick={() => onReact(post.id, 'chapaLuku')}
        />
        <ReactionButton
          icon="💪"
          label="Simama Imara!"
          count={post.reactions.simamaImara}
          onClick={() => onReact(post.id, 'simamaImara')}
        />
        <ReactionButton
          icon="🙏"
          label="Barikiwa!"
          count={post.reactions.barikiwa}
          onClick={() => onReact(post.id, 'barikiwa')}
        />
      </div>
    </div>
  );
}

function ReactionButton({ 
  icon, 
  label, 
  count, 
  onClick 
}: { 
  icon: string; 
  label: string; 
  count: number; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="min-w-0 rounded-lg border border-[var(--line)] bg-[var(--surface-raised)] px-3 py-2 text-center transition-colors hover:border-[var(--clay)] hover:bg-[var(--surface-soft)]"
    >
      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700">
        <span>{icon}</span>
        {label}
        <span className="font-mono font-bold text-emerald-700">{count}</span>
      </span>
    </button>
  );
}

function getTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}