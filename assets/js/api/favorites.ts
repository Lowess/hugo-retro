// Favorites API client for GoRetro

interface GoRetroConfig {
    enabled: boolean;
    endpoint: string;
    token: string;
}

const normalizeConfigValue = (value: unknown): string => {
    if (typeof value !== 'string') {
        return '';
    }

    const trimmed = value.trim();
    if (trimmed.length >= 2) {
        const first = trimmed[0];
        const last = trimmed[trimmed.length - 1];
        if ((first === '"' && last === '"') || (first === '\'' && last === '\'')) {
            return trimmed.slice(1, -1).trim();
        }
    }

    return trimmed;
};

const getGoRetroConfig = (): GoRetroConfig => {
    if (typeof window !== 'undefined' && (window as any).__HUGO_CONFIG__?.goretro) {
        const raw = (window as any).__HUGO_CONFIG__.goretro;
        return {
            enabled: Boolean(raw.enabled),
            endpoint: normalizeConfigValue(raw.endpoint),
            token: normalizeConfigValue(raw.token),
        };
    }
    return { enabled: false, endpoint: '', token: '' };
};

const getApiUrl = (): string => {
    const config = getGoRetroConfig();
    return config.enabled ? config.endpoint : '';
};

const getAuthHeaders = (): HeadersInit => {
    const config = getGoRetroConfig();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    
    if (config.token) {
        headers['Authorization'] = `Bearer ${config.token}`;
    }
    
    return headers;
};

export interface FavoritesResponse {
    [system: string]: string[];
}

export interface FavoriteActionResponse {
    success: boolean;
    message: string;
    system: string;
    rom: string;
}

/**
 * Get all favorites
 */
export async function getAllFavorites(): Promise<FavoritesResponse> {
    const apiUrl = getApiUrl();
    if (!apiUrl) {
        console.warn('GoRetro API URL not configured');
        return {};
    }

    try {
        const response = await fetch(`${apiUrl}/api/favorites`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch favorites: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching favorites:', error);
        return {};
    }
}

/**
 * Get favorites for a specific system
 */
export async function getSystemFavorites(system: string): Promise<string[]> {
    const apiUrl = getApiUrl();
    if (!apiUrl) {
        console.warn('GoRetro API URL not configured');
        return [];
    }

    try {
        const response = await fetch(`${apiUrl}/api/favorites/${system}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch system favorites: ${response.statusText}`);
        }
        const data = await response.json();
        return data.favorites || [];
    } catch (error) {
        console.error('Error fetching system favorites:', error);
        return [];
    }
}

/**
 * Add a game to favorites
 */
export async function addFavorite(system: string, romName: string): Promise<FavoriteActionResponse | null> {
    const apiUrl = getApiUrl();
    if (!apiUrl) {
        console.error('GoRetro API URL not configured');
        return null;
    }

    try {
        const encodedRomName = encodeURIComponent(romName);
        const response = await fetch(`${apiUrl}/api/favorites/${system}/${encodedRomName}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Failed to add favorite: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error adding favorite:', error);
        return null;
    }
}

/**
 * Remove a game from favorites
 */
export async function removeFavorite(system: string, romName: string): Promise<FavoriteActionResponse | null> {
    const apiUrl = getApiUrl();
    if (!apiUrl) {
        console.error('GoRetro API URL not configured');
        return null;
    }

    try {
        const encodedRomName = encodeURIComponent(romName);
        const response = await fetch(`${apiUrl}/api/favorites/${system}/${encodedRomName}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Failed to remove favorite: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error removing favorite:', error);
        return null;
    }
}

/**
 * Toggle favorite status for a game
 */
export async function toggleFavorite(system: string, romName: string, currentlyFavorite: boolean): Promise<boolean> {
    if (currentlyFavorite) {
        const result = await removeFavorite(system, romName);
        return result?.success || false;
    } else {
        const result = await addFavorite(system, romName);
        return result?.success || false;
    }
}

/**
 * Check if API is configured
 */
export function isApiConfigured(): boolean {
    return getApiUrl() !== '';
}
