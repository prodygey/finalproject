
<!--
  Purpose:
  - Display the BookNest newsfeed.
  - Publish posts about books.
  - Show likes, comments, and linked books.
  - Link users to the book-reading page.
  - Preserve the existing Express API integration.
-->

<template>
  <ion-page>
    <ion-content :fullscreen="true" class="feed-content">
      <!-- Top navigation -->
      <header class="topbar">
        <router-link to="/feed" class="brand">
          <span class="brand-icon">
            <ion-icon :icon="bookOutline" />
          </span>
          <span>BookNest</span>
        </router-link>

        <nav class="topbar-links">
          <router-link to="/feed" class="nav-link active">
            <ion-icon :icon="newspaperOutline" />
            Community
          </router-link>

          <router-link to="/books" class="nav-link">
            <ion-icon :icon="libraryOutline" />
            Discover
          </router-link>

          
        <router-link to="/write" class="nav-link">
            <ion-icon :icon="createOutline"></ion-icon>
            <span>Write</span>
        </router-link>


          <router-link to="/library" class="nav-link">
            <ion-icon :icon="bookmarkOutline" />
            My Library
          </router-link>


          <router-link to="/profile" class="nav-link">
            <ion-icon :icon="personCircleOutline" />
            My Profile
          </router-link>
        </nav>

        <ion-button class="logout-button" fill="clear" @click="logout">
          <ion-icon :icon="logOutOutline" slot="start" />
          Logout
        </ion-button>
      </header>

      <main class="feed-layout">
        <!-- Left introduction panel -->
        <aside class="left-sidebar">
          <div class="sidebar-intro">
            <p class="eyebrow">YOUR READING COMMUNITY</p>
            <h1>Stories bring us together.</h1>
            <p>
              Discover what readers are enjoying, share your thoughts,
              and find your next favorite story.
            </p>
          </div>

          <div class="sidebar-card">
            <div class="sidebar-card-icon">
              <ion-icon :icon="sparklesOutline" />
            </div>
            <h3>Every reader has a story.</h3>
            <p>
              Share a favorite quote, recommend a book, or tell the community
              what you're reading today.
            </p>
          </div>

          <div class="sidebar-footer">
            <span>READ</span>
            <span>·</span>
            <span>WRITE</span>
            <span>·</span>
            <span>CONNECT</span>
          </div>
        </aside>

        <!-- Main feed column -->
        <section class="feed-column">
          <div class="page-heading">
            <div>
              <p class="eyebrow">THE BOOKNEST COMMUNITY</p>
              
            </div>

            <button
              class="refresh-button"
              type="button"
              @click="loadFeed"
              :disabled="loading"
              aria-label="Refresh feed"
            >
              <ion-icon :icon="refreshOutline" />
              <span>{{ loading ? 'Loading...' : 'Refresh' }}</span>
            </button>
          </div>

          <!-- Create post card -->
          <section class="composer-card">
            <div class="composer-heading">
              <div class="composer-avatar">
                <ion-icon :icon="personOutline" />
              </div>

              <div>
                <h3>What's on your bookshelf?</h3>
                <p>Share a thought with the community.</p>
              </div>
            </div>

            <form @submit.prevent="createPost">
              <ion-textarea
                v-model="postContent"
                class="post-input"
                placeholder="What are you reading or thinking about today?"
                :auto-grow="true"
                :maxlength="2000"
                :rows="4"
                required
              />

              <div class="composer-bottom">
               <div class="book-link-field">
                  <ion-icon :icon="bookOutline" />

                  <ion-input v-model="bookSearch" type="text" placeholder="Search a book title (optional)"
                    aria-label="Search published books" />
                </div>

                <!-- Display matching book suggestions. -->
                <div v-if="bookSearch.trim() && !selectedBook" class="book-suggestions">
                  <button v-for="book in filteredBooks" :key="book.id" type="button" class="book-suggestion"
                    @click="selectBook(book)">
                    {{ book.title }}
                  </button>

                  <p v-if="filteredBooks.length === 0" class="no-book-results">
                    No matching books found.
                  </p>
                </div>

                <!-- Display the selected book. -->
                <p v-if="selectedBook" class="selected-book">
                  <ion-icon :icon="bookOutline" />
                  Selected: {{ selectedBook.title }}
                  <button type="button" @click="clearBookSelection">
                    Remove
                  </button>
                </p>

                <ion-button
                  type="submit"
                  class="publish-button"
                  :disabled="posting"
                >
                  <ion-icon
                    :icon="sendOutline"
                    slot="start"
                  />
                  {{ posting ? 'Publishing...' : 'Publish' }}
                </ion-button>
              </div>
            </form>
          </section>

          <!-- Error or success feedback -->
          <div
            v-if="errorMessage"
            class="feedback-message"
            role="alert"
          >
            <ion-icon :icon="alertCircleOutline" />
            <span>{{ errorMessage }}</span>
            <button
              type="button"
              class="dismiss-button"
              aria-label="Dismiss message"
              @click="errorMessage = ''"
            >
              <ion-icon :icon="closeOutline" />
            </button>
          </div>

          <!-- Feed section heading -->
          <div class="feed-section-heading">
            <h3>Recent posts</h3>
            <span>{{ posts.length }} {{ posts.length === 1 ? 'post' : 'posts' }}</span>
          </div>

          <!-- Loading state -->
          <div v-if="loading && posts.length === 0" class="state-card">
            <ion-spinner name="crescent" />
            <p>Finding stories from the community...</p>
          </div>

          <!-- Empty state -->
          <div
            v-else-if="!loading && posts.length === 0"
            class="state-card empty-state"
          >
            <div class="empty-icon">
              <ion-icon :icon="chatbubblesOutline" />
            </div>
            <h3>The story starts with you.</h3>
            <p>
              There are no posts yet. Share your reading experience
              and start the conversation.
            </p>
          </div>

          <!-- Posts -->
          <article
            v-for="post in posts"
            :key="post.id"
            class="post-card"
          >
            <div class="post-header">
              <div class="post-avatar">
                {{ post.username.charAt(0).toUpperCase() }}
              </div>

              <div class="post-author">
                <strong>{{ post.username }}</strong>
                <span>@{{ post.username }}</span>
              </div>

              <time class="post-date">
                {{ formatDate(post.created_at) }}
              </time>
            </div>

            <div class="post-body">
              <p class="post-content">{{ post.content }}</p>

              <button
                v-if="post.book_id"
                class="linked-book"
                type="button"
                @click="openBook(post.book_id)"
              >
                <div class="linked-book-icon">
                  <ion-icon :icon="bookOutline" />
                </div>

                <div class="linked-book-info">
                  <span>BOOK RECOMMENDATION</span>
                  <strong>{{ post.book_title || 'View linked book' }}</strong>
                  <small>Open book details</small>
                </div>

                <ion-icon
                  class="linked-book-arrow"
                  :icon="arrowForwardOutline"
                />
              </button>
            </div>

            <div class="post-stats">
              <span>
                <ion-icon :icon="heartOutline" />
                {{ post.like_count }} likes
              </span>
              <span>
                <ion-icon :icon="chatbubbleOutline" />
                {{ post.comment_count }} comments
              </span>
            </div>

            <div class="post-actions">
              <button class="post-action" :class="{ 'liked': post.is_liked }" type="button" @click="toggleLike(post)">
                <ion-icon :icon="heartOutline" />
                {{ post.is_liked ? 'Unlike' : 'Like' }}
              </button>

              <button
                class="post-action"
                type="button"
                @click="openComments(post.id)"
              >
                <ion-icon :icon="chatbubbleOutline" />
                Comment
              </button>

              <button
                class="post-action"
                type="button"
                @click="sharePost(post.id)"
              >
                <ion-icon :icon="shareSocialOutline" />
                Share
              </button>
            </div>
          </article>
        </section>

        <!-- Right reading inspiration panel -->
        <aside class="right-sidebar">
          <section class="quote-card">
            <div class="quote-mark">“</div>
            <p class="quote-text">
              A reader lives a thousand lives before he dies.
            </p>
            <span class="quote-author">— George R. R. Martin</span>
            <div class="quote-decoration">
              <ion-icon :icon="bookOutline" />
            </div>
          </section>

          <section class="community-card">
            <p class="eyebrow">A FRIENDLY REMINDER</p>
            <h3>Make room for every story.</h3>
            <p>
              Be kind, celebrate other writers, and help make BookNest
              a welcoming place for everyone.
            </p>
          </section>
        </aside>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonInput,
  IonTextarea,
  IonSpinner,
  onIonViewWillEnter,
} from '@ionic/vue';

