import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import fs from 'node:fs';

const dom = new JSDOM(
  '<!doctype html><body><div id="wrap"></div><div id="lms-plus-root"></div></body>',
  { url: 'https://lms.pknu.ac.kr/ilos/main/main_form.acl' },
);
for (const name of [
  'window',
  'document',
  'HTMLElement',
  'HTMLDialogElement',
  'MutationObserver',
  'Event',
  'MouseEvent',
])
  globalThis[name] = dom.window[name];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
dom.window.HTMLDialogElement.prototype.showModal = function () {
  this.setAttribute('open', '');
};
dom.window.HTMLDialogElement.prototype.close = function () {
  this.removeAttribute('open');
};
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { HomePage: Home } = await server.ssrLoadModule('/src/pages/home/HomePage.tsx');
  const adapter = {
    ...(await server.ssrLoadModule('/src/adapter/home.ts')),
    ...(await server.ssrLoadModule('/src/adapter/session.ts')),
    ...(await server.ssrLoadModule('/src/adapter/notices.ts')),
    ...(await server.ssrLoadModule('/src/adapter/courses.ts')),
    ...(await server.ssrLoadModule('/src/content/lifecycle.ts')),
  };
  const { pendingFeed } = await server.ssrLoadModule('/src/models/feed.ts');
  const { localDateKey } = await server.ssrLoadModule('/src/models/calendar.ts');
  const { todoDday } = await server.ssrLoadModule('/src/models/todo.ts');
  assert.equal(todoDday('2030-09-16T23:59:00+09:00', new Date('2030-09-12T00:01:00+09:00')), 'D-4');
  assert.equal(todoDday('2030-09-13T23:59:00+09:00', new Date('2030-09-12T14:59:59Z')), 'D-1');
  assert.equal(todoDday('2030-09-13T23:59:00+09:00', new Date('2030-09-12T15:00:00Z')), 'D-day');
  assert.equal(todoDday('2030-09-13T23:59:00+09:00', new Date('2030-09-14T00:00:00+09:00')), 'D+1');
  assert.equal(todoDday('invalid'), undefined);
  const root = createRoot(document.getElementById('lms-plus-root'));
  const base = () => ({
    session: { status: 'authenticated', name: null },
    courses: pendingFeed(),
    notices: pendingFeed(),
    events: pendingFeed(),
    todos: pendingFeed(),
    messages: pendingFeed(),
    notifications: pendingFeed(),
  });
  let key = 0;
  const render = async (data) =>
    act(() =>
      root.render(
        React.createElement(Home, {
          initialData: data,
          key: ++key,
          onRestore: adapter.showOriginalLms,
        }),
      ),
    );
  const click = async (selector) => {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    assert.ok(element, `Missing control: ${selector}`);
    await act(() => element.click());
  };
  const buttonText = (text, scope = document) =>
    [...scope.querySelectorAll('button')].find((button) => button.textContent === text);
  const dialog = () => document.querySelector('dialog[open]');

  await render({ ...base(), session: { status: 'guest', name: null } });
  assert.ok(document.querySelector('.lp-login'));
  assert.equal(document.querySelector('.lp-profile'), null);
  assert.equal(document.querySelectorAll('.lp-card-title svg').length, 5);
  assert.equal(document.querySelectorAll('.lp-badge').length, 0);
  const universityLinks = [...document.querySelectorAll('.lp-university-links a')];
  assert.equal(universityLinks.length, 3);
  assert.deepEqual(
    universityLinks.map((link) => new URL(link.href).hostname),
    ['www.pknu.ac.kr', 'portal.pknu.ac.kr', 'pknuai.pknu.ac.kr'],
  );
  for (const link of universityLinks) {
    assert.equal(link.target, '_blank');
    assert.ok(link.rel.includes('noopener'));
    assert.ok(link.querySelector('img').getAttribute('src'));
  }
  assert.equal(document.querySelectorAll('.lp-header').length, 1);
  assert.equal(document.querySelectorAll('main#lp-main').length, 1);
  assert.equal(document.querySelectorAll('.lp-footer').length, 1);

  await click('[aria-label="쪽지"]');
  assert.match(dialog().textContent, /로그인이 필요해요/);
  await click('[aria-label="닫기"]');
  assert.equal(dialog(), null);

  await render({ ...base(), session: { status: 'unknown', name: null } });
  assert.equal(
    document.querySelector('.lp-profile').getAttribute('aria-label'),
    '로그인 상태 확인',
  );
  await render({
    ...base(),
    session: { status: 'authenticated', name: null, photoUrl: '/test/avatar.png' },
  });
  assert.equal(
    document.querySelector('.lp-avatar img').src,
    'https://lms.pknu.ac.kr/test/avatar.png',
  );
  await act(() => document.querySelector('.lp-avatar img').dispatchEvent(new Event('error')));
  assert.equal(document.querySelector('.lp-avatar img'), null);
  assert.ok(document.querySelector('.lp-avatar svg'));
  await render({
    ...base(),
    session: {
      status: 'authenticated',
      name: null,
      photoUrl: '/test/photo.acl?id=TEST&ext=jpg&size=32',
    },
  });
  assert.equal(
    new URL(document.querySelector('.lp-avatar img').src).searchParams.get('size'),
    '32',
  );
  assert.equal(
    new URL(document.querySelector('.lp-avatar img').src).searchParams.get('id'),
    'TEST',
  );
  // Unrelated image endpoints must not have their size rewritten.
  assert.equal(
    document.querySelector('.lp-avatar img').getAttribute('referrerpolicy'),
    'same-origin',
  );
  await act(() => document.querySelector('.lp-avatar img').dispatchEvent(new Event('error')));
  assert.ok(document.querySelector('.lp-avatar svg'));
  await render({
    ...base(),
    session: {
      status: 'authenticated',
      name: null,
      photoUrl: '/ilos/mp/user_image_view.acl?id=TEST&ext=jpg&size=32',
    },
  });
  assert.equal(
    document.querySelector('.lp-avatar img').src,
    'https://lms.pknu.ac.kr/ilos/mp/user_image_view.acl?id=TEST&ext=jpg&size=100',
  );
  await act(() => document.querySelector('.lp-avatar img').dispatchEvent(new Event('error')));
  assert.equal(
    new URL(document.querySelector('.lp-avatar img').src).searchParams.get('size'),
    '32',
  );
  await act(() => document.querySelector('.lp-avatar img').dispatchEvent(new Event('error')));
  assert.ok(document.querySelector('.lp-avatar svg'));
  await render({
    ...base(),
    session: {
      status: 'authenticated',
      name: null,
      photoUrl: '/ilos/mp/user_image_view.acl?id=TEST&ext=jpg&size=100',
    },
  });
  assert.equal(
    new URL(document.querySelector('.lp-avatar img').src).searchParams.get('size'),
    '100',
  );
  await render({
    ...base(),
    session: { status: 'authenticated', name: null, photoUrl: 'https://evil.example/avatar.png' },
  });
  assert.equal(document.querySelector('.lp-avatar img'), null);
  await render(base());
  assert.match(document.querySelector('.lp-profile').textContent, /내 프로필/);
  assert.doesNotMatch(
    document.querySelector('.lp-calendar-detail').textContent,
    /등록된 일정이 없/,
  );
  const currentMonth = document.querySelector('.lp-month strong').textContent;
  await click('[aria-label="다음 달"]');
  assert.notEqual(document.querySelector('.lp-month strong').textContent, currentMonth);
  await click(buttonText('오늘'));
  assert.equal(document.querySelector('.lp-month strong').textContent, currentMonth);
  await click(
    [...document.querySelectorAll('.lp-day')].find(
      (day) => !day.classList.contains('is-outside') && !day.classList.contains('is-selected'),
    ),
  );
  assert.equal(document.querySelectorAll('.lp-day[aria-pressed="true"]').length, 1);

  // Synthetic records exist only in this test; never shipped as LMS data.
  const ready = base();
  ready.todos = {
    status: 'ready',
    items: [
      {
        id: 'late',
        title: 'TEST LATE',
        kind: '과제',
        course: 'TEST',
        deadline: '2030-09-20T09:00:00+09:00',
      },
      {
        id: 'early',
        title: 'TEST EARLY',
        kind: '시험',
        course: 'TEST',
        deadline: '2030-09-10T09:00:00+09:00',
      },
    ],
  };
  ready.events = {
    status: 'ready',
    items: [{ id: 'event', title: 'TEST EVENT', date: localDateKey(new Date()) }],
  };
  ready.notices = {
    status: 'ready',
    items: [
      {
        id: 'notice',
        title: 'TEST NOTICE',
        date: '2030.09.01',
        category: 'TEST',
        body: 'TEST BODY',
      },
    ],
  };
  ready.messages = {
    status: 'ready',
    items: [
      { id: 'unread', title: 'TEST UNREAD', description: '', date: '', unread: true },
      { id: 'read', title: 'TEST READ', description: '', date: '', unread: false },
    ],
  };
  ready.publicCourses = {
    status: 'ready',
    items: [{ id: 'catalog', title: 'TEST CATALOG', subtitle: 'TEST SUBTITLE' }],
  };
  await render(ready);
  assert.match(document.querySelector('.lp-todo-row').textContent, /TEST EARLY/);
  assert.equal(document.querySelector('.lp-todo-meta .lp-kind').textContent, '시험');
  assert.match(
    document.querySelector('.lp-todo-meta .lp-todo-dday').textContent,
    /^D(?:-day|[-+]\d+)$/,
  );
  assert.match(document.querySelector('.lp-todo-content').textContent, /TEST EARLY/);
  await click(
    [...document.querySelectorAll('.lp-todo-tabs button')].find((button) =>
      button.textContent.startsWith('과제'),
    ),
  );
  assert.equal(document.querySelectorAll('.lp-todo-row').length, 1);
  // Extracted card/dialog lists must keep the page's shared filter state.
  await click(buttonText('전체보기'));
  assert.equal(dialog().querySelectorAll('.lp-todo-row').length, 1);
  assert.match(dialog().querySelector('.lp-todo-row').textContent, /TEST LATE/);
  await click(
    [...dialog().querySelectorAll('.lp-todo-tabs button')].find((button) =>
      button.textContent.startsWith('시험'),
    ),
  );
  await click('[aria-label="닫기"]');
  assert.equal(document.querySelectorAll('.lp-todo-row').length, 1);
  assert.match(document.querySelector('.lp-todo-row').textContent, /TEST EARLY/);
  assert.match(document.querySelector('.lp-calendar-detail').textContent, /TEST EVENT/);
  assert.ok(document.querySelector('.lp-day i'));
  await click('.lp-notice-list button');
  assert.match(dialog().textContent, /TEST BODY/);
  await click('[aria-label="닫기"]');
  await click('[aria-label="쪽지"]');
  assert.equal(dialog().querySelectorAll('.lp-inbox-item').length, 2);
  await click(buttonText('읽지 않음', dialog()));
  assert.equal(dialog().querySelectorAll('.lp-inbox-item').length, 1);
  await act(() => dialog().dispatchEvent(new Event('cancel', { cancelable: true })));
  assert.equal(dialog(), null);
  assert.deepEqual(
    [...document.querySelectorAll('.lp-nav button')].map((button) => button.textContent),
    ['교육현황', '커뮤니티', '소개'],
  );
  for (const button of document.querySelectorAll('.lp-nav button')) {
    assert.equal(button.disabled, true);
    await click(button);
    assert.equal(dialog(), null);
  }
  assert.equal(document.querySelector('.lp-nav .is-active'), null);
  assert.equal(document.querySelectorAll('.lp-resource-grid a').length, 4);
  assert.ok(document.querySelector('.lp-resource-grid a[href$="share_group_list_form.acl"]'));
  assert.ok(document.querySelector('.lp-resource-grid a[href$="courseware_list_form.acl"]'));
  await click(buttonText('LMS+ 소개'));
  assert.ok(dialog());
  await click('[aria-label="닫기"]');
  await click(
    [...document.querySelectorAll('.lp-quick-grid button')].find((button) =>
      button.textContent.includes('FAQ'),
    ),
  );
  assert.equal(dialog().querySelectorAll('details').length, 4);
  await click('[aria-label="닫기"]');
  assert.equal(
    [...document.querySelectorAll('button')].filter((button) =>
      button.textContent.includes('원본 LMS 보기'),
    ).length,
    1,
  );
  await render({
    ...base(),
    events: { status: 'error', items: [] },
    todos: { status: 'loading', items: [] },
  });
  assert.match(document.querySelector('.lp-calendar-detail').textContent, /불러오지 못했/);
  assert.ok(document.querySelector('.lp-todo .lp-loading'));
  // Course navigation is now composed by the page, not the DOM adapter.
  // Exercise the real card callback so restoration must precede the LMS handler.
  const courseSource = document.getElementById('wrap');
  courseSource.innerHTML = '<em class="sub_open" kj="ui-course">[TEST] UI COURSE (01)</em>';
  let courseClicks = 0;
  courseSource.querySelector('em').onclick = () => {
    assert.equal(document.body.classList.contains('lms-plus-home-page'), false);
    courseClicks += 1;
  };
  const originalCourseMarkup = courseSource.innerHTML;
  await render({
    ...base(),
    courses: {
      status: 'ready',
      items: [{ courseId: 'ui-course', name: 'UI COURSE', campus: 'TEST', section: '01' }],
    },
  });
  document.body.classList.add('lms-plus-home-page');
  await click('.lp-course-row');
  assert.equal(courseClicks, 1);
  assert.equal(courseSource.innerHTML, originalCourseMarkup);
  await act(() => root.unmount());

  const original = document.getElementById('wrap');
  original.innerHTML =
    '<div id="header"><li class="header_login login-btn-color">로그인</li></div>';
  assert.equal(adapter.getSession().status, 'guest');
  original.innerHTML =
    '<div id="header"><strong id="user">TEST USER</strong></div><em class="sub_open" kj="test-course">[TEST] TEST COURSE (01)</em>';
  assert.equal(adapter.getSession().name, 'TEST USER');
  const photo = document.createElement('img');
  photo.id = 'user_photo';
  photo.src = '/test/avatar.png';
  original.querySelector('#header').append(photo);
  assert.equal(adapter.getSession().photoUrl, 'https://lms.pknu.ac.kr/test/avatar.png');
  let profileUpdate;
  const stopProfile = adapter.observeHome((data) => {
    profileUpdate = data.session;
  });
  photo.src = '/test/updated.png';
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(profileUpdate.photoUrl, 'https://lms.pknu.ac.kr/test/updated.png');
  let selectedPhoto = 'https://lms.pknu.ac.kr/test/avatar-2x.png';
  Object.defineProperty(photo, 'currentSrc', { configurable: true, get: () => selectedPhoto });
  photo.dispatchEvent(new Event('load'));
  assert.equal(profileUpdate.photoUrl, selectedPhoto);
  selectedPhoto = 'https://evil.example/avatar-2x.png';
  assert.equal(adapter.getSession().photoUrl, 'https://lms.pknu.ac.kr/test/updated.png');
  selectedPhoto = '';
  photo.src = 'https://evil.example/avatar.png';
  assert.equal(adapter.getSession().photoUrl, undefined);
  stopProfile();
  const lastPhotoUpdate = profileUpdate;
  selectedPhoto = 'https://lms.pknu.ac.kr/test/after-stop.png';
  photo.dispatchEvent(new Event('load'));
  assert.equal(profileUpdate, lastPhotoUpdate);
  delete photo.currentSrc;

  assert.equal(adapter.getCourses()[0].name, 'TEST COURSE');
  document.body.classList.add('lms-plus-home-page');
  let clicked = false;
  original.querySelector('em').onclick = () => {
    clicked = true;
    assert.equal(document.body.classList.contains('lms-plus-home-page'), false);
  };
  adapter.showOriginalLms();
  adapter.openCourse('test-course');
  assert.equal(clicked, true);
  original.innerHTML = '';
  assert.equal(adapter.getSession().status, 'unknown');
  adapter.openCourse('missing');
  original.innerHTML =
    '<div id="contentsIndex"><div class="index-leftarea02"><li><a class="site-link" href="/ilos/community/notice_view_form.acl?ARTL_NUM=test">[TEST] TEST NOTICE</a><span class="date">2030.01.01</span></li></div></div>';
  assert.equal(adapter.getNotices().items[0].category, 'TEST');
  assert.equal(adapter.getNotices().items[0].date, '2030.01.01');
  let observed;
  const disconnect = adapter.observeHome((data) => {
    observed = data;
  });
  original.querySelector('.site-link').textContent = 'TEST UPDATED';
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(observed.notices.items[0].title, 'TEST UPDATED');
  disconnect();
  const { safeLmsHref } = await server.ssrLoadModule('/src/adapter/urls.ts');
  assert.ok(safeLmsHref('/ilos/community/notice_view_form.acl?ARTL_NUM=test'));
  for (const value of [
    'javascript:alert(1)',
    'data:text/html,TEST',
    '//evil.example/ilos/main/main_form.acl',
    'https://lms.pknu.ac.kr.evil.example/ilos/main/main_form.acl',
    'https://user:pass@lms.pknu.ac.kr/ilos/main/main_form.acl',
    '/ilos/main/schedule_delete.acl',
    '/ilos/\\evil.example/main_form.acl',
  ])
    assert.equal(safeLmsHref(value), undefined);
  original.innerHTML =
    '<div id="header"><li class="header_login login-btn-color">로그인</li></div><em class="sub_open" kj="stale">[TEST] STALE COURSE (01)</em>';
  assert.equal(adapter.getHomeData().courses.items.length, 0);

  const { parseTodos, loadTodos, openTodo } = await server.ssrLoadModule('/src/adapter/todos.ts');
  const todoFixture = `<script>globalThis.__todoInjected = true</script>
    <div class="todo_wrap on" onclick="goLecture('A20300000000001','123','project')">
      <div class="todo_title">[팀프로젝트] TEST TASK</div><div class="todo_subjt">TEST COURSE</div>
      <div class="todo_date"><span class="todo_d_day">D-3</span><span class="todo_date">2030.09.13 23:59</span></div>
    </div><div id="no_data" class="todo_wrap no_data">조회할 자료가 없습니다.</div>`;
  const parsedTodo = parseTodos(todoFixture);
  assert.equal(parsedTodo.status, 'ready');
  assert.equal(parsedTodo.items.length, 1);
  assert.equal(parsedTodo.items[0].kind, '팀프로젝트');
  assert.equal(parsedTodo.items[0].deadline, '2030-09-13T23:59:00+09:00');
  assert.equal(globalThis.__todoInjected, undefined);
  assert.equal(parseTodos('<div id="no_data" class="todo_wrap no_data"></div>').status, 'ready');
  assert.equal(parseTodos('<form>login required</form>').status, 'error');
  assert.equal(parseTodos(todoFixture.replace('2030.09.13', '2030.02.30')).status, 'error');
  assert.equal(parseTodos(todoFixture.replace("'project'", "'unknown'")).status, 'error');
  assert.equal(parseTodos(todoFixture.replace('goLecture(', 'evil(')).status, 'error');
  assert.equal(parseTodos(todoFixture + todoFixture).status, 'error');
  const beforeTodoFetch = globalThis.fetch;
  const { useTodos } = await server.ssrLoadModule('/src/pages/home/useTodos.ts');
  const probeHost = document.createElement('div');
  const probeRoot = createRoot(probeHost);
  let currentTodos;
  function TodoProbe({ status }) {
    currentTodos = useTodos(status);
    return null;
  }
  try {
    let resolveList;
    let listSignal;
    let calls = 0;
    globalThis.fetch = (_url, options) => {
      calls++;
      listSignal = options.signal;
      return new Promise((resolve) => {
        resolveList = resolve;
      });
    };
    await act(() => probeRoot.render(React.createElement(TodoProbe, { status: 'guest' })));
    assert.equal(calls, 0);
    await act(() => probeRoot.render(React.createElement(TodoProbe, { status: 'authenticated' })));
    assert.equal(currentTodos.status, 'loading');
    await act(async () => {
      resolveList(new Response(todoFixture, { headers: { 'Content-Type': 'text/html' } }));
    });
    assert.equal(currentTodos.items.length, 1);
    await act(() => probeRoot.render(React.createElement(TodoProbe, { status: 'guest' })));
    assert.equal(currentTodos.items.length, 0);
    assert.equal(listSignal.aborted, true);
    await act(() => probeRoot.render(React.createElement(TodoProbe, { status: 'authenticated' })));
    await act(() => probeRoot.unmount());
    assert.equal(listSignal.aborted, true);
    await act(async () => {
      resolveList(new Response(todoFixture, { headers: { 'Content-Type': 'text/html' } }));
    });
    const signal = new AbortController().signal;
    globalThis.fetch = async (url, options) => {
      assert.equal(url, '/ilos/mp/todo_list.acl');
      assert.equal(options.method, 'POST');
      assert.equal(options.credentials, 'same-origin');
      assert.equal(options.redirect, 'error');
      assert.equal(options.signal, signal);
      assert.equal(options.body.get('todoKjList'), '');
      assert.equal(options.body.get('chk_cate'), 'ALL');
      return new Response(todoFixture, { headers: { 'Content-Type': 'text/html' } });
    };
    assert.equal((await loadTodos(signal)).items.length, 1);
    globalThis.fetch = async () => new Response('login', { status: 401 });
    assert.equal((await loadTodos(signal)).status, 'error');
    globalThis.fetch = async (url, options) => {
      assert.equal(url, '/ilos/lo/st_room_auth_check2.acl');
      assert.equal(options.body.get('ky'), 'A20300000000001');
      return Response.json({ isError: true });
    };
    await assert.rejects(openTodo(parsedTodo.items[0].target, signal));
    globalThis.fetch = async () => Response.json({});
    await assert.rejects(openTodo(parsedTodo.items[0].target, signal));
    const canceled = new AbortController();
    canceled.abort();
    globalThis.fetch = async () => Response.json({ isError: false });
    await assert.rejects(openTodo(parsedTodo.items[0].target, canceled.signal));
  } finally {
    globalThis.fetch = beforeTodoFetch;
  }

  const { parseAcademicCalendar, loadAcademicCalendar } = await server.ssrLoadModule(
    '/src/adapter/calendar.ts',
  );
  const fixture =
    '<div id="shedule_list_form"><div class="schedule_view_list_form"><div class="schedule-show-control schedule_view_list_box"><img alt="학사일정"><div><span>TEST EVENT</span></div></div><div class="schedule_view_detail_box"><div class="schedule_view_txt">2030.01.01 ~ 2030.01.03</div></div></div></div>';
  assert.equal(parseAcademicCalendar(fixture).items[0].endDate, '2030-01-03');
  assert.equal(parseAcademicCalendar(fixture.replace('2030.01.01', '2030.02.30')).status, 'error');
  assert.equal(parseAcademicCalendar('<form>login required</form>').status, 'error');
  assert.equal(
    parseAcademicCalendar(
      '<div id="shedule_list_form"><div class="schedule_view_list_form"></div></div>',
    ).status,
    'ready',
  );
  parseAcademicCalendar(fixture + '<script>globalThis.__lmsInjected = true</script>');
  assert.equal(globalThis.__lmsInjected, undefined);
  assert.equal(document.querySelector('#shedule_list_form'), null);
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(url, '/ilos/main/main_schedule_list.acl');
      assert.equal(options.credentials, 'same-origin');
      assert.equal(options.redirect, 'error');
      assert.equal(options.cache, 'no-store');
      assert.equal(options.body.get('viewDt'), '203001');
      return new Response(fixture, { headers: { 'content-type': 'text/html; charset=UTF-8' } });
    };
    assert.equal(
      (await loadAcademicCalendar(new Date(2030, 0, 1), new AbortController().signal)).items.length,
      1,
    );
    globalThis.fetch = async () => new Response('login', { status: 401 });
    assert.equal(
      (await loadAcademicCalendar(new Date(), new AbortController().signal)).status,
      'error',
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
  const { detectPage } = await server.ssrLoadModule('/src/content/page.ts');
  for (const route of [
    '/ilos/st/course/test_view_form.acl',
    '/ilos/st/course/online_view_form.acl',
    '/ilos/main/member/login_form.acl',
  ]) {
    dom.reconfigure({ url: 'https://lms.pknu.ac.kr' + route });
    assert.equal(detectPage(), 'unknown');
  }
  dom.reconfigure({ url: 'https://lms.pknu.ac.kr/ilos/main/main_form.acl?test=1' });
  assert.equal(detectPage(), 'home');
  const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'));
  assert.deepEqual(manifest.content_scripts[0].matches, [
    'https://lms.pknu.ac.kr/ilos/main/main_form.acl*',
  ]);
  assert.equal(manifest.content_scripts[0].world, 'ISOLATED');
  assert.equal(manifest.content_scripts[0].all_frames, false);
  assert.equal(manifest.permissions, undefined);
  assert.equal(manifest.host_permissions, undefined);
  document.getElementById('lms-plus-root').remove();
  original.innerHTML =
    '<div id="header"><li class="header_login login-btn-color">로그인</li></div><div id="contentsIndex"></div>';
  const preservedMarkup = original.innerHTML;
  try {
    globalThis.fetch = async () =>
      new Response(
        '<div id="shedule_list_form"><div class="schedule_view_list_form"></div></div>',
        { headers: { 'content-type': 'text/html' } },
      );
    await act(async () => {
      await server.ssrLoadModule('/src/content/index.tsx');
    });
    assert.ok(document.getElementById('lms-plus-root'));
    assert.equal(document.body.classList.contains('lms-plus-home-page'), true);
    await act(async () => {
      adapter.showOriginalLms();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    assert.equal(document.getElementById('lms-plus-root'), null);
    assert.equal(document.body.classList.contains('lms-plus-home-page'), false);
    assert.equal(original.innerHTML, preservedMarkup);
  } finally {
    globalThis.fetch = originalFetch;
  }
  console.log(
    'PASS: guest/auth/unknown header, SVG icons, calendar navigation/events, deadline sort/type filters, notice detail, inbox filters, dialogs/Escape, navigation, FAQ, fallback, loading/error, adapter identity/course actions.',
  );
  console.log(
    'PASS: unsafe URLs rejected, guest stale courses suppressed, academic-calendar parsing/read-only transport, inert HTML, sensitive routes excluded, minimal manifest permissions.',
  );
} finally {
  await server.close();
  dom.window.close();
}
