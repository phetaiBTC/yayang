import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Book } from '../entities';
import { ReservationsService } from '../reservation/reservations.service';
import { CreateReservationLineDto } from '../reservation/dto/reservation.dto';
import { SalesService } from '../selling/sales.service';
import { CreateSaleLineDto } from '../selling/dto/create-sale.dto';

@Injectable()
export class CustomerService {
  constructor(
    private readonly em: EntityManager,
    private readonly reservations: ReservationsService,
    private readonly sales: SalesService,
  ) {}

  /** Read-only book catalog for the storefront. */
  catalog() {
    return this.em.find(Book, {}, { populate: ['category', 'bookType'], orderBy: { title: 'ASC' } });
  }

  /** Place a self-service reservation for the logged-in customer (deposit required). */
  reserve(cusId: number, lines: CreateReservationLineDto[], deposit: number) {
    return this.reservations.create(null, { cusId, lines }, deposit);
  }

  /** The logged-in customer's own reservations. */
  myReservations(cusId: number) {
    return this.reservations.findAllForCustomer(cusId);
  }

  /** Self-checkout: decrements stock atomically (no staff). */
  buy(cusId: number, paymentMethod: 'cash' | 'transfer' | 'qr', lines: CreateSaleLineDto[]) {
    return this.sales.create(null, { cusId, paymentMethod, lines });
  }

  /** The logged-in customer's own purchase history. */
  myPurchases(cusId: number) {
    return this.sales.findAllForCustomer(cusId);
  }

  /** A single purchase (with line items) for the receipt — scoped to the owner. */
  receipt(cusId: number, saleId: number) {
    return this.sales.findOneForCustomer(cusId, saleId);
  }
}
