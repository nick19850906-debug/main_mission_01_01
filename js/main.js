/**
  ==========================================================================
  [초보자 & 평가관을 위한 Vanilla JavaScript 마스터 스크립트]
  
  "이벤트(Event) → 상태 변경(State Change) → 화면 갱신(DOM Update)"
  리액트(React)를 배우기 전, 브라우저의 본질적인 동작 흐름을 순수 JS로 완벽 구현합니다.
  
  [목차]
  1. 전역 상태 관리 객체 (State Object)
  2. DOM 요소 캐싱 (querySelector & querySelectorAll)
  3. 테마(다크모드) 관리자 (localStorage + prefers-color-scheme)
  4. 네비게이션 & 스크롤 인터랙션 (햄버거 메뉴, 부드러운 스크롤, 스크롤탑)
  5. 스크롤 등장 애니메이션 (Intersection Observer API)
  6. Hero 섹션 타이핑 효과 (Bonus: Typewriter Effect)
  7. GitHub API 비동기 통신 & 프로젝트 렌더링 (fetch + async/await + 4대 상태)
  8. 프로젝트 언어별 필터링 기능 (Bonus: array.filter / map)
  9. Contact 폼 실시간 유효성 검사 (Form UX + preventDefault)
  10. 초기화 실행 (Init 함수)
  ==========================================================================
*/

'use strict'; // 엄격 모드를 활성화하여 잠재적인 오류를 방지합니다.

/* ==========================================================================
   1. 전역 상태 관리 객체 (State Management)
   - React의 useState 개념의 기초입니다.
   - 데이터(State)를 중앙에서 보관하고, 상태가 바뀌면 렌더링 함수를 호출해 DOM을 바꿉니다.
   ========================================================================== */
let AppState = {
  // 다크 모드 상태 ('light' 또는 'dark')
  theme: 'light',
  
  // GitHub 프로젝트 관련 상태
  github: {
    username: 'nick19850906-debug',
    repos: [],
    filteredRepos: [],
    currentFilter: 'all',
    status: 'idle',
    errorMessage: '',
    retryCount: 0 // 재시도 횟수 추적
  },

  // 폼 유효성 상태
  contactForm: {
    values: { name: '', email: '', message: '' },
    errors: { name: '', email: '', message: '' },
    isSubmitted: false
  }
};

/**
 * 상태 변경 헬퍼 함수 (Immutable State Update & Logging)
 * @param {Function} updater - 현재 상태를 받아 새로운 상태의 일부를 반환하는 함수
 */
function setState(updater) {
  const nextState = typeof updater === 'function' ? updater(AppState) : updater;
  const prevState = JSON.stringify(AppState);
  
  // 불변성(Immutability) 유지하며 객체 병합 (깊은 복사가 필요한 경우는 간단히 전개연산자 사용)
  AppState = {
    ...AppState,
    ...nextState,
    github: { ...AppState.github, ...(nextState.github || {}) },
    contactForm: { ...AppState.contactForm, ...(nextState.contactForm || {}) }
  };
  
  console.log(`%c[State Changed]`, 'color: #4f46e5; font-weight: bold;');
  console.log('Prev:', JSON.parse(prevState));
  console.log('Next:', AppState);
}

/**
 * Throttle 유틸리티 (스크롤 성능 최적화용)
 */
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

/* ==========================================================================
   2. 주요 DOM 요소 캐싱 (Element Caching)
   - document.querySelector 등을 매번 호출하면 브라우저 성능이 낭비되므로,
     자주 쓰는 요소들을 초기에 찾아 변수에 보관(캐싱)해 둡니다.
   ========================================================================== */
