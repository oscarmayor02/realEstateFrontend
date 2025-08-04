import { AvailabilityDTO } from './AvailabilityDTO.model';

export interface PropertyRequest {
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
  ownerId: number;
  images: File[]; // para subir imágenes
  availabilityList?: AvailabilityDTO[];

  // Propiedades adicionales que tienes en PropertyRequest Java:
  floors?: number;
  furnished?: boolean;
  garden?: boolean;
  security?: boolean;
  elevator?: boolean;
  airConditioning?: boolean;
  heating?: boolean;
  gym?: boolean;
  parkingIncluded?: boolean;
  internet?: boolean;
  waterSupply?: boolean;
  electricitySupply?: boolean;
}
