import json

from channels.generic.websocket import AsyncJsonWebsocketConsumer


class SeatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.channel_layer.group_add('seat_updates', self.channel_name)
        await self.send_json({
            'type': 'connection',
            'status': 'connected',
            'message': 'WebSocket connected',
        })

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard('seat_updates', self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        if not text_data:
            return

        try:
            payload = json.loads(text_data)
        except json.JSONDecodeError:
            payload = {}

        if payload.get('type') == 'ping':
            await self.send_json({'type': 'pong'})

    async def seat_update(self, event):
        await self.send_json({
            'type': 'seat_update',
            'payload': event['payload'],
        })

    async def connection_error(self, event):
        await self.send_json({
            'type': 'error',
            'message': event.get('message', 'WebSocket error'),
        })
