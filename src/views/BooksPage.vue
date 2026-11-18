
<!--
  Purpose:
  - Browse published BookNest books.
  - Search titles, authors, and genres.
  - Display book information in a responsive layout.
  - Navigate to a book's reading page.
  - Save books to the user's library.
-->

<template>
  <ion-page>
    <ion-content :fullscreen="true" class="discover-content">
      <!-- Top navigation -->
      <header class="topbar">
        <router-link to="/feed" class="brand">
          <span class="brand-icon">
            <ion-icon :icon="bookOutline" />
          </span>
          <span>BookNest</span>
        </router-link>

        <nav class="topbar-links">
          <router-link to="/feed" class="nav-link">
            <ion-icon :icon="newspaperOutline" />
            Feed
          </router-link>

          <router-link to="/books" class="nav-link active">
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
        </nav>

        <router-link to="/login" class="account-link">
          <ion-icon :icon="logOutOutline" />
          Logout
        </router-link>
      </header>

      <main class="discover-layout">
        <!-- Welcome banner -->
        <section class="discover-hero">
          <div class="hero-copy">
            <p class="eyebrow">A WORLD OF STORIES AWAITS</p>
            <h1>Find your next <em>favorite story.</em></h1>
            <p class="hero-description">
              Explore stories from BookNest writers, discover new worlds,
              and save the books you want to read next.
            </p>

            <div class="hero-details">
              <span>
                <ion-icon :icon="bookOutline" />
                Discover stories
              </span>
              <span>
                <ion-icon :icon="bookmarkOutline" />
                Build your library
              </span>
            </div>
          </div>

          <div class="hero-art" aria-hidden="true">
            <div class="hero-orbit orbit-one"></div>
            <div class="hero-orbit orbit-two"></div>

            <div class="hero-book hero-book-back">
              <span>BOOKNEST EDITIONS</span>
              <strong>Hidden<br />Worlds</strong>
              <ion-icon :icon="sparklesOutline" />
            </div>

            <div class="hero-book hero-book-front">
              <ion-icon :icon="flowerOutline" />
              <span>A STORY FOR YOU</span>
              <strong>Beyond<br />the Pages</strong>
              <small>OPEN A NEW CHAPTER</small>
            </div>
          </div>
        </section>

        <!-- Search and collection heading -->
        <section class="collection-section">
          <div class="collection-heading">
            <div>
              <p class="eyebrow">THE BOOKSHELF</p>
              <h2>Discover books</h2>
              <p class="collection-description">
                Find a story that speaks to you.
              </p>
            </div>

            <div class="book-count">
              <span class="count-number">{{ filteredBooks.length }}</span>
              <span>
                {{ filteredBooks.length === 1 ? 'book found' : 'books found' }}
              </span>
            </div>
          </div>

          <div class="search-wrapper">
            <ion-icon :icon="searchOutline" />
            <ion-searchbar
              v-model="searchText"
              class="book-search"
              placeholder="Search by title, author, or genre..."
              :debounce="150"
              :show-clear-button="'focus'"
              aria-label="Search books by title, author, or genre"
            />
          </div>

          <!-- API error -->
          <div v-if="errorMessage" class="feedback-message" role="alert">
            <ion-icon :icon="alertCircleOutline" />
            <span>{{ errorMessage }}</span>
            <button
              type="button"
              class="retry-button"
              @click="loadBooks"
              :disabled="loading"
            >
              Try again
            </button>
          </div>

          <!-- Loading state -->
          <div v-if="loading" class="state-card">
            <ion-spinner name="crescent" />
            <p>Gathering stories for your bookshelf...</p>
          </div>

          <!-- No published books -->
          <div
            v-else-if="!errorMessage && books.length === 0"
            class="state-card"
          >
            <div class="state-icon">
              <ion-icon :icon="libraryOutline" />
            </div>
            <h3>The bookshelf is waiting.</h3>
            <p>
              There are no published books to display yet.
              Check back soon for new stories.
            </p>
          </div>

          <!-- No search results -->
          <div
            v-else-if="filteredBooks.length === 0"
            class="state-card"
          >
            <div class="state-icon">
              <ion-icon :icon="searchOutline" />
            </div>
            <h3>No matching stories found.</h3>
            <p>
              Try another title, author, or genre to find what you're looking for.
            </p>
            <ion-button
              fill="outline"
              class="clear-search-button"
              @click="searchText = ''"
            >
              Clear search
            </ion-button>
          </div>

          <!-- Book grid -->
          <div v-else class="book-grid">
            <article
              v-for="(book, index) in filteredBooks"
              :key="book.id"
              class="book-card"
            >
              <div
                class="book-cover"
                :class="`cover-${index % 5 + 1}`"
              >
                <div class="cover-topline">
                  <span>BOOKNEST</span>
                  <ion-icon :icon="sparklesOutline" />
                </div>

                <div class="cover-center">
                  <ion-icon
                    :icon="coverIcons[index % coverIcons.length]"
                  />
                  <span class="cover-rule"></span>
                  <h3>{{ book.title }}</h3>
                  <p>{{ book.author }}</p>
                </div>

                <div class="cover-bottom">
                  <span>{{ book.genre || 'FICTION & MORE' }}</span>
                </div>
              </div>

              <div class="book-info">
                <div class="book-meta">
                  <span class="genre-tag">
                    {{ book.genre || 'Uncategorized' }}
                  </span>
                </div>

                <h3 class="book-title">{{ book.title }}</h3>
                <p class="book-author">by {{ book.author }}</p>

                <p class="book-description">
                  {{ book.description || 'Discover this story on BookNest.' }}
                </p>

                <div class="book-actions">
                  <ion-button
                    class="read-button"
                    @click="readBook(book.id)"
                  >
                    Read book
                    <ion-icon :icon="arrowForwardOutline" slot="end" />
                  </ion-button>

                  <button
                    type="button"
                    class="save-button"
                    :disabled="savingBookIds.includes(book.id)"
                    :aria-label="`Save ${book.title} to your library`"
                    title="Save to library"
                    @click="saveBook(book.id)"
                  >
                    <ion-spinner
                      v-if="savingBookIds.includes(book.id)"
                      name="crescent"
                    />
                    <ion-icon
                      v-else
                      :icon="bookmarkOutline"
                    />
                  </button>
                </div>
              </div>
            </article>
          </div>
        </section>

        <footer class="discover-footer">
          <ion-icon :icon="bookOutline" />
          <span>Every book is a new beginning.</span>
        </footer>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  IonPage,
  IonContent,
  IonSearchbar,
  IonButton,
  IonIcon,
  IonSpinner,
  onIonViewWillEnter,
} from '@ionic/vue';

