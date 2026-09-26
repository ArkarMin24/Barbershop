from django.contrib.auth import authenticate, get_user_model, login, logout
from django.middleware.csrf import get_token
from rest_framework import generics
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import IsStaffOrReadOnly
from .models import Customer
from .serializers import CustomerCreateSerializer, CustomerSerializer


class StaffLoginView(APIView):
    """Create a session for a staff member using their username or email."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        identifier = (request.data.get('email') or request.data.get('username') or '').strip()
        password = request.data.get('password') or ''

        if not identifier or not password:
            return Response(
                {'detail': 'Email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        username = identifier
        user_model = get_user_model()
        if '@' in identifier:
            user = user_model.objects.filter(email__iexact=identifier).first()
            if user is not None:
                username = user.get_username()

        user = authenticate(request, username=username, password=password)
        if user is None or not user.is_staff:
            return Response(
                {'detail': 'Invalid staff credentials.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        login(request, user)
        return Response({
            'id': user.pk,
            'username': user.get_username(),
            'email': user.email,
            'is_staff': user.is_staff,
        })


class CsrfTokenView(APIView):
    """Set and return the CSRF token required for authenticated API writes."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({'csrfToken': get_token(request)})


class StaffSessionView(APIView):
    """Return the current staff session, if one is active."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        user = request.user
        if not user.is_authenticated or not user.is_staff:
            return Response({'detail': 'Staff sign-in required.'}, status=status.HTTP_401_UNAUTHORIZED)

        return Response({
            'id': user.pk,
            'username': user.get_username(),
            'email': user.email,
            'is_staff': True,
        })


class StaffLogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class CustomerCreateView(generics.CreateAPIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerCreateSerializer
    permission_classes = []


class CustomerListView(generics.ListAPIView):
    queryset = Customer.objects.all().order_by('last_name', 'first_name')
    serializer_class = CustomerSerializer
    permission_classes = [IsStaffOrReadOnly]


class CustomerDeleteAllView(APIView):
    permission_classes = [IsStaffOrReadOnly]

    def delete(self, request):
        deleted_count, _ = Customer.objects.all().delete()
        return Response({'deleted': deleted_count})


class CustomerDetailView(generics.RetrieveDestroyAPIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsStaffOrReadOnly]
