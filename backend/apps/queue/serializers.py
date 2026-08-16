from datetime import timedelta

from django.utils import timezone
from rest_framework import serializers

from apps.accounts.models import Customer
from apps.barbers.models import Barber
from apps.seats.models import Seat, SeatStatus
from apps.shop.models import BarberShop
from .models import Appointment, AppointmentStatus, QueueEntry, QueueStatus


class QueueEntrySerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    barber_name = serializers.CharField(source='barber.full_name', read_only=True)
    seat_label = serializers.CharField(source='seat.label', read_only=True)

    class Meta:
        model = QueueEntry
        fields = [
            'id',
            'shop',
            'customer',
            'customer_name',
            'barber',
            'barber_name',
            'seat',
            'seat_label',
            'queue_number',
            'status',
            'joined_at',
            'started_at',
            'completed_at',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'customer_name', 'barber_name', 'seat_label', 'created_at', 'updated_at']


class QueueEntryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = QueueEntry
        fields = [
            'shop',
            'customer',
            'barber',
            'seat',
            'queue_number',
            'status',
            'notes',
        ]

    def validate(self, attrs):
        shop = attrs.get('shop')
        barber = attrs.get('barber')
        seat = attrs.get('seat')

        if barber and shop and barber.shop_id != shop.id:
            raise serializers.ValidationError({'barber': 'Assigned barber must belong to the same shop.'})
        if seat and shop and seat.shop_id != shop.id:
            raise serializers.ValidationError({'seat': 'Assigned seat must belong to the same shop.'})
        if attrs.get('queue_number') is not None and attrs['queue_number'] <= 0:
            raise serializers.ValidationError({'queue_number': 'Queue number must be greater than zero.'})
        return attrs


class QueueStatusUpdateSerializer(serializers.ModelSerializer):
    status = serializers.ChoiceField(choices=QueueStatus.choices)

    class Meta:
        model = QueueEntry
        fields = ['id', 'status']
        read_only_fields = ['id']


class AppointmentSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    barber_name = serializers.CharField(source='barber.full_name', read_only=True)
    seat_label = serializers.CharField(source='seat.label', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id',
            'shop',
            'customer',
            'customer_name',
            'barber',
            'barber_name',
            'seat',
            'seat_label',
            'starts_at',
            'ends_at',
            'status',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'customer_name', 'barber_name', 'seat_label', 'created_at', 'updated_at']


class AppointmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = [
            'shop',
            'customer',
            'barber',
            'seat',
            'starts_at',
            'ends_at',
            'status',
            'notes',
        ]

    def validate(self, attrs):
        shop = attrs.get('shop')
        barber = attrs.get('barber')
        seat = attrs.get('seat')
        starts_at = attrs.get('starts_at')
        ends_at = attrs.get('ends_at')

        if starts_at and ends_at and ends_at <= starts_at:
            raise serializers.ValidationError({'ends_at': 'End time must be later than the start time.'})
        if barber and shop and barber.shop_id != shop.id:
            raise serializers.ValidationError({'barber': 'Assigned barber must belong to the same shop.'})
        if seat and shop and seat.shop_id != shop.id:
            raise serializers.ValidationError({'seat': 'Assigned seat must belong to the same shop.'})
        return attrs


class PublicAppointmentCreateSerializer(serializers.Serializer):
    """Public booking payload with only the fields customers may choose."""

    shop = serializers.PrimaryKeyRelatedField(queryset=BarberShop.objects.filter(is_active=True))
    barber = serializers.PrimaryKeyRelatedField(queryset=Barber.objects.filter(is_active=True), required=False, allow_null=True)
    seat = serializers.PrimaryKeyRelatedField(queryset=Seat.objects.filter(is_active=True, status=SeatStatus.AVAILABLE))
    first_name = serializers.CharField(max_length=80)
    last_name = serializers.CharField(max_length=80)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    email = serializers.EmailField(max_length=255, required=False, allow_blank=True)
    starts_at = serializers.DateTimeField()
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        shop = attrs['shop']
        barber = attrs.get('barber')
        seat = attrs['seat']

        if not attrs['first_name'].strip() or not attrs['last_name'].strip():
            raise serializers.ValidationError('First and last name are required.')
        if not (attrs.get('phone') or '').strip() and not (attrs.get('email') or '').strip():
            raise serializers.ValidationError({'phone': 'Provide a phone number or email address.'})
        if attrs['starts_at'] <= timezone.now():
            raise serializers.ValidationError({'starts_at': 'Choose a future appointment time.'})
        if barber and barber.shop_id != shop.id:
            raise serializers.ValidationError({'barber': 'Select a barber from the selected shop.'})
        if seat.shop_id != shop.id:
            raise serializers.ValidationError({'seat': 'Select a seat from the selected shop.'})
        if barber and seat.barber_id and seat.barber_id != barber.id:
            raise serializers.ValidationError({'seat': 'This seat is assigned to a different barber.'})
        return attrs

    def create(self, validated_data):
        customer = Customer.objects.create(
            first_name=validated_data['first_name'].strip(),
            last_name=validated_data['last_name'].strip(),
            phone=(validated_data.get('phone') or '').strip(),
            email=(validated_data.get('email') or '').strip(),
        )
        starts_at = validated_data['starts_at']
        return Appointment.objects.create(
            shop=validated_data['shop'],
            customer=customer,
            barber=validated_data.get('barber'),
            seat=validated_data['seat'],
            starts_at=starts_at,
            ends_at=starts_at + timedelta(hours=1),
            status=AppointmentStatus.SCHEDULED,
            notes=(validated_data.get('notes') or '').strip(),
        )

    def to_representation(self, instance):
        return AppointmentSerializer(instance).data


class AppointmentStatusUpdateSerializer(serializers.ModelSerializer):
    status = serializers.ChoiceField(choices=AppointmentStatus.choices)

    class Meta:
        model = Appointment
        fields = ['id', 'status']
        read_only_fields = ['id']
