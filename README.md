<div align="center">

# 🔐 CodeVault — Secure Developer Snippet & Knowledge Vault

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-Full--Stack-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Security](https://img.shields.io/badge/Security-Encrypted_Storage-blueviolet?style=for-the-badge&logo=auth0&logoColor=white)](#)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](#)

<p align="center">
  <b>A modern, developer-centric repository for organizing, tagging, searching, and safeguarding code snippets, algorithms, configurations, and technical notes.</b>
</p>

---

</div>

## 📌 Overview

**CodeVault** is engineered for developers who need instant access to their personal library of trusted code snippets, reusable patterns, and technical cheat-sheets. Featuring full-text search, syntax highlighting, and categorized tagging, CodeVault ensures your most important scripts and algorithms are never lost.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client_Tier["💻 Client Interface"]
        UI["Web Dashboard & Syntax Editor (HTML5 / Modern CSS / JS)"]
    end

    subgraph App_Tier["⚙️ Application Logic (Django Core)"]
        Router["URL Dispatcher & Middleware"]
        CoreApp["📁 core / devvault Modules"]
        Tagging["🏷️ Tagging & Categorization Engine"]
        SearchEngine["🔍 Full-Text Filter & Indexer"]
        AuthModule["🔑 User Authentication & Access Permissions"]
    end

    subgraph Data_Tier["💾 Persistence Layer"]
        DB[("SQLite / PostgreSQL Database")]
        StaticStore["📦 Static Assets & Highlight.js Themes"]
    end

    UI <--> Router
    Router --> CoreApp
    CoreApp <--> AuthModule
    CoreApp <--> Tagging
    CoreApp <--> SearchEngine
    CoreApp <--> DB
    CoreApp <--> StaticStore
```

---

## 🌟 Core Features

- **Multi-Language Syntax Highlighting**: Clean visualization for Python, C/C++, Java, JavaScript, SQL, Bash, and more.
- **Tag-Based Taxonomy**: Organize snippets by project, technology, utility, or algorithm type.
- **Fast Search & Filtering**: Instant keyword lookup across snippet titles, tags, and code contents.
- **Private & Public Visibility**: Toggle whether snippets are visible only to the authenticated owner or shared across teams.
- **One-Click Copy & Export**: Instant clipboard integration and raw file download.

---

## 📂 Repository Structure

```plaintext
codevault/
├── 📁 devvault/               # Django root project configuration
├── 📁 core/                   # Snippet models, views, and forms
├── 📁 src/                    # Source frontend assets & scripts
├── 📁 staticfiles/            # Compiled CSS, JS, and syntax themes
├── 📄 manage.py               # Django administrative CLI
├── 📄 package.json            # Node.js dependencies & scripts
├── 📄 requirements.txt        # Python backend dependencies
└── 📄 README.md               # Documentation
```

---

## ⚡ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MominRifat/codevault.git
   cd codevault
   ```

2. **Set up virtual environment:**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize database & launch:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   python manage.py runserver
   ```
   *Access your vault at `http://127.0.0.1:8000/`.*

---

## 👨‍💻 Author

**Momin Rifat**  
- GitHub: [@MominRifat](https://github.com/MominRifat)  
- Location: Dhaka, Bangladesh
