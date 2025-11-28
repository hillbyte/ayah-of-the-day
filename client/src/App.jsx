import { useState, useEffect, useRef } from 'react';
import './App.css';
import { getRandomAyah } from './api';
import { RefreshCw, Volume2 } from 'lucide-react';

function App() {
    const [ayah, setAyah] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);

    const audioRef = useRef(null);

    async function fetchRandomAyah() {
        setIsLoading(true);
        try {
            const newAyah = await getRandomAyah();
            setAyah(newAyah);

            // if the audio was playing stop it and reset play state for the new ayah
            if (isPlaying && audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                setIsPlaying(false);
            }
        } catch (error) {

            console.error("Error fetching Ayah:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const toggleAudioPlay = () => {
        if (!ayah || isLoading) return;

        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    // set up effects for audio events
    useEffect(() => {
        if (audioRef.current) {
            // reset play state when audio ends
            audioRef.current.onended = () => {
                setIsPlaying(false);
            };

            // set up cleanup function
            return () => {
                if (audioRef.current) {
                    audioRef.current.onended = null;
                }
            };
        }
    }, [ayah]);

    useEffect(() => {
        fetchRandomAyah();
    }, []);

    if (isLoading && !ayah) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
                <p className="text-xl font-semibold text-teal-700">Loading Ayah......</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="card m-auto w-full max-w-2xl rounded-xl bg-white p-8 shadow-2xl transition-all duration-300 shadow-teal-300/50">
                <h1 className="mb-6 text-center text-4xl font-extrabold text-teal-800">
                    Ayah of the Day
                </h1>
                {ayah ? (
                    <>
                        <p
                            className="mb-6 text-right text-3xl leading-relaxed text-gray-900"
                            style={{ fontFamily: 'Amiri, Noto Naskh Arabic, serif' }}
                            dir="rtl"
                        >
                            {ayah.verse.text_uthmani}
                        </p>
                        <div
                            className="mb-8 border-l-4 border-teal-500 pl-4 text-left text-lg italic text-gray-600 translation-text"
                        >
                            <div
                                dangerouslySetInnerHTML={{ __html: ayah.verse.translations[0].text }}
                            />
                            <p className="mb-8 text-center text-sm font-bold tracking-widest text-teal-600">
                                — {ayah.verse.verse_key}
                            </p>
                        </div>
                        <div className="flex items-center justify-between">
                            <button
                                onClick={toggleAudioPlay}
                                disabled={isLoading}
                                className={`flex items-center justify-center rounded-full p-3 transition-colors duration-200 ${isPlaying
                                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/50'
                                    : 'bg-gray-200 text-teal-700 hover:bg-teal-100'
                                    }`}
                                title={isPlaying ? "Pause Recitation" : "Listen to Recitation"}
                            >
                                <Volume2 size={24} className={isPlaying ? "animate-pulse" : ""} />
                            </button>

                            <button
                                onClick={fetchRandomAyah}
                                disabled={isLoading}
                                className="flex items-center space-x-2 rounded-full bg-teal-600 px-5 py-2 text-white shadow-md transition-all duration-300 hover:bg-teal-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50"
                            >
                                <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                                <span>{isLoading ? "Fetching..." : "Refetch Ayah"}</span>
                            </button>
                        </div>
                        {/* hide audio element */}
                        <audio
                            ref={audioRef}
                            src={ayah.verse.audio ? `https://verses.quran.foundation/${ayah.verse.audio.url}` : null}
                            preload="auto"
                            hidden
                        />
                    </>
                ) : (
                    <p className="text-center text-lg text-red-500">Failed to load Ayah. Please try again.</p>
                )}
            </div>
        </div>
    );
}

export default App;