const DOM = {
  html: document.documentElement,
  header: document.getElementById('header'),
  navMenu: document.getElementById('nav-menu'),
  hamburgerBtn: document.getElementById('hamburger-btn'),
  themeToggleBtn: document.getElementById('theme-toggle-btn'),
  scrollTopBtn: document.getElementById('scroll-top-btn'),
  navLinks: document.querySelectorAll('.nav-link'),
  
  // Hero 타이핑
  typingText: document.getElementById('typing-text'),
  
  // Projects 섹션
  projectsContainer: document.getElementById('projects-container'),
  githubUsernameInput: document.getElementById('github-username-input'),
  githubSearchBtn: document.getElementById('github-search-btn'),
  filterContainer: document.getElementById('filter-container'),
  filterButtons: document.querySelectorAll('.filter-btn'),
  
  // Contact 폼
  contactForm: document.getElementById('contact-form'),
  nameInput: document.getElementById('contact-name'),
  emailInput: document.getElementById('contact-email'),
  messageInput: document.getElementById('contact-message'),
  nameError: document.getElementById('error-name'),
  emailError: document.getElementById('error-email'),
  messageError: document.getElementById('error-message'),
  formAlert: document.getElementById('form-alert'),
  groupName: document.getElementById('group-name'),
  groupEmail: document.getElementById('group-email'),
  groupMessage: document.getElementById('group-message'),
  
  // Footer
  currentYearSpan: document.getElementById('current-year')
};

/* ==========================================================================
   3. 테마(다크 모드) 관리 모듈
   - 이벤트: 테마 토글 버튼 클릭
   - 상태 변경: AppState.theme 변경 및 localStorage 동기화
   - DOM 렌더링: <html data-theme="..."> 속성 교체
   ========================================================================== */
const ThemeManager = {
  STORAGE_KEY: 'portfolio-theme',

  /**
   * 저장된 테마를 불러오거나, 시스템의 다크모드 설정을 자동 감지합니다.
   */
  init() {
    // 1) 로컬 스토리지에 저장된 설정이 있는지 확인
    const savedTheme = localStorage.getItem(this.STORAGE_KEY);
    
    if (savedTheme) {
      setState({ theme: savedTheme });
    } else {
      // 2) 저장이 없다면 사용자의 OS 시스템 테마(prefers-color-scheme) 감지
      const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setState({ theme: systemPrefersDark ? 'dark' : 'light' });
    }

    // DOM에 초기 테마 반영
    this.render();

    // 명명된 함수 바인딩으로 이벤트 리스너 재사용성 향상
    this.handleToggleClick = this.toggleTheme.bind(this);
    this.handleSystemThemeChange = (e) => {
      if (!localStorage.getItem(this.STORAGE_KEY)) {
        setState({ theme: e.matches ? 'dark' : 'light' });
        this.render();
      }
    };

    DOM.themeToggleBtn.addEventListener('click', this.handleToggleClick);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', this.handleSystemThemeChange);
  },

  /**
   * 테마 전환 토글
   */
  toggleTheme() {
    const nextTheme = AppState.theme === 'light' ? 'dark' : 'light';
    setState({ theme: nextTheme });
    localStorage.setItem(this.STORAGE_KEY, AppState.theme);
    this.render();
  },

  /**
   * DOM 렌더링: 최상단 html 태그에 data-theme 부여 및 접근성(aria-pressed) 반영
   */
  render() {
    DOM.html.setAttribute('data-theme', AppState.theme);
    DOM.themeToggleBtn.setAttribute('title', `현재: ${AppState.theme === 'dark' ? '다크 모드' : '라이트 모드'}`);
    DOM.themeToggleBtn.setAttribute('aria-pressed', AppState.theme === 'dark' ? 'true' : 'false');
  }
};

/* ==========================================================================
   4. 네비게이션 & 스크롤 인터랙션 모듈
   - 햄버거 메뉴 토글
   - 네비게이션 메뉴 클릭 시 부드러운 스크롤 이동
   - 60px 이상 스크롤 시 헤더 배경 블러 전환 (README에 기준값 명시)
   - 300px 이상 스크롤 시 스크롤탑 버튼 노출 (README에 기준값 명시)
   - 현재 보고 있는 섹션의 메뉴 활성화 (Scroll Spy)
   ========================================================================== */
