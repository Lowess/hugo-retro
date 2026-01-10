import { h, Fragment } from 'preact';
import { useState, useMemo, useEffect } from 'preact/hooks';
import useRoms, { Roms, useSystems } from '../hooks/useRoms';
import { getAllFavorites, toggleFavorite, isApiConfigured } from '../api/favorites';

interface Props {
    initialSystem?: string;
}

const RomsCardGrid = ({ initialSystem = 'all' }: Props) => {
    const [selectedSystem, setSelectedSystem] = useState(initialSystem);
    const { data, loading } = useRoms({ system: selectedSystem });
    const { systems } = useSystems();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('all');
    const [selectedPublisher, setSelectedPublisher] = useState('all');
    const [systemFilter, setSystemFilter] = useState('all');  // System filter within view
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);  // Empty = all languages by default
    const [sortBy, setSortBy] = useState<'name' | 'releasedate' | 'rating'>('name');
    const [filterGradient, setFilterGradient] = useState('from-indigo-600 via-purple-600 to-pink-500');
    const [selectedRom, setSelectedRom] = useState<Roms | null>(null);
    const [hoverColor, setHoverColor] = useState('purple-500');
    const [showMoreFilters, setShowMoreFilters] = useState(false); // Toggle for advanced filters

    // Favorites state
    const [favorites, setFavorites] = useState<{ [system: string]: string[] }>({});
    const [favoritesFilter, setFavoritesFilter] = useState(false); // Filter to show only favorites
    const [apiConfigured, setApiConfigured] = useState(false);
    const [favoriteTogglingMap, setFavoriteTogglingMap] = useState<{ [key: string]: boolean }>({});

    // Load favorites on mount
    useEffect(() => {
        setApiConfigured(isApiConfigured());
        if (isApiConfigured()) {
            loadFavorites();
        }
    }, []);

    const loadFavorites = async () => {
        const allFavorites = await getAllFavorites();
        setFavorites(allFavorites);
    };

    // Check if a ROM is favorited
    const isFavorite = (rom: Roms): boolean => {
        const system = rom.system || selectedSystem;
        return favorites[system]?.includes(rom.name) || false;
    };

    // Handle favorite toggle
    const handleToggleFavorite = async (rom: Roms, e: Event) => {
        e.stopPropagation(); // Prevent modal from opening

        const system = rom.system || selectedSystem;
        const key = `${system}-${rom.name}`;

        console.log('Toggle favorite:', { system, romName: rom.name, currentlyFavorite: isFavorite(rom) });

        // Prevent multiple clicks
        if (favoriteTogglingMap[key]) {
            console.log('Already toggling, skipping...');
            return;
        }

        setFavoriteTogglingMap(prev => ({ ...prev, [key]: true }));

        const currentlyFavorite = isFavorite(rom);
        const success = await toggleFavorite(system, rom.name, currentlyFavorite);

        console.log('Toggle result:', { success });

        if (success) {
            // Update local favorites state
            setFavorites(prev => {
                const updated = { ...prev };
                if (!updated[system]) {
                    updated[system] = [];
                }

                if (currentlyFavorite) {
                    // Remove from favorites
                    updated[system] = updated[system].filter(name => name !== rom.name);
                    console.log('Removed from favorites');
                } else {
                    // Add to favorites
                    updated[system] = [...updated[system], rom.name];
                    console.log('Added to favorites');
                }

                return updated;
            });
        } else {
            console.error('Failed to toggle favorite');
        }

        setFavoriteTogglingMap(prev => ({ ...prev, [key]: false }));
    };

    // Get system from URL parameter if available
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const systemParam = urlParams.get('system');
        if (systemParam) {
            setSelectedSystem(systemParam);
        }
    }, []);

    // Sync filter gradient with header color
    useEffect(() => {
        const header = document.getElementById('site-header');
        if (!header) return;

        const updateFilterGradient = () => {
            const headerClasses = Array.from(header.classList);
            const gradientClasses = headerClasses.filter(cls =>
                cls.startsWith('from-') || cls.startsWith('via-') || cls.startsWith('to-')
            );

            if (gradientClasses.length > 0) {
                setFilterGradient(gradientClasses.join(' '));

                // Extract hover color from via- gradient (middle color)
                const viaClass = gradientClasses.find(cls => cls.startsWith('via-'));
                if (viaClass) {
                    // Extract color like "purple-600" from "via-purple-600"
                    const color = viaClass.replace('via-', '');
                    setHoverColor(color);
                }
            }
        };

        // Initial sync
        updateFilterGradient();

        // Watch for header color changes
        const observer = new MutationObserver(updateFilterGradient);
        observer.observe(header, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    // Get current system info
    const currentSystem = useMemo(() => {
        return systems.find(s => s.id === selectedSystem) || { id: 'all', name: 'All Systems', icon: '🎮' };
    }, [systems, selectedSystem]);

    // Get unique system names from current data (for filter dropdown)
    const availableSystems = useMemo(() => {
        if (!data) return [];
        const uniqueSystems = new Set<string>();
        data.forEach(rom => {
            if (rom.system) {
                uniqueSystems.add(rom.system);
            }
        });
        return Array.from(uniqueSystems).sort();
    }, [data]);

    // Get unique languages/regions from current data
    const availableLanguages = useMemo(() => {
        if (!data) return [];
        const uniqueLanguages = new Set<string>();
        data.forEach(rom => {
            if (rom.region && rom.region.trim() !== '') {
                uniqueLanguages.add(rom.region.toLowerCase());
            }
        });
        return Array.from(uniqueLanguages).sort();
    }, [data]);

    // Language display names
    const languageNames: { [key: string]: string } = {
        'us': '🇺🇸 USA',
        'fr': '🇫🇷 France',
        'jp': '🇯🇵 Japan',
        'eu': '🇪🇺 Europe',
        'uk': '🇬🇧 UK',
        'de': '🇩🇪 Germany',
        'es': '🇪🇸 Spain',
        'it': '🇮🇹 Italy',
        'wor': '🌍 World',
        'ss': '🎮 System',
    };

    // Extract unique genres and publishers from data
    const genres = useMemo(() => {
        if (!data) return [];
        const uniqueGenres = new Set<string>();
        data.forEach(rom => {
            if (rom.genre && rom.genre.trim() !== '') {
                uniqueGenres.add(rom.genre);
            }
        });
        return Array.from(uniqueGenres).sort();
    }, [data]);

    const publishers = useMemo(() => {
        if (!data) return [];
        const uniquePublishers = new Set<string>();
        data.forEach(rom => {
            if (rom.publisher && rom.publisher.trim() !== '') {
                uniquePublishers.add(rom.publisher);
            }
        });
        return Array.from(uniquePublishers).sort();
    }, [data]);

    // Filter and sort ROMs
    const filteredRoms = useMemo(() => {
        if (!data) return [];

        let filtered = data.filter(rom => {
            // Filter out empty or invalid entries
            if (!rom.name || rom.name.trim() === '') return false;

            // Search term filter
            const matchesSearch = searchTerm === '' ||
                rom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (rom.desc && rom.desc.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (rom.developer && rom.developer.toLowerCase().includes(searchTerm.toLowerCase()));

            // Genre filter
            const matchesGenre = selectedGenre === 'all' || rom.genre === selectedGenre;

            // Publisher filter
            const matchesPublisher = selectedPublisher === 'all' || rom.publisher === selectedPublisher;

            // System filter (only applies when viewing "All Systems")
            const matchesSystem = systemFilter === 'all' || rom.system === systemFilter;

            // Language/Region filter (multi-select)
            const matchesLanguage = selectedLanguages.length === 0 ||
                selectedLanguages.includes('all') ||
                (rom.region && selectedLanguages.includes(rom.region.toLowerCase()));

            // Favorites filter
            const matchesFavorite = !favoritesFilter || isFavorite(rom);

            return matchesSearch && matchesGenre && matchesPublisher && matchesSystem && matchesLanguage && matchesFavorite;
        });

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'releasedate':
                    const dateA = a.releasedate || '0';
                    const dateB = b.releasedate || '0';
                    return dateB.localeCompare(dateA); // Newest first
                case 'rating':
                    const ratingA = parseFloat(a.rating || '0');
                    const ratingB = parseFloat(b.rating || '0');
                    return ratingB - ratingA; // Highest first
                default:
                    return 0;
            }
        });

        return filtered;
    }, [data, searchTerm, selectedGenre, selectedPublisher, systemFilter, selectedLanguages, sortBy, favoritesFilter, favorites]);

    const formatReleaseDate = (dateStr?: string) => {
        if (!dateStr || dateStr.length !== 8) return 'Unknown';
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        return `${month}/${day}/${year}`;
    };

    const handleReset = () => {
        setSearchTerm('');
        setSelectedGenre('all');
        setSelectedPublisher('all');
        setSystemFilter('all');
        setSelectedLanguages([]); // Reset to all languages (empty = all)
        setSortBy('name');
        setFavoritesFilter(false); // Reset favorites filter
        setShowMoreFilters(false); // Close advanced filters
    };

    // Handle language checkbox toggle
    const handleLanguageToggle = (lang: string) => {
        setSelectedLanguages(prev => {
            if (prev.includes(lang)) {
                return prev.filter(l => l !== lang);
            } else {
                return [...prev, lang];
            }
        });
    };

    return (
        <div className="py-8">
            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                        <div className="text-6xl mb-4 animate-bounce">🎮</div>
                        <p className="text-xl text-white font-medium">Loading ROMs...</p>
                    </div>
                </div>
            )}

            {!loading && (
                <>
            {/* Filters Section */}
            <div className={`bg-gradient-to-br ${filterGradient} rounded-2xl shadow-2xl p-6 md:p-8 mb-8 text-white transition-all duration-500`}>
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                        {currentSystem.icon} {currentSystem.name}
                    </h2>
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-semibold shadow-lg min-w-[140px] text-center">
                            {filteredRoms.length} / {data?.length || 0} ROMs
                        </div>
                        {apiConfigured && (
                            <button
                                onClick={() => setFavoritesFilter(!favoritesFilter)}
                                className={`px-4 py-2 rounded-full font-bold text-sm transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 min-w-[140px] ${
                                    favoritesFilter
                                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-yellow-500/50'
                                        : 'bg-white/20 hover:bg-white/30 backdrop-blur-md border-2 border-white/40 hover:border-white/60'
                                }`}
                            >
                                <span className="text-sm">{favoritesFilter ? '⭐' : '☆'}</span>
                                <span>Favorites</span>
                            </button>
                        )}
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md border-2 border-white/40 hover:border-white/60 rounded-full font-bold text-sm transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 min-w-[140px]"
                        >
                            <span>🔄</span>
                            <span>Reset</span>
                        </button>
                    </div>
                </div>

                {/* Primary Filters Row */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* Search */}
                    <div>
                        <label htmlFor="search" className="block text-sm font-semibold mb-2 uppercase tracking-wide">
                            Search
                        </label>
                        <input
                            id="search"
                            type="text"
                            placeholder="Search games..."
                            value={searchTerm}
                            onInput={(e: any) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-white/95 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/50 focus:bg-white transition-all duration-200 shadow-lg"
                        />
                    </div>

                    {/* Sort By */}
                    <div>
                        <label htmlFor="sortby" className="block text-sm font-semibold mb-2 uppercase tracking-wide">
                            Sort By
                        </label>
                        <select
                            id="sortby"
                            value={sortBy}
                            onChange={(e: any) => setSortBy(e.target.value as any)}
                            className="w-full px-4 py-3 rounded-lg bg-white/95 text-gray-800 focus:outline-none focus:ring-4 focus:ring-white/50 focus:bg-white transition-all duration-200 shadow-lg appearance-none cursor-pointer"
                        >
                            <option value="name">Name (A-Z)</option>
                            <option value="releasedate">Release Date</option>
                            <option value="rating">Rating</option>
                        </select>
                    </div>
                </div>

                {/* More Filters Button Row */}
                <div className="mb-4">
                    <button
                        onClick={() => setShowMoreFilters(!showMoreFilters)}
                        className="w-full md:w-auto px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md border-2 border-white/40 hover:border-white/60 rounded-lg font-bold uppercase tracking-wide text-sm transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                    >
                        <svg className={`w-5 h-5 transition-transform ${showMoreFilters ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                        <span>{showMoreFilters ? 'Hide' : 'Show'} Advanced Filters</span>
                    </button>
                </div>

                {/* Advanced Filters (Collapsible) */}
                {showMoreFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-white/20 animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* System Filter (only show when viewing "All Systems") */}
                        {selectedSystem === 'all' && availableSystems.length > 1 && (
                            <div>
                                <label htmlFor="systemFilter" className="block text-sm font-semibold mb-2 uppercase tracking-wide">
                                    System
                                </label>
                                <select
                                    id="systemFilter"
                                    value={systemFilter}
                                    onChange={(e: any) => setSystemFilter(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-white/95 text-gray-800 focus:outline-none focus:ring-4 focus:ring-white/50 focus:bg-white transition-all duration-200 shadow-lg appearance-none cursor-pointer"
                                >
                                    <option value="all">All Systems</option>
                                    {availableSystems.map(sys => {
                                        const sysInfo = systems.find(s => s.id === sys);
                                        return (
                                            <option key={sys} value={sys}>
                                                {sysInfo ? sysInfo.name : sys}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        )}

                        {/* Genre Filter */}
                        <div>
                            <label htmlFor="genre" className="block text-sm font-semibold mb-2 uppercase tracking-wide">
                                Genre
                            </label>
                            <select
                                id="genre"
                                value={selectedGenre}
                                onChange={(e: any) => setSelectedGenre(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-white/95 text-gray-800 focus:outline-none focus:ring-4 focus:ring-white/50 focus:bg-white transition-all duration-200 shadow-lg appearance-none cursor-pointer"
                            >
                                <option value="all">All Genres</option>
                                {genres.map(genre => (
                                    <option key={genre} value={genre}>{genre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Publisher Filter */}
                        <div>
                            <label htmlFor="publisher" className="block text-sm font-semibold mb-2 uppercase tracking-wide">
                                Publisher
                            </label>
                            <select
                                id="publisher"
                                value={selectedPublisher}
                                onChange={(e: any) => setSelectedPublisher(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-white/95 text-gray-800 focus:outline-none focus:ring-4 focus:ring-white/50 focus:bg-white transition-all duration-200 shadow-lg appearance-none cursor-pointer"
                            >
                                <option value="all">All Publishers</option>
                                {publishers.map(publisher => (
                                    <option key={publisher} value={publisher}>{publisher}</option>
                                ))}
                            </select>
                        </div>

                        {/* Language/Region Filter */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 uppercase tracking-wide">
                                Region/Language
                            </label>
                            <div className="relative">
                                <details className="group">
                                    <summary className="w-full px-4 py-3 rounded-lg bg-white/95 text-gray-800 focus:outline-none focus:ring-4 focus:ring-white/50 transition-all duration-200 shadow-lg cursor-pointer list-none flex items-center justify-between">
                                        <span className="text-sm">
                                            {selectedLanguages.length === 0 ? 'All Regions' :
                                             selectedLanguages.length === availableLanguages.length ? 'All Regions' :
                                             `${selectedLanguages.length} selected`}
                                        </span>
                                        <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                                        </svg>
                                    </summary>
                                    <div className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-xl border-2 border-gray-200 max-h-60 overflow-y-auto">
                                        <div className="p-2 space-y-1">
                                            <label className="flex items-center px-3 py-2 hover:bg-gray-100 rounded cursor-pointer transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedLanguages.length === 0 || selectedLanguages.length === availableLanguages.length}
                                                    onChange={() => setSelectedLanguages(selectedLanguages.length === availableLanguages.length ? [] : availableLanguages)}
                                                    className="mr-3 w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                                                />
                                                <span className="text-sm font-medium text-gray-700">🌍 All Regions</span>
                                            </label>
                                            {availableLanguages.map(lang => (
                                                <label key={lang} className="flex items-center px-3 py-2 hover:bg-gray-100 rounded cursor-pointer transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedLanguages.includes(lang)}
                                                        onChange={() => handleLanguageToggle(lang)}
                                                        className="mr-3 w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                                                    />
                                                    <span className="text-sm text-gray-700">
                                                        {languageNames[lang] || lang.toUpperCase()}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </details>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRoms.length === 0 ? (
                    <div className="col-span-full text-center py-16">
                        <div className="text-6xl mb-4">🎮</div>
                        <p className="text-xl text-gray-300 font-medium">No ROMs found matching your filters.</p>
                        <p className="text-gray-400 mt-2">Try adjusting your search criteria.</p>
                    </div>
                ) : (
                    filteredRoms.map(rom => (
                        <div
                            key={rom.md5}
                            className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg hover:shadow-2xl hover:shadow-${hoverColor}/50 transition-all duration-300 hover:-translate-y-2 overflow-hidden flex flex-col group border border-gray-700/50 cursor-pointer`}
                            onClick={() => setSelectedRom(rom)}
                        >
                            {/* Image Container */}
                            <div className="relative h-48 bg-gray-900 overflow-hidden">
                                {rom.image ? (
                                    <img
                                        src={rom.image}
                                        alt={rom.name}
                                        loading="lazy"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-white/70 font-bold text-lg uppercase tracking-wider">No Image</span>
                                    </div>
                                )}
                                {/* Favorite Button - Top Right */}
                                {apiConfigured && (
                                    <button
                                        onClick={(e) => handleToggleFavorite(rom, e)}
                                        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
                                            isFavorite(rom)
                                                ? 'bg-yellow-500/90 text-white shadow-lg shadow-yellow-500/50'
                                                : 'bg-black/70 text-white/70 hover:text-white hover:bg-black/80'
                                        }`}
                                        disabled={favoriteTogglingMap[`${rom.system || selectedSystem}-${rom.name}`]}
                                        title={isFavorite(rom) ? 'Remove from favorites' : 'Add to favorites'}
                                    >
                                        <span className="text-xl">{isFavorite(rom) ? '⭐' : '☆'}</span>
                                    </button>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-5 flex flex-col flex-grow">
                                {/* Title */}
                                <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 min-h-[3.5rem] leading-tight" title={rom.name}>
                                    {rom.name}
                                </h3>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {rom.genre && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md">
                                            {rom.genre}
                                        </span>
                                    )}
                                    {rom.region && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-700 text-gray-300 shadow-md border border-gray-600">
                                            {rom.region.toUpperCase()}
                                        </span>
                                    )}
                                    {rom.rating && parseFloat(rom.rating) > 0 && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 shadow-md border border-yellow-500/30">
                                            ⭐ {rom.rating}
                                        </span>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="space-y-2 text-sm text-gray-400 mb-3">
                                    {rom.developer && (
                                        <p className="truncate">
                                            <span className="font-semibold text-gray-300">Dev:</span> {rom.developer}
                                        </p>
                                    )}
                                    {rom.publisher && (
                                        <p className="truncate">
                                            <span className="font-semibold text-gray-300">Pub:</span> {rom.publisher}
                                        </p>
                                    )}
                                    {rom.releasedate && (
                                        <p>
                                            <span className="font-semibold text-gray-300">Released:</span> {formatReleaseDate(rom.releasedate)}
                                        </p>
                                    )}
                                </div>

                                {/* Description */}
                                {rom.desc && (
                                    <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed flex-grow">
                                        {rom.desc.length > 120
                                            ? rom.desc.substring(0, 120) + '...'
                                            : rom.desc}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {selectedRom && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedRom(null)}
                >
                    <div
                        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-gradient-to-br from-gray-800 to-gray-900 border-b border-gray-700 p-6 flex items-start justify-between z-10">
                            <div className="flex-1">
                                <h2 className="text-3xl font-bold text-white mb-2">{selectedRom.name}</h2>
                                <div className="flex flex-wrap gap-2">
                                    {selectedRom.genre && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md">
                                            {selectedRom.genre}
                                        </span>
                                    )}
                                    {selectedRom.region && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-700 text-gray-300 shadow-md border border-gray-600">
                                            {selectedRom.region.toUpperCase()}
                                        </span>
                                    )}
                                    {selectedRom.rating && parseFloat(selectedRom.rating) > 0 && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 shadow-md border border-yellow-500/30">
                                            ⭐ {selectedRom.rating}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                                {/* Favorite Button in Modal */}
                                {apiConfigured && (
                                    <button
                                        onClick={(e) => handleToggleFavorite(selectedRom, e)}
                                        className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
                                            isFavorite(selectedRom)
                                                ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg shadow-yellow-500/50'
                                                : 'bg-gray-700 hover:bg-gray-600 text-white/70 hover:text-white'
                                        }`}
                                        disabled={favoriteTogglingMap[`${selectedRom.system || selectedSystem}-${selectedRom.name}`]}
                                        title={isFavorite(selectedRom) ? 'Remove from favorites' : 'Add to favorites'}
                                    >
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            {isFavorite(selectedRom) ? (
                                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                                            ) : (
                                                <path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/>
                                            )}
                                        </svg>
                                    </button>
                                )}
                                <button
                                    onClick={() => setSelectedRom(null)}
                                    className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                                    aria-label="Close modal"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Image */}
                                <div className="bg-gray-900 rounded-xl overflow-hidden">
                                    {selectedRom.image ? (
                                        <img
                                            src={selectedRom.image}
                                            alt={selectedRom.name}
                                            className="w-full h-auto object-contain"
                                        />
                                    ) : (
                                        <div className="aspect-video flex items-center justify-center">
                                            <span className="text-white/50 text-xl font-bold">No Image Available</span>
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="space-y-4">
                                    {selectedRom.desc && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                                            <p className="text-gray-300 leading-relaxed">{selectedRom.desc}</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        {selectedRom.developer && (
                                            <div>
                                                <span className="text-gray-400 font-semibold">Developer</span>
                                                <p className="text-white">{selectedRom.developer}</p>
                                            </div>
                                        )}
                                        {selectedRom.publisher && (
                                            <div>
                                                <span className="text-gray-400 font-semibold">Publisher</span>
                                                <p className="text-white">{selectedRom.publisher}</p>
                                            </div>
                                        )}
                                        {selectedRom.releasedate && (
                                            <div>
                                                <span className="text-gray-400 font-semibold">Release Date</span>
                                                <p className="text-white">{formatReleaseDate(selectedRom.releasedate)}</p>
                                            </div>
                                        )}
                                        {selectedRom.system && (
                                            <div>
                                                <span className="text-gray-400 font-semibold">System</span>
                                                <p className="text-white capitalize">{selectedRom.system}</p>
                                            </div>
                                        )}
                                    </div>

                                    {selectedRom.path && (
                                        <div className="pt-4 border-t border-gray-700">
                                            <span className="text-gray-400 font-semibold text-sm">ROM Path</span>
                                            <p className="text-gray-500 text-xs mt-1 break-all font-mono">{selectedRom.path}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
                </>
            )}
        </div>
    );
};

export default RomsCardGrid;
