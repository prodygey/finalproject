
<!--
Purpose:
Display the redesigned BookNest login page.
Preserve the existing Express authentication endpoint,
session handling, error messages, and role-based redirects.
-->
<template>
  <ion-page>
    <ion-content :fullscreen="true" class="login-content">
      <div class="login-layout">

        <!-- Editorial welcome panel -->
        <section class="welcome-panel">
          <div class="brand">
            <div class="brand-icon">
              <ion-icon :icon="bookOutline" />
            </div>
            <span>BookNest</span>
          </div>

          <div class="welcome-copy">
            <p class="eyebrow">YOUR NEXT CHAPTER STARTS HERE</p>
            <h1>Every story<br />finds a home.</h1>
            <p class="welcome-description">
              Discover stories, share your imagination, and
              connect with readers who love the same worlds you do.
            </p>

            <div class="book-art" aria-hidden="true">
              <div class="book book-one">
                <span>THE ART OF</span>
                <strong>BEGINNING</strong>
                <ion-icon :icon="flowerOutline" />
              </div>

              <div class="book book-two">
                <ion-icon :icon="moonOutline" />
                <strong>Midnight<br />Stories</strong>
              </div>

              <div class="book book-three">
                <ion-icon :icon="sparklesOutline" />
                <strong>Somewhere<br />Beyond</strong>
              </div>
            </div>
          </div>

          <p class="welcome-footer">
            READ. WRITE. BELONG.
          </p>
        </section>

        <!-- Login form -->
        <section class="form-panel">
          <div class="form-inner">
            <div class="mobile-brand">
              <ion-icon :icon="bookOutline" />
              <span>BookNest</span>
            </div>

            <p class="eyebrow form-eyebrow">WELCOME BACK</p>
            <h2>Let's pick up<br />where you left off.</h2>
            <p class="form-description">
              Sign in to continue your reading journey.
            </p>

            <form @submit.prevent="login">
              <div class="field">
                <label for="login-email">Email address</label>
                <ion-input
                  id="login-email"
                  v-model="email"
                  type="email"
                  placeholder="you@example.com"
                  autocomplete="email"
                  inputmode="email"
                  required
                  class="custom-input"
                />
              </div>

              <div class="field">
                <label for="login-password">Password</label>
                <ion-input
                  id="login-password"
                  v-model="password"
                  type="password"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                  required
                  class="custom-input"
                />
              </div>

              <div v-if="errorMessage" class="error-message" role="alert">
                <ion-icon :icon="alertCircleOutline" />
                <span>{{ errorMessage }}</span>
              </div>

              <ion-button
                expand="block"
                type="submit"
                :disabled="loading"
                class="login-button"
              >
                {{ loading ? 'Signing in...' : 'Sign in to BookNest' }}
                <ion-icon
                  v-if="!loading"
                  slot="end"
                  :icon="arrowForwardOutline"
                />
              </ion-button>
            </form>

            <div class="signup-prompt">
              <span>New to BookNest?</span>
              <router-link to="/register">Create an account</router-link>
            </div>

            <p class="form-footer">
              A little space for every story.
            </p>
          </div>
        </section>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
/*
Purpose:
Import Vue state, navigation, Ionic components and icons.
The existing authentication service and session functions
are retained to avoid breaking the backend connection.
*/
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
  flowerOutline,
  moonOutline,
  sparklesOutline,
  alertCircleOutline,
  arrowForwardOutline,
} from 'ionicons/icons';
import { apiRequest } from '../services/api';
import {
  saveSession,
  type SessionUser,
} from '../services/session';

/*
Purpose:
Track the email, password, loading state, and error message.
*/
const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');
const router = useRouter();

/*
Purpose:
Authenticate with the existing Express endpoint,
save the returned session, and redirect according to role.
*/
async function login() {
  loading.value = true;
  errorMessage.value = '';

  try {
    const result = await apiRequest<{
      token: string;
      user: SessionUser;
    }>('/auth/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value,
      },
    });

    // Preserve the existing session storage behavior.
    saveSession(result.token, result.user);

    // Keep the existing role-based redirect.
    if (result.user.role === 'admin') {
      await router.push('/admin');
    } else {
      await router.push('/feed');
    }
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'Unable to sign in. Please try again.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-content {
  --background: #f8f3eb;
}

.login-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(380px, 0.9fr);
  min-height: 100%;
}

/* Welcome panel */

.welcome-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100vh;
  overflow: hidden;
  padding: 42px clamp(28px, 5vw, 76px) 32px;
  background: #542d46;
  color: #fffaf5;
}

.brand,
.mobile-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.55rem;
  font-weight: 700;
  letter-spacing: -0.04em;
}

.brand-icon {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 35%);
  border-radius: 13px;
  font-size: 23px;
}

.welcome-copy {
  width: 100%;
  max-width: 480px;
  margin: 65px auto 40px;
}

