import { useEffect, useState } from "react";

interface Coords {
    latitude: number;
    longitude: number;
}

interface WeatherData {
    temperature: number;
    windSpeed: number;
    weatherCode: number;
}

export function useUserWeather() {
    const [coords, setCoords] = useState<Coords | null>(null);
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Step 1: get location
    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
        );
    }, []);

    // Step 2: fetch weather once we have coords
    useEffect(() => {
        if (!coords) return;

        const fetchWeather = async () => {
            try {
                const res = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current_weather=true&temperature_unit=fahrenheit`
                );
                const data = await res.json();
                setWeather({
                    temperature: data.current_weather.temperature,
                    windSpeed: data.current_weather.windspeed,
                    weatherCode: data.current_weather.weathercode,
                });
            } catch (err) {
                setError("Failed to fetch weather");
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, [coords]);

    return { weather, error, loading };
}