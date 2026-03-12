import React, { useState, useEffect } from 'react';
import './NoteModal.css';

function NoteModal({ note, onSave, onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setDescription(note.description || '');
    }
  }, [note]);

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Title is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      await onSave({ title: title.trim(), description: description.trim() }, file);
    } finally {
      setSaving(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">
            {note ? 'edit note' : 'new note'}
          </h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="field">
            <label className="field-label">title *</label>
            <input
              className={`field-input ${errors.title ? 'field-input--error' : ''}`}
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors({}); }}
              placeholder="enter a title..."
              autoFocus
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          <div className="field">
            <label className="field-label">description</label>
            <textarea
              className="field-input field-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="optional description..."
              rows={5}
            />
          </div>

          <div className="field">
            <label className="field-label">attachment (S3 upload)</label>
            <input
              className="field-file"
              type="file"
              onChange={(e) => setFile(e.target.files[0] || null)}
            />
            {file && <span className="file-name">{file.name}</span>}
            {note?.attachment_url && !file && (
              <a className="existing-file" href={note.attachment_url} target="_blank" rel="noopener noreferrer">
                current file ↗
              </a>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              cancel
            </button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'saving...' : note ? 'save changes' : 'create note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NoteModal;
