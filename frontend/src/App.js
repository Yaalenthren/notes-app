import React, { useState, useEffect, useCallback } from 'react';
import { notesApi } from './api';
import NoteCard from './components/NoteCard';
import NoteModal from './components/NoteModal';
import './App.css';

function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await notesApi.getAll();
      setNotes(res.data);
    } catch (err) {
      setError('Failed to load notes. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreate = () => {
    setEditingNote(null);
    setModalOpen(true);
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await notesApi.delete(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch {
      alert('Failed to delete note.');
    }
  };

  const handleSave = async (formData, file) => {
    try {
      let savedNote;
      if (editingNote) {
        const res = await notesApi.update(editingNote.id, formData);
        savedNote = res.data;
        setNotes((prev) => prev.map((n) => (n.id === savedNote.id ? savedNote : n)));
      } else {
        const res = await notesApi.create(formData);
        savedNote = res.data;
        setNotes((prev) => [savedNote, ...prev]);
      }

      if (file) {
        const uploadRes = await notesApi.uploadFile(savedNote.id, file);
        const updated = uploadRes.data;
        setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      }

      setModalOpen(false);
    } catch (err) {
      alert('Failed to save note.');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <span className="brand-dot" />
            <h1 className="brand-title">notes<span className="brand-accent">.</span></h1>
          </div>
          <button className="btn-primary" onClick={handleCreate}>
            + new note
          </button>
        </div>
      </header>

      <main className="app-main">
        {loading && (
          <div className="state-message">
            <span className="loading-dots">loading</span>
          </div>
        )}

        {error && (
          <div className="state-error">
            <span>{error}</span>
            <button onClick={fetchNotes}>retry</button>
          </div>
        )}

        {!loading && !error && notes.length === 0 && (
          <div className="state-empty">
            <p className="empty-headline">no notes yet.</p>
            <p className="empty-sub">create your first note to get started.</p>
            <button className="btn-primary" onClick={handleCreate}>create note</button>
          </div>
        )}

        {!loading && !error && notes.length > 0 && (
          <>
            <div className="notes-meta">
              <span>{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="notes-grid">
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {modalOpen && (
        <NoteModal
          note={editingNote}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
