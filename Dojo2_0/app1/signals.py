import threading
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import OJTScore, Score, SkillMatrix, TraineeInfo, MasterTable, Station, HierarchyStructure


def run_after_delay(func, delay, *args, **kwargs):
    """Run a function after N seconds without blocking request"""
    timer = threading.Timer(delay, func, args=args, kwargs=kwargs)
    timer.start()


# def update_skill_matrix(employee, station, level, verbose=True):
#     """
#     Update SkillMatrix when both OJT and Evaluation are passed
#     """
#     if verbose:
#         print("=" * 80)
#         print(f"[SkillMatrix] Checking update for Employee: {employee.emp_id}, "
#               f"Station: {station.station_name if station else '❌ None'}, "
#               f"Level: {level.level_name if level else '❌ None'}")

#     # ✅ Get TraineeInfo
#     trainee_info = TraineeInfo.objects.filter(emp_id=employee.emp_id).first()
#     if not trainee_info:
#         if verbose:
#             print(f"[SkillMatrix][ERROR] No TraineeInfo found for Employee: {employee.emp_id}")
#             print("=" * 80)
#         return

#     if verbose:
#         print(f"[SkillMatrix] Found TraineeInfo → Name: {trainee_info.trainee_name}, "
#               f"Status: {trainee_info.status}, DOJ: {trainee_info.doj}")

#     # -------------------------
#     # Check if OJT is passed
#     # -------------------------
#     ojt_pass = False
#     if trainee_info.status == "Pass":
#         ojt_exists = OJTScore.objects.filter(
#             trainee__emp_id=employee.emp_id,
#             topic__level=level
#         ).exists()
#         ojt_pass = ojt_exists
#         if verbose:
#             print(f"[SkillMatrix] OJT status=Pass, OJTScore exists for this level: {ojt_exists}")
#     else:
#         if verbose:
#             print(f"[SkillMatrix] OJT not passed → Trainee status is {trainee_info.status}")

#     if verbose:
#         print(f"[SkillMatrix] Final OJT passed = {ojt_pass}")

#     # -------------------------
#     # Check if Evaluation is passed
#     # -------------------------
#     eval_pass = Score.objects.filter(
#         employee=employee,
#         skill=station,
#         level=level,
#         passed=True
#     ).exists()
#     if verbose:
#         print(f"[SkillMatrix] Evaluation passed = {eval_pass}")

#     # -------------------------
#     # Update or create SkillMatrix
#     # -------------------------
#     if ojt_pass and eval_pass:
#         hierarchy = HierarchyStructure.objects.filter(station=station).first()
#         if not hierarchy:
#             if verbose:
#                 print(f"[SkillMatrix][ERROR] No HierarchyStructure found for Station: {station.station_name}")
#                 print("=" * 80)
#             return

#         obj, created = SkillMatrix.objects.update_or_create(
#             employee=employee,
#             level=level,
#             defaults={
#                 "employee_name": trainee_info.trainee_name,
#                 "emp_id": trainee_info.emp_id,
#                 "doj": trainee_info.doj,
#                 "hierarchy": hierarchy,
#             }
#         )
#         if verbose:
#             if created:
#                 print(f"[SkillMatrix] ✅ SkillMatrix created for Employee: {employee.emp_id}")
#             else:
#                 print(f"[SkillMatrix] 🔄 SkillMatrix updated for Employee: {employee.emp_id}")
#     else:
#         if verbose:
#             print(f"[SkillMatrix] ❌ Not updating. Conditions → OJT: {ojt_pass}, Eval: {eval_pass}")

#     if verbose:
#         print("=" * 80)
def update_skill_matrix(employee, station, level, verbose=True):
    """
    Update SkillMatrix when both OJT and Evaluation are passed
    Update SkillMatrix when OJT (for THIS station/level), Evaluation, AND Ten Cycle are all passed
    """
    if verbose:
        print("=" * 80)
        print(f"[SkillMatrix] Checking update for Employee: {employee.emp_id}, "
              f"Station: {station.station_name if station else '❌ None'}, "
              f"Level: {level.level_name if level else '❌ None'}")

    # ✅ Get TraineeInfo

    # ✅ Get TraineeInfo (Needed for name/doj and general status logging)
    # Filter by emp_id AND the specific station being certified to get the relevant record.
    # If the TraineeInfo record is unique per employee, we must fetch the correct one.
    # Since TraineeInfo has a ForeignKey to Station, we must use the 'station' parameter.

    # trainee_info = TraineeInfo.objects.filter(emp_id=employee.emp_id).first()
    
    trainee_info = TraineeInfo.objects.filter(emp_id=employee.emp_id, station=station).first()
    
    if not trainee_info:
        if verbose:
            # print(f"[SkillMatrix][ERROR] No TraineeInfo found for Employee: {employee.emp_id}")
            print(f"[SkillMatrix][ERROR] No TraineeInfo found for Employee: {employee.emp_id} at Station: {station.station_name}")
            # If no TraineeInfo exists for this station/skill, OJT cannot be complete.
            print("=" * 80)
        return

    if verbose:
        print(f"[SkillMatrix] Found TraineeInfo → Name: {trainee_info.trainee_name}, "
              f"Status: {trainee_info.status}, DOJ: {trainee_info.doj}")

    # -------------------------
    # Check if OJT is passed for THIS Station/Level
    # -------------------------
    ojt_pass = False
    
    # CRITICAL CHANGE: We rely on the TraineeInfo.status only if it applies to this station.
    # The TraineeInfoViewSet logic is now responsible for setting this status correctly 
    # based on OJT scores associated with this trainee/station.
    if trainee_info.status == "Pass":

        # Additional Sanity Check: Ensure there's a score linked to the trainee for the target level.
        # This prevents a scenario where the status was manually set to 'Pass' without any scores.
        # ojt_exists = OJTScore.objects.filter(

        ojt_exists_for_station_level = OJTScore.objects.filter(
            # Filter by the TraineeInfo instance, which is already scoped by station in the fetch above.
            trainee__emp_id=employee.emp_id,
            topic__level=level
        ).exists()
        # ojt_pass = ojt_exists

        # OJT is passed only if the trainee's status is "Pass" AND scores actually exist for this level.
        ojt_pass = ojt_exists_for_station_level
        if verbose:
            # print(f"[SkillMatrix] OJT status=Pass, OJTScore exists for this level: {ojt_exists}")
            print(f"[SkillMatrix] OJT status is {trainee_info.status}. OJTScore exists for THIS trainee/level: {ojt_exists_for_station_level}")
    else:
        if verbose:
            print(f"[SkillMatrix] OJT not passed → Trainee status is {trainee_info.status}")

    if verbose:
        print(f"[SkillMatrix] Final OJT passed = {ojt_pass}")

    # -------------------------
    # Check if Evaluation is passed
    # -------------------------
    eval_pass = Score.objects.filter(
        employee=employee,
        skill=station,
        level=level,
        passed=True
    ).exists()
    if verbose:
        print(f"[SkillMatrix] Evaluation passed = {eval_pass}")

    # -------------------------
    # Update or create SkillMatrix
    # -------------------------
    if ojt_pass and eval_pass:
        hierarchy = HierarchyStructure.objects.filter(station=station).first()
        if not hierarchy:
            if verbose:
                print(f"[SkillMatrix][ERROR] No HierarchyStructure found for Station: {station.station_name}")
                print("=" * 80)
            return

        obj, created = SkillMatrix.objects.update_or_create(
            employee=employee,
            # level=level,
            hierarchy=hierarchy,
            defaults={
                "employee_name": trainee_info.trainee_name,
                "emp_id": trainee_info.emp_id,
                "doj": trainee_info.doj,
                # "hierarchy": hierarchy,
                "level":level,

            }
        )
        if verbose:
            if created:
                print(f"[SkillMatrix] ✅ SkillMatrix created for Employee: {employee.emp_id}")
            else:
                print(f"[SkillMatrix] 🔄 SkillMatrix updated for Employee: {employee.emp_id}")
    else:
        if verbose:
            print(f"[SkillMatrix] ❌ Not updating. Conditions → OJT: {ojt_pass}, Eval: {eval_pass}")

    if verbose:
        print("=" * 80)


# -------------------------
# Signal for OJTScore
# -------------------------
# @receiver(post_save, sender=OJTScore)
# def update_skill_on_ojt_save(sender, instance, **kwargs):
#     print(f"[Signal][OJTScore] Saved → Trainee {instance.trainee.emp_id}, Score={instance.score}, Topic={instance.topic}")
#     try:
#         employee = MasterTable.objects.get(emp_id=instance.trainee.emp_id)
#         station = Station.objects.get(station_name=instance.trainee.station)
#     except MasterTable.DoesNotExist:
#         print(f"[Signal][ERROR] MasterTable not found for emp_id: {instance.trainee.emp_id}")
#         return
#     except Station.DoesNotExist:
#         print(f"[Signal][ERROR] Station not found: {instance.trainee.station}")
#         return