import {
  bookOutline,
  newspaperOutline,
  libraryOutline,
  createOutline,
  bookmarkOutline,
  personCircleOutline,
  sparklesOutline,
  flowerOutline,
  searchOutline,
  alertCircleOutline,
  arrowForwardOutline,
  leafOutline,
  moonOutline,
  heartOutline,
  starOutline,
  volumeMute,
  volumeHigh,
  volumeOffOutline,
  volumeHighOutline,
  volumeMuteOutline,
  logOutOutline,
} from 'ionicons/icons';

import { apiRequest } from '../services/api';
import { getToken } from '../services/session';

// Published book data returned by the backend.
type Book = {
  id: number;
  title: string;
  description: string;
  genre: string | null;
  author: string;
};

// Book data, search input, and request status.
const books = ref<Book[]>([]);
const searchText = ref('');
const errorMessage = ref('');
const loading = ref(false);
const savingBookIds = ref<number[]>([]);

const router = useRouter();

// Decorative icons for the generated book-cover designs.
const coverIcons = [
  flowerOutline,
  moonOutline,
  leafOutline,
  heartOutline,
  starOutline,
];

// Filter books by title, author, or genre.
const filteredBooks = computed(() => {
  const query = searchText.value.toLowerCase().trim();

  if (!query) {
    return books.value;
  }

  return books.value.filter((book) =>
    `${book.title} ${book.author} ${book.genre || ''} ${book.description || ''}`
      .toLowerCase()
      .includes(query),
  );
});

