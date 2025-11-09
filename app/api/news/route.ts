import { NextResponse } from 'next/server';

// Using NewsAPI.org - better health category support
const API_URL = "https://newsapi.org/v2/top-headlines";
const API_KEY = process.env.NEWS_API_KEY;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // NewsAPI allows up to 100
    const requestedLimit = parseInt(searchParams.get('limit') || '10');
    const limit = Math.min(requestedLimit, 20);

    console.log('🔑 API_KEY status:', API_KEY ? 'Set' : 'Not set');
    
    if (!API_KEY || API_KEY === 'your_api_key_here') {
      console.error('❌ API key not configured in environment variables');
      return NextResponse.json(
        { error: 'API key not configured. Add NEWS_API_KEY to .env.local' },
        { status: 500 }
      );
    }

    // Use health category and search for additional filtering
    const apiUrl = `${API_URL}?category=health&language=en&pageSize=${limit}&apiKey=${API_KEY}`;
    console.log('📡 Fetching from NewsAPI:', apiUrl.replace(API_KEY, 'HIDDEN'));

    const response = await fetch(apiUrl);

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ External API Error:', response.status, errorText);
      return NextResponse.json(
        { error: `External API error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Received data:', data.articles ? `${data.articles.length} articles` : 'No articles field');
    
    if (!data.articles || !Array.isArray(data.articles)) {
      console.error('❌ Invalid response structure:', data);
      return NextResponse.json(
        { error: 'Invalid response from news API' },
        { status: 500 }
      );
    }

    const articles = data.articles.map((a: any) => ({
      id: a.url,
      title: a.title,
      summary: a.description || '',
      image: a.urlToImage || '',
      publishedAt: a.publishedAt,
      source: a.source?.name || 'Unknown',
      link: a.url,
    }));

    console.log('✅ Successfully processed', articles.length, 'articles');
    return NextResponse.json({ articles });
  } catch (error) {
    console.error('❌ News API catch block error:', error);
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
