# app1/scheduler.py

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from django.core.management import call_command
from django.conf import settings
import logging
import atexit

logger = logging.getLogger(__name__)

# Global scheduler instance
scheduler = None

def create_recurring_schedules_job():
    """
    Job to create recurring schedules
    This function is called by APScheduler
    """
    try:
        logger.info("=" * 60)
        logger.info("🔄 Running create_recurring_schedules job...")
        logger.info("=" * 60)
        
        call_command('create_recurring_schedules')
        
        logger.info("=" * 60)
        logger.info("✅ Recurring schedules job completed successfully")
        logger.info("=" * 60)
    except Exception as e:
        logger.error("=" * 60)
        logger.error(f"❌ Error in scheduler job: {str(e)}")
        logger.error("=" * 60)

def start_scheduler():
    """
    Start the APScheduler
    Called automatically when Django starts
    """
    global scheduler
    
    # Prevent multiple scheduler instances
    if scheduler is not None:
        logger.info("⚠️ Scheduler already running, skipping initialization")
        return
    
    try:
        # Initialize scheduler with timezone
        scheduler = BackgroundScheduler(timezone=settings.TIME_ZONE)
        
        # Schedule the job to run daily at 2 AM
        scheduler.add_job(
            create_recurring_schedules_job,
            trigger=CronTrigger(hour=2, minute=0),
            id='create_recurring_schedules',
            name='Create Recurring Training Schedules',
            replace_existing=True
        )
        
        # FOR TESTING: Uncomment below to run every 5 minutes instead of daily
        # scheduler.add_job(
        #     create_recurring_schedules_job,
        #     trigger=CronTrigger(minute='*/5'),
        #     id='create_recurring_schedules',
        #     name='Create Recurring Training Schedules',
        #     replace_existing=True
        # )
        
        # Start the scheduler
        scheduler.start()
        
        logger.info("\n" + "=" * 60)
        logger.info("🚀 APScheduler started successfully!")
        logger.info("📅 Recurring schedules job scheduled for 2:00 AM daily")
        logger.info("=" * 60 + "\n")
        
        # Shut down the scheduler when exiting the app
        atexit.register(lambda: scheduler.shutdown() if scheduler else None)
        
    except Exception as e:
        logger.error(f"❌ Failed to start scheduler: {str(e)}")

def get_scheduler_status():
    """
    Get current scheduler status
    Used by API endpoints to check scheduler health
    """
    if scheduler is None:
        return {
            'running': False,
            'jobs': []
        }
    
    jobs_info = []
    try:
        for job in scheduler.get_jobs():
            jobs_info.append({
                'id': job.id,
                'name': job.name,
                'next_run_time': str(job.next_run_time) if job.next_run_time else None,
                'trigger': str(job.trigger),
            })
    except Exception as e:
        logger.error(f"Error getting jobs info: {str(e)}")
    
    return {
        'running': scheduler.running if scheduler else False,
        'jobs': jobs_info
    }

def trigger_job_now():
    """
    Manually trigger the job immediately
    Used for testing purposes
    """
    try:
        logger.info("🔄 Manually triggering recurring schedules job...")
        create_recurring_schedules_job()
        return True, "Job executed successfully"
    except Exception as e:
        error_msg = f"Error executing job: {str(e)}"
        logger.error(error_msg)
        return False, error_msg