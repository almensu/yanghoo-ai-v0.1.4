# Ingested Tasks UI - Test Plan

**Project:** YangHoo AI v0.1.6
**Component:** CardView.js - Ingested Tasks Card Interface
**Date:** 2026-01-13
**Tester:** Claude Code + verification-loop

---

## Test Environment Setup

```bash
# 1. Start services
./start.sh

# 2. Open browser to
open http://localhost:3000/

# 3. Navigate to Task List Page
# URL: http://localhost:3000/
```

---

## Test Categories

### 1. Visual & Layout Tests

#### 1.1 Card Layout
- [ ] Card renders with proper borders and shadows
- [ ] Thumbnail image displays correctly (or placeholder)
- [ ] Title truncates properly with line-clamp-2
- [ ] Platform badge displays correctly
- [ ] Hover effects work (action buttons fade in)

#### 1.2 Icons & Visual Indicators
- [ ] Video icon: green (FileVideo) when exists, gray (VideoOff) when missing
- [ ] Audio icon: accent (FileAudio) when extracted, primary (Headphones) when downloaded
- [ ] VTT icon: info (Captions) when exists
- [ ] WhisperX icon: purple (Mic) when completed
- [ ] All icons use lucide-react (not react-icons)

#### 1.3 Responsive Design
- [ ] Grid layout: 1 column (mobile), 2 (sm), 3 (md), 4 (lg)
- [ ] Cards maintain proper padding and spacing
- [ ] Action buttons accessible on touch devices

---

### 2. Video Operations Tests

#### 2.1 Download Video
**Test Steps:**
1. Click the download button on a task card
2. Select quality from dropdown (best, 1080p, 720p, 360p)
3. Verify download starts

**Expected:**
- [ ] Dropdown shows all 4 quality options
- [ ] Clicking quality triggers `onDownloadRequest(uuid, quality)`
- [ ] WebSocket updates show progress
- [ ] Video icon turns green after completion
- [ ] Delete button becomes enabled

#### 2.2 Delete Video
**Test Steps:**
1. Ensure video exists for a task
2. Click delete button (trash icon)
3. Confirm deletion

**Expected:**
- [ ] Delete button only enabled when video exists
- [ ] Confirmation dialog shows
- [ ] After deletion, video icon turns gray
- [ ] Delete button becomes disabled

---

### 3. Audio Operations Tests

#### 3.1 Extract Audio
**Test Steps:**
1. Ensure video exists
2. Click extract audio button (AudioWaveform icon)
3. Wait for completion

**Expected:**
- [ ] Button enabled only when video exists
- [ ] Triggers `onExtractAudio(uuid)`
- [ ] Audio icon shows "已提取" (extracted) after completion
- [ ] Icon color: accent (FileAudio)

#### 3.2 Download Audio (Audio Platforms)
**Test Steps:**
1. Select a xiaoyuzhou/podcast task
2. Click download audio button (DownloadCloud icon)
3. Wait for completion

**Expected:**
- [ ] Button only shows for audio platforms (xiaoyuzhou, podcast)
- [ ] Disabled if already downloaded or no info_json
- [ ] After download, audio icon shows "已下载" (downloaded)
- [ ] Icon color: primary (Headphones)

#### 3.3 Delete Audio
**Test Steps:**
1. Ensure audio exists (extracted or downloaded)
2. Click delete audio button
3. Confirm

**Expected:**
- [ ] Button enabled when audio exists
- [ ] After deletion, audio status shows "无音频" (no audio)
- [ ] Icon color: gray (VolumeX)

#### 3.4 Create Video (Podcast to Video)
**Test Steps:**
1. Select xiaoyuzhou/podcast task with thumbnail and downloaded audio
2. Click create video button (Tv icon)
3. Wait for completion

**Expected:**
- [ ] Button only shows when:
  - Platform is xiaoyuzhou/podcast
  - Has thumbnail_path
  - Has downloaded_audio_path
  - No media_files.best exists
- [ ] After creation, video appears in media_files

---

### 4. VTT Subtitle Tests (YouTube Only)

#### 4.1 Download VTT
**Test Steps:**
1. Select YouTube task
2. Click download VTT button (DownloadCloud icon)
3. Wait for completion

**Expected:**
- [ ] VTT section only shows for YouTube platform
- [ ] Button disabled if no info_json_path
- [ ] After download, VTT icons appear for en/zh-Hans

