import React from 'react';
import EventCard from './EventCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarTimes, faGlobe, faUsers } from '@fortawesome/free-solid-svg-icons';

const EventGrid = ({ events = [], onEventClick }) => {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] py-24 px-6 bg-slate-50/50 dark:bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl flex items-center justify-center text-slate-300 dark:text-slate-600 mb-8 border border-slate-100 dark:border-slate-700">
          <FontAwesomeIcon icon={faCalendarTimes} className="text-4xl" />
        </div>
        <h3 className="text-2xl font-syne font-black text-slate-900 dark:text-white uppercase tracking-tighter">
          No Events Found
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mt-3 max-w-sm text-center font-dm leading-relaxed">
          There are currently no events available. Check back later or explore different categories.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-8 md:gap-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {events.map((event, index) => (
        <div 
          key={event.id || index} 
          className="flex h-full"
          style={{ 
            animationDelay: `${index * 80}ms`,
            animationFillMode: 'both' 
          }}
        >
          <EventCard 
            event={event} 
            onOpenDetails={onEventClick} 
          />
        </div>
      ))}
    </div>
  );
};

export default EventGrid;