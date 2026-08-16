from rest_framework import serializers

from .models import Barber


class BarberSerializer(serializers.ModelSerializer):
    shop_name = serializers.CharField(source='shop.name', read_only=True)

    class Meta:
        model = Barber
        fields = [
            'id',
            'shop',
            'shop_name',
            'first_name',
            'last_name',
            'specialty',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'shop_name', 'created_at', 'updated_at']


class BarberStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Barber
        fields = ['id', 'is_active']