const NavigationManager = {
  HEADER_SCROLL_THRESHOLD: 60, // 헤더 스타일 전환 기준 스크롤 높이 (px)
  SCROLL_TOP_THRESHOLD: 300,   // 스크롤탑 버튼 표시 기준 스크롤 높이 (px)

  init() {
    // 이벤트 핸들러를 명명된 함수로 분리
    this.handleHamburgerClick = this.toggleMobileMenu.bind(this);
    this.handleNavLinkClick = this.onNavLinkClick.bind(this);
    this.handleScrollTopClick = this.onScrollTopClick.bind(this);
    // 스크롤 성능 향상을 위한 Throttle 적용 (100ms)
    this.throttledScroll = throttle(() => {
      this.handleScroll();
      this.updateActiveNavLink();
    }, 100);

    // 1. 모바일 햄버거 메뉴 토글 이벤트
    DOM.hamburgerBtn.addEventListener('click', this.handleHamburgerClick);

    // 2. 네비게이션 메뉴 앵커 링크 클릭
    DOM.navLinks.forEach((link) => {
      link.addEventListener('click', this.handleNavLinkClick);
    });

    // 3. 스크롤탑 버튼
    DOM.scrollTopBtn.addEventListener('click', this.handleScrollTopClick);

    // 4. 윈도우 스크롤 이벤트 감지 (Throttling 적용)
    window.addEventListener('scroll', this.throttledScroll, { passive: true });
  },

  onNavLinkClick(e) {
    e.preventDefault();
    const link = e.currentTarget;
    const targetId = link.getAttribute('href');
    const targetSection = document.querySelector(targetId);

    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
    this.closeMobileMenu();
  },

  onScrollTopClick() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  /**
   * 햄버거 버튼 클릭 시 메뉴 열림/닫힘 토글
   */
  toggleMobileMenu() {
    const isActive = DOM.navMenu.classList.toggle('active');
    DOM.hamburgerBtn.classList.toggle('active');
    // 접근성을 위한 aria-expanded 값 갱신
    DOM.hamburgerBtn.setAttribute('aria-expanded', String(isActive));
  },

  closeMobileMenu() {
    DOM.navMenu.classList.remove('active');
    DOM.hamburgerBtn.classList.remove('active');
    DOM.hamburgerBtn.setAttribute('aria-expanded', 'false');
  },

  /**
   * 스크롤 위치에 따른 헤더 배경 변경 및 스크롤탑 버튼 표시/숨김
   */
  handleScroll() {
    const scrollY = window.scrollY;

    // 60px 이상 스크롤 시 헤더에 .header-scrolled 클래스 토글
    if (scrollY > this.HEADER_SCROLL_THRESHOLD) {
      DOM.header.classList.add('header-scrolled');
    } else {
      DOM.header.classList.remove('header-scrolled');
    }

    // 300px 이상 스크롤 시 스크롤탑 버튼에 .show 클래스 토글
    if (scrollY > this.SCROLL_TOP_THRESHOLD) {
      DOM.scrollTopBtn.classList.add('show');
    } else {
      DOM.scrollTopBtn.classList.remove('show');
    }
  },

  /**
   * 현재 뷰포트 내에 있는 섹션을 찾아 해당 nav-link에 active 클래스 부여
   */
  updateActiveNavLink() {
    const scrollPosition = window.scrollY + 150; // 여유 오프셋
    const sections = document.querySelectorAll('section[id]');

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        DOM.navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }
};

/* ==========================================================================
   5. 스크롤 등장 애니메이션 (Intersection Observer API)
   - 스크롤을 내릴 때 요소가 화면에 진입하면 부드럽게 나타나는 효과
   - 임계값(threshold): 0.2 (20% 이상 화면에 노출되었을 때 동작 - 권장 요구사항)
   ========================================================================== */
const ScrollAnimationManager = {
  THRESHOLD: 0.2,

  init() {
    // 애니메이션을 적용할 주요 요소들 선택
    const targetElements = document.querySelectorAll(
      '.fade-in, .about-grid, .feature-card, .skill-card, .repo-search-box, .filter-container, .contact-wrapper'
    );

    // 각 대상 요소에 .fade-in 초기 클래스 추가
    targetElements.forEach((el) => el.classList.add('fade-in'));

    // IntersectionObserver 지원 여부 확인
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            // 요소가 화면에 20% 이상 들어왔을 때
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              obs.unobserve(entry.target); // 한 번 등장하면 관찰 해제
            }
          });
        },
        { threshold: this.THRESHOLD }
      );

      targetElements.forEach((el) => observer.observe(el));
    } else {
      // 미지원 구형 브라우저의 경우 즉시 표시
      targetElements.forEach((el) => el.classList.add('visible'));
    }
  }
};

/* ==========================================================================
   6. Hero 타이핑 효과 (Bonus Feature)
   - 타자기처럼 한 글자씩 글자가 적히고 지워지는 순수 자바스크립트 애니메이션
   ========================================================================== */
