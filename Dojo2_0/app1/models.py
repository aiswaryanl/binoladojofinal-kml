import datetime
from django.db import models
import os

# Create your models here.
import re
import pandas as pd
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.validators import RegexValidator
import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from rest_framework_simplejwt.tokens import RefreshToken


# ------------------ Role Model ------------------




# ------------------ Management Commands Helper ------------------
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from rest_framework_simplejwt.tokens import RefreshToken


# ------------------ Role Model ------------------
class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Role'
        verbose_name_plural = 'Roles'

    def __str__(self):
        return self.name

    @classmethod
    def get_default_roles(cls):
        """Ensure required default roles exist"""
        default_roles = ['developer', 'management', 'admin', 'instructor', 'operator']
        for role_name in default_roles:
            cls.objects.get_or_create(name=role_name)


# ------------------ Custom User Manager ------------------
class CustomUserManager(BaseUserManager):
    def create_user(self, email, employeeid, first_name, last_name, role, hq, factory, department, password=None):
        if not email:
            raise ValueError("Users must have an email address")

        # Handle role - can be Role instance, role name, or role ID
        if isinstance(role, str):
            role_obj, _ = Role.objects.get_or_create(name=role)
        elif isinstance(role, int):
            role_obj = Role.objects.get(id=role)
        else:
            role_obj = role

        email = self.normalize_email(email)
        user = self.model(
            email=email,
            employeeid=employeeid,
            first_name=first_name,
            last_name=last_name,
            role=role_obj,
            hq=hq,
            factory=factory,
            department=department,
            is_active=True
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, employeeid, first_name, last_name, hq, factory, department, password=None):
        # Ensure admin role exists
        admin_role, _ = Role.objects.get_or_create(name='admin')

        user = self.create_user(
            email=email,
            employeeid=employeeid,
            first_name=first_name,
            last_name=last_name,
            role=admin_role,  # always use admin role for superuser
            hq=hq,
            factory=factory,
            department=department,
            password=password
        )
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save(using=self._db)
        return user



# ------------------ Custom User Model ------------------


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    employeeid = models.CharField(max_length=10, unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    role = models.ForeignKey(Role, on_delete=models.PROTECT, related_name='users')

    hq = models.CharField(max_length=50, blank=True, null=True)
    factory = models.CharField(max_length=50, blank=True, null=True)
    department = models.CharField(max_length=50, blank=True, null=True)

    status = models.BooleanField(default=True)

    # Required Django Fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['employeeid', 'first_name', 'last_name', 'hq', 'factory', 'department']

    objects = CustomUserManager()

    def __str__(self):
        return self.email

    def tokens(self):
        refresh = RefreshToken.for_user(self)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }

    @property
    def role_name(self):
        return self.role.name if self.role else None


# ------------------ Management Commands Helper ------------------
class RoleManager:
    """Helper class to manage roles programmatically"""

    @staticmethod
    def create_roles(custom_roles):
        """
        Create roles dynamically (e.g., per company requirement).
        custom_roles = ['team_lead', 'plant_manager']
        """
        created_roles = []
        for role_name in custom_roles:
            role, created = Role.objects.get_or_create(name=role_name)
            if created:
                created_roles.append(role)
        return created_roles

    @staticmethod
    def get_roles_for_dropdown():
        """Get roles formatted for dropdown/choice fields"""
        roles = Role.objects.filter(is_active=True)
        return [(role.name, role.name) for role in roles]



#models.py

from django.db import models
# ------------------ HQ ------------------
class Hq(models.Model):
    hq_id = models.AutoField(primary_key=True)
    hq_name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.hq_name

    class Meta:
        db_table = 'hq'


# ------------------ Factory ------------------
class Factory(models.Model):
    factory_id = models.AutoField(primary_key=True)
    factory_name = models.CharField(max_length=100)
    hq = models.ForeignKey(Hq, on_delete=models.CASCADE, related_name='factories', null=True, blank=True)

    def __str__(self):
        return f"{self.factory_name} ({self.hq.hq_name if self.hq else 'No HQ'})"

    class Meta:
        db_table = 'factory'
        unique_together = ('factory_name', 'hq')


# ------------------ Department ------------------
class Department(models.Model):
    department_id = models.AutoField(primary_key=True)
    department_name = models.CharField(max_length=100)
    factory = models.ForeignKey(Factory, on_delete=models.CASCADE, related_name='departments', null=True, blank=True)
    hq = models.ForeignKey(Hq, on_delete=models.CASCADE, related_name='departments', null=True, blank=True)


    def __str__(self):
        if self.factory:
            return f"{self.department_name} ({self.factory.factory_name})"
        elif self.hq:
            return f"{self.department_name} ({self.hq.hq_name})"
        return self.department_name

    class Meta:
        db_table = 'department'


# ------------------ Line ------------------
class Line(models.Model):
    line_id = models.AutoField(primary_key=True)
    line_name = models.CharField(max_length=100)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='lines', null=True, blank=True)
    factory = models.ForeignKey(Factory, on_delete=models.CASCADE, related_name='lines', null=True, blank=True)
    hq = models.ForeignKey(Hq, on_delete=models.CASCADE, related_name='lines', null=True, blank=True)


    def __str__(self):
        if self.department:
            return f"{self.line_name} ({self.department.department_name})"
        elif self.factory:
            return f"{self.line_name} ({self.factory.factory_name})"
        elif self.hq:
            return f"{self.line_name} ({self.hq.hq_name})"
        return self.line_name

    class Meta:
        db_table = 'line'


# ------------------ SubLine ------------------
class SubLine(models.Model):
    subline_id = models.AutoField(primary_key=True)
    subline_name = models.CharField(max_length=100)
    line = models.ForeignKey(Line, on_delete=models.CASCADE, related_name='sublines', null=True, blank=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='sublines', null=True, blank=True)
    factory = models.ForeignKey(Factory, on_delete=models.CASCADE, related_name='sublines', null=True, blank=True)
    hq = models.ForeignKey(Hq, on_delete=models.CASCADE, related_name='sublines', null=True, blank=True)

    def __str__(self):
        if self.line:
            return f"{self.subline_name} ({self.line.line_name})"
        elif self.department:
            return f"{self.subline_name} ({self.department.department_name})"
        elif self.factory:
            return f"{self.subline_name} ({self.factory.factory_name})"
        elif self.hq:
            return f"{self.subline_name} ({self.hq.hq_name})"
        return self.subline_name

    class Meta:
        db_table = 'subline'


# ------------------ Station ------------------
class Station(models.Model):
    station_id = models.AutoField(primary_key=True)
    station_name = models.CharField(max_length=100)
    subline = models.ForeignKey(SubLine, on_delete=models.CASCADE, related_name='stations', null=True, blank=True)
    line = models.ForeignKey(Line, on_delete=models.CASCADE, related_name='stations', null=True, blank=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='stations', null=True, blank=True)
    factory = models.ForeignKey(Factory, on_delete=models.CASCADE, related_name='stations', null=True, blank=True)
    hq = models.ForeignKey(Hq, on_delete=models.CASCADE, related_name='stations', null=True, blank=True)

    def __str__(self):
        if self.subline:
            return f"{self.station_name} ({self.subline.subline_name})"
        elif self.line:
            return f"{self.station_name} ({self.line.line_name})"
        elif self.department:
            return f"{self.station_name} ({self.department.department_name})"
        elif self.factory:
            return f"{self.station_name} ({self.factory.factory_name})"
        elif self.hq:
            return f"{self.station_name} ({self.hq.hq_name})"
        return self.station_name

    class Meta:
        db_table = 'station'

        # Add this new model to your existing models.py

class HierarchyStructure(models.Model):
    structure_id = models.AutoField(primary_key=True)
    structure_name = models.CharField(max_length=200)

    # link to HQ and Factory
    hq = models.ForeignKey(Hq, on_delete=models.CASCADE, related_name='hierarchy_structures', null=True, blank=True)
    factory = models.ForeignKey(Factory, on_delete=models.CASCADE, related_name='hierarchy_structures', null=True, blank=True)

    # instead of JSON, store direct relations
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name="hierarchy_structures", null=True, blank=True)
    line = models.ForeignKey(Line, on_delete=models.CASCADE, related_name="hierarchy_structures", null=True, blank=True)
    subline = models.ForeignKey(SubLine, on_delete=models.CASCADE, related_name="hierarchy_structures", null=True, blank=True)
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name="hierarchy_structures", null=True, blank=True)

    def __str__(self):
        # return f"{self.department.department_name}"
        return f"{self.structure_name} {self.department.department_name} ({self.station.station_name})"


    class Meta:
        db_table = "hierarchy_structure"
        
        
# from django.db import models
# from django.core.validators import RegexValidator

# class MasterTable(models.Model):
#     # Choices for sex/gender
#     MALE = 'M'
#     FEMALE = 'F'
#     OTHER = 'O'
#     SEX_CHOICES = [
#         (MALE, 'Male'),
#         (FEMALE, 'Female'),
#         (OTHER, 'Other'),
#     ]

#     emp_id = models.CharField(max_length=20, primary_key=True, unique=True)  # Unique Employee ID
#     first_name = models.CharField(max_length=100, null=True, blank=True)
#     last_name = models.CharField(max_length=100, null=True, blank=True)
#     department = models.ForeignKey(
#         'Department',
#         on_delete=models.SET_NULL,
#         null=True,
#         related_name='employees'
#     )
#     date_of_joining = models.DateField()
#     designation = models.CharField(max_length=100, null=True, blank=True)
#     birth_date = models.DateField(null=True, blank=True)  # ✅ Birth date added
#     sex = models.CharField(max_length=1, choices=SEX_CHOICES, null=True, blank=True)
#     email = models.EmailField(unique=True)
#     phone = models.CharField(
#         max_length=15,
#         unique=True,
#         validators=[RegexValidator(
#             regex=r'^\+?1?\d{9,15}$',
#             message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
#         )]
#     )

#     def __str__(self):
#         return f"{self.first_name} {self.last_name} ({self.emp_id})"


# # models.py
# from django.db import models
# from django.core.validators import RegexValidator

# class MasterTable(models.Model):
#     # ------------------------------------------------------------------ #
#     # 1. Choices
#     # ------------------------------------------------------------------ #
#     MALE = 'M'
#     FEMALE = 'F'
#     OTHER = 'O'
#     SEX_CHOICES = [
#         (MALE, 'Male'),
#         (FEMALE, 'Female'),
#         (OTHER, 'Other'),
#     ]

#     DESIGNATION_CHOICES = [
#         ('', '--- Select Designation ---'),
#         ('CO- DRIVER', 'CO- DRIVER'),
#         ('DRIVER', 'DRIVER'),
#         ('HELPER', 'HELPER'),
#         ('MALI', 'MALI'),
#         ('OPERATOR', 'OPERATOR'),
#         ('PANTRY BOY', 'PANTRY BOY'),
#         ('SUPERVISOR', 'SUPERVISOR'),
#         ('SWEEPER', 'SWEEPER'),
#         ('OET', 'OET'),
#         ('OE', 'OE'),
#         ('Sr.OE', 'Sr.OE'),
#     ]

#     # NEW: Sub-Department Choices (as per your list)
#     SUB_DEPARTMENT_CHOICES = [
#         ('', '--- Select Sub-Department ---'),
#         ('ACTUATOR', 'ACTUATOR'),
#         ('E/MIRROR', 'E/MIRROR'),
#         ('IMM', 'IMM'),
#         ('MIRROR', 'MIRROR'),
#         ('OFF LINE', 'OFF LINE'),
#         ('PAINT SHOP', 'PAINT SHOP'),
#         ('Power Folding', 'Power Folding'),
#         ('IMM PQA', 'IMM PQA'),
#         ('PAINT SHOP PQA', 'PAINT SHOP PQA'),
#         ('E/MIRROR PQA', 'E/MIRROR PQA'),
#         ('OFF LINE PQA', 'OFF LINE PQA'),
#         ('IQC', 'IQC'),
#         ('IFC', 'IFC'),
#         ('QA DISP. PDI', 'QA DISP. PDI'),
#         ('QUALITY ASSURANCE', 'QUALITY ASSURANCE'),
#     ]

#     # ------------------------------------------------------------------ #
#     # 2. Fields – ALL OPTIONAL except emp_id
#     # ------------------------------------------------------------------ #
#     emp_id = models.CharField(
#         max_length=20,
#         primary_key=True,
#         unique=True,
#         help_text="Unique employee code (letters and numbers only)",
#         validators=[
#             RegexValidator(
#                 regex=r'^[A-Za-z0-9]+$',
#                 message="Employee ID must contain only letters and numbers (no spaces or symbols)."
#             )
#         ],
#     )

#     first_name = models.CharField(
#         max_length=100,
#         null=True,
#         blank=True,
#         help_text="Optional"
#     )

#     last_name = models.CharField(
#         max_length=100,
#         null=True,
#         blank=True,
#         default='',
#         help_text="Optional"
#     )

#     department = models.ForeignKey(
#         'Department',
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='employees',
#         help_text="Optional"
#     )

#     # Updated: sub_department now uses choices
#     sub_department = models.CharField(
#         max_length=150,
#         choices=SUB_DEPARTMENT_CHOICES,
#         null=True,
#         blank=True,
#         help_text="Optional – select from predefined sub-departments"
#     )

#     date_of_joining = models.DateField(
#         null=True,
#         blank=True,
#         help_text="Optional – format YYYY-MM-DD"
#     )

#     designation = models.CharField(
#         max_length=100,
#         choices=DESIGNATION_CHOICES,
#         null=True,
#         blank=True,
#         help_text="Optional"
#     )

#     birth_date = models.DateField(
#         null=True,
#         blank=True,
#         help_text="Optional"
#     )

#     sex = models.CharField(
#         max_length=1,
#         choices=SEX_CHOICES,
#         null=True,
#         blank=True,
#         help_text="M / F / O or blank"
#     )

#     email = models.EmailField(
#         null=True,
#         blank=True,
#         help_text="Optional but must be unique if provided"
#     )

#     phone = models.CharField(
#         max_length=15,
#         null=True,
#         blank=True,
#         validators=[
#             RegexValidator(
#                 regex=r'^\+?1?\d{9,15}$',
#                 message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
#             )
#         ],
#         help_text="Optional but must be unique if provided"
#     )

#     # ------------------------------------------------------------------ #
#     # 3. String representation
#     # ------------------------------------------------------------------ #
#     def __str__(self):
#         name = f"{self.first_name or ''} {self.last_name or ''}".strip()
#         return f"{name} ({self.emp_id})" if name else self.emp_id

#     class Meta:
#         verbose_name = "Employee"
#         verbose_name_plural = "Employees"
#         ordering = ['emp_id']





# ------------------------------------------------------------------ #
# # 2. MasterTable – sub_department is now ForeignKey to Line
# # ------------------------------------------------------------------ #
# class MasterTable(models.Model):
#     # ------------------------------------------------------------------ #
#     # 1. Choices
#     # ------------------------------------------------------------------ #
#     MALE = 'M'
#     FEMALE = 'F'
#     OTHER = 'O'
#     SEX_CHOICES = [
#         (MALE, 'Male'),
#         (FEMALE, 'Female'),
#         (OTHER, 'Other'),
#     ]

#     DESIGNATION_CHOICES = [
#         ('', '--- Select Designation ---'),
#         ('CO- DRIVER', 'CO- DRIVER'),
#         ('DRIVER', 'DRIVER'),
#         ('HELPER', 'HELPER'),
#         ('MALI', 'MALI'),
#         ('OPERATOR', 'OPERATOR'),
#         ('PANTRY BOY', 'PANTRY BOY'),
#         ('SUPERVISOR', 'SUPERVISOR'),
#         ('SWEEPER', 'SWEEPER'),
#         ('OET', 'OET'),
#         ('OE', 'OE'),
#         ('Sr.OE', 'Sr.OE'),
#     ]

#     # ------------------------------------------------------------------ #
#     # 2. Fields – ALL OPTIONAL except emp_id
#     # ------------------------------------------------------------------ #
#     emp_id = models.CharField(
#         max_length=20,
#         primary_key=True,
#         unique=True,
#         help_text="Unique employee code (letters and numbers only)",
#         validators=[
#             RegexValidator(
#                 regex=r'^[A-Za-z0-9]+$',
#                 message="Employee ID must contain only letters and numbers (no spaces or symbols)."
#             )
#         ],
#     )

#     first_name = models.CharField(
#         max_length=100,
#         null=True,
#         blank=True,
#         help_text="Optional"
#     )

#     last_name = models.CharField(
#         max_length=100,
#         null=True,
#         blank=True,
#         default='',
#         help_text="Optional"
#     )

#     department = models.ForeignKey(
#         'Department',
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='employees',
#         help_text="Optional"
#     )

#     # -------------------------------------------------------------- #
#     # SUB DEPARTMENT = FOREIGN KEY TO LINE (replaces SUB_DEPARTMENT_CHOICES)
#     # -------------------------------------------------------------- #
#     sub_department = models.ForeignKey(
#         Line,
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='employees',
#         help_text="Optional – select from predefined sub-departments"
#     )

#     date_of_joining = models.DateField(
#         null=True,
#         blank=True,
#         help_text="Optional – format YYYY-MM-DD"
#     )

#     designation = models.CharField(
#         max_length=100,
#         choices=DESIGNATION_CHOICES,
#         null=True,
#         blank=True,
#         help_text="Optional"
#     )

#     birth_date = models.DateField(
#         null=True,
#         blank=True,
#         help_text="Optional"
#     )

#     sex = models.CharField(
#         max_length=1,
#         choices=SEX_CHOICES,
#         null=True,
#         blank=True,
#         help_text="M / F / O or blank"
#     )

#     email = models.EmailField(
#         null=True,
#         blank=True,
#         help_text="Optional but must be unique if provided"
#     )

