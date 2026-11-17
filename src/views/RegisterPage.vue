
<!--
  Purpose:
  - Register a normal BookNest reader/writer account.
  - Validate the username, email, and password.
  - Show success or error messages.
  - Redirect to login after successful registration.
-->

<template>
  <ion-page>
    <ion-content :fullscreen="true" class="register-content">
      <div class="register-layout">
        <!-- Left welcome panel -->
        <section class="welcome-panel">
          <router-link to="/login" class="brand">
            <span class="brand-icon">
              <ion-icon :icon="bookOutline" />
            </span>
            <span>BookNest</span>
          </router-link>

          <div class="welcome-copy">
            <p class="eyebrow">YOUR NEXT CHAPTER STARTS HERE</p>

            <h1>
              <span>
                Every great story starts somewhere.</span>
            </h1>

            <p class="welcome-description">
              Create your account to discover new stories, share your own
              writing, and connect with readers who love books as much as you do.
            </p>

            <div class="book-stack" aria-hidden="true">
              <div class="book-cover cover-one">
                <span>THE</span>
                <strong>HIDDEN<br />CHAPTER</strong>
                <small>A STORY WITHIN</small>
              </div>

              <div class="book-cover cover-two">
                <span>BOOKNEST COLLECTION</span>
                <strong>Words<br />Unwritten</strong>
                <small>YOUR STORY MATTERS</small>
              </div>

              <div class="book-cover cover-three">
                <ion-icon :icon="sparklesOutline" />
                <strong>Once<br />Upon a Page</strong>
              </div>
            </div>

            <p class="welcome-note">
              <ion-icon :icon="heartOutline" />
              A little space for your imagination.
            </p>
          </div>

          <p class="panel-footer">READ · WRITE · CONNECT</p>
        </section>

        <!-- Registration form -->
        <section class="form-panel">
          <div class="mobile-brand">
            <span class="brand-icon">
              <ion-icon :icon="bookOutline" />
            </span>
            <span>BookNest</span>
          </div>

          <div class="form-container">
            <p class="eyebrow form-eyebrow">BECOME PART OF THE COMMUNITY</p>

            <h2>Create your account</h2>
            <p class="form-description">
              Join BookNest and make room for more stories.
            </p>

            <form @submit.prevent="register">
              <div class="field-group">
                <label for="username">Username</label>
                <ion-input
                  id="username"
                  v-model="username"
                  class="register-input"
                  placeholder="Choose a username"
                  autocomplete="username"
                  :minlength="3"
                  :maxlength="30"
                  pattern="[A-Za-z0-9_]+"
                  required
                />
                <span class="field-hint">
                  3–30 characters; letters, numbers, and underscores only.
                </span>
              </div>

              <div class="field-group">
                <label for="email">Email address</label>
                <ion-input
                  id="email"
                  v-model="email"
                  class="register-input"
                  placeholder="you@example.com"
                  type="email"
                  autocomplete="email"
                  required
                />
              </div>

              <div class="field-group">
                <label for="password">Password</label>
                <ion-input
                  id="password"
                  v-model="password"
                  class="register-input"
                  placeholder="At least 8 characters"
                  type="password"
                  autocomplete="new-password"
                  :minlength="8"
                  required
                />
                <span class="field-hint">
                  Use at least 8 characters.
                </span>
              </div>

              <div v-if="successMessage" class="message success-message" role="status">
                <ion-icon :icon="checkmarkCircleOutline" />
                <span>{{ successMessage }}</span>
              </div>

              <div v-if="errorMessage" class="message error-message" role="alert">
                <ion-icon :icon="alertCircleOutline" />
                <span>{{ errorMessage }}</span>
              </div>

              <ion-button
                expand="block"
                type="submit"
                class="register-button"
                :disabled="loading"
              >
                {{ loading ? 'Creating account...' : 'Create account' }}
                <ion-icon
                  v-if="!loading"
                  slot="end"
                  :icon="arrowForwardOutline"
                />
              </ion-button>
            </form>

            <p class="login-prompt">
              Already have an account?
              <router-link to="/login">Sign in</router-link>
            </p>

            <p class="form-footer">
              By joining BookNest, you can read, write, and share stories
              with the community.
            </p>
          </div>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonIcon,
} from '@ionic/vue';

import {
  bookOutline,
  sparklesOutline,
  heartOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  arrowForwardOutline,
} from 'ionicons/icons';

import { apiRequest } from '../services/api';

// Registration form fields and messages.
const username = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const router = useRouter();

// Register a normal BookNest account through the backend.
async function register() {
  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    await apiRequest('/auth/register', {
      method: 'POST',
      body: {
        username: username.value.trim(),
        email: email.value.trim(),
        password: password.value,
      },
    });

    successMessage.value =
      'Account created successfully. Redirecting to login...';

    // Wait briefly so the user can read the success message.
    window.setTimeout(() => {
      router.push('/login');
    }, 1200);
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Unable to register.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.register-content {
  --background: #f8f3eb;
}

.register-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(420px, 0.9fr);
  min-height: 100%;
}

/* Left welcome panel */
.welcome-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100%;
  padding: 38px clamp(32px, 5vw, 76px);
  overflow: hidden;
  color: #fffaf6;
  background:
    radial-gradient(circle at 85% 15%, #76506a 0, transparent 35%),
    #542d46;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 11px;
  width: fit-content;
  color: #fffaf6;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.8px;
  text-decoration: none;
}

