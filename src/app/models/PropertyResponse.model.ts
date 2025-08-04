import { AvailabilityDTO } from './AvailabilityDTO.model';
import { UserDTO } from './UserDTO.model';

export interface PropertyResponse {
  id: number;
  title: string;
  description: string;
  departamento: string;
  ciudad: string;
  latitude: number;
  longitude: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  address: string;
  yearBuilt?: number;
  operationType: string;
  parkingSpaces?: number;
  estrato?: number;
  petsAllowed?: boolean;
  balcony?: boolean;
  terrace?: boolean;
  pool?: boolean;
  type: string;
  price: number;
  available: boolean;
  availabilityList?: AvailabilityDTO[];
  images: { id: number; url: string }[];
  host: UserDTO; // O el tipo que uses para el host
  createdAt?: Date | string | null;
}
