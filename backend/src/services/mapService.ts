import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface LocationPoint {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface MapMarker {
  id: string;
  title: string;
  position: LocationPoint;
  category?: 'market' | 'farmer' | 'pickup';
}

export interface IMapServiceProvider {
  name: string;
  calculateDistance(from: LocationPoint, to: LocationPoint): number; // in kilometers
  formatMarkers(items: any[]): MapMarker[];
}

export class OpenStreetMapProvider implements IMapServiceProvider {
  public name = 'openstreetmap';

  // Haversine formula for distance calculation in KM
  public calculateDistance(from: LocationPoint, to: LocationPoint): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(to.latitude - from.latitude);
    const dLon = this.toRadians(to.longitude - from.longitude);
    const lat1 = this.toRadians(from.latitude);
    const lat2 = this.toRadians(to.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  }

  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  public formatMarkers(items: any[]): MapMarker[] {
    return items.map((item) => ({
      id: item._id ? item._id.toString() : item.id,
      title: item.name || item.farmName || 'Location',
      position: {
        latitude: item.location?.coordinates[1] || 0,
        longitude: item.location?.coordinates[0] || 0,
        address: item.address || item.location?.address || '',
      },
      category: item.farmName ? 'farmer' : 'market',
    }));
  }
}

export class MapService {
  private static providerInstance: IMapServiceProvider;

  public static getProvider(): IMapServiceProvider {
    if (!this.providerInstance) {
      const selected = env.MAP_PROVIDER;
      logger.info(`🗺️ Initializing MapService with provider: ${selected}`);
      this.providerInstance = new OpenStreetMapProvider();
    }
    return this.providerInstance;
  }
}
