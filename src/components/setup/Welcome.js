// "use client";
// 이 지시문은 Next.js App Router에서 사용됩니다.
// 이 컴포넌트가 서버가 아닌 클라이언트 측에서 렌더링되고 실행되어야 함을 명시합니다.
// 사용자와의 상호작용(예: onClick 이벤트 핸들러)이 필요한 컴포넌트에는 반드시 필요합니다.
"use client";

// next/image에서 Image 컴포넌트를 가져옵니다.
// 이 컴포넌트는 일반 <img> 태그보다 이미지 최적화(사이즈 조절, 형식 변환, 지연 로딩 등)에 유리합니다.
import Image from "next/image";

// lucide-react 라이브러리에서 ArrowRight 아이콘 컴포넌트를 가져옵니다.
// Lucide는 간단하고 일관성 있는 디자인의 SVG 아이콘 세트입니다.
import { ArrowRight } from "lucide-react";

// Welcome 컴포넌트를 정의하고 기본(default)으로 내보냅니다.
// 부모 컴포넌트로부터 'onStart'라는 함수를 props로 전달받습니다.
export default function Welcome({ onStart }) {
  // 컴포넌트가 렌더링할 JSX를 반환합니다.
  return (
    // 최상위 컨테이너 div 요소입니다. 환영 카드의 전체적인 스타일을 담당합니다.
    <div
      className="
        group 
        relative 
        overflow-hidden 
        rounded-2xl 
        bg-white/80 
        shadow-xl 
        ring-1 
        ring-slate-200/50 
        backdrop-blur-sm 
        transition-all 
        duration-500 
        hover:shadow-2xl 
        hover:ring-slate-300/50
      "
    >
      {/* 
        group: 자식 요소에서 부모(group)의 상태(:hover 등)에 따라 스타일을 변경할 수 있게 합니다. (예: group-hover:opacity-100)
        relative: 자식 요소 중 position: absolute를 사용하는 요소의 기준점이 됩니다.
        overflow-hidden: 이 요소의 경계를 넘어가는 내용은 잘라내어 보이지 않게 합니다.
        rounded-2xl: 모서리를 매우 둥글게 만듭니다 (border-radius: 1rem).
        bg-white/80: 배경색을 80% 불투명도의 흰색으로 설정합니다.
        shadow-xl: 큰 그림자 효과를 적용하여 입체감을 줍니다.
        ring-1: 1px 두께의 링(테두리처럼 보임)을 추가합니다. box-shadow를 이용해 구현됩니다.
        ring-slate-200/50: 링의 색상을 50% 불투명도의 연한 회색(slate-200)으로 설정합니다.
        backdrop-blur-sm: 요소 뒤의 배경을 약간 흐리게 만드는 블러 효과를 적용합니다. (배경이 반투명할 때 효과가 보입니다.)
        transition-all: 모든 속성(transform, shadow 등)의 변화에 애니메이션 효과를 적용합니다.
        duration-500: 트랜지션(애니메이션)의 지속 시간을 500ms(0.5초)로 설정합니다.
        hover:shadow-2xl: 마우스를 올렸을 때(hover) 그림자를 더 크게 만듭니다.
        hover:ring-slate-300/50: 마우스를 올렸을 때 링의 색상을 조금 더 진한 회색(slate-300)으로 변경합니다.
      */}

      {/* 마우스를 올렸을 때 나타나는 그라데이션 오버레이 효과를 위한 div 입니다. */}
      <div
        className="
          absolute 
          inset-0 
          bg-gradient-to-r 
          from-blue-500/5 
          to-indigo-500/5 
          opacity-0 
          transition-opacity 
          duration-500 
          group-hover:opacity-100
        "
      >
        {/*
          absolute: 부모 요소(position: relative)를 기준으로 위치를 지정합니다.
          inset-0: top, right, bottom, left를 모두 0으로 설정하여 부모 요소를 완전히 덮도록 만듭니다.
          bg-gradient-to-r: 오른쪽 방향으로 배경색 그라데이션을 적용합니다.
          from-blue-500/5: 그라데이션 시작 색상을 5% 불투명도의 파란색(blue-500)으로 설정합니다.
          to-indigo-500/5: 그라데이션 끝 색상을 5% 불투명도의 남색(indigo-500)으로 설정합니다.
          opacity-0: 기본적으로 투명하게(보이지 않게) 설정합니다.
          transition-opacity: opacity 속성 변화에 애니메이션 효과를 적용합니다.
          duration-500: 트랜지션 지속 시간을 500ms로 설정합니다.
          group-hover:opacity-100: 부모('group' 클래스를 가진 요소)에 마우스를 올렸을 때, 이 요소의 불투명도를 100%로 만들어 완전히 보이게 합니다.
        */}
      </div>

      {/* 카드의 실제 콘텐츠(로고, 텍스트, 버튼)를 담는 컨테이너입니다. */}
      <div className="relative p-12 text-center">
        {/*
          relative: position을 relative로 설정하여, 형제 요소인 absolute 오버레이보다 위에 쌓이도록(z-index) 합니다.
          p-12: 모든 방향에 큰 안쪽 여백(padding)을 줍니다.
          text-center: 내부의 텍스트와 인라인 요소들을 중앙 정렬합니다.
        */}

        {/* 로고 이미지를 감싸는 섹션입니다. */}
        <div className="mb-8">
          {/* mb-8: 아래쪽에 큰 바깥 여백(margin-bottom)을 줍니다. */}

          {/* 로고 이미지와 그 배경을 포함하는 원형 div입니다. */}
          <div
            className="
              from-white-500 
              to-white-600 
              mx-auto 
              mb-6 
              flex 
              h-20 
              w-20 
              items-center 
              justify-center 
              rounded-2xl 
              bg-gradient-to-br 
              shadow-lg 
              transition-transform 
              duration-300 
              group-hover:scale-110
            "
          >
            {/*
              from-white-500, to-white-600: 그라데이션의 시작과 끝 색상을 정의합니다. (참고: Tailwind 기본값에 white-500, 600은 없으므로 커스텀 설정이거나 오타일 수 있습니다. 보통은 bg-white를 사용합니다.)
              mx-auto: 좌우 마진을 자동으로 설정하여 블록 요소를 수평 중앙 정렬합니다.
              mb-6: 아래쪽에 바깥 여백을 줍니다.
              flex: Flexbox 레이아웃을 사용합니다.
              h-20: 높이를 5rem (80px)으로 설정합니다.
              w-20: 너비를 5rem (80px)으로 설정합니다.
              items-center: Flexbox의 자식 요소들을 세로축(cross-axis) 중앙에 정렬합니다.
              justify-center: Flexbox의 자식 요소들을 가로축(main-axis) 중앙에 정렬합니다.
              rounded-2xl: 모서리를 매우 둥글게 만듭니다.
              bg-gradient-to-br: 오른쪽 아래 방향으로 배경 그라데이션을 적용합니다.
              shadow-lg: 큰 그림자 효과를 적용합니다.
              transition-transform: transform 속성(scale, rotate, translate 등) 변화에 애니메이션 효과를 적용합니다.
              duration-300: 트랜지션 지속 시간을 300ms로 설정합니다.
              group-hover:scale-110: 부모('group')에 마우스를 올렸을 때, 이 요소를 1.1배 확대합니다.
            */}
            <Image
              src="/PTlogo.png" // 표시할 이미지의 경로입니다. public 폴더를 기준으로 합니다.
              alt="PT Logo" // 이미지가 로드되지 않을 때 표시될 대체 텍스트입니다. 스크린 리더 사용자에게도 중요합니다.
              width={80} // 이미지의 너비를 픽셀 단위로 설정합니다. next/image에서 필수 속성입니다.
              height={80} // 이미지의 높이를 픽셀 단위로 설정합니다. next/image에서 필수 속성입니다.
              className="rounded-full" // 이미지를 원형으로 만듭니다 (border-radius: 9999px).
            />
          </div>
        </div>

        {/* 환영 메시지 제목입니다. */}
        <h2 className="mb-4 text-2xl font-semibold text-slate-800">
          {/*
            mb-4: 아래쪽에 바깥 여백을 줍니다.
            text-2xl: 글자 크기를 크게 설정합니다.
            font-semibold: 글자 굵기를 세미볼드(600)로 설정합니다.
            text-slate-800: 글자 색상을 어두운 회색으로 설정합니다.
          */}
          시험 친구 피티형~~
        </h2>

        {/* 환영 메시지 부제목 또는 설명입니다. */}
        <p className="mb-8 leading-relaxed text-slate-600">
          {/*
            mb-8: 아래쪽에 큰 바깥 여백을 줍니다.
            leading-relaxed: 줄 간격을 넓게 설정하여 가독성을 높입니다.
            text-slate-600: 글자 색상을 중간 톤의 회색으로 설정합니다.
          */}
          당신의 시험을 책임집니다~
        </p>

        {/* 버튼을 중앙에 위치시키기 위한 컨테이너입니다. */}
        <div className="flex items-center justify-center space-x-4">
          {/*
            flex, items-center, justify-center: 자식 요소(버튼)를 수평 및 수직 중앙에 배치합니다.
            space-x-4: 자식 요소들 사이에 수평 간격을 줍니다. (현재는 버튼이 하나라 효과가 보이지 않습니다.)
          */}

          {/* 시작하기 버튼입니다. */}
          <button
            onClick={onStart} // 버튼을 클릭했을 때 부모로부터 전달받은 onStart 함수를 실행합니다.
            className="
              inline-flex 
              items-center 
              space-x-2 
              rounded-xl 
              bg-gradient-to-r 
              from-blue-600 
              to-indigo-600 
              px-8 
              py-4 
              text-white 
              shadow-lg 
              transition-all 
              duration-300 
              hover:scale-105 
              hover:shadow-xl 
              active:scale-95
            "
          >
            {/*
              inline-flex: 요소를 인라인 레벨의 Flexbox 컨테이너로 만듭니다.
              items-center: 버튼 안의 텍스트와 아이콘을 세로 중앙 정렬합니다.
              space-x-2: 버튼 안의 자식 요소(span과 ArrowRight) 사이에 수평 간격을 줍니다.
              rounded-xl: 모서리를 둥글게 만듭니다.
              bg-gradient-to-r: 오른쪽 방향으로 배경 그라데이션을 적용합니다.
              from-blue-600: 그라데이션 시작 색상을 진한 파란색으로 설정합니다.
              to-indigo-600: 그라데이션 끝 색상을 진한 남색으로 설정합니다.
              px-8: 좌우 안쪽 여백을 크게 줍니다.
              py-4: 상하 안쪽 여백을 줍니다.
              text-white: 글자 색상을 흰색으로 설정합니다.
              shadow-lg: 큰 그림자 효과를 적용합니다.
              transition-all: 모든 속성 변화에 300ms 동안 애니메이션을 적용합니다.
              hover:scale-105: 마우스를 올리면 버튼을 1.05배 확대합니다.
              hover:shadow-xl: 마우스를 올리면 그림자를 더 크게 만듭니다.
              active:scale-95: 버튼을 클릭하고 있는 동안(활성 상태) 버튼을 0.95배 축소하여 눌리는 효과를 줍니다.
            */}

            {/* 버튼 내부의 텍스트입니다. */}
            <span className="font-medium">
              {/* font-medium: 글자 굵기를 미디움(500)으로 설정합니다. */}
              시작하기
            </span>
            {/* 오른쪽 화살표 아이콘 컴포넌트입니다. */}
            <ArrowRight className="h-4 w-4" />
            {/* h-4, w-4: 아이콘의 높이와 너비를 1rem (16px)으로 설정합니다. */}
          </button>
        </div>
      </div>
    </div>
  );
}