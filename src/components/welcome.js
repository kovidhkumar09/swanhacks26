import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import {
  API_BASE_URL,
  apiFetch,
  getAccount,
  getStoredAccountId,
  getStoredUserDetails,
  saveAuthSession,
  clearAuthSession,
  updateAccount,
  deleteAccount,
} from "../services/api";
import "../index.css";

/*
  These are assumed backend URLs based on your /api structure.
  Change these only if your backend routes are named differently.
*/
const CLASSES_API_URL = `${API_BASE_URL}/classes`;
const UNITS_API_URL = `${API_BASE_URL}/units`;
const NOTES_API_URL = `${API_BASE_URL}/notes`;
const FILES_API_URL = `${API_BASE_URL}/files`;

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

  componentDidMount() {
    const storedUserDetails = getStoredUserDetails();

    if (storedUserDetails) {
      this.setState({
        username:
          storedUserDetails.username || storedUserDetails.name || "Student",
      });
    }

    this.loadAccount();
    this.loadClassesAndUnits();
  }

  loadAccount = async () => {
    try {
      const accountId = getStoredAccountId();
      const response = await getAccount(accountId);

      const account = response?.account || response?.user || response?.data || response;
      const currentUser = getStoredUserDetails() || {};

      const updatedUser = {
        ...currentUser,
        ...account,
      };

      sessionStorage.setItem("userDetails", JSON.stringify(updatedUser));

      this.setState({
        username: updatedUser.username || updatedUser.name || "Student",
      });
    } catch (error) {
      console.log("Could not load account:", error.message);
    }
  };

  updateCurrentAccount = async (updatedData) => {
    try {
      const accountId = getStoredAccountId();
      const response = await updateAccount(accountId, updatedData);

      saveAuthSession(response, updatedData);

      alert("Account updated successfully.");
    } catch (error) {
      alert(error.message || "Could not update account.");
    }
  };

  deleteCurrentAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      const accountId = getStoredAccountId();

      await deleteAccount(accountId);

      clearAuthSession();
      this.props.history.push("/signup");
    } catch (error) {
      alert(error.message || "Could not delete account.");
    }
  };

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
    if (Array.isArray(data)) {
      return data;
    }

    if (data && Array.isArray(data.content)) {
      return data.content;
    }

    if (data && Array.isArray(data.data)) {
      return data.data;
    }

    if (data) {
      return [data];
    }

    return [];
  };

  normalizeCourse = (course) => {
    return {
      id: course.id,
      code: course.code || "",
      name: course.name || "Untitled Class",
      professor: course.professor || "No professor listed",
      year: course.year || "",
      user: course.user || null,
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

    let src =
      file.src ||
      file.url ||
      file.downloadUrl ||
      file.fileUrl ||
      file.path ||
      "";

    if (!src && file.data) {
      src = `data:${type || "application/octet-stream"};base64,${file.data}`;
    }

    if (!src && fileId) {
      src = `${FILES_API_URL}/${fileId}`;
    }

    return {
      id: fileId || `${name}-${Date.now()}-${Math.random()}`,
      name,
      type,
      size: file.size || file.fileSize || null,
      src,
      fileObject: file.fileObject || null,
    };
  };

  normalizeNote = (note, fallbackUnit = null) => {
    const rawFiles =
      note.files ||
      note.attachments ||
      note.images ||
      note.documents ||
      [];

    const unitId =
      note.unitId ||
      (note.unit && note.unit.id) ||
      (note.myUnit && note.myUnit.id) ||
      (fallbackUnit && fallbackUnit.id) ||
      "";

    const classId =
      note.classId ||
      (note.myClass && note.myClass.id) ||
      (note.unit && note.unit.myClass && note.unit.myClass.id) ||
      (note.myUnit && note.myUnit.myClass && note.myUnit.myClass.id) ||
      (fallbackUnit && fallbackUnit.classId) ||
      "";

    return {
      id: note.id || `${Date.now()}-${Math.random()}`,
      title: note.title || note.name || "Untitled Note",
      content: note.content || note.body || note.text || "No content added yet.",
      tags: note.tags || [],
      date: this.formatDate(note.createdAt || note.updatedAt || note.date),
      unitId: String(unitId),
      classId: String(classId),
      unitName:
        note.unitName ||
        (note.unit && note.unit.name) ||
        (note.myUnit && note.myUnit.name) ||
        (fallbackUnit && fallbackUnit.name) ||
        "Unit",
      className:
        note.className ||
        (note.myClass && note.myClass.name) ||
        (fallbackUnit && fallbackUnit.className) ||
        "",
      classCode:
        note.classCode ||
        (note.myClass && note.myClass.code) ||
        (fallbackUnit && fallbackUnit.classCode) ||
        "",
      files: this.toArray(rawFiles).map(this.normalizeFile),
    };
  };

  normalizeUnit = (unit) => {
    const myClass = unit.myClass || unit.class || unit.course || {};

    const normalizedUnit = {
      id: unit.id,
      name: unit.name || "Untitled Unit",
      classId: String(
        unit.classId || unit.courseId || unit.myClassId || myClass.id || ""
      ),
      className: myClass.name || "",
      classCode: myClass.code || "",
      notes: [],
    };

    normalizedUnit.notes = this.toArray(unit.notes).map((note) =>
      this.normalizeNote(note, normalizedUnit)
    );

    return normalizedUnit;
  };

  loadClassesAndUnits = async () => {
    this.setState({ loadingData: true, loadError: "" });

    try {
      const classesData = await apiFetch(CLASSES_API_URL, {
        method: "GET",
      });

      let unitsData = [];

      try {
        unitsData = await apiFetch(UNITS_API_URL, {
          method: "GET",
        });
      } catch (unitError) {
        unitsData = [];
      }

      const rawClasses = this.toArray(classesData);
      const classes = rawClasses.map(this.normalizeCourse);

      const unitsFromClasses = rawClasses.flatMap((course) =>
        this.toArray(course.units).map((unit) => ({
          ...unit,
          myClass: unit.myClass || course,
        }))
      );

      const rawUnitsFromEndpoint = this.toArray(unitsData);
      const rawUnits =
        rawUnitsFromEndpoint.length > 0 ? rawUnitsFromEndpoint : unitsFromClasses;

      const unitsByClassId = {};

      classes.forEach((course) => {
        unitsByClassId[String(course.id)] = [];
      });

      rawUnits.forEach((rawUnit) => {
        const unit = this.normalizeUnit(rawUnit);
        const key = String(unit.classId);

        if (!unitsByClassId[key]) {
          unitsByClassId[key] = [];
        }

        unitsByClassId[key].push(unit);
      });

      const previousClassId = this.state.selectedClassId;
      const previousUnitId = this.state.selectedUnitId;

      const selectedClassId = classes.some(
        (course) => String(course.id) === String(previousClassId)
      )
        ? String(previousClassId)
        : classes[0]
        ? String(classes[0].id)
        : "";

      const selectedUnits = unitsByClassId[selectedClassId] || [];

      const selectedUnitId = selectedUnits.some(
        (unit) => String(unit.id) === String(previousUnitId)
      )
        ? String(previousUnitId)
        : selectedUnits[0]
        ? String(selectedUnits[0].id)
        : "";

      this.setState({
        classes,
        unitsByClassId,
        selectedClassId,
        selectedUnitId,
        loadingData: false,
      });
    } catch (error) {
      this.setState({
        loadingData: false,
        loadError:
          error.message ||
          "Could not load classes and units from the backend.",
      });
    }
  };

  getUnitsForClass = (classId) => {
    return this.state.unitsByClassId[String(classId)] || [];
  };

  getSelectedCourse = () => {
    return this.state.classes.find(
      (course) => String(course.id) === String(this.state.selectedClassId)
    );
  };

  getSelectedUnit = () => {
    const units = this.getUnitsForClass(this.state.selectedClassId);

    return units.find(
      (unit) => String(unit.id) === String(this.state.selectedUnitId)
    );
  };

  getAllNotes = () => {
    return Object.values(this.state.unitsByClassId)
      .flat()
      .flatMap((unit) => unit.notes || []);
  };

  logOut = (e) => {
    e.preventDefault();
    clearAuthSession();
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

  createClass = async (e) => {
    e.preventDefault();

    const { code, name, professor, year } = this.state.newClass;

    if (!code.trim() || !name.trim()) {
      alert("Please enter a class code and class name.");
      return;
    }

    this.setState({ savingClass: true });

    const payload = {
      code: code.trim(),
      name: name.trim(),
      professor: professor.trim() || null,
      year: year.trim() || null,
    };

    try {
      const response = await apiFetch(CLASSES_API_URL, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const rawClass = response?.class || response?.data || response || payload;

      const savedClass = this.normalizeCourse({
        ...payload,
        ...rawClass,
        id: rawClass.id || Date.now(),
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
    } catch (error) {
      this.setState({ savingClass: false });
      alert(error.message || "Could not create class.");
    }
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

  createNote = async (e) => {
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

    this.setState({ savingNote: true });

    const selectedUnit = this.getUnitsForClass(classId).find(
      (unit) => String(unit.id) === String(unitId)
    );

    const numericUnitId = Number.isNaN(Number(unitId)) ? unitId : Number(unitId);

    const notePayload = {
      title: title.trim(),
      content: content.trim() || "No content added yet.",
      tags,
      unitId: numericUnitId,
      myUnit: { id: numericUnitId },
      unit: { id: numericUnitId },
    };

    try {
      let savedNoteData = null;

      if (files.length > 0) {
        const formData = new FormData();

        formData.append(
          "note",
          new Blob([JSON.stringify(notePayload)], {
            type: "application/json",
          })
        );

        formData.append("unitId", String(unitId));
        formData.append("title", notePayload.title);
        formData.append("content", notePayload.content);
        formData.append("tags", tags.join(","));

        files.forEach((file) => {
          if (file.fileObject) {
            formData.append("files", file.fileObject, file.name);
          }
        });

        savedNoteData = await apiFetch(NOTES_API_URL, {
          method: "POST",
          body: formData,
        });
      } else {
        savedNoteData = await apiFetch(NOTES_API_URL, {
          method: "POST",
          body: JSON.stringify(notePayload),
        });
      }

      const savedNote = this.normalizeNote(
        savedNoteData || {
          ...notePayload,
          id: Date.now(),
          date: new Date().toISOString(),
        },
        selectedUnit
      );

      if ((!savedNote.files || savedNote.files.length === 0) && files.length > 0) {
        savedNote.files = files.map((file) => ({
          ...file,
          fileObject: null,
        }));
      }

      this.addNoteToLocalState(savedNote, classId, unitId);
    } catch (error) {
      this.setState({ savingNote: false });
      alert(error.message || "The note could not be saved to the backend.");
    }
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

  openFileViewer = (file) => {
    this.setState({ selectedFile: file });
  };

  closeFileViewer = () => {
    this.setState({ selectedFile: null });
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
          <h3>Backend connection issue</h3>
          <p>{loadError}</p>
          <button className="secondary-button" onClick={this.loadClassesAndUnits}>
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

          <button className="new-note-button" onClick={() => this.openNewNoteModal()}>
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
              View your classes, open individual class pages, and add notes to
              specific units.
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
          <h3>Backend connection issue</h3>
          <p>{loadError}</p>
          <button className="secondary-button" onClick={this.loadClassesAndUnits}>
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

            <button className="secondary-button" onClick={this.loadClassesAndUnits}>
              Refresh
            </button>
          </div>
        </div>

        <div className="courses-grid">
          {classes.map((course) => {
            const units = unitsByClassId[String(course.id)] || [];
            const noteCount = units.reduce(
              (total, unit) => total + (unit.notes ? unit.notes.length : 0),
              0
            );

            return (
              <div
                className="course-card clickable-course-card"
                key={course.id}
                role="button"
                tabIndex="0"
                onClick={() => this.openClassDetailPage(course.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    this.openClassDetailPage(course.id);
                  }
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

                {course.year && <p className="course-meta">Year: {course.year}</p>}

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
      (course) => String(course.id) === String(this.state.selectedClassPageId)
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
      0
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
                      onClick={() => this.selectUnit(selectedCourse.id, unit.id)}
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
    const unitsForSelectedClass = this.getUnitsForClass(this.state.selectedClassId);
    const notesToShow = selectedUnit ? selectedUnit.notes || [] : this.getAllNotes();

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

          <button className="new-note-button" onClick={() => this.openNewNoteModal()}>
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
            <p>
              This unit exists in the backend, but it does not have any notes yet.
            </p>

            <button
              className="new-note-button"
              onClick={() =>
                this.openNewNoteModal(
                  this.state.selectedClassId,
                  this.state.selectedUnitId
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
                  if (e.key === "Enter") {
                    this.openNotePopup(note);
                  }
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
                      ) : (
                        <div key={file.id} className="note-file-badge">
                          <span>{file.name.split(".").pop().toUpperCase()}</span>
                          <p>{file.name}</p>
                        </div>
                      )
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
    if (!this.state.showNewClassModal) {
      return null;
    }

    const { newClass, savingClass } = this.state;

    return (
      <div className="modal-backdrop-custom">
        <div className="new-note-modal">
          <div className="modal-header-custom">
            <div>
              <h2>Add Class</h2>
              <p>Create a new class in the backend database.</p>
            </div>

            <button className="modal-close-button" onClick={this.closeNewClassModal}>
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
    if (!this.state.showNewNoteModal) {
      return null;
    }

    const { newNote, classes, savingNote } = this.state;
    const unitsForNewNote = this.getUnitsForClass(newNote.classId);

    return (
      <div className="modal-backdrop-custom">
        <div className="new-note-modal">
          <div className="modal-header-custom">
            <div>
              <h2>Create New Note</h2>
              <p>This note will be saved to the selected backend unit.</p>
            </div>

            <button className="modal-close-button" onClick={this.closeNewNoteModal}>
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
                accept="*/*"
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
                          <span>{file.name.split(".").pop().toUpperCase()}</span>
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

    if (!selectedNote) {
      return null;
    }

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

            <button className="modal-close-button" onClick={this.closeNotePopup}>
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
                            this.openFileViewer(file);
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
    const { selectedFile } = this.state;

    if (!selectedFile) {
      return null;
    }

    const url = this.getFileUrl(selectedFile);
    const isImage = selectedFile.type && selectedFile.type.startsWith("image/");
    const isPdf = selectedFile.type === "application/pdf";

    return (
      <div className="modal-backdrop-custom file-viewer-backdrop">
        <div className="file-viewer-modal">
          <div className="modal-header-custom">
            <div>
              <h2>{selectedFile.name}</h2>
              <p>{selectedFile.type || "Attached file"}</p>
            </div>

            <button className="modal-close-button" onClick={this.closeFileViewer}>
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
              <img src={url} alt={selectedFile.name} className="file-viewer-image" />
            ) : isPdf ? (
              <iframe
                src={url}
                title={selectedFile.name}
                className="file-viewer-frame"
              />
            ) : (
              <iframe
                src={url}
                title={selectedFile.name}
                className="file-viewer-frame"
              />
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
    if (this.state.activeSection === "dashboard") {
      return this.renderDashboard();
    }

    if (this.state.activeSection === "classes") {
      return this.renderClasses();
    }

    if (this.state.activeSection === "classDetail") {
      return this.renderClassDetail();
    }

    if (this.state.activeSection === "notes") {
      return this.renderNotes();
    }

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
            <span>NoteSpace</span>
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

            <button
              className="new-note-button"
              onClick={() => this.openNewNoteModal()}
            >
              + New Note
            </button>
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