#     phone = models.CharField(
#         max_length=15,
#         null=True,
#         blank=True,
#         validators=[
#             RegexValidator(
#                 regex=r'^\+?1?\d{9,15}$',
#                 message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
#             )
#         ],
#         help_text="Optional but must be unique if provided"
#     )
    

    
# ------------------------------------------------------------------ #
# 2. MasterTable – sub_department is now ForeignKey to Line
# ------------------------------------------------------------------ #
class MasterTable(models.Model):
    # ------------------------------------------------------------------ #
    # 1. Choices
    # ------------------------------------------------------------------ #
    MALE = 'M'
    FEMALE = 'F'
    OTHER = 'O'
    SEX_CHOICES = [
        (MALE, 'Male'),
        (FEMALE, 'Female'),
        (OTHER, 'Other'),
    ]

    DESIGNATION_CHOICES = [
        ('', '--- Select Designation ---'),
        ('CO- DRIVER', 'CO- DRIVER'),
        ('DRIVER', 'DRIVER'),
        ('HELPER', 'HELPER'),
        ('MALI', 'MALI'),
        ('OPERATOR', 'OPERATOR'),
        ('PANTRY BOY', 'PANTRY BOY'),
        ('SUPERVISOR', 'SUPERVISOR'),
        ('SWEEPER', 'SWEEPER'),
        ('OET', 'OET'),
        ('OE', 'OE'),
        ('Sr.OE', 'Sr.OE'),
    ]

    # ------------------------------------------------------------------ #
    # 2. Fields – ALL OPTIONAL except emp_id
    # ------------------------------------------------------------------ #
    emp_id = models.CharField(
        max_length=20,
        primary_key=True,
        unique=True,
        help_text="Unique employee code (letters and numbers only)",
        validators=[
            RegexValidator(
                regex=r'^[A-Za-z0-9]+$',
                message="Employee ID must contain only letters and numbers (no spaces or symbols)."
            )
        ],
    )

    first_name = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text="Optional"
    )

    last_name = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        default='',
        help_text="Optional"
    )

    department = models.ForeignKey(
        'Department',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employees',
        help_text="Optional"
    )

    # -------------------------------------------------------------- #
    # SUB DEPARTMENT = FOREIGN KEY TO LINE (replaces SUB_DEPARTMENT_CHOICES)
    # -------------------------------------------------------------- #
    sub_department = models.ForeignKey(
        Line,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employees',
        help_text="Optional – select from predefined sub-departments"
    )
    station = models.ForeignKey(
        Station,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employees',
        help_text="Employee's current Station"
    )
   

    date_of_joining = models.DateField(
        null=True,
        blank=True,
        help_text="Optional – format YYYY-MM-DD"
    )

    designation = models.CharField(
        max_length=100,
        choices=DESIGNATION_CHOICES,
        null=True,
        blank=True,
        help_text="Optional"
    )

    birth_date = models.DateField(
        null=True,
        blank=True,
        help_text="Optional"
    )

    sex = models.CharField(
        max_length=1,
        choices=SEX_CHOICES,
        null=True,
        blank=True,
        help_text="M / F / O or blank"
    )

    email = models.EmailField(
        null=True,
        blank=True,
        help_text="Optional but must be unique if provided"
    )

    phone = models.CharField(
        max_length=15,
        null=True,
        blank=True,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
            )
        ],
        help_text="Optional but must be unique if provided"
    )
   
    

    # ------------------------------------------------------------------ #
    # Helper: return sub-department name as string (for templates/admin)
    # ------------------------------------------------------------------ #
    @property
    def sub_department_name(self):
        return self.sub_department.line_name if self.sub_department else ''

    # ------------------------------------------------------------------ #
    # String representation
    # ------------------------------------------------------------------ #
    def __str__(self):
        name = f"{self.first_name or ''} {self.last_name or ''}".strip()
        return f"{name} ({self.emp_id})" if name else self.emp_id

    class Meta:
        verbose_name = "Employee"
        verbose_name_plural = "Employees"
        ordering = ['emp_id']

    

    # ------------------------------------------------------------------ #
    # Helper: return sub-department name as string (for templates/admin)
    # # ------------------------------------------------------------------ #
    # @property
    # def sub_department_name(self):
    #     return self.sub_department.line_name if self.sub_department else ''

    # # ------------------------------------------------------------------ #
    # # String representation
    # # ------------------------------------------------------------------ #
    # def __str__(self):
    #     name = f"{self.first_name or ''} {self.last_name or ''}".strip()
    #     return f"{name} ({self.emp_id})" if name else self.emp_id

    # class Meta:
    #     verbose_name = "Employee"
    #     verbose_name_plural = "Employees"
    #     ordering = ['emp_id']

# ------------------ Level 0 ------------------    

class TrainingBatch(models.Model):
    """ Manages the state of a training batch. """
    batch_id = models.CharField(max_length=20, unique=True, primary_key=True, help_text="e.g., BATCH-070824")
    is_active = models.BooleanField(default=True, help_text="Active batches appear in the attendance dropdown.")
    created_at = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.batch_id

from datetime import datetime
class UserRegistration(models.Model):
    SEX_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]

    EMPLOYMENT_TYPE_CHOICES = [
        ('contractual', 'Contractual'),
        ('permanent', 'Permanent'),
    ]


    first_name = models.CharField(max_length=50, null=True, blank=True)
    last_name = models.CharField(max_length=50, null=True, blank=True)
    temp_id = models.CharField(max_length=50, unique=True, editable=False, blank=True, null=True)
    emp_id = models.CharField(max_length=20, null=True, blank=True)
    batch_id = models.CharField(max_length=20, editable=False, null=True, blank=True )
    email = models.EmailField(blank=True, null=True)
    phone_number = models.CharField(max_length=17)
    sex = models.CharField(max_length=1, choices=SEX_CHOICES, default='M')
    photo = models.ImageField(upload_to='user_images/', null=True, blank=True)
    
    
    aadhar_number = models.CharField(max_length=12, null=True, blank=True, help_text="12-digit Aadhar number")
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPE_CHOICES, null=True, blank=True)
    experience = models.BooleanField(default=False, help_text="Check if you have work experience")
    experience_years = models.PositiveIntegerField(null=True, blank=True, help_text="Number of years of experience")
    company_of_experience = models.CharField(max_length=200, null=True, blank=True, help_text="Previous company name")


    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    is_added_to_master = models.BooleanField(default=False)
    added_to_master_at = models.DateTimeField(null=True, blank=True)


    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.temp_id})"

    def save(self, *args, **kwargs):
        if not self.temp_id:
            self.temp_id = f"TEMP{uuid.uuid4().hex[:12].upper()}"

        if not self.pk:  # assign batch only for new user
            today = timezone.localdate()
            date_str = today.strftime("%d-%m-%Y")

            # Check if today's batch already exists
            today_batch = TrainingBatch.objects.filter(
                batch_id__startswith=f"BATCH-{date_str}-"
            ).first()

            if today_batch:
                # Use today's existing batch
                self.batch_id = today_batch.batch_id

            else:
                # Find the last used batch number across all days
                last_batch = TrainingBatch.objects.order_by('-batch_id').first()

                if last_batch:
                    last_num = int(last_batch.batch_id.split('-')[-1])
                    next_num = last_num + 1
                else:
                    next_num = 1

                # Create new batch for today
                new_batch_id = f"BATCH-{date_str}-{next_num}"
                self.batch_id = new_batch_id

                TrainingBatch.objects.create(
                    batch_id=new_batch_id,
                    is_active=True
                )

        super().save(*args, **kwargs)

    
    def clean(self):
        from django.core.exceptions import ValidationError
        
        if self.experience:
            if not self.experience_years:
                raise ValidationError({'experience_years': 'Experience years is required when experience is selected.'})
            if not self.company_of_experience:
                raise ValidationError({'company_of_experience': 'Company of experience is required when experience is selected.'})
        
        # Validate Aadhar number format if provided
        if self.aadhar_number and len(self.aadhar_number) != 12:
            raise ValidationError({'aadhar_number': 'Aadhar number must be exactly 12 digits.'})







class HumanBodyQuestions(models.Model):
    question_text = models.TextField(unique=True)
    
    
    class Meta:
        ordering = ['id']

    def _str_(self):
        # return f"Q{self.order}: {self.question_text[:50]}..."
        return f"{self.question_text[:50]}..."


class HumanBodyCheckSession(models.Model):
    temp_id = models.CharField(max_length=50)  
    user = models.ForeignKey(UserRegistration, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        
    def save(self, *args, **kwargs):
        # Auto-populate user if not set
        if not self.user and self.temp_id:
            try:
                self.user = UserRegistration.objects.get(temp_id=self.temp_id)
            except UserRegistration.DoesNotExist:
                pass
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Session for {self.temp_id} at {self.created_at.strftime('%Y-%m-%d %H:%M')}"

    @property
    def overall_status(self):
        answers = self.sheet_answers.values_list('answer', flat=True)
        if not answers:
            return 'pending'
        if 'fail' in answers:
            return 'fail'
        if all(ans == 'pass' for ans in answers):
            return 'pass'
        return 'pending'


class HumanBodyCheckSheet(models.Model):
    STATUS_CHOICES = [
        ('pass', 'Pass'),
        ('fail', 'Fail'),
        ('pending', 'Pending'),
    ]
    
    session = models.ForeignKey(HumanBodyCheckSession, on_delete=models.CASCADE, related_name="sheet_answers")
    question = models.ForeignKey(HumanBodyQuestions, on_delete=models.CASCADE)
    answer = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    class Meta:
        unique_together = ('session', 'question')

    def __str__(self):
        return f"{self.session.temp_id} - {self.question.question_text[:30]} - {self.answer}"
    

# ------------------ Level 1 ------------------
class Level(models.Model):
    level_id = models.AutoField(primary_key=True)  # Auto-incrementing PK
    level_name = models.CharField(max_length=100, unique=True)
    

    def __str__(self):
        return f"{self.level_name} "


class Days(models.Model):
    days_id = models.AutoField(primary_key=True)  # Auto-incrementing PK
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name="days")
    day = models.CharField(max_length=15, unique=True)

    def __str__(self):
        return f"Day {self.day} - {self.level.level_name}"
    
    class Meta:
        verbose_name_plural = "Days"  # Proper plural form


class SubTopic(models.Model):
    subtopic_id = models.AutoField(primary_key=True)  # Auto-incrementing PK
    subtopic_name = models.CharField(max_length=255)
    days = models.ForeignKey(Days, on_delete=models.CASCADE, related_name="subtopics")
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name="topics")
    

    def __str__(self):
        return self.subtopic_name



class SubTopicContent(models.Model):
    subtopiccontent_id = models.AutoField(primary_key=True)  # Auto-incrementing PK
    subtopic = models.ForeignKey(SubTopic, on_delete=models.CASCADE, related_name="contents")
    content = models.TextField()

    def __str__(self):
        return f"Content for {self.subtopic.subtopic_name}"

# =========================================start attendance ========================================
class TrainingContent(models.Model):
    trainingcontent_id = models.AutoField(primary_key=True)  # Auto-incrementing PK
    subtopiccontent = models.ForeignKey(SubTopicContent, on_delete=models.CASCADE, related_name="training_contents")
    description = models.CharField(max_length=255, null=True, blank= True)
    training_file = models.FileField(upload_to="training_files/", blank=True, null=True)
    url_link = models.URLField(blank=True, null=True)
    material = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Training for {self.subtopiccontent.subtopic.subtopic_name}"
from django.db import models
from django.utils import timezone

class RescheduledSession(models.Model):
    """
    Stores rescheduled training sessions for employees who were absent.
    """
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.AutoField(primary_key=True)
    employee = models.ForeignKey(
        'UserRegistration', 
        on_delete=models.CASCADE, 
        related_name='rescheduled_sessions'
    )
    batch = models.ForeignKey(
        'TrainingBatch', 
        on_delete=models.CASCADE, 
        related_name='rescheduled_sessions'
    )
    original_day = models.ForeignKey(
        'Days', 
        on_delete=models.CASCADE, 
        related_name='original_absences',
        help_text="The day the employee was originally absent"
    )
    original_date = models.DateField(
        help_text="The original date when employee was absent"
    )
    
    # Rescheduled details
    rescheduled_date = models.DateField()
    rescheduled_time = models.TimeField()
    training_subtopic = models.ForeignKey(
        'SubTopic',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='rescheduled_sessions'
    )
    training_name = models.CharField(
        max_length=255,
        help_text="Name of the training session"
    )
    notes = models.TextField(blank=True, null=True)
    
    # Status tracking
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='scheduled'
    )
    
    # Attendance for rescheduled session
    attendance_marked = models.BooleanField(default=False)
    attendance_status = models.CharField(
        max_length=10,
        choices=[('present', 'Present'), ('absent', 'Absent')],
        null=True,
        blank=True
    )
    attendance_marked_at = models.DateTimeField(null=True, blank=True)
    marked_by = models.CharField(max_length=100, null=True, blank=True)
    attendance_photo = models.ImageField(
    upload_to='rescheduled_attendance_photos/',
    null=True,
    blank=True,
    help_text="Photo taken when marking attendance for rescheduled session"
)
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-rescheduled_date', '-rescheduled_time']
        verbose_name = 'Rescheduled Session'
        verbose_name_plural = 'Rescheduled Sessions'
    
    def __str__(self):
        return f"{self.employee.first_name} - {self.training_name} on {self.rescheduled_date}"
    
    def mark_attendance(self, status, marked_by=None):
        """Helper method to mark attendance for this session"""
        self.attendance_marked = True
        self.attendance_status = status
        self.attendance_marked_at = timezone.now()
        self.marked_by = marked_by
        if status == 'present':
            self.status = 'completed'
        self.save()

        
# =========================================end attendance ========================================


class Evaluation(models.Model):
    evaluation_id = models.AutoField(primary_key=True)  # Auto-incrementing PK
    subtopic = models.ForeignKey(SubTopic, on_delete=models.CASCADE, related_name="evaluations")
    evaluation_text = models.TextField()

    def __str__(self):
        return f"Evaluation for {self.subtopic.subtopic_name}"



class ProductionPlan(models.Model):
    month = models.CharField(max_length=20)
    year = models.PositiveIntegerField()

    hq = models.ForeignKey(Hq, on_delete=models.CASCADE, null=True, blank=True)
    factory = models.ForeignKey(Factory, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, null=True, blank=True)
    line = models.ForeignKey(Line, on_delete=models.CASCADE, null=True, blank=True)
    subline = models.ForeignKey(SubLine, on_delete=models.CASCADE, null=True, blank=True)
    station = models.ForeignKey(Station, on_delete=models.CASCADE, null=True, blank=True)

    total_production_plan = models.PositiveIntegerField()
    total_production_actual = models.PositiveIntegerField(default=0)

    total_operators_required_plan = models.PositiveIntegerField(default=0)
    total_operators_required_actual = models.PositiveIntegerField(default=0)

    # CTQ Plan & Actual
    ctq_plan_l1 = models.PositiveIntegerField(default=0)
    ctq_plan_l2 = models.PositiveIntegerField(default=0)
    ctq_plan_l3 = models.PositiveIntegerField(default=0)
    ctq_plan_l4 = models.PositiveIntegerField(default=0)
    ctq_plan_total = models.PositiveIntegerField(default=0)

    ctq_actual_l1 = models.PositiveIntegerField(default=0)
    ctq_actual_l2 = models.PositiveIntegerField(default=0)
    ctq_actual_l3 = models.PositiveIntegerField(default=0)
    ctq_actual_l4 = models.PositiveIntegerField(default=0)
    ctq_actual_total = models.PositiveIntegerField(default=0)

    # PDI Plan & Actual
    pdi_plan_l1 = models.PositiveIntegerField(default=0)
    pdi_plan_l2 = models.PositiveIntegerField(default=0)
    pdi_plan_l3 = models.PositiveIntegerField(default=0)
    pdi_plan_l4 = models.PositiveIntegerField(default=0)
    pdi_plan_total = models.PositiveIntegerField(default=0)

    pdi_actual_l1 = models.PositiveIntegerField(default=0)
    pdi_actual_l2 = models.PositiveIntegerField(default=0)
    pdi_actual_l3 = models.PositiveIntegerField(default=0)
    pdi_actual_l4 = models.PositiveIntegerField(default=0)
    pdi_actual_total = models.PositiveIntegerField(default=0)

    # OTHER Plan & Actual
    other_plan_l1 = models.PositiveIntegerField(default=0)
    other_plan_l2 = models.PositiveIntegerField(default=0)
    other_plan_l3 = models.PositiveIntegerField(default=0)
    other_plan_l4 = models.PositiveIntegerField(default=0)
    other_plan_total = models.PositiveIntegerField(default=0)

    other_actual_l1 = models.PositiveIntegerField(default=0)
    other_actual_l2 = models.PositiveIntegerField(default=0)
    other_actual_l3 = models.PositiveIntegerField(default=0)
    other_actual_l4 = models.PositiveIntegerField(default=0)
    other_actual_total = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        location = f"{self.hq} > {self.factory}"
        if self.department:
            location += f" > {self.department}"
        if self.line:
            location += f" > {self.line}"
        if self.subline:
            location += f" > {self.subline}"
        if self.station:
            location += f" > {self.station}"
        return f"{self.month} {self.year} - {location}"