import {
  bookOutline,
  newspaperOutline,
  libraryOutline,
  createOutline,
  bookmarkOutline,
  logOutOutline,
  sparklesOutline,
  refreshOutline,
  personOutline,
  sendOutline,
  alertCircleOutline,
  closeOutline,
  chatbubblesOutline,
  heartOutline,
  chatbubbleOutline,
  shareSocialOutline,
  arrowForwardOutline,
  personCircleOutline,
} from 'ionicons/icons';

import { apiRequest } from '../services/api';
import { clearSession, getToken } from '../services/session';

// Fields returned by the newsfeed endpoint.
type FeedPost = {
  id: number;
  content: string;
  username: string;
  book_id: number | null;
  book_title: string | null;
  like_count: number | string;
  comment_count: number | string;
  created_at: string;
  is_liked: boolean;
};

// Book information used in the book selection suggestions.
type BookOption = {
  id: number;
  title: string;
};

// Feed data, form values, and status messages.
const posts = ref<FeedPost[]>([]);
const postContent = ref('');

// Book selection data.
const books = ref<BookOption[]>([]);
const bookSearch = ref('');
const selectedBook = ref<BookOption | null>(null);


  // Show books whose titles contain the search text.
const filteredBooks = computed(() => {
  const search = bookSearch.value.trim().toLowerCase();

  if (!search) {
    return [];
  }

  return books.value
    .filter(book => book.title.toLowerCase().includes(search))
    .slice(0, 8);
});