// Load published books from the Express API.
async function loadBooks() {
  loading.value = true;
  errorMessage.value = '';

  try {
    const result = await apiRequest<{ books: Book[] }>('/books');
    books.value = result.books;
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Could not load books.';
  } finally {
    loading.value = false;
  }
}

// Purpose: Refresh Discover whenever the user returns to this page.
onIonViewWillEnter(() => {
  loadBooks();
});

// Navigate to the selected book's details and reading page.
async function readBook(id: number) {
  await router.push(`/books/${id}`);
}

// Save a book to the logged-in user's library.
async function saveBook(id: number) {
  const token = getToken();

  if (!token) {
    errorMessage.value = 'Please sign in to save books to your library.';
    return;
  }

  if (savingBookIds.value.includes(id)) {
    return;
  }

  savingBookIds.value.push(id);
  errorMessage.value = '';

  try {
    await apiRequest(`/library/${id}`, {
      method: 'POST',
      token,
    });

    errorMessage.value = 'Book saved to your library.';
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Could not save book.';
  } finally {
    savingBookIds.value = savingBookIds.value.filter(
      (bookId) => bookId !== id,
    );
  }
}

// Fetch books when the page opens.
onMounted(loadBooks);
</script>

<style scoped>
.discover-content {
  --background: #f8f3eb;
  --padding-bottom: 35px;
}

/* Navigation */
.topbar {
  position: sticky;
  z-index: 10;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
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
  display: flex;
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
}

.nav-link ion-icon {
  font-size: 17px;
}

.nav-link:hover,
.nav-link.active {
  background: #eee3eb;
  color: #542d46;
}

.account-link {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 7px;
  color: #65445b;
  font-size: 13px;
  text-decoration: none;
}

.account-link ion-icon {
  font-size: 20px;
}

/* Main page */
.discover-layout {
  width: 100%;
  max-width: 1420px;
  margin: 0 auto;
  padding: 34px clamp(20px, 4vw, 64px);
}

/* Hero banner */
.discover-hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  min-height: 285px;
  padding: 37px clamp(25px, 4vw, 55px);
  overflow: hidden;
  border-radius: 20px;
  background:
    radial-gradient(circle at 82% 12%, #79536e 0, transparent 32%),
    #542d46;
  color: #fffaf6;
}

.hero-copy {
  position: relative;
  z-index: 2;
  max-width: 550px;
}

.eyebrow {
  margin: 0 0 12px;
  color: #a77f98;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.7px;
}

.hero-copy .eyebrow {
  color: #e1bfd2;
}

.hero-copy h1 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(34px, 4vw, 51px);
  font-weight: 500;
  line-height: 1.13;
  letter-spacing: -1.4px;
}

.hero-copy h1 em {
  display: block;
  color: #e5c5d6;
  font-weight: 400;
}

.hero-description {
  max-width: 440px;
  margin: 16px 0 0;
  color: #e4d8df;
  font-size: 13px;
  line-height: 1.8;
}

.hero-details {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 21px;
}

.hero-details span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #f1e5ed;
  font-size: 11px;
}

.hero-details ion-icon {
  color: #e1bfd2;
  font-size: 16px;
}

/* Decorative CSS book illustrations */
.hero-art {
  position: relative;
  flex-shrink: 0;
  width: 290px;
  height: 225px;
}

.hero-orbit {
  position: absolute;
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 50%;
}

.orbit-one {
  top: 3px;
  right: -5px;
  width: 215px;
  height: 215px;
}

.orbit-two {
  top: 25px;
  right: 17px;
  width: 170px;
  height: 170px;
}

.hero-book {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 132px;
  height: 184px;
  padding: 15px 13px;
  border: 1px solid rgb(255 255 255 / 20%);
  border-radius: 5px 10px 10px 5px;
  box-shadow: 7px 12px 24px rgb(24 10 21 / 24%);
}

.hero-book span,
.hero-book small {
  font-size: 7px;
  letter-spacing: 1px;
}

.hero-book strong {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 24px;
  line-height: 1.12;
}

.hero-book ion-icon {
  font-size: 24px;
}

.hero-book-back {
  top: 15px;
  left: 25px;
  color: #f8eee0;
  background: #3c5a50;
  transform: rotate(-12deg);
}

