import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css';

interface DashboardProps {
  user: any;
  onLogout: () => void;
  onSelectProject: (project: any) => void;
}

interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

function Dashboard({ user, onLogout, onSelectProject }: DashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data);
    } catch (err) {
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const response = await axios.post(
        '/api/projects',
        {
          name: newProjectName,
          description: newProjectDesc
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProjects([response.data, ...projects]);
      setNewProjectName('');
      setNewProjectDesc('');
      setShowNewProject(false);
    } catch (err) {
      setError('Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      await axios.delete(`/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (err) {
      setError('Failed to delete project');
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>🔍 Code Analyzer</h1>
          <p>Multi-Language Code Quality Analysis</p>
        </div>
        <div className="header-right">
          <span className="user-info">👤 {user.username || user.email}</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="projects-header">
          <h2>Your Projects</h2>
          <button 
            onClick={() => setShowNewProject(!showNewProject)}
            className="new-project-btn"
          >
            + New Project
          </button>
        </section>

        {showNewProject && (
          <div className="new-project-form">
            <h3>Create New Project</h3>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="My Project"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Project description..."
                  rows={3}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn">Create</button>
                <button 
                  type="button" 
                  onClick={() => setShowNewProject(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {error && <div className="error-box">{error}</div>}

        {loading ? (
          <div className="loading">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="no-projects">
            <p>No projects yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map(project => (
              <div key={project.id} className="project-card">
                <div className="project-header">
                  <h3>{project.name}</h3>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="delete-btn"
                    title="Delete project"
                  >
                    ×
                  </button>
                </div>
                {project.description && (
                  <p className="project-desc">{project.description}</p>
                )}
                <div className="project-meta">
                  <small>{new Date(project.createdAt).toLocaleDateString()}</small>
                </div>
                <button
                  onClick={() => onSelectProject(project)}
                  className="analyze-btn"
                >
                  Analyze Files →
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="dashboard-footer">
        <p>Code Analyzer v1.1.0 - Analyze, Optimize, Improve</p>
      </footer>
    </div>
  );
}

export default Dashboard;
