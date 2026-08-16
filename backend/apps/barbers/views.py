from rest_framework import generics

from apps.core.permissions import IsStaffOrReadOnly
from .models import Barber
from .serializers import BarberSerializer, BarberStatusSerializer


class BarberListView(generics.ListAPIView):
    queryset = Barber.objects.filter(is_active=True)
    serializer_class = BarberSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        shop_id = self.request.query_params.get('shop')
        queryset = Barber.objects.all() if self.request.user.is_authenticated and self.request.user.is_staff else self.queryset
        if shop_id:
            queryset = queryset.filter(shop_id=shop_id)
        return queryset.order_by('last_name', 'first_name')


class BarberStatusUpdateView(generics.UpdateAPIView):
    queryset = Barber.objects.all()
    serializer_class = BarberStatusSerializer
    permission_classes = [IsStaffOrReadOnly]


class BarberCreateView(generics.CreateAPIView):
    queryset = Barber.objects.all()
    serializer_class = BarberSerializer
    permission_classes = [IsStaffOrReadOnly]


class BarberUpdateView(generics.UpdateAPIView):
    queryset = Barber.objects.all()
    serializer_class = BarberSerializer
    permission_classes = [IsStaffOrReadOnly]
