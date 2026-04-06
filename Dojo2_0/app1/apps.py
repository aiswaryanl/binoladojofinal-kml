
from django.apps import AppConfig
import sys
import os

class App1Config(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app1'
    
    def ready(self):
        """
        This method is called when Django starts.
        We load signals AND start scheduler.
        """

        # 🔥 ALWAYS load signals first
        import app1.signals

        # ❌ Do NOT start scheduler during migrations or shell
        if any(cmd in sys.argv for cmd in [
            'makemigrations', 'migrate', 'test',
            'shell', 'createsuperuser'
        ]):
            return

        # Import scheduler module
        from . import scheduler
        
        # Start scheduler in main process only
        if os.environ.get('RUN_MAIN') == 'true' or 'runserver' not in sys.argv:
            scheduler.start_scheduler()

    def __str__(self):
        return self.name
