import { projectUrl, publishableKey } from './parent-config.mjs';

const el = id => document.getElementById(id);
const sessionKey = 'hana-math-reading:parent-session';
const status = el('account-status');
const form = el('account-form');
const signOut = el('sign-out');
const configured = /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(projectUrl) && Boolean(publishableKey);
const today = new Intl.DateTimeFormat('sv-SE', {timeZone:'Asia/Seoul', year:'numeric', month:'2-digit', day:'2-digit'}).format(new Date());
const currentMonth = () => new Date(today.slice(0,7) + '-01T12:00:00Z');
let month = currentMonth();
let monthlyEvents = [];
let session = null;
let version = 0;
let monthVersion = 0;
let expiryTimer;

function scheduleExpiry() {
  clearTimeout(expiryTimer);
  expiryTimer = setTimeout(() => forgetSession('로그인 시간이 지났습니다. 다시 로그인해 주세요.'), Math.max(0, session.until - Date.now()));
}

function dateKey(day) { return day.toISOString().slice(0,10); }
function addMonths(day, offset) { return new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth()+offset, 1, 12)); }
function cell(tag, text) {
  const node = document.createElement(tag);
  node.textContent = text;
  return node;
}
function showList(id, rows, empty) {
  const target = el(id);
  if (!target) return;
  target.replaceChildren();
  if (!rows.length) { target.textContent = empty; return; }
  const list = document.createElement('ul');
  list.className = 'family-list';
  for (const [title, description] of rows) {
    const item = document.createElement('li');
    item.append(cell('strong', title), cell('p', description));
    list.append(item);
  }
  target.append(list);
}
function renderMonth() {
  if (!el('calendar-grid')) return;
  const start = dateKey(month).slice(0,7);
  el('calendar-month').textContent = month.getUTCFullYear() + '년 ' + (month.getUTCMonth()+1) + '월';
  const table = document.createElement('table');
  table.setAttribute('aria-label', el('calendar-month').textContent + ' 달력');
  const header = table.createTHead().insertRow();
  for (const name of '일월화수목금토') { const th = cell('th',name); th.scope = 'col'; header.append(th); }
  const body = table.createTBody();
  let row = body.insertRow();
  for(let i=0;i<month.getUTCDay();i++) row.insertCell();
  const last = new Date(Date.UTC(month.getUTCFullYear(),month.getUTCMonth()+1,0)).getUTCDate();
  for (let day = 1; day <= last; day++) {
    if (row.cells.length === 7) row = body.insertRow();
    const date = start + '-' + String(day).padStart(2,'0');
    const td = row.insertCell(); td.textContent = String(day);
    if (date === today) td.setAttribute('aria-current','date');
    const events = monthlyEvents.filter(event => event.event_date === date);
    if (events.length) { td.append(cell('small', events.length + '건')); }
  }
  while (row.cells.length < 7) row.insertCell();
  el('calendar-grid').replaceChildren(table);
}
function clearPrivate() {
  monthlyEvents = [];
  renderMonth();
  showList('private-records', [], '학원이 자녀를 연결한 계정으로 로그인해 주세요.');
  showList('private-notices', [], '로그인 후 학부모 전용 공지를 확인할 수 있습니다.');
  showList('weekly-lessons', [], '로그인 후 자녀의 요일별 수업을 확인할 수 있습니다.');
  showList('calendar-events', [], '로그인 후 학원에서 등록한 일정을 확인할 수 있습니다.');
}
function forgetSession(message) {
  clearTimeout(expiryTimer);
  version++;
  session = null;
  try { sessionStorage.removeItem(sessionKey); } catch {}
  form.hidden = !configured;
  signOut.hidden = true;
  clearPrivate();
  status.textContent = message;
}
async function api(path, options = {}, token = session?.token) {
  const response = await fetch(projectUrl + path, {
    ...options, cache:'no-store',
    headers:{ apikey:publishableKey, ...(token ? {Authorization:'Bearer ' + token}:{}), 'Content-Type':'application/json' }
  });
  if (!response.ok) {
    const error = new Error('request failed'); error.status = response.status; throw error;
  }
  return response.status === 204 ? null : response.json();
}
const rows = query => api('/rest/v1/' + query);
async function loadMonth() {
  const request = ++monthVersion;
  const login = version;
  monthlyEvents = [];
  renderMonth();
  if (!el('calendar-events') || !session) return;
  el('calendar-events').textContent = '일정을 불러오는 중입니다.';
  try {
    const data = await rows('academy_events?select=event_date,title,detail&event_date=gte.' + dateKey(month) + '&event_date=lt.' + dateKey(addMonths(month,1)) + '&order=event_date.asc');
    if (request !== monthVersion || login !== version) return;
    monthlyEvents = data;
    renderMonth();
    showList('calendar-events',data.map(e=>[e.event_date + ' · ' + e.title,e.detail]),'이 달에 등록된 일정이 없습니다.');
  } catch (error) {
    if (request !== monthVersion || login !== version) return;
    if (error.status === 401) forgetSession('로그인 시간이 지났습니다. 다시 로그인해 주세요.');
    else el('calendar-events').textContent = '일정을 불러오지 못했습니다. 달을 다시 선택해 주세요.';
  }
}
async function loadFamily() {
  if (session.until <= Date.now()) {
    forgetSession('로그인 시간이 지났습니다. 다시 로그인해 주세요.');
    return;
  }
  scheduleExpiry();
  const current = ++version;
  form.hidden = true; signOut.hidden = false; clearPrivate();
  status.textContent = '학부모 정보를 불러오는 중입니다.';
  try {
    const students = await rows('academy_students?select=id,display_name&order=display_name');
    if (current !== version) return;
    const names = new Map(students.map(s=>[s.id,s.display_name]));
    status.textContent = names.size ? '연결된 자녀 · ' + [...names.values()].join(', ') : '가입된 계정입니다. 학원에 가입 이메일을 알려 자녀 연결을 요청해 주세요.';
    if (el('private-records')) {
      const [notes,announcements] = await Promise.all([
        rows('academy_records?select=student_id,lesson_date,subject,summary,homework&order=lesson_date.desc'),
        rows('academy_notices?select=posted_on,title,body&order=posted_on.desc')
      ]);
      if (current !== version) return;
      showList('private-records',notes.map(n=>[names.get(n.student_id) + ' · ' + n.subject + ' · ' + n.lesson_date,n.summary + (n.homework ? '\n가정 학습 · ' + n.homework : '')]), names.size ? '아직 등록된 수업 기록이 없습니다.' : '자녀 연결을 기다리고 있습니다.');
      showList('private-notices',announcements.map(n=>[n.title + ' · ' + n.posted_on,n.body]), '표시할 학부모 공지가 없습니다.');
    } else {
      const lessons = await rows('academy_lessons?select=student_id,weekday,start_time,end_time,subject&order=weekday.asc,start_time.asc');
      if (current !== version) return;
      showList('weekly-lessons',lessons.map(l=>['월화수목금토일'[l.weekday-1]+'요일 '+l.start_time.slice(0,5)+'–'+l.end_time.slice(0,5),names.get(l.student_id)+' · '+l.subject]),'연결된 주간 수업이 없습니다.');
      await loadMonth();
    }
  } catch(error) {
    if (current !== version) return;
    if (error.status===401) forgetSession('로그인 시간이 지났습니다. 다시 로그인해 주세요.');
    else { clearPrivate(); status.textContent='학원 자료를 불러오지 못했습니다. 잠시 후 페이지를 새로고침해 주세요.'; }
  }
}
form.addEventListener('submit',async event=>{
  event.preventDefault();
  const signup = event.submitter?.value==='signup';
  const email = form.elements.email.value.trim();
  const password = form.elements.password.value;
  const controls = [...form.querySelectorAll('button')];
  if (controls.some(b=>b.disabled)) return;
  controls.forEach(b=>b.disabled=true);
  status.textContent = signup ? '가입을 요청하는 중입니다.' : '로그인 중입니다.';
  try {
    const data = await api(signup ? '/auth/v1/signup' : '/auth/v1/token?grant_type=password', {method:'POST',body:JSON.stringify({email,password})},null);
    form.elements.password.value='';
    if (!data.access_token) {
      status.textContent='이메일 인증 안내를 확인한 뒤 로그인해 주세요. 이미 가입했다면 기존 비밀번호로 로그인해 주세요.';
      return;
    }
    session={token:data.access_token,until:Date.now()+data.expires_in*1000};
    try {sessionStorage.setItem(sessionKey,JSON.stringify(session));} catch {}
    await loadFamily();
  } catch(error) {
    status.textContent = error.status===429 ? '요청이 많습니다. 잠시 후 다시 시도해 주세요.' : signup ? '가입하지 못했습니다. 이메일 주소와 비밀번호를 확인해 주세요.' : '로그인하지 못했습니다. 인증 메일과 입력 정보를 확인해 주세요.';
  } finally {controls.forEach(b=>b.disabled=false);}
});
signOut.addEventListener('click',()=>{
  const token = session?.token;
  forgetSession('로그아웃했습니다.');
  if(token) api('/auth/v1/logout',{method:'POST'},token).catch(()=>{});
});
if (el('month-controls')) {
  renderMonth(); el('month-controls').hidden=false;
  el('month-controls').addEventListener('click',event=>{
    const control=event.target.closest('[data-offset]');
    if (!control) return;
    const offset=Number(control.dataset.offset);
    month=offset ? addMonths(month,offset) : currentMonth();
    loadMonth();
  });
}
if (configured) {
  try {session = JSON.parse(sessionStorage.getItem(sessionKey));} catch {}
  if (session?.token && session.until>Date.now()) loadFamily();
  else forgetSession('가입 이메일과 비밀번호로 로그인해 주세요.');
}
window.addEventListener('pageshow',event=>{
  if (!configured || !event.persisted) return;
  let restored;
  try {restored=JSON.parse(sessionStorage.getItem(sessionKey));} catch {}
  if(restored?.token && restored.until>Date.now()) {session=restored;loadFamily();}
  else forgetSession('다시 로그인해 주세요.');
});