#     # ⏳ Delay 5 seconds before running the update
#     run_after_delay(update_skill_matrix, 5, employee, station, instance.topic.level, True)
@receiver(post_save, sender=OJTScore)
def update_skill_on_ojt_save(sender, instance, **kwargs):
    print(f"[Signal][OJTScore] Saved → Trainee {instance.trainee.emp_id}, Score={instance.score}, Topic={instance.topic}")
    try:
        employee = MasterTable.objects.get(emp_id=instance.trainee.emp_id)
        if not instance.trainee.station:
            print(f"[Signal][ERROR] No station for trainee {instance.trainee.emp_id}")
            return
            
        # --- CHANGE THIS ---
        # Instead of getting the ID, get the whole object.
        station_object = instance.trainee.station 
        
    except MasterTable.DoesNotExist:
        print(f"[Signal][ERROR] MasterTable not found for emp_id: {instance.trainee.emp_id}")
        return
    except Exception as e:
        print(f"[Signal][ERROR] Station access failed: {e}")
        return

    # --- AND CHANGE THIS ---
    # Pass the full station_object to the function.
    run_after_delay(update_skill_matrix, 5, employee, station_object, instance.topic.level, True)


# -------------------------
# Signal for Score
# -------------------------
@receiver(post_save, sender=Score)
def update_skill_on_eval_save(sender, instance, **kwargs):
    print(f"[Signal][Score] Saved → Employee {instance.employee.emp_id}, Skill={instance.skill}, Level={instance.level}, Passed={instance.passed}")
    if not instance.skill or not instance.level:
        print(f"[Signal][ERROR] Score missing skill or level → {instance}")
        return

    # ⏳ Delay 5 seconds before running the update
    run_after_delay(update_skill_matrix, 5, instance.employee, instance.skill, instance.level, True)

"""




# Django signals for automatic notification generation
# Handles real-time notification triggers for various system events
# """


from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Notification, MasterTable, Score, User
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

def create_notification(
    title, message, notification_type, recipient=None, recipient_email=None, 
    employee=None, priority='medium', metadata=None
):
    try:
        logger.info(f"Creating notification: {title} for {recipient.email if recipient else recipient_email}")
        notification = Notification.objects.create(
            title=title,
            message=message,
            notification_type=notification_type,
            recipient=recipient,
            recipient_email=recipient_email or (recipient.email if recipient else None),
            employee=employee,
            priority=priority,
            metadata=metadata or {},
            is_sent=False
        )
        return notification
    except Exception as e:
        logger.error(f"Error creating notification: {str(e)}")
        return None

def get_admin_users():
    try:
        admin_users = User.objects.filter(role__name__in=['admin', 'management'])
        logger.info(f"Found {admin_users.count()} admin/management users")
        if not admin_users.exists():
            logger.warning("No admin users found, falling back to first 5 users")
            return User.objects.all()[:5]
        return admin_users
    except Exception as e:
        logger.error(f"Error fetching admin users: {str(e)}")
        return User.objects.none()

def get_employee_user(employee):
    try:
        user = User.objects.get(email=employee.email)
        logger.info(f"Found user by email: {user.email} for employee {employee.emp_id}")
        return user
    except User.DoesNotExist:
        try:
            user = User.objects.get(employeeid=employee.emp_id)
            logger.info(f"Found user by employeeid: {user.email} for employee {employee.emp_id}")
            return user
        except User.DoesNotExist:
            logger.warning(f"No user found for employee {employee.emp_id}")
            return None
    except Exception as e:
        logger.error(f"Error finding user for employee {employee.emp_id}: {str(e)}")
        return None

@receiver(post_save, sender=MasterTable)
def notify_employee_registration(sender, instance, created, **kwargs):
    logger.info(f"Signal triggered for MasterTable, emp_id={instance.emp_id}, created={created}")
    if created:
        try:
            admin_users = get_admin_users()
            full_name = f"{instance.first_name} {instance.last_name or ''}".strip()
            department_name = instance.department.department_name if instance.department else "Not Assigned"
            
            for admin in admin_users:
                logger.info(f"Notifying admin: {admin.email}")
                create_notification(
                    title="New Employee Registered",
                    message=f"New employee {full_name} (ID: {instance.emp_id}) has been registered in the system.",
                    notification_type='employee_registration',
                    recipient=admin,
                    employee=instance,
                    priority='medium',
                    metadata={
                        'emp_id': instance.emp_id,
                        'email': instance.email,
                        'phone': instance.phone,
                        'department': department_name,
                        'date_of_joining': instance.date_of_joining.isoformat() if instance.date_of_joining else None,
                        'sex': instance.get_sex_display() if instance.sex else None,
                        'auto_generated': True
                    }
                )

            user = get_employee_user(instance)
            if user:
                logger.info(f"Notifying employee: {user.email}")
                create_notification(
                    title="Welcome to the System",
                    message=f"Welcome, {full_name}! Your employee profile (ID: {instance.emp_id}) has been created.",
                    notification_type='employee_registration',
                    recipient=user,
                    employee=instance,
                    priority='low',
                    metadata={
                        'emp_id': instance.emp_id,
                        'department': department_name,
                        'auto_generated': True
                    }
                )
        except Exception as e:
            logger.error(f"Error creating employee registration notification: {str(e)}")

@receiver(post_save, sender=Score)
def notify_test_assigned_and_completed(sender, instance, created, **kwargs):
    logger.info(f"Signal triggered for Score, employee={instance.employee.emp_id}, created={created}")
    try:
        admin_users = get_admin_users()
        test_name = instance.test.test_name if instance.test else "Test"
        full_name = f"{instance.employee.first_name} {instance.employee.last_name or ''}".strip()
        
        if created:
            for admin in admin_users:
                logger.info(f"Notifying admin: {admin.email}")
                create_notification(
                    title="Test Assigned",
                    message=f"Test '{test_name}' has been assigned to {full_name}.",
                    notification_type='test_assigned',
                    recipient=admin,
                    employee=instance.employee,
                    priority='medium',
                    metadata={
                        'test_name': test_name,
                        'test_id': instance.test.key_id if instance.test else None,
                        'emp_id': instance.employee.emp_id,
                        'level': str(instance.level) if instance.level else None,
                        'skill': str(instance.skill) if instance.skill else None,
                        'auto_generated': True
                    }
                )
        else:
            if instance.passed is not None:
                status = "Passed" if instance.passed else "Failed"
                priority = 'high' if not instance.passed else 'medium'
                
                for admin in admin_users:
                    logger.info(f"Notifying admin: {admin.email}")
                    create_notification(
                        title="Evaluation Completed",
                        message=f"{full_name} completed evaluation with {instance.percentage}% ({status}).",
                        notification_type='evaluation_completed',
                        recipient=admin,
                        employee=instance.employee,
                        priority=priority,
                        metadata={
                            'test_id': instance.test.key_id if instance.test else None,
                            'emp_id': instance.employee.emp_id,
                            'marks': instance.marks,
                            'percentage': str(instance.percentage),
                            'passed': instance.passed,
                            'auto_generated': True
                        }
                    )

                user = get_employee_user(instance.employee)
                if user:
                    logger.info(f"Notifying employee: {user.email}")
                    create_notification(
                        title="Your Evaluation Results",
                        message=f"You scored {instance.percentage}% ({status}).",
                        notification_type='evaluation_completed',
                        recipient=user,
                        employee=instance.employee,
                        priority=priority,
                        metadata={
                            'test_id': instance.test.key_id if instance.test else None,
                            'marks': instance.marks,
                            'percentage': str(instance.percentage),
                            'passed': instance.passed,
                            'auto_generated': True
                        }
                    )
    except Exception as e:
        logger.error(f"Error creating test notification: {str(e)}")



# import threading
# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from .models import Score, SkillMatrix, HierarchyStructure


# # ----------------------------------------
# # Helper: Run function after a delay
# # ----------------------------------------
# def run_after_delay(func, delay, *args, **kwargs):
#     """Run a function after N seconds without blocking request"""
#     timer = threading.Timer(delay, func, args=args, kwargs=kwargs)
#     timer.start()


# # ----------------------------------------
# # Core logic: create/update SkillMatrix
# # ----------------------------------------
# def process_score_for_skillmatrix(score):
#     """
#     ✅ Create/Update SkillMatrix if:
#       - skill = General
#       - level = Level 1
#     """
#     if not score.skill or not score.level:
#         return

#     if score.skill.station_name != "General":
#         return

#     if score.level.level_name != "Level 1":
#         return

#     employee = score.employee

#     try:
#         # ✅ Find hierarchy for this station
#         hierarchy = HierarchyStructure.objects.filter(station=score.skill).first()
#         if not hierarchy:
#             print(f"[SkillMatrix][ERROR] No hierarchy found for station={score.skill}")
#             return

#         # ✅ Create or update SkillMatrix
#         obj, created = SkillMatrix.objects.update_or_create(
#             employee=employee,
#             hierarchy=hierarchy,
#             level=score.level,
#             defaults={
#                 "employee_name": employee.emp_name,   # adjust if field name differs
#                 "emp_id": employee.emp_id,
#                 "doj": employee.doj,
#             },
#         )

