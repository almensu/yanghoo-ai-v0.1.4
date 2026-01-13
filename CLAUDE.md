# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

**YangHoo AI** is a full-stack AI-powered video/audio processing application that extracts subtitles, generates transcriptions, and organizes content into a block-based document management system.

**Technology Stack:**
- **Backend**: FastAPI (Python) with WebSocket support, WhisperX for transcription
- **Package Manager**: uv for fast Python dependency management
- **Frontend**: React 18 with Tailwind CSS + DaisyUI, React Router
- **Data**: JSON-based metadata storage with Pydantic models
- **Media Processing**: yt-dlp, ffmpeg, librosa for video/audio handling

## Common Development Commands

### Prerequisites: Installing uv
```bash
# Install uv (fast Python package manager)
curl -LsSf https://astral.sh/uv/install.sh | sh
# Or visit: https://github.com/astral-sh/uv
```

### Starting the Application
```bash
# Start both frontend (port 3000) and backend (port 8000)
./start.sh

# Stop both services
./stop.sh

# Development mode with tmux split-screen log monitoring
./dev.sh
```

**Important**: `start.sh` requires `uv` to be installed. It will automatically sync dependencies using `uv sync` before starting services.

**dev.sh**: Uses tmux to show live backend (blue) and frontend (green) logs in split-screen. Requires tmux installed (`brew install tmux` on macOS).

### Backend Development
```bash
# Using uv (recommended)
cd backend
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Or traditional way
cd backend
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```
- API documentation available at `http://localhost:8000/docs`
- Logs written to `backend.log` in project root

### Frontend Development
```bash
cd frontend
npm install    # Install dependencies
npm start      # Start dev server on port 3000
npm test       # Run tests
npm run build  # Production build
```

**Frontend Architecture Note**: The frontend uses a modular core architecture:
- `frontend/src/core/config/constants.js` - Centralized configuration (API URLs, timeouts, theme)
- `frontend/src/core/api/` - Centralized API client with HTTP and WebSocket modules
- `frontend/src/core/router/index.js` - Route definitions and navigation

API endpoints are defined in `core/api/endpoints.js` for maintainability. All environment-specific configuration uses `REACT_APP_*` prefix (see `.env.example`).

### Managing Python Dependencies
```bash
# Add a new dependency
uv add <package-name>

# Add dev dependency
uv add --dev <package-name>

# Remove a dependency
uv remove <package-name>

# Sync dependencies (install from pyproject.toml)
uv sync

# Run a command in the uv environment
uv run <command>
```

### Data Migration
```bash
# Register existing documents in metadata.json
uv run python backend/migrate_existing_docs.py
```

### Testing and Linting
```bash
# Frontend tests (from frontend directory)
npm test

# Python linting (requires dev dependencies)
uv run black backend/src/       # Format code
uv run ruff check backend/src/  # Lint code
uv run mypy backend/src/        # Type checking
```

## Architecture Overview

### Task-Based Content Processing Pipeline

The application processes media through a multi-stage pipeline:

1. **Ingestion** (`tasks/ingest.py`) - Creates task from URL, fetches initial metadata
2. **Media Download** (`tasks/download_media.py`) - Downloads video/audio with quality selection
3. **Audio Extraction** (`tasks/extract_audio.py`) - Extracts WAV for transcription
4. **Transcription**:
   - `tasks/transcribe_whisperx.py` - WhisperX-based transcription (large-v3 model)
   - `tasks/download_youtueb_vtt.py` - YouTube VTT subtitle downloading
5. **Subtitle Processing** (`tasks/merge_vtt.py`) - VTT to SRT conversion with deduplication
6. **Keyframe Extraction** (`tasks/extract_keyframes.py`) - Scene detection and thumbnail generation

### Block-Based Content Architecture

**Core Concept**: Content is organized into reusable "blocks" (headings, paragraphs, code snippets) that maintain source metadata for traceability.

**Key Components**:

1. **Block Editor** (`components/BlockEditor.js`) - Interactive block-based document editor
   - Parses markdown documents into structured blocks
   - Supports normal mode and block mode editing
   - Drag-and-drop blocks between documents and projects

2. **Project System** (`utils/ProjectManager.js`) - Client-side project organization
   - Projects contain selected blocks and complete documents
   - Stored in localStorage with keys: `yanghoo_projects`, `yanghoo_active_project`
   - Supports export to Newsletter, Markdown, and JSON formats

3. **Block Collection** (`pages/BlockCollectionPage.js`) - Centralized content repository
   - Browse/search collected blocks across all projects
   - Filter by type, project, source
   - Batch operations and export

4. **Document Registry** (`utils/doc_registry.py`) - Backend document metadata management
   - Auto-registers discovered documents in `metadata.json`
   - Tracks document type, category, language, format
   - Supports document renaming with history tracking

5. **Block Registry** (`utils/block_registry.py`) - Backend block/project metadata storage
   - Server-side persistence for blocks and projects
   - Stored in `backend/data/blocks_metadata.json`
   - RESTful API via `routes/blocks.py`

6. **Doc Files API** (`routes/doc_files.py`) - Document file management endpoints
   - CRUD operations for task documents
   - Search and filter by category, type, language
   - Integrated with doc_registry for auto-categorization

### Data Flow

```
User provides URL
    -> Backend: create_ingest_task()
    -> Background tasks process media (download, extract audio, transcribe)
    -> WebSocket broadcasts progress updates
    -> Documents created in task_uuid/ directory
    -> Frontend: BlockEditor parses markdown into blocks
    -> User collects blocks to projects via ProjectManager
    -> Blocks trace back to source task/document/block ID
```

