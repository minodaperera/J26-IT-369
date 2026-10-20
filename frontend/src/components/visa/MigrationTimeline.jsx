import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Plane,
  FileText,
  CreditCard,
  ShieldCheck,
  Plus,
  Trash2,
  Printer,
  Copy,
  Check,
} from 'lucide-react';

export const MigrationTimeline = ({ result, inputData }) => {
  const predictedDays =
    result?.estimated_processing_days_rounded || Math.round(result?.predicted_processing_days) || 14;
  const subDateStr = inputData?.document_submitted_date || new Date().toISOString().split('T')[0];
  const destCountry = inputData?.destination || 'Abroad';

  // Milestone Dates calculation
  const d0 = new Date(subDateStr);

  const d1 = new Date(d0);
  d1.setDate(d1.getDate() + Math.max(3, Math.round(predictedDays * 0.25)));

  const d2 = new Date(d0);
  d2.setDate(d2.getDate() + predictedDays);

  const d3 = new Date(d2);
  d3.setDate(d3.getDate() + 7);

  const d4 = new Date(d2);
  d4.setDate(d4.getDate() + 18);

  const formatDate = (dateObj) =>
    dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Interactive milestone state
  const [milestones, setMilestones] = useState([
    {
      id: 1,
      title: 'Milestone 1: Application Lodgment & Fee Clearance',
      targetDate: formatDate(d0),
      relativeDays: 'Day 0',
      status: 'completed',
      icon: 'file',
      description: `Formal visa dossier submitted for ${destCountry}. Initial document completeness check and bank solvency verified.`,
      tasks: [
        { id: '1-1', text: 'Visa application submission receipt confirmed', done: true },
        { id: '1-2', text: 'Proof of funds & bank solvency verified', done: true },
        { id: '1-3', text: 'Visa application fee payment cleared', done: true },
      ],
    },
    {
      id: 2,
      title: 'Milestone 2: Biometrics & VAC Processing Window',
      targetDate: formatDate(d1),
      relativeDays: `Day +${Math.max(3, Math.round(predictedDays * 0.25))}`,
      status: 'in_progress',
      icon: 'clock',
      description: `Appointment at VFS / Visa Application Center. Biometric scans collected and consular file dispatched.`,
      tasks: [
        { id: '2-1', text: 'Attend biometrics appointment at VAC center', done: false },
        { id: '2-2', text: 'Passport handover for consular processing', done: false },
      ],
    },
    {
      id: 3,
      title: `Milestone 3: AI Predicted Visa Grant Date (~${predictedDays} Days)`,
      targetDate: formatDate(d2),
      relativeDays: `Day +${predictedDays}`,
      status: 'pending',
      icon: 'shield',
      description: `Target outcome date forecasted by SafeMaga Machine Learning Regressor. Consular review completes.`,
      tasks: [
        { id: '3-1', text: 'Visa grant letter & decision email notification', done: false },
        { id: '3-2', text: 'Collect stamped passport / eVisa grant notice', done: false },
      ],
    },
    {
      id: 4,
      title: 'Milestone 4: Pre-Departure Logistics & Forex Endorsement',
      targetDate: formatDate(d3),
      relativeDays: `Day +${predictedDays + 7}`,
      status: 'pending',
      icon: 'credit',
      description: `Post-visa preparations. Secure international flight booking, currency exchange, and overseas health coverage.`,
      tasks: [
        { id: '4-1', text: `Confirm flight tickets to ${destCountry}`, done: false },
        { id: '4-2', text: 'Travel / Overseas Student Health Cover (OSHC) activated', done: false },
        { id: '4-3', text: 'Load international travel forex card & cash endorsement', done: false },
      ],
    },
    {
      id: 5,
      title: `Milestone 5: Flight Departure & Arrival in ${destCountry}`,
      targetDate: formatDate(d4),
      relativeDays: `Day +${predictedDays + 18}`,
      status: 'pending',
      icon: 'plane',
      description: `Boarding from Bandaranaike International Airport (CMB) and immigration entry clearance abroad!`,
      tasks: [
        { id: '5-1', text: 'Pre-flight luggage packing & customs compliance', done: false },
        { id: '5-2', text: `Immigration clearance & accommodation check-in in ${destCountry}`, done: false },
      ],
    },
  ]);

  const [newTaskText, setNewTaskText] = useState({});
  const [copied, setCopied] = useState(false);

  // Toggle task completion
  const toggleTask = (milestoneId, taskId) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== milestoneId) return m;
        const updatedTasks = m.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t));
        const allDone = updatedTasks.every((t) => t.done);
        const anyDone = updatedTasks.some((t) => t.done);
        const newStatus = allDone ? 'completed' : anyDone ? 'in_progress' : 'pending';
        return { ...m, tasks: updatedTasks, status: newStatus };
      })
    );
  };

  // Add custom task
  const addTask = (milestoneId) => {
    const text = newTaskText[milestoneId];
    if (!text || !text.trim()) return;

    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== milestoneId) return m;
        return {
          ...m,
          tasks: [...m.tasks, { id: `${m.id}-${Date.now()}`, text: text.trim(), done: false }],
        };
      })
    );
    setNewTaskText((prev) => ({ ...prev, [milestoneId]: '' }));
  };

  // Delete task
  const deleteTask = (milestoneId, taskId) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== milestoneId) return m;
        return {
          ...m,
          tasks: m.tasks.filter((t) => t.id !== taskId),
        };
      })
    );
  };

  // Overall completion percentage
  const allTasks = milestones.flatMap((m) => m.tasks);
  const completedTasks = allTasks.filter((t) => t.done);
  const progressPercent = allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0;

  // Copy timeline summary
  const copyTimelineText = () => {
    const textSummary = `SafeMaga Migration Timeline - ${destCountry}\nPredicted Visa Duration: ${predictedDays} Days\nSubmission Date: ${formatDate(
      d0
    )}\nEstimated Decision Date: ${formatDate(d2)}\nTarget Arrival Abroad: ${formatDate(
      d4
    )}\n\nMilestones:\n${milestones
      .map(
        (m) =>
          `[${m.status === 'completed' ? 'X' : ' '}] ${m.title} (${m.targetDate})\n` +
          m.tasks.map((t) => `   - [${t.done ? 'x' : ' '}] ${t.text}`).join('\n')
      )
      .join('\n\n')}`;

    navigator.clipboard.writeText(textSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="timeline-section">
      {/* Timeline Header */}
      <div className="timeline-header">
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={22} color="#2563eb" />
            Interactive Migration Timeline Management System
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
            Milestones and tasks synchronized with the AI-predicted turnaround time ({predictedDays} days).
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className="preset-btn"
            onClick={copyTimelineText}
            title="Copy timeline checklist"
          >
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy Plan'}
          </button>
          <button
            type="button"
            className="preset-btn"
            onClick={() => window.print()}
            title="Print timeline"
          >
            <Printer size={14} />
            Print
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 700 }}>
          <span style={{ color: '#334155' }}>Migration Milestone Progress</span>
          <span style={{ color: '#2563eb' }}>
            {completedTasks.length} of {allTasks.length} Tasks Completed ({progressPercent}%)
          </span>
        </div>
        <div className="timeline-progress-bar-bg">
          <div className="timeline-progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Milestones Vertical List */}
      <div className="milestones-container">
        {milestones.map((m) => {
          const isDone = m.status === 'completed';
          const isCurrent = m.status === 'in_progress';

          return (
            <div key={m.id} className="milestone-item">
              {/* Node Indicator */}
              <div
                className={`milestone-node ${isDone ? 'completed' : isCurrent ? 'active' : 'pending'}`}
                title={`Status: ${m.status}`}
              >
                {isDone ? (
                  <CheckCircle2 size={22} />
                ) : isCurrent ? (
                  <Clock size={20} />
                ) : (
                  <Circle size={18} />
                )}
              </div>

              {/* Milestone Content Box */}
              <div className="milestone-content">
                <div className="milestone-title-row">
                  <span className="milestone-title">{m.title}</span>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                      {m.relativeDays}
                    </span>
                    <span className="milestone-date-badge">{m.targetDate}</span>
                  </div>
                </div>

                <div className="milestone-desc">{m.description}</div>

                {/* Subtask Checklist */}
                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {m.tasks.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.4rem 0.6rem',
                        background: t.done ? '#f0fdf4' : '#ffffff',
                        border: '1px solid',
                        borderColor: t.done ? '#bbf7d0' : '#e2e8f0',
                        borderRadius: '6px',
                        fontSize: '0.825rem',
                      }}
                    >
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          cursor: 'pointer',
                          flex: 1,
                          color: t.done ? '#166534' : '#1e293b',
                          textDecoration: t.done ? 'line-through' : 'none',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={t.done}
                          onChange={() => toggleTask(m.id, t.id)}
                          style={{ accentColor: '#10b981', cursor: 'pointer' }}
                        />
                        <span>{t.text}</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => deleteTask(m.id, t.id)}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                        title="Delete task"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}

                  {/* Add Task Input */}
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.35rem' }}>
                    <input
                      type="text"
                      className="input-field"
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                      placeholder="Add personal task / reminder..."
                      value={newTaskText[m.id] || ''}
                      onChange={(e) => setNewTaskText((prev) => ({ ...prev, [m.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTask(m.id);
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="preset-btn"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                      onClick={() => addTask(m.id)}
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MigrationTimeline;
