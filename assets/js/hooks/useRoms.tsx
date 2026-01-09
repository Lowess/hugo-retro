import { useEffect, useState } from "preact/hooks";

export interface RomsRequestParams {
    system?: string;
}

export interface Roms {
    name: string;
    path: string;
    md5: string;
    system?: string;  // Added: system identifier
    hash?: string;
    genreid?: string;
    region?: string;
    genre?: string;
    publisher?: string;
    developer?: string;
    releasedate?: string;
    thumbnail?: string;
    image?: string;
    desc?: string;
    rating?: string;
}

export interface System {
    id: string;
    name: string;
    icon: string;
    gameCount?: number;
    color?: string;
}

export default function useRoms({ system = "all" }: RomsRequestParams) {
    const [data, setData] = useState<Roms[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        // Fetch individual system games from /systems/{system}/index.json
        // This reduces payload size by only loading the selected system
        fetch(`/systems/${system}/index.json`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Failed to fetch system: ${system}`);
                }
                return res.json();
            })
            .then((games) => {
                setData(Array.isArray(games) ? games : []);
                setLoading(false);
            })
            .catch((err) => {
                console.error(`Failed to load ROMs for system "${system}":`, err);
                setData([]);
                setLoading(false);
            });
    }, [system]);

    return { data, loading };
}

export function useSystems() {
    const [systems, setSystems] = useState<System[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch systems list from /systems/index.json
        // This is a lightweight endpoint with just system metadata
        fetch('/systems/index.json')
            .then((res) => res.json())
            .then((systemsList) => {
                // Map the systems list to include icon
                const mappedSystems = systemsList.map((sys: any) => ({
                    id: sys.id,
                    name: sys.name,
                    icon: sys.id === 'all' ? '🎮' : '🕹️',
                    gameCount: sys.gameCount,
                    color: sys.color
                }));
                setSystems(mappedSystems);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to load systems:', err);
                // Fallback to default
                setSystems([
                    { id: "all", name: "All Systems", icon: "🎮" }
                ]);
                setLoading(false);
            });
    }, []);

    return { systems, loading };
}
