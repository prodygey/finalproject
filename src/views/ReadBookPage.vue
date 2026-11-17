
<!--
  Purpose:
  Display a book's details and chapter list.
  Let readers select and read a chapter.
-->
<template>
  <ion-page>
    <ion-content :fullscreen="true" class="book-page">
      <!-- Top navigation -->
      <header class="site-header">
        <button class="brand" @click="goToBooks">
          <span class="brand-icon">
            <ion-icon :icon="bookOutline" />
          </span>
          <span>BookNest</span>
        </button>

        <button class="back-link" @click="goToBooks">
          <ion-icon :icon="arrowBackOutline" />
          <span>Back to Discover</span>
        </button>
      </header>

      <main class="page-container">
        <!-- Error message -->
        <div v-if="errorMessage" class="message error-message">
          <ion-icon :icon="alertCircleOutline" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Loading state -->
        <div v-if="isLoading" class="loading-state">
          <ion-spinner name="crescent" />
          <p>Opening your next read...</p>
        </div>

        <!-- Book information -->
        <template v-else-if="book">
          <section class="book-hero">
            <div class="book-cover">
              <div class="cover-decoration cover-decoration-one"></div>
              <div class="cover-decoration cover-decoration-two"></div>

              <div class="cover-content">
                <ion-icon :icon="bookOutline" class="cover-icon" />
                <span class="cover-label">A BOOKNEST STORY</span>
                <h2>{{ book.title }}</h2>
                <span class="cover-line"></span>
                <p>{{ book.author }}</p>
              </div>

              <span class="cover-bottom">BOOKNEST EDITION</span>
            </div>

            <div class="book-information">
              <span class="eyebrow">
                <ion-icon :icon="sparklesOutline" />
                YOUR NEXT FAVORITE READ
              </span>

              <h1>{{ book.title }}</h1>
              <p class="author-line">
                Written by <strong>{{ book.author }}</strong>
              </p>

              <p class="book-description">
                {{ book.description || 'No description has been provided for this book yet.' }}
              </p>

              <div class="book-stats">
                <div class="stat-item">
                  <ion-icon :icon="listOutline" />
                  <span>
                    <strong>{{ chapters.length }}</strong>
                    {{ chapters.length === 1 ? 'chapter' : 'chapters' }}
                  </span>
                </div>

                <div class="stat-item">
                  <ion-icon :icon="bookOutline" />
                  <span>Ready to read</span>
                </div>
              </div>

              <button
                v-if="chapters.length"
                class="primary-button"
                @click="readChapter(chapters[0].id)"
                :disabled="isReading"
              >
                <ion-icon :icon="bookOutline" />
                {{ isReading ? 'Opening chapter...' : selectedChapter ? 'Continue Reading' : 'Start Reading' }}
                <ion-icon :icon="arrowForwardOutline" />
              </button>
            </div>
          </section>

          <!-- Chapter list -->
          <section class="chapters-section">
            <div class="section-heading">
              <div>
                <span class="eyebrow">THE STORY</span>
                <h2>Chapters</h2>
                <p>Choose a chapter and settle in to read.</p>
              </div>
              <span class="chapter-count">{{ chapters.length }} total</span>
            </div>

            <div v-if="!chapters.length" class="empty-state">
              <div class="empty-icon">
                <ion-icon :icon="bookOutline" />
              </div>
              <h3>No chapters yet</h3>
              <p>The author hasn't published any chapters for this book.</p>
            </div>

            <div v-else class="chapter-list">
              <button
                v-for="chapter in chapters"
                :key="chapter.id"
                class="chapter-row"
                :class="{ 'chapter-active': selectedChapter?.id === chapter.id }"
                @click="readChapter(chapter.id)"
                :disabled="isReading"
              >
                <span class="chapter-number">
                  {{ String(chapter.chapter_number).padStart(2, '0') }}
                </span>

                <span class="chapter-details">
                  <span class="chapter-label">CHAPTER {{ chapter.chapter_number }}</span>
                  <strong>{{ chapter.title }}</strong>
                </span>

                <ion-icon
                  :icon="selectedChapter?.id === chapter.id ? checkmarkCircleOutline : arrowForwardOutline"
                  class="chapter-arrow"
                />
              </button>
            </div>
          </section>

          <!-- Selected chapter reading area -->
          <section v-if="selectedChapter" class="reader-section">

            <!-- Background music controls -->