.brand-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: 1px solid rgb(255 255 255 / 28%);
  border-radius: 14px;
  background: rgb(255 255 255 / 10%);
  font-size: 23px;
}

.welcome-copy {
  width: 100%;
  max-width: 520px;
  margin: 45px auto;
}

.eyebrow {
  margin: 0 0 15px;
  color: #d8b7c9;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
}

.welcome-copy h1 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(36px, 4.1vw, 58px);
  font-weight: 500;
  line-height: 1.12;
  letter-spacing: -1.7px;
}

.welcome-copy h1 span {
  display: block;
  color: #e4c6d5;
  font-style: italic;
}

.welcome-description {
  max-width: 430px;
  margin: 23px 0 0;
  color: #e4d8df;
  font-size: 15px;
  line-height: 1.8;
}

.book-stack {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 36px 0 25px;
  perspective: 800px;
}

.book-cover {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 30%;
  max-width: 145px;
  min-height: 175px;
  padding: 17px 13px;
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 5px 11px 11px 5px;
  box-shadow: 8px 12px 22px rgb(20 8 18 / 25%);
  transform: rotate(-4deg);
}

.book-cover span,
.book-cover small {
  font-size: 7px;
  letter-spacing: 1px;
}

.book-cover strong {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(15px, 1.6vw, 22px);
  line-height: 1.15;
}

.cover-one {
  color: #fff7ed;
  background: #a46d79;
  transform: rotate(-8deg) translateY(10px);
}

.cover-two {
  min-height: 205px;
  color: #f8eee0;
  background: #3c5a50;
  transform: rotate(2deg);
}

.cover-three {
  color: #492b42;
  background: #e2c9d6;
  transform: rotate(8deg) translateY(8px);
}

.cover-three ion-icon {
  font-size: 24px;
}

.welcome-note {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e4d8df;
  font-size: 13px;
}

.welcome-note ion-icon {
  color: #e4c6d5;
  font-size: 17px;
}

.panel-footer {
  margin: 0;
  color: #cdb9c6;
  font-size: 10px;
  letter-spacing: 2px;
}

/* Right form panel */
.form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px clamp(28px, 5vw, 76px);
  background: #f8f3eb;
}

.form-container {
  width: 100%;
  max-width: 420px;
}

.form-eyebrow {
  color: #926780;
}

.form-container h2 {
  margin: 0;
  color: #302731;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(30px, 3vw, 40px);
  font-weight: 500;
  letter-spacing: -1px;
}

.form-description {
  margin: 12px 0 30px;
  color: #786f77;
  font-size: 14px;
  line-height: 1.7;
}

.field-group {
  margin-bottom: 20px;
}

.field-group label {
  display: block;
  margin-bottom: 8px;
  color: #41343f;
  font-size: 13px;
  font-weight: 600;
}

.register-input {
  --background: #fffdf9;
  --color: #302731;
  --placeholder-color: #a59aa2;
  --padding-start: 14px;
  --padding-end: 14px;
  --padding-top: 14px;
  --padding-bottom: 14px;
  min-height: 49px;
  border: 1px solid #e3d9df;
  border-radius: 10px;
  font-size: 14px;
}

.register-input.ion-focused {
  border-color: #926780;
}

.field-hint {
  display: block;
  margin-top: 7px;
  color: #857984;
  font-size: 11px;
  line-height: 1.5;
}

.register-button {
  --background: #542d46;
  --background-hover: #68405a;
  --background-activated: #432239;
  --color: #fffaf6;
  --border-radius: 10px;
  --box-shadow: none;
  height: 49px;
  margin: 27px 0 0;
  font-size: 14px;
  font-weight: 600;
  text-transform: none;
}

.message {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 12px;
  border-radius: 9px;
  font-size: 13px;
  line-height: 1.5;
}

.message ion-icon {
  flex-shrink: 0;
  margin-top: 1px;
  font-size: 18px;
}

.success-message {
  color: #315b46;
  background: #e6f0e7;
}

.error-message {
  color: #923d4b;
  background: #f7e5e7;
}

.login-prompt {
  margin: 25px 0 0;
  color: #786f77;
  font-size: 13px;
  text-align: center;
}

.login-prompt a {
  color: #754761;
  font-weight: 700;
  text-decoration: none;
}

.form-footer {
  margin: 32px 0 0;
  color: #9a8f98;
  font-size: 11px;
  line-height: 1.7;
  text-align: center;
}

.mobile-brand {
  display: none;
}

/* Tablet and mobile layout */
@media (max-width: 900px) {
  .register-layout {
    grid-template-columns: 0.85fr 1fr;
  }

  .welcome-panel {
    padding: 30px;
  }

  .form-panel {
    padding: 38px 28px;
  }

  .book-cover {
    min-height: 145px;
  }

  .cover-two {
    min-height: 170px;
  }
}

@media (max-width: 700px) {
  .register-layout {
    display: block;
  }

  .welcome-panel {
    display: none;
  }

  .form-panel {
    display: block;
    min-height: 100%;
    padding: 28px 23px 40px;
  }

  .mobile-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 45px;
    color: #542d46;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.7px;
  }

  .mobile-brand .brand-icon {
    width: 39px;
    height: 39px;
    border-color: #e3d4df;
    background: #eee3eb;
    color: #542d46;
  }

  .form-container {
    max-width: 440px;
    margin: 0 auto;
  }

  .form-container h2 {
    font-size: 34px;
  }

  .form-description {
    margin-bottom: 27px;
  }
}
</style>
