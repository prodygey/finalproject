
<!--
  Purpose:
  Create a book as a draft or published work.
  Add chapters to the created book.
  Keep the created book ID for subsequent chapter creation.
-->
<template>
  <ion-page>
    <ion-content :fullscreen="true" class="write-page">
      <!-- Navigation -->
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
          <button class="nav-link active">Write</button>
          <button class="nav-link" @click="goToLibrary">My Library</button>
        </nav>
      </header>

      <main class="page-container">
        <!-- Page introduction -->
        <section class="page-intro">
          <span class="eyebrow">
            <ion-icon :icon="createOutline" />
            YOUR WRITING SPACE
          </span>

          <h1>Every story starts <em>somewhere.</em></h1>

          <p>
            Create a new book, shape your chapters, and share your imagination
            with the BookNest community.
          </p>
        </section>

        <!-- Progress steps -->
        <div class="writing-steps">
          <div class="step" :class="{ 'step-active': !createdBookId }">
            <span class="step-number">
              <ion-icon v-if="createdBookId" :icon="checkmarkOutline" />
              <template v-else>01</template>
            </span>
            <span>Book details</span>
          </div>

          <span class="step-line"></span>

          <div class="step" :class="{ 'step-active': !!createdBookId }">
            <span class="step-number">02</span>
            <span>Write chapters</span>
          </div>
        </div>

        <!-- Feedback messages -->
        <div v-if="message" class="feedback success-message">
          <ion-icon :icon="checkmarkCircleOutline" />
          <span>{{ message }}</span>
        </div>

        <div v-if="errorMessage" class="feedback error-message">
          <ion-icon :icon="alertCircleOutline" />
          <span>{{ errorMessage }}</span>
        </div>

        <div class="writing-layout">
          <!-- Book details form -->
          <section class="form-card">
            <div class="card-heading">
              <div class="heading-icon">
                <ion-icon :icon="bookOutline" />
              </div>
              <div>
                <span class="eyebrow">STEP 01</span>
                <h2>Book details</h2>
                <p>Give your story its identity.</p>
              </div>
            </div>

            <form @submit.prevent="createBook">
              <div class="field-group">
                <label for="book-title">Book title <span>*</span></label>
                <ion-input
                  id="book-title"
                  v-model="title"
                  placeholder="Enter your book title"
                  fill="outline"
                  required
                  :disabled="!!createdBookId || loading"
                />
              </div>

              <div class="field-group">
                <label for="book-description">Description</label>
                <ion-textarea
                  id="book-description"
                  v-model="description"
                  placeholder="What is your story about?"
                  fill="outline"
                  :auto-grow="true"
                  :rows="4"
                  :disabled="!!createdBookId || loading"
                />
                <span class="field-hint">
                  Give readers a reason to open your book.
                </span>
              </div>

              <div class="field-group">
                <label for="book-genre">Genre</label>
                <ion-input
                  id="book-genre"
                  v-model="genre"
                  placeholder="e.g. Romance, Fantasy, Mystery"
                  fill="outline"
                  :disabled="!!createdBookId || loading"
                />
              </div>

              <div class="field-group">
                <label for="book-status">Publication status</label>
                <ion-select
                  id="book-status"
                  v-model="status"
                  fill="outline"
                  interface="popover"
                  :disabled="!!createdBookId || loading"
                >
                  <ion-select-option value="draft">Draft — Only for editing</ion-select-option>
                  <ion-select-option value="published">Published — Available to readers</ion-select-option>
                </ion-select>
                <span class="field-hint">
                  Choose draft if your story isn't ready to publish.
                </span>
              </div>

              <div v-if="createdBookId" class="created-notice">
                <ion-icon :icon="checkmarkCircleOutline" />
                <div>
                  <strong>Book created successfully</strong>
                  <span>Book ID: {{ createdBookId }}</span>
                  <p>Your book details are locked on this screen so you can add chapters.</p>
                </div>
              </div>

              <button
                v-if="!createdBookId"
                type="submit"
                class="primary-button full-button"
                :disabled="loading || !title.trim()"
              >
                <ion-spinner v-if="loading" name="crescent" />
                <template v-else>
                  Create book
                  <ion-icon :icon="arrowForwardOutline" />
                </template>
              </button>

              <button
                v-else
                type="button"
                class="secondary-button full-button"
                @click="startNewBook"
              >
                <ion-icon :icon="addOutline" />
                Start another book
              </button>
            </form>
          </section>

          <!-- Chapter writing form -->
          <section class="form-card chapter-card">
            <div class="card-heading">
              <div class="heading-icon chapter-heading-icon">
                <ion-icon :icon="createOutline" />
              </div>
              <div>
                <span class="eyebrow">STEP 02</span>
                <h2>Write a chapter</h2>
                <p>Bring your story to life, one chapter at a time.</p>
              </div>
            </div>

            <div v-if="!createdBookId" class="chapter-locked">
              <div class="lock-icon">
                <ion-icon :icon="lockClosedOutline" />
              </div>
              <h3>Your writing space awaits</h3>
              <p>
                Create your book first. Once it's saved, you can add your
                first chapter here.
              </p>
            </div>

            <form v-else @submit.prevent="createChapter">
              <div class="chapter-book-banner">
                <ion-icon :icon="bookOutline" />
                <div>
                  <span>ADDING CHAPTER TO</span>
                  <strong>{{ title }}</strong>
                </div>
              </div>

              <div class="chapter-fields">
                <div class="field-group chapter-number-field">
                  <label for="chapter-number">Chapter number <span>*</span></label>
                  <ion-input
                    id="chapter-number"
                    v-model.number="chapterNumber"
                    type="number"
                    min="1"
                    fill="outline"
                    required
                  />
                </div>

                <div class="field-group chapter-title-field">
                  <label for="chapter-title">Chapter title <span>*</span></label>
                  <ion-input
                    id="chapter-title"
                    v-model="chapterTitle"
                    placeholder="Give this chapter a title"
                    fill="outline"
                    required
                  />
                </div>
              </div>

              <div class="field-group">
                <div class="content-label-row">
                  <label for="chapter-content">Chapter content <span>*</span></label>
                  <span class="word-count">{{ wordCount }} words</span>
                </div>

                <ion-textarea
                  id="chapter-content"
                  v-model="chapterContent"
                  placeholder="Start writing your story here...

