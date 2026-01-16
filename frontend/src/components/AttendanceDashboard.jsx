import React, { useState, useEffect } from 'react';
import { attendanceAPI } from '../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AttendanceDashboard.css';

const AttendanceDashboard = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterDivision, setFilterDivision] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [stats, setStats] = useState({
    totalPresent: 0,
    totalAbsent: 0,
    totalPending: 0,
    totalRecords: 0,
  });

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (dateRange.startDate) filters.startDate = dateRange.startDate;
      if (dateRange.endDate) filters.endDate = dateRange.endDate;
      if (filterClass) filters.class = filterClass;
      if (filterDivision) filters.division = filterDivision;

      const response = await attendanceAPI.getAll(filters);

      if (response.data.success) {
        const validRecords = response.data.attendance.filter(r => r.studentId !== null);
        setAttendanceRecords(validRecords);
        calculateStats(validRecords);
        setError('');
      }
    } catch (err) {
      setError('Failed to fetch attendance records');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (records) => {
    const stats = {
      totalPresent: records.filter((r) => r.status === 'Present').length,
      totalAbsent: records.filter((r) => r.status === 'Absent').length,
      totalPending: records.filter((r) => r.status === 'Pending').length,
      totalRecords: records.length,
    };
    setStats(stats);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'class') setFilterClass(value);
    else if (name === 'division') setFilterDivision(value);
    else if (name === 'startDate')
      setDateRange((prev) => ({ ...prev, startDate: value }));
    else if (name === 'endDate')
      setDateRange((prev) => ({ ...prev, endDate: value }));
  };

  const handleApplyFilters = () => {
    fetchAttendance();
  };

  const chartData = [
    {
      name: 'Status Distribution',
      Present: stats.totalPresent,
      Absent: stats.totalAbsent,
      Pending: stats.totalPending,
    },
  ];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="dashboard-container">
      <h2>Attendance Dashboard</h2>

      {error && <div className="alert error">{error}</div>}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card present">
          <h4>Present</h4>
          <p className="stat-number">{stats.totalPresent}</p>
        </div>
        <div className="stat-card absent">
          <h4>Absent</h4>
          <p className="stat-number">{stats.totalAbsent}</p>
        </div>
        <div className="stat-card pending">
          <h4>Pending</h4>
          <p className="stat-number">{stats.totalPending}</p>
        </div>
        <div className="stat-card total">
          <h4>Total Records</h4>
          <p className="stat-number">{stats.totalRecords}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <h3>Filters</h3>
        <div className="filter-group">
          <div className="filter-item">
            <label htmlFor="class">Class:</label>
            <select
              id="class"
              name="class"
              value={filterClass}
              onChange={handleFilterChange}
            >
              <option value="">All Classes</option>
              <option value="10">Class 10</option>
              <option value="11">Class 11</option>
              <option value="12">Class 12</option>
              <option value="B.Tech">B.Tech</option>
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="division">Division:</label>
            <select
              id="division"
              name="division"
              value={filterDivision}
              onChange={handleFilterChange}
            >
              <option value="">All Divisions</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="startDate">From:</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-item">
            <label htmlFor="endDate">To:</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleFilterChange}
            />
          </div>

          <button onClick={handleApplyFilters} className="btn-apply-filters">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-section">
        <h3>Attendance Chart</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Present" fill="#4CAF50" />
            <Bar dataKey="Absent" fill="#f44336" />
            <Bar dataKey="Pending" fill="#ff9800" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Attendance Records Table */}
      <div className="records-section">
        <h3>Attendance Records ({attendanceRecords.length})</h3>

        {loading ? (
          <p className="loading">Loading records...</p>
        ) : attendanceRecords.length === 0 ? (
          <p className="no-records">No attendance records found</p>
        ) : (
          <div className="table-responsive">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Class</th>
                  <th>Division</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Verification</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record) => (
                  <tr key={record._id}>
                    <td>{record.studentId?.name || 'N/A'}</td>
                    <td>{record.studentId?.studentId || 'N/A'}</td>
                    <td>{record.studentId?.class || 'N/A'}</td>
                    <td>{record.studentId?.division || 'N/A'}</td>
                    <td>{formatDate(record.date)}</td>
                    <td>
                      <span className={`status-badge ${record.status.toLowerCase()}`}>
                        {record.status}
                      </span>
                    </td>
                    <td>
                      <div className="verification-icons">
                        <span className={`verify-icon ${record.qrVerified ? 'verified' : 'failed'}`}
                          title="QR Code">
                          ✓
                        </span>
                        <span className={`verify-icon ${record.fingerprintVerified ? 'verified' : 'failed'}`}
                          title="Fingerprint">
                          ✓
                        </span>
                        <span className={`verify-icon ${record.photoVerified ? 'verified' : 'failed'}`}
                          title="Photo">
                          ✓
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceDashboard;
