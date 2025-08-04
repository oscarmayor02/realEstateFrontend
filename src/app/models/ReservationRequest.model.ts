export interface ReservationRequest {
  userId: number;
  propertyId: number;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}
