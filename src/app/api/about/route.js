

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
  
    if (!name) {
      return new Response("이름을 입력해주세요.", { status: 400 });
    }
  
    return new Response(`${name}님 안녕하세요`, { status: 200 });
  }
  