.eyebrow {
  margin-bottom: 18px;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.17em;
}

.welcome-panel .eyebrow {
  color: #e4bfd4;
}

.welcome-copy h1 {
  margin: 0 0 22px;
  color: #fffaf5;
  font-size: clamp(2.8rem, 5vw, 4.6rem);
  font-weight: 500;
  line-height: 1.04;
  letter-spacing: -0.055em;
}

.welcome-description {
  max-width: 390px;
  color: #e6d9e1;
  font-size: 1rem;
  line-height: 1.8;
}

/* Decorative book covers */

.book-art {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  min-height: 190px;
  margin-top: 34px;
  perspective: 700px;
}

.book {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 30%;
  max-width: 148px;
  aspect-ratio: 0.69;
  padding: 12px 8px;
  border: 1px solid rgb(255 255 255 / 28%);
  border-radius: 5px 12px 12px 5px;
  box-shadow: 8px 12px 25px rgb(25 12 23 / 25%);
  text-align: center;
}

.book ion-icon {
  margin: 14px 0;
  font-size: 32px;
}

.book strong {
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(0.8rem, 1.5vw, 1.15rem);
  line-height: 1.3;
}

.book-one {
  background: #d8b7c9;
  color: #542d46;
  transform: rotate(-8deg) translateY(10px);
}

.book-one span {
  font-size: 0.48rem;
  letter-spacing: 0.08em;
}

.book-one strong {
  font-size: clamp(0.65rem, 1.1vw, 0.95rem);
}

.book-two {
  background: #d6d6c1;
  color: #374238;
  transform: translateY(-12px);
}

.book-three {
  background: #e8c6a6;
  color: #75462f;
  transform: rotate(8deg) translateY(9px);
}

.welcome-footer {
  margin: 0;
  color: #d8b7c9;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.19em;
}

/* Login form panel */

.form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px clamp(28px, 5vw, 76px);
  background: #f8f3eb;
}

.form-inner {
  width: 100%;
  max-width: 410px;
}

.mobile-brand {
  display: none;
  margin-bottom: 42px;
  color: #542d46;
}

.mobile-brand ion-icon {
  font-size: 30px;
}

.form-eyebrow {
  margin-bottom: 12px;
  color: #8b6079;
}

.form-inner h2 {
  margin: 0 0 14px;
  color: #542d46;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(2rem, 3.2vw, 3rem);
  font-weight: 500;
  line-height: 1.12;
  letter-spacing: -0.05em;
}

.form-description {
  margin: 0 0 32px;
  color: #786f77;
  line-height: 1.7;
}

.field {
  margin-bottom: 22px;
}

.field label {
  display: block;
  margin-bottom: 9px;
  color: #433540;
  font-size: 0.86rem;
  font-weight: 700;
}

.custom-input {
  --background: #fffdf9;
  --color: #302731;
  --placeholder-color: #a3979e;
  --padding-start: 15px;
  --padding-end: 15px;
  --padding-top: 15px;
  --padding-bottom: 15px;

  min-height: 52px;
  border: 1px solid #e6dcd3;
  border-radius: 12px;
  font-size: 0.95rem;
}

.custom-input.ion-focused {
  border-color: #8b6079;
}

.login-button {
  min-height: 52px;
  margin: 30px 0 0;
  --background: #542d46;
  --background-hover: #3c2032;
  --background-activated: #3c2032;
  --border-radius: 12px;
  font-size: 0.94rem;
  font-weight: 700;
}

.error-message {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 12px;
  padding: 12px;
  border: 1px solid #e7c5cb;
  border-radius: 10px;
  background: #fff0f1;
  color: #a33d50;
  font-size: 0.88rem;
  line-height: 1.5;
}

.error-message ion-icon {
  flex-shrink: 0;
  margin-top: 2px;
  font-size: 19px;
}

.signup-prompt {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  margin-top: 28px;
  color: #786f77;
  font-size: 0.88rem;
}

.signup-prompt a {
  color: #542d46;
  font-weight: 700;
  text-decoration: none;
}

.signup-prompt a:hover {
  text-decoration: underline;
}

.form-footer {
  margin-top: 58px;
  color: #a3979e;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 0.9rem;
  font-style: italic;
  text-align: center;
}

/* Mobile layout */

@media (max-width: 800px) {
  .login-layout {
    display: block;
  }

  .welcome-panel {
    display: none;
  }

  .form-panel {
    min-height: 100vh;
    padding: 36px 24px;
  }

  .mobile-brand {
    display: flex;
    font-size: 1.6rem;
  }

  .form-inner {
    max-width: 440px;
  }

  .form-inner h2 {
    font-size: 2.5rem;
  }

  .form-footer {
    margin-top: 44px;
  }
}

@media (max-width: 380px) {
  .form-panel {
    padding: 28px 18px;
  }

  .form-inner h2 {
    font-size: 2.1rem;
  }
}
</style>