Let the words flow. You can add dialogue, descriptions, and the moments that make your story yours."
                  fill="outline"
                  :auto-grow="true"
                  :rows="12"
                  required
                />

                <span class="field-hint">
                  Tip: Use paragraph breaks to make your story easier to read.
                </span>
              </div>

              <button
                type="submit"
                class="primary-button full-button"
                :disabled="savingChapter || !chapterTitle.trim() || !chapterContent.trim() || chapterNumber < 1"
              >
                <ion-spinner v-if="savingChapter" name="crescent" />
                <template v-else>
                  <ion-icon :icon="saveOutline" />
                  Save chapter
                </template>
              </button>

              <p class="chapter-note">
                <ion-icon :icon="informationCircleOutline" />
                Saving a chapter adds it to your book. Your backend controls
                whether draft chapters are visible to readers.
              </p>
            </form>
          </section>
        </div>

        <!-- Writing reminder -->
        <aside class="writing-quote">
          <span class="quote-mark">“</span>
          <p>A story is a little world waiting to be discovered.</p>
          <span class="quote-caption">A NOTE FROM BOOKNEST</span>
        </aside>
      </main>

      <footer class="site-footer">
        <span class="footer-brand">BookNest</span>
        <span>A little space for every story.</span>
      </footer>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonIcon,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonSpinner,
} from '@ionic/vue';
import {
  bookOutline,
  createOutline,
  checkmarkOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  arrowForwardOutline,
  addOutline,
  lockClosedOutline,
  saveOutline,
  informationCircleOutline,
} from 'ionicons/icons';
import { apiRequest } from '../services/api';
import { getToken } from '../services/session';

const router = useRouter();

// Book information fields.
const title = ref('');
const description = ref('');
const genre = ref('');
const status = ref<'draft' | 'published'>('draft');

// Keep the created book ID for chapter creation.
const createdBookId = ref<number | null>(null);

// Chapter fields.
const chapterNumber = ref(1);
const chapterTitle = ref('');
const chapterContent = ref('');

// Page status and feedback.
const loading = ref(false);
const savingChapter = ref(false);
const message = ref('');
const errorMessage = ref('');

// Count words in the chapter editor.
const wordCount = computed(() => {
  const content = chapterContent.value.trim();
  return content ? content.split(/\s+/).length : 0;
});

// Navigate to the feed.
function goToFeed() {
  router.push('/feed');
}

// Navigate to Discover.
function goToDiscover() {
  router.push('/books');
}

// Navigate to the user's library.
function goToLibrary() {
  router.push('/library');
}

// Require a valid login token before writing.
function requireToken(): string {
  const token = getToken();

  if (!token) {
    throw new Error('Please sign in before creating a book or chapter.');
  }

  return token;
}

// Create the book using the existing API endpoint.
async function createBook() {
  if (!title.value.trim()) {
    errorMessage.value = 'Please enter a book title.';
    return;
  }

  loading.value = true;
  message.value = '';
  errorMessage.value = '';

  try {
    const result = await apiRequest<{
      book: { id: number; title: string };
    }>('/books', {
      method: 'POST',
      token: requireToken(),
      body: {
        title: title.value.trim(),
        description: description.value.trim(),
        genre: genre.value.trim() || null,
        status: status.value,
      },
    });

    createdBookId.value = result.book.id;
    message.value = `Your book "${result.book.title}" was created. You can now add chapters.`;
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Could not create your book.';
  } finally {
    loading.value = false;
  }
}

