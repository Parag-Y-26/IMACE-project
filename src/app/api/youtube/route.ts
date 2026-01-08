import { NextRequest, NextResponse } from "next/server";

// YouTube Data API alternative using search
// Since we don't want to require API keys, we'll generate YouTube search URLs
// and return formatted video suggestions

const YOUTUBE_SEARCH_BASE = "https://www.youtube.com/results?search_query=";

export async function POST(request: NextRequest) {
  try {
    const { topics, searchTerms } = await request.json();

    if (!topics && !searchTerms) {
      return NextResponse.json(
        { error: "Topics or search terms required" },
        { status: 400 }
      );
    }

    // Combine topics and search terms
    const allTerms = [...(topics || []), ...(searchTerms || [])].slice(0, 5);
    
    // Generate video suggestions with search URLs
    const videos = allTerms.map((term: string, index: number) => ({
      title: `Learn about: ${term}`,
      searchUrl: `${YOUTUBE_SEARCH_BASE}${encodeURIComponent(term + " tutorial explanation")}`,
      topic: term,
      thumbnail: `https://img.youtube.com/vi/default/hqdefault.jpg`,
      isSearchLink: true,
    }));

    // Add some educational channel suggestions
    const educationalSuggestions = [
      {
        title: "Search on Khan Academy",
        searchUrl: `${YOUTUBE_SEARCH_BASE}${encodeURIComponent(allTerms[0] + " khan academy")}`,
        topic: "Khan Academy",
        isSearchLink: true,
      },
      {
        title: "Search on Crash Course",
        searchUrl: `${YOUTUBE_SEARCH_BASE}${encodeURIComponent(allTerms[0] + " crash course")}`,
        topic: "Crash Course",
        isSearchLink: true,
      },
    ];

    return NextResponse.json({
      videos: [...videos, ...educationalSuggestions].slice(0, 6),
    });
  } catch (error) {
    console.error("YouTube search error:", error);
    return NextResponse.json(
      { error: "Failed to generate video suggestions" },
      { status: 500 }
    );
  }
}
