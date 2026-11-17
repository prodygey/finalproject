
<!--
Purpose:
Display comments for a community post.
Allow authenticated users to submit comments.
Use BookNest's cream and plum editorial design.
-->

<template>
  <ion-page>
    <ion-content :fullscreen="true" class="comments-content">
      <div class="comments-shell">

        <!-- Top navigation -->
        <header class="topbar">
          <router-link to="/home" class="brand">
            <span class="brand-icon">
              <ion-icon :icon="bookOutline" />
            </span>
            <span>BookNest<span class="brand-dot">.</span></span>
          </router-link>

          <nav class="navigation">
            <router-link to="/feed" class="nav-link active">
              <ion-icon :icon="newspaperOutline" />
              Community
            </router-link>

            <router-link to="/books" class="nav-link">
              <ion-icon :icon="compassOutline" />
              Discover
            </router-link>

            <router-link to="/library" class="nav-link">
              <ion-icon :icon="libraryOutline" />
              My Library
            </router-link>

            <router-link to="/write" class="nav-link">
              <ion-icon :icon="createOutline" />
              Write
            </router-link>
          </nav>
        </header>

        <!-- Page heading -->
        <section class="page-heading">
          <router-link to="/feed" class="back-link">
            <ion-icon :icon="arrowBackOutline" />
            Back to community feed
          </router-link>

          <!--<p class="eyebrow">THE BOOKNEST COMMUNITY</p>
          <h1>Every thought <span>matters.</span></h1>
          <p class="heading-description">
            Share your perspective, join the conversation,
            and connect with readers who love stories as much as you do.
          </p>-->
        </section>

        <!-- Comment form -->
        <section class="comment-composer">
          <div class="composer-heading">
            <div class="composer-icon">
              <ion-icon :icon="chatbubbleEllipsesOutline" />
            </div>
            <div>
              <h2>Leave a comment</h2>
              <p>What would you like to add to the conversation?</p>
            </div>
          </div>

          <form @submit.prevent="addComment">
            <ion-textarea
              v-model="content"
              class="comment-input"
              label="Your thoughts"
              label-placement="stacked"
              placeholder="Share your thoughts respectfully..."
              :auto-grow="true"
              :maxlength="2000"
              :disabled="submitting"
              required
            />

            <div class="composer-footer">
              <span>{{ content.length }} / 2000 characters</span>

              <ion-button
                class="submit-button"
                type="submit"
                :disabled="submitting || !content.trim()"
              >
                <ion-icon
                  slot="start"
                  :icon="paperPlaneOutline"
                />
                {{ submitting ? 'Posting...' : 'Post comment' }}
              </ion-button>
            </div>
          </form>
        </section>

        <!-- Feedback messages -->
        <div v-if="successMessage" class="notice success-notice">
          <ion-icon :icon="checkmarkCircleOutline" />
          {{ successMessage }}
        </div>

        <div v-if="errorMessage" class="notice error-notice">
          <ion-icon :icon="alertCircleOutline" />
          {{ errorMessage }}
        </div>

        <!-- Comments list -->
        <section class="comments-section">
          <div class="section-heading">
            <div>
              <p class="eyebrow">COMMUNITY VOICES</p>
              <h2>Conversation</h2>
            </div>

            <span class="count-badge">
              {{ totalCommentCount }}
              {{ totalCommentCount === 1 ? 'comment' : 'comments' }}
            </span>
          </div>

          <div v-if="loading" class="empty-state">
            <ion-spinner name="crescent" />
            <p>Loading the conversation...</p>
          </div>

          <div v-else-if="!comments.length" class="empty-state">
            <div class="empty-icon">
              <ion-icon :icon="chatbubblesOutline" />
            </div>
            <h3>Start the conversation.</h3>
            <p>
              There are no comments yet. Be the first to share a thought.
            </p>
          </div>

          <div v-else class="comment-list">
            <!-- Original comments -->
            <article v-for="comment in comments" :key="comment.id" class="comment-card">
              <!-- Original comment avatar -->
              <div class="avatar">
                {{ (comment.username || 'U').charAt(0).toUpperCase() }}
              </div>

              <div class="comment-body">

                <!-- Original comment information -->
                <div class="comment-meta">
                  <strong>
                    @{{ comment.username || 'Unknown user' }}
                  </strong>

                  <span>{{ formatDate(comment.created_at) }}</span>
                </div>

                <p class="comment-text">{{ comment.content }}</p>

                <button class="reply-button" type="button" @click="toggleReply(comment.id)">
                  {{ String(replyingTo) === String(comment.id) ? 'Cancel reply' : 'Reply' }}
                </button>

                <!-- Reply form for original comment -->
                <form v-if="String(replyingTo) === String(comment.id)" class="reply-form"
                  @submit.prevent="addReply(comment.id)">
                  <ion-textarea v-model="replyContent" placeholder="Write your reply..." :auto-grow="true"
                    :maxlength="2000" :disabled="submittingReply" required />

                  <ion-button class="reply-submit" type="submit" size="small"
                    :disabled="submittingReply || !replyContent.trim()">
                    {{ submittingReply ? 'Sending...' : 'Post reply' }}
                  </ion-button>
                </form>

                <!-- All replies are displayed at the same indentation level -->
                <div v-if="comment.replies && comment.replies.length" class="replies-list">
                  <div v-for="reply in comment.replies" :key="reply.id" class="reply-card">
                    <!-- Reply avatar -->
                    <div class="avatar reply-avatar">
                      {{ (reply.username || 'U').charAt(0).toUpperCase() }}
                    </div>

                    <div class="comment-body">

                      <!-- Reply information -->
                      <div class="comment-meta">
                        <strong>
                          @{{ reply.username || 'Unknown user' }}
                        </strong>

                        <span>{{ formatDate(reply.created_at) }}</span>
                      </div>

                      <!-- Show who the reply is directed to -->
                      <small v-if="reply.parent_username" class="reply-context">
                        Replying to @{{ reply.parent_username }}
                      </small>

                      <p class="comment-text">{{ reply.content }}</p>

                      <!-- Reply button for another reply -->
                      <button class="reply-button" type="button" @click="toggleReply(reply.id)">
                        {{ String(replyingTo) === String(reply.id) ? 'Cancel reply' : 'Reply' }}
                      </button>

                      <!-- Reply form for another reply -->
                      <form v-if="String(replyingTo) === String(reply.id)" class="reply-form"
                        @submit.prevent="addReply(reply.id)">
                        <ion-textarea v-model="replyContent" placeholder="Write your reply..." :auto-grow="true"
                          :maxlength="2000" :disabled="submittingReply" required />

                        <ion-button class="reply-submit" type="submit" size="small"
                          :disabled="submittingReply || !replyContent.trim()">
                          {{ submittingReply ? 'Sending...' : 'Post reply' }}
                        </ion-button>
                      </form>

                    </div>
                  </div>
                </div>

              </div>
            </article>
          </div>

          <div class="bottom-link">
            <ion-button
              fill="clear"
              class="back-to-feed"
              @click="goToFeed"
            >
              <ion-icon slot="start" :icon="arrowBackOutline" />
              Return to feed
            </ion-button>
          </div>
        </section>

        <footer class="page-footer">
          <span class="footer-brand">
            <ion-icon :icon="bookOutline" />
            BookNest.
          </span>
          <span>Made for the love of stories.</span>
        </footer>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">

