import os
from django.core.asgi import get_asgi_application

# 1. Set the settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Dojo2_0.settings')

# 2. Initialize Django ASGI application early to ensure the AppRegistry is populated.
# This MUST happen before importing 'channels' or 'app1.routing'
django_asgi_app = get_asgi_application()

# 3. Now it is safe to import imports that touch models
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import app1.routing 

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            app1.routing.websocket_urlpatterns
        )
    ),
})