// Select a book from the search suggestions.
function selectBook(book: BookOption) {
  selectedBook.value = book;
  bookSearch.value = book.title;

  // Keep the actual book ID for the existing API.
  bookId.value = String(book.id);
}


// Remove the selected book from the post.
function clearBookSelection() {
  selectedBook.value = null;
  bookSearch.value = '';
  bookId.value = '';
}


// Keep the actual book ID for the existing API.
const bookId = ref('');

const posting = ref(false);
const loading = ref(false);
const errorMessage = ref('');

const router = useRouter();
const route = useRoute();

// Retrieve the current user's login token.
function requireToken(): string {
  const token = getToken();

  if (!token) {
    throw new Error('Please sign in first.');
  }

  return token;
}

// Load the latest posts from the Express backend.
async function loadFeed() {
  loading.value = true;
  errorMessage.value = '';

  try {
    const result = await apiRequest<{ posts: FeedPost[] }>('/posts');
    posts.value = result.posts;
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Could not load feed.';
  } finally {
    loading.value = false;
  }
}


// Load published books for the book-title search.
async function loadBooks() {
  try {
    const result = await apiRequest<{ books: BookOption[] }>('/books');
    books.value = result.books;
  } catch (error) {
    console.error('Could not load published books:', error);
  }
}



// Publish a post and reload the feed.
async function createPost() {
  if (!postContent.value.trim()) {
    errorMessage.value = 'Write something before publishing.';
    return;
  }

  const parsedBookId = bookId.value.trim()
    ? Number(bookId.value)
    : null;

  if (
    parsedBookId !== null &&
    (!Number.isInteger(parsedBookId) || parsedBookId < 1)
  ) {
    errorMessage.value = 'Enter a valid positive book ID.';
    return;
  }

  posting.value = true;
  errorMessage.value = '';

  try {
    await apiRequest('/posts', {
      method: 'POST',
      token: requireToken(),
      body: {
        content: postContent.value.trim(),
        book_id: parsedBookId,
      },
    });

    postContent.value = '';
    bookId.value = '';
    bookSearch.value = '';
    selectedBook.value = null;

    await loadFeed();
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Could not publish post.';
  } finally {
    posting.value = false;
  }
}

