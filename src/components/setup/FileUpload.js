// "use client"; 지시어는 이 파일이 서버가 아닌 클라이언트 측에서 렌더링되고 실행되는 React "클라이언트 컴포넌트"임을 명시합니다.
// 이를 통해 useState, useEffect와 같은 React 훅과 onClick 같은 이벤트 리스너를 사용할 수 있습니다.
"use client";

// 'lucide-react' 라이브러리에서 아이콘 컴포넌트들을 가져옵니다.
// Upload: 파일 업로드를 나타내는 아이콘입니다.
// Info: 정보 제공을 나타내는 아이콘입니다.
// AlertCircle: 오류나 경고를 나타내는 아이콘입니다.
// ArrowLeft: '뒤로 가기' 동작을 나타내는 아이콘입니다.
import { Upload, Info, AlertCircle, ArrowLeft } from "lucide-react";

/**
 * FileUpload 컴포넌트: 사용자가 PDF 파일을 업로드할 수 있는 UI를 렌더링합니다.
 * @param {object} props - 컴포넌트의 props.
 * @param {Function} props.onFileUpload - 사용자가 파일을 선택했을 때 호출될 콜백 함수.
 * @param {Function} props.onBack - 사용자가 '뒤로' 버튼을 클릭했을 때 호출될 콜백 함수.
 * @param {string | null} props.error - 표시할 오류 메시지. 오류가 없으면 null입니다.
 */