#         if created:
#             print(f"[SkillMatrix] ✅ Created for {employee.emp_id} ({employee.emp_name}) at {hierarchy.station}")
#         else:
#             print(f"[SkillMatrix] 🔄 Updated for {employee.emp_id} ({employee.emp_name}) at {hierarchy.station}")

#     except Exception as e:
#         print(f"[SkillMatrix][ERROR] Failed for Score ID={score.id}: {e}")


# # ----------------------------------------
# # Signal: when Score is saved
# # ----------------------------------------
# @receiver(post_save, sender=Score)
# def create_skill_matrix_from_score(sender, instance, **kwargs):
#     print(f"[Signal][Score] Saved → Employee {instance.employee.emp_id}, "
#           f"Skill={instance.skill}, Level={instance.level}")

#     # ✅ Run with 5s delay
#     run_after_delay(process_score_for_skillmatrix, 5, instance)


from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import SkillMatrix, MachineAllocation

@receiver(post_save, sender=SkillMatrix)
def update_allocation_status_on_level_change(sender, instance, created, **kwargs):
    """
    Signal to update allocation status when an employee's level changes
    """
    if not created:  # Only for updates, not new creations
        # Get all pending allocations for this employee
        pending_allocations = MachineAllocation.objects.filter(
            employee=instance,
            approval_status='pending'
        )
        
        for allocation in pending_allocations:
            try:
                employee_level_value = instance.level.level_id
                machine_level_value = allocation.machine.level
                
                # Check if employee now meets the machine level requirement
                if employee_level_value >= machine_level_value:
                    allocation.approval_status = 'approved'
                    allocation.save()
                    print(f"Auto-approved allocation: {allocation}")
                    
            except (ValueError, AttributeError) as e:
                print(f"Error updating allocation {allocation.id}: {e}")
                continue



# import threading
# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from .models import Score, SkillMatrix, HierarchyStructure


# # ----------------------------------------
# # Helper: Run function after a delay
# # ----------------------------------------
# def run_after_delay(func, delay, *args, **kwargs):
#     """Run a function after N seconds without blocking request"""
#     timer = threading.Timer(delay, func, args=args, kwargs=kwargs)
#     timer.start()


# # ----------------------------------------
# # Core logic: create/update SkillMatrix
# # ----------------------------------------
# def process_score_for_skillmatrix(score):
#     """
#     ✅ Create/Update SkillMatrix if:
#       - skill = General
#       - level = Level 1
#     """
#     if not score.skill or not score.level:
#         return

#     if score.skill.station_name != "General":
#         return

#     if score.level.level_name != "Level 1":
#         return

#     employee = score.employee

#     try:
#         # ✅ Find hierarchy for this station
#         hierarchy = HierarchyStructure.objects.filter(station=score.skill).first()
#         if not hierarchy:
#             print(f"[SkillMatrix][ERROR] No hierarchy found for station={score.skill}")
#             return

#         # ✅ Create or update SkillMatrix
#         obj, created = SkillMatrix.objects.update_or_create(
#             employee=employee,
#             hierarchy=hierarchy,
#             level=score.level,
#             defaults={
#                 "employee_name": employee.first_name,   # adjust if field name differs
#                 "emp_id": employee.emp_id,
#                 "doj": employee.date_of_joining,
#             },
#         )

#         if created:
#             print(f"[SkillMatrix] ✅ Created for {employee.emp_id} ({employee.first_name}) at {hierarchy.station}")
#         else:
#             print(f"[SkillMatrix] 🔄 Updated for {employee.emp_id} ({employee.first_name}) at {hierarchy.station}")

#     except Exception as e:
#         print(f"[SkillMatrix][ERROR] Failed for Score ID={score.id}: {e}")


# # ----------------------------------------
# # Signal: when Score is saved
# # ----------------------------------------
# @receiver(post_save, sender=Score)
# def create_skill_matrix_from_score(sender, instance, **kwargs):
#     print(f"[Signal][Score] Saved → Employee {instance.employee.emp_id}, "
#           f"Skill={instance.skill}, Level={instance.level}")

#     # ✅ Run with 5s delay
#     run_after_delay(process_score_for_skillmatrix, 5, instance)





from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import SkillMatrix, MultiSkilling

@receiver(post_save, sender=SkillMatrix)
def mark_multiskilling_completed(sender, instance, **kwargs):
    """
    Whenever a SkillMatrix entry is saved, check if there is a scheduled MultiSkilling
    for the same employee + station + skill_level, and mark it as completed.
    """
    employee = instance.employee
    station = getattr(instance.hierarchy, "station", None)
    level = instance.level  

    if not station or not level:
        return  

    MultiSkilling.objects.filter(
        employee=employee,
        station=station,
        skill_level=level
    ).exclude(status="completed").update(status="completed")




# Level 1 Check for skill matrix update 

import threading
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import (
    Score, ProductivityEvaluation, QualityEvaluation,
    SkillMatrix, HierarchyStructure, Level
)


# -----------------------------
# Helper: Run function later
# -----------------------------
def run_after_delay(func, delay, *args, **kwargs):
    """Run a function after N seconds without blocking request"""
    timer = threading.Timer(delay, func, args=args, kwargs=kwargs)
    timer.start()


# -----------------------------
# Core logic for Level 1
# -----------------------------
def process_level1_update(employee):
    """
    ✅ Create/Update SkillMatrix Level 1 if:
       - Evaluation (Score) = PASS for Level 1 + General
       - ProductivityEvaluation = PASS
       - QualityEvaluation = PASS
    """
    try:
        # 1. Check Score (evaluation)
        score_pass = Score.objects.filter(
            employee=employee,
            level__level_name="Level 1",
            skill__station_name="General",
            passed=True
        ).exists()
        if not score_pass:
            print(f"[SkillMatrix][WAIT] Score not passed yet for {employee.emp_id}")
            return

        # 2. Check Productivity
        prod_pass = ProductivityEvaluation.objects.filter(
            employee=employee, status="PASS"
        ).exists()
        if not prod_pass:
            print(f"[SkillMatrix][WAIT] Productivity not passed yet for {employee.emp_id}")
            return

        # 3. Check Quality
        qual_pass = QualityEvaluation.objects.filter(
            employee=employee, status="PASS"
        ).exists()
        if not qual_pass:
            print(f"[SkillMatrix][WAIT] Quality not passed yet for {employee.emp_id}")
            return

        # All three conditions met → update SkillMatrix
        hierarchy = HierarchyStructure.objects.filter(
            station__station_name="General"
        ).first()
        if not hierarchy:
            print(f"[SkillMatrix][ERROR] No hierarchy found for General station")
            return

        level = Level.objects.get(level_name="Level 1")

        obj, created = SkillMatrix.objects.update_or_create(
            employee=employee,
            hierarchy=hierarchy,
            defaults={
                "employee_name": f"{employee.first_name} {employee.last_name}",
                "emp_id": employee.emp_id,
                "doj": employee.date_of_joining,
                "level": level,
            }
        )

        if created:
            print(f"[SkillMatrix] ✅ Created Level 1 for {employee.emp_id}")
        else:
            print(f"[SkillMatrix] 🔄 Updated Level 1 for {employee.emp_id}")

    except Exception as e:
        print(f"[SkillMatrix][ERROR] Failed Level 1 update for {employee.emp_id}: {e}")


# -----------------------------
# Signals for each model
# -----------------------------
@receiver(post_save, sender=Score)
def check_level1_from_score(sender, instance, **kwargs):
    if instance.level and instance.level.level_name == "Level 1" and \
       instance.skill and instance.skill.station_name == "General":
        run_after_delay(process_level1_update, 3, instance.employee)


@receiver(post_save, sender=ProductivityEvaluation)
def check_level1_from_productivity(sender, instance, **kwargs):
    if instance.status == "PASS":
        run_after_delay(process_level1_update, 3, instance.employee)


@receiver(post_save, sender=QualityEvaluation)
def check_level1_from_quality(sender, instance, **kwargs):
    if instance.status == "PASS":
        run_after_delay(process_level1_update, 3, instance.employee)















# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from .models import EvaluationLevel2, TraineeInfo, OperatorObservanceSheet, SkillMatrix, HierarchyStructure

# @receiver(post_save, sender=EvaluationLevel2)
# def update_skill_matrix_on_evaluation_save(sender, instance, created, **kwargs):
#     """
#     Signal to update SkillMatrix when EvaluationLevel2 is saved with status 'Pass' or 'Re-evaluation Pass',
#     and both TraineeInfo and OperatorObservanceSheet are also passed for the same employee, station, and level.
#     """
#     # Only proceed if the evaluation status is 'Pass' or 'Re-evaluation Pass'
#     if instance.status not in [EvaluationLevel2.STATUS_PASS, EvaluationLevel2.STATUS_RE_EVAL_PASS]:
#         return

