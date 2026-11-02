
<!--
Purpose:
Introduce BookNest with an editorial-style landing page.
Provide navigation to registration, login, book discovery,
the community feed, and the writing page.
-->

<template>
  <ion-page>
    <ion-content :fullscreen="true" class="home-content">
      <div class="home-shell">

        <!-- Navigation bar -->
        <header class="topbar">
          <router-link to="/home" class="brand">
            <span class="brand-icon">
              <ion-icon :icon="bookOutline" />
            </span>
            <span>BookNest<span class="brand-dot">.</span></span>
          </router-link>

          

          <div class="auth-actions">
            <ion-button
              class="signin-button"
              fill="clear"
              @click="go('/login')"
            >
              Sign in
            </ion-button>

            <ion-button
              class="signup-button"
              @click="go('/register')"
            >
              Get started
              <ion-icon slot="end" :icon="arrowForwardOutline" />
            </ion-button>
          </div>
        </header>

        <!-- Main hero -->
        <main>
          <section class="hero">
            <div class="hero-copy">
              <div class="eyebrow">
                <span class="eyebrow-line"></span>
                YOUR NEXT CHAPTER STARTS HERE
              </div>

              <h1>
                Every story
                <span>finds a home.</span>
              </h1>

              <p class="hero-description">
                Discover stories that stay with you, connect with
                fellow readers, and bring your own imagination to life.
                Your next favorite book is waiting.
              </p>

              <div class="hero-actions">
                <ion-button
                  class="primary-button"
                  @click="go('/register')"
                >
                  Start your journey
                  <ion-icon slot="end" :icon="arrowForwardOutline" />
                </ion-button>

                
              </div>

              <div class="hero-note">
                <ion-icon :icon="heartOutline" />
                <span>A cozy corner for readers and writers.</span>
              </div>
            </div>

            <!-- Decorative book illustration made with CSS -->
            <div class="hero-art">
              <div class="art-sparkle sparkle-one">✦</div>
              <div class="art-sparkle sparkle-two">✧</div>
              <div class="art-circle"></div>

              <div class="book book-back">
                <div class="book-spine"></div>
                <div class="book-back-content">
                  <span>BOOK</span>
                  <span>OF</span>
                  <span>DREAMS</span>
                </div>
              </div>

              <div class="book book-front">
                <div class="book-front-content">
                  <span class="cover-label">A BOOKNEST EDITION</span>
                  <div class="cover-flower">✿</div>
                  <h2>Where<br />Stories<br />Bloom</h2>
                  <span class="cover-author">A WORLD OF IMAGINATION</span>
                </div>
              </div>

              <div class="art-caption">
                <span class="caption-icon">
                  <ion-icon :icon="sparklesOutline" />
                </span>
                <div>
                  <strong>Find your next favorite</strong>
                  <span>One page at a time</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Feature cards -->
          <section class="features-section">
            <div class="section-intro">
              <p class="eyebrow">A WORLD BETWEEN THE COVERS</p>
              <h2>More than just reading.</h2>
              <p>
                A place to discover, create, and share the stories
                that matter to you.
              </p>
            </div>

            <div class="features-grid">
              <article class="feature-card">
                <div class="feature-icon discovery-icon">
                  <ion-icon :icon="compassOutline" />
                </div>
                <p class="feature-number">01 / DISCOVER</p>
                <h3>Find your next read.</h3>
                <p>
                  Explore books from the community and find stories
                  that match your interests.
                </p>
                
              </article>

              <article class="feature-card">
                <div class="feature-icon community-icon">
                  <ion-icon :icon="chatbubblesOutline" />
                </div>
                <p class="feature-number">02 / CONNECT</p>
                <h3>Share the feeling.</h3>
                <p>
                  Talk about your favorite books, share your thoughts,
                  and connect with other readers.
                </p>
                
              </article>

              <article class="feature-card">
                <div class="feature-icon writing-icon">
                  <ion-icon :icon="createOutline" />
                </div>
                <p class="feature-number">03 / CREATE</p>
                <h3>Your words belong here.</h3>
                <p>
                  Turn your ideas into books and chapters that
                  other people can discover and enjoy.
                </p>
                
              </article>
            </div>
          </section>

          <!-- Closing call-to-action -->
          <section class="closing-banner">
            <div>
              <p class="eyebrow">YOUR STORY IS WAITING</p>
              <h2>Ready to turn the page?</h2>
              <p>
                Join BookNest and make room for your next great story.
              </p>
            </div>

            <ion-button
              class="closing-button"
              @click="go('/register')"
            >
              Create your account
              <ion-icon slot="end" :icon="arrowForwardOutline" />
            </ion-button>
          </section>
        </main>

        <!-- Footer -->
        <footer class="footer">
          <router-link to="/home" class="footer-brand">
            <ion-icon :icon="bookOutline" />
            BookNest.
          </router-link>

          <span>Made for the love of stories.</span>

          <div class="footer-links">
            <router-link to="/books">Books</router-link>
            <router-link to="/feed">Community</router-link>
            <router-link to="/login">Sign in</router-link>
          </div>
        </footer>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
