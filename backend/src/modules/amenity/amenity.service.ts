import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { AmenityEntity, BookingEntity, BlockedDateEntity, BookingStatus } from './entities/amenity.entities';
import { AuditService } from '../../common/audit/audit.service';

@Injectable()
export class AmenityService {
  constructor(
    @InjectRepository(AmenityEntity) private amenityRepo: Repository<AmenityEntity>,
    @InjectRepository(BookingEntity) private bookingRepo: Repository<BookingEntity>,
    @InjectRepository(BlockedDateEntity) private blockedRepo: Repository<BlockedDateEntity>,
    private dataSource: DataSource,
    private auditService: AuditService,
  ) {}

  async getAmenities(): Promise<AmenityEntity[]> {
    return this.amenityRepo.find({ where: { isActive: true } });
  }

  async getAvailability(amenityId: string): Promise<Record<string, string>> {
    const amenity = await this.amenityRepo.findOne({ where: { id: amenityId } });
    if (!amenity) throw new NotFoundException('Amenity not found');

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dates: Date[] = Array.from({ length: amenity.maxAdvanceDays + 1 }, (_, i) => {
      const d = new Date(today); d.setDate(d.getDate() + i); return d;
    });

    const dateStrings = dates.map(d => d.toISOString().split('T')[0]);
    const bookings = await this.bookingRepo.find({ where: { amenityId, status: In([BookingStatus.Pending, BookingStatus.Confirmed]) } });
    const blocked = await this.blockedRepo.find({ where: { amenityId } });

    const bookedDates = new Set(bookings.map(b => new Date(b.bookingDate).toISOString().split('T')[0]));
    const blockedDates = new Set(blocked.map(b => new Date(b.blockedDate).toISOString().split('T')[0]));

    const availability: Record<string, string> = {};
    for (const d of dateStrings) {
      if (blockedDates.has(d)) availability[d] = 'BLOCKED';
      else if (bookedDates.has(d)) availability[d] = 'BOOKED';
      else availability[d] = 'AVAILABLE';
    }
    return availability;
  }

  async createBooking(userId: string, residentProfileId: string, amenityId: string, bookingDate: string): Promise<BookingEntity> {
    const amenity = await this.amenityRepo.findOne({ where: { id: amenityId } });
    if (!amenity) throw new NotFoundException('Amenity not found');

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const date = new Date(bookingDate);
    const maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + amenity.maxAdvanceDays);
    if (date < today || date > maxDate) throw new BadRequestException(`Booking date must be within ${amenity.maxAdvanceDays} days from today`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const blocked = await queryRunner.manager.findOne(BlockedDateEntity, { where: { amenityId, blockedDate: date as any } });
      if (blocked) throw new BadRequestException('This date is not available for booking');

      const existing = await queryRunner.manager.findOne(BookingEntity, { where: { amenityId, bookingDate: date as any, status: In([BookingStatus.Pending, BookingStatus.Confirmed]) } });
      if (existing) throw new ConflictException('This date is already booked');

      const residentExisting = await queryRunner.manager.findOne(BookingEntity, { where: { userId, amenityId, status: In([BookingStatus.Pending, BookingStatus.Confirmed]) } });
      if (residentExisting) throw new ConflictException('You already have an active booking for this amenity');

      const seq = await queryRunner.query(`SELECT nextval('booking_number_seq') as seq`);
      const bookingNumber = `BKG-${new Date().getFullYear()}-${String(seq[0].seq).padStart(3, '0')}`;

      const booking = await queryRunner.manager.save(BookingEntity, queryRunner.manager.create(BookingEntity, {
        bookingNumber, amenityId, userId, residentProfileId,
        bookingDate: date as any, status: BookingStatus.Pending,
        bookingFeeAmount: amenity.bookingFee, depositAmount: amenity.depositAmount,
      }));
      await queryRunner.commitTransaction();
      await this.auditService.log({ userId, action: 'BOOKING_CREATED', entityType: 'Booking', entityId: booking.id });
      return booking;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async approveBooking(bookingId: string, pmUserId: string): Promise<BookingEntity> {
    const booking = await this.bookingRepo.findOne({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== BookingStatus.Pending) throw new BadRequestException('Only Pending bookings can be approved');

    booking.status = BookingStatus.Confirmed;
    await this.bookingRepo.save(booking);
    await this.auditService.log({ userId: pmUserId, action: 'BOOKING_CONFIRMED', entityType: 'Booking', entityId: bookingId });
    return booking;
  }

  async rejectBooking(bookingId: string, pmUserId: string, reason: string): Promise<BookingEntity> {
    if (!reason?.trim()) throw new BadRequestException('Rejection reason is required');
    const booking = await this.bookingRepo.findOne({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== BookingStatus.Pending) throw new BadRequestException('Only Pending bookings can be rejected');

    booking.status = BookingStatus.Rejected;
    booking.pmNotes = reason;
    await this.bookingRepo.save(booking);
    await this.auditService.log({ userId: pmUserId, action: 'BOOKING_REJECTED', entityType: 'Booking', entityId: bookingId });
    return booking;
  }

  async cancelBooking(bookingId: string, userId: string, role: string): Promise<BookingEntity> {
    const booking = await this.bookingRepo.findOne({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (role === 'Resident' && booking.userId !== userId) throw new ForbiddenException();
    if (![BookingStatus.Pending, BookingStatus.Confirmed].includes(booking.status)) throw new BadRequestException('Booking cannot be cancelled');

    booking.status = BookingStatus.Cancelled;
    await this.bookingRepo.save(booking);
    await this.auditService.log({ userId, action: 'BOOKING_CANCELLED', entityType: 'Booking', entityId: bookingId });
    return booking;
  }

  async blockDates(amenityId: string, dates: string[], reason: string, pmUserId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const dateStr of dates) {
        const date = new Date(dateStr);
        const exists = await queryRunner.manager.findOne(BlockedDateEntity, { where: { amenityId, blockedDate: date as any } });
        if (!exists) await queryRunner.manager.save(BlockedDateEntity, queryRunner.manager.create(BlockedDateEntity, { amenityId, blockedDate: date as any, reason, blockedByUserId: pmUserId }));

        await queryRunner.manager.update(BookingEntity, { amenityId, bookingDate: date as any, status: BookingStatus.Confirmed }, { status: BookingStatus.Cancelled });
        await queryRunner.manager.update(BookingEntity, { amenityId, bookingDate: date as any, status: BookingStatus.Pending }, { status: BookingStatus.Rejected, pmNotes: 'Date blocked by management' });
      }
      await queryRunner.commitTransaction();
      await this.auditService.log({ userId: pmUserId, action: 'DATES_BLOCKED', entityType: 'Amenity', entityId: amenityId, metadata: { dates, reason } });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getMyBookings(userId: string): Promise<BookingEntity[]> {
    return this.bookingRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async getPendingBookings(): Promise<BookingEntity[]> {
    return this.bookingRepo.find({ where: { status: BookingStatus.Pending }, order: { createdAt: 'ASC' } });
  }
}
