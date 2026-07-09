import re
from datetime import datetime
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.db.models import Count, Q
from django.http import JsonResponse, HttpResponseForbidden
from .models import Topic, Note, Template, Snippet, Problem, Video, Mistake, Revision, Bookmark

# --- SEEDING UTILITIES ---

DEFAULT_TOPICS = []

def seed_topics_if_needed():
    pass

def seed_user_data(user):
    pass



# --- AUTHENTICATION & SESSION VIEWS ---

def get_default_admin():
    admin = User.objects.filter(is_superuser=True).first()
    if not admin:
        admin = User.objects.filter(username='admin').first()
    if not admin:
        admin = User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    return admin


def register_view(request):
    # Registration is disabled for CodeVault, redirect to dashboard
    return redirect('dashboard')


def login_view(request):
    # Redirect directly to Django Admin login
    return redirect('/admin/login/?next=/')


def logout_view(request):
    logout(request)
    return redirect('dashboard')


# --- APPLICATION VIEWS ---

def dashboard_view(request):
    # Core Stats
    total_problems = Problem.objects.count()
    total_templates = Template.objects.count()
    total_notes = Note.objects.count()
    total_mistakes = Mistake.objects.count()

    # Solved vs Attempted counts
    solved_count = Problem.objects.filter(status='Solved').count()
    attempted_count = Problem.objects.filter(status='Attempted').count()
    todo_count = Problem.objects.filter(status='To Do').count()

    # Pending revisions
    pending_revisions = Revision.objects.filter(completed=False).count()

    # Dynamic recent activities compiled from notes, templates, and problems
    recent_activities = []
    
    recent_notes = Note.objects.all().order_by('-updated_at')[:3]
    for rn in recent_notes:
        recent_activities.append({
            'type': 'Note Saved',
            'title': rn.title,
            'topic': rn.topic.title,
            'id': rn.id,
            'url': f'/notes/{rn.id}/',
            'time': rn.updated_at.strftime('%Y-%m-%d %H:%M')
        })

    recent_probs = Problem.objects.all().order_by('-id')[:3]
    for rp in recent_probs:
        recent_activities.append({
            'type': 'Task Logged',
            'title': rp.name,
            'topic': rp.topic.title,
            'id': rp.id,
            'url': f'/problems/{rp.id}/',
            'time': rp.date_solved.strftime('%Y-%m-%d')
        })

    recent_activities = sorted(recent_activities, key=lambda x: x['time'], reverse=True)[:5]

    # Quick list for Featured Topics and Recently Added items
    topics = Topic.objects.all()[:4]
    templates = Template.objects.all().order_by('-id')[:4]
    problems = Problem.objects.all().order_by('-id')[:4]

    context = {
        'total_problems': total_problems,
        'total_templates': total_templates,
        'total_notes': total_notes,
        'total_mistakes': total_mistakes,
        'solved_count': solved_count,
        'attempted_count': attempted_count,
        'todo_count': todo_count,
        'pending_revisions': pending_revisions,
        'recent_activities': recent_activities,
        'topics': topics,
        'templates': templates,
        'problems': problems,
        'current_tab': 'dashboard',
    }
    return render(request, 'core/dashboard.html', context)


def topics_view(request):
    topics = Topic.objects.all()
    
    # Get current bookmarks list (authenticated vs guest)
    if request.user.is_authenticated:
        bookmarks_list = Bookmark.objects.filter(user=request.user, item_type='topic').values_list('item_id', flat=True)
    else:
        guest_bms = request.session.get('guest_bookmarks', [])
        bookmarks_list = [bm.split(':', 1)[1] for bm in guest_bms if bm.startswith('topic:')]

    # Attach bookmark status and statistics to each topic
    processed_topics = []
    for t in topics:
        is_bookmarked = t.id in bookmarks_list or str(t.id) in bookmarks_list
        problems_count = Problem.objects.filter(topic=t).count()
        solved_count = Problem.objects.filter(topic=t, status='Solved').count()
        processed_topics.append({
            'topic': t,
            'is_bookmarked': is_bookmarked,
            'problems_count': problems_count,
            'solved_count': solved_count,
            'tags': t.get_tags_list()
        })

    context = {
        'topics': processed_topics,
        'current_tab': 'topics',
    }
    return render(request, 'core/topics.html', context)