class QuestionPaper(models.Model):
    question_paper_id = models.AutoField(primary_key=True)
    question_paper_name = models.CharField(max_length=200)
    department = models.ForeignKey(
        Department, on_delete=models.CASCADE, related_name="question_papers", null=True, blank=True
    )
    line = models.ForeignKey(
        Line, on_delete=models.CASCADE, related_name="question_papers", null=True, blank=True
    )
    subline = models.ForeignKey(
        SubLine, on_delete=models.CASCADE, related_name="question_papers", null=True, blank=True
    )
    station = models.ForeignKey(
        Station, on_delete=models.CASCADE, related_name="question_papers", null=True, blank=True
    )
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name="question_papers")
    file = models.FileField(upload_to="question_papers/", null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.question_paper_name
    

from django.db import models


class StationLevelQuestionPaper(models.Model):
    """Mapping: Assign one QuestionPaper to one Station at one Level under a Department → Line → Subline"""

    department = models.ForeignKey(
        "Department", on_delete=models.CASCADE, related_name="department_questionpapers",null=True, blank=True
    )
    line = models.ForeignKey(
        "Line", on_delete=models.CASCADE, related_name="line_questionpapers",null=True, blank=True
    )
    subline = models.ForeignKey(
        "Subline", on_delete=models.CASCADE, related_name="subline_questionpapers",null=True, blank=True
    )
    station = models.ForeignKey(
        "Station", on_delete=models.CASCADE, related_name="station_questionpapers",null=True, blank=True
    )
    level = models.ForeignKey(
        "Level", on_delete=models.CASCADE, related_name="level_questionpapers"
    )
    question_paper = models.ForeignKey(
        "QuestionPaper", on_delete=models.CASCADE, related_name="assigned_stations"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # unique_together = ("department", "line", "subline", "station", "level")
        verbose_name = "Station-Level Question Paper Mapping"
        verbose_name_plural = "Station-Level Question Paper Mappings"

    def __str__(self):
        return f"{self.department or ''} / {self.line or ''} / {self.subline or ''} / {self.station or ''} / {self.level} → {self.question_paper}"




from django.db import models
from django.core.exceptions import ValidationError
import os
# app1/models.py (or wherever TemplateQuestion lives)

from django.db import models
from django.core.exceptions import ValidationError
from django.db.models import Max

class TemplateQuestion(models.Model):
    question_paper = models.ForeignKey(
        "QuestionPaper",
        on_delete=models.CASCADE,
        related_name="template_questions"
    )

    # --- Language 1 text ---
    question = models.TextField()
    option_a = models.CharField(max_length=255)
    option_a_image = models.ImageField(upload_to='question_images/', blank=True, null=True)
    option_b = models.CharField(max_length=255)
    option_b_image = models.ImageField(upload_to='question_images/', blank=True, null=True)
    option_c = models.CharField(max_length=255)
    option_c_image = models.ImageField(upload_to='question_images/', blank=True, null=True)
    option_d = models.CharField(max_length=255)
    option_d_image = models.ImageField(upload_to='question_images/', blank=True, null=True)

    # --- Language 2 text (optional) ---
    question_lang2 = models.TextField(null=True, blank=True)
    option_a_lang2 = models.CharField(max_length=255, null=True, blank=True)
    option_b_lang2 = models.CharField(max_length=255, null=True, blank=True)
    option_c_lang2 = models.CharField(max_length=255, null=True, blank=True)
    option_d_lang2 = models.CharField(max_length=255, null=True, blank=True)

    # --- Answer info ---
    correct_answer = models.CharField(max_length=255)
    # 0=A, 1=B, 2=C, 3=D
    correct_index = models.PositiveSmallIntegerField(default=0)

    # --- Images ---
    question_image = models.ImageField(upload_to='question_images/', blank=True, null=True)

    # NEW: archive flag
    is_active = models.BooleanField(
        default=True,
        help_text="If false, this question is hidden from normal selection."
    )

    # NEW: display order within a question paper
    order = models.PositiveSmallIntegerField(
        default=0,
        help_text="Display order of this question within its question paper."
    )

    def __str__(self):
        return self.question[:50]

    def clean(self):
        # Ensure correct_answer matches one of the text options
        text_options = [self.option_a, self.option_b, self.option_c, self.option_d]
        if self.correct_answer and self.correct_answer not in text_options:
            raise ValidationError("Correct answer must match one of the text options.")
        
        # Require at least one option with text or image
        if (
            not (self.option_a or self.option_a_image)
            and not (self.option_b or self.option_b_image)
            and not (self.option_c or self.option_c_image)
            and not (self.option_d or self.option_d_image)
        ):
            raise ValidationError("At least one option must have text or an image.")

        # correct_index within 0..3
        if self.correct_index < 0 or self.correct_index > 3:
            raise ValidationError("correct_index must be between 0 and 3.")

    def save(self, *args, **kwargs):
        """
        Auto-assign 'order' if it's 0 or not set.
        This ensures new questions go to the end of the list for that paper.
        """
        if (self.order is None or self.order == 0) and self.question_paper_id:
            max_order = (
                TemplateQuestion.objects
                .filter(question_paper_id=self.question_paper_id)
                .aggregate(Max('order'))['order__max'] or 0
            )
            self.order = max_order + 1

        super().save(*args, **kwargs)

    class Meta:
        ordering = ['order', 'id']
        db_table = 'template_question'
# ======================================================question paper ================================






        
# ------------------ AR/VR ------------------
from django.db import models

class ARVRTrainingContent(models.Model):
    description = models.TextField()
    arvr_file = models.FileField(upload_to='arvr_files/', blank=True, null=True)
    url_link = models.TextField(max_length=500, blank=True, null=True)
    def str(self):
        return f"AR/VR Content - {self.description[:30]}..."


# --------------------------
# Level 2 Process Dojo
# --------------------------

from django.db import models

# class LevelWiseTrainingContent(models.Model):
#     level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name="training_contents")
#     station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name="training_contents")
#     content_name = models.CharField(max_length=200)
#     file = models.FileField(upload_to="training_files/", null=True, blank=True)
#     url = models.URLField(null=True, blank=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def _str_(self):
#         return f"{self.content_name} ({self.level.level_name} - {self.station.station_name})"
    



#=============== hanchou and shokuchou ================#




class HanContent(models.Model):
    title = models.CharField(max_length=100, default='')

    def _str_(self):
        return self.title


# --- NEW MODEL ---
# This is the "Subtopic" that will live under a HanContent.
class HanSubtopic(models.Model):
    title = models.CharField(max_length=150)
    # This links each subtopic to its parent main topic.
    han_content = models.ForeignKey(HanContent, on_delete=models.CASCADE, related_name='subtopics')

    def __str__(self):
        # e.g., "Introduction to Python -> Week 1: Variables"
        return f"{self.han_content.title} -> {self.title}"



class HanTrainingContent(models.Model):
    # This ForeignKey has been CHANGED to point to HanSubtopic.
    han_subtopic = models.ForeignKey(HanSubtopic, on_delete=models.CASCADE, related_name='materials',  null=True)
    description = models.TextField()
    training_file = models.FileField(upload_to='training_files/', blank=True, null=True)
    url_link = models.URLField(max_length=500, blank=True, null=True)

    def __str__(self):
        return f"Material for {self.han_subtopic.title}"
    

    
class ShoContent(models.Model):
    title = models.CharField(max_length=100, default='')

    def _str_(self):
        return self.title



class ShoSubtopic(models.Model):
    title = models.CharField(max_length=150)
    # This links each subtopic to its parent main topic.
    sho_content = models.ForeignKey(ShoContent, on_delete=models.CASCADE, related_name='sho_subtopics')

    def __str__(self):
        # e.g., "Introduction to Python -> Week 1: Variables"
        return f"{self.sho_content.title} -> {self.title}"



class ShoTrainingContent(models.Model):
    sho_subtopic = models.ForeignKey(ShoSubtopic, on_delete=models.CASCADE, related_name='sho_materials',  null=True)
    sho_description = models.TextField()
    training_file = models.FileField(upload_to='training_files/', blank=True, null=True)
    url_link = models.URLField(max_length=500, blank=True, null=True)

    def __str__(self):
        return f"Material for {self.sho_subtopic.title}"




from django.db import models
from django.core.exceptions import ValidationError

class HanchouExamQuestion(models.Model):
    question = models.TextField()
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    correct_answer = models.CharField(max_length=255)

    def __str__(self):
        return self.question[:50]  # show first 50 chars

    def clean(self):
        if self.correct_answer not in [
            self.option_a, self.option_b, self.option_c, self.option_d
        ]:
            raise ValidationError("Correct answer must match one of the options.")

from django.db.models import F, Q

class HanchouExamResult(models.Model):
    employee = models.ForeignKey(MasterTable, on_delete=models.PROTECT, related_name="hanchou_results")
    exam_name = models.CharField(max_length=50, default="hanchou", editable=False)
    started_at = models.DateTimeField()
    submitted_at = models.DateTimeField()
    total_questions = models.PositiveIntegerField()
    score = models.PositiveIntegerField()
    duration_seconds = models.PositiveIntegerField(null=True, blank=True)
    pass_mark_percent = models.PositiveSmallIntegerField(default=70)
    passed = models.BooleanField(default=False)
    remarks = models.CharField(max_length=255, blank=True)

    class Meta:
        constraints = [
            models.CheckConstraint(check=Q(score__lte=F("total_questions")),
                                   name="score_lte_total_questions"),
        ]

    @property
    def percentage(self):
        return 0 if not self.total_questions else round((self.score / self.total_questions) * 100, 2)

    def save(self, *args, **kwargs):
        self.passed = self.percentage >= self.pass_mark_percent
        super().save(*args, **kwargs)


from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import F, Q



class ShokuchouExamQuestion(models.Model):
    sho_question = models.TextField()
    sho_option_a = models.CharField(max_length=255)
    sho_option_b = models.CharField(max_length=255)
    sho_option_c = models.CharField(max_length=255)
    sho_option_d = models.CharField(max_length=255)
    sho_correct_answer = models.CharField(max_length=255)

    def __str__(self):
        return self.sho_question[:50]  # show first 50 chars

    def clean(self):
        if self.sho_correct_answer not in [
            self.sho_option_a,
            self.sho_option_b,
            self.sho_option_c,
            self.sho_option_d,
        ]:
            raise ValidationError("Correct answer must match one of the options.")


class ShokuchouExamResult(models.Model):
    employee = models.ForeignKey(
        MasterTable, on_delete=models.PROTECT, related_name="shokuchou_results"
    )
    sho_exam_name = models.CharField(max_length=50, default="shokuchou", editable=False)
    sho_started_at = models.DateTimeField()
    sho_submitted_at = models.DateTimeField()
    sho_total_questions = models.PositiveIntegerField()
    sho_score = models.PositiveIntegerField()
    sho_duration_seconds = models.PositiveIntegerField(null=True, blank=True)
    sho_pass_mark_percent = models.PositiveSmallIntegerField(default=70)
    sho_passed = models.BooleanField(default=False)
    sho_remarks = models.CharField(max_length=255, blank=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=Q(sho_score__lte=F("sho_total_questions")),
                name="sho_score_lte_total_questions",
            ),
        ]

    @property
    def sho_percentage(self):
        return (
            0
            if not self.sho_total_questions
            else round((self.sho_score / self.sho_total_questions) * 100, 2)
        )

    def save(self, *args, **kwargs):
        self.sho_passed = self.sho_percentage >= self.sho_pass_mark_percent
        super().save(*args, **kwargs)


#=============== Hanchou and Shokuchou END ================#


    
# ================= 10 cycle ==============================#

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from .models import MasterTable, Department, Station, Level

class TenCycleDayConfiguration(models.Model):
    id = models.AutoField(primary_key=True)
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='day_configurations')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='day_configurations')
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='day_configurations', null=True, blank=True)
    day_name = models.CharField(max_length=50)  # e.g., "Day 1"
    sequence_order = models.PositiveIntegerField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('level', 'department', 'station', 'day_name')
        ordering = ['level', 'department', 'station', 'sequence_order']

    def __str__(self):
        return f"{self.level.level_name} - {self.department.department_name} - {self.day_name}"

class TenCycleTopics(models.Model):
    id = models.AutoField(primary_key=True)
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='tencycle_topics')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='tencycle_topics')
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='ten_cycle_topics', null=True, blank=True)
    slno = models.PositiveIntegerField()
    cycle_topics = models.CharField(max_length=200)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('level', 'department', 'station', 'slno')
        ordering = ['level', 'department', 'station', 'slno']

    def __str__(self):
        return f"{self.level.level_name} - {self.cycle_topics}"

class TenCycleSubTopic(models.Model):
    id = models.AutoField(primary_key=True)
    topic = models.ForeignKey(TenCycleTopics, on_delete=models.CASCADE, related_name='subtopics')
    sub_topic = models.CharField(max_length=200)
    score_required = models.PositiveIntegerField(default=1)  
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('topic', 'sub_topic')
        ordering = ['topic', 'id']

    def __str__(self):
        return f"{self.topic.cycle_topics} - {self.sub_topic}"

class TenCyclePassingCriteria(models.Model):
    id = models.AutoField(primary_key=True)
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='ten_cycle_passing_criteria')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='ten_cycle_passing_criteria')
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='ten_cycle_passing_criteria', null=True, blank=True)
    passing_percentage = models.FloatField(
        default=60.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        help_text="Minimum percentage required to pass"
    )
    created_by = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('level', 'department', 'station')

    def __str__(self):
        return f"{self.level.level_name} - {self.department.department_name} ({self.passing_percentage}%)"

class OperatorPerformanceEvaluation(models.Model):
    id = models.AutoField(primary_key=True)
    employee = models.ForeignKey(MasterTable, on_delete=models.CASCADE, related_name='performance_evaluations')
    date = models.DateField()
    shift = models.CharField(max_length=20,null=True, blank=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='evaluations')
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='evaluations')
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='evaluations')
    line = models.CharField(max_length=100, null=True,blank=True)
    # process_name = models.CharField(max_length=100,null)
    operation_no = models.CharField(max_length=50,null=True,blank=True)
    date_of_retraining_completed = models.DateField(null=True, blank=True)
    prepared_by = models.CharField(max_length=100, null=True, blank=True)
    checked_by = models.CharField(max_length=100, null=True, blank=True)
    approved_by = models.CharField(max_length=100, null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    final_percentage = models.FloatField(null=True, blank=True)
    final_status = models.CharField(max_length=30, choices=[
        ('Pass', 'Pass'),
        ('Fail - Retraining Required', 'Fail - Retraining Required'),
        ('Not Evaluated', 'Not Evaluated')
    ], default='Not Evaluated')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.employee.emp_id}"

class EvaluationSubTopicMarks(models.Model):
    id = models.AutoField(primary_key=True)
    employee = models.ForeignKey(OperatorPerformanceEvaluation, on_delete=models.CASCADE, related_name='subtopic_marks')
    subtopic = models.ForeignKey(TenCycleSubTopic, on_delete=models.CASCADE, related_name='subtopic_marks')
    day = models.ForeignKey(TenCycleDayConfiguration, on_delete=models.CASCADE, related_name='subtopic_marks')
    
    # Marks for each day/cycle
    mark_1 = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    mark_2 = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    mark_3 = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    mark_4 = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    mark_5 = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    mark_6 = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    mark_7 = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    mark_8 = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    mark_9 = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    mark_10 = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])

    total_score = models.IntegerField(null=True, blank=True)
    max_possible_score = models.IntegerField(null=True, blank=True)

    class Meta:
        unique_together = ('employee', 'subtopic', 'day')

    def save(self, *args, **kwargs):
        marks = [
            self.mark_1, self.mark_2, self.mark_3, self.mark_4, self.mark_5,
            self.mark_6, self.mark_7, self.mark_8, self.mark_9, self.mark_10
        ]

        # Validate marks don't exceed subtopic's score_required
        for mark in marks:
            if mark is not None and mark > self.subtopic.score_required:
                raise ValueError(f"Mark {mark} exceeds maximum allowed score {self.subtopic.score_required}")

        valid_marks = [mark for mark in marks if mark is not None]
        self.total_score = sum(valid_marks) if valid_marks else 0
        self.max_possible_score = 10 * self.subtopic.score_required

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.subtopic.topic.cycle_topics} - {self.subtopic.sub_topic} - {self.day.day_name}"

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

@receiver([post_save, post_delete], sender=EvaluationSubTopicMarks)
def update_operator_evaluation_summary(sender, instance, **kwargs):
    evaluation = instance.employee  # OperatorPerformanceEvaluation instance

    # Get all relevant day IDs for this evaluation config
    days = TenCycleDayConfiguration.objects.filter(
        level=evaluation.level,
        department=evaluation.department,
        station=evaluation.station,
        is_active=True
    )
    day_ids = list(days.values_list('id', flat=True))

    # Get all active subtopic IDs for this evaluation config
    topics = TenCycleTopics.objects.filter(
        level=evaluation.level,
        department=evaluation.department,
        station=evaluation.station,
        is_active=True
    )
    subtopic_ids = list(
        TenCycleSubTopic.objects.filter(
            topic__in=topics,
            is_active=True
        ).values_list('id', flat=True)
    )

    # Check completeness: count expected entries
    expected_count = len(day_ids) * len(subtopic_ids)

    # Count actual Evaluation marks for the evaluation
    actual_count = EvaluationSubTopicMarks.objects.filter(
        employee=evaluation,
        day_id__in=day_ids,
        subtopic_id__in=subtopic_ids
    ).count()

    # Aggregate total score and max score across all marks
    all_marks = EvaluationSubTopicMarks.objects.filter(employee=evaluation)
    total_score = sum(m.total_score or 0 for m in all_marks)
    total_max_score = sum(m.max_possible_score or 0 for m in all_marks)

    percentage = (total_score / total_max_score) * 100 if total_max_score > 0 else 0.0

    # Get passing criteria (with fallback)
    try:
        passing_criteria = TenCyclePassingCriteria.objects.get(
            level=evaluation.level,
            department=evaluation.department,
            station=evaluation.station,
            is_active=True
        )
        passing_percentage = passing_criteria.passing_percentage
    except TenCyclePassingCriteria.DoesNotExist:
        passing_percentage = 60.0

    # Determine final status
    if total_max_score == 0:
        final_status = 'Not Evaluated'
    else:
        final_status = 'Pass' if percentage >= passing_percentage else 'Fail - Retraining Required'

    # Determine if evaluation is complete: all marks exist for all days * all subtopics
    is_complete = (expected_count > 0) and (actual_count == expected_count)

    # Update evaluation model fields
    evaluation.final_percentage = round(percentage, 2)
    evaluation.final_status = final_status
    evaluation.is_completed = is_complete
    evaluation.save(update_fields=['final_percentage', 'final_status', 'is_completed'])

    
# =========================== 10 cycle ============================ #


#OJT models


# ------------------ OJT Topic ------------------
# ------------------ OJT Topic ------------------
class OJTTopic(models.Model):
    department = models.ForeignKey("Department", on_delete=models.CASCADE, related_name="ojt_topics")
    level = models.ForeignKey("Level", on_delete=models.CASCADE, related_name="ojt_topics")
    sl_no = models.PositiveIntegerField()
    topic = models.CharField(max_length=200)
    category = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.sl_no}. {self.topic} ({self.department.department_name} - {self.level.level_name})"


# ------------------ Trainee Info ------------------

# class TraineeInfo(models.Model):
#     trainee_name = models.CharField(max_length=100)
#     trainer_id = models.CharField(max_length=50)
#     emp_id = models.CharField(max_length=50,null=True, blank=True,)
#     line = models.CharField(max_length=100)
#     subline = models.CharField(max_length=100)
#     station = models.CharField(max_length=100)
#     process_name = models.CharField(max_length=100)
#     revision_date = models.DateField()
#     doj = models.DateField()
#     trainer_name = models.CharField(max_length=100)
#     status = models.CharField(max_length=50, default="Pending")

#     def str(self):
#         return f"{self.trainee_name} ({self.emp_id})"


from django.db import models

class TraineeInfo(models.Model):
    trainee_name = models.CharField(max_length=100)
    trainer_id = models.CharField(max_length=50)
    emp_id = models.CharField(max_length=50, null=True, blank=True)
    line = models.CharField(max_length=100)
    subline = models.CharField(max_length=100)
    station = models.ForeignKey('Station', on_delete=models.CASCADE, related_name='trainees')
    process_name = models.CharField(max_length=100)
    revision_date = models.DateField()
    doj = models.DateField()
    trainer_name = models.CharField(max_length=100)
    status = models.CharField(max_length=50, default="Pending")
    level = models.ForeignKey('Level', on_delete=models.CASCADE, related_name='trainees')

    def __str__(self):
        return f"{self.trainee_name} ({self.emp_id}) - Level {self.level.pk}"

    class Meta:
        unique_together = ('emp_id', 'station', 'level')  # Critical: one record per emp-station-level
        verbose_name = "Trainee Info"
        verbose_name_plural = "Trainee Info"





# ------------------ OJT Days ------------------
class OJTDay(models.Model):
    department = models.ForeignKey("Department", on_delete=models.CASCADE, related_name="ojt_days")
    level = models.ForeignKey("Level", on_delete=models.CASCADE, related_name="ojt_days")
    name = models.CharField(max_length=100)

    def str(self):
        return f"{self.name} ({self.department.department_name} - {self.level.level_name})"


# ------------------ OJT Score  ------------------

# from django.core.exceptions import ValidationError
# from django.db import models


# class OJTScore(models.Model):
#     topic = models.ForeignKey('OJTTopic', on_delete=models.CASCADE, related_name="scores")
#     day = models.ForeignKey('OJTDay', on_delete=models.CASCADE, related_name="scores")
#     trainee = models.ForeignKey('TraineeInfo', on_delete=models.CASCADE, related_name="scores")
#     score = models.PositiveIntegerField()

