from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rest_framework import generics

from apps.core.permissions import IsStaffOrReadOnly
from .models import Seat
from .serializers import SeatCreateSerializer, SeatSerializer, SeatStatusUpdateSerializer


class SeatListView(generics.ListAPIView):
    serializer_class = SeatSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        queryset = Seat.objects.filter(is_active=True).select_related('shop', 'barber')
        shop_id = self.request.query_params.get('shop')
        if shop_id:
            queryset = queryset.filter(shop_id=shop_id)
        return queryset.order_by('shop__name', 'label')


class SeatDetailView(generics.RetrieveAPIView):
    queryset = Seat.objects.filter(is_active=True).select_related('shop', 'barber')
    serializer_class = SeatSerializer
    permission_classes = [IsStaffOrReadOnly]


class AvailableSeatsView(generics.ListAPIView):
    serializer_class = SeatSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        queryset = Seat.objects.filter(is_active=True, status='AVAILABLE').select_related('shop', 'barber')
        shop_id = self.request.query_params.get('shop')
        if shop_id:
            queryset = queryset.filter(shop_id=shop_id)
        return queryset.order_by('shop__name', 'label')


class SeatCreateView(generics.CreateAPIView):
    queryset = Seat.objects.all()
    serializer_class = SeatCreateSerializer
    permission_classes = [IsStaffOrReadOnly]


class SeatStatusUpdateView(generics.UpdateAPIView):
    queryset = Seat.objects.filter(is_active=True)
    serializer_class = SeatStatusUpdateSerializer
    permission_classes = [IsStaffOrReadOnly]

    def perform_update(self, serializer):
        seat = serializer.save()
        channel_layer = get_channel_layer()
        if channel_layer is not None:
            payload = SeatSerializer(seat).data
            async_to_sync(channel_layer.group_send)(
                'seat_updates',
                {'type': 'seat_update', 'payload': payload},
            )