# --- TOPIC DETAIL VIEW (docs style) ---

def topic_detail_view(request, id):
    topic = get_object_or_404(Topic, id=id)
    
    topics = Topic.objects.all()
    
    # Fetch all details related to this topic
    notes = Note.objects.filter(topic=topic).order_by('-updated_at')
    templates = Template.objects.filter(topic=topic).order_by('-id')
    problems = Problem.objects.filter(topic=topic).order_by('status', '-id')
    videos = Video.objects.filter(topic=topic).order_by('-id')
    
    # Mistakes linked to these problems
    problem_ids = problems.values_list('id', flat=True)
    mistakes = Mistake.objects.filter(problem_id__in=problem_ids).order_by('-id')
    
    # Sequence navigation (cp-algorithms style previous/next)
    topic_list = list(topics)
    current_index = -1
    for idx, t in enumerate(topic_list):
        if t.id == topic.id:
            current_index = idx
            break
            
    prev_topic = topic_list[current_index - 1] if current_index > 0 else None
    next_topic = topic_list[current_index + 1] if current_index < len(topic_list) - 1 else None
    
    # Check bookmark status
    if request.user.is_authenticated:
        is_bookmarked = Bookmark.objects.filter(user=request.user, item_type='topic', item_id=topic.id).exists()
    else:
        is_bookmarked = f"topic:{topic.id}" in request.session.get('guest_bookmarks', [])
        
    context = {
        'topic': topic,
        'topics': topics,
        'notes': notes,
        'templates': templates,
        'problems': problems,
        'videos': videos,
        'mistakes': mistakes,
        'prev_topic': prev_topic,
        'next_topic': next_topic,
        'is_bookmarked': is_bookmarked,
        'current_tab': 'topics',
    }
    return render(request, 'core/topic_detail.html', context)


# --- NOTES READ-ONLY & CRUD ---

from django.db.models import Q

def notes_view(request):
    notes = Note.objects.all().order_by('-updated_at')
    topics = Topic.objects.all()

    topic_id = request.GET.get("topic")

    try:
        selected_topic_id = int(topic_id) if topic_id else None
    except ValueError:
        selected_topic_id = None

    if selected_topic_id:
        notes = notes.filter(topic_id=selected_topic_id)

    q = request.GET.get("q")
    if q:
        notes = notes.filter(
            Q(title__icontains=q) |
            Q(content__icontains=q) |
            Q(tags__icontains=q)
        )

    if request.user.is_authenticated:
        bookmarked_ids = Bookmark.objects.filter(
            user=request.user,
            item_type="note"
        ).values_list("item_id", flat=True)
    else:
        guest_bms = request.session.get("guest_bookmarks", [])
        bookmarked_ids = [
            bm.split(":", 1)[1]
            for bm in guest_bms
            if bm.startswith("note:")
        ]

    for n in notes:
        n.is_bookmarked = (
            str(n.id) in bookmarked_ids or
            n.id in bookmarked_ids
        )

    context = {
        "notes": notes,
        "topics": topics,
        "selected_topic_id": selected_topic_id,
        "search_query": q,
        "current_tab": "notes",
    }

    return render(request, "core/notes.html", context)


def note_detail_view(request, pk):
    note = get_object_or_404(Note, pk=pk)
    
    if request.user.is_authenticated:
        is_bookmarked = Bookmark.objects.filter(user=request.user, item_type='note', item_id=str(note.id)).exists()
    else:
        is_bookmarked = f"note:{note.id}" in request.session.get('guest_bookmarks', [])
        
    context = {
        'note': note,
        'is_bookmarked': is_bookmarked,
        'current_tab': 'notes',
    }
    return render(request, 'core/note_detail.html', context)


@login_required(login_url='/admin/login/')
def note_create(request):
    if request.method == 'POST':
        topic_id = request.POST.get('topic_id')
        topic = get_object_or_404(Topic, id=topic_id)
        Note.objects.create(
            user=request.user,
            topic=topic,
            title=request.POST.get('title'),
            content=request.POST.get('content'),
            code_block=request.POST.get('code_block', ''),
            formula_section=request.POST.get('formula_section', ''),
            important_tips=request.POST.get('important_tips', ''),
            references=request.POST.get('references', ''),
            tags=request.POST.get('tags', '')
        )
    return redirect('notes')


