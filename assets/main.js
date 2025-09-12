
// Mobile menu
const menuBtn = document.querySelector('.menu-btn');
const menu = document.getElementById('menu');
if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}
// Highlight active nav based on pathname
document.querySelectorAll('nav a').forEach(a => {
  if (a.getAttribute('href') === location.pathname.split('/').pop()) {
    a.setAttribute('aria-current','page');
    a.classList.add('active');
  }
});

// FAQs toggles
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const a = q.parentElement.querySelector('.faq-a');
    const open = a.style.display === 'block';
    a.style.display = open ? 'none' : 'block';
    q.setAttribute('aria-expanded', open ? 'false' : 'true');
    q.lastElementChild.textContent = open ? '+' : '–';
  });
});

// Back to top
const btt = document.getElementById('backToTop');
if (btt){
  window.addEventListener('scroll', () => {
    btt.style.display = window.scrollY > 600 ? 'block' : 'none';
  });
  btt.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
}
// Year
const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();

// Countdown (only if the elements exist)
const dd = document.getElementById('dd'), hh = document.getElementById('hh'), mm = document.getElementById('mm'), ss = document.getElementById('ss');
if (dd && hh && mm && ss){
  const target = new Date('2025-10-12T00:00:00+09:00').getTime();
  const tick = () => {
    const now = Date.now();
    let diff = Math.max(0, target - now);
    const d = Math.floor(diff / (1000*60*60*24)); diff -= d*24*60*60*1000;
    const h = Math.floor(diff / (1000*60*60)); diff -= h*60*60*1000;
    const m = Math.floor(diff / (1000*60)); diff -= m*60*1000;
    const s = Math.floor(diff / 1000);
    dd.textContent = d; hh.textContent = String(h).padStart(2,'0');
    mm.textContent = String(m).padStart(2,'0'); ss.textContent = String(s).padStart(2,'0');
  };
  tick(); setInterval(tick, 1000);
}

// Add to Calendar (.ics) if button exists
const addCal = document.getElementById('addCal');
if (addCal){
  addCal.addEventListener('click', () => {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Uga Fest Japan//EN",
      "BEGIN:VEVENT",
      "UID:ugafest-2025-10-12@example",
      "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g,"").split(".")[0] + "Z",
      "DTSTART;VALUE=DATE:20251012",
      "DTEND;VALUE=DATE:20251013",
      "SUMMARY:Uga Fest Japan 2025 — Nagoya",
      "LOCATION:Flow Jam Nagoya, Pivot Lion Building 404, 3-10-14 Sakae, Naka Ward, Nagoya 460-0008",
      "DESCRIPTION:Celebrate Uganda’s Independence with sports, food, and live performances. Tickets: Ordinary ¥10,000 / VIP ¥20,000",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
    const blob = new Blob([ics], {type: "text/calendar"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = "ugafest-2025.ics"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  });
}
