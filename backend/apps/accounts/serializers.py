from rest_framework import serializers

from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            'id',
            'first_name',
            'last_name',
            'phone',
            'email',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CustomerCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            'first_name',
            'last_name',
            'phone',
            'email',
            'notes',
        ]

    def validate(self, attrs):
        phone = (attrs.get('phone') or '').strip()
        email = (attrs.get('email') or '').strip()
        if not phone and not email:
            raise serializers.ValidationError({
                'phone': 'Provide at least one contact method (phone or email).'
            })
        return attrs
