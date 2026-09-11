import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

const dom = new JSDOM('<div id="root"></div>', {
  url: 'https://lms.pknu.ac.kr/ilos/main/main_form.acl',
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
const root = createRoot(document.getElementById('root'));
const originalFetch = globalThis.fetch;
const OriginalDate = globalThis.Date;
const originalTimeout = window.setTimeout;
try {
  const { CalendarCard } = await server.ssrLoadModule('/src/pages/home/CalendarCard.tsx');
  const props = {
    today: new Date(2030, 8, 3),
    sessionStatus: 'authenticated',
    useProvidedEvents: true,
    initialEvents: {
      status: 'ready',
      items: [{ id: 'range', title: 'TEST RANGE', date: '2030-09-01', endDate: '2030-09-05' }],
    },
  };
  const click = async (element) => act(() => element.click());
  await act(() => root.render(React.createElement(CalendarCard, props)));
  const day = (n) => document.querySelector(`[aria-label^="2030년 9월 ${n}일"]`);
  assert.ok(day(1).querySelector('i'));
  assert.equal(day(3).querySelector('i'), null);
  assert.ok(day(5).querySelector('i'));
  assert.equal(
    document.querySelector('.lp-calendar-period').textContent,
    '2030.09.01 ~ 2030.09.05',
  );
  await click(document.querySelector('[aria-label="다음 달"]'));
  assert.match(document.querySelector('.lp-calendar-detail > strong').textContent, /10월 1일/);
  await click(document.querySelector('[aria-label="이전 달"]'));
  assert.match(document.querySelector('.lp-calendar-detail > strong').textContent, /9월 1일/);

  let requests = 0;
  globalThis.fetch = async () => {
    requests++;
    return new Response(
      '<div id="shedule_list_form"><div class="schedule_view_list_form"></div></div>',
      { headers: { 'content-type': 'text/html' } },
    );
  };
  await act(() =>
    root.render(
      React.createElement(CalendarCard, { ...props, key: 'requests', useProvidedEvents: false }),
    ),
  );
  assert.equal(requests, 1);
  await click(day(4));
  await click([...document.querySelectorAll('button')].find((b) => b.textContent === '오늘'));
  assert.equal(requests, 1);
  await click(document.querySelector('[aria-label="다음 달"]'));
  assert.equal(requests, 2);

  const { useToday } = await server.ssrLoadModule('/src/pages/home/useToday.ts');
  let now = new OriginalDate(2030, 8, 30, 23, 59, 59).getTime();
  globalThis.Date = class extends OriginalDate {
    constructor(...args) {
      super(...(args.length ? args : [now]));
    }
    static now() {
      return now;
    }
  };
  let midnightCallback;
  let delay;
  window.setTimeout = (callback, ms) => {
    midnightCallback = callback;
    delay = ms;
    return 123;
  };
  function Clock() {
    return React.createElement('time', null, useToday().getDate());
  }
  await act(() => root.render(React.createElement(Clock)));
  assert.equal(delay, 1000);
  now += 1000;
  await act(() => midnightCallback());
  assert.equal(document.querySelector('time').textContent, '1');
  now += 86400000;
  await act(() => window.dispatchEvent(new dom.window.Event('focus')));
  assert.equal(document.querySelector('time').textContent, '2');
  console.log(
    'PASS: calendar endpoint markers, visible period, month selection, request deduplication and midnight/focus date refresh.',
  );
} finally {
  await act(() => root.unmount());
  globalThis.fetch = originalFetch;
  globalThis.Date = OriginalDate;
  window.setTimeout = originalTimeout;
  await server.close();
  dom.window.close();
}
