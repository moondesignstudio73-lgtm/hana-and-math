const scene = document.querySelector('.arrival');
const choices = document.getElementById('classrooms');
const root = document.documentElement;
root.classList.add('entry-enabled');
function syncStage() {
  const open = location.hash === '#classrooms';
  root.classList.toggle('choices-open',open);
  scene.inert = open;
  choices.inert = !open;
  if (open) choices.focus({preventScroll:true});
  else window.scrollTo(0,0);
}
function openChoices() {
  if (!scene.inert) location.hash = 'classrooms';
}
syncStage();
window.addEventListener('hashchange',syncStage);
window.addEventListener('pageshow',syncStage);
let distance = 0;
let lastWheel = 0;
let quietUntil = 0;
window.addEventListener('wheel', event => {
  if (event.ctrlKey || Math.abs(event.deltaX)>Math.abs(event.deltaY)) return;
  const now = performance.now();
  if (scene.inert) {
    if (now < quietUntil) { event.preventDefault(); quietUntil = now + 160; }
    return;
  }
  event.preventDefault();
  if (now - lastWheel > 220 || event.deltaY <= 0) distance = 0;
  lastWheel = now;
  distance += Math.max(0,event.deltaY) * (event.deltaMode===1 ? 16 : event.deltaMode===2 ? innerHeight : 1);
  if (distance >= 32) { distance = 0; quietUntil = now + 180; openChoices(); }
},{passive:false});
let start;
scene.addEventListener('touchstart',event => { start = event.touches.length === 1 ? event.touches[0] : null; },{passive:true});
scene.addEventListener('touchend',event => {
  if (!start || event.touches.length) return;
  const end = event.changedTouches[0];
  const dy = start.clientY - end.clientY;
  if (dy > 42 && dy > Math.abs(start.clientX-end.clientX)) openChoices();
  start = null;
},{passive:true});
scene.addEventListener('touchcancel',() => {start=null;});
window.addEventListener('keydown',event => {
  if (scene.inert || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (['ArrowDown','PageDown',' ','End'].includes(event.key)) {event.preventDefault();openChoices();}
});