// Save a chapter under the book created on this page.
async function createChapter() {
  if (!createdBookId.value) {
    errorMessage.value = 'Create the book before adding a chapter.';
    return;
  }

  if (!chapterTitle.value.trim() || !chapterContent.value.trim()) {
    errorMessage.value = 'Please enter both a chapter title and content.';
    return;
  }

  if (!Number.isInteger(chapterNumber.value) || chapterNumber.value < 1) {
    errorMessage.value = 'Chapter number must be a whole number greater than zero.';
    return;
  }

  savingChapter.value = true;
  message.value = '';
  errorMessage.value = '';

  try {
    await apiRequest(`/books/${createdBookId.value}/chapters`, {
      method: 'POST',
      token: requireToken(),
      body: {
        chapter_number: chapterNumber.value,
        title: chapterTitle.value.trim(),
        content: chapterContent.value,
      },
    });

    message.value = `Chapter ${chapterNumber.value} was saved successfully.`;

    // Prepare the form for the next chapter.
    chapterNumber.value += 1;
    chapterTitle.value = '';
    chapterContent.value = '';
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Could not save this chapter.';
  } finally {
    savingChapter.value = false;
  }
}

// Reset the form so another book can be created.
function startNewBook() {
  createdBookId.value = null;
  title.value = '';
  description.value = '';
  genre.value = '';
  status.value = 'draft';

  chapterNumber.value = 1;
  chapterTitle.value = '';
  chapterContent.value = '';

  message.value = '';
  errorMessage.value = '';
}
</script>

<style scoped>
.write-page {
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

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 0;
  background: transparent;
  color: #512b4a;
  font-family: inherit;
  font-size: 22px;
  font-weight: 800;
  cursor: pointer;
}