### Key Data Structures

**TaskMetadata** (`schemas.py`): Represents a media processing task
- `uuid`: Unique task identifier
- `platform`: youtube, twitter, podcast, xiaoyuzhou, bilibili
- `media_files`: Downloaded media paths
- `vtt_files`, `srt_files`: Generated subtitle paths
- `whisperx_json_path`: WhisperX transcription output
- `keyframes_json_path`: Extracted keyframes metadata

**BlockItem** (`ProjectManager.js`): A collected content block
```javascript
{
  id: '',              // Unique in project
  taskUuid: '',        // Source task
  filename: '',        // Source document
  blockId: '',         // Block ID in document
  blockIndex: 1,       // Position in document (1-based)
  totalBlocks: 1,      // Total blocks in document
  category: '',        // transcripts|analysis|user_documents|system_generated
  content: '',         // Block content (markdown)
  type: '',           // paragraph|heading|code
  timestamp: {start, end},  // Video timestamp if applicable
  collectTime: '',     // When collected
  order: 0            // Sort order in project
}
```

### Frontend Routing

Main routes (`App.js`):
- `/` - Task list page
- `/studio/:taskUuid` - Main workspace for a task
- `/block` - Block collection page
- `/test/*` - Various test pages for component development

### WebSocket Communication

Backend broadcasts task updates via WebSocket (`ws://127.0.0.1:8000/ws/{task_uuid}`):
- Task progress updates
- File generation notifications
- Error messages

Frontend connects via `AIChat.js` and task-specific components.

## Important Implementation Details

### Document File Naming Convention
- Analysis reports: `{topic}_analysis_MMDD_HHMM.md`
- Framework docs: `{XXX}分析框架_MMDD_HHMM.md`
- User documents: `user_{topic_description}.md`

### Subtitle Deduplication
YouTube VTT subtitles are cumulative and require smart merging:
- `tasks/merge_vtt.py` handles deduplication
- Uses fuzzy matching to identify duplicate content
- Preserves timestamp accuracy

### AI Chat Auto-Save
AI conversations automatically save as documents when:
- Content length > 500 characters
- User message contains keywords: 分析, 总结, 报告, 框架, 方案, 保存
- AI response contains structured content (headings, lists)

### CORS Configuration
Backend accepts requests from:
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://localhost:8080` (Vue)
- `http://localhost:4200` (Angular)

### Environment Configuration
Frontend supports environment variables for API endpoints:
- `REACT_APP_API_BASE_URL` - Backend API URL (default: `http://127.0.0.1:8000`)
- `REACT_APP_WS_BASE_URL` - WebSocket URL (default: `ws://127.0.0.1:8000`)

Create `frontend/.env` or `frontend/.env.local` to override defaults.

## File Structure Notes

- `backend/data/metadata.json` - Central task registry (auto-created)
- `backend/data/metadata_archived.json` - Archived tasks
- `backend/data/blocks_metadata.json` - Block and project registry
- `backend/src/routes/` - API endpoint definitions
- `backend/src/tasks/` - Background task processors
- `backend/src/utils/` - Utilities (block_registry, doc_registry)
- `backend/src/orchestrator.py` - Multi-stage transcription pipeline orchestration
- `frontend/src/components/Studio/` - Main workspace components
- `frontend/src/components/BlockEditor/` - Block editor components
- `frontend/src/core/` - Centralized architecture (config, API, router)
- `frontend/src/features/` - Feature-specific modules
- `frontend/src/layouts/` - Layout components (AppLayout)
- `frontend/src/shared/` - Shared components and utilities

## Project-Specific Features

### Cross-Task Content Browsing
Navigate and reuse content across different tasks through the block system.

### Export Formats
- **Newsletter**: Styled for distribution with source citations
- **Markdown**: Standard format with embedded metadata
- **JSON**: Full project data structure

### Supported Platforms
YouTube, Twitter, XiaoYuZhou (podcasts), Bilibili

### Keyframe Extraction Pipeline
- Scene detection using PySceneDetect
- Configurable extraction methods (fixed interval or fixed count)
- Metadata stored in `keyframes_json_path` with video info and extraction settings
- Thumbnails accessible via static file serving

## Documentation Guides

- `BLOCK_COLLECTION_GUIDE.md` - Complete guide to the Block Collection feature
- `DOCUMENT_MANAGEMENT_BEST_PRACTICES.md` - Document lifecycle management
- `docs/full_workflow.md` - Complete workflow documentation
- `docs/progress_tracking.md` - Progress tracking implementation

## Common Issues and Solutions

### Port Already in Use
The `start.sh` and `dev.sh` scripts automatically detect and kill processes using ports 8000 and 3000. If manual intervention is needed:
```bash
# Kill process on port 8000
lsof -ti :8000 | xargs kill -9

# Kill process on port 3000
lsof -ti :3000 | xargs kill -9
```

### WebSocket Connection Failures
- Verify backend is running on port 8000
- Check firewall settings
- Ensure `WS_BASE_URL` matches backend address (127.0.0.1 vs localhost)

### Large File Processing
For long audio files (>1 hour), the system uses the orchestrator pipeline:
1. Splits audio into chunks (`split_audio.py`)
2. Transcribes each chunk in parallel (`transcribe_whisperx_chunk.py`)
3. Merges transcription JSONs (`merge_jsons.py`)
4. Produces final merged transcription
