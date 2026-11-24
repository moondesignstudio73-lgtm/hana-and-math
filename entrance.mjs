import { postList } from './academy-archive.mjs';

const arrow = '<span aria-hidden="true">↗</span>';
const clockFace = `<span class="lesson-clock" aria-hidden="true"><i class="hour-hand"></i><i class="minute-hand"></i><b></b></span>`;
const paperBook = '<span class="paper-book" aria-hidden="true"><i></i><i></i><b></b></span>';

export const entrance = `<section class="opening" aria-labelledby="opening-title">
<picture><source media="(max-width:650px)" srcset="assets/clock-workshop.jpg"><img class="opening-photo" src="assets/math-notebook.jpg" alt="" fetchpriority="high"></picture>
<div class="opening-wash"></div><div class="wrap opening-copy"><h1 id="opening-title">수학을 풀고,<br><span>생각을 씁니다.</span></h1><p>나의 풀이를 설명하고, 읽은 이야기를 내 문장으로.</p></div>
<a class="opening-scroll" href="#classrooms"><span aria-hidden="true">↓</span> 교실 선택하기</a></section>
<section class="doorway" id="classrooms" aria-labelledby="choose-title"><div class="wrap"><div class="door-heading"><h2 id="choose-title">어느 교실로 갈까요?</h2><a class="door-home" href="home.html">홈페이지 바로가기 ${arrow}</a></div>
<div class="door-grid"><a class="class-door math-door" href="math.html"><div class="door-art">${clockFace}</div><div class="door-copy"><h3>초등수학</h3><p>시계를 돌리고, 풀이를 설명하는 교실</p></div><span class="door-arrow" aria-hidden="true">↗</span></a>
<a class="class-door reading-door" href="reading.html"><div class="door-art">${paperBook}</div><div class="door-copy"><h3>독서논술</h3><p>책에서 만난 말을 내 문장으로 쓰는 교실</p></div><span class="door-arrow" aria-hidden="true">↗</span></a></div></div></section>`;

const classroom = (topic, title, lead, photo, alt, activity) => `<section class="room-cover"><div class="wrap room-layout"><div><a class="room-back" href="index.html#classrooms">← 교실 선택</a><h1>${title}</h1><p>${lead}</p></div><img src="assets/${photo}" alt="${alt}" fetchpriority="high"></div></section>
<section class="wrap lesson-play">${activity}</section><section class="wrap room-posts"><div class="archive-head"><h2>${title} 수업 기록</h2><a href="journal.html#posts">전체 기록 보기 →</a></div>${postList(topic)}</section>`;

export const mathRoom = classroom('초등수학','초등수학','자기 속도로 문제를 풀고, 친구들 앞에서 생각한 순서를 설명합니다.','clock-workshop.jpg','시계 학습지에 시간을 그려 넣는 수업',
`<div class="play-object math-object">${clockFace}</div><div><h2>시곗바늘을 움직여 보세요</h2><p>3시부터 5분씩 움직이면 짧은바늘은 어떻게 달라질까요?</p><output id="clock-time" aria-live="polite">3시 정각</output><div class="play-controls" data-clock hidden><button type="button" data-minutes="-5">− 5분</button><button type="button" data-minutes="5">+ 5분</button><button type="button" data-reset>처음으로</button></div><a class="text-link" href="learning.html#math-lab">도형으로 넓이 비교하기 →</a></div>`);

export const readingRoom = classroom('독서','독서논술','책을 읽기 전에 어휘를 익히고, 이야기 속에서 다시 만나고, 내 말로 표현합니다.','reading-workbook.jpg','낱말과 문장을 기록하는 독서 활동지',
`<div class="play-object reading-object">${paperBook}</div><div><h2>한 단어로 달라지는 장면</h2><p>같은 빗소리도 소리를 흉내 내는 말에 따라 다르게 들려요.</p><p class="word-line" aria-live="polite">창밖에 비가 <strong id="rain-word">보슬보슬</strong> 내렸어요.</p><div class="play-controls" data-words hidden>${['보슬보슬','주룩주룩','후두둑'].map((word,i)=>`<button type="button" aria-pressed="${i===0}">${word}</button>`).join('')}</div></div>`);
