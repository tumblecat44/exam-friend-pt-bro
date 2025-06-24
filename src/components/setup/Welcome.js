"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function Welcome({ onStart }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/80 shadow-xl ring-1 ring-slate-200/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:ring-slate-300/50">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

      <div className="relative p-12 text-center">
        <div className="mb-8">
          <div className="from-white-500 to-white-600 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg transition-transform duration-300 group-hover:scale-110">
            <Image
              src="/PTlogo.png"
              alt="PT Logo"
              width={80}
              height={80}
              className="rounded-full"
            />
          </div>
        </div>

        <h2 className="mb-4 text-2xl font-semibold text-slate-800">
          시험 친구 피티형~~
        </h2>
        <p className="mb-8 leading-relaxed text-slate-600">
          당신의 시험을 책임집니다~
        </p>

        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={onStart}
            className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
          >
            <span className="font-medium">시작하기</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