.brand-icon {
  width: 38px;
  height: 38px;
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

.page-intro {
  max-width: 720px;
  margin-bottom: 32px;
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

.page-intro h1 {
  margin: 16px 0 12px;
  color: #352535;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 500;
  line-height: 1.15;
}

.page-intro h1 em {
  color: #805c78;
  font-weight: 500;
}

.page-intro > p {
  max-width: 590px;
  margin: 0;
  color: #776675;
  font-size: 15px;
  line-height: 1.8;
}

.writing-steps {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}

.step {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #998b96;
  font-size: 12px;
  font-weight: 600;
}

.step-number {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border: 1px solid #dfd3dc;
  border-radius: 50%;
  color: #8a7885;
  font-size: 11px;
}

.step-active {
  color: #512b4a;
}

.step-active .step-number {
  border-color: #512b4a;
  background: #512b4a;
  color: #fffaf3;
}

.step-line {
  width: 60px;
  height: 1px;
  background: #dfd3dc;
}

.writing-layout {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  align-items: start;
  gap: 24px;
}

.form-card {
  min-width: 0;
  padding: 28px;
  border: 1px solid #e9dfd6;
  border-radius: 13px;
  background: #fffdf8;
  box-shadow: 0 8px 28px #422a3508;
}

.card-heading {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 27px;
}

.heading-icon {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background: #f0e5ed;
  color: #704568;
  font-size: 22px;
}

.chapter-heading-icon {
  background: #f3e9d9;
  color: #98734f;
}

.card-heading h2 {
  margin: 6px 0 5px;
  color: #352535;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 25px;
  font-weight: 500;
}

.card-heading p {
  margin: 0;
  color: #897986;
  font-size: 12px;
  line-height: 1.6;
}

.field-group {
  min-width: 0;
  margin-bottom: 21px;
}

.field-group label {
  display: block;
  margin-bottom: 9px;
  color: #4b3a49;
  font-size: 12px;
  font-weight: 700;
}

.field-group label span {
  color: #a34e59;
}

.field-group ion-input,
.field-group ion-textarea,
.field-group ion-select {
  --background: #fffdf9;
  --color: #392a39;
  --placeholder-color: #a294a0;
  --placeholder-opacity: 1;
  --border-color: #e4d9df;
  --border-radius: 8px;
  --highlight-color-focused: #805c78;
  --padding-start: 13px;
  --padding-end: 13px;
  font-size: 13px;
}

.field-group ion-input,
.field-group ion-select {
  min-height: 47px;
}

.field-group ion-textarea {
  line-height: 1.7;
}

.field-hint {
  display: block;
  margin-top: 7px;
  color: #988995;
  font-size: 10px;
  line-height: 1.5;
}

.primary-button,
.secondary-button {
  min-height: 47px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 18px;
  border: 0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.primary-button {
  background: #512b4a;
  color: #fffaf3;
}

.primary-button:hover:not(:disabled) {
  background: #6b3a61;
}

.primary-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.secondary-button {
  background: #f0e5ed;
  color: #512b4a;
}

.secondary-button:hover {
  background: #e7d5e3;
}

.full-button {
  width: 100%;
  margin-top: 3px;
}

.full-button ion-spinner {
  width: 20px;
  height: 20px;
}

.chapter-locked {
  padding: 38px 22px;
  border: 1px dashed #dfd1d8;
  border-radius: 10px;
  background: #fcf7f3;
  text-align: center;
}

.lock-icon {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  margin: 0 auto 18px;
  border-radius: 50%;
  background: #f0e5ed;
  color: #704568;
  font-size: 23px;
}

.chapter-locked h3 {
  margin: 0 0 9px;
  color: #452e43;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 22px;
  font-weight: 500;
}

.chapter-locked p {
  max-width: 290px;
  margin: 0 auto;
  color: #837481;
  font-size: 12px;
  line-height: 1.8;
}

.chapter-book-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 23px;
  padding: 13px 15px;
  border: 1px solid #e8dce5;
  border-radius: 9px;
  background: #f7eff5;
  color: #704568;
}

.chapter-book-banner > ion-icon {
  font-size: 23px;
}

.chapter-book-banner > div {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.chapter-book-banner span {
  color: #987d92;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 1.4px;
}

.chapter-book-banner strong {
  overflow-wrap: anywhere;
  color: #512b4a;
  font-size: 13px;
}

.chapter-fields {
  display: grid;
  grid-template-columns: 125px minmax(0, 1fr);
  gap: 13px;
}

.content-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.word-count {
  color: #9a8294;
  font-size: 10px;
  white-space: nowrap;
}

.chapter-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 15px 0 0;
  color: #8c7b88;
  font-size: 10px;
  line-height: 1.7;
}

.chapter-note ion-icon {
  flex: 0 0 auto;
  margin-top: 1px;
  color: #98734f;
  font-size: 15px;
}

.created-notice {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #d8e6d6;
  border-radius: 9px;
  background: #f1f7ef;
  color: #426746;
}

.created-notice > ion-icon {
  flex: 0 0 auto;
  font-size: 21px;
}

.created-notice > div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.created-notice strong {
  font-size: 12px;
}

.created-notice span {
  font-size: 11px;
}

.created-notice p {
  margin: 3px 0 0;
  color: #648168;
  font-size: 10px;
  line-height: 1.6;
}

.feedback {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 20px;
  padding: 14px 16px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.6;
}

.feedback ion-icon {
  flex: 0 0 auto;
  margin-top: 1px;
  font-size: 18px;
}

.success-message {
  border: 1px solid #d8e6d6;
  background: #f1f7ef;
  color: #426746;
}

.error-message {
  border: 1px solid #e8c7c7;
  background: #fff0ef;
  color: #923c43;
}

.writing-quote {
  position: relative;
  margin-top: 32px;
  padding: 25px 28px 25px 65px;
  border: 1px solid #e7d8c7;
  border-radius: 10px;
  background: #f1e8dc;
}

.quote-mark {
  position: absolute;
  top: 9px;
  left: 23px;
  color: #b08a62;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 50px;
  line-height: 1;
}

.writing-quote p {
  margin: 0 0 9px;
  color: #57434f;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 19px;
  font-style: italic;
}

.quote-caption {
  color: #9b7e66;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 1.6px;
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

@media (max-width: 950px) {
  .writing-layout {
    grid-template-columns: 1fr;
  }

  .form-card {
    padding: 25px;
  }

  .chapter-fields {
    grid-template-columns: 140px minmax(0, 1fr);
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

  .page-container {
    width: 90%;
    padding-top: 30px;
  }

  .page-intro h1 {
    font-size: 38px;
  }

  .writing-steps {
    gap: 10px;
  }

  .step {
    gap: 6px;
    font-size: 10px;
  }

  .step-number {
    width: 28px;
    height: 28px;
  }

  .step-line {
    width: 25px;
  }

  .form-card {
    padding: 20px 16px;
  }

  .card-heading {
    gap: 10px;
  }

  .card-heading h2 {
    font-size: 23px;
  }

  .chapter-fields {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .writing-quote {
    padding: 25px 20px 25px 55px;
  }

  .quote-mark {
    left: 17px;
  }

  .writing-quote p {
    font-size: 17px;
  }
}

@media (max-width: 390px) {
  .brand {
    gap: 6px;
    font-size: 15px;
  }

  .header-nav {
    gap: 0;
  }

  .nav-link {
    padding: 8px 4px;
    font-size: 9px;
  }
}
</style>
