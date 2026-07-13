import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getFeed, createPost, uploadImage, db } from '../firebase/index';
import {
  doc, updateDoc, increment, serverTimestamp, deleteField, arrayUnion, deleteDoc
} from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faImage, faThumbsUp, faThumbsDown,
  faRetweet, faTrash
} from '@fortawesome/free-solid-svg-icons';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const NewsFeed = () => {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
 
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [filter, setFilter] = useState('Global');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Timestamp Formatter
  const formatRelativeTime = useCallback((timestamp) => {
    if (!timestamp) return 'Just now';
    const now = Date.now();
    const postTime = timestamp?.toMillis ? timestamp.toMillis() : new Date(timestamp).getTime();
    const diff = Math.floor((now - postTime) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }, []);

  // Load Posts
  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const feedFilter = filter === 'My Faculty' ? profile?.faculty : 'Global';
      const data = await getFeed(feedFilter);
      
      let filteredPosts = data || [];
      if (statusFilter !== 'All') {
        filteredPosts = filteredPosts.filter(post =>
          (post.authorRole || post.author?.role || '').toLowerCase() === statusFilter.toLowerCase()
        );
      }
      setPosts(filteredPosts);
    } catch (err) {
      console.error("Feed load error:", err);
      showToast("Failed to load feed", "error");
    } finally {
      setLoading(false);
    }
  }, [filter, statusFilter, profile?.faculty, showToast]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Vote Handler
  const handleVote = async (postId, type, currentVotes = {}) => {
    if (!user) {
      showToast("Please sign in to vote", "error");
      return;
    }
    const postRef = doc(db, 'posts', postId);
    const existingVote = currentVotes[user.uid];
    try {
      const updates = existingVote === type
        ? { [`votes.${user.uid}`]: deleteField() }
        : { [`votes.${user.uid}`]: type };
      await updateDoc(postRef, updates);
      loadPosts();
    } catch (err) {
      console.error("Vote error:", err);
      showToast("Failed to vote", "error");
    }
  };

  // Repost Handler
  const handleRepost = async (post) => {
    if (!user) {
      showToast("Please sign in to repost", "error");
      return;
    }
    try {
      const repostData = {
        authorId: user.uid,
        authorName: profile?.displayName || "Muni Student",
        authorPhoto: profile?.photoURL || null,
        authorRole: profile?.role || "Student",
        faculty: profile?.faculty || "General",
        content: post.content,
        imageUrl: post.imageUrl || null,
        votes: {},
        reactions: { happy: 0, funny: 0, surprised: 0 },
        isRepost: true,
        originalAuthorName: post.authorName,
        originalAuthorPhoto: post.authorPhoto || null,
        createdAt: serverTimestamp()
      };
      await createPost(repostData);
      const postRef = doc(db, 'posts', post.id);
      await updateDoc(postRef, { repostCount: increment(1) });
      showToast("Reposted successfully!", "success");
      loadPosts();
    } catch (err) {
      console.error("Repost error:", err);
      showToast("Failed to repost", "error");
    }
  };

  // Delete Handler
  const handleDelete = async (postId, authorId) => {
    if (!user || user.uid !== authorId) return;
    try {
      await deleteDoc(doc(db, 'posts', postId));
      showToast("Post deleted", "success");
      loadPosts();
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Failed to delete post", "error");
    }
  };

  // Post Submit
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim() && !imageFile) return;
    setIsUploading(true);
    try {
      let uploadedUrl = null;
      if (imageFile) {
        uploadedUrl = await uploadImage(imageFile);
      }

      const postData = {
        authorId: user.uid,
        content: newPost,
        authorName: profile?.displayName || "Muni Student",
        authorPhoto: profile?.photoURL || null,
        authorRole: profile?.role || "Student",
        faculty: profile?.faculty || "General",
        imageUrl: uploadedUrl,
        votes: {},
        reactions: { happy: 0, funny: 0, surprised: 0 },
        createdAt: serverTimestamp()
      };

      await createPost(postData);
      
      setNewPost('');
      setImageFile(null);
      showToast("Post uploaded successfully!", "success");
      loadPosts();
    } catch (error) {
      console.error(error);
      showToast("Submission failed", "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 pb-32">
      
      {/* Create Post */}
      <Card className="p-6 mb-10 shadow-xl bg-white dark:bg-slate-900 rounded-[2rem]">
        <form onSubmit={handlePostSubmit}>
          <textarea
            className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] font-dm text-sm focus:outline-none dark:text-white"
            placeholder="What's happening today?"
            rows="3"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />

          <div className="flex items-center justify-between mt-4">
            <label className="cursor-pointer flex items-center gap-2 text-slate-500 hover:text-brand">
              <FontAwesomeIcon icon={faImage} />
              <span>Add Image</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => setImageFile(e.target.files[0])} 
              />
            </label>

            <Button type="submit" disabled={isUploading || (!newPost.trim() && !imageFile)}>
              {isUploading ? 'Uploading...' : 'Post'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Posts Feed */}
      {loading ? (
        <div className="text-center py-20">Loading feed...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-slate-500">No posts yet. Be the first!</div>
      ) : (
        <div className="space-y-6">
          {posts.map(post => {
            const userVote = post.votes?.[user?.uid];
            return (
              <Card key={post.id} className="p-6 rounded-[2rem] bg-white dark:bg-slate-900">
                {/* Author Info */}
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src={post.authorPhoto || `https://ui-avatars.com/api/?name=${post.authorName}`} 
                    alt={post.authorName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{post.authorName}</p>
                    <p className="text-xs text-slate-500">{formatRelativeTime(post.createdAt)}</p>
                  </div>
                </div>

                {/* Content */}
                <p className="text-slate-700 dark:text-slate-300 mb-4 whitespace-pre-line">{post.content}</p>
                
                {post.imageUrl && (
                  <img src={post.imageUrl} alt="Post" className="rounded-2xl mb-4 w-full" />
                )}

                {/* Voting & Reactions */}
                <div className="flex items-center gap-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button 
                    onClick={() => handleVote(post.id, 'like', post.votes)}
                    className={`flex items-center gap-1.5 transition-colors ${userVote === 'like' ? 'text-blue-500' : 'hover:text-blue-500'}`}
                  >
                    <FontAwesomeIcon icon={faThumbsUp} />
                    <span>{Object.values(post.votes || {}).filter(v => v === 'like').length}</span>
                  </button>

                  <button 
                    onClick={() => handleVote(post.id, 'dislike', post.votes)}
                    className={`flex items-center gap-1.5 transition-colors ${userVote === 'dislike' ? 'text-red-500' : 'hover:text-red-500'}`}
                  >
                    <FontAwesomeIcon icon={faThumbsDown} />
                    <span>{Object.values(post.votes || {}).filter(v => v === 'dislike').length}</span>
                  </button>

                  <button
                    onClick={() => handleRepost(post)}
                    className="flex items-center gap-1.5 ml-auto transition-colors hover:text-green-500"
                  >
                    <FontAwesomeIcon icon={faRetweet} />
                    <span>{post.repostCount || 0}</span>
                  </button>

                  {user?.uid === post.authorId && (
                    <button
                      onClick={() => handleDelete(post.id, post.authorId)}
                      className="flex items-center gap-1.5 transition-colors hover:text-red-500 text-slate-400"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NewsFeed;