/*
Purpose:
- Display comments and replies.
- Allow authenticated users to submit comments and replies.
- Automatically receive new comments and replies using Socket.IO.
- Keep all replies aligned under their original comment.
*/

import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { io, type Socket } from 'socket.io-client';

import {
  IonPage,
  IonContent,
  IonTextarea,
  IonButton,
  IonIcon,
  IonSpinner,
  onIonViewWillEnter,
} from '@ionic/vue';

import {
  bookOutline,
  newspaperOutline,
  compassOutline,
  libraryOutline,
  createOutline,
  arrowBackOutline,
  chatbubbleEllipsesOutline,
  chatbubblesOutline,
  paperPlaneOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
} from 'ionicons/icons';

import { apiRequest } from '../services/api';
import { getToken } from '../services/session';

// Change this if your backend uses another host or port.
const SOCKET_URL = 'http://localhost:3000';





type CommentItem = {
  id: number | string;
  content: string;
  username: string;
  user_id?: number | string;
  created_at: string;
  parent_comment_id: number | string | null;
  parent_username?: string | null;
  replies: CommentItem[];
};

type CommentCreatedEvent = {
  postId: number | string;
  comment: CommentItem;
  comment_count: number;
};

// Get the post ID from the URL.
const route = useRoute();
const router = useRouter();

