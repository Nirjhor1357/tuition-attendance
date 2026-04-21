import React, { useMemo, useState } from 'react';
import EmptyState from '../components/ui/EmptyState';

const INITIAL_FORM = { id: null, name: '', batch: 'General' };

function StudentsPage({ students, onAddStudent, onUpdateStudent, onDeleteStudent }) {
  const [search, setSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState('all');
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');

  const batches = useMemo(() => {
    return ['all', ...new Set(students.map((student) => student.batch || 'General'))];
  }, [students]);

  const filtered = useMemo(() => {
    return students.filter((student) => {
      const searchMatch = student.name.toLowerCase().includes(search.toLowerCase());
      const batchMatch = batchFilter === 'all' ? true : (student.batch || 'General') === batchFilter;
      return searchMatch && batchMatch;
    });
  }, [students, search, batchFilter]);

  const grouped = useMemo(() => {
    return filtered.reduce((acc, student) => {
      const key = student.batch || 'General';
      if (!acc[key]) acc[key] = [];
      acc[key].push(student);
      return acc;
    }, {});
  }, [filtered]);

  const submitForm = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Student name is required.');
      return;
    }

    try {
      if (form.id) {
        await onUpdateStudent(form.id, { name: form.name, batch: form.batch });
      } else {
        await onAddStudent({ name: form.name, batch: form.batch });
      }
      setForm(INITIAL_FORM);
    } catch (err) {
      setError(err.message || 'Could not save student.');
    }
  };

  const startEdit = (student) => {
    setForm({ id: student.id, name: student.name, batch: student.batch || 'General' });
  };

  return (
    <section className="fade-in">
      <article className="card">
        <div className="section-head">
          <h3>{form.id ? 'Edit Student' : 'Add Student'}</h3>
        </div>
        <form className="grid-form" onSubmit={submitForm}>
          <label>
            Student Name
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter full name"
            />
          </label>
          <label>
            Batch / Class
            <input
              value={form.batch}
              onChange={(e) => setForm((prev) => ({ ...prev, batch: e.target.value }))}
              placeholder="Batch A"
            />
          </label>
          <div className="inline-actions">
            <button className="btn btn-primary" type="submit">
              {form.id ? 'Update Student' : 'Add Student'}
            </button>
            {form.id ? (
              <button className="btn btn-light" type="button" onClick={() => setForm(INITIAL_FORM)}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
        {error ? <p className="error-text">{error}</p> : null}
      </article>

      <article className="card">
        <div className="filters-row">
          <input
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student"
          />
          <select value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)}>
            {batches.map((batch) => (
              <option key={batch} value={batch}>
                {batch === 'all' ? 'All batches' : batch}
              </option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No students found" subtitle="Try a different search or add your first student." />
        ) : (
          <div className="batch-groups">
            {Object.entries(grouped).map(([batch, members]) => (
              <div key={batch} className="batch-card">
                <h4>{batch}</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((student) => (
                      <tr key={student.id}>
                        <td>{student.name}</td>
                        <td>{new Date(student.createdAt).toLocaleDateString()}</td>
                        <td className="inline-actions">
                          <button className="btn btn-light" type="button" onClick={() => startEdit(student)}>
                            Edit
                          </button>
                          <button
                            className="btn btn-danger"
                            type="button"
                            onClick={() => onDeleteStudent(student.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}

export default StudentsPage;
