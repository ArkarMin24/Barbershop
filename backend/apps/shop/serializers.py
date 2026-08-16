from rest_framework import serializers

from .models import BarberShop


class BarberShopSerializer(serializers.ModelSerializer):
    class Meta:
        model = BarberShop
        fields = [
            'id',
            'name',
            'slug',
            'address',
            'phone',
            'email',
            'description',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