const postId = String(route.params.id ?? '');

// Page state.
const comments = ref<CommentItem[]>([]);
const content = ref('');
const replyContent = ref('');
const replyingTo = ref<number | string | null>(null);

const errorMessage = ref('');
const successMessage = ref('');

const loading = ref(false);
const submitting = ref(false);
const submittingReply = ref(false);

// Socket connection.
let commentSocket: Socket | null = null;

// Count original comments and all replies.
const totalCommentCount = computed(() => {
  return comments.value.reduce(
    (total, comment) => total + 1 + comment.replies.length,
    0
  );
});





// Load comments from PostgreSQL and organize replies.
async function loadComments() {
  if (!postId) {
    errorMessage.value = 'The post ID is missing from the URL.';
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    const result = await apiRequest<{ comments: CommentItem[] }>(
      `/posts/${postId}/comments`
    );

    const allComments = result.comments ?? [];

    // Create comment objects with their own replies arrays.
    const commentItems: CommentItem[] = allComments.map(comment => ({
      ...comment,
      replies: [],
    }));

    // Create a map for finding comments by ID.
    const commentMap = new Map<string, CommentItem>();

    commentItems.forEach(comment => {
      commentMap.set(String(comment.id), comment);
    });

    const rootComments: CommentItem[] = [];

    // Organize original comments and replies.
    commentItems.forEach(comment => {
      if (comment.parent_comment_id === null) {
        rootComments.push(comment);
        return;
      }

      // Find the direct parent.
      const parent = commentMap.get(
        String(comment.parent_comment_id)
      );

      comment.parent_username = parent?.username ?? null;

      // Find the original comment, even for nested replies.
      let root = parent;
      const visited = new Set<string>();

      while (
        root &&
        root.parent_comment_id !== null &&
        !visited.has(String(root.id))
      ) {
        visited.add(String(root.id));

        root = commentMap.get(
          String(root.parent_comment_id)
        );
      }

      // Place every reply under its original comment.
      if (root && String(root.id) !== String(comment.id)) {
        root.replies.push(comment);
      } else if (!parent) {
        rootComments.push(comment);
      }
    });

    comments.value = rootComments;

  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'Could not load comments.';
  } finally {
    loading.value = false;
  }
}

// Receive new comments and replies from the backend.
function handleCommentCreated(data: CommentCreatedEvent) {
  // Only update the page if the event belongs to this post.
  if (String(data.postId) !== postId) {
    return;
  }

  console.log('New real-time comment received:', data.comment);

  // Reload the latest comments from PostgreSQL.
  // This also prevents duplicate comments from appearing.
  loadComments();
}

// Connect to the Socket.IO server.
function connectToComments() {
  if (!postId) return;

  commentSocket = io(SOCKET_URL);

  commentSocket.on('connect', () => {
    console.log('BookNest real-time connection established.');

    // Join the room for the current post.
    commentSocket?.emit('join-post', postId);

    console.log(`Joined comment room for post ${postId}`);
  });

  // Listen for new comments and replies.
  commentSocket.on('comment-created', (data) => {
  if (String(data.postId) !== postId) return;

  // Reload the comments automatically when a new comment or reply arrives.
  loadComments();
});

  commentSocket.on('connect_error', (error) => {
    console.error('Socket connection failed:', error.message);
  });

  commentSocket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });
}

