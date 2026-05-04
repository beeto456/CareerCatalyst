<div align="center">
  <img width="800" alt="CareerCatalyst App Screenshot" src="https://merlinsfolio.wordpress.com/wp-content/uploads/2026/05/career1.jpg" />
</div>

# CareerCatalyst

**[🚀 Try out the Live App Here](https://careercatalyst-191253016115.asia-southeast1.run.app/)**
**[📋 Share Your Feedback (User Research Survey)](https://docs.google.com/forms/d/e/1FAIpQLSf_bbLIGf424-sBJ1PQRQbwM15H3X4TYdQ2wmyVQ53-4s6Y-w/viewform)**

## Overview
CareerCatalyst is an interactive web application designed to help job seekers evaluate role compatibility and manage their application pipeline. Originally conceptualized to replace a cumbersome spreadsheet from a career coaching program, this app streamlines the evaluation process. It allows users to paste job descriptions and rate their competency and interest for each requirement, visualizing these averages on an interactive scatter graph to help users determine if they meet the baseline to thrive in the role.

## The Challenge
Job hunting is inherently stressful, especially when managing multiple applications across various portals. Most job seekers use basic spreadsheets or note-taking apps just to track their application status, which ignores a critical factor: objectively evaluating if the job is actually a good fit for their skills and long-term interests. Previously, doing this evaluation required copying job requirements line-by-line into a tedious Excel spreadsheet.

**Problem Statement:** How might we create a tool that not only tracks job application statuses but also helps job seekers quickly and visually evaluate their compatibility with a role in a frictionless way?

## The Solution & Key Features
CareerCatalyst was developed to replace a manual workflow with an intuitive, centralized web interface. Key design decisions include:


## Key Features

- **Job Tracking**: Manage your job applications with details like company, role, location, and status.
- **Visual Analytics**: 
  - **Scatter Graph**: Visualize your job opportunities based on competencies and interests.
  - **Job Status Graph**: A comprehensive distribution chart showing your progress across different application stages (Applied, Interviewing, Offered, etc.).
- **Smart Parsing**: Leverages AI to help you extract and organize job information efficiently.
- **Data Export**: Export your job tracking data for offline use or reporting.


## Tech Stack
*   **AI Integration:** Advanced Generative AI via Google AI Studio
*   **Environment:** Node.js

---

## Run Locally
This repository contains everything needed to run the app locally. 

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