#     employee = instance.employee
#     station_name = instance.station_name
#     level = instance.level
#     verbose = True  # For logging/debugging; set to False in production

#     if verbose:
#         print("=" * 80)
#         print(f"[SkillMatrix Signal] Checking update for Employee: {employee.emp_id}, "
#               f"Station: {station_name}, Level: {level.level_name if level else '❌ None'}")

#     # Step 1: Check TraineeInfo (OJT) status
#     try:
#         trainee_info = TraineeInfo.objects.filter(
#             emp_id=employee.emp_id,
#             station__station_name=station_name
#         ).first()
#     except TraineeInfo.DoesNotExist:
#         trainee_info = None

#     if not trainee_info:
#         if verbose:
#             print(f"[SkillMatrix Signal][ERROR] No TraineeInfo found for Employee: {employee.emp_id} "
#                   f"at Station: {station_name}")
#             print("=" * 80)
#         return

#     ojt_pass = trainee_info.status == "Pass"
#     if verbose:
#         print(f"[SkillMatrix Signal] Found TraineeInfo → Name: {trainee_info.trainee_name}, "
#               f"Status: {trainee_info.status}, DOJ: {trainee_info.doj}")
#         print(f"[SkillMatrix Signal] OJT passed = {ojt_pass}")

#     # Step 2: Check OperatorObservanceSheet status
#     try:
#         observance_sheet = OperatorObservanceSheet.objects.filter(
#             operator_name=f"{employee.first_name} {employee.last_name}",
#             process_name=station_name,
#             level=level.level_name,  # Assuming level.level_name matches OperatorObservanceSheet.level
#             result="Pass"  # Assuming 'result' field indicates pass/fail
#         ).first()
#     except OperatorObservanceSheet.DoesNotExist:
#         observance_sheet = None

#     if not observance_sheet:
#         if verbose:
#             print(f"[SkillMatrix Signal][ERROR] No OperatorObservanceSheet found for Employee: {employee.emp_id} "
#                   f"at Station: {station_name}, Level: {level.level_name}")
#             print("=" * 80)
#         return

#     observance_pass = observance_sheet.result == "Qualified"
#     if verbose:
#         print(f"[SkillMatrix Signal] Found OperatorObservanceSheet → Operator: {observance_sheet.operator_name}, "
#               f"Result: {observance_sheet.result}")
#         print(f"[SkillMatrix Signal] Observance Sheet passed = {observance_pass}")

#     # Step 3: Check EvaluationLevel2 status (already confirmed by signal condition)
#     eval_pass = instance.status in [EvaluationLevel2.STATUS_PASS, EvaluationLevel2.STATUS_RE_EVAL_PASS]
#     if verbose:
#         print(f"[SkillMatrix Signal] Evaluation passed = {eval_pass}")

#     # Step 4: Update or create SkillMatrix if all three conditions are met
#     if ojt_pass and eval_pass and observance_pass:
#         # Get HierarchyStructure for the station
#         hierarchy = HierarchyStructure.objects.filter(station__station_name=station_name).first()
#         if not hierarchy:
#             if verbose:
#                 print(f"[SkillMatrix Signal][ERROR] No HierarchyStructure found for Station: {station_name}")
#                 print("=" * 80)
#             return

#         obj, created = SkillMatrix.objects.update_or_create(
#             employee=employee,
#             hierarchy=hierarchy,
#             level=level,
#             defaults={
#                 "employee_name": f"{employee.first_name} {employee.last_name}",
#                 "emp_id": employee.emp_id,
#                 "doj": trainee_info.doj,  # Using DOJ from TraineeInfo as it's likely the most reliable source
#             }
#         )
#         if verbose:
#             if created:
#                 print(f"[SkillMatrix Signal] ✅ SkillMatrix created for Employee: {employee.emp_id}")
#             else:
#                 print(f"[SkillMatrix Signal] 🔄 SkillMatrix updated for Employee: {employee.emp_id}")
#     else:
#         if verbose:
#             print(f"[SkillMatrix Signal] ❌ Not updating. Conditions → OJT: {ojt_pass}, "
#                   f"Eval: {eval_pass}, Observance: {observance_pass}")
#             print("=" * 80)




# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from .models import EvaluationLevel2, TraineeInfo, SkillMatrix, HierarchyStructure

# @receiver(post_save, sender=EvaluationLevel2)
# def update_skill_matrix_on_evaluation_save(sender, instance, created, **kwargs):
#     """
#     Signal to update SkillMatrix when EvaluationLevel2 is saved with status 'Pass' or 'Re-evaluation Pass',
#     and TraineeInfo is passed for the same employee, station, and level.
#     """
#     if instance.status not in [EvaluationLevel2.STATUS_PASS, EvaluationLevel2.STATUS_RE_EVAL_PASS]:
#         return

#     employee = instance.employee
#     station_name = instance.station_name.replace("+", " ")  # Normalize: Replace '+' with space
#     level = instance.level
#     level_name = level.level_name  # e.g., "Level 2"
#     verbose = True

#     if verbose:
#         print("=" * 80)
#         print(f"[SkillMatrix Signal] Checking update for Employee: {employee.emp_id}, "
#               f"Station: {station_name}, Level: {level_name}")

#     # Step 1: Check TraineeInfo (OJT) status
#     try:
#         trainee_info = TraineeInfo.objects.filter(
#             emp_id=employee.emp_id,
#             station__station_name=station_name
#         ).first()
#     except TraineeInfo.DoesNotExist:
#         trainee_info = None

#     if not trainee_info:
#         if verbose:
#             print(f"[SkillMatrix Signal][ERROR] No TraineeInfo found for Employee: {employee.emp_id} "
#                   f"at Station: {station_name}")
#             print("=" * 80)
#         return

#     ojt_pass = trainee_info.status == "Pass"
#     if verbose:
#         print(f"[SkillMatrix Signal] Found TraineeInfo → Name: {trainee_info.trainee_name}, "
#               f"Status: {trainee_info.status}, DOJ: {trainee_info.doj}")
#         print(f"[SkillMatrix Signal] OJT passed = {ojt_pass}")

#     # Step 2: Check EvaluationLevel2 status
#     eval_pass = instance.status in [EvaluationLevel2.STATUS_PASS, EvaluationLevel2.STATUS_RE_EVAL_PASS]
#     if verbose:
#         print(f"[SkillMatrix Signal] Evaluation passed = {eval_pass}")

#     # Step 3: Update or create SkillMatrix if both conditions are met
#     if ojt_pass and eval_pass:
#         hierarchy = HierarchyStructure.objects.filter(station__station_name=station_name).first()
#         if not hierarchy:
#             if verbose:
#                 print(f"[SkillMatrix Signal][ERROR] No HierarchyStructure found for Station: {station_name}")
#                 print("=" * 80)
#             return

#         obj, created = SkillMatrix.objects.update_or_create(
#             employee=employee,
#             hierarchy=hierarchy,
#             level=level,
#             defaults={
#                 "employee_name": f"{employee.first_name} {employee.last_name}",
#                 "emp_id": employee.emp_id,
#                 "doj": trainee_info.doj,
#             }
#         )
#         if verbose:
#             if created:
#                 print(f"[SkillMatrix Signal] ✅ SkillMatrix created for Employee: {employee.emp_id}")
#             else:
#                 print(f"[SkillMatrix Signal] 🔄 SkillMatrix updated for Employee: {employee.emp_id}")
#     else:
#         if verbose:
#             print(f"[SkillMatrix Signal] ❌ Not updating. Conditions → OJT: {ojt_pass}, Eval: {eval_pass}")
#             print("=" * 80)


# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from .models import EvaluationLevel2, TraineeInfo, SkillMatrix, HierarchyStructure, OperatorObservanceSheet

# @receiver(post_save, sender=EvaluationLevel2)
# def update_skill_matrix_on_evaluation_save(sender, instance, created, **kwargs):
#     """
#     Signal to update SkillMatrix when EvaluationLevel2 is saved with status 'Pass' or 'Re-evaluation Pass',
#     TraineeInfo is passed, and OperatorObservanceSheet has result 'Qualified' for the same employee, station, and level.
#     """
#     if instance.status not in [EvaluationLevel2.STATUS_PASS, EvaluationLevel2.STATUS_RE_EVAL_PASS]:
#         return

#     employee = instance.employee
#     station_name = instance.station_name.replace("+", " ")  # Normalize: Replace '+' with space
#     level = instance.level
#     level_name = level.level_name  # e.g., "Level 2"
#     verbose = True

#     if verbose:
#         print("=" * 80)
#         print(f"[SkillMatrix Signal] Checking update for Employee: {employee.emp_id}, "
#               f"Station: {station_name}, Level: {level_name}")

#     # Step 1: Check TraineeInfo (OJT) status
#     try:
#         trainee_info = TraineeInfo.objects.filter(
#             emp_id=employee.emp_id,
#             station__station_name=station_name
#         ).first()
#     except TraineeInfo.DoesNotExist:
#         trainee_info = None

