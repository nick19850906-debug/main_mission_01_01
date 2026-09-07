# 🚀 순수 바닐라 HTML/CSS/JavaScript 반응형 포트폴리오 웹사이트

> **"도구에 휘둘리지 않고, 브라우저의 기본 원리로 웹을 이해하다."**  
> 외부 프레임워크나 라이브러리(React, Vue, jQuery, Bootstrap, Tailwind 등) 없이 순수 **HTML5, CSS3, ES6+ JavaScript**만으로 제작된 반응형 포트폴리오 웹사이트입니다.

---

## 📌 목차
1. [프로젝트 소개](#1-프로젝트-소개)
2. [프로젝트 폴더 구조](#2-프로젝트-폴더-구조)
3. [핵심 구현 기능 & 인터랙션 요약](#3-핵심-구현-기능--인터랙션-요약)
4. [🧑‍🏫 평가관 질문 완벽 대비 마스터 Q&A (초보자 필독!)](#4-평가관-질문-완벽-대비-마스터-qa-초보자-필독)
   - [Q1. HTML 시맨틱 태그를 왜 쓰고 어떻게 설계했나요?](#q1-html-시맨틱-태그를-왜-쓰고-어떻게-설계했나요)
   - [Q2. CSS Flexbox와 Grid의 차이점 및 사용 기준은?](#q2-css-flexbox와-grid의-차이점-및-사용-기준은)
   - [Q3. querySelector와 addEventListener의 동작 흐름은?](#q3-queryselector와-addeventlistener의-동작-흐름은)
   - [Q4. ES6+ 문법과 배열 메서드(map/filter)의 필요성은?](#q4-es6-문법과-배열-메서드mapfilter의-필요성은)
   - [Q5. fetch와 async/await의 4대 상태 UI 표현 원리는?](#q5-fetch와-asyncawait의-4대-상태-ui-표현-원리는)
   - [Q6. "이벤트 → 상태 → DOM 업데이트" 흐름이 왜 중요한가요?](#q6-이벤트--상태--dom-업데이트-흐름이-왜-중요한가요)
5. [로컬 실행 방법 (Live Server)](#5-로컬-실행-방법-live-server)
6. [GitHub Pages 배포 가이드](#6-github-pages-배포-가이드)

---

## 1. 프로젝트 소개
- **목적**: 웹의 3대 기초 언어인 HTML, CSS, JavaScript의 동작 원리를 체득하고, "이벤트 → 상태 변경 → DOM 렌더링"으로 이어지는 현대 웹(React 등)의 핵심 멘탈 모델을 확립합니다.
- **기술 스택**: 
  - **HTML5**: 웹 표준 시맨틱 태그, SEO 메타태그, 웹 접근성(`aria-*`, `label for`)
  - **CSS3**: CSS 커스텀 속성(변수), Flexbox, CSS Grid(`auto-fit`, `minmax`), 모바일 퍼스트 미디어 쿼리, 다크모드, 글래스모피즘
  - **JavaScript (ES6+)**: `const/let`, 화살표 함수, 구조분해 할당, 템플릿 리터럴, `map/filter/forEach`, `fetch` + `async/await`, Intersection Observer API, Web Storage API(`localStorage`)
  - **아이콘 & 폰트**: Font Awesome CDN (순수 CSS 아이콘), Google Fonts (Outfit, Noto Sans KR)

---

## 2. 프로젝트 폴더 구조

```
anti_gravity_mission_01/
├── index.html              # 시맨틱 구조 메인 마크업 (초보자용 주석 포함)
├── css/
│   └── style.css           # 모바일 퍼스트 레이아웃, 다크모드 변수, 트랜지션
├── js/
│   └── main.js             # ES6+, DOM 제어, GitHub API, 폼 검증, 스크롤 인터랙션
├── images/
│   ├── profile.svg         # 모던 벡터 개발자 프로필 아바타 일러스트
│   └── favicon.svg         # 브라우저 탭 파비콘 아이콘
└── README.md               # 프로젝트 설명서 및 평가 대비 Q&A 가이드
```

---

## 3. 핵심 구현 기능 & 인터랙션 요약

| 기능 구분 | 구현 내용 | 기준값 및 세부 사양 (README 명시) |
| :--- | :--- | :--- |
| **반응형 디자인** | 스마트폰, 태블릿, 데스크톱 레이아웃 최적화 | Mobile First 기본 / 태블릿(`768px`) / 데스크톱(`1024px`) |
| **햄버거 메뉴** | 모바일 화면에서 버튼 클릭 시 메뉴 토글 | `classList.toggle('active')` & `aria-expanded` 동기화 |
| **부드러운 스크롤** | 네비게이션 메뉴 클릭 시 해당 섹션으로 스크롤 | `scrollIntoView({ behavior: 'smooth' })` 및 모바일 메뉴 자동 닫힘 |
| **헤더 스타일 변경** | 스크롤 시 상단 바 배경 반투명 블러 & 그림자 전환 | **스크롤 60px 이상**에서 `.header-scrolled` 클래스 부여 |
| **스크롤탑 버튼** | 플로팅 버튼 클릭 시 페이지 맨 위로 이동 | **스크롤 300px 이상**에서 `.show` 클래스 부여 |
| **다크 모드** | 토글 버튼 클릭 시 라이트/다크 테마 전환 | `localStorage` 영구 보존 + `prefers-color-scheme` OS 시스템 테마 자동 감지 |
| **스크롤 등장 애니메이션** | 화면을 내릴 때 요소들이 아래에서 부드럽게 등장 | **Intersection Observer** 사용 (임계값 `threshold: 0.2`) |
| **타이핑 효과 (보너스)** | Hero 섹션에서 직무 소개 문구가 한 글자씩 타이핑 | 순수 JS 타이머 기반 타이핑 & 지우기 루프 |
| **GitHub API 연동** | `/users/{username}/repos` 호출 및 동적 렌더링 | **4가지 상태(로딩/성공/에러/빈값)** 완벽 분기 처리 + 403 Rate Limit 대응 |
| **프로젝트 필터 (보너스)**| 언어별(JS, HTML, TS, Python 등) 실시간 필터링 | `array.filter()` 배열 메서드 활용 |
| **계정 검색 (보너스)** | 원하는 GitHub 사용자 아이디를 입력하여 즉시 조회 | 입력창 + Enter키/버튼 이벤트 연동 |
| **폼 유효성 검사** | 이름, 이메일 정규식, 메시지 길이 검증 | `event.preventDefault()`, 인라인 실시간 에러 출력, 성공 모달 안내 |

---

## 4. 🧑‍🏫 평가관 질문 완벽 대비 마스터 Q&A (초보자 필독!)

평가관이나 면접관이 코드에 대해 질문했을 때, **초등학생도 이해할 수 있을 만큼 쉽고 명쾌하게 대답할 수 있는 모범 답변**입니다.

---

### Q1. HTML 시맨틱 태그를 왜 쓰고 어떻게 설계했나요?
> **🗣️ 모범 답변**:  
> "시맨틱(Semantic) 태그는 **'의미를 담고 있는 태그'**를 말합니다.  
> 과거에는 화면의 모든 부분을 `<div>` 태그로만 만들다 보니 컴퓨터나 검색엔진 입장에서는 어디가 제목이고 어디가 메뉴인지 구분할 수 없었습니다.  
> 
> 시맨틱 태그를 쓴 이유는 크게 두 가지입니다:  
> 1. **검색엔진 최적화 (SEO)**: 구글이나 네이버 로봇이 우리 페이지의 핵심 콘텐츠를 정확히 파악하여 검색 상위에 노출시켜 줍니다.  
> 2. **웹 접근성 (Accessibility)**: 시각장애인이 화면 낭독기(스크린 리더)를 사용할 때 `header`, `nav`, `main` 등의 태그를 통해 원하는 위치로 바로 건너뛸 수 있습니다.  
> 
> 이번 프로젝트에서는 다음과 같이 위계를 설계했습니다:  
> - 상단 탐색 바: `<header>`와 `<nav>`  
> - 핵심 본문: 페이지 전체에서 단 하나만 존재하는 `<main>`  
> - 독립된 주제 구역들: `<section id="hero">`, `<section id="about">`, `<section id="projects">` 등  
> - 개별 프로젝트 및 가치관 카드: 독립적으로 배포/재사용 가능한 단위인 `<article>`  
> - 하단 저작권 및 링크: `<footer>`"

---

### Q2. CSS Flexbox와 Grid의 차이점 및 사용 기준은?
> **🗣️ 모범 답변**:  
> "가장 큰 차이는 **'1차원(1D)이냐, 2차원(2D)이냐'**입니다!  
> 
> - **Flexbox (1차원 레이아웃)**:  
>   가로(행) 또는 세로(열) 중 **하나의 축**을 기준으로 요소들을 정렬할 때 사용합니다.  
>   *적용 예시*: 상단 네비게이션 헤더(`.header-container`). 왼쪽 끝에 로고, 오른쪽 끝에 메뉴와 버튼들을 나란히 배치하기 위해 `display: flex; justify-content: space-between; align-items: center;`를 사용했습니다.  
> 
> - **CSS Grid (2차원 레이아웃)**:  
>   가로(열)와 세로(행)를 **바둑판 격자처럼 동시에** 다룰 때 사용합니다.  
>   *적용 예시*: Projects 섹션의 프로젝트 카드들(`.projects-grid`).  
>   `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));` 속성을 작성했습니다.  
>   이 코드는 모바일에서는 카드 1장이 너비를 꽉 채우다가, 화면이 넓어지면 카드가 최소 280px을 유지하면서 빈 공간에 맞춰 2열, 3열로 스스로 줄바꿈을 해주는 마법 같은 반응형 코드입니다. 미디어 쿼리를 복잡하게 쓰지 않아도 완벽한 반응형 카드가 완성됩니다."

---

### Q3. querySelector와 addEventListener의 동작 흐름은?
> **🗣️ 모범 답변**:  
> "웹 브라우저는 HTML 문서를 읽어서 메모리에 나뭇가지 모양의 **DOM(Document Object Model) 트리**를 만듭니다.  
> 
> 1. `document.querySelector('#theme-toggle-btn')`는 CSS 선택자 문법을 그대로 사용하여 DOM 트리에서 원하는 HTML 요소를 집게처럼 콕 집어 JavaScript 변수에 가져옵니다.  
> 2. `addEventListener('click', () => { ... })`는 그 요소에 **'귀(Listener)'**를 달아주는 역할을 합니다. 사용자가 버튼을 클릭하면 브라우저가 이벤트를 발생시키고, 연결된 함수가 즉시 실행됩니다.  
> 
> **왜 HTML에 `onclick="..."`을 직접 쓰지 않았나요?**  
> HTML은 '구조', JavaScript는 '동작'을 담당해야 한다는 **관심사 분리(Separation of Concerns)** 원칙 때문입니다. `addEventListener`를 쓰면 하나의 버튼에 여러 개의 동작을 안전하게 등록할 수 있고 유지보수가 훨씬 깔끔해집니다."

---

### Q4. ES6+ 문법과 배열 메서드(map/filter)의 필요성은?
> **🗣️ 모범 답변**:  
> "최신 자바스크립트(ES6+)는 코드를 훨씬 안전하고 읽기 쉽게 만들어줍니다.  
> 
> 1. **`const`와 `let`**: `var`의 가장 큰 문제점인 중복 선언과 호이스팅 문제를 해결하여 변수의 유효범위(블록 스코프)를 안전하게 지킵니다.  
> 2. **화살표 함수 `() => {}`**: 함수 작성을 간결하게 해주고 외부의 `this`를 그대로 유지해 줍니다.  
> 3. **구조분해 할당(Destructuring)**: `const { name, description, stargazers_count } = repo;`처럼 객체의 속성을 한 번에 변수로 추출하여 `repo.name`, `repo.description`을 반복해서 적지 않아도 됩니다.  
> 4. **배열 메서드 `map` vs `filter`**:  
>    - `filter()`: 저장소 목록 중에서 내가 선택한 언어(예: JavaScript)와 일치하는 것만 쏙쏙 골라내어 새로운 배열을 만듭니다.  
>    - `map()`: 배열 속의 데이터를 하나씩 꺼내어 HTML 카드 문자열로 1:1 변환(변형)할 때 사용합니다. 템플릿 리터럴(`` `...` ``)과 결합하여 동적인 화면을 만드는 데 최적입니다."

---

### Q5. fetch와 async/await의 4대 상태 UI 표현 원리는?
> **🗣️ 모범 답변**:  
> "인터넷을 통해 서버에서 데이터를 가져올 때는 시간이 걸립니다. 브라우저가 멈추지 않고 다른 일을 계속할 수 있도록 **비동기 통신(Promise)**을 사용합니다. `async/await`는 복잡한 비동기 코드를 마치 위에서 아래로 순차적으로 읽히는 동기 코드처럼 편안하게 작성할 수 있게 해줍니다.  
> 
> 실제 사용자 경험(UX)을 위해서는 데이터를 요청할 때 반드시 **4가지 상태(State)**를 화면에 보여주어야 합니다:  
> 1. **로딩(Loading) 상태**: `fetch`를 보내기 직전, 회전하는 스피너(`.spinner`)를 화면에 띄워 사용자가 '아, 지금 데이터를 가져오는 중이구나'를 알게 합니다.  
> 2. **성공(Success) 상태**: 서버 응답이 200 OK로 도착하면 `data.json()`을 파싱하고 `map()`을 돌려 카드 그리드를 렌더링합니다.  
> 3. **에러(Error) 상태**: 네트워크가 끊기거나, 존재하지 않는 계정이거나, GitHub API의 시간당 60회 호출 제한(403 Rate Limit)에 걸렸을 때 `try/catch`문으로 예외를 잡아 친절한 에러 문구와 **[다시 시도]** 버튼을 띄웁니다.  
> 4. **빈(Empty) 상태**: 호출은 성공했지만 레포지토리가 0개일 때 '표시할 프로젝트가 없습니다'라는 안내 상자를 띄워 화면이 고장난 것처럼 보이지 않게 처리했습니다."

---

### Q6. "이벤트 → 상태 → DOM 업데이트" 흐름이 왜 중요한가요?
> **🗣️ 모범 답변**:  
> "이 흐름이 바로 **React, Vue 같은 현대 프론트엔드 프레임워크의 심장**이기 때문입니다!  
> 
> 옛날 방식은 버튼을 누르면 그 즉시 HTML 글자를 직접 바꾸는 방식이었습니다. 하지만 앱이 커지면 화면의 어디가 어떻게 바뀌었는지 추적하기가 불가능해집니다.  
> 
> 그래서 이번 프로젝트에서는 **'단방향 데이터 흐름'**을 구축했습니다:  
> 1. **이벤트(Event)**: 사용자가 다크모드 버튼을 클릭합니다.  
> 2. **상태 변경(State Change)**: `AppState.theme` 변수의 값을 `'light'`에서 `'dark'`로 변경하고 로컬스토리지에 저장합니다.  
> 3. **화면 갱신(DOM Update)**: `render()` 함수가 호출되어 최상단 `<html data-theme="dark">` 속성을 교체합니다.  
> 
> 프로젝트 목록도 마찬가지입니다. 언어 필터 버튼을 누르면(이벤트), `AppState.github.currentFilter`가 바뀌고(상태 변경), `render()`가 실행되어 카드 목록이 바뀝니다(화면 갱신). 이 원리를 직접 만들어보면 나중에 React의 `useState`와 컴포넌트 재렌더링을 배울 때 아주 쉽게 이해할 수 있습니다."

---

## 5. 로컬 실행 방법 (Live Server)

### 방법 A: VS Code Live Server 확장 프로그램 (가장 권장)
1. VS Code에서 본 프로젝트 폴더(`anti_gravity_mission_01`)를 엽니다.
2. VS Code 확장 탭(Ctrl+Shift+X / Cmd+Shift+X)에서 **"Live Server"** (Ritwick Dey 제작)를 설치합니다.
3. `index.html` 파일을 우클릭하고 **"Open with Live Server"**를 클릭합니다.
4. 브라우저가 자동으로 열리며 `http://127.0.0.1:5500/index.html`에서 실시간 반영 환경을 확인합니다.

### 방법 B: Python 내장 서버 (간단 실행)
터미널에서 아래 명령어 중 하나를 입력합니다:
```bash
# Python 3
python3 -m http.server 8080
```
그 후 브라우저 주소창에 `http://localhost:8080`을 입력하여 접속합니다.

---

## 6. GitHub Pages 배포 정보 및 가이드

- **GitHub 저장소 URL**: [https://github.com/nick19850906-debug/main_mission_01_01](https://github.com/nick19850906-debug/main_mission_01_01)
- **배포 사이트 URL (GitHub Pages)**: [https://nick19850906-debug.github.io/main_mission_01_01/](https://nick19850906-debug.github.io/main_mission_01_01/)

### GitHub Pages 활성화 방법:
1. GitHub 저장소 [https://github.com/nick19850906-debug/main_mission_01_01](https://github.com/nick19850906-debug/main_mission_01_01) 접속 후 상단 **[Settings]** 클릭
2. 좌측 사이드바 메뉴에서 **[Pages]** 클릭
3. **Build and deployment > Source**에서 **"Deploy from a branch"** 선택
4. **Branch**를 `main` 브랜치, 폴더는 `/ (root)`로 선택하고 **[Save]** 클릭
5. 약 1~2분 후 페이지 상단에 **"Your site is live at https://nick19850906-debug.github.io/main_mission_01_01/"** 메시지가 뜨며 전 세계에 배포가 완료됩니다! 🎉
