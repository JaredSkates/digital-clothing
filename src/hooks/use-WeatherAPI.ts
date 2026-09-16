export function useWeatherAPI(coords: { latitude: number; longitude: number }) {
  try {
    const APIkey = process.env.APIkey;
    const url = `https://api.openweathermap.com/weather?lat=${coords.latitude}&lon=${coords.longitude}&appid=${APIkey}`;

    return fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const current = data?.data?.[0];
        const weatherInfo = current?.weather?.[0];

        if (!current || !weatherInfo) {
          throw new Error("Weather data not found");
        }

        const temp = current.temp;
        const description = weatherInfo.description;
        const high = current.temp_max ?? current.temp;
        const low = current.temp_min ?? current.temp;
        const timeOfDay = weatherInfo.icon?.includes("d") ? "day" : "night";
        const id = weatherInfo.id;

        return { temp, description, high, low, timeOfDay, id };
      });
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
}