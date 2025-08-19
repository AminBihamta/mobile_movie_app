// Central TMDB configuration. Ensure EXPO_PUBLIC_MOVIE_API_KEY is defined before starting Metro.
export const TMDB_CONFIG = {
    BASE_URL: "https://api.themoviedb.org/3",
    API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY, // v3 key
    // Optional: if you have a v4 token, set EXPO_PUBLIC_TMDB_V4_TOKEN and uncomment Authorization below.
    headers: (v4Token?: string) => ({
        accept: "application/json",
        ...(v4Token
            ? { Authorization: `Bearer ${v4Token}` }
            : {}),
    }),
};

type FetchMoviesArgs = { query: string };

export const fetchMovies = async ({ query }: FetchMoviesArgs): Promise<Movie[]> => {
    if (!TMDB_CONFIG.API_KEY && !process.env.EXPO_PUBLIC_TMDB_V4_TOKEN) {
        throw new Error(
            "TMDB credentials missing: set EXPO_PUBLIC_MOVIE_API_KEY (v3) or EXPO_PUBLIC_TMDB_V4_TOKEN (v4)."
        );
    }

    const isSearch = !!query;
    const encodedQuery = encodeURIComponent(query || "");
    const endpoint = isSearch
        ? `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodedQuery}&api_key=${TMDB_CONFIG.API_KEY}`
        : `${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${TMDB_CONFIG.API_KEY}`;

    // Debug aide: uncomment during troubleshooting
    // console.log("fetchMovies endpoint:", endpoint);

    let response: Response;
    try {
        response = await fetch(endpoint, {
            method: "GET",
            headers: TMDB_CONFIG.headers(process.env.EXPO_PUBLIC_TMDB_V4_TOKEN),
        });
    } catch (networkErr: any) {
        // This branch usually yields the generic React Native "Network request failed" message.
        throw new Error(
            `Network request failed (endpoint: ${endpoint}): ${networkErr?.message || networkErr}`
        );
    }

    if (!response.ok) {
        let bodyText = "";
        try {
            bodyText = await response.text();
        } catch (_) {}
        throw new Error(
            `Failed to fetch movies: ${response.status} ${response.statusText} ${bodyText}`.trim()
        );
    }

    const data = await response.json();
    return data.results as Movie[];
};
