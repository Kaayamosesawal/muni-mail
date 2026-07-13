import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarkerAlt, 
  faClock, 
  faArrowRight, 
  faUserCircle,
  faGlobe,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';

const EventCard = ({ event, onOpenDetails }) => {
  const eventDate = event.date ? new Date(event.date) : new Date();
  const day = eventDate.getDate();
  const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();

  const isGlobalEvent = !event.clubId || event.clubId === "muni_general";
  const FALLBACK_IMAGE = "https://raw.githubusercontent.com/Kaayamosesawal/images/main/muni_1.png";

  return (
    <Card 
      noPadding 
      hoverable 
      className="group border-none bg-white dark:bg-slate-900 shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] sm:aspect-video lg:h-52 overflow-hidden">
        {/* Date Badge */}
        <div className="absolute top-5 left-5 z-20 w-14 h-16 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center shadow-xl border border-white/20">
          <span className="text-[10px] font-black text-brand uppercase tracking-tighter">{month}</span>
          <span className="text-xl font-syne font-black text-slate-900 dark:text-white leading-none">{day}</span>
        </div>

        {/* Visibility Badge */}
        <div className="absolute top-5 right-5 z-20">
          <Badge 
            variant={isGlobalEvent ? "brand" : "slate"} 
            className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1"
          >
            {isGlobalEvent ? <FontAwesomeIcon icon={faGlobe} /> : <FontAwesomeIcon icon={faUsers} />}
            {isGlobalEvent ? "GLOBAL" : "CLUB"}
          </Badge>
        </div>

        {event.isFeatured && (
          <div className="absolute top-5 right-5 z-30 bg-amber-400 text-slate-900 text-[9px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg">
            Featured
          </div>
        )}

        <img 
          src={event.image || FALLBACK_IMAGE} 
          alt={event.title} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 flex flex-col flex-1">
        <div className="mb-4">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[9px] font-black text-brand uppercase tracking-[0.2em] bg-brand/10 dark:bg-brand/20 px-3 py-1.5 rounded-lg">
              {event.category || "General"}
            </span>
            
            <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <FontAwesomeIcon icon={faUserCircle} className="text-slate-300" />
              {event.organizer?.split(' ')[0] || "Muni"}
            </span>
          </div>
          
          <h3 className="text-lg md:text-xl font-syne font-black text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-brand transition-colors">
            {event.title}
          </h3>
          
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 font-dm line-clamp-2 leading-relaxed">
            {event.description || "Join us for this exciting campus event."}
          </p>
        </div>

        {/* Event Details */}
        <div className="space-y-3 mb-6 flex-1">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs font-bold font-dm">
            <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-brand/70 group-hover:bg-brand/10 transition-colors">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
            </div>
            <span className="line-clamp-1">{event.location}</span>
          </div>
          
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs font-bold font-dm">
            <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-brand/70 group-hover:bg-brand/10 transition-colors">
              <FontAwesomeIcon icon={faClock} />
            </div>
            <span>{event.time}</span>
          </div>
        </div>

        <Button 
          variant="secondary" 
          className="w-full py-4 rounded-2xl border-slate-100 dark:border-slate-700 font-syne font-black uppercase text-[10px] tracking-widest group-hover:bg-brand group-hover:text-white group-hover:border-brand transition-all duration-300"
          onClick={() => onOpenDetails(event)}
        >
          Explore Event
          <FontAwesomeIcon 
            icon={faArrowRight} 
            className="ml-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" 
          />
        </Button>
      </div>
    </Card>
  );
};

export default EventCard;