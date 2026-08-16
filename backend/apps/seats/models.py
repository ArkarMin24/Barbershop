from django.core.exceptions import ValidationError
from django.db import models


class SeatStatus(models.TextChoices):
    AVAILABLE = 'AVAILABLE', 'Available'
    OCCUPIED = 'OCCUPIED', 'Occupied'
    RESERVED = 'RESERVED', 'Reserved'


class Seat(models.Model):
    shop = models.ForeignKey('shop.BarberShop', on_delete=models.CASCADE, related_name='seats')
    barber = models.ForeignKey('barbers.Barber', on_delete=models.SET_NULL, null=True, blank=True, related_name='seats')
    label = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=SeatStatus.choices, default=SeatStatus.AVAILABLE)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['shop', 'label']
        constraints = [
            models.UniqueConstraint(fields=['shop', 'label'], name='unique_seat_label_per_shop')
        ]
        indexes = [
            models.Index(fields=['shop', 'status']),
            models.Index(fields=['barber', 'status']),
        ]

    def clean(self):
        super().clean()
        if self.barber and self.barber.shop_id != self.shop_id:
            raise ValidationError({'barber': 'Assigned barber must belong to the same shop.'})
        if not self.label or not self.label.strip():
            raise ValidationError({'label': 'Seat label is required.'})

    def __str__(self):
        return f'{self.shop.name} - {self.label}'
