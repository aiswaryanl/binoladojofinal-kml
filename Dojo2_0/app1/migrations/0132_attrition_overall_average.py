from decimal import Decimal, ROUND_HALF_UP

from django.db import migrations


def recalculate(apps, use_average):
    AttritionRecord = apps.get_model('app1', 'AttritionRecord')
    for rec in AttritionRecord.objects.all():
        total = Decimal(rec.oet or 0) + Decimal(rec.associate or 0)
        value = total / 2 if use_average else total
        overall = value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        if rec.overall != overall:
            AttritionRecord.objects.filter(pk=rec.pk).update(overall=overall)


def forwards(apps, schema_editor):
    recalculate(apps, use_average=True)


def backwards(apps, schema_editor):
    recalculate(apps, use_average=False)


class Migration(migrations.Migration):

    dependencies = [
        ('app1', '0131_traineeinfo_prepared_by_approved_by'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