<div class="music-controls">
  <div class="music-information">
    <span class="music-label">BOOKNEST AMBIENCE</span>
    <span class="music-description">
      Background music for {{ book?.genre || 'your story' }}
    </span>
  </div>

  <!-- Show only if the browser blocks automatic playback -->
  <button
    v-if="needsMusicPermission"
    class="music-button"
    @click="enableMusic"
  >
    <ion-icon :icon="bookOutline" />
    Tap to enable music
  </button>

  <!-- Mute and unmute control -->
  <button
    v-else
    class="music-button"
    @click="toggleMute"
  >
    <ion-icon :icon="isMuted ? volumeMuteOutline : volumeHighOutline" />
    <!--{{ isMuted ? 'Unmute' : 'Mute' }}-->
  </button>
</div>






            <div class="reader-topline">
              <span class="eyebrow">NOW READING</span>
              <span class="reader-book-title">{{ book.title }}</span>
            </div>

            <div class="reader-content">
              <div class="reader-heading">
                <span class="reader-chapter-number">
                  CHAPTER {{ selectedChapter.chapter_number }}
                </span>
                <h2>{{ selectedChapter.title }}</h2>
                <p class="reader-byline">By {{ book.author }}</p>
                <span class="reader-divider"></span>
              </div>

              <!-- Individual selectable paragraphs -->
              <div class="story-text">
                <div v-for="(paragraph, index) in chapterParagraphs" :key="index" class="story-paragraph-wrapper">
                  <!-- Select a paragraph -->
                  <button type="button" class="story-paragraph" :class="{
                    'paragraph-selected': selectedParagraph === paragraph
                  }" @click="selectedParagraph = paragraph">
                    {{ paragraph }}
                  </button>

                  <!-- Share button appears directly below the selected paragraph -->
                  <button v-if="selectedParagraph === paragraph" type="button" class="inline-share-quote"
                    @click="shareSelectedQuote">
                    <ion-icon :icon="shareSocialOutline" />
                    Share Quote
                  </button>
                </div>
              </div>

              <div class="reader-navigation">
                <button
                  class="reader-nav-button"
                  @click="goToAdjacentChapter(-1)"
                  :disabled="!hasPreviousChapter || isReading"
                >
                  <ion-icon :icon="arrowBackOutline" />
                  Previous
                </button>

                <span class="reader-position">
                  Chapter {{ selectedChapter.chapter_number }}
                  of {{ chapters.length }}
                </span>

                <button
                  class="reader-nav-button next-button"
                  @click="goToAdjacentChapter(1)"
                  :disabled="!hasNextChapter || isReading"
                >
                  Next
                  <ion-icon :icon="arrowForwardOutline" />
                </button>
              </div>
            </div>
          </section>
        </template>
      </main>

      <footer class="site-footer">
        <span class="footer-brand">BookNest</span>
        <span>A little space for every story.</span>
      </footer>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { onIonViewWillLeave } from '@ionic/vue';
import { useRoute, useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonIcon,
  IonSpinner,
} from '@ionic/vue';
import {
  bookOutline,
  arrowBackOutline,
  arrowForwardOutline,
  sparklesOutline,
  listOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  volumeOffOutline,
  volumeHighOutline,
  volumeMuteOutline,
  shareSocialOutline,
} from 'ionicons/icons';
import { apiRequest } from '../services/api';

// Book information returned by the API.
type Book = {
  id: number;
  title: string;
  description: string;
  author: string;
  genre: string;
};

// Chapter information displayed in the chapter list.
type ChapterSummary = {
  id: number;
  chapter_number: number;
  title: string;
};

// Full chapter information includes its story text.
type Chapter = ChapterSummary & {
  content: string;
};

const route = useRoute();
const router = useRouter();

const book = ref<Book | null>(null);
const chapters = ref<ChapterSummary[]>([]);
const selectedChapter = ref<Chapter | null>(null);


  // The paragraph currently selected by the reader.
const selectedParagraph = ref('');

// Separate the chapter content using the line breaks entered by the writer.
const chapterParagraphs = computed(() => {
  if (!selectedChapter.value) return [];

  return selectedChapter.value.content
    .split(/\r?\n/)
    .map(paragraph => paragraph.trim())
    .filter(paragraph => paragraph.length > 0);
});




