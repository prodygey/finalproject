
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
              {{ comments.length }}
              {{ comments.length === 1 ? 'comment' : 'comments' }}
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
            <article
              v-for="comment in comments"
              :key="comment.id"
              class="comment-card"
            >
              <div class="avatar">
                {{ (comment.username || 'U').charAt(0).toUpperCase() }}
              </div>

              <div class="comment-body">
                <div class="comment-meta">
                  <strong>
                    @{{ comment.username || 'Unknown user' }}
                  </strong>
                  <span>{{ formatDate(comment.created_at) }}</span>
                </div>

                <p class="comment-text">{{ comment.content }}</p>
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
// Purpose: Import Vue state, router tools, Ionic components, and icons.
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  IonPage,
  IonContent,
  IonTextarea,
  IonButton,
  IonIcon,
  IonSpinner,
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

// Purpose: Describe the comment data returned by the backend.
type CommentItem = {
  id: number | string;
  content: string;
  username: string;
  created_at: string;
};

// Purpose: Access the post ID from the current URL.
const route = useRoute();
const router = useRouter();

const postId = String(route.params.id ?? '');

// Purpose: Track comments, form content, loading, and feedback.
const comments = ref<CommentItem[]>([]);
const content = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const loading = ref(false);
const submitting = ref(false);

// Purpose: Load comments belonging to the selected post.
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

    comments.value = result.comments ?? [];
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'Could not load comments.';
  } finally {
    loading.value = false;
  }
}

// Purpose: Submit a comment using the logged-in user's token.
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

// Purpose: Format timestamps for readable display.
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

// Purpose: Return to the community feed.
function goToFeed() {
  router.push('/feed');
}

// Purpose: Load the existing comments when the page opens.
onMounted(loadComments);
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
</style>
