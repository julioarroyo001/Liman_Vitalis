interface MeteomaticsToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface TemperatureData {
  lat: number;
  lng: number;
  temperature: number;
  timestamp: string;
}

class MeteomaticsService {
  private static instance: MeteomaticsService;
  private token: string | null = null;
  private tokenExpiry: number | null = null;

  private readonly username = 'arroyohinostroza_milagroslydia';
  private readonly password = 'ThUN86YY1ph2P166ti02';
  private readonly baseUrl = 'https://api.meteomatics.com';

  static getInstance(): MeteomaticsService {
    if (!MeteomaticsService.instance) {
      MeteomaticsService.instance = new MeteomaticsService();
    }
    return MeteomaticsService.instance;
  }

  private async getToken(): Promise<string> {
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    try {
      const response = await fetch('https://login.meteomatics.com/api/v1/token', {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + btoa(`${this.username}:${this.password}`),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get token: ${response.status}`);
      }

      const data: MeteomaticsToken = await response.json();
      this.token = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);
      return this.token;
    } catch (error) {
      console.error('Error getting Meteomatics token:', error);
      throw error;
    }
  }

  async getTemperatureData(lat: number, lng: number, date?: string): Promise<TemperatureData> {
    const currentDate = date || new Date().toISOString().slice(0, 19) + 'Z';
    try {
      const token = await this.getToken();
      const url = `${this.baseUrl}/${currentDate}/t_2m:C/${lat},${lng}/json?access_token=${token}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to get temperature data: ${response.status}`);
      }

      const data = await response.json();

      return {
        lat,
        lng,
        temperature: data.data[0].coordinates[0].dates[0].value,
        timestamp: data.data[0].coordinates[0].dates[0].date,
      };
    } catch (error) {
      console.error('Error getting temperature data:', error);
      throw error;
    }
  }

  async getTemperatureGrid(
    latMin: number,
    latMax: number,
    lngMin: number,
    lngMax: number,
    date?: string
  ): Promise<TemperatureData[]> {
    const currentDate = date || new Date().toISOString().slice(0, 19) + 'Z';
    const temperatures: TemperatureData[] = [];
    const step = 5.0; // Grid resolution - reduced to avoid rate limiting

    try {
      const token = await this.getToken();

      // Create grid points
      const gridPoints: { lat: number; lng: number }[] = [];
      for (let lat = latMin; lat <= latMax; lat += step) {
        for (let lng = lngMin; lng <= lngMax; lng += step) {
          gridPoints.push({ lat, lng });
        }
      }

      console.log(`Fetching temperature data for ${gridPoints.length} grid points`);

      // Process points sequentially to avoid rate limiting
      const results: TemperatureData[] = [];

      console.log(`Processing ${gridPoints.length} grid points sequentially to avoid rate limiting`);

      for (const point of gridPoints) {
        try {
          const data = await this.getTemperatureData(point.lat, point.lng, currentDate);
          results.push(data);

          // Add delay between requests to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 500)); // 0.5 second delay
        } catch (error) {
          console.warn(`Failed to get temperature for ${point.lat},${point.lng}:`, error);
          // Continue with next point instead of failing completely
        }
      }

      // Add all successful results to temperatures array
      temperatures.push(...results);

      console.log(`Successfully loaded ${temperatures.length} temperature points`);
      return temperatures;
    } catch (error) {
      console.error('Error getting temperature grid:', error);
      throw error;
    }
  }
}

export const meteomaticsService = MeteomaticsService.getInstance();
export type { TemperatureData };
