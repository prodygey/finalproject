
<!--
  Purpose:
  Display books saved by the logged-in user.
  Allow users to open or remove saved books.
-->
<template>
  <ion-page>
    <ion-content :fullscreen="true" class="library-page">
      <!-- Navigation header -->
      <header class="site-header">
        <button class="brand" @click="goToFeed">
          <span class="brand-icon">
            <ion-icon :icon="bookOutline" />
          </span>
          <span>BookNest</span>
        </button>

        <nav class="header-nav">
          <button class="nav-link" @click="goToFeed">Feed</button>
          <button class="nav-link" @click="goToDiscover">Discover</button>
          <button class="nav-link" @click="goToWrite">Write</button>
          <button class="nav-link active">My Library</button>
        </nav>
      </header>

      <main class="page-container">
        <!-- Library introduction -->
        <section class="library-hero">
          <div class="hero-copy">
            <span class="eyebrow">
              <ion-icon :icon="heartOutline" />
              YOUR PERSONAL COLLECTION
            </span>

            <h1>Your Library<span>.</span></h1>

            <p>
              Your favorite stories, all in one place.
              Pick up where you left off or find your next favorite read.
            </p>

            <div class="library-summary">
              <div class="summary-icon">
                <ion-icon :icon="libraryOutline" />
              </div>
              <div>
                <strong>{{ books.length }} {{ books.length === 1 ? 'book' : 'books' }}</strong>
                <span>saved in your collection</span>
              </div>
            </div>
          </div>

          <div class="hero-art" aria-hidden="true">
            <div class="art-circle circle-one"></div>
            <div class="art-circle circle-two"></div>

            <div class="art-book book-back">
              <span></span>
            </div>

            <div class="art-book book-front">
              <ion-icon :icon="bookOutline" />
              <span>STORIES</span>
              <div class="art-book-line"></div>
              <small>WORTH KEEPING</small>
            </div>

            <div class="floating-star star-one">✦</div>
            <div class="floating-star star-two">✧</div>
          </div>
        </section>

        <!-- Library section heading -->
        <section class="collection-section">
          <div class="section-heading">
            <div>
              <span class="eyebrow">SAVED FOR LATER</span>
              <h2>Your collection</h2>
            </div>

            <button class="discover-link" @click="goToDiscover">
              Find more books
              <ion-icon :icon="arrowForwardOutline" />
            </button>
          </div>

          <!-- Error message -->
          <div v-if="errorMessage" class="message error-message">
            <ion-icon :icon="alertCircleOutline" />
            <span>{{ errorMessage }}</span>
            <button class="retry-button" @click="loadLibrary">
              Try again
            </button>
          </div>

          <!-- Loading state -->
          <div v-if="isLoading" class="loading-state">
            <ion-spinner name="crescent" />
            <p>Gathering your saved stories...</p>
          </div>

          <!-- Empty state -->
          <div v-else-if="books.length === 0 && !errorMessage" class="empty-state">
            <div class="empty-icon">
              <ion-icon :icon="libraryOutline" />
            </div>

            <span class="eyebrow">A LITTLE ROOM FOR STORIES</span>
            <h3>Your library is waiting.</h3>
            <p>
              You haven't saved any books yet. Explore BookNest and add
              a story you'd love to read.
            </p>

            <button class="primary-button" @click="goToDiscover">
              <ion-icon :icon="compassOutline" />
              Explore books
              <ion-icon :icon="arrowForwardOutline" />
            </button>
          </div>

          <!-- Saved books grid -->
          <div v-else-if="books.length > 0" class="book-grid">
            <article
              v-for="(book, index) in books"
              :key="book.id"
              class="book-card"
            >
              <div class="card-cover" :class="`cover-style-${index % 4}`">
                <div class="cover-frame">
                  <ion-icon :icon="bookOutline" class="cover-icon" />
                  <span class="cover-label">A BOOKNEST READ</span>
                  <h3>{{ book.title }}</h3>
                  <span class="cover-divider"></span>
                  <p>{{ book.author }}</p>
                  <span class="cover-bottom">BOOKNEST COLLECTION</span>
                </div>
              </div>

              <div class="card-content">
                <div class="card-title-area">
                  <h3>{{ book.title }}</h3>
                  <p class="book-author">By {{ book.author }}</p>
                </div>

                <p class="book-description">
                  {{ book.description || 'A story waiting to be discovered.' }}
                </p>

                <div class="card-actions">
                  <button
                    class="read-button"
                    @click="openBook(book.id)"
                  >
                    Read book
                    <ion-icon :icon="arrowForwardOutline" />
                  </button>

                  <button
                    class="remove-button"
                    :disabled="removingBookId === book.id"
                    @click="removeBook(book.id)"
                    :aria-label="`Remove ${book.title} from your library`"
                    title="Remove from library"
                  >
                    <ion-spinner
                      v-if="removingBookId === book.id"
                      name="crescent"
                    />
                    <ion-icon v-else :icon="bookmarkOutline" />
                  </button>
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>

      <footer class="site-footer">
        <span class="footer-brand">BookNest</span>
        <span>A little space for every story.</span>
      </footer>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonIcon,
  IonSpinner,
  onIonViewWillEnter,
} from '@ionic/vue';
import {
  bookOutline,
  heartOutline,
  libraryOutline,
  createOutline,
  arrowForwardOutline,
  alertCircleOutline,
  compassOutline,
  bookmarkOutline,
  bookmark,
} from 'ionicons/icons';
import { apiRequest } from '../services/api';
import { getToken } from '../services/session';

