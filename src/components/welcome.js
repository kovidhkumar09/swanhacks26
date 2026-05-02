import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import templatesData from "../data/noteTemplates.json";
import "../index.css";

export default class Welcome extends Component {
  constructor(props) {
    super(props);
    this.imageInputRef = React.createRef();

    this.state = {
      username: "",
      selectedCategory: "All",
      activeSection: "dashboard",
      showNewNoteModal: false,
      notes: templatesData.sampleNotes,
      newNote: { title: "", category: "", content: "", images: [] },
    };
  }

  componentDidMount() {
    const storedUserDetails = sessionStorage.getItem("userDetails");
    if (storedUserDetails) {
      const getUserDetails = JSON.parse(storedUserDetails);
      this.setState({ username: getUserDetails.username || "Student" });
    }
  }

  logOut = (e) => {
    e.preventDefault();
    sessionStorage.clear();
    this.props.history.push("/signin");
  };

  setCategory = (category) => this.setState({ selectedCategory: category });
  setActiveSection = (section) => this.setState({ activeSection: section });

  openNewNoteModal = () => {
    this.setState({
      showNewNoteModal: true,
      newNote: { title: "", category: "", content: "", tags: [], tagsInput: "", images: [] },
    });
  };

  closeNewNoteModal = () => this.setState({ showNewNoteModal: false });

  handleNewNoteChange = (e) => {
  const { name, value } = e.target;

  this.setState((prevState) => {
    let updated = {
      ...prevState.newNote,
      [name]: value,
    };

    // TAG LOGIC
    if (name === "tagsInput") {
      updated.tags = value
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
    }

    return { newNote: updated };
  });
};

  handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        this.setState((prev) => ({
          newNote: {
            ...prev.newNote,
            images: [...prev.newNote.images, { name: file.name, src: ev.target.result }],
          },
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  removeImage = (index) => {
    this.setState((prev) => ({
      newNote: {
        ...prev.newNote,
        images: prev.newNote.images.filter((_, i) => i !== index),
      },
    }));
  };

  createNote = (e) => {
    e.preventDefault();
    const { title, category, content, images } = this.state.newNote;
    if (!title.trim()) { alert("Please enter a note title."); return; }

    const noteToAdd = {
      id: Date.now(),
      title,
      category: category || "General",
      content: content || "No content added yet.",
      tags: tags || [],
      images,
      date: new Date().toLocaleDateString(),
    };

    this.setState((prev) => ({
      notes: [noteToAdd, ...prev.notes],
      showNewNoteModal: false,
      activeSection: "notes",
      newNote: { title: "", category: "", content: "", tags: [], tagsInput: "", images: [] },
    }));
  };

  useTemplate = (template) => {
    this.setState({
      showNewNoteModal: true,
      newNote: {
        title: template.title,
        category: template.category,
        content: template.sampleContent || template.desceription || "",
        tags: [],
        tagsInput: "",
        images: [],
      },
    });
  };

  renderDashboard() {
    const categories = [
      "All",
      ...new Set(templatesData.templates.map((t) => t.category)),
    ];
    const filteredTemplates =
      this.state.selectedCategory === "All"
        ? templatesData.templates
        : templatesData.templates.filter(
            (t) => t.category === this.state.selectedCategory
          );

    return (
      <section className="template-section">

        <div className="category-pills">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => this.setCategory(category)}
              className={this.state.selectedCategory === category ? "category-pill active" : "category-pill"}
            >{category}</button>
          ))}
        </div>
        <div className="template-grid">
          {filteredTemplates.map((template, index) => (
            <div className="template-card" key={template.id} onClick={() => this.useTemplate(template)}>
              <div className={`template-preview preview-${(index % 6) + 1}`}>
                <div className="preview-topbar">
                  <span></span><span></span><span></span>
                </div>
                <div className="preview-content">
                  <h4>{template.title}</h4>
                  <p>{template.description}</p>
                  <div className="preview-line large"></div>
                  <div className="preview-line"></div>
                  <div className="preview-line short"></div>
                </div>
              </div>
              <div className="template-info">
                <h3>{template.title}</h3>
                <p>{template.description}</p>
                <span>{template.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  renderNotes() {
    return (
      <section className="notes-section">
        <div className="notes-section-header">
          <div>
            <h2>My Notes</h2>
            <p>New notes created from the popup will appear here.</p>
          </div>
          <button className="new-note-button" onClick={this.openNewNoteModal}>+ New Note</button>
        </div>
        <div className="notes-list">
          {this.state.notes.map((note) => (
            <div className="note-card" key={note.id}>
              <div className="note-card-header">
                <h3>{note.title}</h3>
                <span>{note.category}</span>
              </div>
              <p className="note-date">{note.date}</p>
              <p className="note-content">{note.content}</p>
              {note.images && note.images.length > 0 && (
                <div className="note-images">
                  {note.images.map((img, i) => (
                    <img key={i} src={img.src} alt={img.name} className="note-image-thumb" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }

  renderNewNoteModal() {
    if (!this.state.showNewNoteModal) return null;
    const { images } = this.state.newNote;

    return (
      <div className="modal-backdrop-custom">
        <div className="new-note-modal">
          <div className="modal-header-custom">
            <div>
              <h2>Create New Note</h2>
              <p>This note will be added to the Notes tab.</p>
            </div>
            <button className="modal-close-button" onClick={this.closeNewNoteModal}>×</button>
          </div>

          <form onSubmit={this.createNote}>
            <label>Note Title</label>
            <input
              type="text"
              name="title"
              value={this.state.newNote.title}
              onChange={this.handleNewNoteChange}
              placeholder="Example: COM S 311 Homework Notes"
            />

            <label>Category</label>
            <input
              type="text"
              name="category"
              value={this.state.newNote.category}
              onChange={this.handleNewNoteChange}
              placeholder="Example: Assignments"
            />

            <label>Content</label>
            <textarea
              name="content"
              value={this.state.newNote.content}
              onChange={this.handleNewNoteChange}
              placeholder="Start writing your note here..."
              rows="5"
            ></textarea>

            <label>Images</label>
            <div className="image-upload-area">
              <input
                type="file"
                accept="image/*"
                multiple
                ref={this.imageInputRef}
                onChange={this.handleImageUpload}
                style={{ display: "none" }}
              />
              <button
                type="button"
                className="image-upload-button"
                onClick={() => this.imageInputRef.current.click()}
              >
                &#128247; Add Images
              </button>

              {images.length > 0 && (
                <div className="image-preview-grid">
                  {images.map((img, i) => (
                    <div key={i} className="image-preview-item">
                      <img src={img.src} alt={img.name} />
                      <button
                        type="button"
                        className="image-remove-button"
                        onClick={() => this.removeImage(i)}
                      >×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button type="button" className="cancel-button" onClick={this.closeNewNoteModal}>
                Cancel
              </button>
              <button type="submit" className="save-note-button">
                Save Note
              </button>
            </div>
          </form>
        </div>
      </div>
    );
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
              className={this.state.activeSection === "dashboard" ? "sidebar-link active" : "sidebar-link"}
              onClick={() => this.setActiveSection("dashboard")}
            ><span>🏠</span> Dashboard</button>
            <button
              className={this.state.activeSection === "notes" ? "sidebar-link active" : "sidebar-link"}
              onClick={() => this.setActiveSection("notes")}
            ><span>📝</span> Notes</button>
            <button className="sidebar-link"><span>📚</span> Assignments</button>
            <button className="sidebar-link"><span>📅</span> Calendar</button>
            <button className="sidebar-link"><span>✅</span> To-Do</button>
            <button className="sidebar-link"><span>✉️</span> Inbox</button>
          </nav>
          <div className="sidebar-footer">
            <Link to="/signin" onClick={this.logOut} className="logout-link">Logout</Link>
          </div>
        </aside>

        <main className="dashboard-main">
          <header className="dashboard-header">
            <div>
              <p className="welcome-text">Welcome back,</p>
              <h1>{this.state.username}</h1>
            </div>
            <button className="new-note-button" onClick={this.openNewNoteModal}>+ New Note</button>
          </header>
          {this.state.activeSection === "dashboard" ? this.renderDashboard() : this.renderNotes()}
        </main>

        {this.renderNewNoteModal()}
      </div>
    );
  }
}