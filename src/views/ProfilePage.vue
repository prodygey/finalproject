
<template>
  <ion-page>
    <ion-content :fullscreen="true" class="profile-content">
      <div class="profile-container">

        <!-- Profile header -->
        <header class="profile-header">
          <div class="profile-heading">
            <p class="eyebrow">YOUR SPACE</p>
            <h1>My Profile</h1>
            <p class="subtitle">Your reading and writing journey in one place.</p>
          </div>

          <ion-button fill="clear" class="refresh-button" @click="goToFeed">
            <ion-icon :icon="arrowBackCircleOutline" slot="start" />
            Go Back
          </ion-button>
        </header>

        <!-- User information -->
        <section class="user-card">
          <div class="avatar">
            {{ userInitial }}
          </div>

          <div class="user-details">
            <h2>{{ user?.username || 'BookNest User' }}</h2>
            <p>{{ user?.email || 'No email available' }}</p>
            <span class="role-label">Reader & Writer</span>
          </div>
        </section>

        <!-- Books section -->
        <section class="books-section">
          <div class="section-heading">
            <div>
              <p class="eyebrow">YOUR COLLECTION</p>
              <h2>My Books</h2>
              <p class="section-description">
                Manage the stories you have created.
              </p>
            </div>

            <ion-button class="write-button" @click="router.push('/write')">
              <ion-icon :icon="addOutline" slot="start" />
              Write a Book
            </ion-button>
          </div>

          <div v-if="loading" class="message-state">
            <ion-spinner name="crescent" />
            <p>Loading your books...</p>
          </div>

          <div v-else-if="errorMessage" class="message-state error-state">
            <ion-icon :icon="alertCircleOutline" />
            <p>{{ errorMessage }}</p>
            <ion-button fill="outline" @click="loadBooks">
              Try Again
            </ion-button>
          </div>

          <div v-else-if="books.length === 0" class="empty-state">
            <ion-icon :icon="bookOutline" />
            <h3>No books yet</h3>
            <p>
              You haven't written a book yet. Start creating your first story!
            </p>
            <ion-button @click="router.push('/write')">
              Start Writing
            </ion-button>
          </div>

          <div v-else class="books-grid">
            <article
              v-for="book in books"
              :key="book.id"
              class="book-card"
            >
              <div class="cover-wrapper">
                <img
                  v-if="book.cover_url"
                  :src="book.cover_url"
                  :alt="book.title + ' cover'"
                  class="book-cover"
                />

                <div v-else class="cover-placeholder">
                  <ion-icon :icon="bookOutline" />
                  <span>BookNest</span>
                </div>

                <span
                  class="status-label"
                  :class="book.status === 'published' ? 'published' : 'draft'"
                >
                  {{ book.status || 'draft' }}
                </span>
              </div>

              <div class="book-information">
                <p class="book-genre">{{ book.genre || 'Uncategorized' }}</p>
                <h3>{{ book.title }}</h3>

                <p class="book-description">
                  {{ book.description || 'No description provided.' }}
                </p>

                <div class="book-meta">
                  <span>
                    <ion-icon :icon="documentTextOutline" />
                    {{ book.chapter_count }} chapters
                  </span>
                </div>

                <div class="book-actions">
                  <ion-button
                    v-if="book.status === 'published'"
                    fill="outline"
                    class="read-button"
                    @click="router.push(`/books/${book.id}`)"
                  >
                    Read
                  </ion-button>

                  <ion-button
                    class="manage-button"
                    @click="manageBook(book.id)"
                  >
                    Manage
                  </ion-button>


                                 <button type="button" class="delete-button" @click="deleteBook(book.id)">
                                        <ion-icon :icon="trashOutline" />
                                        Delete
                                    </button>
              
                </div>
              </div>
            </article>
          </div>
        </section>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner,
  onIonViewWillEnter,
} from '@ionic/vue';

import {
  addOutline,
  alertCircleOutline,
  arrowBackCircleOutline,
  bookOutline,
  documentTextOutline,
  refreshOutline,
  trashOutline,
} from 'ionicons/icons';

import { apiRequest } from '../services/api';
import { getSessionUser, getToken } from '../services/session';

// Purpose: Access the application's router.
const router = useRouter();

// Purpose: Define the structure of a book returned by GET /books/mine.
type Book = {
  id: number;
  title: string;
  description: string | null;
  cover_url: string | null;
  genre: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  chapter_count: number;
};

// Purpose: Store the logged-in user's information.
const user = ref(getSessionUser());

// Purpose: Store the books belonging to the logged-in user.
const books = ref<Book[]>([]);

// Purpose: Track the loading and error states.
const loading = ref(false);
const errorMessage = ref('');

// Purpose: Display the first letter of the username in the avatar.
const userInitial = computed(() => {
  return user.value?.username?.charAt(0).toUpperCase() || 'U';

});



function goToFeed() {
  router.push('/feed');
}


// Purpose: Delete a book owned by the currently logged-in user.
async function deleteBook(bookId: number) {
  const confirmed = window.confirm(
    'Are you sure you want to delete this book? This action cannot be undone.'
  );

  if (!confirmed) return;

  try {
    const token = getToken();

    if (!token) {
      throw new Error('You are not logged in.');
    }

    await apiRequest(`/books/${bookId}`, {
      method: 'DELETE',
      token,
    });

    // Refresh the book list after successful deletion.
    await loadBooks();

  } catch (error) {
    alert(
      error instanceof Error
        ? error.message
        : 'Could not delete this book.'
    );
  }
}