// Disconnect when leaving the comments page.
function disconnectFromComments() {
  if (!commentSocket) return;

  commentSocket.emit('leave-post', postId);
  commentSocket.off('comment-created', handleCommentCreated);
  commentSocket.disconnect();

  commentSocket = null;
}

// Submit a new original comment.
async function addComment() {
  const token = getToken();
  const trimmedContent = content.value.trim();

  errorMessage.value = '';
  successMessage.value = '';

  if (!token) {
    errorMessage.value = 'Please sign in before posting a comment.';
    return;
  }

  if (!trimmedContent) {
    errorMessage.value = 'Please enter a comment first.';
    return;
  }

  if (trimmedContent.length > 2000) {
    errorMessage.value = 'Your comment must be 2000 characters or fewer.';
    return;
  }

  submitting.value = true;

  try {
    await apiRequest(`/posts/${postId}/comments`, {
      method: 'POST',
      token,
      body: { content: trimmedContent },
    });

    content.value = '';
    successMessage.value = 'Your comment has been posted.';

    // Update the current user's screen immediately.
    await loadComments();

  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'Could not add your comment.';
  } finally {
    submitting.value = false;
  }
}

// Open or close a reply form.
function toggleReply(commentId: number | string) {
  if (String(replyingTo.value) === String(commentId)) {
    replyingTo.value = null;
  } else {
    replyingTo.value = commentId;
  }

  replyContent.value = '';
  errorMessage.value = '';
  successMessage.value = '';
}

// Submit a reply to an existing comment or another reply.
async function addReply(parentCommentId: number | string) {
  const token = getToken();
  const trimmedContent = replyContent.value.trim();

  errorMessage.value = '';
  successMessage.value = '';

  if (!token) {
    errorMessage.value = 'Please sign in before replying.';
    return;
  }

  if (!trimmedContent) {
    errorMessage.value = 'Please enter a reply first.';
    return;
  }

  if (trimmedContent.length > 2000) {
    errorMessage.value = 'Your reply must be 2000 characters or fewer.';
    return;
  }

  submittingReply.value = true;

  try {
    await apiRequest(`/posts/${postId}/comments`, {
      method: 'POST',
      token,
      body: {
        content: trimmedContent,
        parent_comment_id: parentCommentId,
      },
    });

    replyContent.value = '';
    replyingTo.value = null;

    successMessage.value = 'Your reply has been posted.';

    await loadComments();

  } catch (error) {
    console.error('Reply submission failed:', error);

    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'Could not post your reply.';
  } finally {
    submittingReply.value = false;
  }
}

// Format comment timestamps.
function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return date.toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

// Return to the community feed.
function goToFeed() {
  router.push('/feed');
}

// Load comments and establish the real-time connection.
onMounted(() => {
  loadComments();
  connectToComments();
});

// Clean up the connection when leaving the page.
onBeforeUnmount(() => {
  disconnectFromComments();
});
</script>


<style scoped>
.comments-content {
  --background: #f8f4ec;
  --padding-top: 0;
  --padding-bottom: 0;
  --padding-start: 0;
  --padding-end: 0;
  color: #392738;
  font-family: Georgia, 'Times New Roman', serif;
}

.comments-shell {
  width: min(1000px, 100%);
  margin: 0 auto;
  padding: 0 32px;
}