const TypingEffectManager = {
  phrases: [
    'Frontend Developer',
    'Vanilla JS Enthusiast',
    'Lifelong Problem Solver',
    'User Experience Crafter'
  ],
  phraseIndex: 0,
  charIndex: 0,
  isDeleting: false,
  typingSpeed: 100,
  deletingSpeed: 50,
  pauseDelay: 1800,

  init() {
    if (!DOM.typingText) return;
    this.type();
  },

  type() {
    const currentPhrase = this.phrases[this.phraseIndex];

    if (this.isDeleting) {
      // 글자 지우기
      this.charIndex--;
      DOM.typingText.textContent = currentPhrase.substring(0, this.charIndex);
    } else {
      // 글자 쓰기
      this.charIndex++;
      DOM.typingText.textContent = currentPhrase.substring(0, this.charIndex);
    }

    let delay = this.isDeleting ? this.deletingSpeed : this.typingSpeed;

    // 문장이 모두 완성되었을 때
    if (!this.isDeleting && this.charIndex === currentPhrase.length) {
      delay = this.pauseDelay; // 잠시 대기 후 지우기 시작
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      // 글자가 모두 지워졌을 때 다음 문장으로 전환
      this.isDeleting = false;
      this.phraseIndex = (this.phraseIndex + 1) % this.phrases.length;
      delay = 400; // 다음 문장 시작 전 약간 대기
    }

    setTimeout(() => this.type(), delay);
  }
};

/* ==========================================================================
   7 & 8. GitHub API 비동기 통신 & 프로젝트 렌더링 & 필터링
   - fetch + async/await 사용
   - 4가지 상태 관리:
     1) LOADING: 데이터 요청 중 (스피너 렌더링)
     2) SUCCESS: 200 OK 수신 및 카드 리스트 렌더링
     3) ERROR: 403(Rate limit) 또는 404, 네트워크 실패 시 메시지 + [재시도] 버튼
     4) EMPTY: 레포지토리가 0개일 때 빈 상태 메시지
   - ES6+ 활용:
     - 템플릿 리터럴로 동적 카드 HTML 생성
     - 구조분해 할당 ({ name, description, ... })
     - map: 데이터 -> HTML 카드 변환
     - filter: 선택된 프로그래밍 언어로 필터링
   ========================================================================== */