#     if not trainee_info:
#         if verbose:
#             print(f"[SkillMatrix Signal][ERROR] No TraineeInfo found for Employee: {employee.emp_id} "
#                   f"at Station: {station_name}")
#             print("=" * 80)
#         return

#     ojt_pass = trainee_info.status == "Pass"
#     if verbose:
#         print(f"[SkillMatrix Signal] Found TraineeInfo → Name: {trainee_info.trainee_name}, "
#               f"Status: {trainee_info.status}, DOJ: {trainee_info.doj}")
#         print(f"[SkillMatrix Signal] OJT passed = {ojt_pass}")

#     # Step 2: Check EvaluationLevel2 status
#     eval_pass = instance.status in [EvaluationLevel2.STATUS_PASS, EvaluationLevel2.STATUS_RE_EVAL_PASS]
#     if verbose:
#         print(f"[SkillMatrix Signal] Evaluation passed = {eval_pass}")

#     # Step 3: Check OperatorObservanceSheet status
#     try:
#         observance_sheet = OperatorObservanceSheet.objects.filter(
#             operator_name=f"{employee.first_name} {employee.last_name}",
#             process_name=station_name,
#             level=level_name
#         ).last()
#     except OperatorObservanceSheet.DoesNotExist:
#         observance_sheet = None

#     if not observance_sheet:
#         if verbose:
#             print(f"[SkillMatrix Signal][ERROR] No OperatorObservanceSheet found for Employee: {employee.emp_id} "
#                   f"at Station: {station_name}, Level: {level_name}")
#             print("=" * 80)
#         return

#     observance_pass = observance_sheet.result == "Qualified"
#     if verbose:
#         print(f"[SkillMatrix Signal] Found OperatorObservanceSheet → Operator: {observance_sheet.operator_name}, "
#               f"Result: {observance_sheet.result}")
#         print(f"[SkillMatrix Signal] Observance passed = {observance_pass}")

#     # Step 4: Update or create SkillMatrix if all conditions are met
#     if ojt_pass and eval_pass and observance_pass:
#         hierarchy = HierarchyStructure.objects.filter(station__station_name=station_name).first()
#         if not hierarchy:
#             if verbose:
#                 print(f"[SkillMatrix Signal][ERROR] No HierarchyStructure found for Station: {station_name}")
#                 print("=" * 80)
#             return

#         obj, created = SkillMatrix.objects.update_or_create(
#             employee=employee,
#             hierarchy=hierarchy,
#             # level=level,
#             defaults={
#                 "employee_name": f"{employee.first_name} {employee.last_name}",
#                 "emp_id": employee.emp_id,
#                 "doj": trainee_info.doj,
#                 "level":level,

#             }
#         )
#         if verbose:
#             if created:
#                 print(f"[SkillMatrix Signal] ✅ SkillMatrix created for Employee: {employee.emp_id}")
#             else:
#                 print(f"[SkillMatrix Signal] 🔄 SkillMatrix updated for Employee: {employee.emp_id}")
#     else:
#         if verbose:
#             print(f"[SkillMatrix Signal] ❌ Not updating. Conditions → OJT: {ojt_pass}, Eval: {eval_pass}, "
#                   f"Observance: {observance_pass}")
#             print("=" * 80)



# # signals.py
# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from .models import EvaluationLevel2, TraineeInfo, SkillMatrix, HierarchyStructure, OperatorObservanceSheet, Level

# def update_skill_matrix_logic(employee, station_name, level_name, verbose=True):
#     """
#     Shared logic to check all three conditions and update SkillMatrix.
#     employee: EvaluationLevel2.employee instance (ForeignKey to Employee model)
#     """
#     if verbose:
#         print("=" * 80)
#         print(f"[SkillMatrix Update] Checking for Employee: {employee.emp_id}, "
#               f"Station: {station_name}, Level: {level_name}")

#     # Step 1: Check TraineeInfo (OJT) status
#     trainee_info = TraineeInfo.objects.filter(
#         emp_id=employee.emp_id,
#         station__station_name=station_name
#     ).first()

#     if not trainee_info:
#         if verbose:
#             print(f"[SkillMatrix Update][WARNING] No TraineeInfo found")
#             print("=" * 80)
#         return

#     ojt_pass = trainee_info.status == "Pass"
#     if verbose:
#         print(f"[SkillMatrix Update] TraineeInfo → Status: {trainee_info.status}, OJT Pass: {ojt_pass}")

#     # Step 2: Check EvaluationLevel2 status
#     evaluation = EvaluationLevel2.objects.filter(
#         employee=employee,
#         station_name=station_name,
#         level__level_name=level_name
#     ).last()

#     if not evaluation:
#         if verbose:
#             print(f"[SkillMatrix Update][WARNING] No Evaluation found")
#             print("=" * 80)
#         return

#     eval_pass = evaluation.status in [EvaluationLevel2.STATUS_PASS, EvaluationLevel2.STATUS_RE_EVAL_PASS]
#     if verbose:
#         print(f"[SkillMatrix Update] Evaluation → Status: {evaluation.status}, Eval Pass: {eval_pass}")

#     # Step 3: Check OperatorObservanceSheet status
#     observance_sheet = OperatorObservanceSheet.objects.filter(
#         operator_name=f"{employee.first_name} {employee.last_name}",
#         process_name=station_name,
#         level=level_name
#     ).last()

#     if not observance_sheet:
#         if verbose:
#             print(f"[SkillMatrix Update][WARNING] No OperatorObservanceSheet found")
#             print("=" * 80)
#         return

#     observance_pass = observance_sheet.result == "Qualified"
#     if verbose:
#         print(f"[SkillMatrix Update] ObservanceSheet → Result: {observance_sheet.result}, Observance Pass: {observance_pass}")

#     # Step 4: Update SkillMatrix if all conditions met
#     if ojt_pass and eval_pass and observance_pass:
#         hierarchy = HierarchyStructure.objects.filter(station__station_name=station_name).first()
#         if not hierarchy:
#             if verbose:
#                 print(f"[SkillMatrix Update][ERROR] No HierarchyStructure found for Station: {station_name}")
#                 print("=" * 80)
#             return

#         level_obj = Level.objects.filter(level_name=level_name).first()
#         if not level_obj:
#             if verbose:
#                 print(f"[SkillMatrix Update][ERROR] Level not found: {level_name}")
#                 print("=" * 80)
#             return

#         obj, created = SkillMatrix.objects.update_or_create(
#             employee=employee,
#             hierarchy=hierarchy,
#             defaults={
#                 "employee_name": f"{employee.first_name} {employee.last_name}",
#                 "emp_id": employee.emp_id,
#                 "doj": trainee_info.doj,
#                 "level": level_obj,
#             }
#         )

#         if verbose:
#             if created:
#                 print(f"[SkillMatrix Update] ✅ SkillMatrix CREATED for {employee.emp_id}")
#             else:
#                 print(f"[SkillMatrix Update] 🔄 SkillMatrix UPDATED for {employee.emp_id}")
#     else:
#         if verbose:
#             print(f"[SkillMatrix Update] ❌ Conditions NOT met → OJT: {ojt_pass}, Eval: {eval_pass}, Observance: {observance_pass}")
    
#     if verbose:
#         print("=" * 80)


# def update_skill_matrix_logic_with_observance(employee, station_name, level_name, observance_instance, verbose=True):
#     """
#     Modified logic that uses the provided observance_instance directly instead of querying.
#     This avoids timing issues where the record might not be visible in queries yet.
#     """
#     if verbose:
#         print("=" * 80)
#         print(f"[SkillMatrix Update] Checking for Employee: {employee.emp_id}, "
#               f"Station: {station_name}, Level: {level_name}")

#     # Step 1: Check TraineeInfo (OJT) status
#     trainee_info = TraineeInfo.objects.filter(
#         emp_id=employee.emp_id,
#         station__station_name=station_name
#     ).first()

#     if not trainee_info:
#         if verbose:
#             print(f"[SkillMatrix Update][WARNING] No TraineeInfo found")
#             print("=" * 80)
#         return

#     ojt_pass = trainee_info.status == "Pass"
#     if verbose:
#         print(f"[SkillMatrix Update] TraineeInfo → Status: {trainee_info.status}, OJT Pass: {ojt_pass}")

#     # Step 2: Check EvaluationLevel2 status
#     evaluation = EvaluationLevel2.objects.filter(
#         employee=employee,
#         station_name=station_name,
#         level__level_name=level_name
#     ).last()

#     if not evaluation:
#         if verbose:
#             print(f"[SkillMatrix Update][WARNING] No Evaluation found")
#             print("=" * 80)
#         return

#     eval_pass = evaluation.status in [EvaluationLevel2.STATUS_PASS, EvaluationLevel2.STATUS_RE_EVAL_PASS]
#     if verbose:
#         print(f"[SkillMatrix Update] Evaluation → Status: {evaluation.status}, Eval Pass: {eval_pass}")

