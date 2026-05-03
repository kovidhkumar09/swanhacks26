import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import "../index.css";
import { getStoredUsername } from "../services/api";

import classesJson from "../mock-data/classes.json";
import unitsJson from "../mock-data/units.json";
import notesJson from "../mock-data/notes.json";
import pdfCommentsJson from "../mock-data/pdf_comment.json";
import videoTimestampsJson from "../mock-data/video_timestamp.json";

const MOCK_IMAGE_SRC =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="520">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#2f7cf6"/>
          <stop offset="100%" stop-color="#00b8ff"/>
        </linearGradient>
      </defs>
      <rect width="900" height="520" rx="32" fill="url(#g)"/>
      <rect x="70" y="70" width="760" height="380" rx="24" fill="white" opacity="0.9"/>
      <text x="110" y="160" font-family="Arial" font-size="42" font-weight="700" fill="#25364f">
        Sample Image Note
      </text>
      <text x="110" y="230" font-family="Arial" font-size="28" fill="#718096">
        This is a mock image attachment.
      </text>
      <circle cx="700" cy="320" r="70" fill="#eef6ff"/>
      <path d="M665 325 L695 355 L745 290" stroke="#2f7cf6" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `);

const MOCK_CLASSES = [
  {
    id: 1,
    code: "TEST101",
    name: "Testing",
    professor: "Professor",
    year: "2026",
  },
  {
    id: 2,
    code: "COMS309",
    name: "Software Development",
    professor: "Professor",
    year: "2026",
  },
  {
    id: 3,
    code: "DB101",
    name: "Database Systems",
    professor: "Professor",
    year: "2026",
  },
];

const MOCK_UNITS = [
  {
    id: 1,
    myClass: MOCK_CLASSES[0],
    name: "Unit 1",
    notes: [
      {
        id: 101,
        title: "Image Note Example",
        content: "This note has an image attachment.",
        tags: ["image", "test"],
        date: "2026-05-02",
        files: [
          {
            id: "mock-image-1",
            name: "mock-image-note.svg",
            type: "image/svg+xml",
            src: MOCK_IMAGE_SRC,
            comments: [
              {
                id: 1,
                comment_id: 1,
                note_id: 102,
                comment: "This is a sample PDF comment.",
                x: 10,
                y: 12,
                width: 24,
                height: 10,
                page_number: 1,
              },
            ],
          },
        ],
      },
      {
        id: 102,
        title: "PDF Note Example",
        content: "This note has a PDF attachment.",
        tags: ["pdf", "test"],
        date: "2026-05-02",
        files: [
          {
            id: "mock-pdf-1",
            name: "sample.pdf",
            type: "application/pdf",
            src: "/mock-files/sample.pdf",
            comments: [
              {
                id: 1,
                comment_id: 1,
                note_id: 102,
                comment: "This is a sample PDF comment.",
                x: 10,
                y: 12,
                width: 24,
                height: 10,
                page_number: 1,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 2,
    myClass: MOCK_CLASSES[0],
    name: "Unit 2",
    notes: [
      {
        id: 103,
        title: "Video Note Example",
        content: "This note has a video attachment.",
        tags: ["video", "mock", "test"],
        date: "2026-05-02",
        files: [
          {
            id: "mock-video-1",
            name: "sample-video.mp4",
            type: "video/mp4",
            src: "/mock-files/sample-video.mp4",
            comments: [
              {
                id: 1,
                comment_id: 1,
                note_id: 103,
                comment: "This is an intro comment.",
                timestamp: 4.5,
              },
              {
                id: 2,
                comment_id: 2,
                note_id: 103,
                comment: "Important explanation starts here.",
                timestamp: 18.2,
              },
              {
                id: 3,
                comment_id: 3,
                note_id: 103,
                comment: "This comment appears in the 30–60 second section.",
                timestamp: 35.7,
              },
              {
                id: 4,
                comment_id: 4,
                note_id: 103,
                comment: "This one appears later in the video.",
                timestamp: 71.4,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 3,
    myClass: MOCK_CLASSES[1],
    name: "Sprint Planning",
    notes: [
      {
        id: 104,
        title: "Sprint Planning Notes",
        content:
          "Tasks:\n- Build class dashboard\n- Add note popup\n- Test file previews\n- Prepare demo video",
        tags: ["project", "sprint"],
        date: "2026-05-02",
        files: [],
      },
    ],
  },
  {
    id: 4,
    myClass: MOCK_CLASSES[1],
    name: "Final Project",
    notes: [],
  },
  {
    id: 5,
    myClass: MOCK_CLASSES[2],
    name: "Transactions and Locking",
    notes: [],
  },
];

export default class Welcome extends Component {
  constructor(props) {
    super(props);

    this.fileInputRef = React.createRef();

    this.state = {
      username: "",

      activeSection: "dashboard",

      loadingData: false,
      savingNote: false,
      savingClass: false,
      loadError: "",

      classes: [],
      unitsByClassId: {},

      selectedClassId: "",
      selectedUnitId: "",
      selectedClassPageId: "",

      showNewNoteModal: false,
      showNewClassModal: false,
      selectedNote: null,
      selectedFile: null,

      videoComments: {},
      newVideoComment: "",
      videoCurrentTime: 0,

      pdfComments: {},
      pdfCurrentPage: 1,
      pdfDraftComment: "",
      isSelectingPdfRegion: false,
      pdfSelectionStart: null,
      pdfSelectionRect: null,
      editingPdfCommentId: null,
      editingVideoCommentId: null,

      genericComments: {},
      genericDraftComment: "",
      editingGenericCommentId: null,

      theme: localStorage.getItem("theme") || "light",

      newClass: {
        code: "",
        name: "",
        professor: "",
        year: "",
      },

      newNote: {
        title: "",
        content: "",
        tags: [],
        tagsInput: "",
        classId: "",
        unitId: "",
        files: [],
      },
    };
  }

  toggleTheme = () => {
    this.setState(
      (prev) => ({
        theme: prev.theme === "light" ? "dark" : "light",
      }),
      () => {
        document.body.className = this.state.theme;
        localStorage.setItem("theme", this.state.theme);
      },
    );
  };
  componentDidMount() {
    document.body.className = this.state.theme;
    const storedUserDetails = sessionStorage.getItem("userDetails");

    if (storedUserDetails) {
      const getUserDetails = JSON.parse(storedUserDetails);

      this.setState({
        username: getUserDetails.username || "Student",
      });
    }

    this.loadClassesAndUnits();
  }

  formatDate = (value) => {
    if (!value) {
      return new Date().toLocaleDateString();
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString();
  };

  toArray = (data) => {
    if (!data) return [];

    if (Array.isArray(data)) return data;

    const possibleArrays = [
      data.data,
      data.body,
      data.result,
      data.results,
      data.response,
      data.payload,
      data.content,
      data.items,
      data.classes,
      data.units,
      data.notes,
    ];

    for (const item of possibleArrays) {
      if (Array.isArray(item)) return item;
    }

    for (const item of possibleArrays) {
      if (item && typeof item === "object") {
        const nested = this.toArray(item);
        if (nested.length > 0) return nested;
      }
    }

    return [];
  };

  normalizeCourse = (course) => {
    return {
      id: course.id || "",
      code: course.code || "",
      name: course.name || "",
      professor: course.professor || "",
      year: course.year || "",
      user: course.user || course.user_id || null,
    };
  };

  normalizeFile = (file) => {
    const fileId = file.id || file.fileId || file.attachmentId;
    const type = file.type || file.contentType || file.mimeType || "";
    const name =
      file.name ||
      file.fileName ||
      file.filename ||
      file.originalName ||
      "Attached file";

    const src =
      file.src ||
      file.url ||
      file.downloadUrl ||
      file.fileUrl ||
      file.path ||
      "";

    return {
      id: fileId || `${name}-${Date.now()}-${Math.random()}`,
      name,
      type,
      size: file.size || file.fileSize || null,
      src,
      fileObject: file.fileObject || null,
      comments: file.comments || [],
    };
  };

  normalizeNote = (note, fallbackUnit = null) => {
    const fileType = note.file_type || "";
    const hasFile = Boolean(note.file_url);

    const files = hasFile
      ? [
          {
            id: `file-${note.id}`,
            note_id: note.id,
            name: note.file_name || note.title || "Attached file",
            type: fileType,
            size: note.file_size || null,
            src: note.file_url,
            fileObject: null,
            comments: this.getCommentsForNote(note.id, fileType),
          },
        ]
      : [];

    return {
      id: note.id || "",
      title: note.title || "",
      content: note.content || "File note",
      tags: [],
      date: this.formatDate(note.created_at || note.createdAt || note.date),
      unitId: String(note.unit_id || note.unitId || ""),
      classId: fallbackUnit ? String(fallbackUnit.classId) : "",
      unitName: fallbackUnit ? fallbackUnit.name : "Unit",
      className: fallbackUnit ? fallbackUnit.className : "",
      classCode: fallbackUnit ? fallbackUnit.classCode : "",
      files,
    };
  };

  normalizeUnit = (unit) => {
    return {
      id: unit.id || "",
      name: unit.name || "",
      classId: String(unit.class_id || unit.classId || ""),
      className: "",
      classCode: "",
      notes: [],
    };
  };

  loadClassesAndUnits = () => {
    this.setState({ loadingData: true, loadError: "" });

    try {
      const classes = classesJson
        .map(this.normalizeCourse)
        .filter((course) => course.id && course.name);

      const units = unitsJson
        .map(this.normalizeUnit)
        .filter((unit) => unit.id && unit.name && unit.classId);

      const unitsByClassId = {};

      classes.forEach((course) => {
        unitsByClassId[String(course.id)] = [];
      });

      units.forEach((unit) => {
        const matchedClass = classes.find(
          (course) => String(course.id) === String(unit.classId),
        );

        const unitWithClass = {
          ...unit,
          className: matchedClass ? matchedClass.name : "",
          classCode: matchedClass ? matchedClass.code : "",
        };

        unitWithClass.notes = notesJson
          .filter((note) => String(note.unit_id) === String(unit.id))
          .map((note) => this.normalizeNote(note, unitWithClass))
          .filter((note) => note.id && note.title);

        if (!unitsByClassId[String(unit.classId)]) {
          unitsByClassId[String(unit.classId)] = [];
        }

        unitsByClassId[String(unit.classId)].push(unitWithClass);
      });

      const selectedClassId = classes[0] ? String(classes[0].id) : "";
      const selectedUnits = unitsByClassId[selectedClassId] || [];
      const selectedUnitId = selectedUnits[0]
        ? String(selectedUnits[0].id)
        : "";

      this.setState({
        classes,
        unitsByClassId,
        selectedClassId,
        selectedUnitId,
        loadingData: false,
        loadError: "",
      });
    } catch (error) {
      this.setState({
        loadingData: false,
        loadError: "Could not load local JSON data.",
      });
    }
  };

  getUnitsForClass = (classId) => {
    return this.state.unitsByClassId[String(classId)] || [];
  };

  getSelectedCourse = () => {
    return this.state.classes.find(
      (course) => String(course.id) === String(this.state.selectedClassId),
    );
  };

  getSelectedUnit = () => {
    const units = this.getUnitsForClass(this.state.selectedClassId);

    return units.find(
      (unit) => String(unit.id) === String(this.state.selectedUnitId),
    );
  };

  getAllNotes = () => {
    return Object.values(this.state.unitsByClassId)
      .flat()
      .flatMap((unit) => unit.notes || []);
  };

  getCommentsForNote = (noteId, fileType) => {
    const type = String(fileType || "").toLowerCase();

    if (type.includes("pdf")) {
      return pdfCommentsJson
        .filter((comment) => String(comment.note_id) === String(noteId))
        .map((comment) => ({
          id: comment.comment_id || comment.id,
          ...comment,
        }));
    }

    if (type.startsWith("video/")) {
      return videoTimestampsJson
        .filter((comment) => String(comment.note_id) === String(noteId))
        .map((comment) => ({
          id: comment.comment_id || comment.id,
          ...comment,
        }));
    }

    return [];
  };

  logOut = (e) => {
    e.preventDefault();
    sessionStorage.clear();
    this.props.history.push("/signin");
  };

  setActiveSection = (section) => {
    this.setState({ activeSection: section });
  };

  openClassesPage = () => {
    this.setState({
      activeSection: "classes",
      selectedClassPageId: "",
    });
  };

  openClassDetailPage = (classId) => {
    const units = this.getUnitsForClass(classId);

    this.setState({
      activeSection: "classDetail",
      selectedClassPageId: String(classId),
      selectedClassId: String(classId),
      selectedUnitId: units[0] ? String(units[0].id) : "",
    });
  };

  selectUnit = (classId, unitId) => {
    this.setState({
      selectedClassId: String(classId),
      selectedUnitId: String(unitId),
      activeSection: "notes",
    });
  };

  handleCourseSelect = (e) => {
    const classId = e.target.value;
    const units = this.getUnitsForClass(classId);

    this.setState({
      selectedClassId: String(classId),
      selectedUnitId: units[0] ? String(units[0].id) : "",
    });
  };

  handleUnitSelect = (e) => {
    this.setState({ selectedUnitId: String(e.target.value) });
  };

  openNewClassModal = () => {
    this.setState({
      showNewClassModal: true,
      newClass: {
        code: "",
        name: "",
        professor: "",
        year: "",
      },
    });
  };

  closeNewClassModal = () => {
    this.setState({ showNewClassModal: false });
  };

  handleNewClassChange = (e) => {
    const { name, value } = e.target;

    this.setState((prevState) => ({
      newClass: {
        ...prevState.newClass,
        [name]: value,
      },
    }));
  };

  createClass = (e) => {
    e.preventDefault();

    const { code, name, professor, year } = this.state.newClass;

    if (!code.trim() || !name.trim()) {
      alert("Please enter a class code and class name.");
      return;
    }

    const savedClass = this.normalizeCourse({
      id: Date.now(),
      code: code.trim(),
      name: name.trim(),
      professor: professor.trim(),
      year: year.trim(),
    });

    this.setState((prevState) => ({
      classes: [...prevState.classes, savedClass],
      unitsByClassId: {
        ...prevState.unitsByClassId,
        [String(savedClass.id)]: [],
      },
      selectedClassId: String(savedClass.id),
      selectedClassPageId: String(savedClass.id),
      selectedUnitId: "",
      activeSection: "classDetail",
      showNewClassModal: false,
      savingClass: false,
      newClass: {
        code: "",
        name: "",
        professor: "",
        year: "",
      },
    }));
  };

  openNewNoteModal = (classId = null, unitId = null) => {
    const chosenClassId =
      classId ||
      this.state.selectedClassId ||
      (this.state.classes[0] ? String(this.state.classes[0].id) : "");

    const units = this.getUnitsForClass(chosenClassId);

    const chosenUnitId =
      unitId ||
      this.state.selectedUnitId ||
      (units[0] ? String(units[0].id) : "");

    this.setState({
      showNewNoteModal: true,
      newNote: {
        title: "",
        content: "",
        tags: [],
        tagsInput: "",
        classId: String(chosenClassId || ""),
        unitId: String(chosenUnitId || ""),
        files: [],
      },
    });
  };

  closeNewNoteModal = () => {
    this.setState({ showNewNoteModal: false });
  };

  handleNewNoteChange = (e) => {
    const { name, value } = e.target;

    this.setState((prevState) => {
      const updated = {
        ...prevState.newNote,
        [name]: value,
      };

      if (name === "classId") {
        const units = this.getUnitsForClass(value);
        updated.unitId = units[0] ? String(units[0].id) : "";
      }

      if (name === "tagsInput") {
        updated.tags = value
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);
      }

      return { newNote: updated };
    });
  };

  handleFileUpload = (e) => {
    const files = Array.from(e.target.files);

    const fileItems = files.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      src: URL.createObjectURL(file),
      fileObject: file,
      comments: [],
    }));

    this.setState((prevState) => ({
      newNote: {
        ...prevState.newNote,
        files: [...prevState.newNote.files, ...fileItems],
      },
    }));

    e.target.value = "";
  };

  removeFile = (index) => {
    this.setState((prevState) => ({
      newNote: {
        ...prevState.newNote,
        files: prevState.newNote.files.filter((_, i) => i !== index),
      },
    }));
  };

  addNoteToLocalState = (note, classId, unitId) => {
    this.setState((prevState) => {
      const classKey = String(classId);
      const units = prevState.unitsByClassId[classKey] || [];

      const updatedUnits = units.map((unit) => {
        if (String(unit.id) !== String(unitId)) {
          return unit;
        }

        return {
          ...unit,
          notes: [note, ...(unit.notes || [])],
        };
      });

      return {
        unitsByClassId: {
          ...prevState.unitsByClassId,
          [classKey]: updatedUnits,
        },
        selectedClassId: String(classId),
        selectedUnitId: String(unitId),
        activeSection: "notes",
        showNewNoteModal: false,
        savingNote: false,
        newNote: {
          title: "",
          content: "",
          tags: [],
          tagsInput: "",
          classId: "",
          unitId: "",
          files: [],
        },
      };
    });
  };

  createNote = (e) => {
    e.preventDefault();

    const { title, content, tags, classId, unitId, files } = this.state.newNote;

    if (!title.trim()) {
      alert("Please enter a note title.");
      return;
    }

    if (!classId || !unitId) {
      alert("Please select a class and unit before saving the note.");
      return;
    }

    const selectedUnit = this.getUnitsForClass(classId).find(
      (unit) => String(unit.id) === String(unitId),
    );

    const savedNote = this.normalizeNote(
      {
        id: Date.now(),
        title: title.trim(),
        content: content.trim() || "No content added yet.",
        created_at: new Date().toISOString(),
        unit_id: unitId,
        file_url: files[0]?.src || "",
        file_name: files[0]?.name || "",
        file_type: files[0]?.type || "",
        file_size: files[0]?.size || null,
      },
      selectedUnit,
    );

    if (files.length > 0) {
      savedNote.files = files.map((file) => ({
        ...file,
        note_id: savedNote.id,
        fileObject: null,
        comments: [],
      }));
    }

    savedNote.tags = tags;

    this.addNoteToLocalState(savedNote, classId, unitId);
  };

  openNotePopup = (note) => {
    this.setState({ selectedNote: note });
  };

  closeNotePopup = () => {
    this.setState({ selectedNote: null });
  };

  getFileUrl = (file) => {
    return file.src || file.url || file.downloadUrl || file.fileUrl || "";
  };

  openFileViewer = (file, noteId) => {
    const fileWithNoteId = {
      ...file,
      noteId: noteId,
    };

    this.setState((prevState) => ({
      selectedFile: fileWithNoteId,

      videoCurrentTime: 0,
      newVideoComment: "",
      editingVideoCommentId: null,

      pdfCurrentPage: 1,
      pdfDraftComment: "",
      pdfSelectionStart: null,
      pdfSelectionRect: null,
      isSelectingPdfRegion: false,
      editingPdfCommentId: null,

      genericDraftComment: "",
      editingGenericCommentId: null,

      videoComments: {
        ...prevState.videoComments,
        [file.id]: prevState.videoComments[file.id] || file.comments || [],
      },

      pdfComments: {
        ...prevState.pdfComments,
        [file.id]: prevState.pdfComments[file.id] || file.comments || [],
      },

      genericComments: {
        ...prevState.genericComments,
        [file.id]: prevState.genericComments[file.id] || file.comments || [],
      },
    }));
  };

  closeFileViewer = () => {
    this.setState({
      selectedFile: null,

      newVideoComment: "",
      videoCurrentTime: 0,
      editingVideoCommentId: null,

      pdfCurrentPage: 1,
      pdfDraftComment: "",
      pdfSelectionStart: null,
      pdfSelectionRect: null,
      isSelectingPdfRegion: false,
      editingPdfCommentId: null,

      genericDraftComment: "",
      editingGenericCommentId: null,
    });
  };

  downloadFile = (file) => {
    const url = this.getFileUrl(file);

    if (!url) {
      alert("No downloadable file URL was found.");
      return;
    }

    const link = document.createElement("a");
    link.href = url;
    link.download = file.name || "download";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  handleVideoTimeUpdate = (e) => {
    this.setState({
      videoCurrentTime: e.target.currentTime,
    });
  };

  handleVideoCommentChange = (e) => {
    this.setState({
      newVideoComment: e.target.value,
    });
  };

  formatVideoTime = (seconds) => {
    const safeSeconds = Number.isFinite(seconds) ? seconds : 0;
    const mins = Math.floor(safeSeconds / 60);
    const secs = Math.floor(safeSeconds % 60);

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  getVideoWindow = () => {
    const start = Math.floor(this.state.videoCurrentTime / 30) * 30;
    const end = start + 30;

    return { start, end };
  };

  getVisibleVideoComments = () => {
    const { selectedFile, videoComments } = this.state;

    if (!selectedFile) {
      return [];
    }

    const { start, end } = this.getVideoWindow();
    const comments = videoComments[selectedFile.id] || [];

    return comments
      .filter((item) => item.timestamp >= start && item.timestamp < end)
      .sort((a, b) => a.timestamp - b.timestamp);
  };

  editVideoComment = (comment) => {
    this.setState({
      newVideoComment: comment.comment,
      editingVideoCommentId: comment.comment_id || comment.id,
    });
  };

  deleteVideoComment = (comment) => {
    const { selectedFile } = this.state;

    if (!selectedFile) {
      return;
    }

    const commentId = comment.comment_id || comment.id;

    this.setState((prevState) => ({
      videoComments: {
        ...prevState.videoComments,
        [selectedFile.id]: (
          prevState.videoComments[selectedFile.id] || []
        ).filter((item) => (item.comment_id || item.id) !== commentId),
      },
    }));
  };

  submitVideoComment = (e) => {
    e.preventDefault();

    const {
      selectedFile,
      newVideoComment,
      videoCurrentTime,
      editingVideoCommentId,
    } = this.state;

    if (!selectedFile || !newVideoComment.trim()) {
      return;
    }

    const commentId = editingVideoCommentId || Date.now();

    const payload = {
      id: commentId,
      comment_id: commentId,
      note_id: selectedFile.noteId,
      comment: newVideoComment.trim(),
      timestamp: Number(videoCurrentTime.toFixed(2)),
      username: getStoredUsername(),
    };

    this.setState((prevState) => {
      const existingComments = prevState.videoComments[selectedFile.id] || [];

      const updatedComments = editingVideoCommentId
        ? existingComments.map((item) =>
            (item.comment_id || item.id) === editingVideoCommentId
              ? { ...item, ...payload }
              : item,
          )
        : [...existingComments, payload];

      return {
        videoComments: {
          ...prevState.videoComments,
          [selectedFile.id]: updatedComments,
        },
        newVideoComment: "",
        editingVideoCommentId: null,
      };
    });
  };

  getPdfCommentsForCurrentPage = () => {
    const { selectedFile, pdfComments, pdfCurrentPage } = this.state;

    if (!selectedFile) {
      return [];
    }

    return (pdfComments[selectedFile.id] || []).filter(
      (comment) => Number(comment.page_number) === Number(pdfCurrentPage),
    );
  };

  handlePdfPageChange = (direction) => {
    this.setState((prevState) => ({
      pdfCurrentPage: Math.max(1, prevState.pdfCurrentPage + direction),
      pdfSelectionStart: null,
      pdfSelectionRect: null,
      pdfDraftComment: "",
      editingPdfCommentId: null,
    }));
  };

  getPdfPointerPercent = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    };
  };

  startPdfSelection = (e) => {
    if (e.button !== 0) {
      return;
    }

    const start = this.getPdfPointerPercent(e);

    this.setState({
      isSelectingPdfRegion: true,
      pdfSelectionStart: start,
      pdfSelectionRect: {
        x: start.x,
        y: start.y,
        width: 0,
        height: 0,
      },
      editingPdfCommentId: null,
      pdfDraftComment: "",
    });
  };

  movePdfSelection = (e) => {
    const { isSelectingPdfRegion, pdfSelectionStart } = this.state;

    if (!isSelectingPdfRegion || !pdfSelectionStart) {
      return;
    }

    const current = this.getPdfPointerPercent(e);

    this.setState({
      pdfSelectionRect: {
        x: Math.min(pdfSelectionStart.x, current.x),
        y: Math.min(pdfSelectionStart.y, current.y),
        width: Math.abs(current.x - pdfSelectionStart.x),
        height: Math.abs(current.y - pdfSelectionStart.y),
      },
    });
  };

  endPdfSelection = () => {
    const { pdfSelectionRect } = this.state;

    if (
      !pdfSelectionRect ||
      pdfSelectionRect.width < 1 ||
      pdfSelectionRect.height < 1
    ) {
      this.setState({
        isSelectingPdfRegion: false,
        pdfSelectionStart: null,
        pdfSelectionRect: null,
      });
      return;
    }

    this.setState({
      isSelectingPdfRegion: false,
    });
  };

  handlePdfDraftChange = (e) => {
    this.setState({
      pdfDraftComment: e.target.value,
    });
  };

  savePdfComment = (e) => {
    e.preventDefault();

    const {
      selectedFile,
      pdfDraftComment,
      pdfSelectionRect,
      pdfCurrentPage,
      editingPdfCommentId,
    } = this.state;

    if (!selectedFile || !pdfDraftComment.trim()) {
      return;
    }

    if (!editingPdfCommentId && !pdfSelectionRect) {
      alert("Drag over the PDF to select an area before saving a comment.");
      return;
    }

    const commentId = editingPdfCommentId || Date.now();

    const existingComment = (
      this.state.pdfComments[selectedFile.id] || []
    ).find((item) => (item.comment_id || item.id) === editingPdfCommentId);

    const region = editingPdfCommentId ? existingComment : pdfSelectionRect;

    const payload = {
      id: commentId,
      comment_id: commentId,
      note_id: selectedFile.noteId,
      comment: pdfDraftComment.trim(),
      x: Number(region.x.toFixed(2)),
      y: Number(region.y.toFixed(2)),
      width: Number(region.width.toFixed(2)),
      height: Number(region.height.toFixed(2)),
      page_number: pdfCurrentPage,
      username: getStoredUsername(),
    };

    this.setState((prevState) => {
      const existingComments = prevState.pdfComments[selectedFile.id] || [];

      const updatedComments = editingPdfCommentId
        ? existingComments.map((item) =>
            (item.comment_id || item.id) === editingPdfCommentId
              ? { ...item, ...payload }
              : item,
          )
        : [...existingComments, payload];

      return {
        pdfComments: {
          ...prevState.pdfComments,
          [selectedFile.id]: updatedComments,
        },
        pdfDraftComment: "",
        pdfSelectionStart: null,
        pdfSelectionRect: null,
        editingPdfCommentId: null,
      };
    });
  };

  editPdfComment = (comment) => {
    this.setState({
      pdfDraftComment: comment.comment,
      editingPdfCommentId: comment.comment_id || comment.id,
      pdfSelectionRect: {
        x: comment.x,
        y: comment.y,
        width: comment.width,
        height: comment.height,
      },
      pdfCurrentPage: comment.page_number,
    });
  };

  deletePdfComment = (comment) => {
    const { selectedFile } = this.state;

    if (!selectedFile) {
      return;
    }

    const commentId = comment.comment_id || comment.id;

    this.setState((prevState) => ({
      pdfComments: {
        ...prevState.pdfComments,
        [selectedFile.id]: (
          prevState.pdfComments[selectedFile.id] || []
        ).filter((item) => (item.comment_id || item.id) !== commentId),
      },
    }));
  };

  handleGenericDraftChange = (e) => {
    this.setState({
      genericDraftComment: e.target.value,
    });
  };

  submitGenericComment = async (e) => {
    e.preventDefault();

    const { selectedFile, genericDraftComment, editingGenericCommentId } =
      this.state;

    if (!selectedFile || !genericDraftComment.trim()) {
      return;
    }

    const commentId = editingGenericCommentId || Date.now();

    const payload = {
      commentId: commentId,
      comment: genericDraftComment.trim(),
      nodeId: selectedFile.noteId,
      username: getStoredUsername(),
    };

    console.log("Generic file comment backend payload:", payload);

    try {
      if (editingGenericCommentId) {
        await updateGenericComment(selectedFile.noteId, commentId, payload);
      } else {
        await addGenericComment(selectedFile.noteId, payload);
      }
    } catch (error) {
      console.log(
        "Generic comment backend unavailable, saving locally:",
        error.message,
      );
    }

    this.setState((prevState) => {
      const existingComments = prevState.genericComments[selectedFile.id] || [];

      const updatedComments = editingGenericCommentId
        ? existingComments.map((item) =>
            (item.commentId || item.id) === editingGenericCommentId
              ? {
                  ...item,
                  ...payload,
                  id: item.id,
                }
              : item,
          )
        : [
            ...existingComments,
            {
              id: commentId,
              ...payload,
            },
          ];

      return {
        genericComments: {
          ...prevState.genericComments,
          [selectedFile.id]: updatedComments,
        },
        genericDraftComment: "",
        editingGenericCommentId: null,
      };
    });
  };

  editGenericComment = (comment) => {
    this.setState({
      genericDraftComment: comment.comment,
      editingGenericCommentId: comment.commentId || comment.id,
    });
  };

  deleteGenericComment = async (comment) => {
    const { selectedFile } = this.state;

    if (!selectedFile) {
      return;
    }

    const commentId = comment.commentId || comment.id;

    const payload = {
      commentId: commentId,
      nodeId: selectedFile.noteId,
      username: getStoredUsername(),
    };

    console.log("Delete generic comment backend payload:", payload);

    try {
      await deleteGenericCommentById(selectedFile.noteId, commentId);
    } catch (error) {
      console.log(
        "Generic delete backend unavailable, deleting locally:",
        error.message,
      );
    }

    this.setState((prevState) => ({
      genericComments: {
        ...prevState.genericComments,
        [selectedFile.id]: (
          prevState.genericComments[selectedFile.id] || []
        ).filter((item) => (item.commentId || item.id) !== commentId),
      },
    }));
  };

  renderGenericCommentsPanel = () => {
    const { selectedFile, genericDraftComment, editingGenericCommentId } =
      this.state;

    if (!selectedFile) {
      return null;
    }

    const comments = this.state.genericComments[selectedFile.id] || [];

    return (
      <aside className="video-comments-panel">
        <div className="video-comments-header">
          <h3>Comments</h3>
          <p>Add comments for this file.</p>
        </div>

        <form
          className="video-comment-form"
          onSubmit={this.submitGenericComment}
        >
          <label>
            {editingGenericCommentId ? "Edit comment" : "Add comment"}
          </label>

          <textarea
            value={genericDraftComment}
            onChange={this.handleGenericDraftChange}
            placeholder="Write a comment for this file..."
            rows="3"
          />

          <button type="submit" className="save-note-button">
            {editingGenericCommentId ? "Update Comment" : "Add Comment"}
          </button>
        </form>

        <div className="video-comments-list">
          {comments.length === 0 ? (
            <div className="video-empty-comments">
              No comments for this file yet.
            </div>
          ) : (
            comments.map((item) => (
              <div
                className="video-comment-card"
                key={item.commentId || item.id}
              >
                <span>{item.username || "Student"}</span>
                <p>{item.comment}</p>

                <div className="comment-actions">
                  <button
                    type="button"
                    onClick={() => this.editGenericComment(item)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => this.deleteGenericComment(item)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    );
  };

  renderDashboard() {
    const { classes, unitsByClassId, loadingData, loadError } = this.state;
    const allUnits = Object.values(unitsByClassId).flat();
    const allNotes = this.getAllNotes();

    if (loadingData) {
      return <div className="status-card">Loading dashboard...</div>;
    }

    if (loadError) {
      return (
        <div className="error-card">
          <h3>Mock data issue</h3>
          <p>{loadError}</p>
          <button
            className="secondary-button"
            onClick={this.loadClassesAndUnits}
          >
            Try Again
          </button>
        </div>
      );
    }

    return (
      <section className="dashboard-overview-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h2>Overview</h2>
          </div>

          <button
            className="new-note-button"
            onClick={() => this.openNewNoteModal()}
          >
            + New Note
          </button>
        </div>

        <div className="overview-grid">
          <div className="overview-card">
            <span>Classes</span>
            <h3>{classes.length}</h3>
            <p>Total classes available</p>
          </div>

          <div className="overview-card">
            <span>Units</span>
            <h3>{allUnits.length}</h3>
            <p>Units across all classes</p>
          </div>

          <div className="overview-card">
            <span>Notes</span>
            <h3>{allNotes.length}</h3>
            <p>Total saved notes</p>
          </div>
        </div>

        <div className="dashboard-action-card">
          <div>
            <h3>Go to Classes</h3>
            <p>
              View mock classes, open class pages, and test image, PDF, and
              video notes.
            </p>
          </div>

          <button className="secondary-button" onClick={this.openClassesPage}>
            View Classes
          </button>
        </div>
      </section>
    );
  }

  renderClasses() {
    const { classes, unitsByClassId, loadingData, loadError } = this.state;

    if (loadingData) {
      return <div className="status-card">Loading classes...</div>;
    }

    if (loadError) {
      return (
        <div className="error-card">
          <h3>Mock data issue</h3>
          <p>{loadError}</p>
          <button
            className="secondary-button"
            onClick={this.loadClassesAndUnits}
          >
            Try Again
          </button>
        </div>
      );
    }

    if (classes.length === 0) {
      return (
        <div className="empty-state">
          <h3>No classes found</h3>
          <p>Add a class to start organizing units and notes.</p>
          <button className="new-note-button" onClick={this.openNewClassModal}>
            Add Class
          </button>
        </div>
      );
    }

    return (
      <section className="courses-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Classes</p>
            <h2>Your Classes</h2>
          </div>

          <div className="section-actions">
            <button className="third-button" onClick={this.openNewClassModal}>
              Add Class
            </button>

            <button
              className="secondary-button"
              onClick={this.loadClassesAndUnits}
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="courses-grid">
          {classes.map((course) => {
            const units = unitsByClassId[String(course.id)] || [];
            const noteCount = units.reduce(
              (total, unit) => total + (unit.notes ? unit.notes.length : 0),
              0,
            );

            return (
              <div
                className="course-card clickable-course-card"
                key={course.id}
                role="button"
                tabIndex="0"
                onClick={() => this.openClassDetailPage(course.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") this.openClassDetailPage(course.id);
                }}
              >
                <div className="course-card-header">
                  <div>
                    <span className="course-code">{course.code}</span>
                    <h3>{course.name}</h3>
                  </div>

                  <span className="note-count-pill">{noteCount} notes</span>
                </div>

                <p className="course-meta">
                  Professor: {course.professor || "Not assigned"}
                </p>

                {course.year && (
                  <p className="course-meta">Year: {course.year}</p>
                )}

                <div className="course-card-footer">
                  <span>{units.length} units</span>
                  <span>Click to open →</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  renderClassDetail() {
    const selectedCourse = this.state.classes.find(
      (course) => String(course.id) === String(this.state.selectedClassPageId),
    );

    if (!selectedCourse) {
      return (
        <div className="empty-state">
          <h3>Class not found</h3>
          <p>Please go back and select a class again.</p>
          <button className="secondary-button" onClick={this.openClassesPage}>
            Back to Classes
          </button>
        </div>
      );
    }

    const units = this.getUnitsForClass(selectedCourse.id);
    const noteCount = units.reduce(
      (total, unit) => total + (unit.notes ? unit.notes.length : 0),
      0,
    );

    return (
      <section className="class-detail-section">
        <button className="back-button" onClick={this.openClassesPage}>
          ← Back to Classes
        </button>

        <div className="class-detail-header">
          <div>
            <p className="eyebrow">{selectedCourse.code}</p>
            <h2>{selectedCourse.name}</h2>
            <p>
              Professor: {selectedCourse.professor || "Not assigned"}
              {selectedCourse.year ? ` • Year: ${selectedCourse.year}` : ""}
            </p>
          </div>

          <div className="class-detail-stats">
            <div>
              <span>{units.length}</span>
              <p>Units</p>
            </div>

            <div>
              <span>{noteCount}</span>
              <p>Notes</p>
            </div>
          </div>
        </div>

        <div className="class-units-panel">
          <div className="section-heading compact-heading">
            <div>
              <p className="eyebrow">Units</p>
              <h2>Class Units</h2>
            </div>
          </div>

          {units.length === 0 ? (
            <div className="empty-state compact">
              <h3>No units yet</h3>
              <p>This class does not have any units yet.</p>
            </div>
          ) : (
            <div className="unit-detail-list">
              {units.map((unit) => (
                <div className="unit-detail-card" key={unit.id}>
                  <div>
                    <h3>{unit.name}</h3>
                    <p>{unit.notes ? unit.notes.length : 0} notes</p>
                  </div>

                  <div className="unit-detail-actions">
                    <button
                      className="secondary-button"
                      onClick={() =>
                        this.selectUnit(selectedCourse.id, unit.id)
                      }
                    >
                      View Notes
                    </button>

                    <button
                      className="mini-add-button"
                      onClick={() =>
                        this.openNewNoteModal(selectedCourse.id, unit.id)
                      }
                    >
                      + Note
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  renderNotes() {
    const selectedCourse = this.getSelectedCourse();
    const selectedUnit = this.getSelectedUnit();
    const unitsForSelectedClass = this.getUnitsForClass(
      this.state.selectedClassId,
    );
    const notesToShow = selectedUnit
      ? selectedUnit.notes || []
      : this.getAllNotes();

    return (
      <section className="notes-section">
        <div className="notes-section-header">
          <div>
            <p className="eyebrow">Notes</p>
            <h2>{selectedUnit ? selectedUnit.name : "All Notes"}</h2>
            <p>
              {selectedCourse
                ? `${selectedCourse.code} — ${selectedCourse.name}`
                : "Select a class and unit to view notes."}
            </p>
          </div>

          <button
            className="new-note-button"
            onClick={() => this.openNewNoteModal()}
          >
            + New Note
          </button>
        </div>

        <div className="notes-toolbar">
          <select
            value={this.state.selectedClassId}
            onChange={this.handleCourseSelect}
          >
            {this.state.classes.map((course) => (
              <option key={course.id} value={String(course.id)}>
                {course.code} — {course.name}
              </option>
            ))}
          </select>

          <select
            value={this.state.selectedUnitId}
            onChange={this.handleUnitSelect}
            disabled={unitsForSelectedClass.length === 0}
          >
            {unitsForSelectedClass.length === 0 ? (
              <option>No units available</option>
            ) : (
              unitsForSelectedClass.map((unit) => (
                <option key={unit.id} value={String(unit.id)}>
                  {unit.name}
                </option>
              ))
            )}
          </select>
        </div>

        {notesToShow.length === 0 ? (
          <div className="empty-state compact">
            <h3>No notes yet</h3>
            <p>This unit does not have any notes yet.</p>

            <button
              className="new-note-button"
              onClick={() =>
                this.openNewNoteModal(
                  this.state.selectedClassId,
                  this.state.selectedUnitId,
                )
              }
            >
              + Add First Note
            </button>
          </div>
        ) : (
          <div className="notes-list">
            {notesToShow.map((note) => (
              <div
                className="note-card clickable-note-card"
                key={note.id}
                role="button"
                tabIndex="0"
                onClick={() => this.openNotePopup(note)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") this.openNotePopup(note);
                }}
              >
                <div className="note-card-header">
                  <h3>{note.title}</h3>
                  <span>{note.unitName}</span>
                </div>

                <p className="note-date">{note.date}</p>
                <p className="note-content">{note.content}</p>

                {note.files && note.files.length > 0 && (
                  <div className="note-images">
                    {note.files.slice(0, 4).map((file) =>
                      file.type && file.type.startsWith("image/") ? (
                        <img
                          key={file.id}
                          src={this.getFileUrl(file)}
                          alt={file.name}
                          className="note-image-thumb"
                        />
                      ) : file.type && file.type.startsWith("video/") ? (
                        <div key={file.id} className="note-file-badge">
                          <span>VIDEO</span>
                          <p>{file.name}</p>
                        </div>
                      ) : (
                        <div key={file.id} className="note-file-badge">
                          <span>
                            {file.name.split(".").pop().toUpperCase()}
                          </span>
                          <p>{file.name}</p>
                        </div>
                      ),
                    )}
                  </div>
                )}

                <p className="click-to-open-text">Click to open note</p>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  renderNewClassModal() {
    if (!this.state.showNewClassModal) return null;

    const { newClass, savingClass } = this.state;

    return (
      <div className="modal-backdrop-custom">
        <div className="new-note-modal">
          <div className="modal-header-custom">
            <div>
              <h2>Add Class</h2>
              <p>Create a temporary local class for testing.</p>
            </div>

            <button
              className="modal-close-button"
              onClick={this.closeNewClassModal}
            >
              ×
            </button>
          </div>

          <form onSubmit={this.createClass}>
            <label>Class Code</label>
            <input
              type="text"
              name="code"
              value={newClass.code}
              onChange={this.handleNewClassChange}
              placeholder="Example: COMS309"
              required
            />

            <label>Class Name</label>
            <input
              type="text"
              name="name"
              value={newClass.name}
              onChange={this.handleNewClassChange}
              placeholder="Example: Software Development"
              required
            />

            <label>Professor</label>
            <input
              type="text"
              name="professor"
              value={newClass.professor}
              onChange={this.handleNewClassChange}
              placeholder="Optional"
            />

            <label>Year</label>
            <input
              type="text"
              name="year"
              value={newClass.year}
              onChange={this.handleNewClassChange}
              placeholder="Optional, example: 2026"
            />

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={this.closeNewClassModal}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-note-button"
                disabled={savingClass}
              >
                {savingClass ? "Saving..." : "Save Class"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  renderNewNoteModal() {
    if (!this.state.showNewNoteModal) return null;

    const { newNote, classes, savingNote } = this.state;
    const unitsForNewNote = this.getUnitsForClass(newNote.classId);

    return (
      <div className="modal-backdrop-custom">
        <div className="new-note-modal">
          <div className="modal-header-custom">
            <div>
              <h2>Create New Note</h2>
              <p>This note is temporarily saved in local React state.</p>
            </div>

            <button
              className="modal-close-button"
              onClick={this.closeNewNoteModal}
            >
              ×
            </button>
          </div>

          <form onSubmit={this.createNote}>
            <label>Class</label>
            <select
              name="classId"
              value={newNote.classId}
              onChange={this.handleNewNoteChange}
              required
            >
              <option value="">Select class</option>
              {classes.map((course) => (
                <option key={course.id} value={String(course.id)}>
                  {course.code} — {course.name}
                </option>
              ))}
            </select>

            <label>Unit</label>
            <select
              name="unitId"
              value={newNote.unitId}
              onChange={this.handleNewNoteChange}
              required
              disabled={unitsForNewNote.length === 0}
            >
              {unitsForNewNote.length === 0 ? (
                <option value="">No units available</option>
              ) : (
                unitsForNewNote.map((unit) => (
                  <option key={unit.id} value={String(unit.id)}>
                    {unit.name}
                  </option>
                ))
              )}
            </select>

            <label>Note Title</label>
            <input
              type="text"
              name="title"
              value={newNote.title}
              onChange={this.handleNewNoteChange}
              placeholder="Example: Chapter 1 Review"
              required
            />

            <label>Tags</label>
            <input
              type="text"
              name="tagsInput"
              value={newNote.tagsInput}
              onChange={this.handleNewNoteChange}
              placeholder="Example: exam, homework, important"
            />

            <label>Content</label>
            <textarea
              name="content"
              value={newNote.content}
              onChange={this.handleNewNoteChange}
              placeholder="Start writing your note here..."
              rows="6"
            />

            <label>Files</label>
            <div className="image-upload-area">
              <input
                type="file"
                accept="image/*,application/pdf,video/*"
                multiple
                ref={this.fileInputRef}
                onChange={this.handleFileUpload}
                style={{ display: "none" }}
              />

              <button
                type="button"
                className="image-upload-button"
                onClick={() => this.fileInputRef.current.click()}
              >
                📎 Add Files
              </button>

              {newNote.files.length > 0 && (
                <div className="image-preview-grid">
                  {newNote.files.map((file, index) => (
                    <div key={file.id} className="image-preview-item">
                      {file.type && file.type.startsWith("image/") ? (
                        <img src={file.src} alt={file.name} />
                      ) : (
                        <div className="file-preview-icon">
                          <span>
                            {file.type && file.type.startsWith("video/")
                              ? "VIDEO"
                              : file.name.split(".").pop().toUpperCase()}
                          </span>
                          <p>{file.name}</p>
                        </div>
                      )}

                      <button
                        type="button"
                        className="image-remove-button"
                        onClick={() => this.removeFile(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={this.closeNewNoteModal}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-note-button"
                disabled={savingNote || !newNote.unitId}
              >
                {savingNote ? "Saving..." : "Save Note"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  renderNotePopup() {
    const { selectedNote } = this.state;

    if (!selectedNote) return null;

    return (
      <div className="modal-backdrop-custom">
        <div className="note-detail-modal">
          <div className="modal-header-custom">
            <div>
              <h2>{selectedNote.title}</h2>
              <p>
                {selectedNote.classCode && `${selectedNote.classCode} • `}
                {selectedNote.unitName} • {selectedNote.date}
              </p>
            </div>

            <button
              className="modal-close-button"
              onClick={this.closeNotePopup}
            >
              ×
            </button>
          </div>

          <div className="note-detail-body">
            <h4>Note Content</h4>
            <p className="note-detail-content">{selectedNote.content}</p>

            {selectedNote.tags && selectedNote.tags.length > 0 && (
              <>
                <h4>Tags</h4>
                <div className="note-detail-tags">
                  {selectedNote.tags.map((tag, index) => (
                    <span key={index}>{tag}</span>
                  ))}
                </div>
              </>
            )}

            {selectedNote.files && selectedNote.files.length > 0 && (
              <>
                <h4>Attached Files</h4>

                <div className="note-detail-files">
                  {selectedNote.files.map((file) => (
                    <div className="note-detail-file-card" key={file.id}>
                      {file.type && file.type.startsWith("image/") ? (
                        <img
                          src={this.getFileUrl(file)}
                          alt={file.name}
                          className="note-detail-image"
                        />
                      ) : file.type && file.type.startsWith("video/") ? (
                        <div className="note-detail-file-icon">VIDEO</div>
                      ) : (
                        <div className="note-detail-file-icon">
                          {file.name.split(".").pop().toUpperCase()}
                        </div>
                      )}

                      <div className="note-detail-file-info">
                        <p>{file.name}</p>
                        <small>{file.type || "Unknown file type"}</small>
                      </div>

                      <div className="note-detail-file-actions">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            this.openFileViewer(file, selectedNote.id);
                          }}
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            this.downloadFile(file);
                          }}
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  renderFileViewerPopup() {
    const { selectedFile, newVideoComment, videoCurrentTime } = this.state;

    if (!selectedFile) return null;

    const url = this.getFileUrl(selectedFile);
    const isImage = selectedFile.type && selectedFile.type.startsWith("image/");
    const isPdf = selectedFile.type === "application/pdf";
    const isVideo = selectedFile.type && selectedFile.type.startsWith("video/");
    const visibleComments = this.getVisibleVideoComments();
    const { start, end } = this.getVideoWindow();

    return (
      <div className="modal-backdrop-custom file-viewer-backdrop">
        <div
          className={
            isVideo
              ? "file-viewer-modal video-viewer-modal"
              : "file-viewer-modal"
          }
        >
          <div className="modal-header-custom">
            <div>
              <h2>{selectedFile.name}</h2>
              <p>{selectedFile.type || "Attached file"}</p>
            </div>

            <button
              className="modal-close-button"
              onClick={this.closeFileViewer}
            >
              ×
            </button>
          </div>

          <div className="file-viewer-body">
            {!url ? (
              <div className="empty-state compact">
                <h3>Preview unavailable</h3>
                <p>This file does not have a valid preview URL.</p>
              </div>
            ) : isImage ? (
              <div className="generic-review-layout">
                <div className="generic-file-panel">
                  <img
                    src={url}
                    alt={selectedFile.name}
                    className="file-viewer-image"
                  />
                </div>

                {this.renderGenericCommentsPanel()}
              </div>
            ) : isVideo ? (
              <div className="video-review-layout">
                <div className="video-player-panel">
                  <video
                    src={url}
                    controls
                    className="file-viewer-video"
                    onTimeUpdate={this.handleVideoTimeUpdate}
                  >
                    Your browser does not support video playback.
                  </video>

                  <div className="video-time-info">
                    <p>
                      Current time:{" "}
                      <strong>{this.formatVideoTime(videoCurrentTime)}</strong>
                    </p>
                    <p>
                      Showing comments from{" "}
                      <strong>{this.formatVideoTime(start)}</strong> to{" "}
                      <strong>{this.formatVideoTime(end)}</strong>
                    </p>
                  </div>
                </div>

                <aside className="video-comments-panel">
                  <div className="video-comments-header">
                    <h3>Comments</h3>
                    <p>Only comments within this 30-second window are shown.</p>
                  </div>

                  <form
                    className="video-comment-form"
                    onSubmit={this.submitVideoComment}
                  >
                    <label>
                      Add comment at {this.formatVideoTime(videoCurrentTime)}
                    </label>

                    <textarea
                      value={newVideoComment}
                      onChange={this.handleVideoCommentChange}
                      placeholder="Write a comment for this timestamp..."
                      rows="3"
                    />

                    <button type="submit" className="save-note-button">
                      Add Comment
                    </button>
                  </form>

                  <div className="video-comments-list">
                    {visibleComments.length === 0 ? (
                      <div className="video-empty-comments">
                        No comments in this 30-second section.
                      </div>
                    ) : (
                      visibleComments.map((item) => (
                        <div
                          className="video-comment-card"
                          key={item.comment_id || item.id}
                        >
                          <span>{this.formatVideoTime(item.timestamp)}</span>
                          <p>{item.comment}</p>

                          <div className="comment-actions">
                            <button
                              type="button"
                              onClick={() => this.editVideoComment(item)}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => this.deleteVideoComment(item)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </aside>
              </div>
            ) : isPdf ? (
              <div className="pdf-review-layout">
                <div className="pdf-viewer-panel">
                  <div className="pdf-toolbar">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => this.handlePdfPageChange(-1)}
                    >
                      Previous Page
                    </button>

                    <span>Page {this.state.pdfCurrentPage}</span>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => this.handlePdfPageChange(1)}
                    >
                      Next Page
                    </button>
                  </div>

                  <div
                    className="pdf-page-container"
                    onMouseDown={this.startPdfSelection}
                    onMouseMove={this.movePdfSelection}
                    onMouseUp={this.endPdfSelection}
                    onMouseLeave={this.endPdfSelection}
                  >
                    <iframe
                      src={`${url}#page=${this.state.pdfCurrentPage}`}
                      title={selectedFile.name}
                      className="file-viewer-frame pdf-frame"
                    />

                    <div className="pdf-comment-layer">
                      {this.getPdfCommentsForCurrentPage().map((comment) => (
                        <button
                          type="button"
                          key={comment.comment_id || comment.id}
                          className="pdf-comment-box"
                          style={{
                            left: `${comment.x}%`,
                            top: `${comment.y}%`,
                            width: `${comment.width}%`,
                            height: `${comment.height}%`,
                          }}
                          title={comment.comment}
                          onClick={(e) => {
                            e.stopPropagation();
                            this.editPdfComment(comment);
                          }}
                        />
                      ))}

                      {this.state.pdfSelectionRect && (
                        <div
                          className="pdf-selection-box"
                          style={{
                            left: `${this.state.pdfSelectionRect.x}%`,
                            top: `${this.state.pdfSelectionRect.y}%`,
                            width: `${this.state.pdfSelectionRect.width}%`,
                            height: `${this.state.pdfSelectionRect.height}%`,
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <aside className="pdf-comments-panel">
                  <div className="video-comments-header">
                    <h3>PDF Comments</h3>
                    <p>
                      Drag over the PDF to select an area, then add a comment.
                    </p>
                  </div>

                  <form
                    className="video-comment-form"
                    onSubmit={this.savePdfComment}
                  >
                    <label>
                      {this.state.editingPdfCommentId
                        ? "Edit PDF comment"
                        : "Add PDF comment"}
                    </label>

                    <textarea
                      value={this.state.pdfDraftComment}
                      onChange={this.handlePdfDraftChange}
                      placeholder="Write a comment for the selected PDF area..."
                      rows="3"
                    />

                    <button type="submit" className="save-note-button">
                      {this.state.editingPdfCommentId
                        ? "Update Comment"
                        : "Save Comment"}
                    </button>
                  </form>

                  <div className="video-comments-list">
                    {this.getPdfCommentsForCurrentPage().length === 0 ? (
                      <div className="video-empty-comments">
                        No comments on this page yet.
                      </div>
                    ) : (
                      this.getPdfCommentsForCurrentPage().map((comment) => (
                        <div
                          className="video-comment-card"
                          key={comment.comment_id || comment.id}
                        >
                          <span>
                            Page {comment.page_number} • x:{comment.x}% y:
                            {comment.y}%
                          </span>

                          <p>{comment.comment}</p>

                          <div className="comment-actions">
                            <button
                              type="button"
                              onClick={() => this.editPdfComment(comment)}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => this.deletePdfComment(comment)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </aside>
              </div>
            ) : (
              <div className="generic-review-layout">
                <div className="generic-file-panel">
                  <iframe
                    src={url}
                    title={selectedFile.name}
                    className="file-viewer-frame"
                  />
                </div>

                {this.renderGenericCommentsPanel()}
              </div>
            )}
          </div>

          <div className="file-viewer-actions">
            <button
              type="button"
              className="save-note-button"
              onClick={() => this.downloadFile(selectedFile)}
            >
              Download File
            </button>
          </div>
        </div>
      </div>
    );
  }

  renderCurrentSection() {
    if (this.state.activeSection === "dashboard") return this.renderDashboard();
    if (this.state.activeSection === "classes") return this.renderClasses();
    if (this.state.activeSection === "classDetail")
      return this.renderClassDetail();
    if (this.state.activeSection === "notes") return this.renderNotes();

    return this.renderDashboard();
  }

  render() {
    if (sessionStorage.getItem("userDetails") === null) {
      return <Redirect to="/signup" />;
    }

    return (
      <div className="notes-dashboard">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-icon">N</div>
            <span>UNote</span>
          </div>

          <nav className="sidebar-nav">
            <button
              className={
                this.state.activeSection === "dashboard"
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
              onClick={() => this.setActiveSection("dashboard")}
            >
              <span>🏠</span> Dashboard
            </button>

            <button
              className={
                this.state.activeSection === "classes" ||
                this.state.activeSection === "classDetail"
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
              onClick={this.openClassesPage}
            >
              <span>📚</span> Classes
            </button>

            <button
              className={
                this.state.activeSection === "notes"
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
              onClick={() => this.setActiveSection("notes")}
            >
              <span>📝</span> Notes
            </button>
          </nav>

          <div className="sidebar-footer">
            <Link to="/signin" onClick={this.logOut} className="logout-link">
              Logout
            </Link>
          </div>
        </aside>

        <main className="dashboard-main">
          <header className="dashboard-header">
            <div>
              <p className="welcome-text">Welcome back,</p>
              <h1>{this.state.username}</h1>
            </div>
            <div className="header-actions">
              <button className="secondary-button" onClick={this.toggleTheme}>
                {this.state.theme === "light" ? "Dark Mode" : "Light Mode"}
              </button>

              <button
                className="new-note-button"
                onClick={() => this.openNewNoteModal()}
              >
                + New Note
              </button>
            </div>
          </header>

          {this.renderCurrentSection()}
        </main>

        {this.renderNewClassModal()}
        {this.renderNewNoteModal()}
        {this.renderNotePopup()}
        {this.renderFileViewerPopup()}
      </div>
    );
  }
}