// Like a post and reload the updated engagement counts.
// Like or unlike a post depending on its current state.
async function toggleLike(post: FeedPost) {
  errorMessage.value = '';

  try {
    const token = requireToken();

    // If already liked, send DELETE. Otherwise, send POST.
    const method = post.is_liked ? 'DELETE' : 'POST';

    await apiRequest(`/posts/${post.id}/like`, {
      method,
      token,
    });

    // Update the displayed state immediately.
    post.is_liked = !post.is_liked;

    // Update the like count without reloading the entire feed.
    const currentCount = Number(post.like_count) || 0;

    post.like_count = Math.max(
      0,
      currentCount + (post.is_liked ? 1 : -1)
    );

  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'Could not update your reaction.';
  }
}

// Navigate to the selected post's comments page.
async function openComments(id: number) {
  await router.push(`/posts/${id}/comments`);
}

// Navigate to the selected book's reading page.
async function openBook(id: number) {
  await router.push(`/books/${id}`);
}

// Share a link to a post.
async function sharePost(id: number) {
  const url = `${window.location.origin}/posts/${id}/comments`;

  try {
    if (navigator.share) {
      await navigator.share({
        title: 'BookNest post',
        url,
      });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      errorMessage.value = 'Post link copied.';
    } else {
      errorMessage.value = `Copy this post link: ${url}`;
    }
  } catch {
    errorMessage.value = 'Sharing was cancelled or unavailable.';
  }
}

// Display the date and time of a post.
function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

// Clear the current session and return to login.
async function logout() {
  clearSession();
  await router.push('/login');
}

// Receive a selected quote from the book-reading page.
function receiveSharedQuote() {
  const getQueryValue = (value: unknown): string => {
    return typeof value === 'string' ? value : '';
  };

  const quote = getQueryValue(route.query.quote);
  const incomingBookId = getQueryValue(route.query.bookId);
  const bookTitle = getQueryValue(route.query.bookTitle);
  const chapterTitle = getQueryValue(route.query.chapterTitle);
  const chapterNumber = getQueryValue(route.query.chapterNumber);

  // Nothing to transfer if the reader did not share a quote.
  if (!quote.trim() || !incomingBookId) return;

  const parsedId = Number(incomingBookId);

  if (!Number.isInteger(parsedId) || parsedId < 1) return;

  // Automatically insert the quote and its original attribution.
  postContent.value =
    `“${quote}”\n\n` +
    `— ${bookTitle || 'Unknown Book'}, ` +
    `Chapter ${chapterNumber || '?'}: ${chapterTitle || 'Untitled'}\n\n`;

  // Attach the original book to the post.
  bookId.value = String(parsedId);

  // Match the book against the published books already loaded.
  const matchingBook = books.value.find(
    book => book.id === parsedId
  );

  if (matchingBook) {
    selectedBook.value = matchingBook;
    bookSearch.value = matchingBook.title;
  }

  // Remove the quote parameters from the URL after receiving them.
  router.replace({ path: '/feed' });
}







// Runs every time the Feed page becomes visible,
// including when returning from the Read Book page.
onIonViewWillEnter(async () => {
  loadFeed();

  // Load books before matching the shared book.
  await loadBooks();

  // Immediately insert the shared quote into the composer.
  receiveSharedQuote();
});
</script>

<style scoped>
.feed-content {
  --background: #f8f3eb;
  --padding-bottom: 40px;
}

/* Top navigation */
.topbar {
  position: sticky;
  z-index: 10;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
  min-height: 76px;
  padding: 12px clamp(20px, 4vw, 64px);
  border-bottom: 1px solid #e9dfe5;
  background: rgb(255 253 249 / 96%);
  backdrop-filter: blur(12px);
}

.brand {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 10px;
  color: #542d46;
  font-size: 23px;
  font-weight: 700;
  letter-spacing: -0.8px;
  text-decoration: none;
}

.brand-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 13px;
  background: #eee3eb;
  color: #542d46;
  font-size: 23px;
}

.topbar-links {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 13px;
  border-radius: 9px;
  color: #786f77;
  font-size: 13px;
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease;
}

.nav-link ion-icon {
  font-size: 17px;
}

.nav-link:hover,
.nav-link.active {
  background: #eee3eb;
  color: #542d46;
}