#### 4.2 Merge VTT
**Test Steps:**
1. Ensure VTT files exist (en or zh-Hans)
2. Click merge button (Combine icon)
3. Wait for completion

**Expected:**
- [ ] Button enabled when VTT exists and not yet merged
- [ ] After merge, status shows "(已合并)"
- [ ] Button becomes disabled

#### 4.3 Natural Segment VTT
**Test Steps:**
1. Ensure VTT files exist
2. Click scissors button (Scissors icon)
3. Wait for completion

**Expected:**
- [ ] Button enabled when VTT exists
- [ ] Triggers `onNaturalSegmentVtt(uuid)`

#### 4.4 Delete VTT (Language-specific)
**Test Steps:**
1. Ensure VTT exists for a language
2. Click delete button for that language
3. Confirm

**Expected:**
- [ ] Can delete English VTT independently
- [ ] Can delete Chinese VTT independently
- [ ] Language indicator updates after deletion

---

### 5. SRT Subtitle Tests

#### 5.1 Process SRT (Stage 1)
**Test Steps:**
1. Select task with raw SRT files
2. Click settings button (Settings icon)
3. Wait for preprocessing

**Expected:**
- [ ] Button shows when no transcript.srt exists
- [ ] Triggers `onProcessSrt(uuid)`
- [ ] After processing, merge button appears

#### 5.2 Merge SRT to MD (Stage 2)
**Test Steps:**
1. Ensure transcript.srt exists
2. Click merge button (Combine icon)
3. Wait for completion

**Expected:**
- [ ] Button shows when transcript.srt exists but no MD files
- [ ] Triggers `onMergeSrt(uuid)`
- [ ] After merge, status shows "(已合并)"

#### 5.3 Delete SRT (Language-specific)
**Test Steps:**
1. Ensure SRT exists for a language
2. Click delete for that language
3. Confirm

**Expected:**
- [ ] Independent deletion for en/zh-Hans
- [ ] Status updates correctly

---

### 6. ASS Subtitle Tests

#### 6.1 View ASS Status
**Test Steps:**
1. Check ASS section for each language
2. Verify correct status display

**Expected:**
- [ ] Shows status for English, Chinese, Main
- [ ] Icon color: cyan when exists
- [ ] Status shows "(已生成)" when files exist

#### 6.2 Delete ASS
**Test Steps:**
1. Ensure ASS exists
2. Click delete for specific language
3. Confirm

**Expected:**
- [ ] Can delete independently
- [ ] Status updates after deletion

---

### 7. WhisperX Transcription Tests

#### 7.1 Select Model
**Test Steps:**
1. Click model dropdown
2. Select different model (tiny.en, small.en, medium.en, large-v3)

**Expected:**
- [ ] Dropdown shows all 4 model options
- [ ] Selection persists per task
- [ ] Disabled if no audio or already transcribed

#### 7.2 Start Transcription
**Test Steps:**
1. Ensure audio exists
2. Select model
3. Click "开始转录" button
4. Wait for completion

**Expected:**
- [ ] Button enabled only when audio exists
- [ ] Shows "转录中..." during transcription
- [ ] After completion: "已完成" (green button)
- [ ] Shows model used: "(large-v3)"

#### 7.3 Split Transcribe
**Test Steps:**
1. Click "切分转录" button
2. Wait for completion

**Expected:**
- [ ] Uses orchestrator for long audio
- [ ] Same disable conditions as normal transcription

#### 7.4 Delete Transcription
**Test Steps:**
1. Ensure transcription exists
2. Click delete button
3. Confirm

**Expected:**
- [ ] Can delete to re-transcribe with different model
- [ ] Reset buttons to initial state

---

### 8. Task Management Tests

#### 8.1 Archive Task
**Test Steps:**
1. Click archive button (Archive icon)
2. Verify task moves to archived

**Expected:**
- [ ] Button visible on hover
- [ ] "Archived" badge appears
- [ ] Task sorts to bottom

#### 8.2 Open Folder
**Test Steps:**
1. Click folder button (Folder icon)
2. Verify file manager opens

**Expected:**
- [ ] Opens correct task directory
- [ ] File manager displays files

