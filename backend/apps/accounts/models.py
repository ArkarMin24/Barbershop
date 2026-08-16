from django.core.exceptions import ValidationError
from django.db import models


class Customer(models.Model):
    first_name = models.CharField(max_length=80)
    last_name = models.CharField(max_length=80)
    phone = models.CharField(max_length=20, blank=True, default='')
    email = models.EmailField(max_length=255, blank=True, default='')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['last_name', 'first_name']
        indexes = [
            models.Index(fields=['phone']),
            models.Index(fields=['email']),
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
        if not self.phone.strip() and not self.email.strip():
            raise ValidationError({'phone': 'Provide at least one contact method (phone or email).'})

    def __str__(self):
        return self.full_name or 'Customer'
