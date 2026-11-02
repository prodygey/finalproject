import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

import HomePage from '../views/HomePage.vue';
import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';
import FeedPage from '../views/FeedPage.vue';
import BooksPage from '../views/BooksPage.vue';
import ReadBookPage from '../views/ReadBookPage.vue';
import WriteBookPage from '../views/WriteBookPage.vue';
import CommentsPage from '../views/CommentsPage.vue';
import LibraryPage from '../views/LibraryPage.vue';
import AdminPage from '../views/AdminPage.vue';

const routes: Array<RouteRecordRaw> = [
{
  path: '/',
  component: HomePage,
},
{
  path: '/login',
  component: LoginPage,
},
{
  path: '/register',
  component: RegisterPage,
},
{
  path: '/feed',
  component: FeedPage,
},
{
  path: '/books',
  component: BooksPage,
},
{
  path: '/books/:id',
  component: ReadBookPage,
},
{
  path: '/write',
  component: WriteBookPage,
},
{
  path: '/posts/:id/comments',
  component: CommentsPage,
},
{
  path: '/library',
  component: LibraryPage,
},
{
  path: '/admin',
  component: AdminPage,
},
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