const errorMessage = ref('');
const isLoading = ref(true);
const isReading = ref(false);


// Background music information returned by the API.
type GenreMusic = {
  music_title: string;
  music_url: string;
  genre: string;
};

// Background music player state.
const audioPlayer = ref<HTMLAudioElement | null>(null);
const isMuted = ref(false);
const needsMusicPermission = ref(false);
const musicError = ref('');

// Retrieve and play music based on the book's genre.
async function loadGenreMusic() {
  try {
    const id = String(route.params.id);

    const result = await apiRequest<{
      message: string;
      music: GenreMusic;
    }>(`/books/${id}/music`);

    // Stop any previously loaded music.
    if (audioPlayer.value) {
      audioPlayer.value.pause();
      audioPlayer.value = null;
    }

    // Use the backend URL for the music file.
    const musicUrl = new URL(
      result.music.music_url,
      'http://192.168.1.5:3000'
    ).toString();

    const audio = new Audio(musicUrl);

    audio.loop = true;
    audio.muted = isMuted.value;

    audioPlayer.value = audio;

    // Attempt automatic playback.
    try {
      await audio.play();
      needsMusicPermission.value = false;
    } catch {
      // Browser blocked autoplay.
      needsMusicPermission.value = true;
    }

  } catch (error) {
    console.error('Could not load genre music:', error);
    musicError.value = 'Background music is unavailable.';
  }
}

// Enable music after the reader taps the permission button.
async function enableMusic() {
  if (!audioPlayer.value) return;

  try {
    await audioPlayer.value.play();
    needsMusicPermission.value = false;
  } catch (error) {
    console.error('Could not start music:', error);
  }
}

// Toggle mute and unmute.
function toggleMute() {
  isMuted.value = !isMuted.value;

  if (audioPlayer.value) {
    audioPlayer.value.muted = isMuted.value;
  }
}

// Stop music when leaving the reading page.
onUnmounted(() => {
  if (audioPlayer.value) {
    audioPlayer.value.pause();
    audioPlayer.value.src = '';
    audioPlayer.value = null;
  }
});


// Stop background music whenever the user leaves this page.
onIonViewWillLeave(() => {
  if (audioPlayer.value) {
    audioPlayer.value.pause();
    audioPlayer.value.currentTime = 0;
    audioPlayer.value.src = '';
    audioPlayer.value = null;
  }
});




// Find the selected chapter's position in the chapter list.
const selectedIndex = computed(() =>
  chapters.value.findIndex(
    (chapter) => chapter.id === selectedChapter.value?.id
  )
);

// Check whether a previous or next chapter exists.
const hasPreviousChapter = computed(() => selectedIndex.value > 0);

const hasNextChapter = computed(
  () =>
    selectedIndex.value >= 0 &&
    selectedIndex.value < chapters.value.length - 1
);

// Return to the Discover page.
function goToBooks() {
  router.push('/books');
}



// Transfer the selected quote and its book information to the Community Feed.
function shareSelectedQuote() {
  if (!selectedParagraph.value || !book.value || !selectedChapter.value) {
    return;
  }

  router.push({
    path: '/feed',
    query: {
      quote: selectedParagraph.value,
      bookId: String(book.value.id),
      bookTitle: book.value.title,
      chapterTitle: selectedChapter.value.title,
      chapterNumber: String(selectedChapter.value.chapter_number),
    },
  });
}







// Load the book and its published chapter list.
async function loadBook() {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const id = String(route.params.id);

    const result = await apiRequest<{
      book: Book;
      chapters: ChapterSummary[];
    }>(`/books/${id}`);

    book.value = result.book;
    chapters.value = result.chapters;
    //await loadGenreMusic();
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Could not load this book.';
  } finally {
    isLoading.value = false;
  }
}

