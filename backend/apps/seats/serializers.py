from rest_framework import serializers

from apps.barbers.models import Barber
from .models import Seat, SeatStatus


class SeatSerializer(serializers.ModelSerializer):
    shop_name = serializers.CharField(source='shop.name', read_only=True)
    barber_name = serializers.SerializerMethodField()

    class Meta:
        model = Seat
        fields = [
            'id',
            'shop',
            'shop_name',
            'barber',
            'barber_name',
            'label',
            'status',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'shop_name', 'barber_name', 'created_at', 'updated_at']

    def get_barber_name(self, obj):
        if obj.barber:
            return obj.barber.full_name
        return None


class SeatStatusUpdateSerializer(serializers.ModelSerializer):
    status = serializers.ChoiceField(choices=SeatStatus.choices)
    barber = serializers.PrimaryKeyRelatedField(queryset=Barber.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Seat
        fields = ['id', 'status', 'barber']
        read_only_fields = ['id']


class SeatCreateSerializer(serializers.ModelSerializer):
    barber = serializers.PrimaryKeyRelatedField(queryset=Barber.objects.filter(is_active=True), required=False, allow_null=True)
    status = serializers.ChoiceField(choices=SeatStatus.choices, default=SeatStatus.AVAILABLE)

    class Meta:
        model = Seat
        fields = ['id', 'shop', 'barber', 'label', 'status']
        read_only_fields = ['id']

    def validate(self, attrs):
        barber = attrs.get('barber')
        shop = attrs['shop']
        if barber and barber.shop_id != shop.id:
            raise serializers.ValidationError({'barber': 'Assigned barber must belong to the selected shop.'})
        return attrs

    def to_representation(self, instance):
        return SeatSerializer(instance).data
