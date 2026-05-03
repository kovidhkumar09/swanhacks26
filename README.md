# Note Annotation Platform

A web application for organizing class notes with support for image, PDF, and video annotations.

---

## Problem

Students struggle to organize notes across different formats (text, PDFs, videos) and lack tools to annotate specific regions or timestamps efficiently.

---

## Solution

This application provides a unified note-taking platform where users can:

- Organize notes by class and unit  
- Upload and view files (images, PDFs, videos)  
- Add time-based comments on videos  
- Add region-based annotations on PDFs  
- Add general comments on any file  

---

## Features

- Class and unit management  
- Text and file-based notes  
- Video timestamp comments (30-second grouping)  
- PDF region selection and annotation  
- Image/file previews  
- Dark/light mode toggle  
- Persistent user session  

---

## Tech Stack

Frontend:
- React (class components)
- CSS

Backend:
- REST API (Java / Spring Boot or equivalent)

Other:
- SessionStorage / LocalStorage
- Fetch API

---

## Architecture

- Frontend communicates with backend via REST endpoints  
- Data model hierarchy:
  - Classes → Units → Notes → Files → Comments  
- Comment types:
  - Video: timestamp-based grouping  
  - PDF: coordinate-based region selection  
  - Generic: standard text comments  

---

## Setup Instructions

### Frontend
```bash
cd frontend
npm install
npm start