#     def clean(self):
#         """Validate score is within allowed range."""
#         department = self.topic.department
#         level = self.topic.level

#         try:
#             score_range = OJTScoreRange.objects.get(department=department, level=level)
#         except OJTScoreRange.DoesNotExist:
#             raise ValidationError({
#                 "score": f"No score range defined for {department.department_name} - {level.level_name}."
#             })

#         if not (score_range.min_score <= self.score <= score_range.max_score):
#             raise ValidationError({
#                 "score": f"Score must be between {score_range.min_score} and {score_range.max_score} "
#                          f"for {department.department_name} - {level.level_name}."
#             })

#     def save(self, *args, **kwargs):
#         self.full_clean()  # ensure validation before saving
#         super().save(*args, **kwargs)

#     def _str_(self):
#         return f"{self.trainee.trainee_name} - {self.topic.topic} - {self.day.name} : {self.score}"


# ------------------ OJT Score Range------------------

class OJTScoreRange(models.Model):
    department = models.ForeignKey("Department", on_delete=models.CASCADE, related_name="score_ranges")
    level = models.ForeignKey("Level", on_delete=models.CASCADE, related_name="score_ranges")
    min_score = models.PositiveIntegerField(default=0)
    max_score = models.PositiveIntegerField()

    class Meta:
        unique_together = ("department", "level")  # prevent duplicate ranges

    def str(self):
        return f"{self.department.department_name} - {self.level.level_name}: {self.min_score} to {self.max_score}"

from django.core.exceptions import ValidationError

class OJTScore(models.Model):
    topic = models.ForeignKey(OJTTopic, on_delete=models.CASCADE, related_name="scores")
    day = models.ForeignKey(OJTDay, on_delete=models.CASCADE, related_name="scores")
    trainee = models.ForeignKey(TraineeInfo, on_delete=models.CASCADE, related_name="scores")
    score = models.PositiveIntegerField()

    def clean(self):
        department = self.topic.department
        level = self.topic.level

        # ✅ CHANGE 1: Use filter().first() instead of get() 
        # This prevents crashes if you accidentally created multiple ranges
        score_range = OJTScoreRange.objects.filter(department=department, level=level).first()

        if not score_range:
            raise ValidationError({
                "score": f"No score range defined for {department.department_name} - {level.level_name}."
            })

        # ✅ CHANGE 2: Special Logic for Tick/Cross (Binary)
        # If Max Score is 1, we assume it's a Tick/Cross system.
        # We MUST allow 0 (Cross/Fail) even if the DB says Min Score is 1.
        if score_range.max_score == 1:
            if self.score not in [0, 1]:
                raise ValidationError({
                    "score": "For Tick/Cross criteria, score must be 0 (Fail) or 1 (Pass)."
                })
        else:
            # ✅ Standard Logic for Numeric Ranges (e.g., 1-10)
            if not (score_range.min_score <= self.score <= score_range.max_score):
                raise ValidationError({
                    "score": f"Score must be between {score_range.min_score} and {score_range.max_score} "
                             f"for {department.department_name} - {level.level_name}."
                })

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.trainee.trainee_name} - {self.topic.topic} - Day {self.day.name} : {self.score}"
    

# ------------------ OJT Score Criteria ------------------

class OJTPassingCriteria(models.Model):
    department = models.ForeignKey("Department", on_delete=models.CASCADE, related_name="ojt_passing_criteria")
    level = models.ForeignKey("Level", on_delete=models.CASCADE, related_name="ojt_passing_criteria")
    day = models.ForeignKey("OJTDay", on_delete=models.CASCADE, null=True, blank=True, related_name="ojt_passing_criteria")
    # If day is NULL, it means criteria applies to ALL days in that dept+level
    percentage = models.FloatField(help_text="Passing percentage (e.g., 60 for 60%)")

    class Meta:
        unique_together = ("department", "level", "day")  # avoid duplicates

    def str(self):
        if self.day:
            return f"{self.department.department_name} - {self.level.level_name} - {self.day.name}: {self.percentage}%"
        return f"{self.department.department_name} - {self.level.level_name} (All Days): {self.percentage}%"
    
#-----------------------Quantity OJT ----------------------------#

from django.db import models


class QuantityOJTScoreRange(models.Model):
    department = models.ForeignKey("Department", on_delete=models.CASCADE, related_name="quantity_score_ranges",default="")
    level = models.ForeignKey("Level", on_delete=models.CASCADE, related_name="quantity_score_ranges",default="")

    # Production Score Range
    production_min_score = models.DecimalField(max_digits=5, decimal_places=2)
    production_max_score = models.DecimalField(max_digits=5, decimal_places=2)

    # Rejection Score Range
    rejection_min_score = models.DecimalField(max_digits=5, decimal_places=2)
    rejection_max_score = models.DecimalField(max_digits=5, decimal_places=2)

    def _str_(self):
        return f"[{self.department.name} - {self.level.name}] Production: {self.production_min_score}-{self.production_max_score}, Rejection: {self.rejection_min_score}-{self.rejection_max_score}"



class QuantityPassingCriteria(models.Model):
    department = models.ForeignKey("Department", on_delete=models.CASCADE, related_name="quantity_passing_criteria",default="")
    level = models.ForeignKey("Level", on_delete=models.CASCADE, related_name="quantity_passing_criteria",default="")

    production_passing_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    rejection_passing_percentage = models.DecimalField(max_digits=5, decimal_places=2)

    def _str_(self):
        return f"[{self.department.name} - {self.level.name}] Production Passing: {self.production_passing_percentage}%, Rejection Passing: {self.rejection_passing_percentage}%"


class OJTLevel2Quantity(models.Model):
    level = models.ForeignKey("Level", on_delete=models.CASCADE, related_name="ojt_records")
    trainee_name = models.CharField(max_length=200)
    trainee_id = models.CharField(max_length=50, unique=True)
    emp_id = models.CharField(max_length=50, blank=True, null=True)
    station_name = models.CharField(max_length=100)
    line_name = models.CharField(max_length=100,null=True, blank=True)
    process_name = models.CharField(max_length=200,null=True, blank=True)
    revision_date = models.DateField()
    doj = models.DateField(verbose_name="Date of Joining")
    trainer_name = models.CharField(max_length=200)
    engineer_judge = models.CharField(max_length=200, blank=True, null=True)
    status = models.CharField(max_length=50, default="Pending")

    def _str_(self):
        return f"{self.trainee_name} ({self.trainee_id})"

    @property
    def production_total(self):
        """Sum of production marks across all evaluations"""
        return sum(e.production_marks for e in self.evaluations.all())

    @property
    def rejection_total(self):
        """Sum of rejection marks across all evaluations"""
        return sum(e.rejection_marks for e in self.evaluations.all())

    def evaluate_status(self):
        """Check trainee Pass/Fail based on passing criteria"""
        criteria = QuantityPassingCriteria.objects.filter(
            level=self.level
        ).first()

        if not criteria:
            return  # No criteria defined

        days = self.evaluations.count()

        # Max possible scores (from setup)
        prod_max_rule = QuantityScoreSetup.objects.filter(
            level=self.level,
            score_type="production"
        ).order_by("-marks").first()

        rej_max_rule = QuantityScoreSetup.objects.filter(
            level=self.level,
            score_type="rejection"
        ).order_by("-marks").first()

        if not prod_max_rule or not rej_max_rule:
            return

        production_max_total = days * prod_max_rule.marks
        rejection_max_total = days * rej_max_rule.marks

        required_production = (criteria.production_passing_percentage / 100) * production_max_total
        required_rejection = (criteria.rejection_passing_percentage / 100) * rejection_max_total

        if self.production_total >= required_production and self.rejection_total >= required_rejection:
            self.status = "Pass"
        else:
            self.status = "Fail"

        self.save()



# ---------------------------
#   Daily Evaluation
# ---------------------------
class Level2QuantityOJTEvaluation(models.Model):
    ojt_record = models.ForeignKey(
        OJTLevel2Quantity,
        on_delete=models.CASCADE,
        related_name="evaluations"
    )
    day = models.PositiveIntegerField()
    date = models.DateField()
    plan = models.PositiveIntegerField()
    production_actual = models.PositiveIntegerField()
    production_marks = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    rejection_marks = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    number_of_rejections = models.PositiveIntegerField()

    def _str_(self):
        return f"Day {self.day} - {self.ojt_record.trainee_name} ({self.date})"

    @property
    def percentage(self):
        """% of production achieved against plan"""
        if self.plan > 0:
            return (self.production_actual / self.plan) * 100
        return 0

    def calculate_production_marks(self):
        pct = self.percentage
        rule = QuantityScoreSetup.objects.filter(
            score_type="production",
            min_value__lte=pct,
            max_value__gte=pct,
            level=self.ojt_record.level
        ).first()
        return rule.marks if rule else 0

    def calculate_rejection_marks(self):
        rejections = self.number_of_rejections
        rule = QuantityScoreSetup.objects.filter(
            score_type="rejection",
            min_value__lte=rejections,
            max_value__gte=rejections,
            level=self.ojt_record.level
        ).first()
        return rule.marks if rule else 0

    def save(self, *args, **kwargs):
        # Auto-calculate marks before saving
        self.production_marks = self.calculate_production_marks()
        self.rejection_marks = self.calculate_rejection_marks()
        super().save(*args, **kwargs)




# ==================== Refreshment Training ======================== #

# class RecurrenceInterval(models.Model):
#     """
#     Model to store recurrence interval for automatic scheduling
#     This applies globally to all training categories
#     """
#     interval_months = models.IntegerField(
#         help_text="Interval in months for automatic rescheduling (e.g., 3 or 6)"
#     )
#     is_active = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         ordering = ['-created_at']

#     def __str__(self):
#         return f"{self.interval_months} months interval"
    
class Training_category(models.Model):
    name = models.CharField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Curriculum(models.Model):
    category = models.ForeignKey(
        Training_category, on_delete=models.CASCADE, related_name='topics')
    topic = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("category", "topic")
        ordering = ["topic"]

    def __str__(self):
        return f"{self.category.name} > {self.topic}"


class CurriculumContent(models.Model):
    CONTENT_TYPE_CHOICES = [
        ('document', 'Document'),
        ('image', 'Image'),
        ('link', 'Link'),
    ]

    curriculum = models.ForeignKey(
        'Curriculum', on_delete=models.CASCADE, related_name='contents')
    content_name = models.CharField(max_length=200)
    content_type = models.CharField(
        max_length=10, choices=CONTENT_TYPE_CHOICES)

    file = models.FileField(
        upload_to='training_contents/', null=True, blank=True)
    link = models.URLField(null=True, blank=True)

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.content_name


class Trainer_name(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Venues(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


# class Schedule(models.Model):
#     STATUS_CHOICES = [
#         ('scheduled', 'Scheduled'),
#         ('completed', 'Completed'),
#         ('cancelled', 'Cancelled'),
#         ('pending', 'Pending'),
#     ]

#     training_category = models.ForeignKey(
#         Training_category, on_delete=models.CASCADE, related_name='scheduled_categories')
#     training_name = models.ForeignKey(
#         Curriculum, on_delete=models.CASCADE, related_name='scheduled_topics')

#     trainer = models.ForeignKey(
#         Trainer_name, on_delete=models.SET_NULL, null=True)
#     venue = models.ForeignKey(Venues, on_delete=models.SET_NULL, null=True)

#     status = models.CharField(
#         max_length=20, choices=STATUS_CHOICES, default='Scheduled')
#     date = models.DateField()
#     time = models.TimeField()

#     employees = models.ManyToManyField(
#         "MasterTable", related_name='schedules')
#     recurrence_interval = models.ForeignKey(
#         RecurrenceInterval, 
#         on_delete=models.SET_NULL, 
#         null=True, 
#         blank=True,
#         related_name='schedules',
#         help_text="Recurrence interval for this schedule"
#     )
#     is_recurring = models.BooleanField(
#         default=False,
#         help_text="Whether this schedule should automatically recur"
#     )
#     parent_schedule = models.ForeignKey(
#         'self',
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='recurring_schedules',
#         help_text="Original schedule if this is a recurring instance"
#     )
#     recurring_schedule_created = models.BooleanField(
#         default=False,
#         help_text="Flag to track if recurring schedule has been created"
#     )
#     completed_date = models.DateField(
#         null=True,
#         blank=True,
#         help_text="Date when training was marked as completed"
#     )

#     def __str__(self):
#         return f"{self.training_name.topic} on {self.date}"
    
# Remove or comment out the RecurrenceInterval model entirely
# We'll store the interval directly in the Schedule model

class Schedule(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('pending', 'Pending'),
    ]

    training_category = models.ForeignKey(
        'Training_category', on_delete=models.CASCADE, related_name='scheduled_categories')
    
    # CHANGED: Now supports multiple topics per schedule
    topics = models.ManyToManyField(
        'Curriculum', related_name='scheduled_sessions')

    trainer = models.ForeignKey(
        'Trainer_name', on_delete=models.SET_NULL, null=True)
    venue = models.ForeignKey('Venues', on_delete=models.SET_NULL, null=True)

    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='Scheduled')
    date = models.DateField()
    time = models.TimeField()

    employees = models.ManyToManyField(
        "MasterTable", related_name='schedules')
    
    recurrence_months = models.IntegerField(
        null=True,
        blank=True,
        help_text="Number of months for recurrence (1-10). Null means no recurrence."
    )
    
    is_recurring = models.BooleanField(
        default=False,
        help_text="Whether this schedule should automatically recur"
    )
    
    parent_schedule = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recurring_schedules',
        help_text="Original schedule if this is a recurring instance"
    )
    
    recurring_schedule_created = models.BooleanField(
        default=False,
        help_text="Flag to track if recurring schedule has been created"
    )
    
    completed_date = models.DateField(
        null=True,
        blank=True,
        help_text="Date when training was marked as completed"
    )
    
    next_training_date_override = models.DateField(
        null=True,
        blank=True,
        help_text="Manually set next training date (overrides calculated date)"
    )
    
    # 0 = Scheduled, 1 = Pre, 2 = Content, 3 = Post, 4 = Completed
    training_stage = models.IntegerField(default=0, help_text="Current stage of the training flow")

    def __str__(self):
        return f"{self.training_category.name} Session on {self.date}"
    
    def get_next_training_date(self):
        if self.next_training_date_override:
            return self.next_training_date_override
        if self.is_recurring and self.recurrence_months and self.completed_date:
            from dateutil.relativedelta import relativedelta
            return self.date + relativedelta(months=self.recurrence_months)
        return None
    
    def get_next_creation_date(self):
        next_date = self.get_next_training_date()
        if next_date:
            from datetime import timedelta
            return next_date - timedelta(days=7)
        return None

class EmployeeAttendance(models.Model):
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('rescheduled', 'Rescheduled'),
        ('pending', 'Pending'), # NEW: For reset state
    ]

    schedule = models.ForeignKey(
        Schedule, on_delete=models.CASCADE, related_name='attendances')
    employee = models.ForeignKey(
        'MasterTable', on_delete=models.CASCADE, related_name='attendances')
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='present')
    notes = models.TextField(blank=True, null=True)

    # For rescheduling
    reschedule_date = models.DateField(blank=True, null=True)
    reschedule_time = models.TimeField(blank=True, null=True)
    reschedule_reason = models.TextField(blank=True, null=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('schedule', 'employee')

    def __str__(self):
        return f"{self.employee} - {self.schedule} - {self.status}"


class RescheduleLog(models.Model):
    schedule = models.ForeignKey(
        Schedule, on_delete=models.CASCADE, related_name='reschedule_logs')
    employee = models.ForeignKey(
        'MasterTable', on_delete=models.CASCADE, related_name='reschedule_logs')
    original_date = models.DateField()
    original_time = models.TimeField()
    new_date = models.DateField()
    new_time = models.TimeField()
    reason = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Reschedule for {self.employee} on {self.schedule}"

    # new model 

class RescheduleHistory(models.Model):
    """
    Track the complete history of an employee's training journey
    from original schedule through reschedule to final attendance
    """
    employee = models.ForeignKey(
        'MasterTable', on_delete=models.CASCADE, related_name='reschedule_history'
    )
    original_schedule = models.ForeignKey(
        Schedule, on_delete=models.CASCADE, related_name='original_histories'
    )
    
    # Original training details
    original_date = models.DateField()
    original_time = models.TimeField()
    original_venue = models.CharField(max_length=200, blank=True, null=True)
    original_trainer = models.CharField(max_length=200, blank=True, null=True)
    original_status = models.CharField(
        max_length=20,
        choices=[('absent', 'Absent'), ('rescheduled', 'Rescheduled')],
        help_text="Original attendance status (absent or rescheduled)"
    )
    
    # Rescheduled training details
    rescheduled_date = models.DateField()
    rescheduled_time = models.TimeField()
    reschedule_reason = models.TextField()
    
    # Final attendance status
    final_status = models.CharField(
        max_length=20,
        choices=[('present', 'Present'), ('absent', 'Absent'), ('pending', 'Pending')],
        default='pending',
        help_text="Final attendance status after reschedule"
    )
    final_attendance_marked_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Reschedule Histories'

    def __str__(self):
        return f"{self.employee} - {self.original_schedule.training_name.topic} - {self.final_status}"
    

from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone

class RefresherQuestionBank(models.Model):
    # CHANGED: Now linked to Category, not Topic
    category = models.OneToOneField(
        'Training_category',
        on_delete=models.CASCADE,
        related_name='refresher_question_bank'
    )
    passing_score = models.PositiveSmallIntegerField(default=70, help_text="Percentage required to pass")
    time_limit_minutes = models.PositiveSmallIntegerField(default=30, help_text="Time for Pre & Post Test")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"QB: {self.category.name}"

    class Meta:
        verbose_name = "Refresher Question Bank"
        verbose_name_plural = "Refresher Question Banks"

class RefresherQuestion(models.Model):
    bank = models.ForeignKey(
        RefresherQuestionBank,
        on_delete=models.CASCADE,
        related_name='questions'
    )
    question_text = models.TextField(blank=True)
    question_image = models.ImageField(
        upload_to='refresher/questions/',
        null=True,
        blank=True
    )

    option_a = models.CharField(max_length=500, blank=True)
    option_b = models.CharField(max_length=500, blank=True)
    option_c = models.CharField(max_length=500, blank=True)
    option_d = models.CharField(max_length=500, blank=True)

    option_a_image = models.ImageField(upload_to='refresher/options/', null=True, blank=True)
    option_b_image = models.ImageField(upload_to='refresher/options/', null=True, blank=True)
    option_c_image = models.ImageField(upload_to='refresher/options/', null=True, blank=True)
    option_d_image = models.ImageField(upload_to='refresher/options/', null=True, blank=True)

    correct_answer = models.CharField(
        max_length=1,
        choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')],
        help_text="Correct option"
    )
    marks = models.PositiveSmallIntegerField(default=1)
    order = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True, help_text="If False, this question won't appear in new tests")

    class Meta:
        ordering = ['order']
        verbose_name = "Refresher Question"
        verbose_name_plural = "Refresher Questions"

    def __str__(self):
        return f"{self.question_text[:50]}..."

    def clean(self):
        if not self.question_text and not self.question_image:
            raise ValidationError("Question must have either text or an image.")