/* Navigation */
.topbar {
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  border-bottom: 1px solid #e7ded2;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #4b2947;
  font-size: 22px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.brand-icon {
  width: 37px;
  height: 37px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background: #4b2947;
  color: #fff8ed;
  font-size: 21px;
}

.brand-dot {
  color: #b47a8f;
}

.navigation {
  display: flex;
  align-items: center;
  gap: 7px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px;
  border-radius: 9px;
  color: #796c78;
  font-family: Arial, sans-serif;
  font-size: 12px;
  text-decoration: none;
  white-space: nowrap;
}

.nav-link ion-icon {
  font-size: 16px;
}

.nav-link:hover,
.nav-link.active {
  background: #eee5ec;
  color: #512b4d;
}

/* Heading */
.page-heading {
  max-width: 700px;
  padding: 38px 0 27px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 30px;
  color: #76546f;
  font-family: Arial, sans-serif;
  font-size: 12px;
  text-decoration: none;
}

.back-link ion-icon {
  font-size: 16px;
}

.eyebrow {
  margin: 0 0 10px;
  color: #a07895;
  font-family: Arial, sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
}

.page-heading h1 {
  margin: 0;
  color: #392738;
  font-size: clamp(36px, 5vw, 49px);
  font-weight: 500;
  letter-spacing: -1.5px;
}

.page-heading h1 span {
  color: #8a607f;
  font-style: italic;
}

.heading-description {
  max-width: 600px;
  margin: 14px 0 0;
  color: #82747e;
  font-family: Arial, sans-serif;
  font-size: 13px;
  line-height: 1.9;
}

/* Comment composer */
.comment-composer {
  padding: 25px;
  border: 1px solid #e9dfd5;
  border-radius: 17px;
  background: #fffdf8;
}

.composer-heading {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-bottom: 21px;
}

.composer-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 13px;
  background: #eee2ed;
  color: #70466a;
  font-size: 22px;
}

.composer-heading h2 {
  margin: 0;
  color: #432e42;
  font-size: 20px;
  font-weight: 500;
}

.composer-heading p {
  margin: 6px 0 0;
  color: #92848e;
  font-family: Arial, sans-serif;
  font-size: 12px;
  line-height: 1.6;
}

.comment-input {
  --background: #fffaf4;
  --color: #493747;
  --border-color: #e5d9e2;
  --border-radius: 11px;
  --highlight-color-focused: #805777;
  --padding-start: 13px;
  --padding-end: 13px;
  --padding-top: 13px;
  --padding-bottom: 13px;
  font-family: Arial, sans-serif;
  font-size: 13px;
}

.composer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 15px;
}

.composer-footer > span {
  color: #a0939c;
  font-family: Arial, sans-serif;
  font-size: 11px;
}

.submit-button {
  --background: #4b2947;
  --background-hover: #60385a;
  --color: #fff8ef;
  --border-radius: 10px;
  font-family: Arial, sans-serif;
  font-size: 12px;
}

/* Messages */
.notice {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 15px;
  padding: 13px 15px;
  border-radius: 10px;
  font-family: Arial, sans-serif;
  font-size: 12px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.notice ion-icon {
  flex-shrink: 0;
  font-size: 18px;
}

.success-notice {
  background: #e8eee4;
  color: #4f6b49;
}

.error-notice {
  background: #f9e8e6;
  color: #9a3f43;
}

/* Comment list */
.comments-section {
  padding-top: 37px;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 18px;
}

.section-heading h2 {
  margin: 0;
  color: #392738;
  font-size: 27px;
  font-weight: 500;
}

.count-badge {
  padding: 8px 12px;
  border-radius: 20px;
  background: #eee3ec;
  color: #70476b;
  font-family: Arial, sans-serif;
  font-size: 11px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 21px;
  border: 1px solid #e9dfd5;
  border-radius: 15px;
  background: #fffdf8;
}

.avatar {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 50%;
  background: #eadce8;
  color: #573451;
  font-size: 16px;
  font-weight: 700;
}

.comment-body {
  min-width: 0;
  flex: 1;
}

.comment-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px 13px;
}