.logout-button {
  --color: #65445b;
  --border-radius: 9px;
  margin: 0;
  font-size: 13px;
  text-transform: none;
}

/* Main three-column layout */
.feed-layout {
  display: grid;
  grid-template-columns: minmax(180px, 0.78fr) minmax(360px, 1.65fr) minmax(180px, 0.78fr);
  gap: clamp(20px, 2.5vw, 38px);
  width: 100%;
  max-width: 1480px;
  margin: 0 auto;
  padding: 38px clamp(20px, 4vw, 64px);
}

.left-sidebar,
.right-sidebar {
  min-width: 0;
}

.left-sidebar {
  display: flex;
  flex-direction: column;
  align-self: stretch;
}

.eyebrow {
  margin: 0 0 13px;
  color: #98718c;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.7px;
}

.sidebar-intro h1 {
  margin: 0;
  color: #382a36;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(26px, 2.3vw, 34px);
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.7px;
}

.sidebar-intro > p:last-child {
  margin: 15px 0 0;
  color: #786f77;
  font-size: 13px;
  line-height: 1.8;
}

.sidebar-card {
  margin-top: 30px;
  padding: 22px 19px;
  border: 1px solid #eadfe6;
  border-radius: 15px;
  background: #fffdf9;
}

.sidebar-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #f1e5ed;
  color: #754761;
  font-size: 21px;
}

.sidebar-card h3,
.community-card h3 {
  margin: 17px 0 9px;
  color: #3d303b;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 19px;
  font-weight: 500;
  line-height: 1.35;
}

.sidebar-card p,
.community-card p:last-child {
  margin: 0;
  color: #817680;
  font-size: 12px;
  line-height: 1.8;
}

.sidebar-footer {
  display: flex;
  gap: 8px;
  margin-top: auto;
  padding-top: 35px;
  color: #9b8b97;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1px;
}

/* Feed heading */
.feed-column {
  min-width: 0;
}

.page-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 23px;
}

.page-heading .eyebrow {
  margin-bottom: 8px;
}

.page-heading h2 {
  margin: 0;
  color: #302731;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(27px, 2.6vw, 35px);
  font-weight: 500;
  letter-spacing: -0.8px;
}

.heading-description {
  margin: 9px 0 0;
  color: #827782;
  font-size: 12px;
  line-height: 1.6;
}

.refresh-button {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 7px;
  padding: 10px 12px;
  border: 1px solid #e5d8e1;
  border-radius: 9px;
  background: #fffdf9;
  color: #65445b;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.refresh-button:disabled {
  cursor: wait;
  opacity: 0.6;
}

.refresh-button ion-icon {
  font-size: 16px;
}

/* Post composer */
.composer-card {
  padding: 22px;
  border: 1px solid #e9dfe5;
  border-radius: 16px;
  background: #fffdf9;
  box-shadow: 0 5px 20px rgb(66 39 57 / 3%);
}

.composer-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.composer-avatar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 43px;
  height: 43px;
  border-radius: 14px;
  background: #eee3eb;
  color: #754761;
  font-size: 21px;
}

.composer-heading h3 {
  margin: 0;
  color: #3c303b;
  font-size: 14px;
  font-weight: 700;
}

.composer-heading p {
  margin: 5px 0 0;
  color: #948793;
  font-size: 11px;
}

.post-input {
  --background: #fbf8f4;
  --color: #382e38;
  --placeholder-color: #a59aa2;
  --padding-start: 14px;
  --padding-end: 14px;
  --padding-top: 13px;
  --padding-bottom: 13px;
  min-height: 100px;
  border: 1px solid #eee5eb;
  border-radius: 11px;
  font-size: 13px;
  line-height: 1.7;
}

.composer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
}

.book-link-field {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 8px;
  min-width: 0;
  color: #8d6b82;
}

.book-link-field > ion-icon {
  flex-shrink: 0;
  font-size: 18px;
}

.book-link-field ion-input {
  --color: #554653;
  --placeholder-color: #a59aa2;
  --padding-start: 0;
  font-size: 11px;
}

.publish-button {
  --background: #542d46;
  --background-hover: #68405a;
  --background-activated: #432239;
  --color: #fffaf6;
  --border-radius: 9px;
  --box-shadow: none;
  flex-shrink: 0;
  height: 40px;
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  text-transform: none;
}