@login_required(login_url='/admin/login/')
def note_edit(request, pk):
    note = get_object_or_404(Note, pk=pk)
    if request.method == 'POST':
        topic_id = request.POST.get('topic_id')
        topic = get_object_or_404(Topic, id=topic_id)
        note.topic = topic
        note.title = request.POST.get('title')
        note.content = request.POST.get('content')
        note.code_block = request.POST.get('code_block', '')
        note.formula_section = request.POST.get('formula_section', '')
        note.important_tips = request.POST.get('important_tips', '')
        note.references = request.POST.get('references', '')
        note.tags = request.POST.get('tags', '')
        note.save()
    return redirect('notes')


@login_required(login_url='/admin/login/')
def note_delete(request, pk):
    note = get_object_or_404(Note, pk=pk)
    if request.method == 'POST':
        note.delete()
    return redirect('notes')


# --- TEMPLATES READ-ONLY & CRUD ---

def templates_view(request):
    templates = Template.objects.all().order_by('-id')
    topics = Topic.objects.all()

    topic_id = request.GET.get('topic')
    if topic_id:
        templates = templates.filter(topic_id=topic_id)

    q = request.GET.get('q')
    if q:
        templates = templates.filter(Q(title__icontains=q) | Q(explanation__icontains=q))

    # Determine guest/authenticated bookmarks
    if request.user.is_authenticated:
        bookmarked_ids = Bookmark.objects.filter(user=request.user, item_type='template').values_list('item_id', flat=True)
    else:
        guest_bms = request.session.get('guest_bookmarks', [])
        bookmarked_ids = [bm.split(':', 1)[1] for bm in guest_bms if bm.startswith('template:')]

    for t in templates:
        t.is_bookmarked = str(t.id) in bookmarked_ids or t.id in bookmarked_ids

    context = {
        'templates': templates,
        'topics': topics,
        'selected_topic_id': topic_id,
        'search_query': q,
        'current_tab': 'templates',
    }
    return render(request, 'core/templates.html', context)


def template_detail_view(request, pk):
    template = get_object_or_404(Template, pk=pk)
    
    if request.user.is_authenticated:
        is_bookmarked = Bookmark.objects.filter(user=request.user, item_type='template', item_id=str(template.id)).exists()
    else:
        is_bookmarked = f"template:{template.id}" in request.session.get('guest_bookmarks', [])
        
    context = {
        'template': template,
        'is_bookmarked': is_bookmarked,
        'current_tab': 'templates',
    }
    return render(request, 'core/template_detail.html', context)


@login_required(login_url='/admin/login/')
def template_create(request):
    if request.method == 'POST':
        topic_id = request.POST.get('topic_id')
        topic = get_object_or_404(Topic, id=topic_id)
        Template.objects.create(
            user=request.user,
            topic=topic,
            title=request.POST.get('title'),
            code=request.POST.get('code'),
            explanation=request.POST.get('explanation'),
            complexity_time=request.POST.get('complexity_time', ''),
            complexity_space=request.POST.get('complexity_space', '')
        )
    return redirect('templates')


@login_required(login_url='/admin/login/')
def template_edit(request, pk):
    template = get_object_or_404(Template, pk=pk, user=request.user)
    if request.method == 'POST':
        topic_id = request.POST.get('topic_id')
        topic = get_object_or_404(Topic, id=topic_id)
        template.topic = topic
        template.title = request.POST.get('title')
        template.code = request.POST.get('code')
        template.explanation = request.POST.get('explanation')
        template.complexity_time = request.POST.get('complexity_time', '')
        template.complexity_space = request.POST.get('complexity_space', '')
        template.save()
    return redirect('templates')


@login_required(login_url='/admin/login/')
def template_delete(request, pk):
    template = get_object_or_404(Template, pk=pk, user=request.user)
    if request.method == 'POST':
        template.delete()
    return redirect('templates')


# --- SNIPPETS READ-ONLY & CRUD ---