#     # Step 3: Use the provided observance_instance directly
#     observance_pass = observance_instance.result == "Qualified"
#     if verbose:
#         print(f"[SkillMatrix Update] ObservanceSheet (instance) → Result: {observance_instance.result}, Observance Pass: {observance_pass}")

#     # Step 4: Update SkillMatrix if all conditions met
#     if ojt_pass and eval_pass and observance_pass:
#         hierarchy = HierarchyStructure.objects.filter(station__station_name=station_name).first()
#         if not hierarchy:
#             if verbose:
#                 print(f"[SkillMatrix Update][ERROR] No HierarchyStructure found for Station: {station_name}")
#                 print("=" * 80)
#             return

#         level_obj = Level.objects.filter(level_name=level_name).first()
#         if not level_obj:
#             if verbose:
#                 print(f"[SkillMatrix Update][ERROR] Level not found: {level_name}")
#                 print("=" * 80)
#             return

#         obj, created = SkillMatrix.objects.update_or_create(
#             employee=employee,
#             hierarchy=hierarchy,
#             defaults={
#                 "employee_name": f"{employee.first_name} {employee.last_name}",
#                 "emp_id": employee.emp_id,
#                 "doj": trainee_info.doj,
#                 "level": level_obj,
#             }
#         )

#         if verbose:
#             if created:
#                 print(f"[SkillMatrix Update] ✅ SkillMatrix CREATED for {employee.emp_id}")
#             else:
#                 print(f"[SkillMatrix Update] 🔄 SkillMatrix UPDATED for {employee.emp_id}")
#     else:
#         if verbose:
#             print(f"[SkillMatrix Update] ❌ Conditions NOT met → OJT: {ojt_pass}, Eval: {eval_pass}, Observance: {observance_pass}")
    
#     if verbose:
#         print("=" * 80)


# @receiver(post_save, sender=EvaluationLevel2)
# def update_skill_matrix_on_evaluation_save(sender, instance, created, **kwargs):
#     """
#     Triggered when EvaluationLevel2 is saved with Pass status.
#     """
#     if instance.status not in [EvaluationLevel2.STATUS_PASS, EvaluationLevel2.STATUS_RE_EVAL_PASS]:
#         return

#     employee = instance.employee
#     station_name = instance.station_name.replace("+", " ")
#     level_name = instance.level.level_name

#     print(f"\n🔔 [SIGNAL] EvaluationLevel2 saved for {employee.emp_id}")
#     update_skill_matrix_logic(employee, station_name, level_name, verbose=True)


# @receiver(post_save, sender=OperatorObservanceSheet)
# def update_skill_matrix_on_observance_save(sender, instance, created, **kwargs):
#     """
#     Triggered when OperatorObservanceSheet is saved with Qualified result.
    
#     CRITICAL: This finds the employee by matching the operator_name from OperatorObservanceSheet
#     with existing TraineeInfo or EvaluationLevel2 records.
    
#     Note: We use the 'instance' directly instead of querying again to avoid timing issues.
#     """
#     print(f"\n🔔 [SIGNAL] OperatorObservanceSheet signal triggered!")
#     print(f"   Operator: {instance.operator_name}, Result: {instance.result}")
#     print(f"   Process: {instance.process_name}, Level: {instance.level}")
    
#     if instance.result != "Qualified":
#         print(f"   ⏭️ Skipping - Result is not 'Qualified'")
#         return

#     operator_name = instance.operator_name.strip()
#     station_name = instance.process_name.strip()
#     level_name = instance.level.strip()

#     # Strategy: Find employee through TraineeInfo or EvaluationLevel2
#     # First try: Find matching TraineeInfo by name and station
#     trainee_info = TraineeInfo.objects.filter(
#         trainee_name__iexact=operator_name,
#         station__station_name=station_name
#     ).first()

#     if trainee_info:
#         print(f"   ✅ Found employee via TraineeInfo: {trainee_info.emp_id}")
        
#         # Now find the actual employee object from EvaluationLevel2
#         evaluation = EvaluationLevel2.objects.filter(
#             employee__emp_id=trainee_info.emp_id,
#             station_name=station_name
#         ).first()
        
#         if evaluation and evaluation.employee:
#             employee = evaluation.employee
#             print(f"   ✅ Found Employee object: {employee.emp_id}")
#             # Call the update logic with the saved instance
#             update_skill_matrix_logic_with_observance(employee, station_name, level_name, instance, verbose=True)
#         else:
#             print(f"   ❌ No EvaluationLevel2 found for emp_id: {trainee_info.emp_id}")
#     else:
#         # Second try: Search directly in EvaluationLevel2 by name matching
#         print(f"   Searching EvaluationLevel2 by name: {operator_name}")
        
#         # Parse name
#         name_parts = operator_name.split()
#         if len(name_parts) >= 2:
#             first_name = name_parts[0]
#             last_name = " ".join(name_parts[1:])
            
#             evaluation = EvaluationLevel2.objects.filter(
#                 employee__first_name__iexact=first_name,
#                 employee__last_name__iexact=last_name,
#                 station_name=station_name
#             ).first()
            
#             if evaluation and evaluation.employee:
#                 employee = evaluation.employee
#                 print(f"   ✅ Found Employee via EvaluationLevel2: {employee.emp_id}")
#                 # Call the update logic with the saved instance
#                 update_skill_matrix_logic_with_observance(employee, station_name, level_name, instance, verbose=True)
#             else:
#                 print(f"   ❌ Employee not found in EvaluationLevel2: {operator_name}")
#         else:
#             print(f"   ❌ Invalid operator name format: {operator_name}")


# @receiver(post_save, sender=TraineeInfo)
# def update_skill_matrix_on_trainee_save(sender, instance, created, **kwargs):
#     """
#     Triggered when TraineeInfo is saved with Pass status.
#     """
#     if instance.status != "Pass":
#         return

#     station_name = instance.station.station_name if instance.station else ""
    
#     # Find the employee through EvaluationLevel2
#     evaluation = EvaluationLevel2.objects.filter(
#         employee__emp_id=instance.emp_id,
#         station_name=station_name
#     ).last()
    
#     if evaluation and evaluation.employee:
#         level_name = evaluation.level.level_name
#         print(f"\n🔔 [SIGNAL] TraineeInfo saved for {instance.emp_id}")
#         update_skill_matrix_logic(evaluation.employee, station_name, level_name, verbose=True)
#     else:
#         print(f"[SIGNAL] TraineeInfo: No matching evaluation found for {instance.emp_id}")


from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Sum

from .models import (
    EvaluationLevel2,
    TraineeInfo,
    SkillMatrix,
    HierarchyStructure,
    OperatorObservanceSheet,
    Level,
    PoisonCakeTest,
)


# ==========================================================
# CORE LOGIC FUNCTION
# ==========================================================

# def update_skill_matrix_logic(employee, station_name, level_name, verbose=True):

#     if verbose:
#         print("=" * 80)
#         print(f"[SkillMatrix Update] Employee: {employee.emp_id}, "
#               f"Station: {station_name}, Level: {level_name}")

#     # ------------------------------------------------------
#     # STEP 1: OJT CHECK
#     # ------------------------------------------------------
#     trainee_info = TraineeInfo.objects.filter(
#         emp_id=employee.emp_id,
#         station__station_name=station_name
#     ).first()

#     if not trainee_info:
#         if verbose:
#             print("[WARNING] No TraineeInfo found")
#         return

#     ojt_pass = trainee_info.status == "Pass"

#     # ------------------------------------------------------
#     # STEP 2: EVALUATION CHECK
#     # ------------------------------------------------------
#     evaluation = EvaluationLevel2.objects.filter(
#         employee=employee,
#         station_name=station_name,
#         level__level_name=level_name
#     ).last()

#     if not evaluation:
#         if verbose:
#             print("[WARNING] No Evaluation found")
#         return

#     eval_pass = evaluation.status in [
#         EvaluationLevel2.STATUS_PASS,
#         EvaluationLevel2.STATUS_RE_EVAL_PASS
#     ]

#     # ------------------------------------------------------
#     # STEP 3: OBSERVANCE CHECK
#     # ------------------------------------------------------
#     observance = OperatorObservanceSheet.objects.filter(
#         operator_name=f"{employee.first_name} {employee.last_name}",
#         process_name=station_name,
#         level=level_name
#     ).last()

#     if not observance:
#         if verbose:
#             print("[WARNING] No ObservanceSheet found")
#         return

#     observance_pass = observance.result == "Qualified"

#     # ------------------------------------------------------
#     # STEP 4: LEVEL 3 → POISON CAKE CHECK
#     # ------------------------------------------------------
#     level_obj = Level.objects.filter(level_name=level_name).first()
#     poison_pass = True  # Default True for all levels except Level 3

#     if level_obj and level_obj.level_name == "Level 3":

#         poison_test = PoisonCakeTest.objects.filter(
#             operator__emp_id=employee.emp_id,
#             station__station_name=station_name,
#             level__level_name=level_name
#         ).last()