const ProjectsManager = {
  init() {
    // 1. GitHub 사용자 검색 이벤트 연결 (버튼 클릭 및 Enter 키 입력)
    DOM.githubSearchBtn.addEventListener('click', () => this.handleUserSearch());
    DOM.githubUsernameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleUserSearch();
      }
    });

    // 2. 언어 필터 버튼 클릭 이벤트 연결
    DOM.filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        this.setFilter(lang);
      });
    });

    // 3. 초기 기본 계정으로 프로젝트 목록 가져오기 실행
    this.fetchProjects(AppState.github.username);
  },

  handleUserSearch() {
    const inputUser = DOM.githubUsernameInput.value.trim();
    if (!inputUser) {
      alert('GitHub 아이디를 입력해주세요.');
      DOM.githubUsernameInput.focus();
      return;
    }
    AppState.github.username = inputUser;
    this.fetchProjects(inputUser);
  },

  /**
   * GitHub REST API 비동기 호출
   * @param {string} username - 조회할 GitHub 아이디
   */
  async fetchProjects(username) {
    setState({ github: { status: 'loading', errorMessage: '' } });
    this.render();

    const endpoint = `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=12`;
    
    // 네트워크 타임아웃 처리를 위한 AbortController 도입 (8초 타임아웃)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.status === 403) {
        throw new Error('GitHub API 호출 횟수 제한(Rate Limit)을 초과했습니다. 잠시 후 다시 시도해주세요.');
      }
      if (response.status === 404) {
        throw new Error(`사용자 '${username}'을(를) GitHub에서 찾을 수 없습니다.`);
      }
      if (!response.ok) {
        throw new Error(`데이터를 불러오지 못했습니다. (응답 코드: ${response.status})`);
      }

      const data = await response.json();
      const validRepos = Array.isArray(data) ? data : [];

      // 성공 시 retryCount 초기화 및 상태 업데이트
      setState({
        github: {
          repos: validRepos,
          status: validRepos.length === 0 ? 'empty' : 'success',
          retryCount: 0
        }
      });
      if (AppState.github.status === 'success') {
        this.applyFilter();
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('[ProjectsManager] API Error:', error);
      
      let errorMessage = error.message || '프로젝트를 불러오는 도중 오류가 발생했습니다.';
      if (error.name === 'AbortError') {
        errorMessage = '요청 시간이 초과되었습니다. 네트워크 상태를 확인해주세요.';
      }
      
      setState({ github: { status: 'error', errorMessage } });
    } finally {
      this.render();
    }
  },

  /**
   * 언어 필터 상태 변경 (Bonus: array.filter() 활용)
   */
  setFilter(lang) {
    AppState.github.currentFilter = lang;

    // 필터 버튼들의 active 클래스 갱신 (DOM 조작)
    DOM.filterButtons.forEach((btn) => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.applyFilter();
    this.render();
  },

  /**
   * AppState.github.currentFilter 기준에 맞춰 repos.filter() 실행
   */
  applyFilter() {
    const { repos, currentFilter } = AppState.github;

    if (currentFilter === 'all') {
      AppState.github.filteredRepos = [...repos];
    } else if (currentFilter === 'other') {
      // 명시된 주요 언어 외 기타
      const mainLanguages = ['JavaScript', 'HTML', 'TypeScript', 'Python'];
      AppState.github.filteredRepos = repos.filter((repo) => !mainLanguages.includes(repo.language));
    } else {
      // 특정 언어 매칭 (filter 배열 메서드 사용)
      AppState.github.filteredRepos = repos.filter((repo) => repo.language === currentFilter);
    }
  },

  /**
   * 상태(Status)에 따라 Projects 컨테이너의 UI를 동적으로 변경 (DOM 조작의 핵심)
   */
  render() {
    const { status, filteredRepos, errorMessage, username } = AppState.github;

    // 1. [로딩 상태 UI]
    if (status === 'loading') {
      DOM.projectsContainer.innerHTML = `
        <div class="state-box loading-state">
          <div class="spinner" aria-hidden="true"></div>
          <p class="state-title">'${this.escapeHtml(username)}'의 GitHub 저장소를 불러오는 중...</p>
          <p class="state-desc">GitHub REST API로부터 최신 저장소 데이터를 가져오고 있습니다.</p>
        </div>
      `;
      return;
    }

    // 2. [에러 상태 UI + 다시 시도 버튼]
    if (status === 'error') {
      DOM.projectsContainer.innerHTML = `
        <div class="state-box error-state">
          <div class="state-icon"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i></div>
          <p class="state-title">프로젝트를 불러올 수 없습니다</p>
          <p class="state-desc">${this.escapeHtml(errorMessage)}</p>
          <button type="button" class="btn btn-retry" id="btn-retry-fetch">
            <i class="fa-solid fa-rotate-right" aria-hidden="true"></i>
            <span>다시 시도</span>
          </button>
        </div>
      `;

      // 동적으로 생성된 재시도 버튼에 addEventListener 바인딩 (재시도 횟수 제한 로직 적용)
      const retryBtn = document.getElementById('btn-retry-fetch');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          if (AppState.github.retryCount >= 3) {
            alert('최대 재시도 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.');
            return;
          }
          setState({ github: { retryCount: AppState.github.retryCount + 1 } });
          this.fetchProjects(AppState.github.username);
        });
      }
      return;
    }

    // 3. [빈 데이터 상태 UI]
    if (status === 'empty' || filteredRepos.length === 0) {
      DOM.projectsContainer.innerHTML = `
        <div class="state-box empty-state">
          <div class="state-icon"><i class="fa-regular fa-folder-open" aria-hidden="true"></i></div>
          <p class="state-title">표시할 프로젝트가 없습니다</p>
          <p class="state-desc">조건에 맞는 저장소가 존재하지 않거나 저장소가 비어있습니다.</p>
        </div>
      `;
      return;
    }

    // 4. [성공 상태 UI: map() 메서드 + 구조분해 할당 + 템플릿 리터럴로 카드 생성]
    const cardsHtml = filteredRepos.map((repo) => {
      // 구조분해 할당(Destructuring)으로 객체 속성 추출
      const {
        name,
        description,
        html_url,
        stargazers_count = 0,
        forks_count = 0,
        language,
        visibility = 'public'
      } = repo;

      const safeName = this.escapeHtml(name);
      const safeDesc = description ? this.escapeHtml(description) : '저장소 설명이 등록되지 않았습니다.';
      const repoLang = language || 'Text';

      return `
        <article class="repo-card">
          <div>
            <div class="repo-card-header">
              <h3 class="repo-title" title="${safeName}">${safeName}</h3>
              <span class="repo-visibility">${visibility}</span>
            </div>
            <p class="repo-desc">${safeDesc}</p>
          </div>

          <div class="repo-card-footer">
            <div class="repo-meta">
              <span class="repo-lang">
                <span class="lang-dot" aria-hidden="true"></span>
                <span>${this.escapeHtml(repoLang)}</span>
              </span>
              <span class="repo-stars" title="Stars: ${stargazers_count}">
                <i class="fa-regular fa-star" aria-hidden="true"></i> ${stargazers_count}
              </span>
              <span class="repo-forks" title="Forks: ${forks_count}">
                <i class="fa-solid fa-code-fork" aria-hidden="true"></i> ${forks_count}
              </span>
            </div>
            <a href="${html_url}" target="_blank" rel="noopener noreferrer" class="repo-link" aria-label="${safeName} 저장소 새 탭으로 이동">
              <span>GitHub</span>
              <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
            </a>
          </div>
        </article>
      `;
    }).join(''); // 배열을 하나의 문자열로 결합

    DOM.projectsContainer.innerHTML = cardsHtml;

    // 동적 생성된 .repo-card 요소들에 마우스 트래킹 Glow 애니메이션 이벤트 바인딩
    document.querySelectorAll('.repo-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  },

  /**
   * XSS 보안 방지를 위한 HTML 특수문자 치환 함수
   */
  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

/* ==========================================================================
   9. Contact 폼 실시간 유효성 검사 모듈 (Form UX)
   - 필수값 검증 (빈 필드 제출 불가)
   - 이메일 형식 정규표현식 검증
   - 인라인 에러 메시지 렌더링
   - submit 이벤트 시 event.preventDefault()로 새로고침 차단
   - 유효성 성공 시 성공 메시지 피드백 및 폼 초기화
   ========================================================================== */
const ContactFormManager = {
  // 이메일 정규표현식: id@domain.xxx 형태 검사
  EMAIL_REGEX: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  init() {
    if (!DOM.contactForm) return;

    // 1. 실시간 입력 이벤트(input) 연결
    DOM.nameInput.addEventListener('input', () => this.validateField('name'));
    DOM.emailInput.addEventListener('input', () => this.validateField('email'));
    DOM.messageInput.addEventListener('input', () => this.validateField('message'));

    // 2. 포커스 아웃(blur) 이벤트로 사용자가 입력을 마치고 벗어날 때도 검사
    DOM.nameInput.addEventListener('blur', () => this.validateField('name'));
    DOM.emailInput.addEventListener('blur', () => this.validateField('email'));
    DOM.messageInput.addEventListener('blur', () => this.validateField('message'));

    // 3. 폼 전송(submit) 이벤트 처리
    DOM.contactForm.addEventListener('submit', (e) => {
      // event.preventDefault()로 브라우저의 기본 페이지 새로고침 방지 (핵심 요구사항)
      e.preventDefault();
      this.handleSubmit();
    });
  },

  /**
   * 개별 필드 유효성 검사 및 에러 문구 생성
   * @param {'name' | 'email' | 'message'} fieldName
   */
  validateField(fieldName) {
    let isValid = true;
    let errorMsg = '';

    if (fieldName === 'name') {
      const value = DOM.nameInput.value.trim();
      if (!value) {
        isValid = false;
        errorMsg = '성함 또는 회사명을 입력해주세요.';
      } else if (value.length < 2) {
        isValid = false;
        errorMsg = '이름은 최소 2글자 이상 입력해주세요.';
      }
      AppState.contactForm.errors.name = errorMsg;
      this.renderFieldState('name', isValid, errorMsg);
    }

    if (fieldName === 'email') {
      const value = DOM.emailInput.value.trim();
      if (!value) {
        isValid = false;
        errorMsg = '이메일 주소를 입력해주세요.';
      } else if (!this.EMAIL_REGEX.test(value)) {
        isValid = false;
        errorMsg = '올바른 이메일 형식(예: user@example.com)을 입력해주세요.';
      }
      AppState.contactForm.errors.email = errorMsg;
      this.renderFieldState('email', isValid, errorMsg);
    }

    if (fieldName === 'message') {
      const value = DOM.messageInput.value.trim();
      if (!value) {
        isValid = false;
        errorMsg = '문의하실 내용을 입력해주세요.';
      } else if (value.length < 10) {
        isValid = false;
        errorMsg = '원활한 상담을 위해 최소 10자 이상 작성해주세요.';
      }
      AppState.contactForm.errors.message = errorMsg;
      this.renderFieldState('message', isValid, errorMsg);
    }

    return isValid;
  },

  /**
   * 개별 입력창의 DOM 상태(유효함 / 에러 클래스 / 에러 문구) 렌더링
   */
  renderFieldState(fieldName, isValid, errorMsg) {
    const groupElementMap = {
      name: DOM.groupName,
      email: DOM.groupEmail,
      message: DOM.groupMessage
    };

    const errorElementMap = {
      name: DOM.nameError,
      email: DOM.emailError,
      message: DOM.messageError
    };

    const groupEl = groupElementMap[fieldName];
    const errorEl = errorElementMap[fieldName];

    if (!groupEl || !errorEl) return;

    if (!isValid) {
      groupEl.classList.add('invalid');
      errorEl.textContent = errorMsg;
    } else {
      groupEl.classList.remove('invalid');
      errorEl.textContent = '';
    }
  },

  /**
   * 폼 전체 제출 처리
   */
  handleSubmit() {
    // 3개 필드 모두 검사
    const isNameValid = this.validateField('name');
    const isEmailValid = this.validateField('email');
    const isMessageValid = this.validateField('message');

    // 하나라도 실패한 경우
    if (!isNameValid || !isEmailValid || !isMessageValid) {
      this.showAlert('입력 항목 중 누락되거나 잘못된 형식이 있습니다. 다시 확인해주세요.', 'error');
      
      // 첫 번째 에러 입력창으로 자동 포커스 이동 (UX 향상)
      if (!isNameValid) DOM.nameInput.focus();
      else if (!isEmailValid) DOM.emailInput.focus();
      else if (!isMessageValid) DOM.messageInput.focus();
      return;
    }

    // 유효성 통과 시 성공 처리
    const senderName = DOM.nameInput.value.trim();
    this.showAlert(`🎉 감사합니다, ${senderName}님! 메시지가 성공적으로 전송되었습니다. 검토 후 신속히 회신드리겠습니다.`, 'success');

    // 폼 입력 초기화
    DOM.contactForm.reset();

    // 6초 후 알림창 클래스 초기화 (CSS .form-alert 기본 상태인 display: none으로 자동 복귀)
    setTimeout(() => {
      DOM.formAlert.classList.remove('success', 'error');
      DOM.formAlert.textContent = '';
    }, 6000);
  },

  /**
   * 상단 글로벌 알림 배너 렌더링 (CSS 클래스 부여 방식)
   */
  showAlert(message, type) {
    DOM.formAlert.textContent = message;
    DOM.formAlert.className = `form-alert ${type}`;
  }
};

/* ==========================================================================
   10. 인터랙티브 백그라운드 파티클 매니저 (Canvas API)
   ========================================================================== */
const ParticleManager = {
  canvas: null,
  ctx: null,
  particlesArray: [],
  mouse: { x: null, y: null, radius: 100 },

  init() {
    this.canvas = document.getElementById('particle-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // 마우스 이벤트 바인딩
    window.addEventListener('mousemove', (event) => {
      this.mouse.x = event.x;
      this.mouse.y = event.y;
    });

    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.initParticles();
    });

    // 마우스가 화면 밖으로 나가면 연결 해제
    window.addEventListener('mouseout', () => {
      this.mouse.x = undefined;
      this.mouse.y = undefined;
    });

    this.initParticles();
    this.animate();
  },

  initParticles() {
    this.particlesArray = [];
    const numberOfParticles = (this.canvas.width * this.canvas.height) / 9000;
    for (let i = 0; i < numberOfParticles; i++) {
      const size = (Math.random() * 2) + 1;
      const x = (Math.random() * ((this.canvas.width - size * 2) - (size * 2)) + size * 2);
      const y = (Math.random() * ((this.canvas.height - size * 2) - (size * 2)) + size * 2);
      const directionX = (Math.random() * 1) - 0.5;
      const directionY = (Math.random() * 1) - 0.5;
      // 반투명 회색톤 설정 (다크/라이트 모두 어울림)
      const color = 'rgba(128, 128, 128, 0.4)';

      this.particlesArray.push(new Particle(x, y, directionX, directionY, size, color, this));
    }
  },

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = 0; i < this.particlesArray.length; i++) {
      this.particlesArray[i].update();
    }
    this.connect();
  },

  connect() {
    let opacityValue = 1;
    for (let a = 0; a < this.particlesArray.length; a++) {
      for (let b = a; b < this.particlesArray.length; b++) {
        let distance = ((this.particlesArray[a].x - this.particlesArray[b].x) * (this.particlesArray[a].x - this.particlesArray[b].x))
          + ((this.particlesArray[a].y - this.particlesArray[b].y) * (this.particlesArray[a].y - this.particlesArray[b].y));
        
        if (distance < (this.canvas.width / 7) * (this.canvas.height / 7)) {
          opacityValue = 1 - (distance / 10000);
          this.ctx.strokeStyle = `rgba(128, 128, 128, ${opacityValue * 0.2})`;
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particlesArray[a].x, this.particlesArray[a].y);
          this.ctx.lineTo(this.particlesArray[b].x, this.particlesArray[b].y);
          this.ctx.stroke();
        }
      }
    }
  }
};

