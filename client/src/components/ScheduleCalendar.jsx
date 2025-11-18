import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar, Clock, MapPin, User } from 'lucide-react';

const ScheduleCalendar = ({ events, onEventClick }) => {

  const transformEvents = (personnel) => {
    const calendarEvents = [];
    
    personnel.forEach(person => {
      if (person.DAY && person.START_TIME && person.END_TIME) {
        let days = [];
        if (typeof person.DAY === 'string') {
          days = person.DAY.split(',').map(d => d.trim().toLowerCase());
        } else if (Array.isArray(person.DAY)) {
          days = person.DAY.map(d => d.toLowerCase());
        }
        
        const dayMap = { 
          'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 
          'thursday': 4, 'friday': 5, 'saturday': 6,
          'sun': 0, 'mon': 1, 'tue': 2, 'tu': 2, 'wed': 3, 'we': 3,
          'thu': 4, 'th': 4, 'fri': 5, 'fr': 5, 'sat': 6, 'sa': 6
        };
        
        const dayIndexes = days
          .map(day => dayMap[day.toLowerCase().trim()])
          .filter(dayIndex => dayIndex !== undefined);

        if (dayIndexes.length > 0) {
          const startDate = new Date();
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 3);
          
          let monthFilter = null;
          if (person.MONTH && person.MONTH !== 'All') {
            const monthNames = [
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ];
            monthFilter = monthNames.indexOf(person.MONTH);
          }

          const currentDate = new Date(startDate);
          while (currentDate <= endDate) {
            const dayOfWeek = currentDate.getDay();
            const currentMonth = currentDate.getMonth();
            
            const matchesDay = dayIndexes.includes(dayOfWeek);
            const matchesMonth = monthFilter === null || monthFilter === currentMonth;
            
            if (matchesDay && matchesMonth) {
              const eventDate = new Date(currentDate);
              const [startHour, startMinute] = person.START_TIME.split(':');
              const [endHour, endMinute] = person.END_TIME.split(':');
              
              const eventStart = new Date(eventDate);
              eventStart.setHours(parseInt(startHour), parseInt(startMinute), 0);
              
              const eventEnd = new Date(eventDate);
              eventEnd.setHours(parseInt(endHour), parseInt(endMinute), 0);

              // Generate unique colors based on person ID
              const colors = [
                { bg: '#3b82f6', border: '#2563eb', text: '#ffffff' },
                { bg: '#8b5cf6', border: '#7c3aed', text: '#ffffff' },
                { bg: '#ec4899', border: '#db2777', text: '#ffffff' },
                { bg: '#14b8a6', border: '#0d9488', text: '#ffffff' },
                { bg: '#f59e0b', border: '#d97706', text: '#ffffff' },
                { bg: '#06b6d4', border: '#0891b2', text: '#ffffff' },
                { bg: '#10b981', border: '#059669', text: '#ffffff' },
                { bg: '#6366f1', border: '#4f46e5', text: '#ffffff' },
              ];
              const colorIndex = person.ID ? person.ID % colors.length : 0;
              const color = colors[colorIndex];

              calendarEvents.push({
                title: `${person.USER}`,
                start: eventStart,
                end: eventEnd,
                extendedProps: {
                  personData: person,
                  location: person.SCHEDULE_LOCATION || 'N/A',
                  userName: person.USER
                },
                backgroundColor: color.bg,
                borderColor: color.border,
                textColor: color.text,
              });
            }
            
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }
      }
    });
    
    return calendarEvents;
  };

  const calendarEvents = transformEvents(events);

  const handleEventClick = (clickInfo) => {
    if (onEventClick && clickInfo.event.extendedProps.personData) {
      onEventClick(clickInfo.event.extendedProps.personData);
    }
  };

  const renderEventContent = (eventInfo) => {
    return (
      <div className="custom-event-content">
        <div className="event-title">{eventInfo.event.title}</div>
        <div className="event-location">
          <MapPin size={10} />
          <span>{eventInfo.event.extendedProps.location}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="modern-calendar-wrapper">
      <div className="calendar-header">
        <div className="header-content">
          <div className="header-icon">
            <Calendar size={28} />
          </div>
          <div>
            <h2 className="header-title">Patrol Schedule</h2>
            <p className="header-subtitle">Barangay Tanod Duty Roster</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <User size={18} />
            <div>
              <div className="stat-value">{events.length}</div>
              <div className="stat-label">Active Personnel</div>
            </div>
          </div>
          <div className="stat-card">
            <Clock size={18} />
            <div>
              <div className="stat-value">{calendarEvents.length}</div>
              <div className="stat-label">Scheduled Shifts</div>
            </div>
          </div>
        </div>
      </div>

      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={calendarEvents}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          editable={false}
          selectable={true}
          dayMaxEvents={true}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short'
          }}
          slotMinTime="06:00:00"
          slotMaxTime="23:00:00"
          allDaySlot={false}
          height="auto"
          aspectRatio={1.8}
        />
      </div>

      <style>{`
        .modern-calendar-wrapper {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .calendar-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .header-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
        }

        .header-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .header-subtitle {
          font-size: 0.95rem;
          color: #64748b;
          margin: 4px 0 0 0;
        }

        .header-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .stat-card {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          border: 1px solid rgba(148, 163, 184, 0.2);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }

        .stat-card svg {
          color: #667eea;
          flex-shrink: 0;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a2e;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #64748b;
          margin-top: 4px;
        }

        .calendar-container {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }
        
        .fc {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        
        .fc .fc-toolbar {
          margin-bottom: 24px;
          gap: 12px;
        }

        .fc .fc-toolbar-chunk {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .fc .fc-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          text-transform: capitalize;
          font-weight: 600;
          padding: 10px 18px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          transition: all 0.3s ease;
        }
        
        .fc .fc-button:hover {
          background: linear-gradient(135deg, #5568d3 0%, #653a8b 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }

        .fc .fc-button:active {
          transform: translateY(0);
        }

        .fc .fc-button:focus {
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
        }
        
        .fc .fc-button-primary:not(:disabled).fc-button-active {
          background: linear-gradient(135deg, #4c51bf 0%, #553c7c 100%);
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .fc .fc-button-primary:disabled {
          background: #cbd5e1;
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }
        
        .fc-theme-standard .fc-scrollgrid {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }

        .fc .fc-col-header-cell {
          background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.5px;
          color: #475569;
          padding: 16px 8px;
          border-color: #e2e8f0;
        }

        .fc .fc-daygrid-day {
          transition: background-color 0.2s ease;
        }

        .fc .fc-daygrid-day:hover {
          background-color: #f8fafc;
        }

        .fc .fc-daygrid-day.fc-day-today {
          background-color: rgba(102, 126, 234, 0.05) !important;
        }

        .fc .fc-daygrid-day-number {
          color: #1e293b;
          font-weight: 600;
          padding: 8px;
        }

        .fc .fc-day-today .fc-daygrid-day-number {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .fc-event {
          cursor: pointer;
          border-radius: 8px;
          border: none !important;
          padding: 6px 10px;
          margin: 2px 4px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          transition: all 0.2s ease;
          overflow: hidden;
        }
        
        .fc-event:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
        }

        .custom-event-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .event-title {
          font-weight: 700;
          font-size: 0.85rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .event-location {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          opacity: 0.95;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .event-location svg {
          flex-shrink: 0;
        }
        
        .fc .fc-timegrid-slot {
          height: 3em;
          border-color: #f1f5f9;
        }

        .fc .fc-timegrid-slot-label {
          color: #64748b;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .fc .fc-timegrid-divider {
          display: none;
        }
        
        .fc-toolbar-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1a1a2e;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .fc-daygrid-event {
          white-space: normal;
        }

        .fc .fc-scrollgrid-section-header > * {
          border-color: #e2e8f0;
        }

        .fc .fc-timegrid-axis {
          background-color: #fafafa;
        }

        @media (max-width: 768px) {
          .modern-calendar-wrapper {
            padding: 16px;
            border-radius: 16px;
          }

          .calendar-header {
            padding: 20px;
          }

          .header-title {
            font-size: 1.5rem;
          }

          .header-stats {
            grid-template-columns: 1fr;
          }

          .calendar-container {
            padding: 16px;
          }

          .fc-toolbar-title {
            font-size: 1.25rem;
          }

          .fc .fc-button {
            padding: 8px 12px;
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ScheduleCalendar;