const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
function closeMenu(){menu?.setAttribute('aria-expanded','false');menu?.setAttribute('aria-label','메뉴 열기');nav?.classList.remove('is-open');}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');nav.classList.toggle('is-open',open);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeMenu();menu?.focus();}});
document.addEventListener('click',event=>{if(!event.target.closest('.header')) closeMenu();});
nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
const topButton=document.querySelector('.to-top');
function updateTopButton(){if(topButton)topButton.hidden=window.scrollY<550;}
window.addEventListener('scroll',updateTopButton,{passive:true});updateTopButton();
topButton?.addEventListener('click',()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('js-motion');const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}},{threshold:.08});document.querySelectorAll('[data-reveal]').forEach(el=>observer.observe(el));}