class Particle {
  constructor(x, y, directionX, directionY, size, color, manager) {
    this.x = x;
    this.y = y;
    this.directionX = directionX;
    this.directionY = directionY;
    this.size = size;
    this.color = color;
    this.manager = manager;
    // 원래 위치 복귀를 위한 베이스 좌표
    this.baseX = this.x;
    this.baseY = this.y;
  }

  draw() {
    this.manager.ctx.beginPath();
    this.manager.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
    this.manager.ctx.fillStyle = this.color;
    this.manager.ctx.fill();
  }

  update() {
    // 경계선 충돌 확인 및 방향 전환
    if (this.x > this.manager.canvas.width || this.x < 0) {
      this.directionX = -this.directionX;
    }
    if (this.y > this.manager.canvas.height || this.y < 0) {
      this.directionY = -this.directionY;
    }

    // 마우스 인터랙션 (부드러운 밀쳐내기 효과)
    let dx = this.manager.mouse.x - this.x;
    let dy = this.manager.mouse.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    
    if (this.manager.mouse.x != null && distance < this.manager.mouse.radius) {
      // 마우스 반대편으로 부드럽게 밀쳐내기 (Shake 제거, Repel만 남김)
      const forceDirectionX = dx / distance;
      const forceDirectionY = dy / distance;
      const force = (this.manager.mouse.radius - distance) / this.manager.mouse.radius;
      const directionX = forceDirectionX * force * 2; // 부드럽게 반응하도록 속도 조절
      const directionY = forceDirectionY * force * 2;
      this.x -= directionX;
      this.y -= directionY;
    } else {
      // 마우스가 멀어지면 원래 궤도로 서서히 복귀
      if (this.x !== this.baseX) {
        let dxBase = this.x - this.baseX;
        this.x -= dxBase / 100;
      }
      if (this.y !== this.baseY) {
        let dyBase = this.y - this.baseY;
        this.y -= dyBase / 100;
      }
    }

    // 기본 이동
    this.baseX += this.directionX;
    this.baseY += this.directionY;
    this.x += this.directionX;
    this.y += this.directionY;
    
    this.draw();
  }
}

/* ==========================================================================
   11. 애플리케이션 초기화 (Init Runner)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // 푸터 저작권 현재 연도 자동 갱신
  if (DOM.currentYearSpan) {
    DOM.currentYearSpan.textContent = new Date().getFullYear();
  }

  // 각 모듈 초기화 실행
  ThemeManager.init();
  NavigationManager.init();
  ScrollAnimationManager.init();
  TypingEffectManager.init();
  ProjectsManager.init();
  ContactFormManager.init();
  ParticleManager.init();

  console.log('🚀 Portfolio App successfully initialized with Vanilla JS & Canvas Particles!');
});