/* Feedback and feed list */
.feedback-message {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 10px;
  background: #f7e5e7;
  color: #923d4b;
  font-size: 12px;
  line-height: 1.6;
}

.feedback-message > ion-icon {
  flex-shrink: 0;
  margin-top: 1px;
  font-size: 17px;
}

.feedback-message span {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}

.dismiss-button {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 17px;
  cursor: pointer;
}

.feed-section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 29px 0 14px;
}

.feed-section-heading h3 {
  margin: 0;
  color: #3b303a;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 21px;
  font-weight: 500;
}

.feed-section-heading > span {
  color: #948793;
  font-size: 11px;
}

.post-card {
  margin-bottom: 16px;
  padding: 21px 22px 0;
  overflow: hidden;
  border: 1px solid #e9dfe5;
  border-radius: 15px;
  background: #fffdf9;
  box-shadow: 0 4px 16px rgb(66 39 57 / 2%);
}

.post-header {
  display: flex;
  align-items: center;
  gap: 11px;
}

.post-avatar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: 1px solid #e5d3e0;
  border-radius: 50%;
  background: #f0e4ec;
  color: #68405a;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 18px;
  font-weight: 700;
}

.post-author {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.post-author strong {
  overflow: hidden;
  color: #3d303b;
  font-size: 13px;
  text-overflow: ellipsis;
}

.post-author span {
  overflow: hidden;
  color: #9a8e98;
  font-size: 11px;
  text-overflow: ellipsis;
}

.post-date {
  max-width: 45%;
  color: #9a8e98;
  font-size: 10px;
  text-align: right;
}

.post-body {
  padding: 15px 0 18px;
}

.post-content {
  margin: 0;
  overflow-wrap: anywhere;
  color: #514651;
  font-size: 13px;
  line-height: 1.9;
  white-space: pre-wrap;
}

.linked-book {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin-top: 17px;
  padding: 13px;
  border: 1px solid #e9dce5;
  border-radius: 11px;
  background: #f8f1f6;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;
}

.linked-book:hover {
  background: #f0e4ec;
}

.linked-book-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 43px;
  height: 49px;
  border-radius: 5px 9px 9px 5px;
  background: #754761;
  color: #fffaf6;
  font-size: 23px;
  box-shadow: 3px 3px 0 #d7c0d0;
}

.linked-book-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.linked-book-info span {
  color: #9b7690;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 1.2px;
}

.linked-book-info strong {
  overflow: hidden;
  color: #463342;
  font-size: 12px;
  text-overflow: ellipsis;
}

.linked-book-info small {
  color: #8c7d89;
  font-size: 10px;
}

.linked-book-arrow {
  flex-shrink: 0;
  color: #754761;
  font-size: 17px;
}

.post-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  padding: 12px 0;
  border-bottom: 1px solid #f0e8ed;
  color: #948793;
  font-size: 10px;
}

.post-stats span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.post-stats ion-icon {
  color: #a77d98;
  font-size: 14px;
}

.post-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 7px 0;
}

.post-action {
  display: inline-flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-width: 0;
  padding: 10px 5px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: #776572;
  font: inherit;
  font-size: 11px;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.post-action:hover {
  background: #f3e9f0;
  color: #542d46;
}

.post-action ion-icon {
  font-size: 17px;
}

/* Loading and empty states */
.state-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 190px;
  padding: 28px;
  border: 1px dashed #e2d4de;
  border-radius: 15px;
  background: rgb(255 253 249 / 65%);
  color: #897b87;
  text-align: center;
}

.state-card ion-spinner {
  color: #754761;
}

.state-card p {
  max-width: 300px;
  margin: 12px 0 0;
  font-size: 12px;
  line-height: 1.7;
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  border-radius: 18px;
  background: #eee3eb;
  color: #754761;
  font-size: 26px;
}

.empty-state h3 {
  margin: 15px 0 0;
  color: #4a3947;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 21px;
  font-weight: 500;
}

/* Right sidebar */
.quote-card {
  position: relative;
  padding: 23px 20px;
  overflow: hidden;
  border-radius: 15px;
  background: #542d46;
  color: #fffaf6;
}

