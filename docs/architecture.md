# Architecture

LMS+는 원본 Smart-LMS를 데이터와 동작의 기준으로 사용하는 비공식 Enhancement Layer다. 목표는 학생이 필요한 정보를 찾아다니는 시간을 줄이는 것이다. 현재 구현은 홈이며, 다른 페이지는 기능을 구현할 때 추가한다. 미구현 페이지·API·상태 저장소를 미리 만들지 않는다.

## 폴더와 책임

```text
src/
  content/                  확장 진입, 페이지 판별, 원본 복귀와 root 해제
  adapter/                  원본 LMS DOM·요청·기존 동작과의 연결
    home.ts                 홈 데이터 조합과 원본 DOM 관찰
    courses.ts              과목 추출과 원본 과목 요소 클릭
    notices.ts              공지 목록 추출
    session.ts              로그인 상태·프로필 이미지·로그인 이동
    calendar.ts             학사일정 월별 조회와 응답 파싱
    urls.ts                 데이터에서 받은 LMS 이동 URL 검증
  models/                   외부 시스템이나 React를 모르는 데이터 계약
    home.ts                 홈에서 필요한 데이터의 조합
    feed.ts                 pending/loading/error/ready 상태
    course.ts, session.ts, notice.ts, calendar.ts, todo.ts, inbox.ts, catalog.ts
  pages/
    home/
      HomePage.tsx          검색·필터·대화상자 상태와 홈 섹션 조합
      useHomeData.ts        원본 홈 데이터 구독 및 해제
      CalendarCard.tsx      월·날짜 선택과 달력 표시
      useAcademicCalendar.ts  일정 요청·타임아웃·취소·응답 상태
      CoursesCard.tsx, NoticesCard.tsx, TodoCard.tsx, QuickMenu.tsx
      NoticeList.tsx, TodoList.tsx  카드와 대화상자가 공유하는 목록
      HomeDialogs.tsx       대화상자 선택 및 공지 상세 표시
      dialogs/              소개·FAQ·프로필·쪽지함·카탈로그 내용
      HomeResources.tsx, UniversityLinks.tsx, resources.ts
      types.ts              홈 UI의 대화상자 종류
      home.css              홈 화면과 홈 대화상자 내용의 스타일
  components/
    layout/                 LmsLayout, LmsHeader, LmsFooter, layout.css
    ui/                     Icon, Dialog, FeedState, CardTitle,
                            LmsLink, ProfileAvatar, ui.css
  styles/
    base.css                root 범위의 기본 스타일과 원본 숨김 규칙
    index.css               base → ui → layout → home 스타일 조합
  assets/                   확장에 포함하는 이미지와 출처 기록
  assets.ts                 확장 내부 이미지 주소 해석
```

`public/manifest.json`은 주입 대상과 결과 파일을 선언한다. Vite는 `src/content/index.tsx`에서 시작해 `dist/content.js`, `dist/content.css`와 이미지 파일을 만든다. Chrome에는 `dist/`를 로드한다. 루트의 과거 `content.js`는 현재 빌드 진입점이 아니다. `tools/`는 구조 조사 도구, `inspection/`과 `imgs/`는 Git에 포함하지 않는 로컬 자료다.

## 의존관계

```text
content → pages → components
             └→ adapter → models
                  ↑         ↑
             공통 LMS UI ────┘
```

- `models`는 모델만 참조한다. 과목 타입도 Adapter에 두지 않는다.
- `adapter`는 다른 Adapter와 모델만 참조한다. React, 페이지, 확장 root를 모른다.
- `pages/<page>`는 해당 페이지의 조합과 상태를 소유한다. 다른 페이지의 내부 파일을 가져오지 않는다.
- `components`는 특정 페이지를 참조하지 않는다. `LmsLink`와 `ProfileAvatar` 같은 LMS 공통 UI는 Adapter의 주소 검증 함수를 사용할 수 있다.
- `content`가 실행 환경을 연결한다. `HomePage`는 원본 복귀 함수를 전달받는다. 과목 선택 시 페이지가 원본 복귀 후 Adapter의 과목 클릭을 호출한다.
- 실제로 공유되는 UI만 `components`로 올린다. 파일이 TSX라는 이유만으로 공통 폴더에 넣지 않는다. 범용 `utils`, `services`, 거대한 재수출 파일은 필요 없이 추가하지 않는다.

`tests/architecture.test.mjs`는 이 의존 방향, 로컬 import 존재, 순환 의존성을 검사한다. TypeScript는 사용하지 않는 변수와 import도 검사한다.

## 홈 실행과 상태

`content/index.tsx`가 최상위 홈 문서와 원본 구조를 확인하고 독립 React root를 만든다. `EnhancedHome`이 마운트된 뒤에만 원본 숨김 클래스를 적용한다. `HomePage`는 `useHomeData`로 Adapter 데이터를 읽고 관찰한다. 원본은 숨길 뿐 삭제하지 않는다.

