# 시험 친구 피티형

PDF 기반으로 자동으로 시험 대비 문제를 생성하는 학습 도우미 웹 애플리케이션입니다.

## 주요 기능

- PDF 파일 업로드
- LangChain을 활용한 자동 문제 생성
- 객관식 문제 풀이
- 실시간 채점

## 기술 스택

- Next.js
- React
- Tailwind CSS
- LangChain

## 설치 방법

1. 저장소 클론

```bash
git clone https://github.com/tumblecat44/exam-friend-pt-bro.git
cd exam-friend-pt-bro
```

2. 의존성 설치

```bash
npm install
```

3. 환경 변수 설정

- `.env` 파일을 생성

```
touch .env
```

- 다음 내용을 추가:

```
OPENAI_API_KEY=OpenAIKey
DISCORD_WEBHOOK_URL=문제 풀었을 때 사용자 확인할 웹훅 URL
DISCORD_REVIEW_WEBHOOK_URL=사용자가 보낸 의견을 확인할 웹훅 URL
NEXT_PUBLIC_GA_ID=구글애널리틱스ID

```

4. 개발 서버 실행

```bash
npm run dev
```

## 사용 방법

1. 웹 브라우저에서 `http://localhost:3000` 접속
2. PDF 파일 업로드
3. 자동으로 생성된 문제 풀기
4. 결과 확인

## 주의사항

- OpenAI API 키가 필요합니다.
- PDF 파일은 학습 자료 형식이어야 합니다.
- 문제 생성에는 약간의 시간이 소요될 수 있습니다.

## 라이선스

MIT License
