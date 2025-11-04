Y-Ultimate Management Platform (VisionX)
This is an open-source, unified web application built by Team VisionX  for the Tech4Social Good Hackathon. Its mission is to solve data fragmentation for the non-profit Y-Ultimate by replacing their manual Google Sheets and Forms with a single, data-driven platform for managing both tournaments and coaching programs.



The platform digitizes all operations, enabling efficient, transparent, and engaging management for admins, coaches, players, and spectators.

Key Features
The platform is built on a 5-phase plan, with all "Must-Have" features from Phases 1-4 completed.

Phase 1: Foundation & Core Systems 

Unified User Model: A single CustomUser model handles all users.


Role-Based Access Control (RBAC): The app shows different dashboards and controls for all 6 user personas (Admin, Coach, Manager, Volunteer, Player, Spectator).

Authentication: Secure login (/api/users/token/) and public registration for new spectators/players (/api/users/register/).

Phase 2: Tournament Module (MVP) 


Admin Dashboard: Admins can create new tournaments, create users with specific roles, assign child profiles, and generate a full round-robin schedule for a tournament.


Captain Dashboard: Team Managers can create their own teams, register those teams for a tournament, and add players from the public user list to their roster.


Spirit Scoring: A dedicated, 5-category digital spirit scoring form for captains, replacing Google Forms.

Live Scoring: Volunteers have a simple interface to start matches, update scores in real-time, and mark matches as "Final."

Public Schedule: All users (including Spectators) can see a public, real-time schedule of matches with their status (Scheduled, Live, Final) and scores.

Phase 3: Coaching Module (MVP) 


Admin Management: Admins can create and manage centralized ChildProfiles (linking them to a user account) and assign a primary coach.

Session Management: Admins can create new coaching sessions and assign them to specific coaches.

Coach Dashboard: Coaches see a dashboard with their assigned children, upcoming sessions, and past sessions.


Attendance Tracking: Coaches can go to their "Session Attendance" page, manually "Start" a session (marking it LIVE), take attendance for their assigned children, and "End" the session (marking it COMPLETED).


Data Logging: Coaches can log Home Visits and LSAS Assessments for the children assigned to them.

Player View: Players/Spectators can see their own coaching profile, including their assigned coach and their attendance history.


Reporting: A dedicated "Core Reporting" page for Admins to see all coaching program stats.

Phase 4: Community Module 

Resource Repository: A page where all users can view and download files (like rulebooks). Admins have a form to upload new files.


Discussion Hub: A complete forum system where any logged-in user can post a new "Thread" and post "Replies" to existing threads.

🛠 Tech Stack
Category	Technology	Justification
Frontend	React.js	
The component-based architecture was perfect for building the many role-based dashboards and reusable forms (like spirit scoring)[cite: 166].

Backend	Django (DRF)	
Django's "batteries-included" philosophy, especially its built-in Admin and security, was critical for rapidly building the Phase 1 RBAC system[cite: 169].

Database	MySQL	
A powerful relational database was essential to solve the core problem of data fragmentation and manage the complex links between users, children, teams, and tournaments [cite: 173-174].


Export to Sheets

 Architecture
The platform uses a modular, service-oriented design. The React frontend acts as a single user interface that consumes data from three independent backend apps: users, tournament, and coaching_app. This modularity allows for clear separation of concerns and made team-based development possible.

![Application Flowchart](Untitled diagram-2025-10-25-150557.jpg) 

 Getting Started
Prerequisites
Python & Pip

Node.js & npm

A running MySQL server

1. Backend Setup (Django)
Clone the repository: git clone ...

Navigate to the project root: cd visionx

Create requirements.txt: Run pip freeze > requirements.txt (or install the libraries manually: pip install django djangorestframework djangorestframework-simplejwt mysqlclient django-cors-headers).

Install dependencies: pip install -r requirements.txt

Configure Database: Open visionx/settings.py and update the DATABASES setting with your MySQL username, password, and database name.

Run Migrations: python manage.py makemigrations and python manage.py migrate

Create Admin: python manage.py createsuperuser

Run Server: python manage.py runserver

2. Frontend Setup (React)
Open a new terminal.

Navigate to the frontend folder: cd visionx/frontend

Install dependencies: npm install

Run Server: npm start

Your app will be live at http://localhost:3000.

 User Roles & Workflow
Admin: Log in with the superuser you created. Has full access to all dashboards and admin-only pages.

Coach / Captain / Volunteer: Must be created by an Admin using the "Create User" page in the Admin Dashboard.

Spectator / Player: Can register a new account on the public "Register as Spectator?" page.

License
This project is licensed under the MIT License - see the LICENSE file for details.
