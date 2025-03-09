import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Pin, PinOff, Edit2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { Note } from '../lib/supabase';

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get the current user's ID and fetch notes
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        fetchNotes();
      }
    });
  }, []);

  async function fetchNotes() {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      toast.error('Error loading notes');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !userId) return;
    
    try {
      if (editingNote) {
        const { error } = await supabase
          .from('notes')
          .update({
            title: title.trim(),
            content: content.trim()
          })
          .eq('id', editingNote.id)
          .eq('user_id', userId);

        if (error) throw error;
        toast.success('Note updated successfully');
      } else {
        const { error } = await supabase
          .from('notes')
          .insert({
            title: title.trim(),
            content: content.trim(),
            user_id: userId
          });

        if (error) throw error;
        toast.success('Note added successfully');
      }

      setTitle('');
      setContent('');
      setEditingNote(null);
      fetchNotes();
    } catch (error) {
      console.error('Error:', error);
      toast.error(editingNote ? 'Error updating note' : 'Error adding note');
    }
  };

  const startEditing = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
  };

  const cancelEditing = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
  };

  const deleteNote = async (id: string) => {
    if (!userId) return;

    try {
      if (editingNote?.id === id) {
        cancelEditing();
      }

      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      toast.success('Note deleted successfully');
      fetchNotes();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error deleting note');
    }
  };

  const togglePin = async (id: string) => {
    if (!userId) return;

    try {
      const note = notes.find(n => n.id === id);
      if (!note) return;

      const { error } = await supabase
        .from('notes')
        .update({ pinned: !note.pinned })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      fetchNotes();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error updating note');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-400"></div>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      <form onSubmit={addNote} className="mb-6 sm:mb-8">
        <div className="bg-[#121212] rounded-lg p-4 space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2 focus:outline-none focus:border-teal-400"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note..."
            rows={4}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2 focus:outline-none focus:border-teal-400 resize-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              {editingNote ? (
                <>
                  <Edit2 className="w-5 h-5" />
                  <span>Update Note</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Add Note</span>
                </>
              )}
            </button>
            {editingNote && (
              <button
                type="button"
                onClick={cancelEditing}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {notes.map(note => (
          <div
            key={note.id}
            className="bg-[#121212] rounded-lg p-4 relative group"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-white break-words pr-8">
                {note.title}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => startEditing(note)}
                  className="text-gray-400 hover:text-teal-400 transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => togglePin(note.id)}
                  className="text-gray-400 hover:text-teal-400 transition-colors"
                >
                  {note.pinned ? (
                    <Pin className="w-5 h-5" />
                  ) : (
                    <PinOff className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="text-gray-300 break-words whitespace-pre-wrap">
              {note.content}
            </p>
            <div className="mt-2 text-xs text-gray-500">
              {new Date(note.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
      
      {notes.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          No notes yet. Start by adding one!
        </div>
      )}
    </main>
  );
};

export default Notes;