#### 8.3 Go to Studio
**Test Steps:**
1. Click studio button (PlaySquare icon)
2. Verify navigation to studio page

**Expected:**
- [ ] Navigates to `/studio/{taskUuid}`
- [ ] Studio page loads with task data

#### 8.4 Delete Task
**Test Steps:**
1. Click delete button (Trash2 icon)
2. Confirm deletion
3. Verify task removed

**Expected:**
- [ ] Confirmation dialog shows
- [ ] Task removed from list
- [ ] Toast notification appears

---

### 9. Sorting & Filter Tests

#### 9.1 Sort Options
**Test Steps:**
1. Click sort dropdown
2. Select each sort option
3. Verify order changes

**Expected:**
- [ ] 最近添加 (新->旧): created_at desc
- [ ] 最近添加 (旧->新): created_at asc
- [ ] 最近修改 (新->旧): last_modified desc
- [ ] 最近修改 (旧->新): last_modified asc
- [ ] 标题 (A-Z): title asc
- [ ] 标题 (Z-A): title desc
- [ ] 平台 (A-Z): platform asc
- [ ] 平台 (Z-A): platform desc
- [ ] URL (A-Z): url asc
- [ ] URL (Z-A): url desc

#### 9.2 View Mode Toggle
**Test Steps:**
1. Click "Card View" tab
2. Click "Table View" tab
3. Verify each view renders

**Expected:**
- [ ] Both views display same tasks
- [ ] Handlers work in both views
- [ ] Active tab highlighted

---

### 10. Integration Tests

#### 10.1 WebSocket Updates
**Test Steps:**
1. Start a long operation (download video)
2. Watch for real-time updates
3. Verify UI updates without refresh

**Expected:**
- [ ] Task updates via WebSocket
- [ ] Icons change state in real-time
- [ ] Buttons enable/disable correctly

#### 10.2 Error Handling
**Test Steps:**
1. Trigger an error (e.g., download with invalid URL)
2. Verify error display

**Expected:**
- [ ] Toast notification shows error
- [ ] UI remains functional
- [ ] Can retry operation

#### 10.3 Concurrent Operations
**Test Steps:**
1. Start operation on Task A
2. Start operation on Task B
3. Verify both complete

**Expected:**
- [ ] Operations don't block each other
- [ ] Each task updates independently

---

### 11. Accessibility Tests

#### 11.1 Keyboard Navigation
- [ ] All buttons accessible via Tab
- [ ] Enter/Space triggers buttons
- [ ] Focus indicators visible

#### 11.2 Screen Reader Support
- [ ] Icons have aria-labels via tooltips
- [ ] Button actions are clear
- [ ] Status changes are announced

---

### 12. Performance Tests

#### 12.1 Large Task List
**Test Steps:**
1. Load 50+ tasks
2. Verify performance

**Expected:**
- [ ] Cards render smoothly
- [ ] Scrolling is responsive
- [ ] No memory leaks

#### 12.2 Image Loading
**Test Steps:**
1. Load tasks with various thumbnail states
2. Verify fallback behavior

**Expected:**
- [ ] Valid thumbnails load
- [ ] Invalid paths show placeholder
- [ ] No broken image icons

---

## Test Execution Checklist

### Pre-Test Setup
- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Test tasks available (at least 3-5 with different states)
- [ ] Browser DevTools open for console/errors

### Test Execution
- [ ] Execute each test category
- [ ] Document failures with screenshots
- [ ] Note console errors
- [ ] Record performance issues

### Post-Test
- [ ] Generate test report
- [ ] Create bug tickets for failures
- [ ] Verify fixes
- [ ] Re-test failed cases

---

## Known Issues to Watch

1. **Image Fallback**: Verify placeholder SVG works for all scenarios
2. **WebSocket Reconnection**: Check if UI recovers from backend restart
3. **Button State Race Conditions**: Ensure buttons update correctly after async operations
4. **Dropdown Z-Index**: Verify dropdowns appear above other cards
5. **Mobile Touch**: Verify hover-based action buttons work on touch devices

---

## Success Criteria

All tests must pass for the UI to be considered "交付就绪" (delivery-ready):

- ✅ All visual tests pass
- ✅ All operations complete successfully
- ✅ No console errors
- ✅ WebSocket updates work correctly
- ✅ Accessibility standards met
- ✅ Performance acceptable (<100ms render time per card)
