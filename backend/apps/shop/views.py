from rest_framework import generics

from apps.core.permissions import IsStaffOrReadOnly
from .models import BarberShop
from .serializers import BarberShopSerializer


class BarberShopViewSet(generics.ListAPIView):
    queryset = BarberShop.objects.filter(is_active=True)
    serializer_class = BarberShopSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        return self.queryset.order_by('name')
