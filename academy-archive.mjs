const blog = 'https://blog.naver.com/nowclasssw';
const posts = [
  ['224471515286','2026-11-10','초등수학','시계 공부 미리 시작해야 하는 이유!','시침과 분침을 구분하고 5분씩 세어 보면서, 시각 읽기에서 지난 시간 계산으로 나아갑니다.'],
  ['224463545474','2026-11-03','학원 소식','11월 하나수학앤독서학원 소식','11월 수업 일정과 학생 미션, 시상 및 겨울방학 특강 소식을 전합니다.'],
  ['224457366522','2026-10-29','초등수학','선생님이 바로 답을 알려주지 않는 이유','문제를 보고 막혔을 때, 무엇을 구하는지와 어떤 조건이 있는지 질문으로 짚어 보는 수업입니다.'],
  ['224450858010','2026-10-23','독서','어휘 공부를 해도 글을 잘 못 읽어요.','낯선 단어를 먼저 만나고, 책 속 문장에서 다시 읽고, 새 단어로 짧은 글을 써 봅니다.'],
  ['224436115646','2026-10-09','독서','책을 읽어도 무슨 말인지 이해를 못 한다면?','책을 많이 읽어도 내용을 설명하기 어려운 아이를 위해 읽기와 이해의 관계를 살펴봅니다.'],
  ['224426921224','2026-09-30','학원 소식','10월 하나수학앤독서학원 소식','10월 수업 운영과 독서 지원, 학습 보상 프로그램을 담은 소식입니다.'],
  ['224414018325','2026-09-16','독서','혼자 책 읽기 싫어하는 자녀가 있나요?','친구들과 같은 책을 읽고 자신의 경험을 이야기하며 서로의 표현을 듣는 독서 수업입니다.'],
  ['224379612019','2026-08-15','초등수학','문제집보다 칠판이 더 재미있는 수학 시간','각자 생각한 풀이를 칠판에 적고, 그 방법을 고른 이유를 친구들에게 설명합니다.'],
  ['224377220558','2026-08-13','초등수학','개별 진도 수학의 장점','초등 저·중학년의 개인별 학습과 수준이 비슷한 친구들이 모이는 주 1회 판서 수업을 소개합니다.'],
  ['224339154958','2026-07-07','초등수학',"'하나수학&독서학원' 에서는 이렇게 지도합니다.",'도형을 직접 그리며 밑변과 높이를 찾고, 같은 넓이를 여러 방법으로 표현해 봅니다.'],
  ['223898471208','2025-06-13','독서','감정 카드 활용 독서','책을 읽고 마음에 남은 감정을 카드에서 골라 말로 표현해 보는 활동입니다.'],
  ['223394699086','2024-03-25','학원 소식','하나수학앤독서학원 보강 안내','결석 시 보강 기준과 인원에 따른 진행 시간을 정리한 공지입니다.']
];
export const subjects = ['초등수학','독서','학원 소식'];
const escape = text => text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const outside = 'target="_blank" rel="noopener noreferrer"';
export function postList(topic) {
  return posts.filter(post => !topic || post[2] === topic).map(([id,date,subject,title,description]) => `<article class="post-row" data-topic="${subject}"><div class="post-info"><span>${subject}</span><time datetime="${date}">${date.replaceAll('-','.')}</time></div><div><h3><a href="${blog}/${id}" ${outside}>${escape(title)}</a></h3><p>${description}</p></div><span class="post-arrow" aria-hidden="true">↗</span></article>`).join('');
}
export const curriculum = `<section class="wrap courses" id="curriculum"><h2>수학·독서 교육과정</h2><div class="course-grid">
<article><img src="assets/clock-workshop.jpg" alt="시계 학습지에 시각을 표시하는 수학 활동" loading="lazy"><div><h3><a class="course-title" href="math.html">초등수학 ↗</a></h3><p>초등 저·중학년은 각자의 속도로 진도를 나갑니다. 주 1회는 수준이 비슷한 친구들과 칠판에 풀이를 적고 생각한 과정을 설명합니다.</p><a class="text-link" href="${blog}/224377220558" ${outside}>개별 진도 수업 읽기 ↗</a></div></article>
<article><img src="assets/reading-workbook.jpg" alt="학원 독서 수업 중 작성하는 활동지" loading="lazy"><div><h3><a class="course-title" href="reading.html">독서·논술 ↗</a></h3><p>책을 펼치기 전 낯선 어휘를 익히고, 읽으며 그 단어를 다시 만납니다. 책을 덮은 뒤에는 새로 배운 말로 짧은 글을 쓰고 발표합니다.</p><a class="text-link" href="${blog}/224450858010" ${outside}>어휘 수업 읽기 ↗</a></div></article>
</div></section>`;
export function archiveSection() {
  return `<section class="wrap archive" id="posts"><div class="archive-head"><h2>수업 기록과 공지</h2><a href="${blog}" ${outside}>블로그 전체 글 ↗</a></div><div class="archive-controls" hidden role="group" aria-label="게시물 분류">${['전체',...subjects].map((s,i)=>`<button type="button" data-filter="${s}" aria-pressed="${i===0}">${s}</button>`).join('')}</div><p class="archive-count" role="status">전체 ${posts.length}편</p>${postList()}</section>`;
}
