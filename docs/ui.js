(() => {
function rectangleFromWidth(value){const n=Number(value);const width=Number.isFinite(n)?Math.min(9,Math.max(1,Math.round(n))):3;return{width,height:10-width,area:width*(10-width),perimeter:20};}
function formatMemo(grade,study,question){return `[상담 준비 메모]\n현재 학년: ${grade.trim()||'미기재'}\n학습 내용: ${study.trim()||'미기재'}\n궁금한 점: ${question.trim()||'미기재'}\n\n※ 개인적으로 준비한 메모이며 상담 신청이 접수된 것은 아닙니다.`;}

const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
const header = document.querySelector('.header');

function setMenu(open) {
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  nav.classList.toggle('is-open', open);
}
menu.hidden = false;
menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('is-open')) {
    setMenu(false);
    menu.focus();
  }
});
for (const event of ['click', 'focusin']) {
  document.addEventListener(event, e => {
    if (!header.contains(e.target)) setMenu(false);
  });
}
nav.addEventListener('click', event => {
  if (event.target.closest('a')) setMenu(false);
});
window.addEventListener('pageshow', () => setMenu(false));
matchMedia('(max-width: 760px)').addEventListener('change', () => setMenu(false));

const topButton = document.querySelector('.to-top');
function updateTop() {
  topButton.hidden = window.scrollY < 550;
}
window.addEventListener('scroll', updateTop, { passive: true });
updateTop();
topButton.addEventListener('click', () => {
  document.querySelector('.header .brand').focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'auto' });
});

const slider = document.querySelector('#width-range');
if (slider) {
  const byId = id => document.getElementById(id);
  const down = byId('decrease');
  const up = byId('increase');
  function render() {
    const { width, height, area } = rectangleFromWidth(slider.value);
    const bounds = { x: 180 - width * 12, y: 135 - height * 12, width: width * 24, height: height * 24 };
    for (const name of ['shape-fill', 'shape-grid']) {
      for (const [key, value] of Object.entries(bounds)) byId(name).setAttribute(key, value);
    }
    for (const axis of ['x', 'y']) byId('squares').setAttribute(axis, bounds[axis]);
    byId('diagram-width').textContent = width + 'cm';
    byId('diagram-width').setAttribute('y', bounds.y - 14);
    byId('diagram-height').textContent = height + 'cm';
    byId('diagram-height').setAttribute('x', bounds.x + bounds.width + 12);
    byId('width-value').textContent = width;
    byId('height-value').textContent = height;
    byId('area-value').textContent = area;
    const description = `가로 ${width}cm, 세로 ${height}cm`;
    byId('rect-diagram').setAttribute('aria-label', description + '인 직사각형');
    slider.setAttribute('aria-valuetext', description);
    byId('lab-status').textContent = `가로 ${width}cm × 세로 ${height}cm = 넓이 ${area}cm²`;
    down.disabled = width <= Number(slider.min);
    up.disabled = width >= Number(slider.max);
  }
  slider.addEventListener('input', render);
  down.addEventListener('click', () => { slider.stepDown(); render(); });
  up.addEventListener('click', () => { slider.stepUp(); render(); });
  render();
}

const memo = document.querySelector('.memo-form');
if (memo) {
  const grade = memo.querySelector('#student-grade');
  const study = memo.querySelector('#study-note');
  const question = memo.querySelector('#question-note');
  const result = memo.querySelector('#memo-result');
  const output = memo.querySelector('#memo-output');
  const status = memo.querySelector('#copy-status');
  const content = () => formatMemo(grade.value, study.value, question.value);
  function refresh() {
    if (!result.hidden) {
      output.value = content();
      status.textContent = '입력한 내용으로 메모를 갱신했습니다.';
    }
  }
  grade.addEventListener('change', refresh);
  study.addEventListener('input', refresh);
  question.addEventListener('input', refresh);
  memo.querySelector('#make-memo').addEventListener('click', () => {
    output.value = content();
    result.hidden = false;
    status.textContent = '메모를 만들었습니다. 내용을 확인하고 복사해 주세요.';
    output.focus();
  });
  memo.querySelector('#copy-memo').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(output.value);
      status.textContent = '메모를 복사했습니다.';
    } catch {
      output.focus();
      output.select();
      status.textContent = '선택한 내용을 복사 메뉴에서 직접 복사해 주세요.';
    }
  });
}

const archiveControls = document.querySelector('.archive-controls');
if (archiveControls) {
  const buttons = [...archiveControls.querySelectorAll('button')];
  const rows = [...document.querySelectorAll('.post-row')];
  const count = document.querySelector('.archive-count');
  archiveControls.hidden = false;
  for (const button of buttons) {
    button.addEventListener('click', () => {
      const topic = button.dataset.filter;
      for (const item of buttons) item.setAttribute('aria-pressed', String(item === button));
      for (const row of rows) row.hidden = topic !== '전체' && row.dataset.topic !== topic;
      count.textContent = topic + ' ' + rows.filter(row => !row.hidden).length + '편';
    });
  }
}

})();