// Purpose: Request the logged-in user's books from Express.
async function loadBooks() {
  const token = getToken();

  if (!token) {
    errorMessage.value = 'Please log in to view your profile.';
    books.value = [];
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    const result = await apiRequest<{ books: Book[] }>('/books/mine', {
      token,
    });

    books.value = result.books || [];
    user.value = getSessionUser();
  } catch (error) {
    console.error('Load profile books error:', error);
    errorMessage.value =
      error instanceof Error ? error.message : 'Could not load your books.';
  } finally {
    loading.value = false;
  }
}

// Purpose: Open the book management page.
// The edit mode will be added to WriteBookPage.vue in the next step.
function manageBook(bookId: number) {
  router.push({
    path: '/write',
    query: { edit: String(bookId) },
  });
}

// Purpose: Reload the user's books whenever the Profile page is opened.
onIonViewWillEnter(() => {
  loadBooks();
});
</script>

<style scoped>
.profile-content {
  --background: var(--bn-paper, #f8f4ed);
  --color: var(--bn-ink, #30232e);
}

.profile-container {
  width: 100%;
  max-width: 1150px;
  margin: 0 auto;
  padding: 42px 28px 70px;
}

.profile-header,
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--bn-plum, #70435f);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
}

.profile-heading h1,
.section-heading h2 {
  margin: 0;
  color: var(--bn-ink, #30232e);
  font-family: Georgia, serif;
  font-weight: 600;
}

.profile-heading h1 {
  font-size: 38px;
}

.subtitle,
.section-description {
  margin: 9px 0 0;
  color: #817780;
  font-size: 14px;
}

.refresh-button {
  --color: var(--bn-plum, #70435f);
  text-transform: none;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 32px;
  padding: 25px;
  border: 1px solid var(--bn-border, #e8dfd8);
  border-radius: 16px;
  background: #fffdf9;
}

.avatar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--bn-plum, #70435f);
  color: white;
  font-family: Georgia, serif;
  font-size: 30px;
}

.user-details h2 {
  margin: 0;
  color: var(--bn-ink, #30232e);
  font-family: Georgia, serif;
  font-size: 23px;
}

.user-details p {
  margin: 6px 0 10px;
  color: #817780;
  font-size: 14px;
}

.role-label {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 20px;
  background: #f1e8ef;
  color: var(--bn-plum, #70435f);
  font-size: 11px;
  font-weight: 700;
}

.books-section {
  margin-top: 48px;
}

.section-heading {
  margin-bottom: 24px;
}

.section-heading h2 {
  font-size: 29px;
}

.write-button,
.manage-button {
  --background: var(--bn-plum, #70435f);
  --color: white;
  --border-radius: 9px;
  text-transform: none;
  font-weight: 600;
}

.message-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 220px;
  padding: 30px;
  border: 1px dashed var(--bn-border, #e8dfd8);
  border-radius: 14px;
  color: #817780;
  text-align: center;
}

.message-state ion-spinner {
  color: var(--bn-plum, #70435f);
}

.error-state ion-icon,
.empty-state > ion-icon {
  font-size: 34px;
  color: var(--bn-plum, #70435f);
}

.empty-state h3 {
  margin: 0;
  color: var(--bn-ink, #30232e);
  font-family: Georgia, serif;
  font-size: 22px;
}

.empty-state p,
.message-state p {
  max-width: 360px;
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
}

.empty-state ion-button,
.message-state ion-button {
  --border-radius: 9px;
  --background: var(--bn-plum, #70435f);
  --color: white;
  text-transform: none;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(245px, 1fr));
  gap: 22px;
}

.book-card {
  overflow: hidden;
  border: 1px solid var(--bn-border, #e8dfd8);
  border-radius: 14px;
  background: #fffdf9;
}

.cover-wrapper {
  position: relative;
  height: 190px;
  overflow: hidden;
  background: #eee5e9;
}

.book-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 100%;
  color: var(--bn-plum, #70435f);
}

.cover-placeholder ion-icon {
  font-size: 42px;
}

.cover-placeholder span {
  font-family: Georgia, serif;
  font-size: 15px;
}

.status-label {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 10px;
  border-radius: 20px;
  background: #fffdf9;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.status-label.published {
  color: #326b4a;
}

.status-label.draft {
  color: #916b31;
}

.book-information {
  padding: 18px;
}

.book-genre {
  margin: 0 0 7px;
  color: var(--bn-plum, #70435f);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.book-information h3 {
  overflow: hidden;
  margin: 0;
  color: var(--bn-ink, #30232e);
  font-family: Georgia, serif;
  font-size: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-description {
  display: -webkit-box;
  overflow: hidden;
  min-height: 40px;
  margin: 10px 0;
  color: #817780;
  font-size: 13px;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.book-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #817780;
  font-size: 12px;
}

.book-meta span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.book-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.book-actions ion-button {
  flex: 1;
  margin: 0;
  --border-radius: 8px;
  text-transform: none;
  font-size: 12px;
}

.read-button {
  --color: var(--bn-plum, #70435f);
  --border-color: var(--bn-plum, #70435f);
}

@media (max-width: 600px) {
  .profile-container {
    padding: 28px 17px 50px;
  }

  .profile-heading h1 {
    font-size: 31px;
  }

  .profile-header,
  .section-heading {
    align-items: flex-start;
  }

  .section-heading {
    flex-direction: column;
  }

  .user-card {
    padding: 18px;
  }

  .avatar {
    width: 58px;
    height: 58px;
    font-size: 25px;
  }

  .user-details h2 {
    font-size: 19px;
  }

  .books-grid {
    grid-template-columns: 1fr;
  }
}




.book-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.delete-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px 16px;
  border: 1px solid #b94b5b;
  border-radius: 8px;
  background: transparent;
  color: #b94b5b;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.delete-button:hover {
  background: #b94b5b;
  color: white;
}
</style>