from django.db import models
from django.utils import timezone
# make sure RefresherBatch is imported or defined above
# from .models import RefresherBatch  # if in another file

class RefresherTestSession(models.Model):
    TEST_TYPE_CHOICES = [('pre', 'Pre-Test'), ('post', 'Post-Test')]
    MODE_CHOICES = [('remote', 'Remote Control'), ('individual', 'Individual (PC/Tablet)')]

    schedule = models.ForeignKey(
        'Schedule',
        on_delete=models.CASCADE,
        related_name='refresher_test_sessions'
    )
    employee = models.ForeignKey(
        'MasterTable',
        on_delete=models.CASCADE,
        related_name='refresher_tests'
    )
    test_type = models.CharField(max_length=10, choices=TEST_TYPE_CHOICES)
    mode = models.CharField(max_length=10, choices=MODE_CHOICES, default='individual')
    
    # NEW: link each test session to a specific batch (optional for backwards compatibility)
    batch = models.ForeignKey(
        'RefresherBatch',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='test_sessions'
    )
    
    # For remote mode
    remote_key_id = models.CharField(max_length=20, null=True, blank=True)
    
    # Timing
    started_at = models.DateTimeField(null=True, blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    
    # Results
    score = models.PositiveSmallIntegerField(null=True, blank=True)
    total_questions = models.PositiveSmallIntegerField(null=True, blank=True)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    passed = models.BooleanField(null=True, blank=True)

    class Meta:
        # UPDATED: include batch in the uniqueness so you can have multiple
        # attempts per employee/schedule/test_type across different batches.
        unique_together = ('schedule', 'employee', 'test_type', 'batch')
        verbose_name = "Refresher Test Session"
        verbose_name_plural = "Refresher Test Sessions"

    def __str__(self):
        return f"{self.employee} - {self.get_test_type_display()} ({self.schedule})"

class RefresherAnswer(models.Model):
    test_session = models.ForeignKey(
        RefresherTestSession,
        on_delete=models.CASCADE,
        related_name='answers'
    )
    question = models.ForeignKey(
        RefresherQuestion,
        on_delete=models.CASCADE
    )
    selected_option = models.CharField(max_length=1, choices=[('A','A'),('B','B'),('C','C'),('D','D')])
    is_correct = models.BooleanField()
    answered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('test_session', 'question')

from django.db import models
from django.utils import timezone
from .models import Schedule, MasterTable  # adjust import if needed
# (You already import Schedule and MasterTable elsewhere in this file)

class RefresherBatch(models.Model):
    """
    A batch of employees for a given refresher training schedule.
    Example name: 'Safety Training - Batch 1'
    """
    schedule = models.ForeignKey(
        Schedule,
        on_delete=models.CASCADE,
        related_name='refresher_batches'
    )
    batch_number = models.PositiveIntegerField()
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    employees = models.ManyToManyField(
        MasterTable,
        related_name='refresher_batches'
    )

    class Meta:
        unique_together = ('schedule', 'batch_number')
        ordering = ['created_at']

    def __str__(self):
        return self.name



# ==================== Refreshment Training End ======================== #

class StationSetting(models.Model):
    SETTING_CHOICES = [
        ('CTQ', 'CTQ'),
        ('PDI', 'PDI'),
        ('OTHER', 'Other'),
        ('MARU A', 'Maru A'),
        ('CRITICAL', 'Critical'),
    ]

    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='settings')
    option = models.CharField(max_length=10, choices=SETTING_CHOICES)

    def _str_(self):
        return f"{self.station.station_name} ({self.department.department_name}) - {self.get_option_display()}"

    
# =======================evaluation===================================


class TestSession(models.Model):
    test_name = models.CharField(max_length=100)
    key_id = models.CharField(max_length=255, db_index=True) 
    employee = models.ForeignKey('MasterTable', on_delete=models.CASCADE, db_index=True)
    level = models.ForeignKey('Level', on_delete=models.SET_NULL, null=True, blank=True, db_index=True)
    skill = models.ForeignKey('Station', on_delete=models.SET_NULL, null=True, blank=True, db_index=True)
    question_paper = models.ForeignKey('QuestionPaper', on_delete=models.CASCADE, related_name='test_sessions', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    department = models.ForeignKey('Department', on_delete=models.SET_NULL, null=True, blank=True)
    test_date = models.DateField(null=True, blank=True)
    

    class Meta:
        unique_together = ('test_name', 'key_id') 

    def save(self, *args, **kwargs):
        if self.employee and not self.department:
            self.department = self.employee.department
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.test_name} - {self.employee}"

# models.py
from django.db import models
from django.db.models import JSONField  # Django 3.1+

class Score(models.Model):
    employee = models.ForeignKey('MasterTable', on_delete=models.CASCADE)
    marks = models.IntegerField()
    test = models.ForeignKey('TestSession', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    percentage = models.FloatField(default=0)
    passed = models.BooleanField(default=False)
    department = models.ForeignKey('Department', on_delete=models.SET_NULL, null=True, blank=True)
    level = models.ForeignKey('Level', on_delete=models.SET_NULL, null=True, blank=True)
    skill = models.ForeignKey('Station', on_delete=models.SET_NULL, null=True, blank=True)
    test_date = models.DateField(null=True, blank=True)

    # OLD: raw_answers used to be list. We'll now support dict mapping {question_id: selected_index}
    raw_answers = JSONField(default=dict, blank=True)

    # NEW: snapshot of question ids used in this attempt, in exact order
    question_ids = JSONField(default=list, blank=True)

    def save(self, *args, **kwargs):
        if self.employee and not self.department:
            self.department = self.employee.department
        if self.test:
            if not self.level and self.test.level:
                self.level = self.test.level
            if not self.skill and self.test.skill:
                self.skill = self.test.skill
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.employee} - {self.test} ({self.marks} marks)"
    

class KeyEvent(models.Model):
    base_id = models.IntegerField()
    key_id = models.IntegerField()
    key_sn = models.CharField(max_length=255, default='unknown')
    mode = models.IntegerField()
    timestamp = models.DateTimeField()
    info = models.CharField(max_length=255)
    client_timestamp = models.DateTimeField()
    event_type = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

from django.db import models

class ConnectEvent(models.Model):
    base_id = models.IntegerField()
    mode = models.IntegerField()
    # info will be "1" (Connected) or "0" (Disconnected)
    info = models.CharField(max_length=255) 
    timestamp = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        status = "Connected" if self.info == "1" else "Disconnected"
        return f"Receiver {self.base_id}: {status} at {self.timestamp}"




class VoteEvent(models.Model):
    base_id = models.IntegerField()
    mode = models.IntegerField()
    info = models.CharField(max_length=255)
    timestamp = models.DateTimeField()


# ====================================end evaluation===================
from django.db import models

class CompanyLogo(models.Model):
    name = models.CharField(max_length=100)  # Optional: Name of the logo (e.g., company name)
    logo = models.ImageField(upload_to='logos/',blank=True,null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def str(self):
        return self.name or f"Logo{self.id}"


# from django.db import models

# class EvaluationPassingCriteria(models.Model):
#     level = models.ForeignKey("Level", on_delete=models.CASCADE, related_name="passing_criteria")
#     department = models.ForeignKey("Department", on_delete=models.CASCADE, related_name="passing_criteria")
#     percentage = models.DecimalField(max_digits=5, decimal_places=2, help_text="Required percentage (e.g., 75.00)")

#     class Meta:
#         unique_together = ("level", "department")  # Prevent duplicate criteria for same level & department
#         verbose_name_plural = "Evaluation Passing Criteria"

#     def __str__(self):
#         return f"{self.level.level_name} - {self.department.department_name}: {self.percentage}%"
    
# ==================== Retraining starts ======================== #

# ==================== Retraining starts ======================== #


# class RetrainingConfig(models.Model):
#     level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='retraining_configs')
#     evaluation_type = models.CharField(
#         max_length=20, 
#         choices=[
#             ('Evaluation', 'Evaluation'),
#             ('OJT', 'OJT'),
#             ('10 Cycle', '10 Cycle')
#         ]
#     )
#     max_count = models.PositiveIntegerField(default=2)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         unique_together = ('level', 'evaluation_type')

#     def _str_(self):
#         return f"{self.level.level_name} - {self.evaluation_type} (Max: {self.max_count})"

class RetrainingConfig(models.Model):
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='retraining_configs')
    evaluation_type = models.CharField(
        max_length=30,  # Increased length to accommodate longer names
        choices=[
            ('Evaluation', 'Evaluation'),
            ('OJT', 'OJT'),
            ('10 Cycle', '10 Cycle'),
            ('Operator Observance', 'Operator Observance'),
            ('Skill Evaluation Level 2', 'Skill Evaluation Level 2'),
        ]
    )
    max_count = models.PositiveIntegerField(default=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('level', 'evaluation_type')

    def __str__(self):
        return f"{self.level.level_name} - {self.evaluation_type} (Max: {self.max_count})"

# class RetrainingSession(models.Model):
#     employee = models.ForeignKey(MasterTable, on_delete=models.CASCADE, related_name='retraining_sessions')
#     level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='retraining_sessions')
#     department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='retraining_sessions')
#     station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='retraining_sessions',null=True, blank=True)
#     evaluation_type = models.CharField(
#         max_length=20, 
#         choices=[
#             ('Evaluation', 'Evaluation'),
#             ('OJT', 'OJT'),
#             ('10 Cycle', '10 Cycle')
#         ]
#     )
#     scheduled_date = models.DateField()
#     scheduled_time = models.TimeField()
#     venue = models.CharField(max_length=128)
#     status = models.CharField(max_length=16, choices=[('Pending','Pending'),('Completed','Completed'),('Missed','Missed')], default='Pending')
#     attempt_no = models.PositiveIntegerField(default=1)
#     performance_percentage = models.FloatField(null=True, blank=True)
#     required_percentage = models.FloatField(null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         ordering = ['employee', 'evaluation_type', 'level', 'department', 'station', 'attempt_no']

#     def _str_(self):
#         return f"{self.employee.emp_id} - {self.level.level_name}/{self.department.department_name}/{self.station.station_name} - {self.evaluation_type} (Attempt {self.attempt_no})"
class RetrainingSession(models.Model):
    employee = models.ForeignKey(MasterTable, on_delete=models.CASCADE, related_name='retraining_sessions')
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='retraining_sessions')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='retraining_sessions')
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='retraining_sessions', null=True, blank=True)
    evaluation_type = models.CharField(
        max_length=30,  # Increased length
        choices=[
            ('Evaluation', 'Evaluation'),
            ('OJT', 'OJT'),
            ('10 Cycle', '10 Cycle'),
            ('Operator Observance', 'Operator Observance'),
            ('Skill Evaluation Level 2', 'Skill Evaluation Level 2'),
        ]
    )
    scheduled_date = models.DateField()
    scheduled_time = models.TimeField()
    venue = models.CharField(max_length=128)
    status = models.CharField(max_length=16, choices=[('Pending', 'Pending'), ('Completed', 'Completed'), ('Missed', 'Missed')], default='Pending')
    attempt_no = models.PositiveIntegerField(default=1)
    performance_percentage = models.FloatField(null=True, blank=True)
    required_percentage = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['employee', 'evaluation_type', 'level', 'department', 'station', 'attempt_no']

    def __str__(self):
        return f"{self.employee.emp_id} - {self.level.level_name}/{self.department.department_name}/{self.station.station_name if self.station else 'N/A'} - {self.evaluation_type} (Attempt {self.attempt_no})"

class RetrainingSessionDetail(models.Model):
    """Detailed information for each retraining session"""
    retraining_session = models.OneToOneField(
        RetrainingSession, 
        on_delete=models.CASCADE, 
        related_name='session_detail'
    )
    
    observations_failure_points = models.TextField(blank=True, null=True)
    trainer_name = models.CharField(max_length=100, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Detail for {self.retraining_session}"

    class Meta:
        verbose_name = "Retraining Session Detail"
#-----------------------Quantity OJT ----------------------------#

from django.db import models


# ---------------------------
#  Rules for Marks (Image Setup)
# ---------------------------
class QuantityScoreSetup(models.Model):
    """Stores the scoring setup for Production % and Rejections"""
    TYPE_CHOICES = (
        ("production", "Production"),
        ("rejection", "Rejection"),
    )

    department = models.ForeignKey("Department", on_delete=models.CASCADE, related_name="score_setups")
    level = models.ForeignKey("Level", on_delete=models.CASCADE, related_name="score_setups")

    score_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    min_value = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    max_value = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    marks = models.PositiveIntegerField()

    def _str_(self):
        return f"[{self.department.name} - {self.level.name}] {self.get_score_type_display()} {self.min_value}-{self.max_value} → {self.marks}"


# ---------------------------
#  Passing Criteria
# ---------------------------
# class QuantityPassingCriteria(models.Model):
#     department = models.ForeignKey("Department", on_delete=models.CASCADE, related_name="quantity_passing_criteria")
#     level = models.ForeignKey("Level", on_delete=models.CASCADE, related_name="quantity_passing_criteria")

#     production_passing_percentage = models.DecimalField(max_digits=5, decimal_places=2)
#     rejection_passing_percentage = models.DecimalField(max_digits=5, decimal_places=2)

#     def _str_(self):
#         return f"[{self.department.name} - {self.level.name}] Production Passing: {self.production_passing_percentage}%, Rejection Passing: {self.rejection_passing_percentage}%"



from django.db import models

class AssessmentMode(models.Model):
    MODE_CHOICES = [
        ('quality', 'Quality-Based'),
        ('quantity', 'Quantity-Based'),
    ]
    
    mode = models.CharField(max_length=10, choices=MODE_CHOICES, default='quality')
    updated_at = models.DateTimeField(auto_now=True)
    
    @classmethod
    def get_current_mode(cls):
        mode, created = cls.objects.get_or_create(id=1, defaults={'mode': 'quality'})
        return mode
    
from django.db.models.signals import post_save
from django.dispatch import receiver

class LevelColour(models.Model):
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name="colours")
    colour_code = models.CharField(max_length=20)  # e.g., "#ef4444"

    class Meta:
        unique_together = ('level',) 

    def __str__(self):
        return f"{self.level.level_name} - {self.colour_code}"

DEFAULT_COLOURS = {
    1: "#ef4444",  # red - Level 1
    2: "#f59e0b",  # amber - Level 2
    3: "#3b82f6",  # blue - Level 3
    4: "#10b981",  # emerald - Level 4
}

@receiver(post_save, sender=Level)
def create_default_colour(sender, instance, created, **kwargs):
    """
    Automatically assign a default colour when a new Level is created.
    """
    if created:
        level_id = instance.level_id
        if level_id in DEFAULT_COLOURS:
            if not LevelColour.objects.filter(level=instance).exists():
                LevelColour.objects.create(
                    level=instance, 
                    colour_code=DEFAULT_COLOURS[level_id]
                )

class SkillMatrixDisplaySetting(models.Model):
    # singleton entry for global setting
    display_shape = models.CharField(max_length=20, choices=[('piechart', 'Pie Chart'), ('levelblock', 'Level Block')], default='piechart')

    def __str__(self):
        return f"Display Shape: {self.display_shape}"

    class Meta:
        verbose_name = "Skill Matrix Display Setting"
        verbose_name_plural = "Skill Matrix Display Settings"

class SkillMatrix(models.Model):
    employee = models.ForeignKey("MasterTable", on_delete=models.CASCADE, related_name="skills")
    employee_name = models.CharField(max_length=100)
    emp_id = models.CharField(max_length=50)
    doj = models.DateField()
    level = models.ForeignKey("Level", on_delete=models.CASCADE)
    # link to hierarchy instead of station directly
    hierarchy = models.ForeignKey("HierarchyStructure", on_delete=models.CASCADE, related_name="skill_matrices")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
            station = self.hierarchy.station.station_name if self.hierarchy.station else 'No Station'
            return f"{self.employee_name} - {station} (Level {self.level.level_name})"


from django.db import models
from django.utils import timezone

class Notification(models.Model):
    """
    Comprehensive notification model for real-time notifications
    Tracks all system events and user interactions
    """
    NOTIFICATION_TYPES = [
        ('employee_registration', 'Employee Registration'),
        ('level_exam_completed', 'Level Exam Completed'),
        ('training_added', 'Training Added'),
        ('training_updated', 'Training Updated'),
        ('training_scheduled', 'Training Scheduled'),
        ('training_completed', 'Training Completed'),
        ('training_reschedule', 'Training Reschedule'),
        ('refresher_training_scheduled', 'Refresher Training Scheduled'),
        ('refresher_training_completed', 'Refresher Training Completed'),
        ('hanchou_exam_completed', 'Hanchou Exam Completed'),
        ('shokuchou_exam_completed', 'Shokuchou Exam Completed'),
        ('ten_cycle_evaluation_completed', '10 Cycle Evaluation Completed'),
        ('ojt_completed', 'OJT Completed'),
        ('ojt_quantity_completed', 'OJT Quantity Completed'),
        ('machine_allocated', 'Machine Allocated'),
        ('test_assigned', 'Test Assigned'),
        ('evaluation_completed', 'Evaluation Completed'),
        ('retraining_scheduled', 'Retraining Scheduled'),
        ('retraining_completed', 'Retraining Completed'),
        ('human_body_check_completed', 'Human Body Check Completed'),
        ('milestone_reached', 'Milestone Reached'),
        ('system_alert', 'System Alert'),
    ]

    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)

    # Recipients
    recipient = models.ForeignKey('User', on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    recipient_email = models.EmailField(null=True, blank=True)

    # Related objects
    employee = models.ForeignKey('MasterTable', on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    level = models.ForeignKey('Level', on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    training_schedule = models.ForeignKey('Schedule', on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    machine_allocation = models.ForeignKey('MachineAllocation', on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    test_session = models.ForeignKey('TestSession', on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    retraining_session = models.ForeignKey('RetrainingSession', on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    human_body_check_session = models.ForeignKey('HumanBodyCheckSession', on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')

    # Status tracking
    is_read = models.BooleanField(default=False)
    is_sent = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)

    # Additional metadata
    metadata = models.JSONField(default=dict, blank=True)
    priority = models.CharField(max_length=20, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent')
    ], default='medium')

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['notification_type']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.title} - {self.recipient or self.recipient_email}"

    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])

    def mark_as_unread(self):
        """Mark notification as unread"""
        if self.is_read:
            self.is_read = False
            self.read_at = None
            self.save(update_fields=['is_read', 'read_at'])

# In models.py

class HandoverSheet(models.Model):
    employee = models.OneToOneField(MasterTable, on_delete=models.CASCADE)  # ensures only one per employee
    industrial_experience = models.CharField(max_length=255, blank=True, null=True)
    kpapl_experience = models.CharField(max_length=255, blank=True, null=True)
    required_department_at_handover = models.CharField(max_length=255,  blank=True, null=True)
    distributed_department_after_dojo = models.ForeignKey(Department, on_delete=models.CASCADE)
    distributed_line_after_dojo = models.ForeignKey(
        Line,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='handover_distributed_line',
        help_text="Line assigned after Dojo training (optional)"
    )
    
    distributed_station_after_dojo = models.ForeignKey(
        Station,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='handover_distributed_station',
        help_text="Station assigned after Dojo training (optional)"
    )
    handover_date = models.DateField( blank=True, null=True)
    contractor_name = models.CharField(max_length=255, blank=True, null=True)
    p_and_a_name = models.CharField(max_length=255,blank=True, null=True)
    qa_hod_name = models.CharField(max_length=255, blank=True, null=True)
    is_training_completed = models.BooleanField(default=False)
    gojo_incharge_name = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"Handover for {self.employee.emp_id}"


class TrainingTopic(models.Model):
    topic_name = models.CharField(max_length=200)
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name="training_topics",default='')
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name="training_topics",default='')
    
    def __str__(self):
        return f"{self.topic_name} ({self.level.level_name} - {self.station.station_name})"



class LevelWiseTrainingContent(models.Model):
    topic = models.ForeignKey(
        TrainingTopic,
        on_delete=models.CASCADE,
        related_name="contents",
        null=True,          # optional
        blank=True          # optional
    )
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name="training_contents")
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name="training_contents")
    content_name = models.CharField(max_length=200)
    file = models.FileField(upload_to="training_files/", null=True, blank=True)
    url = models.URLField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def _str_(self):
        return f"{self.content_name} ({self.level.level_name} - {self.station.station_name})"
    



