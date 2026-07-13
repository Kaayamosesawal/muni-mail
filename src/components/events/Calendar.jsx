import React from 'react';
import Card, { CardHeader } from '../common/Card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faGlobe, faUsers } from '@fortawesome/free-solid-svg-icons';

const Calendar = ({ upcomingEvents = [], onEventClick }) => {
  return (
    <Card className="bg-slate-900 border border-white/5 shadow-2xl shadow-slate-900/50 rounded-[2.5rem] p-6">
      <CardHeader 
        title={<span className="text-white font-syne font-black uppercase tracking-widest text-xs">Calendar</span>} 
        subtitle={<span className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.3em]">Upcoming Highlights</span>}
        className="mb-6"
      />
      
      <div className="space-y-5">
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((ev, i) => {
            const eventDate = ev.date ? new Date(ev.date) : new Date();
            const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
            const day = eventDate.getDate();

            const isGlobal = !ev.clubId || ev.clubId === "muni_general";

            return (
              <div 
                key={ev.id || i} 
                onClick={() => onEventClick && onEventClick(ev)}
                className="flex items-center gap-4 group cursor-pointer transition-all duration-300 hover:translate-x-2"
              >
                {/* Date Icon */}
                <div className="relative w-12 h-14 rounded-2xl bg-white/5 flex flex-col items-center justify-center border border-white/10 transition-all group-hover:bg-brand group-hover:border-brand/50 shadow-lg overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                  
                  <span className="relative z-10 text-[8px] font-black text-brand group-hover:text-white/80 uppercase tracking-tighter mb-0.5 transition-colors">
                    {month}
                  </span>
                  <span className="relative z-10 text-lg font-syne font-black text-white leading-none">
                    {day}
                  </span>
                </div>

                {/* Event Details */}
                <div className="flex-1 border-b border-white/5 pb-3 group-last:border-none min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h4 className="text-[11px] font-black text-slate-100 line-clamp-1 group-hover:text-brand transition-colors uppercase tracking-tight">
                      {ev.title}
                    </h4>
                    
                    {/* Visibility Indicator */}
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      {isGlobal ? (
                        <FontAwesomeIcon icon={faGlobe} className="text-emerald-400" />
                      ) : (
                        <FontAwesomeIcon icon={faUsers} className="text-amber-400" />
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <p className="text-[9px] font-bold text-slate-400 font-dm">{ev.time}</p>
                      <p className="text-[8px] text-slate-500 font-medium line-clamp-1 flex items-center gap-1">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[7px]" />
                        {ev.location}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <span className="text-[8px] font-black text-brand uppercase">View</span>
                      <div className="w-1 h-1 bg-brand rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-10 text-center border border-dashed border-white/5 rounded-3xl">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">No upcoming events</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-8 pt-6 border-t border-white/5">
        <div className="bg-gradient-to-br from-brand/20 to-brand/5 rounded-[1.5rem] p-5 border border-brand/20 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-brand/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          
          <p className="relative z-10 text-[9px] font-black text-brand uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-brand rounded-full" /> 
            Personal Schedule
          </p>
          <p className="relative z-10 text-[11px] text-slate-400 font-dm leading-relaxed">
            Your registered events are synced with your <span className="text-slate-200 font-bold">Muni Profile</span>.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default Calendar;