#         if not poison_test:
#             if verbose:
#                 print("[Level 3] No PoisonCakeTest found")
#             return

#         poison_pass = poison_test.test_judgment == "OK"

#         if verbose:
#             print(f"[Level 3] PoisonCakeTest → {poison_test.test_judgment}")

#     # ------------------------------------------------------
#     # FINAL CHECK
#     # ------------------------------------------------------
#     if ojt_pass and eval_pass and observance_pass and poison_pass:

#         hierarchy = HierarchyStructure.objects.filter(
#             station__station_name=station_name
#         ).first()

#         if not hierarchy:
#             if verbose:
#                 print("[ERROR] No HierarchyStructure found")
#             return

#         obj, created = SkillMatrix.objects.update_or_create(
#             employee=employee,
#             hierarchy=hierarchy,
#             defaults={
#                 "employee_name": f"{employee.first_name} {employee.last_name}",
#                 "emp_id": employee.emp_id,
#                 "doj": trainee_info.doj,
#                 "level": level_obj,
#             }
#         )

#         if verbose:
#             print("✅ SkillMatrix CREATED" if created else "🔄 SkillMatrix UPDATED")

#     else:
#         if verbose:
#             print("❌ Conditions NOT met")

#     if verbose:
#         print("=" * 80)



def update_skill_matrix_logic(employee, station_name, level_name, verbose=True):

    if verbose:
        print("=" * 80)
        print(f"[SkillMatrix Update] Employee: {employee.emp_id}, "
              f"Station: {station_name}, Level: {level_name}")

    # Safe name builder
    first_name = (employee.first_name or "").strip()
    last_name = (employee.last_name or "").strip()
    full_name = f"{first_name} {last_name}".strip()  # removes trailing space if no last name

    if verbose:
        print(f"[SkillMatrix Update] Resolved full_name='{full_name}'")

    # ------------------------------------------------------
    # STEP 1: OJT CHECK
    # ------------------------------------------------------
    trainee_info = TraineeInfo.objects.filter(
        emp_id=employee.emp_id,
        station__station_name=station_name
    ).first()

    if not trainee_info:
        if verbose:
            print("[WARNING] No TraineeInfo found")
        return

    ojt_pass = trainee_info.status == "Pass"
    if verbose:
        print(f"[OJT] status={trainee_info.status}, pass={ojt_pass}")

    # ------------------------------------------------------
    # STEP 2: EVALUATION CHECK
    # ------------------------------------------------------
    evaluation = EvaluationLevel2.objects.filter(
        employee=employee,
        station_name=station_name,
        level__level_name=level_name
    ).last()

    if not evaluation:
        if verbose:
            print("[WARNING] No Evaluation found")
        return

    eval_pass = evaluation.status in [
        EvaluationLevel2.STATUS_PASS,
        EvaluationLevel2.STATUS_RE_EVAL_PASS
    ]
    if verbose:
        print(f"[EVAL] status={evaluation.status}, pass={eval_pass}")

    # ------------------------------------------------------
    # STEP 3: OBSERVANCE CHECK
    # ------------------------------------------------------
    # Try full name first, then first name only (for single-name employees)
    observance = (
        OperatorObservanceSheet.objects.filter(
            operator_name__iexact=full_name,
            process_name=station_name,
            level=level_name
        ).last()
        or
        OperatorObservanceSheet.objects.filter(
            operator_name__iexact=first_name,
            process_name=station_name,
            level=level_name
        ).last()
    )

    if not observance:
        if verbose:
            existing = list(
                OperatorObservanceSheet.objects.filter(
                    process_name=station_name,
                    level=level_name
                ).values_list('operator_name', 'result')[:5]
            )
            print(f"[WARNING] No ObservanceSheet found. "
                  f"Tried: '{full_name}' / '{first_name}'. "
                  f"DB has: {existing}")
        return

    observance_pass = observance.result == "Qualified"
    if verbose:
        print(f"[OBSERVANCE] operator='{observance.operator_name}', "
              f"result={observance.result}, pass={observance_pass}")

    # ------------------------------------------------------
    # STEP 4: LEVEL 3 → POISON CAKE CHECK
    # ------------------------------------------------------
    # ------------------------------------------------------
    # STEP 4: POISON CAKE CHECK (if applicable)
    # ------------------------------------------------------
    # level_obj = Level.objects.filter(level_name=level_name).first()
    # poison_pass = True  # Default: no poison test required

    # poison_test = PoisonCakeTest.objects.filter(
    #     operator__emp_id=employee.emp_id,
    #     station__station_name=station_name,
    #     level__level_name=level_name
    # ).last()

    # if poison_test:
    #     # A poison test EXISTS for this employee/station/level → must be OK
    #     poison_pass = poison_test.test_judgment == "OK"
    #     if verbose:
    #         print(f"[POISON] PoisonCakeTest found → judgment={poison_test.test_judgment}, pass={poison_pass}")
    # else:
    #     # No poison test record → not required for this station/level
    #     if verbose:
    #         print(f"[POISON] No PoisonCakeTest for this station/level → skipping (pass=True)")

    # ------------------------------------------------------
    # STEP 4: POISON CAKE CHECK (if station requires it)
    # ------------------------------------------------------
    level_obj = Level.objects.filter(level_name=level_name).first()
    poison_pass = True  # Default: not required

    # Check if this station+level requires a poison test
    # (i.e. any poison test record exists for this station/level, for any employee)
    station_requires_poison = PoisonCakeTest.objects.filter(
        station__station_name=station_name,
        level__level_name=level_name
    ).exists()

    if station_requires_poison:
        # Station requires poison test → check THIS employee's result
        poison_test = PoisonCakeTest.objects.filter(
            operator__emp_id=employee.emp_id,
            station__station_name=station_name,
            level__level_name=level_name
        ).last()

        if not poison_test:
            # Station requires it but employee hasn't done it yet
            poison_pass = False
            if verbose:
                print(f"[POISON] Station requires PoisonCakeTest but none found for {employee.emp_id} → BLOCKED")
        else:
            poison_pass = poison_test.test_judgment == "OK"
            if verbose:
                print(f"[POISON] judgment={poison_test.test_judgment}, pass={poison_pass}")
    else:
        if verbose:
            print(f"[POISON] Station does not require PoisonCakeTest → skipping")
            
    # level_obj = Level.objects.filter(level_name=level_name).first()
    # poison_pass = True

    # if level_obj and level_obj.level_name == "Level 3":
    #     poison_test = PoisonCakeTest.objects.filter(
    #         operator__emp_id=employee.emp_id,
    #         station__station_name=station_name,
    #         level__level_name=level_name
    #     ).last()

    #     if not poison_test:
    #         if verbose:
    #             print("[Level 3] No PoisonCakeTest found")
    #         return

    #     poison_pass = poison_test.test_judgment == "OK"
    #     if verbose:
    #         print(f"[Level 3] PoisonCakeTest → {poison_test.test_judgment}, pass={poison_pass}")

    # ------------------------------------------------------
    # FINAL CHECK
    # ------------------------------------------------------
    if verbose:
        print(f"[FINAL] OJT={ojt_pass}, Eval={eval_pass}, "
              f"Observance={observance_pass}, Poison={poison_pass}")

    if ojt_pass and eval_pass and observance_pass and poison_pass:
        hierarchy = HierarchyStructure.objects.filter(
            station__station_name=station_name
        ).first()

        if not hierarchy:
            if verbose:
                print("[ERROR] No HierarchyStructure found")
            return

        obj, created = SkillMatrix.objects.update_or_create(
            employee=employee,
            hierarchy=hierarchy,
            defaults={
                "employee_name": full_name,  # ✅ uses safe name
                "emp_id": employee.emp_id,
                "doj": trainee_info.doj,
                "level": level_obj,
            }
        )

        if verbose:
            print("✅ SkillMatrix CREATED" if created else "🔄 SkillMatrix UPDATED")
    else:
        if verbose:
            print("❌ Conditions NOT met")

    if verbose:
        print("=" * 80)

# ==========================================================
# SIGNAL 1 → EvaluationLevel2
# ==========================================================

@receiver(post_save, sender=EvaluationLevel2)
def update_skill_matrix_on_evaluation_save(sender, instance, **kwargs):

    if instance.status not in [
        EvaluationLevel2.STATUS_PASS,
        EvaluationLevel2.STATUS_RE_EVAL_PASS
    ]:
        return

    employee = instance.employee
    station_name = instance.station_name.replace("+", " ")
    level_name = instance.level.level_name

    print(f"\n🔔 [SIGNAL] EvaluationLevel2 saved for {employee.emp_id}")

    update_skill_matrix_logic(employee, station_name, level_name, verbose=True)


# ==========================================================
# SIGNAL 2 → OperatorObservanceSheet
# ==========================================================


