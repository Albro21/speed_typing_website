from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin
from .models import Level, AchievementGroup, Achievement, UserAchievement

CustomUser = get_user_model()

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('nickname', 'email', 'is_staff', 'is_active')
    list_filter = ('nickname', 'email', 'is_staff', 'is_active')
    fieldsets = (
        (None, {'fields': ('nickname', 'email', 'password')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
        ('Personal Info', {'fields': ('profile_picture', 'bio', 'level', 'exp', 'daily_goal')}),
        ('Important dates', {'fields': ('date_joined',)}),
        ('Preferences', {'fields': ('theme',)}),
    )
    readonly_fields = ('date_joined',)
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'is_staff', 'is_active')}
        ),
    )
    search_fields = ('email',)
    ordering = ('email',)

admin.site.register(Level)
admin.site.register(AchievementGroup)
admin.site.register(Achievement)
admin.site.register(UserAchievement)
admin.site.register(CustomUser, CustomUserAdmin)