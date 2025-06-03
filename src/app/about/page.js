"use client"
import { useState } from 'react';
import Link from 'next/link';

export default function About() {
    const [name, setName] = useState('');
    const [response, setResponse] = useState('');
    const handleRequest = async () => {
        if (!name || name.trim() === '') {
          alert('이름을 입력해주세요.');
          return;
        }
      
        try {
          const res = await fetch(`/api/about?name=${encodeURIComponent(name)}`);
      
          if (res.ok) {
            const message = await res.text();
            setResponse(message);
          } else if (res.status === 400) {
            const errorMessage = await res.text();
            alert(errorMessage);
          } else {
            alert('알 수 없는 오류가 발생했습니다.');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('요청 중 오류가 발생했습니다.');
        }
      };
      

    return (
        <div>
            <h1>about 페이지입니다람쥐</h1>
            <Link href="/">홈으로 이동</Link>
            <div>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="이름을 입력하세요"
                />
                <button onClick={handleRequest}>API 요청</button>
            </div>
            {response && <p>{response}</p>}
        </div>
    );
}