import uuid
from django.db import models
from django.db.models.signals import pre_save
from django.dispatch import receiver



class DailyProductionData(models.Model):
    start_date = models.DateField()
    end_date = models.DateField()
    entry_mode = models.CharField(
        max_length=10,
        choices=[('DAILY', 'Daily'), ('WEEKLY', 'Weekly'), ('MONTHLY', 'Monthly')],
        default='DAILY'
    )
    batch_id = models.UUIDField(default=uuid.uuid4, editable=False)

    Hq = models.ForeignKey(Hq, on_delete=models.CASCADE, null=True, blank=True)
    factory = models.ForeignKey(Factory, on_delete=models.CASCADE, null=True, blank=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, null=True, blank=True)
    line = models.ForeignKey(Line, on_delete=models.CASCADE, null=True, blank=True)
    subline = models.ForeignKey(SubLine, on_delete=models.CASCADE, null=True, blank=True)
    station = models.ForeignKey(Station, on_delete=models.CASCADE, null=True, blank=True)

    
    total_production_plan = models.PositiveIntegerField(default=0)
    total_production_actual = models.PositiveIntegerField(default=0)
    
    
    total_operators_available = models.PositiveIntegerField(
        default=0,
        help_text="The total operators on payroll at the start of this period (Starting Team)"
    )
    total_operators_required_plan = models.PositiveIntegerField(default=0, help_text="Operators We NEED (Plan)")
    total_operators_required_actual = models.PositiveIntegerField(default=0)

    attrition_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0, help_text="e.g., 2.0 for 2%")
    absenteeism_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0, help_text="e.g., 5.5 for 5.5%")

   
    ctq_plan_l1 = models.PositiveIntegerField(default=0)
    ctq_plan_l2 = models.PositiveIntegerField(default=0)
    ctq_plan_l3 = models.PositiveIntegerField(default=0)
    ctq_plan_l4 = models.PositiveIntegerField(default=0)
    ctq_plan_total = models.PositiveIntegerField(default=0, editable=False)
    
    ctq_actual_l1 = models.PositiveIntegerField(default=0)
    ctq_actual_l2 = models.PositiveIntegerField(default=0)
    ctq_actual_l3 = models.PositiveIntegerField(default=0)
    ctq_actual_l4 = models.PositiveIntegerField(default=0)
    ctq_actual_total = models.PositiveIntegerField(default=0, editable=False)

    pdi_plan_l1 = models.PositiveIntegerField(default=0)
    pdi_plan_l2 = models.PositiveIntegerField(default=0)
    pdi_plan_l3 = models.PositiveIntegerField(default=0)
    pdi_plan_l4 = models.PositiveIntegerField(default=0)
    pdi_plan_total = models.PositiveIntegerField(default=0, editable=False)
    
    pdi_actual_l1 = models.PositiveIntegerField(default=0)
    pdi_actual_l2 = models.PositiveIntegerField(default=0)
    pdi_actual_l3 = models.PositiveIntegerField(default=0)
    pdi_actual_l4 = models.PositiveIntegerField(default=0)
    pdi_actual_total = models.PositiveIntegerField(default=0, editable=False)

    other_plan_l1 = models.PositiveIntegerField(default=0)
    other_plan_l2 = models.PositiveIntegerField(default=0)
    other_plan_l3 = models.PositiveIntegerField(default=0)
    other_plan_l4 = models.PositiveIntegerField(default=0)
    other_plan_total = models.PositiveIntegerField(default=0, editable=False)
    
    other_actual_l1 = models.PositiveIntegerField(default=0)
    other_actual_l2 = models.PositiveIntegerField(default=0)
    other_actual_l3 = models.PositiveIntegerField(default=0)
    other_actual_l4 = models.PositiveIntegerField(default=0)
    other_actual_total = models.PositiveIntegerField(default=0, editable=False)

    bifurcation_plan_l1 = models.PositiveIntegerField(default=0, editable=False)
    bifurcation_plan_l2 = models.PositiveIntegerField(default=0, editable=False)
    bifurcation_plan_l3 = models.PositiveIntegerField(default=0, editable=False)
    bifurcation_plan_l4 = models.PositiveIntegerField(default=0, editable=False)

    bifurcation_actual_l1 = models.PositiveIntegerField(default=0, editable=False)
    bifurcation_actual_l2 = models.PositiveIntegerField(default=0, editable=False)
    bifurcation_actual_l3 = models.PositiveIntegerField(default=0, editable=False)
    bifurcation_actual_l4 = models.PositiveIntegerField(default=0, editable=False)

    
    grand_total_plan = models.PositiveIntegerField(default=0, editable=False)
    grand_total_actual = models.PositiveIntegerField(default=0, editable=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['start_date']

    def __str__(self):
        # Updated to show the new date range for clarity in Django Admin
        if self.start_date == self.end_date:
            return f"{self.start_date} (Daily) - {self.line.line_name if self.line else 'N/A'}"
        return f"{self.start_date} to {self.end_date} - {self.line.line_name if self.line else 'N/A'}"




@receiver(pre_save, sender=DailyProductionData)
def calculate_totals_on_save(sender, instance, **kwargs):
    """
    This function automatically calculates all production totals before saving.
    The complex operator gap logic is now handled in the view.
    """
    # 1. Calculate Department Totals
    instance.ctq_plan_total = instance.ctq_plan_l1 + instance.ctq_plan_l2 + instance.ctq_plan_l3 + instance.ctq_plan_l4
    instance.ctq_actual_total = instance.ctq_actual_l1 + instance.ctq_actual_l2 + instance.ctq_actual_l3 + instance.ctq_actual_l4
    instance.pdi_plan_total = instance.pdi_plan_l1 + instance.pdi_plan_l2 + instance.pdi_plan_l3 + instance.pdi_plan_l4
    instance.pdi_actual_total = instance.pdi_actual_l1 + instance.pdi_actual_l2 + instance.pdi_actual_l3 + instance.pdi_actual_l4
    instance.other_plan_total = instance.other_plan_l1 + instance.other_plan_l2 + instance.other_plan_l3 + instance.other_plan_l4
    instance.other_actual_total = instance.other_actual_l1 + instance.other_actual_l2 + instance.other_actual_l3 + instance.other_actual_l4

    # 2. Calculate Bifurcation Totals from department data
    instance.bifurcation_plan_l1 = instance.ctq_plan_l1 + instance.pdi_plan_l1 + instance.other_plan_l1
    instance.bifurcation_actual_l1 = instance.ctq_actual_l1 + instance.pdi_actual_l1 + instance.other_actual_l1
    instance.bifurcation_plan_l2 = instance.ctq_plan_l2 + instance.pdi_plan_l2 + instance.other_plan_l2
    instance.bifurcation_actual_l2 = instance.ctq_actual_l2 + instance.pdi_actual_l2 + instance.other_actual_l2
    instance.bifurcation_plan_l3 = instance.ctq_plan_l3 + instance.pdi_plan_l3 + instance.other_plan_l3
    instance.bifurcation_actual_l3 = instance.ctq_actual_l3 + instance.pdi_actual_l3 + instance.other_actual_l3
    instance.bifurcation_plan_l4 = instance.ctq_plan_l4 + instance.pdi_plan_l4 + instance.other_plan_l4
    instance.bifurcation_actual_l4 = instance.ctq_actual_l4 + instance.pdi_actual_l4 + instance.other_actual_l4

    # 3. Calculate Grand Totals
    instance.grand_total_plan = instance.ctq_plan_total + instance.pdi_plan_total + instance.other_plan_total
    instance.grand_total_actual = instance.ctq_actual_total + instance.pdi_actual_total + instance.other_actual_total


from decimal import Decimal

class AdvanceManpowerDashboard(models.Model):
    # Direct hierarchy relations
    hq = models.ForeignKey("Hq", on_delete=models.CASCADE, null=True, blank=True)
    factory = models.ForeignKey("Factory", on_delete=models.CASCADE)
    department = models.ForeignKey("Department", on_delete=models.CASCADE, null=True, blank=True)
    line = models.ForeignKey("Line", on_delete=models.CASCADE, null=True, blank=True)
    subline= models.ForeignKey("SubLine", on_delete=models.CASCADE, null=True, blank=True)
   
    station = models.ForeignKey("Station", on_delete=models.CASCADE, null=True, blank=True)

    # Time period
    month = models.PositiveSmallIntegerField()  # 1–12
    year = models.PositiveSmallIntegerField()

    # KPIs / Metrics
    total_stations = models.PositiveIntegerField(default=0)
    operators_required = models.PositiveIntegerField(default=0)
    operators_available = models.PositiveIntegerField(default=0)
    buffer_manpower_required = models.PositiveIntegerField(default=0)
    buffer_manpower_available = models.PositiveIntegerField(default=0)
    l1_required= models.PositiveIntegerField(default=0)
    l1_available= models.PositiveIntegerField(default=0)
    l2_required= models.PositiveIntegerField(default=0)
    l2_available= models.PositiveIntegerField(default=0)
    l3_required= models.PositiveIntegerField(default=0)
    l3_available= models.PositiveIntegerField(default=0)
    l4_required= models.PositiveIntegerField(default=0)
    l4_available= models.PositiveIntegerField(default=0)


    attrition_rate = models.DecimalField(
        max_digits=10,                 # increased
        decimal_places=2,
        default=Decimal("0.00"),
        null=True,
        blank=True
    )

    absenteeism_rate = models.DecimalField(
        max_digits=10,                 # increased
        decimal_places=2,
        default=Decimal("0.00"),
        null=True,
        blank=True
    )
    oet_attrition = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
        null=True,
        blank=True
   
    )

    associate_attrition = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
         null=True,
        blank=True
    )

    # Audit
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "advance_manpower_dashboard"
        unique_together = ("hq", "factory", "department", "line", "subline", "month", "year")

    def __str__(self):
        return f"{self.factory} - {self.month}/{self.year}"





class ManagementReview(models.Model):

    hq = models.ForeignKey("Hq", on_delete=models.CASCADE, null=True, blank=True)
    factory = models.ForeignKey("Factory", on_delete=models.CASCADE)
    department = models.ForeignKey("Department", on_delete=models.CASCADE, null=True, blank=True)
    line = models.ForeignKey("Line", on_delete=models.CASCADE, null=True, blank=True)
    subline = models.ForeignKey("Subline", on_delete=models.CASCADE, null=True, blank=True)
    station = models.ForeignKey("Station", on_delete=models.CASCADE, null=True, blank=True)


    # Time period
    month = models.PositiveSmallIntegerField()  # 1–12
    year = models.PositiveSmallIntegerField()

    new_operators_joined = models.IntegerField()
    new_operators_trained = models.IntegerField()
    total_training_plans = models.IntegerField()
    total_trainings_actual = models.IntegerField()
    total_defects_msil = models.IntegerField()
    ctq_defects_msil = models.IntegerField()
    total_defects_tier1 = models.IntegerField()
    ctq_defects_tier1 = models.IntegerField()
    total_internal_rejection = models.IntegerField()
    ctq_internal_rejection = models.IntegerField()

    unique_together = (
            "hq", "factory", "department", "line", "subline", "station", "month", "year"
        )
    def __str__(self):
        return f"{self.factory} - {self.month}/{self.year}"


    