def snippets_view(request):
    admin_user = get_default_admin()
    snippets = Snippet.objects.filter(user=admin_user).order_by('-id')

    lang = request.GET.get('language')
    if lang:
        snippets = snippets.filter(language=lang)

    q = request.GET.get('q')
    if q:
        snippets = snippets.filter(Q(title__icontains=q) | Q(description__icontains=q) | Q(tags__icontains=q))

    context = {
        'snippets': snippets,
        'selected_lang': lang,
        'search_query': q,
        'current_tab': 'snippets',
    }
    return render(request, 'core/snippets.html', context)


@login_required(login_url='/admin/login/')
def snippet_create(request):
    if request.method == 'POST':
        Snippet.objects.create(
            user=request.user,
            title=request.POST.get('title'),
            code=request.POST.get('code'),
            language=request.POST.get('language'),
            description=request.POST.get('description', ''),
            tags=request.POST.get('tags', '')
        )
    return redirect('snippets')


@login_required(login_url='/admin/login/')
def snippet_edit(request, pk):
    snippet = get_object_or_404(Snippet, pk=pk, user=request.user)
    if request.method == 'POST':
        snippet.title = request.POST.get('title')
        snippet.code = request.POST.get('code')
        snippet.language = request.POST.get('language')
        snippet.description = request.POST.get('description', '')
        snippet.tags = request.POST.get('tags', '')
        snippet.save()
    return redirect('snippets')


@login_required(login_url='/admin/login/')
def snippet_delete(request, pk):
    snippet = get_object_or_404(Snippet, pk=pk, user=request.user)
    if request.method == 'POST':
        snippet.delete()
    return redirect('snippets')


# --- PROBLEMS READ-ONLY & CRUD ---

def problems_view(request):
    problems = Problem.objects.all().order_by('-id')
    topics = Topic.objects.all()

    topic_id = request.GET.get('topic')
    if topic_id:
        problems = problems.filter(topic_id=topic_id)

    platform = request.GET.get('platform')
    if platform:
        problems = problems.filter(platform=platform)

    status = request.GET.get('status')
    if status:
        problems = problems.filter(status=status)

    q = request.GET.get('q')
    if q:
        problems = problems.filter(Q(name__icontains=q) | Q(explanation__icontains=q) | Q(tags__icontains=q))

    # Determine guest/authenticated bookmarks
    if request.user.is_authenticated:
        bookmarked_ids = Bookmark.objects.filter(user=request.user, item_type='problem').values_list('item_id', flat=True)
    else:
        guest_bms = request.session.get('guest_bookmarks', [])
        bookmarked_ids = [bm.split(':', 1)[1] for bm in guest_bms if bm.startswith('problem:')]

    for p in problems:
        p.is_bookmarked = str(p.id) in bookmarked_ids or p.id in bookmarked_ids

    context = {
        'problems': problems,
        'topics': topics,
        'selected_topic_id': topic_id,
        'selected_platform': platform,
        'selected_status': status,
        'search_query': q,
        'current_tab': 'problems',
    }
    return render(request, 'core/problems.html', context)


def problem_detail_view(request, pk):
    problem = get_object_or_404(Problem, pk=pk)
    mistakes = Mistake.objects.filter(problem=problem)
    
    if request.user.is_authenticated:
        is_bookmarked = Bookmark.objects.filter(user=request.user, item_type='problem', item_id=str(problem.id)).exists()
    else:
        is_bookmarked = f"problem:{problem.id}" in request.session.get('guest_bookmarks', [])
        
    context = {
        'problem': problem,
        'mistakes': mistakes,
        'is_bookmarked': is_bookmarked,
        'current_tab': 'problems',
    }
    return render(request, 'core/problem_detail.html', context)


@login_required(login_url='/admin/login/')
def problem_create(request):
    if request.method == 'POST':
        topic_id = request.POST.get('topic_id')
        topic = get_object_or_404(Topic, id=topic_id)
        Problem.objects.create(
            user=request.user,
            topic=topic,
            name=request.POST.get('name'),
            platform=request.POST.get('platform', 'LeetCode'),
            link=request.POST.get('link', ''),
            difficulty=request.POST.get('difficulty', 'Easy'),
            tags=request.POST.get('tags', ''),
            status=request.POST.get('status', 'To Do'),
            my_code=request.POST.get('my_code', ''),
            explanation=request.POST.get('explanation', ''),
            better_solution=request.POST.get('better_solution', ''),
            mistakes=request.POST.get('mistakes', ''),
            editorial_link=request.POST.get('editorial_link', ''),
            video_link=request.POST.get('video_link', ''),
            time_complexity=request.POST.get('time_complexity', ''),
            space_complexity=request.POST.get('space_complexity', '')
        )
    return redirect('problems')