@receiver(post_save, sender=OperatorObservanceSheet)
def update_skill_matrix_on_observance_save(sender, instance, **kwargs):
    print("\n🔔 [SIGNAL] OperatorObservanceSheet triggered")

    if instance.result != "Qualified":
        return

    operator_name = instance.operator_name.strip()
    station_name = instance.process_name.strip()
    level_name = instance.level.strip()

    print(f"   Looking up: '{operator_name}' | '{station_name}' | '{level_name}'")

    name_parts = operator_name.split()
    first_name = name_parts[0]
    last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""

    # Build query depending on whether last name exists
    if last_name:
        evaluation = EvaluationLevel2.objects.filter(
            employee__first_name__iexact=first_name,
            employee__last_name__iexact=last_name,
            station_name=station_name
        ).first()
    else:
        # Single name — match by first name only
        evaluation = EvaluationLevel2.objects.filter(
            employee__first_name__iexact=first_name,
            station_name=station_name
        ).first()

    # Fallback: try via TraineeInfo
    if not evaluation:
        trainee = TraineeInfo.objects.filter(
            trainee_name__iexact=operator_name,
            station__station_name=station_name
        ).first()
        if trainee:
            evaluation = EvaluationLevel2.objects.filter(
                employee__emp_id=trainee.emp_id,
                station_name=station_name
            ).first()

    if not evaluation or not evaluation.employee:
        print(f"   ❌ No EvaluationLevel2 found for '{operator_name}' at '{station_name}'")
        return

    employee = evaluation.employee
    print(f"   ✅ Found employee: {employee.emp_id}")
    update_skill_matrix_logic(employee, station_name, level_name, verbose=True)
    
# @receiver(post_save, sender=OperatorObservanceSheet)
# def update_skill_matrix_on_observance_save(sender, instance, **kwargs):

#     print("\n🔔 [SIGNAL] OperatorObservanceSheet triggered")

#     if instance.result != "Qualified":
#         return

#     operator_name = instance.operator_name.strip()
#     station_name = instance.process_name.strip()
#     level_name = instance.level.strip()

#     # Find employee via Evaluation
#     name_parts = operator_name.split()
#     if len(name_parts) < 2:
#         return

#     first_name = name_parts[0]
#     last_name = " ".join(name_parts[1:])

#     evaluation = EvaluationLevel2.objects.filter(
#         employee__first_name__iexact=first_name,
#         employee__last_name__iexact=last_name,
#         station_name=station_name
#     ).first()

#     if evaluation and evaluation.employee:
#         employee = evaluation.employee
#         update_skill_matrix_logic(employee, station_name, level_name, verbose=True)


# ==========================================================
# SIGNAL 3 → TraineeInfo
# ==========================================================

@receiver(post_save, sender=TraineeInfo)
def update_skill_matrix_on_trainee_save(sender, instance, **kwargs):

    if instance.status != "Pass":
        return

    station_name = instance.station.station_name if instance.station else ""

    evaluation = EvaluationLevel2.objects.filter(
        employee__emp_id=instance.emp_id,
        station_name=station_name
    ).last()

    if evaluation and evaluation.employee:
        employee = evaluation.employee
        level_name = evaluation.level.level_name

        print(f"\n🔔 [SIGNAL] TraineeInfo saved for {instance.emp_id}")

        update_skill_matrix_logic(employee, station_name, level_name, verbose=True)


# ==========================================================
# SIGNAL 4 → PoisonCakeTest (Level 3 Only)
# ==========================================================

@receiver(post_save, sender=PoisonCakeTest)
def update_skill_matrix_on_poison_test_save(sender, instance, **kwargs):

    print("\n🔔 [SIGNAL] PoisonCakeTest triggered")

    # Only Level 3 requires poison test
    if instance.level.level_name != "Level 3":
        return

    if instance.test_judgment != "OK":
        return

    employee = instance.operator
    station_name = instance.station.station_name
    level_name = instance.level.level_name

    update_skill_matrix_logic(employee, station_name, level_name, verbose=True)



#------------------Biometric Real time----------------------------

import threading
from django.db.models.signals import post_save, post_delete , pre_delete 
from django.dispatch import receiver
from .models import SkillMatrix, BioUser, Machine, BiometricEnrollment, BiometricDevice
from .utils import add_employee_to_specific_device, delete_employee_from_specific_device

# ---------------------------------------------------
# Background Task: Sync Loop
# ---------------------------------------------------
def task_sync_to_multiple_devices(bio_user, machine_list):
    """
    Loops through eligible machines, checks duplication, syncs to device.
    """
    print(f"[Biometric Task] Processing {bio_user.employeeid} for {len(machine_list)} machines...")
    
    processed_device_ids = set() # To handle multiple machines sharing one device

    for machine in machine_list:
        device = machine.biometric_device
        
        # 1. Basic Checks
        if not device: 
            continue
        if device.id in processed_device_ids: 
            continue 

        # 2. DUPLICATE CHECK (Database)
        # Check if this specific user is already enrolled in this specific device
        if BiometricEnrollment.objects.filter(bio_user=bio_user, device=device).exists():
            print(f"[Biometric Task] SKIP: {bio_user.employeeid} already in {device.name}")
            processed_device_ids.add(device.id)
            continue

        # 3. Perform Sync
        success = add_employee_to_specific_device(bio_user, device)
        
        if success:
            # 4. Log Success to prevent future duplicates
            BiometricEnrollment.objects.create(bio_user=bio_user, device=device)
        
        processed_device_ids.add(device.id)

# ---------------------------------------------------
# Signal 1: SkillMatrix Update -> Trigger Sync
# ---------------------------------------------------
@receiver(post_save, sender=SkillMatrix)
def skill_matrix_biometric_trigger(sender, instance, **kwargs):
    try:
        # 1. Validate Data
        emp_skill_station = instance.hierarchy.station 
        emp_level_value = instance.level.level_id if instance.level else 0
        
        if not emp_skill_station or emp_level_value == 0:
            return

        print(f"[Signal] Analyzing requirements for {instance.emp_id} (Lvl {emp_level_value})...")

        # 2. Find Eligible Machines
        # Logic: Machine needs THIS Skill AND Machine Level is <= Employee Level
        eligible_machines = Machine.objects.filter(
            process=emp_skill_station,
            level__lte=emp_level_value,
            biometric_device__isnull=False # Only fetch machines with devices
        ).select_related('biometric_device')

        if not eligible_machines.exists():
            return

        # 3. Get/Create BioUser
        full_name = instance.employee_name or "Unknown"
        name_parts = full_name.strip().split(' ')
        first_name = name_parts[0]
        last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""

        bio_user, _ = BioUser.objects.update_or_create(
            employeeid=instance.emp_id,
            defaults={'first_name': first_name, 'last_name': last_name}
        )

        # 4. Start Background Thread
        machine_list = list(eligible_machines)
        thread = threading.Thread(
            target=task_sync_to_multiple_devices,
            args=(bio_user, machine_list)
        )
        thread.start()

    except Exception as e:
        print(f"[Signal] Critical Error: {e}")

# ---------------------------------------------------
# Signal 2: BioUser Deleted -> Remove from ALL Devices
# ---------------------------------------------------

def task_global_delete(emp_id, device_list):
    """
    Loops through the list of devices we found and sends the delete command.
    """
    if not device_list:
        print("[Biometric Task] No devices found to delete from.")
        return

    # Create a temporary object to mimic the device instance if needed, 
    # but here we passed the actual device objects which are still in memory
    for device in device_list:
        delete_employee_from_specific_device(emp_id, device)

@receiver(pre_delete, sender=BioUser)
def remove_biouser_global(sender, instance, **kwargs):
    print(f"[Signal] Preparing to delete {instance.employeeid} from enrolled devices...")
    
    try:
        # 1. Find all devices this user is enrolled in (BEFORE they are deleted)
        enrollments = BiometricEnrollment.objects.filter(bio_user=instance)
        
        # 2. Extract the device objects into a list
        device_list = list(e.device for e in enrollments)
        
        print(f"[Signal] Found {len(device_list)} devices to clear.")

        # 3. Start background thread
        # We pass the ID string (because instance will be destroyed) 
        # and the list of Device Objects (which persist)
        t = threading.Thread(
            target=task_global_delete, 
            args=(instance.employeeid, device_list)
        )
        t.start()
        
    except Exception as e:
        print(f"[Signal] Error in delete signal: {e}")

    
#----------------Biometric Real Time ----------------------------------------------------




from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import UserRegistration, MasterTable

# ✅ Signal 1: UserRegistration → MasterTable
@receiver(post_save, sender=UserRegistration)
def sync_name_to_master(sender, instance, **kwargs):
    if instance.is_added_to_master and instance.emp_id:
        MasterTable.objects.filter(emp_id=instance.emp_id).update(
            first_name=instance.first_name,
            last_name=instance.last_name
        )

# ✅ Signal 2: MasterTable → UserRegistration
@receiver(post_save, sender=MasterTable)
def sync_name_to_registration(sender, instance, **kwargs):
    UserRegistration.objects.filter(
        emp_id=instance.emp_id,
        is_added_to_master=True
    ).update(
        first_name=instance.first_name,
        last_name=instance.last_name
    )