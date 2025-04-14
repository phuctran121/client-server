import React, { useState, useEffect } from 'react';
import './AddUser.css';

const AddUser = ({ onSubmit, editingId, initialData, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        class: '',
        mssv: ''
    });

    // Update form data when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                name: '',
                class: '',
                mssv: ''
            });
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="add-user-container">
            <h2>Student Management</h2>
            <form onSubmit={handleSubmit} className="object-form">
                <div className="form-group">
                    <label>Name:</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Class:</label>
                    <input
                        type="text"
                        value={formData.class}
                        onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>MSSV:</label>
                    <input
                        type="text"
                        value={formData.mssv}
                        onChange={(e) => setFormData({ ...formData, mssv: e.target.value })}
                        required
                        disabled={!!editingId}
                    />
                </div>
                <button type="submit">
                    {editingId ? 'Update Student' : 'Create Student'}
                </button>
                {editingId && (
                    <button type="button" onClick={onCancel}>
                        Cancel Edit
                    </button>
                )}
            </form>
        </div>
    );
};

export default AddUser;
