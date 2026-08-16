from django.core.exceptions import ValidationError
from django.db import models


class Barber(models.Model):
    shop = models.ForeignKey('shop.BarberShop', on_delete=models.CASCADE, related_name='barbers')
    first_name = models.CharField(max_length=80)
    last_name = models.CharField(max_length=80)
    specialty = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['shop', 'last_name', 'first_name']
        constraints = [
            models.UniqueConstraint(fields=['shop', 'first_name', 'last_name'], name='unique_barber_name_per_shop')
        ]
        indexes = [
            models.Index(fields=['shop', 'is_active']),
            models.Index(fields=['specialty']),
        ]

    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'.strip()

    def clean(self):
        super().clean()
        if not self.first_name or not self.first_name.strip():
            raise ValidationError({'first_name': 'First name is required.'})
        if not self.last_name or not self.last_name.strip():
            raise ValidationError({'last_name': 'Last name is required.'})

    def __str__(self):
        return f'{self.full_name} ({self.shop.name})'
