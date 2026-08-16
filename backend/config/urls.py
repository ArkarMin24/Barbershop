from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path

from apps.accounts.views import CsrfTokenView, CustomerCreateView, CustomerDetailView, CustomerListView, StaffLoginView, StaffLogoutView, StaffSessionView
from apps.barbers.views import BarberCreateView, BarberListView, BarberStatusUpdateView, BarberUpdateView
from apps.queue.views import (
    AppointmentCreateView,
    AppointmentDeleteView,
    AppointmentListView,
    PublicAppointmentCreateView,
    AppointmentStatusUpdateView,
    QueueEntryCreateView,
    QueueEntryDeleteView,
    QueueEntryListView,
    QueueStatusUpdateView,
)
from apps.seats.views import AvailableSeatsView, SeatCreateView, SeatDetailView, SeatListView, SeatStatusUpdateView
from apps.shop.views import BarberShopViewSet


def api_root(request):
    return JsonResponse({
        'message': 'Barber Seat API',
        'endpoints': {
            'shop': '/api/shop/',
            'seats': '/api/seats/',
            'available_seats': '/api/seats/available/',
            'barbers': '/api/barbers/',
            'customers': '/api/customers/list/',
            'queue': '/api/queue/',
            'appointments': '/api/appointments/',
        },
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include([
        path('', api_root, name='api-root'),
        path('auth/csrf/', CsrfTokenView.as_view(), name='csrf-token'),
        path('auth/login/', StaffLoginView.as_view(), name='staff-login'),
        path('auth/logout/', StaffLogoutView.as_view(), name='staff-logout'),
        path('auth/session/', StaffSessionView.as_view(), name='staff-session'),
        path('shop/', BarberShopViewSet.as_view(), name='shop-list'),
        path('seats/', SeatListView.as_view(), name='seat-list'),
        path('seats/create/', SeatCreateView.as_view(), name='seat-create'),
        path('seats/available/', AvailableSeatsView.as_view(), name='seat-available-list'),
        path('seats/<int:pk>/', SeatDetailView.as_view(), name='seat-detail'),
        path('seats/<int:pk>/status/', SeatStatusUpdateView.as_view(), name='seat-status-update'),
        path('barbers/', BarberListView.as_view(), name='barber-list'),
        path('barbers/create/', BarberCreateView.as_view(), name='barber-create'),
        path('barbers/<int:pk>/', BarberUpdateView.as_view(), name='barber-update'),
        # Accept variants without a trailing slash for clients that omit it (helps PATCH requests)
        path('barbers/<int:pk>', BarberUpdateView.as_view(), name='barber-update-no-slash'),
        path('barbers/<int:pk>/status/', BarberStatusUpdateView.as_view(), name='barber-status-update'),
        path('barbers/<int:pk>/status', BarberStatusUpdateView.as_view(), name='barber-status-update-no-slash'),
        path('customers/', CustomerCreateView.as_view(), name='customer-create'),
        path('customers/list/', CustomerListView.as_view(), name='customer-list'),
        path('customers/<int:pk>/', CustomerDetailView.as_view(), name='customer-detail'),
        path('queue/', QueueEntryListView.as_view(), name='queue-list'),
        path('queue/create/', QueueEntryCreateView.as_view(), name='queue-create'),
        path('queue/<int:pk>/status/', QueueStatusUpdateView.as_view(), name='queue-status-update'),
        path('queue/<int:pk>/delete/', QueueEntryDeleteView.as_view(), name='queue-delete'),
        path('appointments/', AppointmentListView.as_view(), name='appointment-list'),
        path('appointments/book/', PublicAppointmentCreateView.as_view(), name='appointment-public-create'),
        path('appointments/create/', AppointmentCreateView.as_view(), name='appointment-create'),
        path('appointments/<int:pk>/status/', AppointmentStatusUpdateView.as_view(), name='appointment-status-update'),
        path('appointments/<int:pk>/delete/', AppointmentDeleteView.as_view(), name='appointment-delete'),
    ])),
]
