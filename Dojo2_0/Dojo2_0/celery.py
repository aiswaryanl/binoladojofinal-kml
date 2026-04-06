import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Dojo2_0.settings')

app = Celery('Dojo2_0')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# from celery.schedules import crontab

# app.conf.beat_schedule = {
#     'create-recurring-schedules-daily': {
#         'task': 'app1.tasks.create_recurring_schedules',
#         'schedule': crontab(hour=2, minute=0),  # Daily at 2 AM
#     },
# }

from celery.schedules import crontab

app.conf.beat_schedule = {
    'create-recurring-schedules-daily': {
        'task': 'app1.tasks.create_recurring_schedules',
        'schedule': crontab(hour=2, minute=0),  # Daily at 2 AM
    },
}