// Information about a saved book.
type LibraryBook = {
  id: number;
  title: string;
  description: string;
  author: string;
};

const books = ref<LibraryBook[]>([]);
const errorMessage = ref('');
const isLoading = ref(true);
const removingBookId = ref<number | null>(null);

const router = useRouter();




// Purpose: Refresh the saved books whenever the Library page opens.
onIonViewWillEnter(() => {
  loadLibrary();
});

// Navigate to the main feed.
function goToFeed() {
  router.push('/feed');
}

// Navigate to Discover.
function goToDiscover() {
  router.push('/books');
}

function goToWrite() {
  router.push('/write');
}

// Retrieve the logged-in user's saved books.
async function loadLibrary() {
  errorMessage.value = '';
  isLoading.value = true;

  const token = getToken();

  if (!token) {
    errorMessage.value = 'Sign in to view your library.';
    isLoading.value = false;
    return;
  }

  try {
    const result = await apiRequest<{ books: LibraryBook[] }>('/library', {
      token,
    });

    books.value = result.books;
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Could not load your library.';
  } finally {
    isLoading.value = false;
  }
}

// Open a book's details and reading page.
function openBook(id: number) {
  router.push(`/books/${id}`);
}

// Remove a saved book from the user's library.
async function removeBook(id: number) {
  const token = getToken();

  if (!token || removingBookId.value !== null) {
    if (!token) {
      errorMessage.value = 'Sign in to manage your library.';
    }
    return;
  }

  removingBookId.value = id;
  errorMessage.value = '';

  try {
    await apiRequest(`/library/${id}`, {
      method: 'DELETE',
      token,
    });

    // Update the screen without needing to refresh the page.
    books.value = books.value.filter((book) => book.id !== id);
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Could not remove this book.';
  } finally {
    removingBookId.value = null;
  }
}

// Load the library when the page is first opened.
onMounted(loadLibrary);
</script>

<style scoped>
.library-page {
  --background: #f8f4ec;
  --color: #302432;
  background: #f8f4ec;
  color: #302432;
}

.site-header {
  min-height: 72px;
  padding: 0 5%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: #fffdf8;
  border-bottom: 1px solid #e9e0d8;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 0;
  background: transparent;
  color: #512b4a;
  font-family: inherit;
  font-size: 20px;
  font-weight: 800;
  cursor: pointer;
}

