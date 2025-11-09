// services/apitube.ts
// Using Next.js API route to bypass CORS issues
export async function fetchHealthNews(limit = 10) {
  console.log('🔄 Fetching health news via proxy...');

  const res = await fetch(`/api/news?limit=${limit}`);

  if (!res.ok) {
    const errorText = await res.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { error: errorText || 'Unknown error' };
    }
    console.error('❌ API Error:', res.status, errorData);
    console.error('📝 Error details:', errorText);
    throw new Error(errorData.error || 'Failed to fetch news');
  }

  const data = await res.json();
  console.log('✅ Successfully fetched', data.articles?.length || 0, 'articles');
  
  return data.articles;
}
