Kaiburr Task 3 – Web UI (React + TypeScript + Ant Design)
Overview

This project is the frontend interface for the Job Manager REST API developed in Task 1.
It allows users to create, view, search, run, and delete tasks stored in the backend MongoDB database through RESTful APIs.

Built using React 19 (Vite + TypeScript) and Ant Design, this web app offers a clean and responsive UI connected to the backend service running on Kubernetes.

Tech Stack
Category	Technology
Frontend Framework	React 19 (Vite + TypeScript)
UI Library	Ant Design v5
HTTP Client	Axios
Styling	Ant Design Components + Custom CSS
Backend API	Spring Boot (Task 1)
Database	MongoDB (in Kubernetes Pod)

Setup Instructions
1️.Prerequisites

Node.js v18+

NPM v9+

Backend (Task 1) running at:
http://localhost:30085/v1/tasks

2️.Clone Repository
git clone https://github.com/<your-username>/kaiburr-task3-webui.git
cd kaiburr-task3-webui

3️.Install Dependencies
npm install

4️.Run the Application
npm run dev


Then open your browser at:
http://localhost:5173

🔗 API Endpoints Used
Operation	Method	Endpoint	Description
Get All Tasks	GET	/v1/tasks	Fetch all tasks
Search by Name	GET	/v1/tasks/find?name=...	Search for tasks
Create Task	PUT	/v1/tasks	Add a new task
Run Task	PUT	/v1/tasks/{id}/execution	Execute task command
Delete Task	DELETE	/v1/tasks/{id}	Delete a task
Screenshots
Task List View

Displays all tasks fetched from the backend.


Search Task

Shows search functionality with filtered results.


Execute Task

Displays output modal after running a task command.


Outcome

This project delivers a fully functional React + Ant Design frontend that integrates seamlessly with the Spring Boot + MongoDB backend.
It demonstrates API integration, responsive design, and user-friendly task management.