@login_required(login_url='/admin/login/')
def problem_edit(request, pk):
    prob = get_object_or_404(Problem, pk=pk)
    if request.method == 'POST':
        topic_id = request.POST.get('topic_id')
        topic = get_object_or_404(Topic, id=topic_id)
        prob.topic = topic
        prob.name = request.POST.get('name')
        prob.platform = request.POST.get('platform', 'LeetCode')
        prob.link = request.POST.get('link', '')
        prob.difficulty = request.POST.get('difficulty', 'Easy')
        prob.tags = request.POST.get('tags', '')
        prob.status = request.POST.get('status', 'To Do')
        prob.my_code = request.POST.get('my_code', '')
        prob.explanation = request.POST.get('explanation', '')
        prob.better_solution = request.POST.get('better_solution', '')
        prob.mistakes = request.POST.get('mistakes', '')
        prob.editorial_link = request.POST.get('editorial_link', '')
        prob.video_link = request.POST.get('video_link', '')
        prob.time_complexity = request.POST.get('time_complexity', '')
        prob.space_complexity = request.POST.get('space_complexity', '')
        prob.save()

        # Update problem_name in revisions and mistakes
        Revision.objects.filter(problem=prob).update(problem_name=prob.name)
        Mistake.objects.filter(problem=prob).update(problem_name=prob.name)

    return redirect('problems')


@login_required(login_url='/admin/login/')
def problem_delete(request, pk):
    prob = get_object_or_404(Problem, pk=pk)
    if request.method == 'POST':
        prob.delete()
    return redirect('problems')


# --- VIDEOS READ-ONLY & CRUD ---

def videos_view(request):
    videos = Video.objects.all().order_by('-id')
    topics = Topic.objects.all()

    topic_id = request.GET.get('topic')
    if topic_id:
        videos = videos.filter(topic_id=topic_id)

    q = request.GET.get('q')
    if q:
        videos = videos.filter(Q(title__icontains=q) | Q(description__icontains=q))

    context = {
        'videos': videos,
        'topics': topics,
        'selected_topic_id': topic_id,
        'search_query': q,
        'current_tab': 'videos',
    }
    return render(request, 'core/videos.html', context)


@login_required(login_url='/admin/login/')
def video_create(request):
    if request.method == 'POST':
        topic_id = request.POST.get('topic_id')
        topic = get_object_or_404(Topic, id=topic_id)
        
        youtube_url = request.POST.get('youtube_url')
        youtube_id = ""
        match = re.search(r'(?:v=|\/embed\/|\/1\/|\/v\/|https:\/\/youtu\.be\/)([^"&?\/\s]{11})', youtube_url)
        if match:
            youtube_id = match.group(1)

        Video.objects.create(
            user=request.user,
            topic=topic,
            title=request.POST.get('title'),
            youtube_url=youtube_url,
            youtube_id=youtube_id,
            description=request.POST.get('description', ''),
            notes=request.POST.get('notes', ''),
            timestamps=request.POST.get('timestamps', '')
        )
    return redirect('videos')


@login_required(login_url='/admin/login/')
def video_edit(request, pk):
    video = get_object_or_404(Video, pk=pk)
    if request.method == 'POST':
        topic_id = request.POST.get('topic_id')
        topic = get_object_or_404(Topic, id=topic_id)
        video.topic = topic
        video.title = request.POST.get('title')
        video.youtube_url = request.POST.get('youtube_url')
        
        match = re.search(r'(?:v=|\/embed\/|\/1\/|\/v\/|https:\/\/youtu\.be\/)([^"&?\/\s]{11})', video.youtube_url)
        if match:
            video.youtube_id = match.group(1)
            
        video.description = request.POST.get('description', '')
        video.notes = request.POST.get('notes', '')
        video.timestamps = request.POST.get('timestamps', '')
        video.save()
    return redirect('videos')


@login_required(login_url='/admin/login/')
def video_delete(request, pk):
    video = get_object_or_404(Video, pk=pk)
    if request.method == 'POST':
        video.delete()
    return redirect('videos')


