from django.apps import AppConfig


def ensure_default_staff_account():
    from django.contrib.auth import get_user_model

    user_model = get_user_model()
    username = 'ArkarMin'
    email = 'armin345976@gmail.com'
    password = 'admin123'

    user = user_model.objects.filter(username=username).first()
    if user is None:
        user_model.objects.create_superuser(
            username=username,
            email=email,
            password=password,
        )
        return

    updated = False
    if user.email != email:
        user.email = email
        updated = True
    if not user.is_staff or not user.is_superuser:
        user.is_staff = True
        user.is_superuser = True
        updated = True
    if not user.check_password(password):
        user.set_password(password)
        updated = True
    if updated:
        user.save()


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.accounts'

    def ready(self):
        ensure_default_staff_account()