// Fetch the complete story text for a selected chapter.
async function readChapter(chapterId: number) {
  if (isReading.value) return;

  isReading.value = true;
  errorMessage.value = '';

  // Load background music only when the reader starts reading.
  if (!audioPlayer.value) {
    await loadGenreMusic();
  }

  try {
    const id = String(route.params.id);

    const result = await apiRequest<{ chapter: Chapter }>(
      `/books/${id}/chapters/${chapterId}`
    );

    selectedChapter.value = result.chapter;
    selectedParagraph.value = '';

    // Scroll the reader into view after the chapter has loaded.
    requestAnimationFrame(() => {
      document.querySelector('.reader-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Could not load this chapter.';
  } finally {
    isReading.value = false;
  }
}

// Open the previous or next chapter in the current list.
function goToAdjacentChapter(direction: -1 | 1) {
  const nextIndex = selectedIndex.value + direction;
  const nextChapter = chapters.value[nextIndex];

  if (nextChapter) {
    readChapter(nextChapter.id);
  }
}

// Load book information when the page opens.
onMounted(loadBook);
</script>

<style scoped>
.book-page {
  --background: #f8f4ec;
  --color: #302432;
  background: #f8f4ec;
  color: #302432;
}

.site-header {
  min-height: 76px;
  padding: 0 7%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: #fffdf8;
  border-bottom: 1px solid #e9e0d8;
}

.brand,
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 0;
  cursor: pointer;
  font-family: inherit;
}

.brand {
  background: transparent;
  color: #512b4a;
  font-size: 22px;
  font-weight: 800;
}

.brand-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: #512b4a;
  color: #fffaf3;
  font-size: 21px;
}

.back-link {
  background: transparent;
  color: #6b5867;
  font-size: 14px;
  font-weight: 600;
}

.back-link:hover {
  color: #512b4a;
}

.page-container {
  width: min(1120px, 88%);
  margin: 0 auto;
  padding: 48px 0 72px;
}

.book-hero {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  align-items: center;
  gap: clamp(36px, 7vw, 90px);
  padding: 30px 0 64px;
}

.book-cover {
  position: relative;
  min-height: 410px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  background: #512b4a;
  color: #fff8e9;
  border-radius: 5px 15px 15px 5px;
  box-shadow: 15px 18px 35px #4b30401f, inset 7px 0 0 #321d31;
}

.book-cover::before {
  content: '';
  position: absolute;
  inset: 15px 14px 15px 23px;
  border: 1px solid #d7b98d99;
  pointer-events: none;
}

.cover-decoration {
  position: absolute;
  width: 190px;
  height: 190px;
  border: 1px solid #d7b98d55;
  border-radius: 50%;
}

.cover-decoration-one {
  top: -75px;
  right: -65px;
}

.cover-decoration-two {
  bottom: 12px;
  left: -125px;
  width: 240px;
  height: 240px;
}

.cover-content {
  position: relative;
  z-index: 1;
  width: 100%;
  text-align: center;
}

.cover-icon {
  display: block;
  margin: 0 auto 26px;
  font-size: 34px;
  color: #e8cba0;
}

.cover-label,
.cover-bottom {
  display: block;
  font-size: 9px;
  letter-spacing: 2.2px;
  color: #e8cba0;
}

.cover-content h2 {
  margin: 25px 0 18px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(28px, 3vw, 39px);
  font-weight: 500;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.cover-line {
  display: block;
  width: 42px;
  height: 2px;
  margin: 0 auto 17px;
  background: #e8cba0;
}

.cover-content p {
  font-size: 14px;
  color: #f0dfcf;
}

.cover-bottom {
  position: absolute;
  bottom: 30px;
  z-index: 1;
  font-size: 8px;
}

.book-information {
  max-width: 630px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #916b49;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.8px;
}

.book-information h1 {
  margin: 18px 0 12px;
  color: #352535;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(36px, 5vw, 58px);
  font-weight: 500;
  line-height: 1.1;
  overflow-wrap: anywhere;
}

.author-line {
  margin: 0 0 26px;
  color: #776675;
  font-size: 15px;
}

.author-line strong {
  color: #512b4a;
}

.book-description {
  max-width: 600px;
  color: #685b66;
  font-size: 16px;
  line-height: 1.9;
  white-space: pre-wrap;
}

.book-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin: 28px 0;
  padding: 19px 0;
  border-top: 1px solid #e6dbd2;
  border-bottom: 1px solid #e6dbd2;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #766575;
  font-size: 13px;
}

.stat-item ion-icon {
  color: #8c6381;
  font-size: 19px;
}

.stat-item strong {
  color: #512b4a;
}

.primary-button {
  min-height: 49px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 0 22px;
  border: 0;
  border-radius: 8px;
  background: #512b4a;
  color: #fffaf3;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.primary-button:hover {
  background: #6b3a61;
  transform: translateY(-1px);
}

.primary-button:disabled {
  opacity: 0.65;
  cursor: wait;
}

.chapters-section {
  padding: 38px 0 55px;
  border-top: 1px solid #e6dbd2;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 25px;
}

.section-heading h2 {
  margin: 8px 0;
  color: #352535;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 35px;
  font-weight: 500;
}

.section-heading p {
  margin: 0;
  color: #837481;
  font-size: 14px;
}

.chapter-count {
  padding: 8px 12px;
  border: 1px solid #e3d7cc;
  border-radius: 20px;
  color: #765f70;
  font-size: 12px;
  white-space: nowrap;
}

.chapter-list {
  overflow: hidden;
  border: 1px solid #e8ded5;
  border-radius: 12px;
  background: #fffdf8;
}

.chapter-row {
  width: 100%;
  min-height: 86px;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 16px 22px;
  text-align: left;
  border: 0;
  border-bottom: 1px solid #eee5dd;
  background: transparent;
  color: #352535;
  cursor: pointer;
  transition: background 0.2s;
}

.chapter-row:last-child {
  border-bottom: 0;
}

.chapter-row:hover,
.chapter-active {
  background: #f4ebf1;
}

.chapter-number {
  width: 43px;
  height: 43px;
  flex: 0 0 43px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: #f2e8ef;
  color: #704568;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 16px;
}

.chapter-active .chapter-number {
  background: #512b4a;
  color: #fffaf3;
}

.chapter-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.chapter-label {
  color: #9b806e;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.4px;
}

.chapter-details strong {
  overflow-wrap: anywhere;
  font-size: 15px;
  font-weight: 650;
}

.chapter-arrow {
  color: #997d91;
  font-size: 20px;
}

.chapter-row:disabled {
  cursor: wait;
  opacity: 0.7;
}

.empty-state {
  padding: 48px 20px;
  text-align: center;
  border: 1px dashed #ddcec2;
  border-radius: 12px;
  background: #fffaf4;
}

.empty-icon {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: #f0e4ed;
  color: #6c4263;
  font-size: 25px;
}

.empty-state h3 {
  margin: 0 0 8px;
  color: #452e43;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 23px;
  font-weight: 500;
}

.empty-state p {
  margin: 0;
  color: #837481;
  font-size: 14px;
}

.reader-section {
  scroll-margin-top: 20px;
  padding-top: 42px;
  border-top: 1px solid #e6dbd2;
}

.reader-topline {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.reader-book-title {
  color: #8a7885;
  font-size: 12px;
}

.reader-content {
  max-width: 850px;
  margin: 0 auto;
  padding: clamp(25px, 6vw, 65px);
  border: 1px solid #eee4da;
  border-radius: 12px;
  background: #fffdf8;
  box-shadow: 0 12px 35px #422a3510;
}

.reader-heading {
  text-align: center;
  padding-bottom: 35px;
}

.reader-chapter-number {
  color: #98734f;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 2px;
}

.reader-heading h2 {
  margin: 16px 0 12px;
  color: #3a2939;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 500;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.reader-byline {
  color: #8a7885;
  font-size: 13px;
}

.reader-divider {
  display: block;
  width: 42px;
  height: 2px;
  margin: 25px auto 0;
  background: #b7956c;
}

.story-text {
  color: #413640;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 18px;
  line-height: 2;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.reader-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-top: 42px;
  padding-top: 23px;
  border-top: 1px solid #eae0d7;
}

.reader-nav-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 13px;
  border: 1px solid #dfd1d8;
  border-radius: 7px;
  background: #fffdf8;
  color: #512b4a;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.reader-nav-button:hover:not(:disabled) {
  background: #f3eaf0;
}

.reader-nav-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.next-button {
  background: #512b4a;
  color: #fffaf3;
  border-color: #512b4a;
}

.next-button:hover:not(:disabled) {
  background: #6b3a61;
}

.reader-position {
  color: #897986;
  font-size: 11px;
  text-align: center;
}

.message {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 24px;
  padding: 14px 16px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
}

.error-message {
  border: 1px solid #e8c7c7;
  background: #fff0ef;
  color: #923c43;
}

.loading-state {
  min-height: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #806b7c;
}

.loading-state ion-spinner {
  color: #512b4a;
  width: 34px;
  height: 34px;
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

@media (max-width: 760px) {
  .site-header {
    min-height: 68px;
    padding: 0 6%;
  }

  .brand {
    font-size: 19px;
  }

  .back-link {
    font-size: 12px;
  }

  .page-container {
    width: 88%;
    padding-top: 24px;
  }

  .book-hero {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 16px 0 40px;
  }

  .book-cover {
    width: min(270px, 100%);
    min-height: 350px;
    margin: 0 auto;
  }

  .book-information h1 {
    font-size: 39px;
  }

  .section-heading h2 {
    font-size: 30px;
  }

  .chapter-row {
    gap: 12px;
    padding: 14px;
  }

  .chapter-number {
    width: 38px;
    height: 38px;
    flex-basis: 38px;
  }

  .reader-content {
    padding: 26px 20px;
  }

  .story-text {
    font-size: 17px;
    line-height: 1.9;
  }

  .reader-navigation {
    flex-wrap: wrap;
  }

  .reader-position {
    order: -1;
    width: 100%;
  }
}

@media (max-width: 380px) {
  .back-link {
    gap: 5px;
  }

  .back-link span {
    max-width: 90px;
  }

  .book-stats {
    gap: 14px;
  }

  .reader-nav-button {
    padding: 9px;
  }
}


/* Background music controls */
.music-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 20px;
  padding: 16px 20px;
  border: 1px solid #e8ded5;
  border-radius: 10px;
  background: #fffdf8;
}

.music-information {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.music-label {
  color: #916b49;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.music-description {
  color: #685b66;
  font-size: 13px;
}

.music-button {
  padding: 10px 16px;
  border: 0;
  border-radius: 7px;
  background: #512b4a;
  color: #fffaf3;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.music-button:hover {
  background: #6b3a61;
}

@media (max-width: 500px) {
  .music-controls {
    align-items: flex-start;
    flex-direction: column;
  }
}




/* Selectable story paragraphs */
.story-paragraph {
  display: block;
  width: 100%;
  margin: 0 0 18px;
  padding: 5px 9px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  font: inherit;
  line-height: inherit;
  text-align: left;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  cursor: pointer;
  transition: background 0.2s ease;
}

.story-paragraph:hover {
  background: #f5edf2;
}

.story-paragraph.paragraph-selected {
  background: #eee1eb;
  color: #512b4a;
  box-shadow: inset 3px 0 0 #79516f;
}

/* Quote sharing panel */
.quote-share-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-top: 25px;
  padding: 18px;
  border: 1px solid #e6d7e2;
  border-radius: 10px;
  background: #f8f1f6;
}

.selected-quote-preview {
  min-width: 0;
}

.quote-label {
  color: #916b49;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.selected-quote-preview p {
  margin: 8px 0 0;
  color: #512b4a;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 15px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.share-quote-button {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 0;
  border-radius: 8px;
  background: #512b4a;
  color: #fffaf3;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.share-quote-button:hover {
  background: #6b3a61;
}

@media (max-width: 500px) {
  .quote-share-panel {
    align-items: stretch;
    flex-direction: column;
  }

  .share-quote-button {
    justify-content: center;
  }
}

.story-paragraph-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 18px;
}

.story-paragraph {
  display: block;
  width: 100%;
  padding: 5px 9px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  font: inherit;
  line-height: inherit;
  text-align: left;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  cursor: pointer;
  transition: background 0.2s ease;
}

.story-paragraph:hover {
  background: #f5edf2;
}

.story-paragraph.paragraph-selected {
  background: #eee1eb;
  color: #512b4a;
  box-shadow: inset 3px 0 0 #79516f;
}

/* Small sharing button directly below the selected paragraph */
.inline-share-quote {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin: 5px 0 0 9px;
  padding: 7px 12px;
  border: 1px solid #e6d7e2;
  border-radius: 20px;
  background: #f8f1f6;
  color: #512b4a;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.inline-share-quote:hover {
  background: #512b4a;
  color: #fffaf3;
}
</style>