# --- MISTAKES JOURNAL READ-ONLY & CRUD ---

def mistakes_view(request):
    mistakes = Mistake.objects.all().order_by('-id')
    problems = Problem.objects.all().order_by('name')

    q = request.GET.get('q')
    if q:
        mistakes = mistakes.filter(Q(problem_name__icontains=q) | Q(mistake__icontains=q) | Q(lesson_learned__icontains=q))

    context = {
        'mistakes': mistakes,
        'problems': problems,
        'search_query': q,
        'current_tab': 'mistakes',
    }
    return render(request, 'core/mistakes.html', context)


@login_required(login_url='/admin/login/')
def mistake_create(request):
    if request.method == 'POST':
        problem_id = request.POST.get('problem_id')
        problem = None
        problem_name = request.POST.get('problem_name')

        if problem_id:
            problem = get_object_or_404(Problem, pk=problem_id)
            problem_name = problem.name

        Mistake.objects.create(
            user=request.user,
            problem=problem,
            problem_name=problem_name,
            mistake=request.POST.get('mistake'),
            wrong_approach=request.POST.get('wrong_approach', ''),
            correct_approach=request.POST.get('correct_approach', ''),
            lesson_learned=request.POST.get('lesson_learned', '')
        )
    return redirect('mistakes')


@login_required(login_url='/admin/login/')
def mistake_edit(request, pk):
    mistake_obj = get_object_or_404(Mistake, pk=pk)
    if request.method == 'POST':
        problem_id = request.POST.get('problem_id')
        if problem_id:
            problem = get_object_or_404(Problem, pk=problem_id)
            mistake_obj.problem = problem
            mistake_obj.problem_name = problem.name
        else:
            mistake_obj.problem = None
            mistake_obj.problem_name = request.POST.get('problem_name')

        mistake_obj.mistake = request.POST.get('mistake')
        mistake_obj.wrong_approach = request.POST.get('wrong_approach', '')
        mistake_obj.correct_approach = request.POST.get('correct_approach', '')
        mistake_obj.lesson_learned = request.POST.get('lesson_learned', '')
        mistake_obj.save()
    return redirect('mistakes')


@login_required(login_url='/admin/login/')
def mistake_delete(request, pk):
    mistake_obj = get_object_or_404(Mistake, pk=pk)
    if request.method == 'POST':
        mistake_obj.delete()
    return redirect('mistakes')


# --- REVISIONS PLANNER READ-ONLY & CRUD ---

def revisions_view(request):
    revisions = Revision.objects.all().order_by('completed', 'next_revision_date')
    problems = Problem.objects.all().order_by('name')

    pending_count = revisions.filter(completed=False).count()
    completed_count = revisions.filter(completed=True).count()

    q = request.GET.get('q')
    if q:
        revisions = revisions.filter(problem_name__icontains=q)

    priority = request.GET.get('priority')
    if priority:
        revisions = revisions.filter(priority=priority)

    context = {
        'revisions': revisions,
        'problems': problems,
        'pending_count': pending_count,
        'completed_count': completed_count,
        'search_query': q,
        'selected_priority': priority,
        'current_tab': 'revisions',
    }
    return render(request, 'core/revisions.html', context)


@login_required(login_url='/admin/login/')
def revision_create(request):
    if request.method == 'POST':
        problem_id = request.POST.get('problem_id')
        problem = get_object_or_404(Problem, pk=problem_id)
        next_date = request.POST.get('next_revision_date')

        Revision.objects.create(
            user=request.user,
            problem=problem,
            problem_name=problem.name,
            next_revision_date=next_date,
            priority=request.POST.get('priority', 'Medium')
        )
    return redirect('revisions')


@login_required(login_url='/admin/login/')
def revision_toggle(request, pk):
    revision = get_object_or_404(Revision, pk=pk)
    if request.method == 'POST':
        revision.completed = not revision.completed
        revision.save()
    return redirect('revisions')


@login_required(login_url='/admin/login/')
def revision_delete(request, pk):
    revision = get_object_or_404(Revision, pk=pk)
    if request.method == 'POST':
        revision.delete()
    return redirect('revisions')


# --- BOOKMARKS TOGGLE & READ-ONLY VIEW ---