// Purpose: Import Ionic components, icons, and router navigation.
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
} from '@ionic/vue';

import { useRouter } from 'vue-router';

import {
  bookOutline,
  arrowForwardOutline,
  compassOutline,
  heartOutline,
  sparklesOutline,
  chatbubblesOutline,
  createOutline,
} from 'ionicons/icons';

// Purpose: Create the router instance.
const router = useRouter();

// Purpose: Navigate to the selected BookNest page.
function go(path: string) {
  router.push(path);
}
</script>

<style scoped>
.home-content {
  --background: #f8f4ec;
  --padding-top: 0;
  --padding-bottom: 0;
  --padding-start: 0;
  --padding-end: 0;
  color: #392738;
  font-family: Georgia, 'Times New Roman', serif;
}

.home-shell {
  width: min(1200px, 100%);
  margin: 0 auto;
  padding: 0 34px;
}

/* Navigation */
.topbar {
  min-height: 84px;
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
  color: #4b2947;
  font-size: 23px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.brand-icon {
  width: 39px;
  height: 39px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: #4b2947;
  color: #fff8ed;
  font-size: 22px;
}

.brand-dot {
  color: #b47a8f;
}

.navigation,
.auth-actions {
  display: flex;
  align-items: center;
  gap: 9px;
}

.nav-link {
  padding: 10px 12px;
  border-radius: 9px;
  color: #796c78;
  font-family: Arial, sans-serif;
  font-size: 13px;
  text-decoration: none;
  white-space: nowrap;
}

.nav-link:hover {
  background: #eee5ec;
  color: #512b4d;
}

.signin-button {
  --color: #573650;
  font-family: Arial, sans-serif;
  font-size: 13px;
}

.signup-button {
  --background: #4b2947;
  --background-hover: #60385a;
  --color: #fff8ef;
  --border-radius: 10px;
  font-family: Arial, sans-serif;
  font-size: 12px;
}

/* Hero */
.hero {
  min-height: 525px;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  align-items: center;
  gap: 45px;
  padding: 55px 0 65px;
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 20px;
  color: #9a718d;
  font-family: Arial, sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
  line-height: 1.6;
}

.eyebrow-line {
  width: 24px;
  height: 1px;
  background: #ad819b;
}

.hero h1 {
  margin: 0;
  color: #382438;
  font-size: clamp(44px, 5.5vw, 70px);
  font-weight: 500;
  letter-spacing: -2.5px;
  line-height: 1.06;
}

.hero h1 span {
  display: block;
  color: #885b7d;
  font-style: italic;
}

.hero-description {
  max-width: 480px;
  margin: 23px 0 27px;
  color: #796d78;
  font-family: Arial, sans-serif;
  font-size: 14px;
  line-height: 1.9;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.primary-button {
  --background: #4b2947;
  --background-hover: #60385a;
  --color: #fff8ef;
  --border-radius: 10px;
  min-height: 48px;
  font-family: Arial, sans-serif;
  font-size: 12px;
}

.secondary-button {
  --color: #563653;
  --border-color: #cbb7c7;
  --border-radius: 10px;
  min-height: 48px;
  font-family: Arial, sans-serif;
  font-size: 12px;
}

.hero-note {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 25px;
  color: #988994;
  font-family: Arial, sans-serif;
  font-size: 11px;
}

.hero-note ion-icon {
  color: #a87591;
  font-size: 17px;
}

/* Decorative book artwork */
.hero-art {
  position: relative;
  min-height: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 24px;
  background: #eee5eb;
}

.art-circle {
  position: absolute;
  width: 310px;
  height: 310px;
  border: 1px solid #d8c2d1;
  border-radius: 50%;
}

.art-circle::before,
.art-circle::after {
  position: absolute;
  content: '';
  border: 1px solid #dccbd8;
  border-radius: 50%;
}

.art-circle::before {
  inset: 20px;
}

.art-circle::after {
  inset: 40px;
}

.book {
  position: absolute;
  width: 174px;
  height: 258px;
  border-radius: 4px 12px 12px 4px;
  box-shadow: 9px 13px 25px #3b21302c;
}

.book-back {
  z-index: 1;
  margin-left: 75px;
  margin-top: -15px;
  transform: rotate(10deg);
  background: #bd8b8b;
  color: #fff2e6;
}

.book-spine {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 13px;
  width: 12px;
  border-right: 1px solid #e7b6b0;
  border-left: 1px solid #e7b6b0;
  background: #a66f78;
}

.book-back-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 100%;
  padding-left: 12px;
  font-size: 17px;
  letter-spacing: 4px;
}

.book-front {
  z-index: 2;
  margin-left: -60px;
  margin-top: 15px;
  transform: rotate(-8deg);
  background: #4b2947;
  color: #f7e7d6;
}

.book-front-content {
  position: absolute;
  inset: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid #aa829f;
  text-align: center;
}

.cover-label,
.cover-author {
  font-family: Arial, sans-serif;
  font-size: 7px;
  letter-spacing: 1.5px;
}

.cover-flower {
  margin: 14px 0 7px;
  color: #dfb5c5;
  font-size: 38px;
}

.book-front h2 {
  margin: 0;
  font-size: 29px;
  font-weight: 400;
  line-height: 1.15;
}

.cover-author {
  margin-top: 15px;
  color: #dfb5c5;
}

.art-sparkle {
  position: absolute;
  z-index: 3;
  color: #9b7192;
}

.sparkle-one {
  top: 70px;
  left: 65px;
  font-size: 30px;
}

.sparkle-two {
  right: 60px;
  bottom: 77px;
  font-size: 40px;
}

.art-caption {
  position: absolute;
  z-index: 4;
  right: 17px;
  bottom: 19px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 15px;
  border: 1px solid #e9dce6;
  border-radius: 12px;
  background: #fffaf4;
  box-shadow: 0 7px 20px #42253a10;
}

.caption-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: #eee2ed;
  color: #70466a;
  font-size: 18px;
}

