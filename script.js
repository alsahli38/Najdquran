// Helpers
const pad3 = n => String(n).padStart(3, '0');
const apiBase = ' https://www.mp3quran.net/api/v3/reciters?language=ar';

// قائمة أسماء السور العربية
const surahNames = [
  "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس",
  "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه",
  "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم",
  "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر",
  "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق",
  "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة",
  "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج",
  "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس",
  "التكوير", "الإنفطار", "المطففين", "الإنشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد",
  "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات",
  "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر",
  "المسد", "الإخلاص", "الفلق", "الناس"
];

async function fetchReciters() {
  document.getElementById('status').textContent = 'جاري جلب قائمة المشايخ من API...';
  try {
    const res = await fetch(apiBase);
    if (!res.ok) throw new Error('فشل الاتصال بالـ API: ' + res.status);
    const data = await res.json();
    return data.reciters || [];
  } catch (err) {
    console.error(err);
    document.getElementById('status').textContent = 'حدث خطأ أثناء جلب البيانات. افتح الكونسول للمزيد.';
    throw err;
  }
}

function createReciterCard(reciter) {
  const wrap = document.createElement('div');
  wrap.className = 'reciter';

  const head = document.createElement('div');
  head.className = 'reciter-head';

  const infoDiv = document.createElement('div');
  infoDiv.className = 'reciter-info';
  
  const nameDiv = document.createElement('div');
  nameDiv.className = 'reciter-name';
  nameDiv.textContent = reciter.name;
  
  const metaDiv = document.createElement('div');
  metaDiv.className = 'reciter-meta';
  metaDiv.innerHTML = `
    <span><i class="fas fa-hashtag"></i> الرمز: ${reciter.letter || '-'}</span>
    <span><i class="fas fa-id-badge"></i> ID: ${reciter.id}</span>
  `;
  
  infoDiv.appendChild(nameDiv);
  infoDiv.appendChild(metaDiv);

  const right = document.createElement('div');
  right.className = 'controls';
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'btn flat';
  toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i> فتح/إغلاق';
  toggleBtn.addEventListener('click', () => {
    const d = wrap.querySelector('details');
    if (d) d.open = !d.open;
  });

  right.appendChild(toggleBtn);
  head.appendChild(infoDiv);
  head.appendChild(right);
  wrap.appendChild(head);

  const det = document.createElement('details');
  const summary = document.createElement('summary');
  summary.innerHTML = '<i class="fas fa-book-quran"></i> المصاحف المتاحة (اضغط للتوسيع)';
  det.appendChild(summary);

  reciter.moshaf.forEach((m) => {
    const box = document.createElement('div');
    box.className = 'moshaf';

    const title = document.createElement('div');
    title.className = 'moshaf-title';
    title.innerHTML = `<i class="fas fa-file-audio"></i> ${m.name} — (الكل: ${m.surah_total || '-'})`;
    box.appendChild(title);

    const info = document.createElement('div');
    info.className = 'moshaf-info';
    info.innerHTML = `<i class="fas fa-server"></i> المجلد/السيرفر: ${m.server || '—'}`;
    box.appendChild(info);

    let available = [];
    if (m.surah_list && typeof m.surah_list === 'string' && m.surah_list.trim()) {
      available = m.surah_list.split(',').map(x => parseInt(x,10)).filter(n => !isNaN(n));
    } else if (m.surah_total) {
      available = Array.from({length: m.surah_total}, (_,i) => i+1);
    } else {
      available = Array.from({length:114}, (_,i) => i+1);
    }

    const linksDiv = document.createElement('div');
    linksDiv.className = 'links';

    available.forEach(num => {
      const fileName = pad3(num) + '.mp3';
      const base = (m.server || '').replace(/\/+$/,'') + '/';
      const url = base + fileName;

      const a = document.createElement('a');
      a.className = 'link';
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.title = `تشغيل سورة ${surahNames[num - 1] || 'مجهولة'}`;
      a.innerHTML = `<i class="fas fa-play-circle"></i> ${surahNames[num - 1] || pad3(num)}`;

      a.addEventListener('click', (ev) => {
        ev.preventDefault();
        playAudio(url, `${reciter.name} — ${surahNames[num - 1] || 'سورة ' + num}`, num, reciter, m);
      });

      linksDiv.appendChild(a);
    });

    box.appendChild(linksDiv);
    det.appendChild(box);
  });

  wrap.appendChild(det);
  return wrap;
}

