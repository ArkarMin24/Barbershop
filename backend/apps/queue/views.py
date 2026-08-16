from rest_framework import generics, permissions

from apps.core.permissions import IsStaffOrReadOnly
from .models import Appointment, QueueEntry
from .serializers import (
    AppointmentCreateSerializer,
    PublicAppointmentCreateSerializer,
    AppointmentSerializer,
    AppointmentStatusUpdateSerializer,
    QueueEntryCreateSerializer,
    QueueEntrySerializer,
    QueueStatusUpdateSerializer,
)


class QueueEntryListView(generics.ListAPIView):
    serializer_class = QueueEntrySerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        queryset = QueueEntry.objects.select_related('shop', 'customer', 'barber', 'seat')
        shop_id = self.request.query_params.get('shop')
        if shop_id:
            queryset = queryset.filter(shop_id=shop_id)
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        return queryset.order_by('queue_number')


class QueueEntryCreateView(generics.CreateAPIView):
    queryset = QueueEntry.objects.all()
    serializer_class = QueueEntryCreateSerializer
    permission_classes = [IsStaffOrReadOnly]


class QueueStatusUpdateView(generics.UpdateAPIView):
    queryset = QueueEntry.objects.all()
    serializer_class = QueueStatusUpdateSerializer
    permission_classes = [IsStaffOrReadOnly]


class QueueEntryDeleteView(generics.DestroyAPIView):
    queryset = QueueEntry.objects.all()
    serializer_class = QueueEntrySerializer
    permission_classes = [IsStaffOrReadOnly]


class AppointmentListView(generics.ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        queryset = Appointment.objects.select_related('shop', 'customer', 'barber', 'seat')
        shop_id = self.request.query_params.get('shop')
        if shop_id:
            queryset = queryset.filter(shop_id=shop_id)
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        return queryset.order_by('starts_at')


class AppointmentCreateView(generics.CreateAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentCreateSerializer
    permission_classes = [IsStaffOrReadOnly]


class PublicAppointmentCreateView(generics.CreateAPIView):
    queryset = Appointment.objects.all()
    serializer_class = PublicAppointmentCreateSerializer
    permission_classes = [permissions.AllowAny]


class AppointmentStatusUpdateView(generics.UpdateAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentStatusUpdateSerializer
    permission_classes = [IsStaffOrReadOnly]


class AppointmentDeleteView(generics.DestroyAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsStaffOrReadOnly]