.art-caption strong,
.art-caption span {
  display: block;
  font-family: Arial, sans-serif;
}

.art-caption strong {
  color: #493246;
  font-size: 11px;
}

.art-caption div > span {
  margin-top: 4px;
  color: #948592;
  font-size: 10px;
}

/* Features */
.features-section {
  padding: 57px 0 65px;
  border-top: 1px solid #e7ded2;
}

.section-intro {
  max-width: 550px;
  margin-bottom: 30px;
}

.section-intro .eyebrow {
  margin-bottom: 11px;
}

.section-intro h2 {
  margin: 0;
  color: #392738;
  font-size: 34px;
  font-weight: 500;
  letter-spacing: -0.8px;
}

.section-intro > p:last-child {
  margin: 12px 0 0;
  color: #81747e;
  font-family: Arial, sans-serif;
  font-size: 13px;
  line-height: 1.8;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 17px;
}

.feature-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-height: 275px;
  padding: 25px;
  border: 1px solid #e9dfd5;
  border-radius: 16px;
  background: #fffdf8;
}

.feature-icon {
  width: 45px;
  height: 45px;
  display: grid;
  place-items: center;
  margin-bottom: 22px;
  border-radius: 13px;
  font-size: 22px;
}

.discovery-icon {
  background: #f5e9d8;
  color: #a17740;
}

.community-icon {
  background: #e8eee4;
  color: #607957;
}

.writing-icon {
  background: #eee2ed;
  color: #7c5275;
}

