from django.contrib import admin
from .models import Topic, Note, Template, Snippet, Problem, Video, Mistake, Revision, Bookmark

@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'difficulty', 'tags')
    search_fields = ('id', 'title', 'description', 'tags')
    list_filter = ('difficulty',)
    ordering = ('title',)
    fieldsets = (
        ('General Information', {
            'fields': ('id', 'title', 'description')
        }),
        ('Metadata', {
            'fields': ('difficulty', 'tags', 'related_topics', 'cover_url')
        }),
    )

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('title', 'topic', 'user', 'updated_at')
    search_fields = ('title', 'content', 'tags')
    list_filter = ('topic', 'user')
    autocomplete_fields = ['topic']
    readonly_fields = ('created', 'updated_at')
    ordering = ('-updated_at',)
    fieldsets = (
        ('General', {
            'fields': ('user', 'topic', 'title', 'tags')
        }),
        ('Content & Formulas', {
            'fields': ('content', 'code_block', 'formula_section')
        }),
        ('Supplemental Information', {
            'fields': ('important_tips', 'references')
        }),
        ('System Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at')
        })
    )

@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    list_display = ('title', 'topic', 'user', 'complexity_time', 'complexity_space')
    search_fields = ('title', 'explanation', 'code')
    list_filter = ('topic', 'user')
    autocomplete_fields = ['topic']
    ordering = ('-id',)
    fieldsets = (
        ('General', {
            'fields': ('user', 'topic', 'title')
        }),
        ('Code Implementation', {
            'fields': ('code', 'explanation')
        }),
        ('Complexity Analysis', {
            'fields': ('complexity_time', 'complexity_space')
        })
    )

@admin.register(Snippet)
class SnippetAdmin(admin.ModelAdmin):
    list_display = ('title', 'language', 'user')
    search_fields = ('title', 'description', 'tags')
    list_filter = ('language', 'user')
    ordering = ('-id',)
    fieldsets = (
        ('Snippet Information', {
            'fields': ('user', 'title', 'language', 'description')
        }),
        ('Code Block', {
            'fields': ('code', 'tags')
        })
    )

@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    list_display = ('name', 'topic', 'platform', 'difficulty', 'status', 'user')
    list_editable = ('difficulty', 'status')
    search_fields = ('name', 'tags', 'explanation', 'my_code')
    list_filter = ('platform', 'difficulty', 'status', 'user', 'topic')
    autocomplete_fields = ['topic']
    ordering = ('-id',)
    fieldsets = (
        ('Core Details', {
            'fields': ('user', 'topic', 'name', 'platform', 'link', 'editorial_link', 'video_link')
        }),
        ('Status & Metadata', {
            'fields': ('difficulty', 'tags', 'status')
        }),
        ('Implementation & Solution', {
            'fields': ('my_code', 'explanation', 'better_solution', 'mistakes')
        }),
        ('Complexity Analysis', {
            'fields': ('time_complexity', 'space_complexity')
        })
    )

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'topic', 'user', 'youtube_id')
    search_fields = ('title', 'description', 'notes')
    list_filter = ('topic', 'user')
    autocomplete_fields = ['topic']
    ordering = ('-id',)
    fieldsets = (
        ('Video Details', {
            'fields': ('user', 'topic', 'title', 'youtube_url', 'youtube_id')
        }),
        ('Explanations & Timestamps', {
            'fields': ('description', 'notes', 'timestamps')
        })
    )

@admin.register(Mistake)
class MistakeAdmin(admin.ModelAdmin):
    list_display = ('problem_name', 'mistake', 'user', 'created_at')
    search_fields = ('problem_name', 'mistake', 'wrong_approach', 'correct_approach', 'lesson_learned')
    list_filter = ('user', 'problem')
    autocomplete_fields = ['problem']
    readonly_fields = ('created_at',)
    ordering = ('-id',)
    fieldsets = (
        ('Linked Problem', {
            'fields': ('user', 'problem', 'problem_name')
        }),
        ('Post-Mortem Analysis', {
            'fields': ('mistake', 'wrong_approach', 'correct_approach', 'lesson_learned')
        }),
        ('Metadata', {
            'fields': ('created_at',)
        })
    )

@admin.register(Revision)
class RevisionAdmin(admin.ModelAdmin):
    list_display = ('problem_name', 'next_revision_date', 'priority', 'completed', 'user')
    list_editable = ('next_revision_date', 'priority', 'completed')
    search_fields = ('problem_name',)
    list_filter = ('priority', 'completed', 'user', 'problem')
    autocomplete_fields = ['problem']
    ordering = ('completed', 'next_revision_date')
    fieldsets = (
        ('Linked Problem', {
            'fields': ('user', 'problem', 'problem_name')
        }),
        ('Scheduling', {
            'fields': ('next_revision_date', 'priority', 'completed')
        })
    )

@admin.register(Bookmark)
class BookmarkAdmin(admin.ModelAdmin):
    list_display = ('item_type', 'item_id', 'user', 'created_at')
    list_filter = ('item_type', 'user')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)
