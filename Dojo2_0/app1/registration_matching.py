"""
Finding a Master Table employee's Level 1 registration(s) (UserRegistration) for the employee card.

"""
import re


def _phone_digits(value):
    """Last 10 digits of a phone number ('+91 98765-43210' -> '9876543210'), or None."""
    digits = re.sub(r'\D', '', str(value or ''))
    return digits[-10:] if len(digits) >= 10 else None


def _clean_name(value):
    return re.sub(r'\s+', ' ', str(value or '').strip().lower()).strip(' -')


def _is_free(reg):
    """Registration not linked to any Master Table employee."""
    return not (reg.emp_id or '').strip()


def find_registrations_for_employee(employee):
    """Registration record(s) of a Master Table employee (for the employee card)."""
    from .models import UserRegistration, MasterTable

    # 0. Saved link
    linked = UserRegistration.objects.filter(emp_id=employee.emp_id)
    if linked.exists():
        return linked

    first_name = _clean_name(employee.first_name)
    if not first_name:
        return UserRegistration.objects.none()
    same_first = [
        reg for reg in UserRegistration.objects.filter(first_name__iexact=(employee.first_name or '').strip())
        if _clean_name(reg.first_name) == first_name
    ]
    if not same_first:
        return UserRegistration.objects.none()

    # 1. Phone + first name (can return 2 duplicate registrations of the same person)
    phone = _phone_digits(employee.phone)
    if phone:
        ids = [reg.id for reg in same_first if _is_free(reg) and _phone_digits(reg.phone_number) == phone]
        return UserRegistration.objects.filter(id__in=ids)

    # 2. No phone: full name, only if exactly one registration has it
    last_name = _clean_name(employee.last_name)
    if last_name:
        full = [reg for reg in same_first if _clean_name(reg.last_name) == last_name]
        if len(full) == 1 and _is_free(full[0]):
            return UserRegistration.objects.filter(id=full[0].id)

    # 3. No phone: the only registration with this first name, unless another employee owns it by phone
    if len(same_first) == 1 and _is_free(same_first[0]):
        reg = same_first[0]
        reg_phone = _phone_digits(reg.phone_number)
        owned_by_other = reg_phone and any(
            _phone_digits(other.phone) == reg_phone
            for other in MasterTable.objects.filter(first_name__iexact=(employee.first_name or '').strip())
                                            .exclude(emp_id=employee.emp_id)
        )
        if not owned_by_other:
            return UserRegistration.objects.filter(id=reg.id)

    # 4. Can't tell which registration is this employee's
    return UserRegistration.objects.none()
