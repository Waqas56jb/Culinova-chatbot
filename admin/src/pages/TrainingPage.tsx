import { useMemo, useState } from 'react'
import { Badge, Card } from '@/components/ui'
import { TRAINING_ENTRIES } from '@/data/mock'
import type { TrainingEntry } from '@/types'

const CATEGORIES = ['Company', 'Services', 'Process', 'Projects', 'Contact']

const EMPTY_FORM = { title: '', category: CATEGORIES[0], content: '' }

export function TrainingPage() {
  const [entries, setEntries] = useState<TrainingEntry[]>(TRAINING_ENTRIES)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const filtered = useMemo(
    () =>
      categoryFilter === 'all'
        ? entries
        : entries.filter((entry) => entry.category === categoryFilter),
    [entries, categoryFilter],
  )

  const publishedCount = entries.filter((entry) => entry.status === 'published').length

  const startEdit = (entry: TrainingEntry) => {
    setEditingId(entry.id)
    setForm({ title: entry.title, category: entry.category, content: entry.content })
  }

  const resetForm = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const saveEntry = () => {
    if (!form.title.trim() || !form.content.trim()) return

    const today = new Date().toISOString().slice(0, 10)

    if (editingId) {
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === editingId
            ? { ...entry, ...form, updatedAt: today }
            : entry,
        ),
      )
    } else {
      setEntries((prev) => [
        {
          id: `T-${String(prev.length + 1).padStart(2, '0')}`,
          ...form,
          status: 'draft',
          updatedAt: today,
        },
        ...prev,
      ])
    }
    resetForm()
  }

  const toggleStatus = (id: string) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? { ...entry, status: entry.status === 'published' ? 'draft' : 'published' }
          : entry,
      ),
    )
  }

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id))
    if (editingId === id) resetForm()
  }

  return (
    <div className="training-layout">
      <Card
        className="training-list-card"
        title={`Knowledge entries (${entries.length})`}
        subtitle={`${publishedCount} published · ${entries.length - publishedCount} draft`}
      >
        <div className="filter-bar__group training-filters" role="group" aria-label="Filter by category">
          <button
            type="button"
            className={`ui-chip${categoryFilter === 'all' ? ' ui-chip--active' : ''}`}
            onClick={() => setCategoryFilter('all')}
          >
            All
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              className={`ui-chip${categoryFilter === category ? ' ui-chip--active' : ''}`}
              onClick={() => setCategoryFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="training-list">
          {filtered.map((entry) => (
            <article key={entry.id} className="training-item">
              <div className="training-item__head">
                <div>
                  <h3 className="training-item__title">{entry.title}</h3>
                  <p className="training-item__meta">
                    {entry.category} · Updated {entry.updatedAt}
                  </p>
                </div>
                <Badge tone={entry.status === 'published' ? 'green' : 'gray'}>
                  {entry.status === 'published' ? 'Published' : 'Draft'}
                </Badge>
              </div>

              <p className="training-item__content">{entry.content}</p>

              <div className="training-item__actions">
                <button type="button" className="ui-btn" onClick={() => startEdit(entry)}>
                  Edit
                </button>
                <button type="button" className="ui-btn" onClick={() => toggleStatus(entry.id)}>
                  {entry.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  type="button"
                  className="ui-btn ui-btn--danger"
                  onClick={() => removeEntry(entry.id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}

          {filtered.length === 0 && <p className="table-empty">No entries in this category.</p>}
        </div>
      </Card>

      <Card
        className="training-form-card"
        title={editingId ? 'Edit entry' : 'Add knowledge'}
        subtitle="New entries save as draft until published"
      >
        <div className="form-stack">
          <label className="form-field">
            <span className="form-field__label">Title</span>
            <input
              type="text"
              className="ui-input"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="e.g. Warranty policy"
            />
          </label>

          <label className="form-field">
            <span className="form-field__label">Category</span>
            <select
              className="ui-input"
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span className="form-field__label">Content</span>
            <textarea
              className="ui-input form-field__textarea"
              rows={7}
              value={form.content}
              onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
              placeholder="Facts the assistant can use in answers..."
            />
          </label>

          <div className="form-actions">
            <button
              type="button"
              className="ui-btn ui-btn--primary"
              onClick={saveEntry}
              disabled={!form.title.trim() || !form.content.trim()}
            >
              {editingId ? 'Save changes' : 'Add entry'}
            </button>
            {editingId && (
              <button type="button" className="ui-btn" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>

          <p className="form-note">
            Published entries feed the assistant's knowledge base. Keep facts short, accurate, and
            aligned with culinova.sa.
          </p>
        </div>
      </Card>
    </div>
  )
}