.hero-book-front {
  top: 29px;
  right: 25px;
  color: #4b2b43;
  background: #e2c9d6;
  transform: rotate(7deg);
}

/* Collection heading */
.collection-section {
  margin-top: 42px;
}

.collection-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.collection-heading .eyebrow {
  margin-bottom: 7px;
}

.collection-heading h2 {
  margin: 0;
  color: #302731;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -0.8px;
}

.collection-description {
  margin: 8px 0 0;
  color: #827782;
  font-size: 12px;
}

.book-count {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  padding-bottom: 3px;
  color: #91838f;
  font-size: 10px;
}

.count-number {
  color: #68405a;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 25px;
}

/* Search */
.search-wrapper {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 24px 0 25px;
  padding: 0 13px;
  border: 1px solid #e5d9e2;
  border-radius: 12px;
  background: #fffdf9;
  color: #96748a;
}

.search-wrapper > ion-icon {
  flex-shrink: 0;
  font-size: 19px;
}

.book-search {
  --background: transparent;
  --color: #41343f;
  --placeholder-color: #a59aa2;
  --icon-color: #96748a;
  --clear-button-color: #96748a;
  --box-shadow: none;
  --border-radius: 10px;
  padding: 0;
  font-size: 13px;
}

/* Error feedback */
.feedback-message {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 20px;
  padding: 13px 15px;
  border-radius: 10px;
  background: #f7e5e7;
  color: #923d4b;
  font-size: 12px;
  line-height: 1.6;
}

.feedback-message > ion-icon {
  flex-shrink: 0;
  font-size: 18px;
}

.feedback-message span {
  flex: 1;
  overflow-wrap: anywhere;
}

.retry-button {
  flex-shrink: 0;
  padding: 6px 9px;
  border: 1px solid #d9b5bc;
  border-radius: 7px;
  background: transparent;
  color: #923d4b;
  font: inherit;
  cursor: pointer;
}

.retry-button:disabled {
  opacity: 0.5;
}

/* Book cards */
.book-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.book-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid #e9dfe5;
  border-radius: 15px;
  background: #fffdf9;
  box-shadow: 0 5px 18px rgb(66 39 57 / 3%);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.book-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgb(66 39 57 / 8%);
}

.book-cover {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 220px;
  margin: 12px 12px 0;
  padding: 15px;
  overflow: hidden;
  border-radius: 7px 11px 11px 7px;
  box-shadow: inset 4px 0 0 rgb(0 0 0 / 8%);
}

.book-cover::after {
  position: absolute;
  inset: 8px;
  border: 1px solid rgb(255 255 255 / 23%);
  border-radius: 4px 8px 8px 4px;
  content: '';
  pointer-events: none;
}

.cover-1 {
  color: #fff7ed;
  background: #a46d79;
}

.cover-2 {
  color: #f8eee0;
  background: #3c5a50;
}

.cover-3 {
  color: #4b2b43;
  background: #e2c9d6;
}

.cover-4 {
  color: #fff5e9;
  background: #8b7552;
}

.cover-5 {
  color: #f8eee0;
  background: #66516f;
}

