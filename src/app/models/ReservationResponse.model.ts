export interface ReservationResponse {
  id: number;
  startDate: string;
  endDate: string;
  userId: number;
  clientName: string;
  propertyId: number;
  propertyTitle: string;
  propertyAddress: string;
  status: string; // puede ser 'PENDING', 'CONFIRMED', 'CANCELLED', etc.
}
