import React from 'react';
import './UserList.css';

const UserList = ({ users, onEdit, onDelete }) => {
    return (
        <div className="user-list-container">
            <h2>Student List</h2>
            <table className="user-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Class</th>
                        <th>MSSV</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user._id}>
                            <td>{user.name}</td>
                            <td>{user.class}</td>
                            <td>{user.mssv}</td>
                            <td>
                                <button onClick={() => onEdit(user)}>Edit</button>
                                <button onClick={() => onDelete(user._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserList;
