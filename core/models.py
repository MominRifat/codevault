from django.db import models
from django.contrib.auth.models import User

class Topic(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    title = models.CharField(max_length=100)
    description = models.TextField()
    difficulty = models.CharField(max_length=20, choices=[('Easy', 'Easy'), ('Medium', 'Medium'), ('Hard', 'Hard')])
    tags = models.CharField(max_length=200, help_text="Comma-separated list of tags")
    related_topics = models.CharField(max_length=200, help_text="Comma-separated list of related topic IDs")
    cover_url = models.URLField(max_length=300)

    def __str__(self):
        return self.title

    def get_tags_list(self):
        return [t.strip() for t in self.tags.split(',') if t.strip()]

    def get_related_topics_list(self):
        return [t.strip() for t in self.related_topics.split(',') if t.strip()]


class Note(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='notes')
    title = models.CharField(max_length=150)
    content = models.TextField()
    code_block = models.TextField(blank=True)
    formula_section = models.TextField(blank=True)
    important_tips = models.TextField(blank=True)
    references = models.TextField(blank=True, help_text="Newline-separated list of reference links or texts")
    tags = models.CharField(max_length=200, help_text="Comma-separated list of tags")
    updated_at = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    def get_tags_list(self):
        return [t.strip() for t in self.tags.split(',') if t.strip()]

    def get_references_list(self):
        return [r.strip() for r in self.references.split('\n') if r.strip()]


class Template(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='templates')
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='templates')
    title = models.CharField(max_length=150)
    code = models.TextField()
    explanation = models.TextField()
    complexity_time = models.CharField(max_length=50, blank=True)
    complexity_space = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.title


class Snippet(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='snippets')
    title = models.CharField(max_length=150)
    code = models.TextField()
    language = models.CharField(max_length=30, choices=[
        ('python', 'Python'),
        ('django', 'Django'),
        ('html', 'HTML'),
        ('css', 'CSS'),
        ('javascript', 'JavaScript')
    ])
    description = models.TextField(blank=True)
    tags = models.CharField(max_length=200, help_text="Comma-separated list of tags")

    def __str__(self):
        return self.title

    def get_tags_list(self):
        return [t.strip() for t in self.tags.split(',') if t.strip()]


class Problem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='problems')
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='problems')
    name = models.CharField(max_length=150)
    platform = models.CharField(max_length=50, choices=[
        ('Frontend Mentor', 'Frontend Mentor'),
        ('LeetCode', 'LeetCode'),
        ('GitHub', 'GitHub'),
        ('HackerRank', 'HackerRank'),
        ('Project Euler', 'Project Euler'),
        ('Personal Project', 'Personal Project')
    ])
    link = models.URLField(blank=True)
    difficulty = models.CharField(max_length=20, choices=[('Easy', 'Easy'), ('Medium', 'Medium'), ('Hard', 'Hard')])
    tags = models.CharField(max_length=200, help_text="Comma-separated list of tags")
    status = models.CharField(max_length=20, choices=[('Solved', 'Solved'), ('Attempted', 'Attempted'), ('To Do', 'To Do')])
    my_code = models.TextField(blank=True)
    explanation = models.TextField(blank=True)
    mistakes = models.TextField(blank=True)
    better_solution = models.TextField(blank=True)
    editorial_link = models.URLField(blank=True)
    video_link = models.URLField(blank=True)
    time_complexity = models.CharField(max_length=50, blank=True)
    space_complexity = models.CharField(max_length=50, blank=True)
    date_solved = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.name

    def get_tags_list(self):
        return [t.strip() for t in self.tags.split(',') if t.strip()]


class Video(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='videos')
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='videos')
    title = models.CharField(max_length=150)
    youtube_url = models.URLField()
    youtube_id = models.CharField(max_length=30)
    description = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    timestamps = models.TextField(blank=True, help_text="Format: MM:SS - Label, one per line")

    def __str__(self):
        return self.title

    def get_timestamps_list(self):
        items = []
        for line in self.timestamps.split('\n'):
            line = line.strip()
            if not line:
                continue
            if '-' in line:
                parts = line.split('-', 1)
                items.append({'time': parts[0].strip(), 'label': parts[1].strip()})
            else:
                items.append({'time': '', 'label': line})
        return items


class Mistake(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mistakes')
    problem = models.ForeignKey(Problem, on_delete=models.SET_NULL, null=True, blank=True, related_name='linked_mistakes')
    problem_name = models.CharField(max_length=150)
    mistake = models.CharField(max_length=200)
    wrong_approach = models.TextField(blank=True)
    correct_approach = models.TextField(blank=True)
    lesson_learned = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.problem_name} - {self.mistake}"


class Revision(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='revisions')
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='revisions')
    problem_name = models.CharField(max_length=150)
    next_revision_date = models.DateField()
    priority = models.CharField(max_length=20, choices=[('Low', 'Low'), ('Medium', 'Medium'), ('High', 'High')])
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f"Revision: {self.problem_name}"


class Bookmark(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookmarks')
    item_type = models.CharField(max_length=30) # 'topic', 'note', 'problem', 'template'
    item_id = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Bookmark: {self.item_type} - {self.item_id}"
