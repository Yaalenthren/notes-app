import React from 'react';
import './NoteCard.css';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function NoteCard({ note, onEdit, onDelete }) {
  return (
    <div className="note-card">
      <div className="note-card-header">
        <span className="note-id">#{note.id}</span>
        <span className="note-date">{formatDate(note.created_at)}</span>
      </div>

      <h2 className="note-title">{note.title}</h2>

      {note.description && (
        <p className="note-description">{note.description}</p>
      )}

      {note.attachment_url && (
        <a
          className="note-attachment"
          href={note.attachment_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          ↗ attachment
        </a>
      )}

      <div className="note-actions">
        <button className="btn-edit" onClick={() => onEdit(note)}>edit</button>
        <button className="btn-delete" onClick={() => onDelete(note.id)}>delete</button>
      </div>
    </div>
  );
}

export default NoteCard;