class UserManualdocs(models.Model):
    name = models.CharField(max_length=255, help_text="Content name/title")
    file = models.FileField(
        upload_to='usermanual_docs/', 
        help_text="Upload document file"
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = "Content"
        verbose_name_plural = "Contents"

    def __str__(self):
        return self.name

    @property
    def file_extension(self):
        """Get file extension if file exists"""
        if self.file:
            return os.path.splitext(self.file.name)[1].lower()
        return None

    @property
    def file_size(self):
        """Get file size in bytes if file exists"""
        if self.file:
            try:
                return self.file.size
            except (OSError, ValueError):
                return 0
        return 0

    def delete(self, *args, **kwargs):
        """Override delete to also remove the file from storage"""
        if self.file:
            # Delete the file from storage when the model instance is deleted
            if os.path.isfile(self.file.path):
                os.remove(self.file.path)
        super().delete(*args, **kwargs)

class EvaluationPassingCriteria(models.Model):
    level = models.ForeignKey("Level", on_delete=models.CASCADE, related_name="passing_criteria")
    department = models.ForeignKey("Department", on_delete=models.CASCADE, related_name="passing_criteria")
    percentage = models.DecimalField(max_digits=5, decimal_places=2, help_text="Required percentage (e.g., 75.00)")

    class Meta:
        unique_together = ("level", "department")  # Prevent duplicate criteria for same level & department
        verbose_name_plural = "Evaluation Passing Criteria"

    def __str__(self):
        return f"{self.level.level_name} - {self.department.department_name}: {self.percentage}%"


# ==================== TrainingBatch ======================== #
    

# class TrainingAttendance(models.Model):
#     """ Stores daily attendance for each user in a batch. """
#     STATUS_CHOICES = [
#         ('present', 'Present'),
#         ('absent', 'Absent'),
#     ]
    
#     user = models.ForeignKey(UserRegistration, on_delete=models.CASCADE, related_name='attendances')
#     batch = models.ForeignKey(TrainingBatch, on_delete=models.CASCADE, related_name='attendances', to_field='batch_id')
#     day_number = models.ForeignKey(Days, on_delete=models.CASCADE, related_name='day_attendances')
#     status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    
#     # --- NEW FIELD ---
#     # This field will store the actual calendar date the attendance was marked on.
#     attendance_date = models.DateField(help_text="The calendar date this attendance was recorded" ,null=True, blank= True)
    
#     date_marked = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         ordering = ['batch', 'user', 'day_number']
#         # A user can only have one attendance status per day in a given batch.
#         unique_together = ('user', 'batch', 'day_number')

#     def _str_(self):
#         return f"{self.user.first_name} - {self.batch.batch_id} - Day {self.day_number}: {self.status}"

    

# ==================== TrainingBatch End ======================== #
 

 
from django.db import models
from django.utils.timezone import now

class MultiSkilling(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in-progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    employee = models.ForeignKey("MasterTable", on_delete=models.CASCADE, related_name="multi_skills")
    emp_id = models.CharField(max_length=20, blank=True)
    employee_name = models.CharField(max_length=100, blank=True)
    date_of_joining = models.DateField(null=True, blank=True)
    department_name = models.CharField(max_length=100, blank=True, null=True) 

    department = models.ForeignKey(Department, on_delete=models.CASCADE,null=True, blank=True)
    station = models.ForeignKey(Station, on_delete=models.CASCADE,null=True, blank=True)
    # hierarchy = models.ForeignKey("HierarchyStructure", on_delete=models.CASCADE, related_name="multi_skills")

    skill_level =  models.ForeignKey(Level, on_delete=models.CASCADE, null=True, blank=True)
    start_date = models.DateField(blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="scheduled")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.employee:
            self.emp_id = self.employee.emp_id
            self.employee_name = f"{self.employee.first_name} {self.employee.last_name}"
            self.date_of_joining = self.employee.date_of_joining
            self.department_name = (
                self.employee.department.department_name if self.employee.department else None
            )
        super().save(*args, **kwargs)

    @property
    def current_status(self):
        today = now().date()
        if self.status == "scheduled" and self.start_date and self.start_date <= today:
            return "in-progress"
        return self.status

    def __str__(self):
        return f"{self.employee_name} - {self.station.station_name if self.station else 'No Station'}"


 # ==================== MultiSkilling End ======================== #
 
# -----------------------ESSL Biometric Man-Machine interlinkage ----------------------------
 # ==================== Biometric Manmachine Interlinkage setup =================== # 


from django.db import models
from .models import Station, Department, MasterTable, Level, HierarchyStructure # Import your existing models

# ---------------------------------------------------------
# 1. BIOMETRIC DEVICE CONFIGURATION
# ---------------------------------------------------------
class BiometricDevice(models.Model):
    name = models.CharField(max_length=100, help_text="e.g. Lathe Shop Device")
    ip_address = models.GenericIPAddressField(help_text="e.g. 192.168.1.50")
    port = models.IntegerField(default=80)
    serial_number = models.CharField(max_length=50, blank=True)
    username = models.CharField(max_length=50, default="essl")
    password = models.CharField(max_length=50, default="essl")

    def __str__(self):
        return f"{self.name} ({self.ip_address})"

# ---------------------------------------------------------
# 2. BIO USER (The Employee on the Device)
# ---------------------------------------------------------
class BioUser(models.Model):
    employeeid = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return f"{self.employeeid} - {self.first_name}"

# ---------------------------------------------------------
# 3. ENROLLMENT LOG (Prevents Duplicates)
# ---------------------------------------------------------
class BiometricEnrollment(models.Model):
    """
    Tracks which employee is added to which specific device.
    """
    bio_user = models.ForeignKey(BioUser, on_delete=models.CASCADE, related_name='enrollments')
    device = models.ForeignKey(BiometricDevice, on_delete=models.CASCADE, related_name='enrolled_users')
    synced_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('bio_user', 'device') # Database-level duplicate prevention
        verbose_name = "Enrolled User Log"

    def __str__(self):
        return f"{self.bio_user.employeeid} -> {self.device.name}"


class AttendanceLog(models.Model):
    """
    Stores ONE record per User per Device per Day.
    Updates 'last_punch' automatically.
    """
    bio_user = models.ForeignKey(BioUser, on_delete=models.CASCADE, related_name='attendance_days')
    device = models.ForeignKey(BiometricDevice, on_delete=models.SET_NULL, null=True)
    date = models.DateField()  # Stores just the date (YYYY-MM-DD)
    
    first_punch = models.TimeField() # e.g. 09:00:00
    last_punch = models.TimeField()  # e.g. 17:00:00 (Updates throughout the day)

    class Meta:
        # Unique constraint: One record per User per Day per Device
        # This ensures if they move to a new machine, a new row is created.
        unique_together = ('bio_user', 'device', 'date')
        ordering = ['-date', 'bio_user']
        verbose_name = "Daily Attendance Summary"

    def __str__(self):
        return f"{self.bio_user.employeeid} on {self.date}"
  
    

 # ==================== Biometric Manmachine Interlinkage setup End =================== # 
# -----------------------ESSL Biometric Man-Machine interlinkage End----------------------------

 # ==================== Machine  ======================== #



class Machine(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='machines/', null=True, blank=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='machines')
    level = models.IntegerField()
    process = models.ForeignKey(Station,on_delete=models.CASCADE,related_name='stations')  # Skill required
    
    # LINK TO BIOMETRIC DEVICE
    biometric_device = models.ForeignKey(
        BiometricDevice, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='machines'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def _str_(self):
        return self.name

class MachineAllocation(models.Model):
    APPROVAL_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    machine = models.ForeignKey(Machine, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    employee = models.ForeignKey(SkillMatrix, on_delete=models.CASCADE)
    allocated_at = models.DateTimeField(auto_now_add=True)
    approval_status = models.CharField(
        max_length=10,
        choices=APPROVAL_STATUS_CHOICES,
        default='pending'
    )

    class Meta:
        # Ensure one allocation per machine-employee pair
        unique_together = ['machine', 'employee']

    def save(self, *args, **kwargs):
        # Only run this logic on the first save (i.e., when the object is new)
        # This prevents the approval_status from being overwritten by subsequent saves
        if not self.pk:
            employee_level_value = self.employee.level.level_id
            if employee_level_value >= self.machine.level:
                self.approval_status = 'approved'
            else:
                self.approval_status = 'pending'

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.machine.name} → {self.employee.employee_name} ({self.approval_status})"



    @classmethod
    def update_pending_allocations(cls):
        """
        Method to update pending allocations when employee levels change
        Call this when SkillMatrix levels are updated
        """
        pending_allocations = cls.objects.filter(approval_status='pending')
        for allocation in pending_allocations:
            # Fix: Compare actual level values
            employee_level_value = allocation.employee.level.level_id # or level.level_name
            if employee_level_value >= allocation.machine.level:
                allocation.approval_status = 'approved'
                allocation.save()

 # ==================== Machine  End======================== #



class TrainingAttendance(models.Model):
    """ Stores daily attendance for each user in a batch. """
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
    ]
    
    user = models.ForeignKey(UserRegistration, on_delete=models.CASCADE, related_name='attendances')
    batch = models.ForeignKey(TrainingBatch, on_delete=models.CASCADE, related_name='attendances', to_field='batch_id')
    day_number = models.ForeignKey(Days, on_delete=models.CASCADE, related_name='day_attendances')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES,default='Absent')
    
    # --- NEW FIELD ---
    # This field will store the actual calendar date the attendance was marked on.
    attendance_date = models.DateField(help_text="The calendar date this attendance was recorded" ,null=True, blank= True)
    
    date_marked = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['batch', 'user', 'day_number']
        # A user can only have one attendance status per day in a given batch.
        unique_together = ('user', 'batch', 'day_number')

    def _str_(self):
        return f"{self.user.first_name} - {self.batch.batch_id} - Day {self.day_number}: {self.status}"
    



from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


from .models import MasterTable 

# --- Main Evaluation Model ---

class EvaluationLevel2(models.Model):
    """
    Represents a single Skill Evaluation Level 2 event for an employee.
    """

    # --- Status Choices ---
    # Defining choices as class constants is a Django best practice.
    STATUS_PASS = 'Pass'
    STATUS_FAIL = 'Fail'
    STATUS_RE_EVAL_PASS = 'Re-evaluation Pass'
    STATUS_RE_EVAL_FAIL = 'Re-evaluation Fail'
    STATUS_PENDING = 'Pending'

    STATUS_CHOICES = [
        (STATUS_PASS, 'Pass'),
        (STATUS_FAIL, 'Fail'),
        (STATUS_RE_EVAL_PASS, 'Re-evaluation Pass'),
        (STATUS_RE_EVAL_FAIL, 'Re-evaluation Fail'),
        (STATUS_PENDING, 'Pending'),
    ]

    employee = models.ForeignKey(
        MasterTable, 
        on_delete=models.CASCADE,
        related_name='level_two_evaluations'
    )


    level = models.ForeignKey(
        Level,
        on_delete=models.CASCADE,
        related_name='skillevaluations',
        default=1
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='skill_evaluations_in_department', # A unique related_name
        null=True,
        blank=True 
    )


    snapshot_full_name = models.CharField(max_length=200, editable=False)
    snapshot_department = models.CharField(max_length=100, editable=False)
    snapshot_designation = models.CharField(max_length=100, editable=False)
    snapshot_date_of_joining = models.DateField(editable=False)

    station_name = models.CharField(max_length=150)
    evaluation_date = models.DateField()
    dojo_incharge_name = models.CharField(max_length=200)
    area_incharge_name = models.CharField(max_length=200)

    total_marks = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )

   
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING
    )


    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def save(self, *args, **kwargs):

        if not self.pk and self.employee:
            self.snapshot_full_name = f"{self.employee.first_name} {self.employee.last_name}"
            self.snapshot_designation = self.employee.designation or 'N/A'
            self.snapshot_date_of_joining = self.employee.date_of_joining
            if self.department:
                self.snapshot_department = self.department.department_name

        super().save(*args, **kwargs)




    class Meta:
        # Enforces that one employee can only have one evaluation per station.
        unique_together = ['employee','department', 'station_name', 'level']
        verbose_name = "Skill Evaluation (Level 2)"
        verbose_name_plural = "Skill Evaluations (Level 2)"

    def __str__(self):
        return f"Evaluation for {self.employee.emp_id} at {self.station_name} on {self.evaluation_date}"


# --- Evaluation Scores Model ---

class EvaluationScore(models.Model):
    """
    Represents a single line item (a single criterion score) within an EvaluationLevel2.
    """

    SCORE_OK = 'O'
    SCORE_NG = 'X'
    SCORE_NA = 'N/A'  # <--- NEW OPTION
    SCORE_CHOICES = [
        (SCORE_OK, 'OK'),
        (SCORE_NG, 'Not OK (NG)'),
        (SCORE_NA, 'Not Applicable'), # <--- NEW OPTION
    ]

    # The link back to the parent evaluation.
    # on_delete=models.CASCADE means if the main evaluation is deleted,
    # all of its associated scores will be deleted as well.
    evaluation = models.ForeignKey(
        EvaluationLevel2,
        on_delete=models.CASCADE,
        related_name='scores' # Allows access via `evaluation.scores.all()`
    )

    # Storing the criteria text here makes the score record self-contained.
    criteria_text = models.TextField()

    initial_score = models.CharField(
        max_length=3, 
        choices=SCORE_CHOICES,
        null=True, 
        blank=True
    )

    reevaluation_score = models.CharField(
        max_length=3,
        choices=SCORE_CHOICES,
        null=True,
        blank=True
    )
    
    class Meta:
        verbose_name = "Evaluation Score"
        verbose_name_plural = "Evaluation Scores"

    def __str__(self):
        return f"Score for '{self.criteria_text[:40]}...' on evaluation {self.evaluation.id}"
    
class EvaluationCriterion(models.Model):
    """
    Stores a single evaluation criterion (a question) and links it
    to a specific evaluation level.
    """
    level = models.ForeignKey(
        Level,
        on_delete=models.CASCADE,
        related_name='criteria',
        help_text="The evaluation level this criterion belongs to."
    )
    
    # You could also link it to a Department if criteria are
    # department-specific within a level.
    # department = models.ForeignKey(Department, on_delete=models.CASCADE, ...)

    criteria_text = models.TextField(
        help_text="The actual text of the criterion/question."
    )

    display_order = models.PositiveIntegerField(
        default=0,
        help_text="Controls the order in which criteria appear on the form."
    )
    
    is_active = models.BooleanField(
        default=True,
        help_text="Uncheck this to hide the criterion without deleting it."
    )

    class Meta:
        verbose_name = "Evaluation Criterion"
        verbose_name_plural = "Evaluation Criteria"
        # Order by the level, then by the custom display order
        ordering = ['level', 'display_order']

    def __str__(self):
        # We access the level_name from the related Level object.
        return f"{self.level}: {self.criteria_text[:50]}..."





# Productivity and quality sheet Level 1
import django.utils.timezone

class ProductivityEvaluation(models.Model):
    employee = models.ForeignKey(MasterTable, on_delete=models.CASCADE, related_name="evaluations")
    evaluation_date = models.DateField(default=django.utils.timezone.now)
    obtained_marks = models.IntegerField(default=0)
    max_marks = models.IntegerField(default=15)
    percentage = models.FloatField(default=0.0)
    status = models.CharField(max_length=10, choices=[("PASS", "PASS"), ("FAIL", "FAIL")], default="FAIL")
    trainer_name = models.CharField(max_length=100, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.employee.first_name} {self.employee.last_name} - {self.evaluation_date}"


class ProductivitySequence(models.Model):
    evaluation = models.ForeignKey(ProductivityEvaluation, on_delete=models.CASCADE, related_name="sequences")
    sequence_name = models.CharField(max_length=200)
    mt = models.IntegerField(default=0)  # Max marks for step
    e1 = models.IntegerField(default=0)
    e2 = models.IntegerField(default=0)
    e3 = models.IntegerField(default=0)

    # ✅ Editable from frontend
    cycle_time = models.IntegerField(default=40)   # Target cycle time
    actual_time = models.IntegerField(default=0)   # Captured from frontend

    
    def save(self, *args, **kwargs):
        # Only auto-calculate for 'actual time' sequences
        if 'actual time' in self.sequence_name.lower():
            if self.actual_time > 0:
                marks = 2 if self.actual_time <= self.cycle_time else 0
                
                
                pass
            
        super().save(*args, **kwargs)

    def clean(self):
        from django.core.exceptions import ValidationError
        # Validate that evaluation scores don't exceed method time
        if self.e1 > self.mt:
            raise ValidationError(f'E1 score ({self.e1}) cannot exceed method time ({self.mt})')
        if self.e2 > self.mt:
            raise ValidationError(f'E2 score ({self.e2}) cannot exceed method time ({self.mt})')
        if self.e3 > self.mt:
            raise ValidationError(f'E3 score ({self.e3}) cannot exceed method time ({self.mt})')

    def __str__(self):
        return f"{self.sequence_name} ({self.evaluation.employee.emp_id})"




class QualityEvaluation(models.Model):
    employee = models.ForeignKey(MasterTable, on_delete=models.CASCADE,to_field='emp_id', related_name="qualityevaluations")
    evaluation_date = models.DateField(default=django.utils.timezone.now)
    obtained_marks = models.IntegerField(default=0)
    max_marks = models.IntegerField(default=15)
    percentage = models.FloatField(default=0.0)
    status = models.CharField(max_length=10, choices=[("PASS", "PASS"), ("FAIL", "FAIL")], default="FAIL")
    trainer_name = models.CharField(max_length=100, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.employee.first_name} {self.employee.last_name} - {self.evaluation_date}"


class QualitySequence(models.Model):
    evaluation = models.ForeignKey(QualityEvaluation, on_delete=models.CASCADE, related_name="qualitysequences")
    sequence_name = models.CharField(max_length=200)
    mt = models.IntegerField(default=0)  # Max marks for step
    e1 = models.IntegerField(default=0)
    e2 = models.IntegerField(default=0)
    e3 = models.IntegerField(default=0)

    # ✅ Editable from frontend
    cycle_time = models.IntegerField(default=40)   # Target cycle time
    actual_time = models.IntegerField(default=0)   # Captured from frontend

    def save(self, *args, **kwargs):
        # Only auto-calculate for 'actual time' sequences
        if 'actual time' in self.sequence_name.lower():
            if self.actual_time > 0:
                marks = 2 if self.actual_time <= self.cycle_time else 0
                
                pass
            
        super().save(*args, **kwargs)

    def clean(self):
        from django.core.exceptions import ValidationError

        if self.e1 > self.mt:
            raise ValidationError(f'E1 score ({self.e1}) cannot exceed method time ({self.mt})')
        if self.e2 > self.mt:
            raise ValidationError(f'E2 score ({self.e2}) cannot exceed method time ({self.mt})')
        if self.e3 > self.mt:
            raise ValidationError(f'E3 score ({self.e3}) cannot exceed method time ({self.mt})')

    def __str__(self):
        return f"{self.sequence_name} ({self.evaluation.employee.emp_id})"





#start  level1revision model
class Question(models.Model):
    subtopiccontent = models.ForeignKey(
        'SubtopicContent',
        on_delete=models.CASCADE,
        related_name='questions'  # Helps in querying from SubtopicContent
    )
    question_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.question_text[:50] # Show first 50 chars in admin

class Option(models.Model):
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name='options' # Helps in querying from Question
    )
    option_text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.option_text} ({'Correct' if self.is_correct else 'Incorrect'})"
    

# end levelrevision


# Operator observancesheet 



from django.db import models

class Topic(models.Model):
    sr_no = models.IntegerField(unique=True)
    topic_name = models.CharField(max_length=255)
    description = models.TextField()

    def __str__(self):
        return f"{self.sr_no} - {self.topic_name}"

class OperatorObservanceSheet(models.Model):
    operator_name = models.CharField(max_length=255)
    operator_category = models.CharField(max_length=255, blank=True, null=True)
    process_name = models.CharField(max_length=255)
    supervisor_name = models.CharField(max_length=255)
    evaluation_start_date = models.DateField()
    evaluation_end_date = models.DateField()
    level = models.CharField(max_length=20)  # e.g. 'Level 2', 'Level 3', 'Level 4'
    marks = models.JSONField()  # { "1": { "D1": "O", "D2": "X", ... }, "2": ... }
    remarks = models.TextField(blank=True, null=True)
    score = models.CharField(max_length=20, blank=True, null=True)
    marks_obtained = models.CharField(max_length=20, blank=True, null=True)
    value = models.CharField(max_length=20, blank=True, null=True)
    result = models.CharField(max_length=20, blank=True, null=True)
    signatures = models.JSONField(default=dict, blank=True, null=True)
    topics = models.ManyToManyField(Topic, related_name='observance_sheets', blank=True)
    department_id = models.IntegerField(null=True, blank=True)
    department_name = models.CharField(max_length=255, blank=True, null=True)
    
    def __str__(self):
        return f"{self.operator_name} ({self.level})"


# ================== Station Manager =================================


from django.db import models

# Define choices for minimum_level_required
LEVEL_CHOICES = [
    ('Level 1', 'Leve 1'),
    ('Level 2', 'Level 2'),
    ('Level 3', 'Level 3'),
    ('Level 4', 'Level 4'),
]

class StationManager(models.Model):
    department = models.ForeignKey(
        'HierarchyStructure',
        on_delete=models.CASCADE,
        related_name='station_managers_as_department',
        null=True,
        blank=True,
    )
    station = models.ForeignKey(
        'HierarchyStructure',
        on_delete=models.CASCADE,
        related_name='station_managers_as_station',
        null=True,
        blank=True,
    )
    minimum_level_required = models.CharField(max_length=20, choices=LEVEL_CHOICES, null=True, blank=True)
    minimum_operators = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self):
        if self.station:
            return f"Station Manager for {self.station.structure_name}"
        elif self.department:
            return f"Department Manager for {self.department.structure_name}"
        return "Station Manager - Unknown"

    class Meta:
        db_table = "station_manager"


# ================== Station Manager End =================================



# # ================== Biometric Realtime ==================================

# class BioUser(models.Model):
#     employeeid = models.CharField(max_length=20, unique=True)
#     first_name = models.CharField(max_length=50)
#     last_name = models.CharField(max_length=50)

#     def __str__(self):
#         return f"{self.employeeid} - {self.first_name} {self.last_name}"
    
# # ================== Biometric Realtime End ==================================




#================== BiometricAttendance ==================#

from django.db import models


from django.db import models

class BiometricAttendance(models.Model):
    attendance_date = models.DateField(verbose_name="Attendance Date", null=True, blank=True)

    sr_no = models.IntegerField(verbose_name="Sr.No.", null=True, blank=True)
    pay_code = models.CharField(max_length=50, verbose_name="PayCode", null=True, blank=True)
    card_no = models.CharField(max_length=50, verbose_name="Card No")
    employee_name = models.CharField(max_length=100, verbose_name="Employee Name", null=True, blank=True)
    department = models.CharField(max_length=100, verbose_name="Department", null=True, blank=True)
    designation = models.CharField(max_length=100, verbose_name="Designation", null=True, blank=True)
    shift = models.CharField(max_length=20, verbose_name="Shift", null=True, blank=True)
    
    # Time fields (Start, In, Out look like standard time in the image)
    start = models.TimeField(verbose_name="Start", null=True, blank=True)
    in_time = models.TimeField(verbose_name="In", null=True, blank=True)
    out_time = models.TimeField(verbose_name="Out", null=True, blank=True)
    
    # Changed to CharField because image shows "11.37" (decimal), not "11:37:00" (Time)
    hrs_works = models.CharField(max_length=20, null=True, blank=True, verbose_name="Hrs Works")
    
    status = models.CharField(max_length=20, verbose_name="Status", null=True, blank=True)
    
    # Keeping these as CharField to handle flexible Excel data (floats or strings) safely
    early_arrival = models.CharField(max_length=50, null=True, blank=True, verbose_name="Early Arriv.")
    late_arrival = models.CharField(max_length=50, null=True, blank=True, verbose_name="Late Arriv.")
    shift_early = models.CharField(max_length=50, null=True, blank=True, verbose_name="Shift Early")
    excess_lunch = models.CharField(max_length=50, null=True, blank=True, verbose_name="Excess Lunch")
    ot = models.CharField(max_length=50, null=True, blank=True, verbose_name="Ot")
    ot_amount = models.CharField(max_length=50, null=True, blank=True, verbose_name="Ot Amount")
    
    # --- NEW FIELD ---
    os = models.CharField(max_length=50, null=True, blank=True, verbose_name="Os") 
    
    manual = models.CharField(max_length=100, null=True, blank=True, verbose_name="Manual")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Adjusted unique constraint if needed, otherwise keep as is
        unique_together = ('card_no', 'attendance_date') 

    def __str__(self):
        return f"{self.employee_name} - {self.attendance_date}"
    
    

