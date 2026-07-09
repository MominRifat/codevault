from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),

    # Core views
    path('', views.dashboard_view, name='dashboard'),
    path('topics/', views.topics_view, name='topics'),
    path('topics/<str:id>/', views.topic_detail_view, name='topic_detail'),
    
    # Notes
    path('notes/', views.notes_view, name='notes'),
    path('notes/<int:pk>/', views.note_detail_view, name='note_detail'),
    path('notes/create/', views.note_create, name='note_create'),
    path('notes/edit/<int:pk>/', views.note_edit, name='note_edit'),
    path('notes/delete/<int:pk>/', views.note_delete, name='note_delete'),

    # Templates
    path('templates/', views.templates_view, name='templates'),
    path('templates/<int:pk>/', views.template_detail_view, name='template_detail'),
    path('templates/create/', views.template_create, name='template_create'),
    path('templates/edit/<int:pk>/', views.template_edit, name='template_edit'),
    path('templates/delete/<int:pk>/', views.template_delete, name='template_delete'),

    # Snippets
    path('snippets/', views.snippets_view, name='snippets'),
    path('snippets/create/', views.snippet_create, name='snippet_create'),
    path('snippets/edit/<int:pk>/', views.snippet_edit, name='snippet_edit'),
    path('snippets/delete/<int:pk>/', views.snippet_delete, name='snippet_delete'),

    # Problems (Challenges)
    path('problems/', views.problems_view, name='problems'),
    path('problems/<int:pk>/', views.problem_detail_view, name='problem_detail'),
    path('problems/create/', views.problem_create, name='problem_create'),
    path('problems/edit/<int:pk>/', views.problem_edit, name='problem_edit'),
    path('problems/delete/<int:pk>/', views.problem_delete, name='problem_delete'),

    # Videos
    path('videos/', views.videos_view, name='videos'),
    path('videos/create/', views.video_create, name='video_create'),
    path('videos/edit/<int:pk>/', views.video_edit, name='video_edit'),
    path('videos/delete/<int:pk>/', views.video_delete, name='video_delete'),

    # Mistakes Journal
    path('mistakes/', views.mistakes_view, name='mistakes'),
    path('mistakes/create/', views.mistake_create, name='mistake_create'),
    path('mistakes/edit/<int:pk>/', views.mistake_edit, name='mistake_edit'),
    path('mistakes/delete/<int:pk>/', views.mistake_delete, name='mistake_delete'),
]
