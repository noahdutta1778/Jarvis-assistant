(() => {
'use strict';
/* No API keys are used anywhere. Speech runs in the browser; Wikipedia's public API needs no key. */

const $ = s => document.querySelector(s);
const logEl = $('#log'), statusEl = $('#status'), voiceSel = $('#voice');

const LANGS = {
  en: { rec: 'en-IN', loc: 'en-IN', tts: ['en-GB', 'en-IN', 'en-US', 'en'] },
  hi: { rec: 'hi-IN', loc: 'hi-IN', tts: ['hi'] },
  as: { rec: 'as-IN', loc: 'as-IN', tts: ['as', 'bn-IN', 'bn'] }   // Assamese voices are rare; Bengali is the closest fallback
};

const T = {
  en: {
    idle: 'Standing by', listening: 'Listening…', thinking: 'Processing…', speaking: 'Speaking…',
    greet: p => `Good ${p}. I am Jarvis. How can I help you?`, morning: 'morning', afternoon: 'afternoon', evening: 'evening',
    time: t => `The time is ${t}.`, date: d => `Today is ${d}.`,
    battery: (p, c) => `Battery is at ${p} percent${c ? ' and charging' : ''}.`, noBattery: 'Battery information is not available on this device.',
    joke: ['Why do programmers prefer dark mode? Because light attracts bugs.'],
    open: n => `Opening ${n}.`, search: q => `Searching the web for ${q}.`, wiki: 'Looking that up.', noWiki: 'I could not find that on Wikipedia.',
    help: 'I can tell the time, date and battery level, open YouTube, Google or Maps, search the web, look things up on Wikipedia, and tell a joke.',
    lang: 'Language set to English.', unknown: 'I did not understand. Say help to hear what I can do.',
    noSR: 'Voice recognition is not supported in this browser. Use Chrome.', denied: 'Microphone access is blocked. Allow it in the site settings.',
    stopped: 'Stopped.', cleared: 'Cleared.', tap: 'Tap the core and speak', tapLink: 'Tap to open'
  },
  hi: {
    idle: 'तैयार', listening: 'सुन रहा हूँ…', thinking: 'सोच रहा हूँ…', speaking: 'बोल रहा हूँ…',
    greet: p => `${p}। मैं जार्विस हूँ। मैं आपकी कैसे मदद कर सकता हूँ?`, morning: 'सुप्रभात', afternoon: 'शुभ दोपहर', evening: 'शुभ संध्या',
    time: t => `अभी समय ${t} है।`, date: d => `आज ${d} है।`,
    battery: (p, c) => `बैटरी ${p} प्रतिशत है${c ? ' और चार्ज हो रही है' : ''}।`, noBattery: 'इस डिवाइस पर बैटरी की जानकारी उपलब्ध नहीं है।',
    joke: ['टीचर ने पूछा: होमवर्क कहाँ है? छात्र बोला: सर, मेरा कुत्ता खा गया। टीचर: पर आपके पास तो कुत्ता है ही नहीं! छात्र: तभी तो होमवर्क नहीं बना।'],
    open: n => `${n} खोल रहा हूँ।`, search: q => `${q} के लिए वेब पर खोज रहा हूँ।`, wiki: 'ढूँढ रहा हूँ।', noWiki: 'मुझे विकिपीडिया पर यह नहीं मिला।',
    help: 'मैं समय, तारीख और बैटरी बता सकता हूँ, यूट्यूब, गूगल या मैप्स खोल सकता हूँ, वेब पर खोज सकता हूँ, विकिपीडिया से जानकारी ला सकता हूँ और चुटकुला सुना सकता हूँ।',
    lang: 'भाषा हिन्दी चुनी गई।', unknown: 'मैं समझ नहीं पाया। "मदद" बोलकर देखिए।',
    noSR: 'इस ब्राउज़र में वॉइस रिकग्निशन उपलब्ध नहीं है। क्रोम का उपयोग करें।', denied: 'माइक्रोफ़ोन की अनुमति बंद है। साइट सेटिंग में अनुमति दें।',
    stopped: 'रुक गया।', cleared: 'साफ़ कर दिया।', tap: 'कोर को टैप करें और बोलें', tapLink: 'खोलने के लिए टैप करें'
  },
  as: {
    idle: 'সাজু', listening: 'শুনি আছোঁ…', thinking: 'ভাবি আছোঁ…', speaking: 'কৈ আছোঁ…',
    greet: p => `${p}। মই জাৰ্ভিছ। মই আপোনাক কেনেকৈ সহায় কৰিব পাৰোঁ?`, morning: 'শুভ প্ৰভাত', afternoon: 'শুভ অপৰাহ্ন', evening: 'শুভ সন্ধিয়া',
    time: t => `এতিয়া ${t} বাজিছে।`, date: d => `আজি ${d}।`,
    battery: (p, c) => `বেটাৰী ${p} শতাংশ আছে${c ? ' আৰু চাৰ্জ হৈ আছে' : ''}।`, noBattery: 'এই ডিভাইচত বেটাৰীৰ তথ্য পোৱা নগ\'ল।',
    joke: ['শিক্ষকে সুধিলে: হোমৱৰ্ক ক\'ত? ছাত্ৰই ক\'লে: ছাৰ, মোৰ কলমটোৱে লিখিবলৈ অস্বীকাৰ কৰিলে!'],
    open: n => `${n} খুলি আছোঁ।`, search: q => `${q} ৱেবত বিচাৰি আছোঁ।`, wiki: 'বিচাৰি আছোঁ।', noWiki: 'ৱিকিপিডিয়াত এই তথ্য পোৱা নগ\'ল।',
    help: 'মই সময়, তাৰিখ আৰু বেটাৰী ক\'ব পাৰোঁ, ইউটিউব, গুগল বা মেপ খুলিব পাৰোঁ, ৱেবত বিচাৰিব পাৰোঁ, ৱিকিপিডিয়াৰ পৰা তথ্য আনিব পাৰোঁ আৰু কৌতুক ক\'ব পাৰোঁ।',
    lang: 'অসমীয়া ভাষা বাছনি কৰা হ\'ল।', unknown: 'মই বুজি নাপালোঁ। "সহায়" বুলি কৈ চাওক।',
    noSR: 'এই ব্ৰাউজাৰত ভইচ ৰিকগনিচন নাই। ক্ৰোম ব্যৱহাৰ কৰক।', denied: 'মাইক্ৰ\'ফ\'নৰ অনুমতি বন্ধ আছে। চাইট ছেটিঙত অনুমতি দিয়ক।',
    stopped: 'বন্ধ কৰিলোঁ।', cleared: 'পৰিষ্কাৰ কৰা হ\'ল।', tap: 'কোৰটো টেপ কৰি কওক', tapLink: 'খুলিবলৈ টেপ কৰক'
  }
};

// Keywords for every language are matched together, so you can mix languages freely.
const K = {
  stop: ['stop', 'be quiet', 'रुको', 'चुप', 'বন্ধ কৰা', 'ৰ\'ব'],
  clear: ['clear', 'साफ़', 'साफ', 'পৰিষ্কাৰ'],
  switch: ['switch', 'change', 'language', 'भाषा', 'বদলা', 'ভাষা'],
  time: ['time', 'समय', 'कितने बजे', 'সময়', 'বাজিছে'],
  date: ['date', 'तारीख', 'तिथि', 'তাৰিখ'],
  battery: ['battery', 'बैटरी', 'বেটাৰী'],
  joke: ['joke', 'चुटकुला', 'मज़ाक', 'मजाक', 'কৌতুক'],
  help: ['help', 'what can you do', 'मदद', 'সহায়'],
  open: ['open', 'खोल', 'খুলি', 'খোল'],
  search: ['search', 'सर्च', 'खोज', 'সন্ধান', 'বিচাৰ'],
  wiki: ['who is', 'what is', 'tell me about', 'wikipedia', 'कौन है', 'क्या है', 'के बारे में', 'विकिपीडिया', 'কোন আছিল', 'কি হয়', 'বিষয়ে', 'ৱিকিপিডিয়া']
};
const SITES = [
  { n: 'YouTube', k: ['youtube', 'यूट्यूब', 'ইউটিউব'], u: 'https://m.youtube.com' },
  { n: 'Google', k: ['google', 'गूगल', 'গুগল'], u: 'https://www.google.com' },
  { n: 'Maps', k: ['maps', 'map', 'मैप', 'মেপ'], u: 'https://maps.google.com' }
];
const LANG_WORDS = { hi: ['hindi', 'हिंदी', 'हिन्दी'], as: ['assamese', 'অসমীয়া', 'asomiya'], en: ['english', 'अंग्रेज़ी', 'अंग्रेजी', 'ইংৰাজী'] };

let lang = 'en', speaking = false, listening = false, rec = null;
try { lang = localStorage.getItem('jarvis.lang') || 'en'; } catch (e) {}
const t = () => T[lang];
const has = (s, list) => list.some(w => s.includes(w));

/* ---------- UI ---------- */
function setState(s, label) {
  document.body.dataset.state = s;
  statusEl.textContent = label || t()[s] || '';
}
function add(role, text, link) {
  const d = document.createElement('div');
  d.className = 'msg ' + role;
  d.textContent = text;
  if (link) {
    d.append(' ');
    const a = document.createElement('a');
    a.href = link.u; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = t().tapLink + ': ' + link.n;
    d.append(a);
  }
  logEl.append(d);
  logEl.scrollTop = logEl.scrollHeight;
}

/* ---------- Speech output (male-leaning voice) ---------- */
const MALE = /\b(male)\b|ravi|hemant|prabhat|madhur|rishi|guy|david|daniel|george|james|mark|ryan|thomas|arthur|google uk english male/i;
const norm = v => v.lang.replace('_', '-').toLowerCase();
function voicesFor(l) {
  const all = speechSynthesis.getVoices(), out = [];
  LANGS[l].tts.forEach(p => all.forEach(v => { if (norm(v).startsWith(p.toLowerCase()) && !out.includes(v)) out.push(v); }));
  return out;
}
function pickVoice() {
  const list = voicesFor(lang);
  let saved = ''; try { saved = localStorage.getItem('jarvis.voice.' + lang) || ''; } catch (e) {}
  return list.find(v => v.name === saved) || list.find(v => MALE.test(v.name)) || list[0] || null;
}
function fillVoices() {
  const list = voicesFor(lang);
  voiceSel.innerHTML = '';
  voiceSel.add(new Option('Auto (deep male)', ''));
  list.forEach(v => voiceSel.add(new Option(`${v.name} (${v.lang})`, v.name)));
  try { voiceSel.value = localStorage.getItem('jarvis.voice.' + lang) || ''; } catch (e) {}
}
function speak(text) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text), v = pickVoice();
  if (v) { u.voice = v; u.lang = v.lang; } else u.lang = LANGS[lang].rec;
  u.pitch = 0.6;  // lower pitch = deeper, more masculine tone
  u.rate = 0.95;
  u.onstart = () => { speaking = true; setState('speaking'); };
  u.onend = u.onerror = () => { speaking = false; if (!listening) setState('idle'); };
  speechSynthesis.speak(u);
}
function say(text, link) { add('bot', text, link); speak(text); }

