<script setup lang="ts">
import { ref } from "vue";
import { chapters } from "../catalog";
import ChapterCover from "../components/ChapterCover.vue";
import CharacterArt from "../components/CharacterArt.vue";
import HomeDispatches from "../components/HomeDispatches.vue";
import JournalShelf from "../components/JournalShelf.vue";
import { usePageMotion } from "../composables/usePageMotion";
const root = ref<HTMLElement | null>(null);
const invitations = {
  explore: "Take in the view. I’ll point out what lies beyond it.",
  make: "Wait till you meet the people behind what Ohio makes.",
  culture: "Music, food, stories… I saved you a seat. ♡",
  live: "Meet the everyday Ohio I’d hate for you to miss.",
};
usePageMotion(root);
</script>
<template>
  <main id="main-content" ref="root" tabindex="-1">
    <section id="top" class="home-hero" data-parallax-stage>
      <div class="hero-landscape" aria-hidden="true"></div>
      <span class="hero-watermark" aria-hidden="true">OHIO</span>
      <div class="hero-copy">
        <p class="eyebrow" data-hero-copy>
          <span class="tiny-star" aria-hidden="true">✳</span> OHIO-CHAN HERE!
        </p>
        <h1 data-hero-copy>
          Oh, hello<br /><em>Ohio.</em>
          <span class="title-heart" aria-hidden="true">♡</span>
        </h1>
        <p class="hero-description" data-hero-copy>
          Yayyy, you made it! I’m Ohio-chan, a local girl, and there’s no place I’d
          rather call home. I’ve got stories to tell—come say hi to Ohio! ♡
        </p>
        <RouterLink class="button" to="/explore" data-hero-copy
          >Let's go! <span>↗</span></RouterLink
        >
      </div>
      <div class="hero-portrait" data-hero-art>
        <div data-parallax-art>
          <img
            src="/ohio-chan-vtuber.webp"
            width="1024"
            height="1536"
            fetchpriority="high"
            alt="Ohio-chan welcomes you with a microphone and an outstretched hand"
          />
        </div>
      </div>
      <span class="hero-spark spark-one" aria-hidden="true">✳</span
      ><span class="hero-spark spark-two" aria-hidden="true">✧</span>
      <div class="hero-sticker" data-hero-detail>
        <span>YAYYY, YOU'RE<br />HERE!</span><span>♡</span>
      </div>
      <div class="hero-caption" data-hero-detail>
        <span>OH, THAT'S ME!</span><strong>Ohio-chan</strong
        ><span class="caption-line"></span>
      </div>
      <div class="hero-bottom" data-hero-detail>
        <span>MEET THE PEOPLE AND PLACES OF OHIO.</span
        ><a href="#chapters">Pick your first stop <span>↓</span></a>
      </div>
    </section>
    <div class="ribbon" aria-hidden="true">
      <span>Lake breeze!</span><span>✳</span><span>Snack break.</span
      ><span>✳</span><span>One more adventure? Yayyy!</span><span>♡</span>
    </div>
    <section class="ohio-letter section-pad" aria-labelledby="ohio-letter-title">
      <div class="letter-portrait" data-reveal="portrait">
        <span class="letter-orbit" aria-hidden="true"></span>
        <CharacterArt chapter="discover" alt="Ohio-chan invites you to explore Ohio with her" sizes="(max-width: 560px) 55vw, 30vw" />
        <span class="letter-signature">Ohio-chan <span aria-hidden="true">♡</span></span>
      </div>
      <div class="letter-copy" data-reveal>
        <p class="eyebrow">A NOTE FROM OHIO-CHAN</p>
        <h2 id="ohio-letter-title">You should<br /><em>meet Ohio.</em></h2>
        <p>
          I could take you straight to Hocking Hills. Or a neighborhood market.
          Or a workshop where someone’s making a thing you’ll recognize the
          moment you see it. Ooh, choosing a first stop is harder than it sounds.
        </p>
        <p>
          The best part is meeting the people behind those places. Artists,
          makers, neighbors, and the people keeping local stories alive—I’d love
          for you to know them. Pick a chapter and I’ll make the introductions.
        </p>
        <p class="letter-aside">Don’t rush. I know a few good places to start. ♡</p>
        <a class="text-link" href="#chapters">Pick your first stop <span>↓</span></a>
      </div>
    </section>
    <section id="chapters" class="chapter-directory section-pad">
      <div class="section-heading" data-reveal>
        <div>
          <p class="eyebrow">YOUR TURN TO PICK!</p>
          <h2>Where to<br /><em>first?</em></h2>
        </div>
        <p>
          Four ways to meet Ohio. Pick the one that catches your eye—<br />
          I’ll be right there to point out a few good details.
          <span class="red" aria-hidden="true">(˶ᵔ ᵕ ᵔ˶)</span>
        </p>
      </div>
      <div class="directory-grid">
        <RouterLink
          v-for="chapter in chapters"
          :id="chapter.id"
          :key="chapter.id"
          :to="`/${chapter.id}`"
          class="directory-card"
          :style="{ '--chapter-color': chapter.color }"
          data-reveal
        >
          <ChapterCover :chapter="chapter.id" :number="chapter.symbol" />
          <div class="directory-info">
            <div>
              <h3>{{ chapter.title }}</h3>
              <p>{{ invitations[chapter.id] }}</p>
            </div>
            <span class="card-arrow">↗</span>
          </div>
        </RouterLink>
      </div>
    </section>
    <section class="travel-feature section-pad">
      <div class="feature-image" data-reveal>
        <img
          src="/travel-anime.webp"
          width="1672"
          height="941"
          loading="lazy"
          alt="Illustrated sunlight falling across a wooded Hocking Hills gorge"
        /><span class="image-tag">AHH, HOCKING HILLS!</span>
        <div class="postcard-stamp">OHIO<br /><span>01 / EXPLORE</span></div>
      </div>
      <div class="feature-copy" data-reveal>
        <p class="eyebrow">FIRST STOP: HOCKING HILLS</p>
        <h2>Let’s get<br />a little <em>lost.</em></h2>
        <p>
          Ooh, look up. The sandstone walls at Hocking Hills make even a short
          walk feel like a discovery. Follow a trail through the woods, then take
          time for the towns and people nearby. I promised you an introduction,
          remember? The view is only the beginning. ♡
        </p>
        <RouterLink class="text-link" to="/explore#hocking-hills"
          >Hocking Hills, up close <span>↗</span></RouterLink
        >
        <div class="packing-note">
          <img
            src="/art/small/prop-backpack.webp"
            width="180"
            height="180"
            loading="lazy"
            alt="Illustrated travel backpack"
          />
          <p>Bag's packed!<br />You’ve got comfy shoes? ♡</p>
        </div>
      </div>
    </section>
    <JournalShelf />
    <HomeDispatches />
    <section class="culture-feature section-pad">
      <div class="section-heading" data-reveal>
        <div>
          <p class="eyebrow light">WAIT, THERE’S MORE!</p>
          <h2>Listen. Look.<br /><em>Meet the makers.</em></h2>
        </div>
        <img
          class="floating-prop"
          src="/art/small/prop-record.webp"
          width="180"
          height="180"
          alt=""
          loading="lazy"
        />
      </div>
      <p class="home-culture-intro" data-reveal>
        One night, a concert in Cleveland. The next day, a closer look at the
        experiments and skilled hands behind an Ohio invention. Different people,
        different kinds of work—and I can’t wait for you to meet them. ♡
      </p>
      <div class="world-grid">
        <RouterLink to="/culture#cleveland-orchestra-severance" class="world-card" data-reveal
          ><img
            src="/culture-anime.webp"
            width="1672"
            height="941"
            loading="lazy"
            alt="Illustrated Cleveland music scene beside Lake Erie"
          />
          <div>
            <span>03 / CULTURE</span>
            <h3>Ooh, I saved<br />you a seat.</h3>
            <span class="card-arrow">↗</span>
          </div></RouterLink
        ><RouterLink to="/make#glenn-icing-tunnel" class="world-card" data-reveal
          ><img
            src="/industry-anime.webp"
            width="1672"
            height="941"
            loading="lazy"
            alt="Illustrated Ohio factories and railways at dawn"
          />
          <div>
            <span>02 / MAKE</span>
            <h3>Whoa, look what<br />Ohio makes!</h3>
            <span class="card-arrow">↗</span>
          </div></RouterLink
        >
      </div>
    </section>
    <section class="language-feature section-pad" data-reveal>
      <img
        class="language-object"
        src="/art/small/prop-cardinal.webp"
        width="300"
        height="300"
        alt="Northern cardinal, the Ohio state bird"
        loading="lazy"
      />
      <div>
        <p class="eyebrow">LET’S TRY SAYING IT TOGETHER</p>
        <h2>“Wait… say<br />that <em>again?</em>”</h2>
        <p>
          Ooh, listen closely. Ohio Valley expressions, family nicknames, and
          place names each have a story behind them. I’ll introduce you to a few.
          And if “Scioto” trips you up? That’s okay—a local can help with the
          pronunciation. ♡
        </p>
        <RouterLink class="text-link" to="/culture#phrase-4"
          >Hear how locals say “Scioto” <span>↗</span></RouterLink
        >
      </div>
      <span class="language-doodle" aria-hidden="true">!?<br />♡</span>
    </section>
    <section class="home-stay section-pad" aria-labelledby="home-stay-title">
      <div class="home-stay-copy" data-reveal>
        <p class="eyebrow">WAIT, ONE MORE INTRODUCTION</p>
        <h2 id="home-stay-title">Stay for<br /><em>one more chapter?</em></h2>
        <p>
          Oh, you thought I’d only talk about landmarks? There’s also a library,
          a neighborhood garden, and a room where local decisions get made.
          Everyday Ohio has people worth meeting, and I don’t want you to miss
          them. Stay a little longer? ♡
        </p>
        <RouterLink class="text-link" to="/live#ohiolink-shared-shelves">An afternoon at an Ohio library <span>↗</span></RouterLink>
      </div>
      <div class="home-stay-portrait" data-reveal="portrait">
        <CharacterArt chapter="life" alt="Ohio-chan, ready to introduce everyday life in Ohio" sizes="(max-width: 560px) 65vw, 35vw" />
        <span>One more stop? Pretty please? <span aria-hidden="true">♡</span></span>
      </div>
    </section>
    <section class="closing-note section-pad" data-reveal>
      <img
        src="/art/small/prop-buckeye.webp"
        width="130"
        height="130"
        alt=""
        loading="lazy"
      />
      <p>
        See? One visit was never going to be enough.<br /><em
          >Next time, I’ll have someone new to introduce you to. ♡</em
        >
      </p>
      <span>WITH LOVE, OHIO-CHAN ♡</span>
    </section>
  </main>
