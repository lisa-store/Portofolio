'use strict';
const $ = (id) => document.getElementById(id);
const setText = (id, value) => { const el = $(id); if (el) el.textContent = value || ''; };
const make = (tag, className, text) => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
};
let toastTimer;
function toast(message) {
  const el = $('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3600);
}
function renderSkills(skills) {
  const container = $('skillsGrid');
  container.replaceChildren();
  skills.forEach((skill, index) => {
    const card = make('article', 'skill-card reveal');
    card.append(make('p', 'skill-index', `0${index+1} / EXPERTISE`));
    card.append(make('h3', '', skill.category));
    const tags = make('div', 'skill-tags');
    skill.items.forEach(item => tags.append(make('span','skill-tag',item)));
    card.append(tags);
    container.append(card);
  });
}
function renderTimeline(id, entries) {
  const container = $(id);
  container.replaceChildren();
  entries.forEach(entry => {
    const item = make('article', 'timeline-item reveal');
    item.append(make('div', 'timeline-period', entry.period));
    const detail = make('div');
    detail.append(make('h3', '', entry.title));
    detail.append(make('p', 'timeline-place', entry.place));
    detail.append(make('p', '', entry.description));
    item.append(detail);
    container.append(item);
  });
}
function renderProjects(projects) {
  const container = $('projectsGrid');
  container.replaceChildren();
  const icons = {portfolio: '🎮', dashboard: '🎨', creative:'📚'};
  projects.forEach((project, index) => {
    const card = make('article', 'project-card reveal');
    const visual = make('div', `project-visual ${project.kind || ''}`);
    visual.append(make('span','project-no',project.number || String(index+1).padStart(2,'0')));
    visual.append(make('span','project-icon',icons[project.kind] || '✦'));
    const body = make('div', 'project-body');
    body.append(make('h3', '', project.title));
    body.append(make('p', '', project.description));
    const tags = make('div', 'project-tags');
    (project.tags || []).forEach(tag => tags.append(make('span','project-tag',tag)));
    body.append(tags);
    if (project.url && /^https?:\/\//i.test(project.url)) {
      const link = make('a','project-link','Lihat Proyek ↗');
      link.href=project.url; link.target='_blank';link.rel='noopener noreferrer';
      body.append(link);
    } else {
      body.append(make('span','project-link disabled','Link proyek belum ditambahkan'));
    }
    card.append(visual,body);
    container.append(card);
  });
}
function initPortfolio(data) {
  setText('heroName', data.name);
  setText('heroRole', data.role);
  setText('heroIntro', data.introduction);
  setText('heroLocation', data.location);
  setText('profileInitials', data.initials);
  setText('aboutHeadline', data.headline);
  setText('aboutDescription', data.about);
  setText('contactLocation', data.location);
  setText('contactEmail', data.email || 'Tambahkan alamat email di data.js');
  setText('footerName', data.name);
  setText('currentYear', String(new Date().getFullYear()));
  document.title = `${data.name} | Personal Portfolio`;
  document.querySelector('meta[name="description"]').content = `Portofolio ${data.name}: profil, kemampuan, pendidikan, pengalaman, dan karya.`;
  const photo = $('profilePhoto');
  if (data.photo) {
    photo.src = data.photo;
    photo.alt = `Foto ${data.name}`;
    photo.hidden = false;
    photo.addEventListener('error', () => {photo.hidden=true;toast('Foto tidak ditemukan. Periksa lokasi file di data.js.');});
  }

async function downloadCV() {
    try {
        const response = await fetch("assets/cv.pdf");

        if (!response.ok) {
            throw new Error("File CV tidak ditemukan");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "CV_Allyssa_Putri.pdf";

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
    } catch (error) {
        alert("Gagal mengunduh CV. Periksa lokasi file PDF.");
        console.error(error);
    }
}

  const cv = $('cvButton');
  if (data.cv) {cv.href=data.cv;cv.setAttribute('download','');}
  else {cv.addEventListener('click',e=>{e.preventDefault();toast('Tambahkan file CV dan isikan alamatnya di data.js.');});}
  const email = $('emailButton');
  if (data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    email.href=`mailto:${data.email}?subject=${encodeURIComponent('Halo, saya melihat portofolio Anda')}`;
  } else {
    email.addEventListener('click',e=>{e.preventDefault();toast('Isi alamat email kamu terlebih dahulu di data.js.');});
  }
  const social = $('socialLinks');
  social.replaceChildren();
  Object.entries(data.social || {}).forEach(([network,url]) => {
    if (!url || !/^https?:\/\//i.test(url)) return;
    const link=make('a','',network.charAt(0).toUpperCase()+network.slice(1)+' ↗');
    link.href=url;link.target='_blank';link.rel='noopener noreferrer';
    social.append(link);
  });
  if (!social.childElementCount) social.append(make('span','skill-tag','Link media sosial belum ditambahkan'));
  renderSkills(data.skills || []);
  renderTimeline('educationTimeline', data.education || []);
  renderTimeline('experienceTimeline', data.experience || []);
  renderProjects(data.projects || []);
}
function initNavigation() {
  const menu=$('menuToggle'),links=$('navLinks');
  const close = () => {links.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Buka navigasi');};
  menu.addEventListener('click',()=>{
    const opening=!links.classList.contains('open');
    links.classList.toggle('open',opening);
    menu.setAttribute('aria-expanded',String(opening));
    menu.setAttribute('aria-label', opening?'Tutup navigasi':'Buka navigasi');
  });
  links.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
  document.addEventListener('keydown',event=>{if(event.key==='Escape') close();});
  if ('IntersectionObserver' in window) {
    const navLinks=[...links.querySelectorAll('a[href^="#"]')];
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{if(entry.isIntersecting){navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+entry.target.id));}});
    },{rootMargin:'-35% 0px -55% 0px'});
    document.querySelectorAll('main section[id]').forEach(s=>observer.observe(s));
  }
}
function initReveal() {
  const items=document.querySelectorAll('.reveal');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    items.forEach(item=>item.classList.add('visible'));return;
  }
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}});
  },{threshold:.08,rootMargin:'0px 0px 50px 0px'});
  items.forEach(item=>observer.observe(item));
}
if (typeof PORTFOLIO !== 'undefined') {
  initPortfolio(PORTFOLIO);
  initNavigation();
  initReveal();
} else {
  document.body.classList.add('data-error');
  toast('File data.js tidak ditemukan. Pastikan semua file berada di folder yang sama.');
  document.querySelectorAll('.reveal').forEach(item=>item.classList.add('visible'));
}