검색·공지 필터·To-do 필터는 `HomePage`가 소유하여 카드와 대화상자에 같은 상태를 전달한다. 카드와 전체보기의 목록 구현은 공유한다. 소개·FAQ·프로필·쪽지·카탈로그 내용은 독립 컴포넌트이며, 필터 상태는 필요한 내용 컴포넌트만 소유한다. `HomeDialogContent`는 종류에 맞는 내용을 선택한다.

달력의 선택 상태는 `CalendarCard`, 요청 수명은 `useAcademicCalendar`, HTTP 요청과 파싱은 `adapter/calendar.ts`가 담당한다. 월 전환이나 화면 해제 시 이전 요청을 취소한다. UI 테스트의 `initialData`는 합성 데이터 입력 경계이며 제품에서 데모 정보를 사용하지 않는다.

원본 복귀는 `content/lifecycle.ts`에서 클래스 제거와 복귀 이벤트를 처리한다. 진입점이 React root를 해제하면 데이터 관찰과 일정 요청의 cleanup이 실행된다. 오류가 발생해도 원본 LMS 접근을 보존한다.

## 공통 UI와 스타일

`LmsLayout`은 건너뛰기 링크·헤더·main·푸터·대화상자 영역을 조합한다. 헤더는 홈의 대화상자 타입을 모르며 검색·로그인·프로필·쪽지·알림 동작을 콜백으로 받는다. 푸터도 소개·도움말·원본 복귀 동작을 전달받는다. 후속 페이지는 같은 레이아웃에 자신의 콘텐츠와 동작을 전달한다.

헤더와 홈 본문은 최대 985px, 푸터는 전체 너비 배경과 최대 1200px 내부 영역을 유지한다. 공통 부품은 `ui.css`, 레이아웃은 `layout.css`, 홈 전용 표현은 `home.css`가 담당하며 각 파일에 해당 반응형 규칙을 둔다. 기본 root 스타일은 `base.css`에 있다. 최종 import 순서는 `styles/index.css`에서 명시한다. 스타일은 root 아래로 제한하지만 Shadow DOM 격리는 아니므로 원본 CSS와의 실제 호환성을 확인해야 한다.

구조 재편에서는 기존 selector·미디어 조건·선언 값을 보존했다. 향후 디자인 변경은 해당 책임의 스타일 파일에서 수행한다. 범용 규칙보다 기능별 규칙을 구체적으로 작성하고 파일 끝에 임시 덮어쓰기 규칙을 계속 추가하지 않는다.

## 이후 기능을 추가하는 기준

과목 페이지를 구현할 때 `pages/course`를 추가하고, 해당 페이지가 필요한 모델과 Adapter만 확장한다. 과제·공지처럼 둘 이상의 페이지에서 공유할 기능이 실제로 생기면 해당 기능의 UI·상태를 별도 `features/<feature>`로 승격할 수 있다. 아직 공유되지 않는 홈 카드까지 미리 기능 프레임워크로 분해하지 않는다.

공통 오른쪽 Context Panel, 과목 탐색 개선, 다운로드 설정은 별도 작업이다. 상단 교육현황·커뮤니티·소개도 독립 페이지로 구현한 뒤 연결한다. 현재 홈 대화상자로 대체하지 않는다. 홈 하단 서비스 카드는 `resources.ts`의 확인된 원본 화면으로 이동하며, 해당 목록이 홈에 통합되었다는 뜻은 아니다.

`UniversityLinks`는 확장에 포함한 이미지와 확인된 대학 서비스 주소를 사용한다. 클릭할 때 새 창으로 열며, 별도 이미지 생성이나 분석 서비스를 런타임에 호출하지 않는다.

## 데이터와 보안 경계

계정·세션 쿠키를 별도 수집·저장하지 않는다. 서버 HTML은 문서에 붙이지 않은 template에서 해석하고 텍스트와 검증된 날짜만 React에 전달한다. 데이터 링크는 HTTPS LMS origin과 화면 경로 규칙을 통과해야 한다. 인증·시험·온라인강의 추적은 원본 LMS가 담당한다. 주입 범위는 홈 최상위 문서와 ISOLATED world를 유지한다.

미연결·로딩·오류·확인된 빈 목록을 구분한다. 실제 연결 범위는 README, 원본 selector와 요청 계약은 `lms-integration.md`에서 관리한다. 원본 DOM이 달라졌다고 빈 목록이나 성공으로 단정하지 않는다. 개인 데이터·원본 캡처·비밀값은 Git에 포함하지 않는다. 공유 DOM은 완전히 격리된 개인정보 저장소가 아니다.

## 검증

- `npm run typecheck`: 타입 및 미사용 코드 검사
- `npm test`: 의존관계 검사와 기존 홈·Adapter 통합 회귀 검증
- `npm run build`: Chrome에 로드할 확장 산출물 생성
- `npm run format:check`: 소스·테스트·설정 포맷 검사

DOM 테스트는 실제 Chrome의 로그인·대화상자·원본 복귀·과목 이동·CSS 렌더링 검증을 대체하지 않는다. 구조 재편과 기능 수정은 구분한다. 달력의 같은 월 재요청이나 자정 이후 날짜 갱신 같은 동작 정책은 별도 회귀 검증과 함께 개선한다.
