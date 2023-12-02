import React, { useState, useEffect } from 'react';
import axios from 'axios';



const pageSize = 10;

const DashBoard = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [editedMember, setEditedMember] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedRole, setEditedRole] = useState('');

  useEffect(() => {
    // fetching data
    axios.get("https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json")
      .then(response => {
        setMembers(response.data);
        setFilteredMembers(response.data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const handleSearch = () => {
    const filtered = members.filter(member =>
      Object.values(member).some(value =>
        value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredMembers(filtered);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEdit = (id, name, email, role) => {
    setEditedMember(id);
    setEditedName(name);
    setEditedEmail(email);
    setEditedRole(role);
  };

  const handleSave = (id) => {
    const updatedMembers = members.map(member =>
      member.id === id ? { ...member, name: editedName, email: editedEmail, role: editedRole } : member
    );
    setMembers(updatedMembers);
    setFilteredMembers(updatedMembers);
    setEditedMember(null);
    setSelectedRows([]);
  };

  const handleCancel = () => {
    setEditedMember(null);
    setEditedName('');
    setEditedEmail('');
    setEditedRole('');
  };

  const handleDeleteRow = (id) => {
    const updatedMembers = members.filter(member => member.id !== id);
    setMembers(updatedMembers);
    setFilteredMembers(updatedMembers);
    setSelectedRows([]);
    setEditedMember(null);
  };

  const handleDelete = () => {
    const updatedMembers = members.filter(member => !selectedRows.includes(member.id));
    setMembers(updatedMembers);
    setFilteredMembers(updatedMembers);
    setSelectedRows([]);
    setEditedMember(null);
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === pageSize) {
      setSelectedRows([]);
      setEditedMember(null);
    } else {
      setSelectedRows(filteredMembers.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(member => member.id));
      setEditedMember(null);
    }
  };

  const handleRowSelect = (id, name, email, role) => {
    if (editedMember === id) {
      //this will not change edit state if already editing ,so this will simply return
      return;
    }

    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
      setEditedMember(null);
    } else {
      setSelectedRows(prevSelectedRows => [...prevSelectedRows, id]);
      
    }
  };

  const isRowEditing = (id) => editedMember === id;

  return (
    <div>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="search-icon" onClick={handleSearch}>Search</button>
      </div>
      <div className="delete-container">
        <button className="delete" onClick={handleDelete}>Delete Selected</button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={toggleSelectAll}
                checked={selectedRows.length === pageSize}
              />
            </th>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredMembers
            .slice((currentPage - 1) * pageSize, currentPage * pageSize)
            .map(member => (
              <tr key={member.id} className={selectedRows.includes(member.id) ? 'selected-row' : ''}
              >
                <td>
                  <input
                    type="checkbox"
                    onChange={() => handleRowSelect(member.id, member.name, member.email, member.role)}
                    checked={selectedRows.includes(member.id)}
                  />
                </td>
                <td>{member.id}</td>
                <td>
                  {isRowEditing(member.id) ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                    />
                  ) : (
                    member.name
                  )}
                </td>
                <td>
                  {isRowEditing(member.id) ? (
                    <input
                      type="text"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                    />
                  ) : (
                    member.email
                  )}
                </td>
                <td>
                  {isRowEditing(member.id) ? (
                    <input
                      type="text"
                      value={editedRole}
                      onChange={(e) => setEditedRole(e.target.value)}
                    />
                  ) : (
                    member.role
                  )}
                </td>
                <td>
                  {isRowEditing(member.id) ? (
                    <>
                      <button className="save" onClick={() => handleSave(member.id)}>Save</button>
                      <button className="cancel" onClick={handleCancel}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="edit" onClick={() => handleEdit(member.id, member.name, member.email, member.role)}>Edit</button>
                      <button className="delete" onClick={() => handleDeleteRow(member.id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      <div className="pagination-container">
        <button className="first-page" onClick={() => handlePageChange(1)}>First Page</button>
        <button className="previous-page" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Previous Page</button>
        {Array.from({ length: Math.ceil(filteredMembers.length / pageSize) }, (_, index) => (
          <button key={index + 1} onClick={() => handlePageChange(index + 1)}>{index + 1}</button>
        ))}
        <button className="next-page" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === Math.ceil(filteredMembers.length / pageSize)}>Next Page</button>
        <button className="last-page" onClick={() => handlePageChange(Math.ceil(filteredMembers.length / pageSize))}>Last Page</button>
      </div>

      
    </div>
  );
};

export default DashBoard;