.quote-mark {
  height: 35px;
  color: #d8b7c9;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 58px;
  line-height: 1;
}

.quote-text {
  position: relative;
  z-index: 1;
  margin: 15px 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 20px;
  line-height: 1.45;
}

.quote-author {
  color: #dfcbd8;
  font-size: 10px;
}

.quote-decoration {
  position: absolute;
  right: 10px;
  bottom: -15px;
  color: rgb(255 255 255 / 8%);
  font-size: 100px;
  transform: rotate(-15deg);
}

.community-card {
  margin-top: 19px;
  padding: 21px 19px;
  border: 1px solid #e9dfe5;
  border-radius: 15px;
  background: #fffdf9;
}

.community-card .eyebrow {
  margin-bottom: 10px;
  font-size: 9px;
  line-height: 1.6;
}

.community-card h3 {
  margin-top: 0;
  font-size: 20px;
}

/* Responsive layouts */
@media (max-width: 1100px) {
  .feed-layout {
    grid-template-columns: minmax(0, 1fr) minmax(340px, 1.8fr);
  }

  .left-sidebar {
    display: none;
  }

  .right-sidebar {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .community-card {
    margin-top: 0;
  }
}

@media (max-width: 700px) {
  .topbar {
    flex-wrap: wrap;
    gap: 10px;
    padding: 12px 17px;
  }

  .brand {
    font-size: 21px;
  }

  .topbar-links {
    order: 3;
    width: 100%;
    justify-content: space-between;
    gap: 3px;
    padding-top: 8px;
    border-top: 1px solid #eee5eb;
  }

  .nav-link {
    gap: 5px;
    padding: 8px;
    font-size: 11px;
  }

  .nav-link ion-icon {
    font-size: 15px;
  }

  .logout-button {
    font-size: 12px;
  }

  .feed-layout {
    display: block;
    padding: 25px 15px 35px;
  }

  .page-heading {
    align-items: center;
  }

  .page-heading h2 {
    font-size: 29px;
  }

  .heading-description {
    max-width: 260px;
  }

  .refresh-button {
    gap: 5px;
    padding: 9px;
    font-size: 11px;
  }

  .composer-card {
    padding: 17px;
  }

  .composer-bottom {
    align-items: stretch;
    flex-direction: column;
  }

  .book-link-field {
    min-height: 36px;
  }

  .publish-button {
    width: 100%;
  }

  .post-card {
    padding: 17px 16px 0;
  }

  .post-date {
    font-size: 9px;
  }

  .post-actions {
    gap: 1px;
  }

  .post-action {
    gap: 5px;
    font-size: 10px;
  }

  .right-sidebar {
    display: grid;
    grid-template-columns: 1fr;
    gap: 14px;
    margin-top: 28px;
  }

  .community-card {
    margin-top: 0;
  }
}

@media (max-width: 380px) {
  .nav-link {
    font-size: 10px;
  }

  .page-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .post-date {
    max-width: 40%;
  }

  .post-stats {
    gap: 10px;
  }
}





/* Book title search suggestions */
.book-suggestions {
  display: flex;
  flex-direction: column;
  margin-top: 6px;
  margin-bottom: 12px;
  background: #ffffff;
  border: 1px solid #e5dce8;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(40, 20, 45, 0.08);
}

.book-suggestion {
  width: 100%;
  padding: 12px 14px;
  border: none;
  border-bottom: 1px solid #f0eaf2;
  background: transparent;
  color: #38243f;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
}

.book-suggestion:last-of-type {
  border-bottom: none;
}

.book-suggestion:hover {
  background: #f7f1f8;
}

.no-book-results {
  margin: 0;
  padding: 12px 14px;
  color: #8b7c91;
  font-size: 13px;
}

.selected-book {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0 12px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f4edf6;
  color: #55365f;
  font-size: 13px;
}

.selected-book button {
  margin-left: auto;
  border: none;
  background: transparent;
  color: #8a456f;
  font-weight: 600;
  cursor: pointer;
}

.post-action.liked {
  color: #a64269;
  font-weight: 700;
}

.post-action.liked ion-icon {
  color: #a64269;
}
</style>