class SystemSettings(models.Model):
    excel_source_path = models.CharField(
        max_length=500, 
        verbose_name="Excel Source Path",
        help_text="Folder path where biometric Excel files are placed",
        blank=True,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "System Setting"
        verbose_name_plural = "System Settings"

    def __str__(self):
        return f"System Settings (ID: {self.id})"
    
    @property
    def processed_folder_path(self):
        """Returns the Processed folder path based on source path"""
        if self.excel_source_path:
            import os
            return os.path.join(self.excel_source_path, "Processed")
        return None
#================== BiometricAttendance End ==================#



# ===== ACTION PLAN =======================
# app/models.py
from django.db import models

class ActionItem(models.Model):
    topic = models.CharField(max_length=255)
    subtopic = models.CharField(max_length=255, null=True, blank=True)
    date = models.DateField()  # Stores the date
    
    def __str__(self):
        return f"{self.topic} - {self.subtopic}"



class ActionItemRejection(models.Model):
    topic = models.CharField(max_length=255)
    subtopic = models.CharField(max_length=255, null=True, blank=True)
    date = models.DateField()  # Stores the date
    
    def __str__(self):
        return f"{self.topic} - {self.subtopic}"
# ========= END ===================
# ==================================poison cake test=================================
from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.db.models import Sum


# ================================================================
# DEFECT MANAGEMENT MODELS
# ================================================================

class DefectCategory(models.Model):
    """
    Master table for defect categories (e.g., Appearance, Dimension, Function)
    Managed through settings page
    """
    category_id = models.AutoField(primary_key=True)
    category_name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Defect category name (e.g., Appearance, Dimension)"
    )
    description = models.TextField(
        null=True,
        blank=True,
        help_text="Optional description of this category"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this category is currently in use"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.category_name

    class Meta:
        db_table = 'defect_category'
        verbose_name = 'Defect Category'
        verbose_name_plural = 'Defect Categories'
        ordering = ['category_name']


class DefectType(models.Model):
    """
    Master table for specific defect types under each category
    Managed through settings page
    """
    defect_type_id = models.AutoField(primary_key=True)
    defect_name = models.CharField(
        max_length=100,
        help_text="Specific defect name (e.g., Scratch, Dent, Over Size)"
    )
    category = models.ForeignKey(
        DefectCategory,
        on_delete=models.CASCADE,
        related_name='defect_types',
        help_text="Parent defect category"
    )
    description = models.TextField(
        null=True,
        blank=True,
        help_text="Optional description of this defect type"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this defect type is currently in use"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.defect_name} ({self.category.category_name})"

    class Meta:
        db_table = 'defect_type'
        verbose_name = 'Defect Type'
        verbose_name_plural = 'Defect Types'
        ordering = ['category__category_name', 'defect_name']
        unique_together = ['defect_name', 'category']


# ================================================================
# POISON CAKE TEST MODELS
# ================================================================

# Add this to your existing models.py file

class PoisonCakeTest(models.Model):
    """
    Main test record for Poison Cake testing
    Links to operator (MasterTable), department, station, and level
    """
    JUDGMENT_CHOICES = [
        ('OK', 'OK'),
        ('NOT OK', 'NOT OK'),
    ]

    test_id = models.AutoField(primary_key=True)
    
    # Test Information
    test_date = models.DateField(
        help_text="Date when the test was conducted"
    )
    model_name = models.CharField(
        max_length=100,
        help_text="Model/Product name being tested (e.g., KT-001)"
    )
    
    # Operator Information - Links to MasterTable (Employee)
    operator = models.ForeignKey(
        'MasterTable',  # Your existing employee model
        on_delete=models.PROTECT,
        related_name='poison_tests',
        help_text="Employee who performed the test"
    )
    
    # Department, Station, and Level - from your existing models
    department = models.ForeignKey(
        'Department',
        on_delete=models.PROTECT,
        related_name='poison_tests',
        help_text="Department where test was conducted"
    )
    station = models.ForeignKey(
        'Station',
        on_delete=models.PROTECT,
        related_name='poison_tests',
        help_text="Specific station where test was conducted"
    )
    
    # NEW: Add Level field
    level = models.ForeignKey(
        'Level',
        on_delete=models.PROTECT,
        related_name='poison_tests',
        help_text="Level at which test was conducted"
    )
    
    # Before Test Data
    total_parts_before = models.IntegerField(
        validators=[MinValueValidator(0)],
        help_text="Total number of parts before test"
    )
    ok_parts_before = models.IntegerField(
        validators=[MinValueValidator(0)],
        help_text="Number of OK parts before test"
    )
    reject_parts_before = models.IntegerField(
        validators=[MinValueValidator(0)],
        help_text="Number of reject parts before test (auto-calculated)"
    )
    
    # After Test Data (Operator's findings)
    ok_parts_after = models.IntegerField(
        validators=[MinValueValidator(0)],
        help_text="Number of OK parts found by operator after inspection"
    )
    reject_parts_after = models.IntegerField(
        validators=[MinValueValidator(0)],
        help_text="Number of reject parts found by operator after inspection"
    )
    
    # Judgment Result
    test_judgment = models.CharField(
        max_length=10,
        choices=JUDGMENT_CHOICES,
        help_text="Test result: OK or NOT OK (auto-calculated)"
    )
    
    # Re-inspection (only if NOT OK)
    re_inspection_qty = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="Quantity to be re-inspected (required if test fails)"
    )
    remarks = models.TextField(
        null=True,
        blank=True,
        help_text="Additional remarks or notes about the test"
    )
    # Add these fields to PoisonCakeTest
    reeval_scheduled_date = models.DateField(null=True, blank=True)
    reeval_extension_weeks = models.IntegerField(null=True, blank=True)
    evaluation_number = models.IntegerField(default=1)
    previous_test = models.ForeignKey(
        'self', null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='reevaluations'
    )
    

    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
   
    def clean(self):
        """Validation logic for the test"""
        super().clean()
        
        # Validate: OK parts cannot exceed total parts
        if self.ok_parts_before > self.total_parts_before:
            raise ValidationError({
                'ok_parts_before': 'OK parts cannot exceed total parts before test'
            })
        
        # Validate: reject_parts_before must equal calculated value
        calculated_reject = self.total_parts_before - self.ok_parts_before
        if self.reject_parts_before != calculated_reject:
            raise ValidationError({
                'reject_parts_before': f'Reject parts must be {calculated_reject} (total - ok)'
            })
        
        # Validate: If NOT OK, re_inspection_qty and remarks are required
        if self.test_judgment == 'NOT OK':
            if not self.re_inspection_qty:
                raise ValidationError({
                    're_inspection_qty': 'Re-inspection quantity is required when test fails'
                })
            if not self.remarks:
                raise ValidationError({
                    'remarks': 'Remarks are required when test fails'
                })

    def calculate_reject_before(self):
        """Calculate reject parts before test"""
        return self.total_parts_before - self.ok_parts_before

    def calculate_total_defect_qty(self):
        """Calculate total quantity of planted defects"""
        return self.planted_defects.aggregate(
            total=Sum('quantity')
        )['total'] or 0

    def calculate_judgment(self):
        """
        Calculate test judgment based on 2 conditions:
        1. OK parts before == OK parts after
        2. Total defect planted qty == Reject parts after
        """
        total_defect_qty = self.calculate_total_defect_qty()
        
        # Condition 1: OK parts match
        ok_match = self.ok_parts_before == self.ok_parts_after
        
        # Condition 2: Planted defects match reject after
        defect_match = total_defect_qty == self.reject_parts_after
        
        # Both conditions must pass
        if ok_match and defect_match:
            return 'OK'
        else:
            return 'NOT OK'

    def get_judgment_details(self):
        """Get detailed breakdown of judgment conditions"""
        total_defect_qty = self.calculate_total_defect_qty()
        
        ok_match = self.ok_parts_before == self.ok_parts_after
        defect_match = total_defect_qty == self.reject_parts_after
        
        return {
            'judgment': 'OK' if (ok_match and defect_match) else 'NOT OK',
            'ok_match': ok_match,
            'defect_match': defect_match,
            'ok_parts_before': self.ok_parts_before,
            'ok_parts_after': self.ok_parts_after,
            'total_defect_qty': total_defect_qty,
            'reject_parts_after': self.reject_parts_after
        }

    def save(self, *args, **kwargs):
        """Override save to auto-calculate fields"""
        # Auto-calculate reject_parts_before
        self.reject_parts_before = self.calculate_reject_before()
        
        # Auto-calculate judgment if we have planted defects
        if self.pk:  # If updating existing record
            self.test_judgment = self.calculate_judgment()
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Test {self.test_id} - {self.model_name} - {self.test_date} - {self.test_judgment}"

    class Meta:
        db_table = 'poison_cake_test'
        verbose_name = 'Poison Cake Test'
        verbose_name_plural = 'Poison Cake Tests'
        ordering = ['-test_date', '-test_id']
        indexes = [
            models.Index(fields=['test_date']),
            models.Index(fields=['test_judgment']),
            models.Index(fields=['operator']),
            models.Index(fields=['department']),
            models.Index(fields=['level']),  # NEW INDEX
        ]
# Add this NEW model to models.py

class AfterTestCategoryResult(models.Model):
    """
    Stores how many defects the operator found per category after the test.
    One record per category per test.
    """
    id = models.AutoField(primary_key=True)
    
    test = models.ForeignKey(
        PoisonCakeTest,
        on_delete=models.CASCADE,
        related_name='after_test_category_results',
        help_text="The test this result belongs to"
    )
    category = models.ForeignKey(
        DefectCategory,
        on_delete=models.PROTECT,
        related_name='after_test_results',
        help_text="Defect category"
    )
    found_qty = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="How many defects operator found in this category"
    )

    class Meta:
        db_table = 'after_test_category_result'
        unique_together = ['test', 'category']
        ordering = ['test', 'category']

    def __str__(self):
        return f"Test {self.test_id} · {self.category.category_name} · Found: {self.found_qty}"

class PlantedDefect(models.Model):
    """
    Individual defects planted before the test
    Multiple defects can be associated with one test
    """
    planted_defect_id = models.AutoField(primary_key=True)
    
    test = models.ForeignKey(
        PoisonCakeTest,
        on_delete=models.CASCADE,
        related_name='planted_defects',
        help_text="The test this defect belongs to"
    )
    
    defect_category = models.ForeignKey(
        DefectCategory,
        on_delete=models.PROTECT,
        related_name='planted_defects',
        help_text="Category of the defect"
    )
    
    defect_type = models.ForeignKey(
        DefectType,
        on_delete=models.PROTECT,
        related_name='planted_defects',
        help_text="Specific type of defect"
    )
    
    quantity = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text="Number of parts with this defect"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        """Validate that defect_type belongs to defect_category"""
        super().clean()
        if self.defect_type and self.defect_category:
            if self.defect_type.category != self.defect_category:
                raise ValidationError({
                    'defect_type': f'Defect type must belong to category {self.defect_category.category_name}'
                })

    def __str__(self):
        return f"{self.defect_type.defect_name} - Qty: {self.quantity}"

    class Meta:
        db_table = 'planted_defect'
        verbose_name = 'Planted Defect'
        verbose_name_plural = 'Planted Defects'
        ordering = ['test', 'defect_category', 'defect_type']



# ================================================================
# SIGNALS - Auto-update judgment when defects are saved
# ================================================================

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

@receiver([post_save, post_delete], sender=PlantedDefect)
def update_test_judgment(sender, instance, **kwargs):
    """
    Update test judgment whenever planted defects are added/changed/deleted
    """
    test = instance.test
    test.test_judgment = test.calculate_judgment()
    test.save(update_fields=['test_judgment', 'updated_at'])



# Add these NEW models to your existing models.py

class RecurringTestSchedule(models.Model):
    STATUS_CHOICES = [
        ('SCHEDULED', 'Scheduled'),
        ('DUE_SOON', 'Due Soon'),
        ('OVERDUE', 'Overdue'),
        ('COMPLETED', 'Completed'),
    ]

    schedule_id = models.AutoField(primary_key=True)

    employee = models.ForeignKey(
        'MasterTable',
        on_delete=models.PROTECT,
        related_name='recurring_schedules'
    )
    station = models.ForeignKey(
        'Station',
        on_delete=models.PROTECT,
        related_name='recurring_schedules'
    )
    level = models.ForeignKey(
        'Level',
        on_delete=models.PROTECT,
        related_name='recurring_schedules'
    )

    # ★ FIX: null=True, blank=True — not required for first-timers
    last_test = models.ForeignKey(
        'PoisonCakeTest',
        on_delete=models.PROTECT,
        related_name='next_schedules',
        null=True,       # ← ADDED
        blank=True,      # ← ADDED
        help_text="The test that triggered this schedule (null for first-time scheduling)"
    )

    # ★ FIX: null=True, blank=True — not required for first-timers
    last_test_date = models.DateField(
        null=True,       # ← ADDED
        blank=True,      # ← ADDED
        help_text="Date of last completed test (null for first-time scheduling)"
    )

    next_test_date = models.DateField(
        help_text="Scheduled date for next/first test"
    )

    # ★ NEW: flag to distinguish first-time vs recurring
    is_first_time = models.BooleanField(
        default=False,
        help_text="True if this is the employee's first scheduled test (no prior test exists)"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='SCHEDULED'
    )

    notes = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def update_status(self):
        from datetime import date, timedelta
        today = date.today()
        if today > self.next_test_date:
            self.status = 'OVERDUE'
        elif today >= self.next_test_date - timedelta(days=30):
            self.status = 'DUE_SOON'
        else:
            self.status = 'SCHEDULED'
        self.save(update_fields=['status', 'updated_at'])

    def days_until_test(self):
        from datetime import date
        delta = self.next_test_date - date.today()
        return delta.days

    def __str__(self):
        label = "First-time" if self.is_first_time else f"Last: {self.last_test_date}"
        return f"{self.employee.first_name} - {label} → Next: {self.next_test_date} - {self.status}"

    class Meta:
        db_table = 'recurring_test_schedule'
        verbose_name = 'Recurring Test Schedule'
        verbose_name_plural = 'Recurring Test Schedules'
        ordering = ['next_test_date']
        indexes = [
            models.Index(fields=['next_test_date']),
            models.Index(fields=['status']),
            models.Index(fields=['employee']),
            models.Index(fields=['is_first_time']),  # ← NEW
        ]


class ReInspectionPlan(models.Model):
    """
    Track employees who failed and need re-testing
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SCHEDULED', 'Scheduled'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
    ]
    
    plan_id = models.AutoField(primary_key=True)
    
    employee = models.ForeignKey(
        'MasterTable',
        on_delete=models.PROTECT,
        related_name='reinspection_plans'
    )
    
    station = models.ForeignKey(
        'Station',
        on_delete=models.PROTECT,
        related_name='reinspection_plans'
    )
    
    level = models.ForeignKey(
        'Level',
        on_delete=models.PROTECT,
        related_name='reinspection_plans'
    )
    
    failed_test = models.ForeignKey(
        'PoisonCakeTest',
        on_delete=models.PROTECT,
        related_name='reinspection_plans',
        help_text="The test that failed"
    )
    
    failed_date = models.DateField(
        help_text="Date when test failed"
    )
    
    failed_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Score percentage from failed test"
    )
    
    scheduled_date = models.DateField(
        null=True,
        blank=True,
        help_text="Date scheduled for re-inspection"
    )
    
    completed_test = models.ForeignKey(
        'PoisonCakeTest',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='completed_reinspections',
        help_text="The re-inspection test (if completed)"
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    
    notes = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.employee.first_name} - Failed: {self.failed_date} - {self.status}"
    
    class Meta:
        db_table = 'reinspection_plan'
        verbose_name = 'Re-Inspection Plan'
        verbose_name_plural = 'Re-Inspection Plans'
        ordering = ['-failed_date']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['employee']),
            models.Index(fields=['scheduled_date']),
        ]


# UPDATE the existing PoisonCakeTest model's save method
# Add this to your existing PoisonCakeTest class:

def save(self, *args, **kwargs):
    """Override save to auto-calculate fields and create follow-up records"""
    from datetime import timedelta
    
    # Auto-calculate reject_parts_before
    self.reject_parts_before = self.calculate_reject_before()
    
    # Auto-calculate judgment if we have planted defects
    if self.pk:  # If updating existing record
        self.test_judgment = self.calculate_judgment()
    
    is_new = self.pk is None
    super().save(*args, **kwargs)
    
    # After saving, create follow-up records
    if is_new or not is_new:  # Always check after save
        if self.test_judgment == 'OK':
            # Create/Update recurring schedule
            next_date = self.test_date + timedelta(days=90)
            
            # Check if this was a re-inspection that passed
            reinspection = ReInspectionPlan.objects.filter(
                employee=self.operator,
                status__in=['PENDING', 'SCHEDULED', 'IN_PROGRESS']
            ).first()
            
            if reinspection:
                # Mark re-inspection as completed
                reinspection.completed_test = self
                reinspection.status = 'COMPLETED'
                reinspection.save()
            
            # Create recurring schedule
            RecurringTestSchedule.objects.update_or_create(
                employee=self.operator,
                status__in=['SCHEDULED', 'DUE_SOON', 'OVERDUE'],
                defaults={
                    'station': self.station,
                    'level': self.level,
                    'last_test': self,
                    'last_test_date': self.test_date,
                    'next_test_date': next_date,
                    'status': 'SCHEDULED'
                }
            )
            
        elif self.test_judgment == 'NOT OK':
            # Check if already in re-inspection
            existing = ReInspectionPlan.objects.filter(
                employee=self.operator,
                status__in=['PENDING', 'SCHEDULED', 'IN_PROGRESS']
            ).first()
            
            if not existing:
                # Calculate score percentage
                total_planted = self.calculate_total_defect_qty()
                score = 0
                if total_planted > 0:
                    score = (self.reject_parts_after / total_planted) * 100
                
                # Create re-inspection plan
                ReInspectionPlan.objects.create(
                    employee=self.operator,
                    station=self.station,
                    level=self.level,
                    failed_test=self,
                    failed_date=self.test_date,
                    failed_score=score,
                    status='PENDING'
                )



# ==================================poison cake test=================================
# ==========attrition======================================

from django.db import models
from decimal import Decimal, ROUND_HALF_UP
from django.db.models.functions import ExtractYear, ExtractMonth

class AttritionRecord(models.Model):
    date = models.DateField()
    oet = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    associate = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    overall = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']
        constraints = [
            models.UniqueConstraint(
                ExtractYear('date'),
                ExtractMonth('date'),
                name='unique_attrition_per_month'
            )
        ]

    def save(self, *args, **kwargs):
        self.oet = Decimal(self.oet).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )
        self.associate = Decimal(self.associate).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )
        self.overall = (self.oet + self.associate).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )
        super().save(*args, **kwargs)
    

    def __str__(self):
        return f"Attrition - {self.date.strftime('%B %Y')}"
# ==========attrition======================================
