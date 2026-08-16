from django.core.exceptions import ValidationError
from django.db import models


class QueueStatus(models.TextChoices):
    WAITING = 'WAITING', 'Waiting'
    SERVING = 'SERVING', 'Serving'
    COMPLETED = 'COMPLETED', 'Completed'
    CANCELLED = 'CANCELLED', 'Cancelled'


class AppointmentStatus(models.TextChoices):
    SCHEDULED = 'SCHEDULED', 'Scheduled'
    CONFIRMED = 'CONFIRMED', 'Confirmed'
    COMPLETED = 'COMPLETED', 'Completed'
    CANCELLED = 'CANCELLED', 'Cancelled'


class QueueEntry(models.Model):
    shop = models.ForeignKey('shop.BarberShop', on_delete=models.CASCADE, related_name='queue_entries')
    customer = models.ForeignKey('accounts.Customer', on_delete=models.CASCADE, related_name='queue_entries')
    barber = models.ForeignKey('barbers.Barber', on_delete=models.SET_NULL, null=True, blank=True, related_name='queue_entries')
    seat = models.ForeignKey('seats.Seat', on_delete=models.SET_NULL, null=True, blank=True, related_name='queue_entries')
    queue_number = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=QueueStatus.choices, default=QueueStatus.WAITING)
    joined_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['shop', 'queue_number']
        constraints = [
            models.UniqueConstraint(fields=['shop', 'queue_number'], name='unique_queue_number_per_shop')
        ]
        indexes = [
            models.Index(fields=['shop', 'status']),
            models.Index(fields=['customer', 'status']),
            models.Index(fields=['barber', 'status']),
        ]

    def clean(self):
        super().clean()
        if self.barber and self.barber.shop_id != self.shop_id:
            raise ValidationError({'barber': 'Assigned barber must belong to the same shop.'})
        if self.seat and self.seat.shop_id != self.shop_id:
            raise ValidationError({'seat': 'Assigned seat must belong to the same shop.'})
        if self.queue_number <= 0:
            raise ValidationError({'queue_number': 'Queue number must be greater than zero.'})

    def __str__(self):
        return f'{self.shop.name} - Queue #{self.queue_number}'


class Appointment(models.Model):
    shop = models.ForeignKey('shop.BarberShop', on_delete=models.CASCADE, related_name='appointments')
    customer = models.ForeignKey('accounts.Customer', on_delete=models.CASCADE, related_name='appointments')
    barber = models.ForeignKey('barbers.Barber', on_delete=models.SET_NULL, null=True, blank=True, related_name='appointments')
    seat = models.ForeignKey('seats.Seat', on_delete=models.SET_NULL, null=True, blank=True, related_name='appointments')
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    status = models.CharField(max_length=20, choices=AppointmentStatus.choices, default=AppointmentStatus.SCHEDULED)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['starts_at']
        indexes = [
            models.Index(fields=['shop', 'starts_at']),
            models.Index(fields=['barber', 'starts_at']),
            models.Index(fields=['seat', 'starts_at']),
            models.Index(fields=['status', 'starts_at']),
        ]

    def clean(self):
        super().clean()
        if self.starts_at and self.ends_at and self.ends_at <= self.starts_at:
            raise ValidationError({'ends_at': 'End time must be later than the start time.'})
        if self.barber and self.barber.shop_id != self.shop_id:
            raise ValidationError({'barber': 'Assigned barber must belong to the same shop.'})
        if self.seat and self.seat.shop_id != self.shop_id:
            raise ValidationError({'seat': 'Assigned seat must belong to the same shop.'})

    def __str__(self):
        return f'{self.customer.full_name} - {self.starts_at:%Y-%m-%d %H:%M}'