</template>
<style scoped>
.ohio-letter { display:grid; grid-template-columns:minmax(230px,.8fr) 1.2fr; align-items:center; gap:7%; background:#eef3f8; }
.letter-portrait { position:relative; min-width:0; isolation:isolate; height:490px; }
.letter-portrait img { position:relative; height:100%; width:100%; object-fit:contain; }
.letter-orbit { position:absolute; inset:16% -3% 8%; border:1px solid #abc0d4; border-radius:50%; transform:rotate(-12deg); z-index:-1; }
.letter-signature { position:absolute; right:0; bottom:12px; font:italic 26px Georgia,serif; color:#9f344c; transform:rotate(-7deg); padding:10px 18px; background:#f8fafd; }
.letter-copy h2,.home-stay h2 { font-size:clamp(38px,4.5vw,66px); margin:16px 0 28px; }
.letter-copy h2 em,.home-stay h2 em { color:var(--red); }
.letter-copy > p:not(.eyebrow),.home-stay-copy > p:not(.eyebrow) { font-size:17px; line-height:1.85; color:#485a73; margin:0 0 20px; max-width:620px; }
.letter-copy .letter-aside { font-family:Georgia,serif; font-style:italic; color:#9f344c!important; }
.home-culture-intro { max-width:730px; margin:-12px 0 40px; color:#d8e2f1; font-size:18px; line-height:1.85; }
.home-stay { display:grid; grid-template-columns:1.25fr 1fr; gap:6%; align-items:center; background:#e3eee8; overflow:hidden; }
.home-stay-portrait { position:relative; height:460px; }
.home-stay-portrait img { height:100%; width:100%; object-fit:contain; }
.home-stay-portrait > span { position:absolute; right:0; bottom:12%; padding:13px 20px; background:#fffdf6; color:#315447; font:italic 22px Georgia,serif; transform:rotate(5deg); }
@media(max-width:800px) { .ohio-letter { gap:5%; grid-template-columns:.75fr 1.25fr; }.letter-portrait { height:380px; }.letter-copy > p:not(.eyebrow),.home-stay-copy > p:not(.eyebrow) { font-size:16px; }.home-stay-portrait { height:350px; }.home-culture-intro { font-size:16px; } }
@media(max-width:560px) {
  .ohio-letter { grid-template-columns:1fr; gap:28px; }.letter-portrait { height:260px; width:70%; margin:auto; }.letter-signature { font-size:22px; right:-18px; }
  .letter-copy h2,.home-stay h2 { font-size:42px; }.letter-copy > p:not(.eyebrow),.home-stay-copy > p:not(.eyebrow) { line-height:1.8; }
  .home-stay { grid-template-columns:1fr; gap:20px; }.home-stay-portrait { height:300px; width:85%; margin:auto; }.home-stay-portrait > span { font-size:20px; right:-5px; }
  .home-culture-intro { margin:0 0 28px; }.culture-feature .eyebrow { max-width:230px; }.feature-copy > p:not(.eyebrow),.language-feature p:not(.eyebrow) { font-size:16px; line-height:1.8; }
  .feature-copy .text-link { gap:15px; font-size:14px; }.directory-info p { font-size:13px; line-height:1.55; }
}
</style>