.brand-icon {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: #512b4a;
  color: #fffaf3;
  font-size: 21px;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-link {
  padding: 10px 12px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #776675;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.nav-link:hover,
.nav-link.active {
  background: #f2e8ef;
  color: #512b4a;
}

.page-container {
  width: min(1120px, 88%);
  margin: 0 auto;
  padding: 44px 0 70px;
}

.library-hero {
  min-height: 335px;
  display: grid;
  grid-template-columns: 1fr 340px;
  align-items: center;
  gap: 35px;
  padding: 40px 0;
  border-bottom: 1px solid #e6dbd2;
}

.hero-copy {
  max-width: 600px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #916b49;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.8px;
}

.hero-copy h1 {
  margin: 18px 0 14px;
  color: #352535;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(42px, 5vw, 62px);
  font-weight: 500;
  line-height: 1.08;
}

.hero-copy h1 span {
  color: #9a6e8d;
}

.hero-copy > p {
  max-width: 475px;
  margin: 0;
  color: #776675;
  font-size: 15px;
  line-height: 1.9;
}

.library-summary {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-top: 26px;
}

.summary-icon {
  width: 43px;
  height: 43px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: #eee2eb;
  color: #704568;
  font-size: 21px;
}

.library-summary > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.library-summary strong {
  color: #512b4a;
  font-size: 14px;
}

.library-summary span {
  color: #8a7885;
  font-size: 12px;
}

.hero-art {
  position: relative;
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.art-circle {
  position: absolute;
  border-radius: 50%;
}

.circle-one {
  width: 250px;
  height: 250px;
  background: #efe4ec;
}

.circle-two {
  width: 180px;
  height: 180px;
  border: 1px solid #d9c5d4;
}

.art-book {
  position: absolute;
  width: 125px;
  height: 175px;
  border-radius: 4px 10px 10px 4px;
  box-shadow: 9px 12px 22px #36203626, inset 6px 0 #00000012;
}

.book-back {
  margin: 0 0 0 65px;
  transform: rotate(12deg);
  background: #b99a74;
}

.book-back span {
  position: absolute;
  inset: 12px;
  border: 1px solid #fff4d277;
}

.book-front {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 15px;
  transform: rotate(-8deg);
  background: #512b4a;
  color: #f4dfba;
}

.book-front > ion-icon {
  font-size: 29px;
}

.book-front > span {
  font-size: 8px;
  letter-spacing: 1.6px;
}

.art-book-line {
  width: 35px;
  height: 1px;
  background: #d9b98c;
}

.book-front small {
  font-size: 7px;
  letter-spacing: 1px;
}

.floating-star {
  position: absolute;
  color: #a78354;
  font-size: 28px;
}

.star-one {
  top: 28px;
  right: 35px;
}

.star-two {
  bottom: 27px;
  left: 35px;
}

.collection-section {
  padding: 42px 0 72px;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
}

.section-heading h2 {
  margin: 9px 0 0;
  color: #352535;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 34px;
  font-weight: 500;
}

.discover-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  border: 0;
  background: transparent;
  color: #704568;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.discover-link:hover {
  color: #512b4a;
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 25px;
}

.book-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid #e9dfd6;
  border-radius: 12px;
  background: #fffdf8;
  transition: transform 0.2s, box-shadow 0.2s;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 30px #422a3512;
}

.card-cover {
  min-height: 230px;
  display: grid;
  place-items: center;
  padding: 22px;
  background: #512b4a;
}

.cover-style-1 {
  background: #6e7460;
}

.cover-style-2 {
  background: #a66e58;
}

.cover-style-3 {
  background: #565d78;
}

.cover-frame {
  width: min(190px, 100%);
  min-height: 195px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 15px;
  border: 1px solid #e4c99e99;
  color: #fff4e0;
  text-align: center;
}

.cover-icon {
  margin-bottom: 14px;
  color: #e7c99b;
  font-size: 24px;
}

.cover-label {
  color: #e7c99b;
  font-size: 7px;
  letter-spacing: 1.5px;
}

.cover-frame h3 {
  margin: 15px 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 21px;
  font-weight: 500;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.cover-divider {
  width: 30px;
  height: 1px;
  margin-bottom: 9px;
  background: #e7c99b;
}

.cover-frame p {
  margin: 0 0 15px;
  color: #f0ddc9;
  font-size: 10px;
  overflow-wrap: anywhere;
}

.cover-bottom {
  color: #e7c99b;
  font-size: 6px;
  letter-spacing: 1.2px;
}

.card-content {
  padding: 20px;
}

.card-title-area h3 {
  margin: 0;
  color: #392a39;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 22px;
  font-weight: 500;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.book-author {
  margin: 7px 0 0;
  color: #8c7185;
  font-size: 12px;
}

.book-description {
  min-height: 65px;
  margin: 17px 0;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  color: #786a75;
  font-size: 13px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 15px;
  border-top: 1px solid #eee5dd;
}

.read-button {
  min-height: 41px;
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 12px;
  border: 0;
  border-radius: 7px;
  background: #512b4a;
  color: #fffaf3;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.read-button:hover {
  background: #6b3a61;
}

.remove-button {
  width: 41px;
  height: 41px;
  flex: 0 0 41px;
  display: grid;
  place-items: center;
  border: 1px solid #e1d4de;
  border-radius: 7px;
  background: #fffdf8;
  color: #825c79;
  font-size: 19px;
  cursor: pointer;
}

.remove-button:hover {
  background: #f5eaf1;
  color: #512b4a;
}

.remove-button:disabled {
  opacity: 0.55;
  cursor: wait;
}

.remove-button ion-spinner {
  width: 19px;
  height: 19px;
}

.empty-state {
  padding: 65px 24px;
  border: 1px dashed #ddcec2;
  border-radius: 14px;
  background: #fffaf4;
  text-align: center;
}

.empty-icon {
  width: 66px;
  height: 66px;
  display: grid;
  place-items: center;
  margin: 0 auto 22px;
  border-radius: 50%;
  background: #f0e4ed;
  color: #6c4263;
  font-size: 29px;
}

.empty-state h3 {
  margin: 12px 0;
  color: #452e43;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 30px;
  font-weight: 500;
}

.empty-state > p {
  max-width: 440px;
  margin: 0 auto 24px;
  color: #837481;
  font-size: 14px;
  line-height: 1.8;
}

.primary-button {
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 19px;
  border: 0;
  border-radius: 8px;
  background: #512b4a;
  color: #fffaf3;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.primary-button:hover {
  background: #6b3a61;
}

.message {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
  padding: 14px 16px;
  border-radius: 8px;
  font-size: 13px;
}

.error-message {
  border: 1px solid #e8c7c7;
  background: #fff0ef;
  color: #923c43;
}

.retry-button {
  margin-left: auto;
  border: 0;
  background: transparent;
  color: #923c43;
  font: inherit;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}

.loading-state {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #806b7c;
}

.loading-state ion-spinner {
  width: 32px;
  height: 32px;
  color: #512b4a;
}

.site-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  padding: 28px 20px;
  border-top: 1px solid #e6dbd2;
  background: #fffdf8;
  color: #8a7885;
  font-size: 12px;
}

.footer-brand {
  color: #512b4a;
  font-weight: 800;
}

@media (max-width: 900px) {
  .library-hero {
    grid-template-columns: 1fr 250px;
    gap: 15px;
  }

  .book-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 650px) {
  .site-header {
    min-height: 68px;
    padding: 0 5%;
  }

  .brand {
    font-size: 18px;
  }

  .brand-icon {
    width: 34px;
    height: 34px;
  }

  .header-nav {
    gap: 1px;
  }

  .nav-link {
    padding: 8px 6px;
    font-size: 10px;
  }

  .library-hero {
    grid-template-columns: 1fr;
    padding: 35px 0 25px;
  }

  .hero-art {
    min-height: 230px;
  }

  .page-container {
    width: 90%;
    padding-top: 30px;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .book-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .card-cover {
    min-height: 250px;
  }

  .cover-frame {
    min-height: 210px;
  }

  .empty-state {
    padding: 45px 18px;
  }
}

@media (max-width: 390px) {
  .brand {
    gap: 6px;
    font-size: 16px;
  }

  .brand-icon {
    width: 32px;
    height: 32px;
  }

  .nav-link {
    padding: 8px 5px;
    font-size: 10px;
  }
}
</style>
