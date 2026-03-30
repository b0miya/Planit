# Planit

교사를 위한 주간 일정 관리 웹앱

**https://b0miya.github.io/Planit/**

---

## 주요 기능

- **주간 시간표 뷰** — 월~일 7열 그리드로 한 주 일정을 한눈에 확인
- **일별 상세 패널** — 출근 전/퇴근 후 메모, 할 일 목록(○/✓), 업무 일지 작성
- **시간표 편집** — 교시 시작·종료 시간, 수업 배치, 출퇴근 시간 직접 수정
- **자동 저장** — 브라우저 localStorage에 즉시 저장
- **클라우드 동기화** (선택) — Google 로그인 시 Firebase를 통해 기기 간 동기화

---

## 기술 스택

| 항목 | 기술 |
|------|------|
| UI | React 18 |
| 빌드 | Vite 5 |
| 상태 관리 | Zustand 4 |
| 클라우드 | Firebase 10 (Firestore + Auth) |
| 배포 | GitHub Pages (GitHub Actions 자동 배포) |

---

## 로컬 실행

```bash
npm install
npm run dev
```

---

## Firebase 연동 (선택)

클라우드 동기화 없이도 localStorage만으로 동작합니다.
동기화가 필요한 경우 아래 절차를 따르세요.

1. [Firebase Console](https://console.firebase.google.com)에서 프로젝트 생성
2. Firestore Database 및 Google 인증 활성화
3. `.env.example`을 복사해 `.env` 파일 생성 후 값 입력

```bash
cp .env.example .env
```

GitHub Actions 배포 시에는 저장소 **Settings → Secrets**에 동일한 키를 등록하세요.