def bookmark_toggle(request, item_type, item_id):
    if request.method == 'POST':
        if request.user.is_authenticated:
            # Authenticated user Bookmark model
            bm = Bookmark.objects.filter(user=request.user, item_type=item_type, item_id=item_id)
            if bm.exists():
                bm.delete()
                bookmarked = False
            else:
                Bookmark.objects.create(user=request.user, item_type=item_type, item_id=item_id)
                bookmarked = True
        else:
            # Guest user session array
            guest_bms = request.session.get('guest_bookmarks', [])
            bm_key = f"{item_type}:{item_id}"
            if bm_key in guest_bms:
                guest_bms.remove(bm_key)
                bookmarked = False
            else:
                guest_bms.append(bm_key)
                bookmarked = True
            request.session['guest_bookmarks'] = guest_bms
            request.session.modified = True

        if request.headers.get('x-requested-with') == 'XMLHttpRequest' or request.GET.get('ajax') == '1':
            return JsonResponse({'success': True, 'bookmarked': bookmarked})

        next_url = request.META.get('HTTP_REFERER', 'topics')
        return redirect(next_url)

    return HttpResponseForbidden()


def bookmarks_view(request):
    bookmarked_items = []

    if request.user.is_authenticated:
        bookmarks = Bookmark.objects.filter(user=request.user).order_by('-created_at')
        for b in bookmarks:
            item = None
            if b.item_type == 'topic':
                try:
                    topic = Topic.objects.get(id=b.item_id)
                    item = {'title': topic.title, 'desc': topic.description, 'url': f'/topics/{topic.id}/', 'type': 'Topic'}
                except Topic.DoesNotExist:
                    pass
            elif b.item_type == 'note':
                try:
                    note = Note.objects.get(pk=b.item_id)
                    item = {'title': note.title, 'desc': note.content[:100] + '...', 'url': f'/notes/{note.id}/', 'type': 'Note'}
                except Note.DoesNotExist:
                    pass
            elif b.item_type == 'problem':
                try:
                    prob = Problem.objects.get(pk=b.item_id)
                    item = {'title': prob.name, 'desc': prob.explanation[:100] + '...', 'url': f'/problems/{prob.id}/', 'type': 'Web Task'}
                except Problem.DoesNotExist:
                    pass
            elif b.item_type == 'template':
                try:
                    template = Template.objects.get(pk=b.item_id)
                    item = {'title': template.title, 'desc': template.explanation[:100] + '...', 'url': f'/templates/{template.id}/', 'type': 'Template'}
                except Template.DoesNotExist:
                    pass

            if item:
                item['id'] = b.id
                item['item_id'] = b.item_id
                item['item_type'] = b.item_type
                bookmarked_items.append(item)
    else:
        guest_bms = request.session.get('guest_bookmarks', [])
        for bm_key in guest_bms:
            if ':' not in bm_key:
                continue
            item_type, item_id = bm_key.split(':', 1)
            item = None
            if item_type == 'topic':
                try:
                    topic = Topic.objects.get(id=item_id)
                    item = {'title': topic.title, 'desc': topic.description, 'url': f'/topics/{topic.id}/', 'type': 'Topic'}
                except Topic.DoesNotExist:
                    pass
            elif item_type == 'note':
                try:
                    note = Note.objects.get(pk=item_id)
                    item = {'title': note.title, 'desc': note.content[:100] + '...', 'url': f'/notes/{item_id}/', 'type': 'Note'}
                except Note.DoesNotExist:
                    pass
            elif item_type == 'problem':
                try:
                    prob = Problem.objects.get(pk=item_id)
                    item = {'title': prob.name, 'desc': prob.explanation[:100] + '...', 'url': f'/problems/{item_id}/', 'type': 'Web Task'}
                except Problem.DoesNotExist:
                    pass
            elif item_type == 'template':
                try:
                    template = Template.objects.get(pk=item_id)
                    item = {'title': template.title, 'desc': template.explanation[:100] + '...', 'url': f'/templates/{item_id}/', 'type': 'Template'}
                except Template.DoesNotExist:
                    pass

            if item:
                item['id'] = bm_key
                item['item_id'] = item_id
                item['item_type'] = item_type
                bookmarked_items.append(item)

    context = {
        'bookmarks': bookmarked_items,
        'current_tab': 'bookmarks',
    }
    return render(request, 'core/bookmarks.html', context)