.feature-number {
  margin: 0 0 9px;
  color: #a07b96;
  font-family: Arial, sans-serif;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.5px;
}

.feature-card h3 {
  margin: 0;
  color: #432e42;
  font-size: 21px;
  font-weight: 500;
}

.feature-card > p:not(.feature-number) {
  margin: 11px 0 20px;
  color: #81747e;
  font-family: Arial, sans-serif;
  font-size: 12px;
  line-height: 1.8;
}

.feature-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: auto;
  padding: 0;
  border: none;
  background: transparent;
  color: #694563;
  cursor: pointer;
  font-family: Arial, sans-serif;
  font-size: 11px;
  font-weight: 700;
}

.feature-link ion-icon {
  font-size: 15px;
}

/* Closing banner */
.closing-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
  margin-bottom: 35px;
  padding: 32px;
  border-radius: 18px;
  background: #4b2947;
  color: #fff8ef;
}

.closing-banner .eyebrow {
  margin-bottom: 10px;
  color: #dfb9ca;
}

.closing-banner h2 {
  margin: 0;
  font-size: 27px;
  font-weight: 500;
}

.closing-banner p:not(.eyebrow) {
  margin: 10px 0 0;
  color: #e4d4e0;
  font-family: Arial, sans-serif;
  font-size: 12px;
  line-height: 1.7;
}

.closing-button {
  flex-shrink: 0;
  --background: #f3e4e8;
  --background-hover: #fff4ed;
  --color: #4b2947;
  --border-radius: 10px;
  min-height: 46px;
  font-family: Arial, sans-serif;
  font-size: 11px;
}

/* Footer */
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 23px 0 28px;
  border-top: 1px solid #e7ded2;
  color: #9a8c96;
  font-family: Arial, sans-serif;
  font-size: 11px;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #563651;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
}

.footer-brand ion-icon {
  font-size: 19px;
}

.footer-links {
  display: flex;
  gap: 16px;
}

.footer-links a {
  color: #81747e;
  text-decoration: none;
}

.footer-links a:hover {
  color: #563651;
}

/* Responsive layout */
@media (max-width: 900px) {
  .home-shell {
    padding: 0 23px;
  }

  .topbar {
    flex-wrap: wrap;
    padding: 15px 0;
  }

  .navigation {
    order: 3;
    width: 100%;
    justify-content: center;
    border-top: 1px solid #e7ded2;
    padding-top: 10px;
  }

  .hero {
    grid-template-columns: 1fr 0.85fr;
    gap: 24px;
  }

  .hero-art {
    min-height: 355px;
  }

  .book {
    transform: scale(0.85);
  }

  .book-back {
    transform: scale(0.85) rotate(10deg);
  }

  .book-front {
    transform: scale(0.85) rotate(-8deg);
  }

  .features-grid {
    gap: 12px;
  }

  .feature-card {
    padding: 19px;
  }
}

@media (max-width: 650px) {
  .home-shell {
    padding: 0 17px;
  }

  .topbar {
    gap: 10px;
  }

  .brand {
    font-size: 20px;
  }

  .brand-icon {
    width: 34px;
    height: 34px;
  }

  .auth-actions {
    gap: 0;
  }

  .signin-button {
    font-size: 11px;
  }

  .signup-button {
    font-size: 10px;
  }

  .navigation {
    justify-content: space-between;
  }

  .nav-link {
    padding: 9px 7px;
    font-size: 11px;
  }

  .hero {
    grid-template-columns: 1fr;
    gap: 35px;
    padding: 47px 0;
  }

  .hero h1 {
    font-size: clamp(44px, 12vw, 60px);
  }

  .hero-description {
    font-size: 13px;
  }

  .hero-art {
    min-height: 360px;
  }

  .features-section {
    padding: 40px 0;
  }

  .section-intro h2 {
    font-size: 29px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .feature-card {
    min-height: 245px;
  }

  .closing-banner {
    flex-direction: column;
    align-items: flex-start;
    padding: 25px 21px;
  }

  .closing-banner h2 {
    font-size: 25px;
  }

  .footer {
    flex-wrap: wrap;
  }

  .footer-links {
    width: 100%;
    padding-top: 5px;
  }
}
</style>