export default function FileUpload({ onFileUpload, onBack, error }) {
  // 컴포넌트가 반환하는 JSX 구조입니다.
  return (
    // 최상위 컨테이너 div입니다. 'group' 클래스는 자식 요소에서 'group-hover'를 사용하여 부모의 호버 상태에 따라 스타일을 변경할 수 있게 합니다.
    // relative: 내부의 absolute 요소 위치 기준이 됩니다.
    // overflow-hidden: 자식 요소가 컨테이너 밖으로 나가면 잘라냅니다.
    // rounded-2xl: 모서리를 크게 둥글게 만듭니다.
    // bg-white/80: 반투명한 흰색 배경입니다.
    // shadow-xl, ring-1, ring-slate-200/50: 그림자와 테두리 스타일입니다.
    // backdrop-blur-sm: 배경을 흐리게 처리하여 유리 같은 효과를 줍니다.
    // transition-all, duration-500: 모든 속성 변경에 0.5초 동안 부드러운 전환 효과를 적용합니다.
    // hover:shadow-2xl, hover:ring-slate-300/50: 마우스를 올렸을 때 그림자와 테두리 스타일을 강화합니다.
    <div className="group relative overflow-hidden rounded-2xl bg-white/80 shadow-xl ring-1 ring-slate-200/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:ring-slate-300/50">
      {/* 이 div는 호버 시 나타나는 그라데이션 오버레이 효과를 만듭니다. */}
      {/* absolute, inset-0: 부모('group' div)를 완전히 채우도록 위치를 설정합니다. */}
      {/* bg-gradient-to-r ...: 오른쪽으로 흐르는 파란색 계열의 투명한 그라데이션 배경을 적용합니다. */}
      {/* opacity-0: 기본적으로는 투명하여 보이지 않습니다. */}
      {/* transition-opacity, duration-500: 투명도 변경에 0.5초의 전환 효과를 줍니다. */}
      {/* group-hover:opacity-100: 부모('group' div)에 마우스를 올리면 이 요소가 불투명도 100%로 나타나게 됩니다. */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

      {/* 모든 주요 콘텐츠를 담는 컨테이너입니다. */}
      {/* relative: 오버레이 div 위에 콘텐츠가 위치하도록 z-index 컨텍스트를 만듭니다. */}
      {/* p-12: 모든 방향에 큰 패딩을 추가합니다. */}
      {/* text-center: 내부 텍스트를 중앙 정렬합니다. */}
      <div className="relative p-12 text-center">
        {/* 업로드 아이콘과 그 배경을 포함하는 섹션입니다. */}
        <div className="mb-8">
          {/* 아이콘을 감싸는 원형 배경입니다. */}
          {/* mx-auto: 수평 중앙 정렬합니다. */}
          {/* mb-6: 아래쪽에 마진을 추가합니다. */}
          {/* flex, items-center, justify-center: 내부 아이콘을 수직/수평 중앙에 배치합니다. */}
          {/* h-20, w-20: 높이와 너비를 고정합니다. */}
          {/* rounded-2xl: 모서리를 둥글게 만듭니다. */}
          {/* bg-gradient-to-br ...: 대각선 방향의 그라데이션 배경입니다. */}
          {/* shadow-lg: 큰 그림자 효과를 줍니다. */}
          {/* transition-transform, duration-300: 크기 변경에 0.3초의 전환 효과를 줍니다. */}
          {/* group-hover:scale-110: 최상위 'group' 컨테이너에 마우스를 올리면 이 원형 배경이 110%로 커집니다. */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg transition-transform duration-300 group-hover:scale-110">
            {/* Upload 아이콘 컴포넌트입니다. */}
            {/* h-10, w-10: 아이콘 크기를 설정합니다. */}
            {/* text-white: 아이콘 색상을 흰색으로 설정합니다. */}
            <Upload className="h-10 w-10 text-white" />
          </div>
        </div>

        {/* 페이지의 주 제목입니다. */}
        <h2 className="mb-4 text-2xl font-semibold text-slate-800">
          PDF 파일을 업로드하세요
        </h2>
        {/* 페이지의 설명 텍스트입니다. */}
        <p className="mb-8 leading-relaxed text-slate-600">
          학습 자료를 PDF로 업로드하면 AI가 자동으로
          <br /> {/* <br /> 태그는 줄바꿈을 위해 사용됩니다. */}
          맞춤형 문제를 생성해드립니다
        </p>

        {/* 파일 요구사항 섹션 */}
        {/* 이 섹션은 사용자에게 업로드할 파일의 조건을 안내합니다. */}
        <div className="mb-8 rounded-xl bg-slate-50 p-6 text-left">
          {/* 아이콘과 텍스트를 나란히 배치하기 위한 flex 컨테이너입니다. */}
          <div className="flex items-start space-x-3">
            {/* Info 아이콘 컴포넌트입니다. */}
            {/* mt-0.5: 위쪽에 약간의 마진을 주어 텍스트와 정렬을 맞춥니다. */}
            {/* h-5, w-5: 아이콘 크기입니다. */}
            {/* flex-shrink-0: 공간이 부족해도 아이콘 크기가 줄어들지 않도록 합니다. */}
            {/* text-blue-500: 아이콘 색상을 파란색으로 설정합니다. */}
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
            {/* 요구사항 텍스트를 담는 컨테이너입니다. */}
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-800">파일 요구사항</h3>
              {/* 요구사항 목록입니다. */}
              <ul className="space-y-1 text-sm text-slate-600">
                <li>• 파일 형식: PDF만 지원</li>
                <li>
                  • 최대 파일 크기:{" "}
                  {/* 특정 부분을 강조하기 위해 span 태그와 스타일을 사용합니다. */}
                  <span className="font-medium text-blue-600">10MB</span>
                </li>
                <li>• 텍스트가 포함된 PDF 파일 권장</li>
                <li>• 피그마 등 이미지 기반 PDF는 지원하지 않습니다</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 오류 표시 섹션 */}
        {/* 'error' prop에 값이 있을 경우에만 이 div 블록을 렌더링합니다(조건부 렌더링). */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            {/* 아이콘과 오류 메시지를 나란히 배치합니다. */}
            <div className="flex items-start space-x-3">
              {/* AlertCircle 아이콘 컴포넌트로, 오류 상태임을 시각적으로 나타냅니다. */}
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
              <div>
                <h3 className="font-medium text-red-800">오류 발생</h3>
                {/* 'error' prop으로 전달된 실제 오류 메시지를 표시합니다. */}
                <p className="mt-1 text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* 파일 입력을 위한 label입니다. 실제 input 요소는 숨기고 이 label을 버튼처럼 스타일링합니다. */}
        {/* 사용자가 이 label을 클릭하면 숨겨진 파일 입력(input)이 트리거됩니다. */}
        {/* group/btn: 이 요소에 'btn'이라는 이름의 그룹을 지정합니다. 여기서는 사용되지 않지만 중첩된 그룹 호버 효과에 쓸 수 있습니다. */}
        {/* inline-flex, items-center, justify-center: 버튼 스타일을 위한 flex 속성입니다. */}
        {/* cursor-pointer: 마우스 커서를 손가락 모양으로 변경하여 클릭 가능함을 나타냅니다. */}
        {/* px-8, py-4: 패딩으로 버튼 크기를 조절합니다. */}
        {/* transition-all, duration-300: 모든 속성 변경에 부드러운 전환 효과를 줍니다. */}
        {/* hover:scale-105, hover:shadow-xl: 마우스를 올리면 버튼이 약간 커지고 그림자가 강해집니다. */}
        {/* active:scale-95: 버튼을 클릭하는 동안 약간 작아지는 효과를 줍니다. */}
        <label className="group/btn inline-flex cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95">
          <span className="font-medium">PDF 선택하기</span>
          {/* 실제 파일 입력을 처리하는 input 요소입니다. */}
          {/* type="file": 파일 선택 대화상자를 엽니다. */}
          {/* accept=".pdf": 파일 선택 시 PDF 파일만 표시하도록 제한합니다. */}
          {/* onChange={onFileUpload}: 파일이 선택되면 부모로부터 전달받은 onFileUpload 함수를 호출합니다. */}
          {/* className="hidden": 이 요소를 화면에 보이지 않도록 숨깁니다. */}
          <input
            type="file"
            accept=".pdf"
            onChange={onFileUpload}
            className="hidden"
          />
        </label>

        {/* '뒤로' 버튼을 담는 컨테이너입니다. */}
        <div className="mt-6">
          {/* '뒤로 가기' 기능을 수행하는 버튼입니다. */}
          {/* onClick={onBack}: 버튼이 클릭되면 부모로부터 전달받은 onBack 함수를 호출합니다. */}
          {/* 스타일은 파일 선택 버튼과 달리 더 차분한 톤으로 디자인되었습니다(흰색 배경, 회색 텍스트). */}
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-2 rounded-xl border-2 border-slate-300 bg-white px-6 py-3 text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 active:scale-95"
          >
            {/* ArrowLeft 아이콘 컴포넌트입니다. */}
            <ArrowLeft className="h-4 w-4" />
            <span>뒤로</span>
          </button>
        </div>
      </div>
    </div>
  );
}