.comment-meta strong {
  color: #493346;
  font-family: Arial, sans-serif;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.comment-meta span {
  color: #a0929c;
  font-family: Arial, sans-serif;
  font-size: 10px;
}

.comment-text {
  margin: 11px 0 0;
  color: #6f626d;
  font-family: Arial, sans-serif;
  font-size: 13px;
  line-height: 1.85;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  padding: 25px;
  border: 1px dashed #d9c9d7;
  border-radius: 15px;
  color: #897887;
  text-align: center;
}

.empty-icon {
  width: 53px;
  height: 53px;
  display: grid;
  place-items: center;
  margin-bottom: 11px;
  border-radius: 16px;
  background: #eee2ed;
  color: #795473;
  font-size: 25px;
}

.empty-state h3 {
  margin: 7px 0;
  color: #493346;
  font-size: 19px;
  font-weight: 500;
}

.empty-state p {
  max-width: 360px;
  margin: 5px 0;
  color: #8b7d87;
  font-family: Arial, sans-serif;
  font-size: 12px;
  line-height: 1.8;
}

.empty-state ion-spinner {
  color: #70466a;
}

.bottom-link {
  display: flex;
  justify-content: center;
  margin: 24px 0;
}

.back-to-feed {
  --color: #70466a;
  font-family: Arial, sans-serif;
  font-size: 12px;
}

.page-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 25px;
  padding: 22px 0 28px;
  border-top: 1px solid #e7ded2;
  color: #9a8c96;
  font-family: Arial, sans-serif;
  font-size: 11px;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #563651;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 16px;
  font-weight: 700;
}

.footer-brand ion-icon {
  font-size: 19px;
}

/* Responsive layout */
@media (max-width: 800px) {
  .comments-shell {
    padding: 0 20px;
  }

  .topbar {
    flex-wrap: wrap;
    padding: 15px 0;
  }

  .navigation {
    width: 100%;
    flex-wrap: wrap;
    padding-bottom: 5px;
  }
}

@media (max-width: 520px) {
  .comments-shell {
    padding: 0 15px;
  }

  .page-heading {
    padding-top: 28px;
  }

  .page-heading h1 {
    font-size: 37px;
  }

  .comment-composer {
    padding: 17px;
  }

  .composer-heading {
    align-items: flex-start;
  }

  .composer-heading h2 {
    font-size: 18px;
  }

  .composer-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .submit-button {
    align-self: stretch;
  }

  .comment-card {
    padding: 15px;
    gap: 10px;
  }

  .avatar {
    width: 34px;
    height: 34px;
  }

  .page-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}

/* Reply button */
.reply-button {
  margin-top: 10px;
  padding: 0;
  border: none;
  background: transparent;
  color: #805777;
  font-family: Arial, sans-serif;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.reply-button:hover {
  color: #4b2947;
}

/* Reply form */
.reply-form {
  margin-top: 13px;
  padding: 13px;
  border: 1px solid #e9dfd5;
  border-radius: 11px;
  background: #faf6f0;
}

.reply-form ion-textarea {
  --background: #fffdf8;
  --color: #493747;
  --border-radius: 8px;
  --padding-start: 10px;
  --padding-end: 10px;
  font-family: Arial, sans-serif;
  font-size: 12px;
}

.reply-submit {
  --background: #4b2947;
  --color: #fff8ef;
  --border-radius: 8px;
  margin-top: 9px;
  font-size: 11px;
}

/* All replies share the same indentation */
.replies-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 15px;
  margin-left: 42px;
  padding-left: 0;
  border-left: none;
}

/* Every reply has the same horizontal alignment */
.reply-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  margin-left: 0;
  padding: 12px;
  border: 1px solid #eee3eb;
  border-radius: 11px;
  background: #f8f3f7;
  box-sizing: border-box;
}

.reply-avatar {
  width: 32px;
  height: 32px;
  font-size: 13px;
}

/* Shows which user the reply is directed to */
.reply-context {
  display: block;
  margin-top: 5px;
  color: #98768f;
  font-family: Arial, sans-serif;
  font-size: 10px;
}
</style>
