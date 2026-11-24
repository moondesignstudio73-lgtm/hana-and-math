import { postList } from './academy-archive.mjs';

const arrow = '<span aria-hidden="true">↗</span>';
const clockFace = `<span class="lesson-clock" aria-hidden="true"><i class="hour-hand"></i><i class="minute-hand"></i><b></b></span>`;
const paperBook = '<span class="paper-book" aria-hidden="true"><i></i><i></i><b></b></span>';

export const entrance = `<section class="arrival" aria-labelledby="arrival-title">
<img class="arrival-photo" src="assets/reading-classroom.jpg" alt="" fetchpriority="high">
<div class="arrival-copy"><p class="academy-name">하나수학앤독서학원</p><h1 id="arrival-title">수학을 풀고,<br>생각을 씁니다.</h1><p>나의 풀이를 설명하고,<br>읽은 이야기를 내 문장으로.</p></div>
<a class="arrival-enter" href="#classrooms" aria-label="교실 선택 화면 열기"><span>SCROLL DOWN</span><b aria-hidden="true">↓</b></a></section>
<section id="classrooms" class="classrooms" tabindex="-1" aria-labelledby="classroom-title">
<div class="classrooms-intro"><h2 id="classroom-title">하나의<br> 두 교실</h2><p>아이에게 맞는 수업을 만나보세요.</p><a href="home.html">홈페이지 바로가기 <span aria-hidden="true">→</span></a></div>
<div class="classrooms-choices"><a href="math.html"><div><h3>초등수학</h3><p>시계를 돌리고, 나의 풀이를 설명해요.</p><strong>수학 교실 들어가기 →</strong></div><span class="class-art" aria-hidden="true">${clockFace}</span></a>
<a href="reading.html"><div><h3>독서논술</h3><p>책에서 만난 말을 내 문장으로 써요.</p><strong>독서 교실 들어가기 →</strong></div><span class="class-art" aria-hidden="true">${paperBook}</span></a></div></section>`;

const classroom = (topic, title, lead, photo, alt, activity) => `<section class="room-cover"><div class="wrap room-layout"><div><a class="room-back" href="index.html#classrooms">← 교실 선택</a><h1>${title}</h1><p>${lead}</p></div><img src="assets/${photo}" alt="${alt}" fetchpriority="high"></div></section>
<section class="wrap lesson-play">${activity}</section><section class="wrap room-posts"><div class="archive-head"><h2>${title} 수업 기록</h2><a href="journal.html#posts">전체 기록 보기 →</a></div>${postList(topic)}</section>`;

export const mathRoom = classroom('초등수학','초등수학','자기 속도로 문제를 풀고, 친구들 앞에서 생각한 순서를 설명합니다.','clock-workshop.jpg','시계 학습지에 시간을 그려 넣는 수업',
`<div class="play-object math-object">${clockFace}</div><div><h2>시곗바늘을 움직여 보세요</h2><p>3시부터 5분씩 움직이면 짧은바늘은 어떻게 달라질까요?</p><output id="clock-time" aria-live="polite">3시 정각</output><div class="play-controls" data-clock hidden><button type="button" data-minutes="-5">− 5분</button><button type="button" data-minutes="5">+ 5분</button><button type="button" data-reset>처음으로</button></div><a class="text-link" href="learning.html#math-lab">도형으로 넓이 비교하기 →</a></div>`);

export const readingRoom = classroom('독서','독서논술','책을 읽기 전에 어휘를 익히고, 이야기 속에서 다시 만나고, 내 말로 표현합니다.','reading-workbook.jpg','낱말과 문장을 기록하는 독서 활동지',
`<div class="play-object reading-object">${paperBook}</div><div><h2>한 단어로 달라지는 장면</h2><p>같은 빗소리도 소리를 흉내 내는 말에 따라 다르게 들려요.</p><p class="word-line" aria-live="polite">창밖에 비가 <strong id="rain-word">보슬보슬</strong> 내렸어요.</p><div class="play-controls" data-words hidden>${['보슬보슬','주룩주룩','후두둑'].map((word,i)=>`<button type="button" aria-pressed="${i===0}">${word}</button>`).join('')}</div></div>`);
