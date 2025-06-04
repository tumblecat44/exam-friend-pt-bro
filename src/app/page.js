import Image from "next/image";

export default function Home() {
  return (
    <div>
      <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
        버튼
      </button>

      <h1 className="text-2xl font-bold text-center text-gray-800">제목</h1>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center">
          <span>왼쪽</span>
          <span>오른쪽</span>
        </div>
      </div>
      <span className="bg-blue-500 hover:bg-blue-700 transition-colors">
        호버 효과
      </span>
      <input className="border focus:ring-2 focus:ring-blue-500 focus:border-transparent"></input>
      <div>
        <button className="bg-gray-200 active:bg-gray-300">클릭 효과</button>
      </div>

      <button class="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 focus:ring-2 focus:ring-blue-300 text-white px-4 py-2 rounded transition-all">
        완벽한 버튼
      </button>
    </div>
  );
}
