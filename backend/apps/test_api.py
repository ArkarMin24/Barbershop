from datetime import timedelta

from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async
from channels.testing import WebsocketCommunicator
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient, APITestCase

from config.asgi import application

from apps.accounts.models import Customer
from apps.barbers.models import Barber
from apps.queue.models import Appointment, AppointmentStatus, QueueEntry, QueueStatus
from apps.seats.models import Seat, SeatStatus
from apps.shop.models import BarberShop


class BarberShopAPITests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_model = get_user_model()

        self.shop = BarberShop.objects.create(
            name='The Sharp Edge',
            slug='the-sharp-edge',
            address='123 Main Street',
            phone='555-0101',
            email='hello@sharpedge.com',
            description='Modern barber studio',
        )
        self.barber = Barber.objects.create(
            shop=self.shop,
            first_name='Alex',
            last_name='Stone',
            specialty='Classic Cut',
            is_active=True,
        )
        self.seat = Seat.objects.create(
            shop=self.shop,
            barber=self.barber,
            label='Seat 1',
            status=SeatStatus.AVAILABLE,
            is_active=True,
        )
        self.customer = Customer.objects.create(
            first_name='Sam',
            last_name='Lee',
            phone='555-0111',
            email='sam@example.com',
        )
        self.queue_entry = QueueEntry.objects.create(
            shop=self.shop,
            customer=self.customer,
            barber=self.barber,
            seat=self.seat,
            queue_number=1,
            status=QueueStatus.WAITING,
        )
        self.appointment = Appointment.objects.create(
            shop=self.shop,
            customer=self.customer,
            barber=self.barber,
            seat=self.seat,
            starts_at=timezone.now() + timedelta(days=1),
            ends_at=timezone.now() + timedelta(days=1, hours=1),
            status=AppointmentStatus.CONFIRMED,
        )
        self.staff_user = self.user_model.objects.create_user(
            username='staff',
            email='staff@example.com',
            password='StrongPass123',
            is_staff=True,
        )

    def test_public_list_and_detail_endpoints(self):
        resp = self.client.get(reverse('shop-list'))
        self.assertEqual(resp.status_code, 200)

        resp = self.client.get(reverse('seat-list'))
        self.assertEqual(resp.status_code, 200)
        self.assertGreaterEqual(len(resp.data), 1)

        resp = self.client.get(reverse('seat-detail', args=[self.seat.pk]))
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['label'], 'Seat 1')

        resp = self.client.get(reverse('seat-available-list'))
        self.assertEqual(resp.status_code, 200)

        resp = self.client.get(reverse('barber-list'))
        self.assertEqual(resp.status_code, 200)
        self.assertGreaterEqual(len(resp.data), 1)

        resp = self.client.get(reverse('queue-list'))
        self.assertEqual(resp.status_code, 200)
        self.assertGreaterEqual(len(resp.data), 1)

        resp = self.client.get(reverse('appointment-list'))
        self.assertEqual(resp.status_code, 200)
        self.assertGreaterEqual(len(resp.data), 1)

    def test_public_customer_creation(self):
        payload = {
            'first_name': 'Jamie',
            'last_name': 'Brown',
            'phone': '555-0999',
            'email': 'jamie@example.com',
        }
        resp = self.client.post(reverse('customer-create'), payload, format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(Customer.objects.filter(email='jamie@example.com').count(), 1)

    def test_public_appointment_booking(self):
        starts_at = timezone.now() + timedelta(days=3)
        payload = {
            'shop': self.shop.pk,
            'barber': self.barber.pk,
            'seat': self.seat.pk,
            'first_name': 'Jamie',
            'last_name': 'Brown',
            'phone': '555-0999',
            'starts_at': starts_at.isoformat(),
            'notes': 'First visit',
        }

        response = self.client.post(reverse('appointment-public-create'), payload, format='json')

        self.assertEqual(response.status_code, 201)
        appointment = Appointment.objects.get(pk=response.data['id'])
        self.assertEqual(appointment.customer.full_name, 'Jamie Brown')
        self.assertEqual(appointment.status, AppointmentStatus.SCHEDULED)

    def test_staff_required_for_mutations(self):
        non_staff = self.user_model.objects.create_user(
            username='nonstaff',
            email='nonstaff@example.com',
            password='StrongPass123',
            is_staff=False,
        )
        self.client.force_authenticate(user=non_staff)

        payload = {'status': 'OCCUPIED'}
        resp = self.client.patch(reverse('seat-status-update', args=[self.seat.pk]), payload, format='json')
        self.assertEqual(resp.status_code, 403)

        resp = self.client.patch(reverse('queue-status-update', args=[self.queue_entry.pk]), {'status': 'SERVING'}, format='json')
        self.assertEqual(resp.status_code, 403)

        resp = self.client.patch(reverse('appointment-status-update', args=[self.appointment.pk]), {'status': 'COMPLETED'}, format='json')
        self.assertEqual(resp.status_code, 403)

        self.client.force_authenticate(user=self.staff_user)

    def test_staff_can_log_in_with_email(self):
        response = self.client.post(
            reverse('staff-login'),
            {'email': self.staff_user.email, 'password': 'StrongPass123'},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['email'], self.staff_user.email)
        self.assertTrue(response.data['is_staff'])

        logout_response = self.client.post(reverse('staff-logout'))
        self.assertEqual(logout_response.status_code, 204)

    def test_staff_can_create_queue_and_appointment(self):
        self.client.force_authenticate(user=self.staff_user)

        queue_payload = {
            'shop': self.shop.pk,
            'customer': self.customer.pk,
            'barber': self.barber.pk,
            'seat': self.seat.pk,
            'queue_number': 2,
            'status': QueueStatus.WAITING,
            'notes': 'Walk-in customer',
        }
        queue_resp = self.client.post(reverse('queue-create'), queue_payload, format='json')
        self.assertEqual(queue_resp.status_code, 201)

        appointment_payload = {
            'shop': self.shop.pk,
            'customer': self.customer.pk,
            'barber': self.barber.pk,
            'seat': self.seat.pk,
            'starts_at': (timezone.now() + timedelta(days=2)).isoformat(),
            'ends_at': (timezone.now() + timedelta(days=2, hours=1)).isoformat(),
            'status': AppointmentStatus.SCHEDULED,
            'notes': 'New appointment',
        }
        appt_resp = self.client.post(reverse('appointment-create'), appointment_payload, format='json')
        self.assertEqual(appt_resp.status_code, 201)

    def test_seat_update_broadcasts_live_status_change(self):
        self.client.force_authenticate(user=self.staff_user)

        async def run_test():
            communicator = WebsocketCommunicator(application, '/ws/seats/')
            connected, _ = await communicator.connect()
            self.assertTrue(connected)
            await communicator.receive_json_from()

            resp = await database_sync_to_async(self.client.patch)(
                reverse('seat-status-update', args=[self.seat.pk]),
                {'status': 'OCCUPIED'},
                format='json',
            )
            self.assertEqual(resp.status_code, 200)

            message = await communicator.receive_json_from()
            self.assertEqual(message['type'], 'seat_update')
            self.assertEqual(message['payload']['status'], SeatStatus.OCCUPIED)

            await communicator.disconnect()

        async_to_sync(run_test)()

    def test_staff_can_update_status_and_delete_records(self):
        self.client.force_authenticate(user=self.staff_user)

        seat_resp = self.client.patch(reverse('seat-status-update', args=[self.seat.pk]), {'status': 'RESERVED'}, format='json')
        self.assertEqual(seat_resp.status_code, 200)
        self.seat.refresh_from_db()
        self.assertEqual(self.seat.status, SeatStatus.RESERVED)

        queue_resp = self.client.patch(reverse('queue-status-update', args=[self.queue_entry.pk]), {'status': 'SERVING'}, format='json')
        self.assertEqual(queue_resp.status_code, 200)
        self.queue_entry.refresh_from_db()
        self.assertEqual(self.queue_entry.status, QueueStatus.SERVING)

        appt_resp = self.client.patch(reverse('appointment-status-update', args=[self.appointment.pk]), {'status': 'COMPLETED'}, format='json')
        self.assertEqual(appt_resp.status_code, 200)
        self.appointment.refresh_from_db()
        self.assertEqual(self.appointment.status, AppointmentStatus.COMPLETED)

        barber_resp = self.client.patch(reverse('barber-status-update', args=[self.barber.pk]), {'is_active': False}, format='json')
        self.assertEqual(barber_resp.status_code, 200)
        self.barber.refresh_from_db()
        self.assertFalse(self.barber.is_active)

        delete_resp = self.client.delete(reverse('queue-delete', args=[self.queue_entry.pk]))
        self.assertEqual(delete_resp.status_code, 204)

        appt_delete = self.client.delete(reverse('appointment-delete', args=[self.appointment.pk]))
        self.assertEqual(appt_delete.status_code, 204)

    def test_staff_can_create_seat(self):
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.post(
            reverse('seat-create'),
            {'shop': self.shop.pk, 'barber': self.barber.pk, 'label': 'Seat 2', 'status': SeatStatus.AVAILABLE},
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(Seat.objects.filter(label='Seat 2', shop=self.shop).exists())

    def test_staff_can_create_and_edit_barber(self):
        self.client.force_authenticate(user=self.staff_user)
        create_response = self.client.post(
            reverse('barber-create'),
            {'shop': self.shop.pk, 'first_name': 'Moe', 'last_name': 'Aung', 'specialty': 'Fade', 'is_active': True},
            format='json',
        )
        self.assertEqual(create_response.status_code, 201)

        update_response = self.client.patch(
            reverse('barber-update', args=[create_response.data['id']]),
            {'first_name': 'Moe', 'last_name': 'Win', 'specialty': 'Classic cut'},
            format='json',
        )
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.data['last_name'], 'Win')