let currentAudioEl = null;
let currentSurahIndex = null;
let currentReciter = null;
let currentMoshaf = null;

function ensurePlayerArea() {
  let area = document.getElementById('playerArea');
  if (!area) {
    area = document.createElement('div');
    area.id = 'playerArea';
    document.querySelector('.container').insertBefore(area, document.querySelector('footer'));
  }
  return area;
}

function playAudio(url, label, surahNum, reciter, moshaf) {
  const area = ensurePlayerArea();
  area.innerHTML = `<div class="small"><i class="fas fa-volume-up"></i> تشغيل: ${escapeHtml(label)}</div>`;
  
  if (currentAudioEl) {
    currentAudioEl.pause();
    currentAudioEl.remove();
  }

  currentSurahIndex = surahNum;
  currentReciter = reciter;
  currentMoshaf = moshaf;

  const audio = document.createElement('audio');
  audio.controls = true;
  audio.src = url;
  audio.autoplay = true;
  audio.onended = () => {
    // تشغيل السورة التالية تلقائيًا
    const nextSurah = surahNum + 1;
    if (nextSurah <= 114) {
      const nextFileName = pad3(nextSurah) + '.mp3';
      const base = (moshaf.server || '').replace(/\/+$/,'') + '/';
      const nextUrl = base + nextFileName;
      const nextLabel = `${reciter.name} — ${surahNames[nextSurah - 1] || 'سورة ' + nextSurah}`;
      playAudio(nextUrl, nextLabel, nextSurah, reciter, moshaf);
    }
  };
  
  area.appendChild(audio);
  currentAudioEl = audio;
}

function escapeHtml(s){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

document.getElementById('loadBtn').addEventListener('click', async () => {
  const listEl = document.getElementById('list');
  listEl.innerHTML = '';
  try {
    const reciters = await fetchReciters();
    document.getElementById('status').textContent = `تم جلب ${reciters.length} قارئ. عرض النتائج...`;
    window._mp3q_reciters = reciters;
    renderReciters(reciters);
  } catch (e) {
    console.error(e);
  }
});

function renderReciters(all) {
  const listEl = document.getElementById('list');
  listEl.innerHTML = '';
  const q = (document.getElementById('search').value || '').trim().toLowerCase();
  const onlyAll = document.getElementById('onlyAll').checked;

  const filtered = all.filter(r => {
    if (q) {
      return r.name.toLowerCase().includes(q) || String(r.id) === q;
    }
    return true;
  }).filter(r => {
    if (!onlyAll) return true;
    return (r.moshaf || []).some(m => Number(m.surah_total) === 114);
  });

  if (filtered.length === 0) {
    listEl.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><br>لا توجد نتائج مطابقة للفلتر.</div>';
    return;
  }

  filtered.forEach(r => {
    const card = createReciterCard(r);
    listEl.appendChild(card);
  });
}

document.getElementById('search').addEventListener('input', () => {
  if (window._mp3q_reciters) renderReciters(window._mp3q_reciters);
});
document.getElementById('onlyAll').addEventListener('change', () => {
  if (window._mp3q_reciters) renderReciters(window._mp3q_reciters);
});

document.getElementById('shareBtn').addEventListener('click', () => {
  const appLink = 'https://www.mediafire.com/file/puljrdbo138qk8m/NajdQuran.apk/file';
  const text = encodeURIComponent('انصحكم بهذا التطبيق المبارك: نجد قرآن — تلاوات متكاملة\n\n' + appLink);
  const whatsappUrl = `https://wa.me/?text=${text}`;
  window.open(whatsappUrl, '_blank');
});