/* ---------- Commands ---------- */
const fmt = (o) => new Date().toLocaleString(LANGS[lang].loc, o);
async function wikiSummary(topic) {
  const base = `https://${lang}.wikipedia.org/`;
  const s = await (await fetch(`${base}w/api.php?action=opensearch&limit=1&format=json&origin=*&search=${encodeURIComponent(topic)}`)).json();
  if (!s[1] || !s[1][0]) return null;
  const r = await fetch(`${base}api/rest_v1/page/summary/${encodeURIComponent(s[1][0])}`);
  if (!r.ok) return null;
  const j = await r.json();
  return (j.extract || '').split(/(?<=[.।?!])\s/).slice(0, 2).join(' ').slice(0, 340) || null;
}
const strip = (s, lists) => lists.flat().reduce((a, w) => a.split(w).join(' '), s).replace(/\b(for|on|the|about|please)\b|पर|के लिए|কওক|বতাওক|बताओ|बताइए/g, ' ').replace(/\s+/g, ' ').trim();

async function handle(raw) {
  const q = raw.trim();
  if (!q) return;
  add('user', q);
  setState('thinking');
  const s = q.toLowerCase().replace(/^(hey |ok |okay )?(jarvis|जार्विस|জাৰ্ভিছ)[,. ]*/, '');

  if (has(s, K.stop)) { speechSynthesis.cancel(); return say(t().stopped); }
  if (has(s, K.clear)) { logEl.innerHTML = ''; return say(t().cleared); }
  if (has(s, K.switch)) {
    const l = Object.keys(LANG_WORDS).find(k => has(s, LANG_WORDS[k]));
    if (l) { setLang(l); return say(t().lang); }
  }
  if (has(s, K.time)) return say(t().time(fmt({ hour: 'numeric', minute: '2-digit' })));
  if (has(s, K.date)) return say(t().date(fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })));
  if (has(s, K.battery)) {
    if (!navigator.getBattery) return say(t().noBattery);
    const b = await navigator.getBattery();
    return say(t().battery(Math.round(b.level * 100), b.charging));
  }
  if (has(s, K.joke)) return say(t().joke[Math.floor(Math.random() * t().joke.length)]);
  if (has(s, K.help)) return say(t().help);
  if (has(s, K.open)) {
    const site = SITES.find(x => has(s, x.k));
    if (site) {
      const w = window.open(site.u, '_blank', 'noopener');
      return say(t().open(site.n), w ? null : site);   // popup blocked → show tappable link
    }
  }
  if (has(s, K.search)) {
    const term = strip(s, [K.search, ['google', 'गूगल', 'গুগল']]);
    if (term) {
      const l = { n: term, u: 'https://www.google.com/search?q=' + encodeURIComponent(term) };
      const w = window.open(l.u, '_blank', 'noopener');
      return say(t().search(term), w ? null : l);
    }
  }
  if (has(s, K.wiki)) {
    const topic = strip(s, [K.wiki]);
    if (topic) {
      try {
        const ans = await wikiSummary(topic);
        return say(ans || t().noWiki);
      } catch (e) { return say(t().noWiki); }
    }
  }
  if (/\b(hello|hi|hey)\b/.test(s) || has(s, ['नमस्ते', 'हेलो', 'নমস্কাৰ', 'হেলো'])) return say(greeting());
  say(t().unknown);
}
function greeting() {
  const h = new Date().getHours();
  return t().greet(t()[h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening']);
}

/* ---------- Speech input ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function listen(recLang) {
  if (!SR) return say(t().noSR);
  speechSynthesis.cancel();
  rec = new SR();
  rec.lang = recLang || LANGS[lang].rec;
  rec.interimResults = true;
  let finalText = '', err = '';
  rec.onstart = () => { listening = true; setState('listening'); };
  rec.onresult = e => {
    const txt = Array.from(e.results).map(r => r[0].transcript).join(' ');
    statusEl.textContent = txt;
    if (e.results[e.results.length - 1].isFinal) finalText = txt;
  };
  rec.onerror = e => { err = e.error; };
  rec.onend = () => {
    listening = false;
    if (err === 'language-not-supported' && lang === 'as' && rec.lang !== 'bn-IN') return listen('bn-IN');
    if (err === 'not-allowed' || err === 'service-not-allowed') { setState('idle'); return say(t().denied); }
    if (finalText) handle(finalText); else setState('idle');
  };
  try { rec.start(); } catch (e) { setState('idle'); }
}

/* ---------- Language ---------- */
function setLang(l) {
  lang = l;
  try { localStorage.setItem('jarvis.lang', l); } catch (e) {}
  document.documentElement.lang = l;
  document.querySelectorAll('.lang button').forEach(b => b.classList.toggle('on', b.dataset.lang === l));
  $('#text').placeholder = { en: 'Type a command', hi: 'कमांड लिखें', as: 'কমাণ্ড লিখক' }[l];
  fillVoices();
  if (!listening && !speaking) setState('idle');
}

/* ---------- Dashboard widgets ---------- */
function tick() {
  const n = new Date();
  $('#clock').textContent = n.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  $('#date').textContent = n.toLocaleDateString(LANGS[lang].loc, { weekday: 'short', day: 'numeric', month: 'short' });
  $('#net').textContent = navigator.onLine ? 'Online' : 'Offline';
}
if (navigator.getBattery) navigator.getBattery().then(b => {
  const show = () => { $('#battery').textContent = Math.round(b.level * 100) + '%' + (b.charging ? ' ⚡' : ''); };
  show(); b.addEventListener('levelchange', show); b.addEventListener('chargingchange', show);
});

/* ---------- Events ---------- */
$('#mic').addEventListener('click', () => {
  if (listening) rec.stop();
  else if (speaking) { speechSynthesis.cancel(); setState('idle'); }
  else listen();
});
$('#form').addEventListener('submit', e => {
  e.preventDefault();
  const i = $('#text'), v = i.value;
  i.value = '';
  handle(v);
});
document.querySelectorAll('.lang button').forEach(b => b.addEventListener('click', () => { setLang(b.dataset.lang); speak(t().lang); add('bot', t().lang); }));
voiceSel.addEventListener('change', () => { try { localStorage.setItem('jarvis.voice.' + lang, voiceSel.value); } catch (e) {} });
$('#test').addEventListener('click', () => speak(greeting()));
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = fillVoices;

setLang(lang);
tick(); setInterval(tick, 1000);
add('bot', greeting() + ' ' + t().tap + '.');
})();
