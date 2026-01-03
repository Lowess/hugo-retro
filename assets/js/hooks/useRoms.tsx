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
}

export default function useRoms({ system = "all" }: RomsRequestParams) {
    const [data, setData] = useState<Roms[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        // Fetch from systems/index.json which contains all systems and their games
        fetch(`/systems/index.json`)
            .then((res) => res.json())
            .then((systems) => {
                // Find the requested system
                const selectedSystem = systems.find((s: any) => s.id === system);
                if (selectedSystem && selectedSystem.games) {
                    setData(selectedSystem.games);
                } else {
                    setData([]);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to load ROMs:', err);
                setLoading(false);
            });
    }, [system]);

    return { data, loading };
}

export function useSystems() {
    const [systems, setSystems] = useState<System[]>([
        { id: "all", name: "All Systems", icon: "🎮" }
    ]);

    useEffect(() => {
        // Try to fetch systems from window config if available
        // This can be populated by Hugo template
        const hugoSystems = (window as any).__HUGO_SYSTEMS__;
        if (hugoSystems && Array.isArray(hugoSystems)) {
            setSystems(hugoSystems);
        }
    }, []);

    return { systems };
}