.cover-topline,
.cover-bottom {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.cover-topline span,
.cover-bottom span {
  overflow: hidden;
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cover-topline ion-icon {
  flex-shrink: 0;
  font-size: 17px;
}

.cover-center {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.cover-center > ion-icon {
  margin-bottom: 10px;
  font-size: 28px;
}

.cover-rule {
  width: 32px;
  height: 1px;
  margin-bottom: 11px;
  background: currentColor;
  opacity: 0.65;
}

.cover-center h3 {
  display: -webkit-box;
  max-width: 100%;
  margin: 0;
  overflow: hidden;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(17px, 1.7vw, 24px);
  font-weight: 500;
  line-height: 1.2;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.cover-center p {
  display: -webkit-box;
  max-width: 100%;
  margin: 8px 0 0;
  overflow: hidden;
  font-size: 9px;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.cover-bottom {
  justify-content: center;
}

.book-info {
  padding: 16px 15px 15px;
}

.book-meta {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.genre-tag {
  display: inline-block;
  max-width: 100%;
  padding: 5px 8px;
  overflow: hidden;
  border-radius: 6px;
  background: #f0e5ed;
  color: #754761;
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-title {
  display: -webkit-box;
  min-height: 44px;
  margin: 0;
  overflow: hidden;
  color: #3d303b;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.3;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.book-author {
  margin: 6px 0 0;
  color: #8c7d89;
  font-size: 10px;
}

.book-description {
  display: -webkit-box;
  min-height: 58px;
  margin: 13px 0 17px;
  overflow: hidden;
  color: #786f77;
  font-size: 11px;
  line-height: 1.75;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.book-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.read-button {
  --background: #542d46;
  --background-hover: #68405a;
  --background-activated: #432239;
  --color: #fffaf6;
  --border-radius: 8px;
  --box-shadow: none;
  flex: 1;
  min-width: 0;
  height: 39px;
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  text-transform: none;
}

.save-button {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 39px;
  height: 39px;
  border: 1px solid #e3d4df;
  border-radius: 8px;
  background: #fffdf9;
  color: #754761;
  font-size: 19px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.save-button:hover {
  background: #f0e5ed;
}

.save-button:disabled {
  cursor: wait;
  opacity: 0.6;
}

.save-button ion-spinner {
  width: 17px;
  height: 17px;
}

/* Loading and empty states */
.state-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  padding: 30px;
  border: 1px dashed #e2d4de;
  border-radius: 15px;
  background: rgb(255 253 249 / 65%);
  color: #897b87;
  text-align: center;
}

.state-card ion-spinner {
  color: #754761;
}

.state-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 17px;
  background: #eee3eb;
  color: #754761;
  font-size: 25px;
}

.state-card h3 {
  margin: 14px 0 0;
  color: #4a3947;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 21px;
  font-weight: 500;
}

.state-card p {
  max-width: 350px;
  margin: 10px 0 0;
  font-size: 12px;
  line-height: 1.8;
}

.clear-search-button {
  --color: #754761;
  --border-color: #d9c5d4;
  --border-radius: 8px;
  margin-top: 17px;
  font-size: 12px;
  text-transform: none;
}

/* Footer */
.discover-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 42px;
  color: #9a8b97;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 13px;
  font-style: italic;
}

.discover-footer ion-icon {
  color: #98718c;
  font-size: 18px;
}

/* Responsive layouts */
@media (max-width: 1050px) {
  .book-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hero-art {
    width: 230px;
    transform: scale(0.9);
    transform-origin: center right;
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

  .account-link {
    font-size: 11px;
  }

  .discover-layout {
    padding: 20px 15px 30px;
  }

  .discover-hero {
    min-height: auto;
    padding: 27px 23px;
    border-radius: 15px;
  }

  .hero-copy h1 {
    font-size: 35px;
  }

  .hero-description {
    font-size: 12px;
  }

  .hero-art {
    display: none;
  }

  .hero-details {
    gap: 12px;
  }

  .hero-details span {
    font-size: 10px;
  }

  .collection-section {
    margin-top: 32px;
  }

  .collection-heading h2 {
    font-size: 29px;
  }

  .book-grid {
    gap: 13px;
  }

  .book-cover {
    min-height: 190px;
    margin: 8px 8px 0;
    padding: 11px;
  }

  .cover-center h3 {
    font-size: 18px;
  }

  .cover-topline span,
  .cover-bottom span {
    font-size: 6px;
  }

  .book-info {
    padding: 12px 10px;
  }

  .book-title {
    min-height: 40px;
    font-size: 16px;
  }

  .book-description {
    min-height: 55px;
    font-size: 10px;
  }

  .read-button {
    font-size: 10px;
  }

  .save-button {
    width: 35px;
    height: 39px;
  }
}

@media (max-width: 390px) {
  .book-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .book-cover {
    min-height: 245px;
    margin: 12px 12px 0;
    padding: 17px;
  }

  .cover-center h3 {
    font-size: 25px;
  }

  .book-info {
    padding: 16px;
  }

  .book-title {
    min-height: auto;
    font-size: 19px;
  }

  .book-description {
    min-height: auto;
  }

  .collection-heading {
    align-items: flex-start;
  }
}
</style>
