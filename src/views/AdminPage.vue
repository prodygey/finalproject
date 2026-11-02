
<!--
Purpose:
Display BookNest's administrator dashboard using the cream and plum theme.
Load users, books, and posts independently so one failed request
does not prevent the other sections from displaying.
-->

<template>
  <ion-page>
    <ion-content :fullscreen="true" class="admin-content">
      <div class="admin-shell">

        <!-- Navigation -->
        <header class="topbar">
          <router-link to="/admin" class="brand">
            <span class="brand-icon">
              <ion-icon :icon="bookOutline" />
            </span>
            <span>BookNest<span class="brand-dot">.</span></span>
          </router-link>

          <nav class="navigation">
            

            <router-link to="/admin" class="nav-link active">
              <ion-icon :icon="shieldCheckmarkOutline" />
              <span>Admin</span>
            </router-link>
          </nav>

          <ion-button class="logout-button" fill="clear" @click="logout">
            <ion-icon slot="start" :icon="logOutOutline" />
            Logout
          </ion-button>
        </header>

        <!-- Dashboard introduction -->
        <section class="welcome-section">
          <div>
            <p class="eyebrow">BOOKNEST CONTROL CENTER</p>
            <h1>Good day, <span>Administrator.</span></h1>
            <p class="welcome-description">
              Manage your reading community, review published books,
              and keep the community feed welcoming.
            </p>
          </div>

          <div class="welcome-decoration">
            <ion-icon :icon="shieldCheckmarkOutline" />
          </div>
        </section>

        <!-- General error -->
        <div v-if="errorMessage" class="notice error-notice">
          <ion-icon :icon="alertCircleOutline" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Refresh button -->
        <div class="dashboard-heading">
          <div>
            <h2>Overview</h2>
            <p>Your community at a glance.</p>
          </div>

          <ion-button
            class="refresh-button"
            fill="outline"
            @click="loadDashboard"
            :disabled="loading"
          >
            <ion-icon slot="start" :icon="refreshOutline" />
            {{ loading ? 'Refreshing...' : 'Refresh data' }}
          </ion-button>
        </div>

        <!-- Dashboard statistics -->
        <section class="stats-grid">
          <article class="stat-card">
            <div class="stat-icon users-icon">
              <ion-icon :icon="peopleOutline" />
            </div>
            <p>Total users</p>
            <h3>{{ users.length }}</h3>
            <span class="stat-caption">Registered accounts</span>
          </article>

          <article class="stat-card">
            <div class="stat-icon books-icon">
              <ion-icon :icon="bookOutline" />
            </div>
            <p>Total books</p>
            <h3>{{ books.length }}</h3>
            <span class="stat-caption">Books in the system</span>
          </article>

          <article class="stat-card">
            <div class="stat-icon posts-icon">
              <ion-icon :icon="chatbubblesOutline" />
            </div>
            <p>Total posts</p>
            <h3>{{ posts.length }}</h3>
            <span class="stat-caption">Community discussions</span>
          </article>
        </section>

        <!-- Users -->
        <section class="management-section">
          <div class="section-heading">
            <div>
              <p class="eyebrow">COMMUNITY</p>
              <h2>Registered users</h2>
              <p>Review account information and assigned roles.</p>
            </div>
            <span class="count-badge">{{ users.length }} users</span>
          </div>

          <div v-if="sectionErrors.users" class="notice error-notice">
            <ion-icon :icon="alertCircleOutline" />
            {{ sectionErrors.users }}
          </div>

          <div v-else-if="loading && !users.length" class="empty-state">
            Loading users...
          </div>

          <div v-else-if="!users.length" class="empty-state">
            <ion-icon :icon="peopleOutline" />
            <p>No users found yet.</p>
          </div>

          <div v-else class="table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email address</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id">
                  <td class="username-cell">@{{ user.username }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span
                      class="role-badge"
                      :class="user.role === 'admin' ? 'admin-role' : 'user-role'"
                    >
                      {{ user.role }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Books -->
        <section class="management-section">
          <div class="section-heading">
            <div>
              <p class="eyebrow">LIBRARY</p>
              <h2>Published books</h2>
              <p>Review the books available in BookNest.</p>
            </div>
            
          </div>

          <div v-if="sectionErrors.books" class="notice error-notice">
            <ion-icon :icon="alertCircleOutline" />
            {{ sectionErrors.books }}
          </div>

          <div v-else-if="loading && !books.length" class="empty-state">
            Loading books...
          </div>

          <div v-else-if="!books.length" class="empty-state">
            <ion-icon :icon="bookOutline" />
            <p>No books found yet.</p>
          </div>

          <div v-else class="table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Book title</th>
                  <th>Author</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="book in books" :key="book.id">
                  <td class="username-cell">{{ book.title }}</td>
                  <td>{{ book.author || 'Unknown author' }}</td>
                  <td>
                    <span class="status-badge">
                      {{ book.status || 'Not specified' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Community posts -->
        <section class="management-section last-section">
          <div class="section-heading">
            <div>
              <p class="eyebrow">COMMUNITY CARE</p>
              <h2>Community posts</h2>
              <p>Review posts and remove inappropriate content.</p>
            </div>
            <span class="count-badge">{{ posts.length }} posts</span>
          </div>

          <div v-if="sectionErrors.posts" class="notice error-notice">
            <ion-icon :icon="alertCircleOutline" />
            {{ sectionErrors.posts }}
          </div>

          <div v-else-if="loading && !posts.length" class="empty-state">
            Loading posts...
          </div>

          <div v-else-if="!posts.length" class="empty-state">
            <ion-icon :icon="chatbubblesOutline" />
            <p>No community posts found yet.</p>
          </div>

          <div v-else class="posts-grid">
            <article
              v-for="post in posts"
              :key="post.id"
              class="post-card"
            >
              <div class="post-author">
                <div class="avatar">
                  {{ (post.username || 'U').charAt(0).toUpperCase() }}
                </div>
                <div>
                  <strong>@{{ post.username || 'Unknown user' }}</strong>
                  <span>Community post</span>
                </div>
              </div>

              <p class="post-content">{{ post.content }}</p>

              <div class="post-actions">
                <span class="post-id">Post #{{ post.id }}</span>
                <ion-button
                  class="remove-button"
                  fill="clear"
                  color="danger"
                  @click="deletePost(post.id)"
                  :disabled="deletingPostId === post.id"
                >
                  <ion-icon slot="start" :icon="trashOutline" />
                  {{
                    deletingPostId === post.id
                      ? 'Removing...'
                      : 'Remove post'
                  }}
                </ion-button>
              </div>
            </article>
          </div>
        </section>

        <footer class="page-footer">
          <span>BookNest Admin</span>
          <span>Helping stories find their readers.</span>
        </footer>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
/*
Purpose:
Import Vue tools, Ionic components, icons, and existing API/session helpers.
*/
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
} from '@ionic/vue';

import {
  bookOutline,
  newspaperOutline,
  compassOutline,
  libraryOutline,
  createOutline,
  shieldCheckmarkOutline,
  logOutOutline,
  alertCircleOutline,
  refreshOutline,
  peopleOutline,
  chatbubblesOutline,
  arrowForwardOutline,
  trashOutline,
} from 'ionicons/icons';

import { apiRequest } from '../services/api';
import { clearSession, getToken } from '../services/session';

const router = useRouter();

/*
Purpose:
Describe the data returned by the backend.
*/
type AdminUser = {
  id: number | string;
  username: string;
  email: string;
  role: string;
};

type AdminBook = {
  id: number | string;
  title: string;
  author?: string;
  status?: string;
};

type AdminPost = {
  id: number | string;
  username?: string;
  content: string;
};

/*
Purpose:
Store dashboard data and loading/error states.
*/
const users = ref<AdminUser[]>([]);
const books = ref<AdminBook[]>([]);
const posts = ref<AdminPost[]>([]);

const errorMessage = ref('');
const loading = ref(false);
const deletingPostId = ref<number | string | null>(null);

const sectionErrors = reactive({
  users: '',
  books: '',
  posts: '',
});

/*
Purpose:
Load each dashboard section independently.
*/
async function loadDashboard() {
  const token = getToken();

  if (!token) {
    errorMessage.value = 'Please log in to your administrator account.';
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  sectionErrors.users = '';
  sectionErrors.books = '';
  sectionErrors.posts = '';

  try {
    const result = await apiRequest<{ users: AdminUser[] }>(
      '/admin/users',
      { token }
    );
    users.value = result.users ?? [];
  } catch (error) {
    sectionErrors.users =
      error instanceof Error ? error.message : 'Could not load users.';
  }

  try {
    const result = await apiRequest<{ books: AdminBook[] }>(
      '/admin/books',
      { token }
    );
    books.value = result.books ?? [];
  } catch (error) {
    sectionErrors.books =
      error instanceof Error ? error.message : 'Could not load books.';
  }

  try {
    const result = await apiRequest<{ posts: AdminPost[] }>(
      '/admin/posts',
      { token }
    );
    posts.value = result.posts ?? [];
  } catch (error) {
    sectionErrors.posts =
      error instanceof Error ? error.message : 'Could not load posts.';
  }

  loading.value = false;
}

/*
Purpose:
Confirm and remove a post using the existing admin endpoint.
*/
async function deletePost(id: number | string) {
  const token = getToken();

  if (!token) {
    errorMessage.value = 'Please log in again.';
    return;
  }

  if (!window.confirm('Are you sure you want to remove this post?')) {
    return;
  }

  deletingPostId.value = id;
  errorMessage.value = '';

  try {
    await apiRequest(`/admin/posts/${id}`, {
      method: 'DELETE',
      token,
    });

    posts.value = posts.value.filter((post) => post.id !== id);
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Could not remove post.';
  } finally {
    deletingPostId.value = null;
  }
}

/*
Purpose:
Clear the login session and return to the login page.
*/
function logout() {
  clearSession();
  router.replace('/login');
}

/*
Purpose:
Load dashboard information when the page opens.
*/
onMounted(loadDashboard);
</script>

<style scoped>
.admin-content {
  --background: #f8f4ec;
  --padding-top: 0;
  --padding-bottom: 0;
  --padding-start: 0;
  --padding-end: 0;
  color: #302333;
  font-family: Georgia, 'Times New Roman', serif;
}

.admin-shell {
  width: min(1200px, 100%);
  margin: 0 auto;
  padding: 0 34px 28px;
}

.topbar {
  min-height: 82px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 22px;
  border-bottom: 1px solid #e7ded2;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #472640;
  text-decoration: none;
  font-size: 23px;
  font-weight: 700;
  white-space: nowrap;
}

.brand-icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 12px;
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
  gap: 5px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 11px;
  border-radius: 10px;
  color: #766a75;
  text-decoration: none;
  font-family: Arial, sans-serif;
  font-size: 13px;
  white-space: nowrap;
}

.nav-link ion-icon {
  font-size: 17px;
}

.nav-link:hover,
.nav-link.active {
  background: #eee5ec;
  color: #512b4d;
}

.logout-button {
  --color: #704d66;
  font-family: Arial, sans-serif;
  font-size: 13px;
  white-space: nowrap;
}

.welcome-section {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-top: 36px;
  padding: 36px;
  overflow: hidden;
  border-radius: 22px;
  background: #492b47;
  color: #fff8ee;
}

.eyebrow {
  margin: 0 0 10px;
  color: #a37b99;
  font-family: Arial, sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
}

.welcome-section .eyebrow {
  color: #dfb9ca;
}

.welcome-section h1 {
  margin: 0;
  font-size: clamp(27px, 4vw, 40px);
  line-height: 1.2;
  color : #fff8ee;
}

.welcome-section h1 span {
  color: #e4b7c7;
}

.welcome-description {
  max-width: 570px;
  margin: 13px 0 0;
  color: #e5d6e0;
  font-family: Arial, sans-serif;
  font-size: 14px;
  line-height: 1.8;
}

.welcome-decoration {
  width: 112px;
  height: 112px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border: 1px solid #866580;
  border-radius: 50%;
  background: #593653;
  color: #f0c8d6;
  font-size: 54px;
}

.dashboard-heading,
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.dashboard-heading {
  margin: 32px 0 17px;
}

.dashboard-heading h2,
.section-heading h2 {
  margin: 0;
  color: #382538;
  font-size: 25px;
}

.dashboard-heading p,
.section-heading p:not(.eyebrow) {
  margin: 7px 0 0;
  color: #82747e;
  font-family: Arial, sans-serif;
  font-size: 13px;
  line-height: 1.6;
}

.refresh-button {
  --color: #512b4d;
  --border-color: #cdb9ca;
  --border-radius: 10px;
  font-family: Arial, sans-serif;
  font-size: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 17px;
}

.stat-card {
  padding: 23px;
  border: 1px solid #ece3d9;
  border-radius: 17px;
  background: #fffdf8;
}

.stat-icon {
  width: 43px;
  height: 43px;
  display: grid;
  place-items: center;
  margin-bottom: 20px;
  border-radius: 13px;
  font-size: 22px;
}

.users-icon {
  background: #f0e5ee;
  color: #6a4266;
}

.books-icon {
  background: #f7ead7;
  color: #9b6d35;
}

.posts-icon {
  background: #e8eee4;
  color: #5e7758;
}

.stat-card p {
  margin: 0;
  color: #81747d;
  font-family: Arial, sans-serif;
  font-size: 13px;
}

.stat-card h3 {
  margin: 8px 0;
  color: #422b40;
  font-size: 35px;
}

.stat-caption {
  color: #a2969c;
  font-family: Arial, sans-serif;
  font-size: 11px;
}

.management-section {
  margin-top: 34px;
  padding: 26px;
  border: 1px solid #e9dfd5;
  border-radius: 18px;
  background: #fffdf8;
}

.section-heading {
  margin-bottom: 22px;
}

.section-heading h2 {
  font-size: 22px;
}

.count-badge,
.role-badge,
.status-badge {
  display: inline-block;
  padding: 7px 11px;
  border-radius: 20px;
  background: #f0e7ee;
  color: #684663;
  font-family: Arial, sans-serif;
  font-size: 11px;
  white-space: nowrap;
}

.role-badge {
  text-transform: capitalize;
}

.admin-role {
  background: #e9d8e6;
  color: #65365e;
}

.user-role {
  background: #e8eee3;
  color: #4e6a48;
}

.status-badge {
  background: #f4eadb;
  color: #866332;
  text-transform: capitalize;
}

.table-wrap {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-family: Arial, sans-serif;
  font-size: 13px;
}

.admin-table th {
  padding: 13px 14px;
  border-bottom: 1px solid #e9dfd5;
  color: #91818b;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.admin-table td {
  padding: 16px 14px;
  border-bottom: 1px solid #f0e9e1;
  color: #796d77;
}

.admin-table tbody tr:last-child td {
  border-bottom: none;
}

.username-cell {
  color: #422b40 !important;
  font-weight: 700;
}

.text-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #704667;
  font-family: Arial, sans-serif;
  font-size: 12px;
  text-decoration: none;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 15px;
}

.post-card {
  min-width: 0;
  padding: 19px;
  border: 1px solid #eee4db;
  border-radius: 14px;
  background: #fffaf4;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 11px;
}

.avatar {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 50%;
  background: #eadce8;
  color: #573451;
  font-size: 16px;
  font-weight: 700;
}

.post-author strong,
.post-author span {
  display: block;
  overflow-wrap: anywhere;
  font-family: Arial, sans-serif;
}

.post-author strong {
  color: #493346;
  font-size: 12px;
}

.post-author span {
  margin-top: 4px;
  color: #9b8b95;
  font-size: 10px;
}

.post-content {
  margin: 17px 0;
  color: #655763;
  font-family: Arial, sans-serif;
  font-size: 13px;
  line-height: 1.8;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.post-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid #eee4db;
}

.post-id {
  color: #a0919a;
  font-family: Arial, sans-serif;
  font-size: 10px;
}

.remove-button {
  --color: #a74f5b;
  font-family: Arial, sans-serif;
  font-size: 11px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 120px;
  padding: 20px;
  border: 1px dashed #dfd2dc;
  border-radius: 12px;
  color: #897887;
  font-family: Arial, sans-serif;
  font-size: 13px;
  text-align: center;
}

.empty-state ion-icon {
  font-size: 27px;
}

.empty-state p {
  margin: 0;
}

.notice {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin: 15px 0;
  padding: 13px 15px;
  border-radius: 10px;
  font-family: Arial, sans-serif;
  font-size: 13px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.error-notice {
  background: #f9e8e6;
  color: #9a3f43;
}

.last-section {
  margin-bottom: 30px;
}

.page-footer {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  padding: 20px 0 10px;
  color: #9a8b94;
  font-family: Arial, sans-serif;
  font-size: 11px;
}

@media (max-width: 1000px) {
  .topbar {
    flex-wrap: wrap;
    padding: 17px 0;
  }

  .navigation {
    order: 3;
    width: 100%;
    flex-wrap: wrap;
  }

  .nav-link {
    padding: 9px;
  }
}

@media (max-width: 650px) {
  .admin-shell {
    padding: 0 16px 22px;
  }

  .welcome-section {
    margin-top: 22px;
    padding: 25px 22px;
  }

  .welcome-decoration {
    display: none;
  }

  .stats-grid,
  .posts-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 19px;
  }

  .stat-icon {
    margin-bottom: 12px;
  }

  .management-section {
    padding: 18px 14px;
  }

  .section-heading {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .dashboard-heading {
    align-items: flex-start;
  }

  .dashboard-heading h2 {
    font-size: 23px;
  }

  .refresh-button {
    font-size: 10px;
  }

  .logout-button {
    margin-left: auto;
  }

  .page-footer {
    flex-direction: column;
  }
}
</style>
