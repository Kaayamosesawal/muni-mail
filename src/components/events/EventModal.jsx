import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarCheck, 
  faUserFriends, 
  faShare, 
  faMapMarkerAlt, 
  faCheckCircle,
  faClock,
  faEdit,
  faTrashAlt,
  faInfoCircle,
  faGlobe,
  faUsers,
  faBuilding
} from '@fortawesome/free-solid-svg-icons';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';

const EventModal = ({ 
  event, 
  isOpen, 
  onClose, 
  onRSVP, 
  userId, 
  onEdit, 
  onDelete, 
  onShare 
}) => {
  if (!event) return null;

  const isAttending = event.attendees?.includes(userId) || false;
  const isOrganizer = userId === event.organizerId;
  const isGlobalEvent = !event.clubId || event.clubId === "muni_general";
  
  const FALLBACK_IMAGE = "https://raw.githubusercontent.com/Kaayamosesawal/images/main/muni_1.png";

  const handleShareToFeed = () => {
    const shareData = {
      content: `I'm attending ${event.title}! \n\n${event.description?.substring(0, 120)}...`,
      image: event.image || FALLBACK_IMAGE,
      category: 'Events',
      eventId: event.id,
      type: 'share'
    };
    onShare?.(shareData);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Event Details" 
      maxWidth="max-w-4xl"
    >
      <div className="max-h-[78vh] overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-8 p-1">
          
          {/* Cover Image */}
          <div className="relative h-64 md:h-80 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <img 
              src={event.image || FALLBACK_IMAGE} 
              alt={event.title} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            
            <div className="absolute top-6 left-6 flex gap-3">
              <Badge 
                variant={isGlobalEvent ? "brand" : "slate"} 
                className="flex items-center gap-2 px-5 py-2"
              >
                {isGlobalEvent ? <FontAwesomeIcon icon={faGlobe} /> : <FontAwesomeIcon icon={faUsers} />}
                {isGlobalEvent ? "Global Event" : "Club Event"}
              </Badge>
              
              {event.category && (
                <Badge variant="outline" className="px-5 py-2">
                  {event.category}
                </Badge>
              )}
            </div>

            {isOrganizer && (
              <div className="absolute top-6 right-6">
                <Badge variant="success" className="px-4 py-1 text-xs">
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                  Organizer
                </Badge>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-syne font-black text-slate-900 dark:text-white tracking-tighter">
                  {event.title}
                </h2>
                <p className="text-brand text-sm font-bold mt-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  Organized by {event.organizer}
                </p>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[15.5px]">
                  {event.description}
                </p>
              </div>

              {/* Club Info (if club event) */}
              {!isGlobalEvent && event.clubName && (
                <div className="flex items-center gap-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl">
                  <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faBuilding} size="lg" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Hosted by</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{event.clubName}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faCalendarCheck} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-brand/70 uppercase tracking-widest">DATE</p>
                    <p className="text-xl font-bold">{event.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faClock} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-brand/70 uppercase tracking-widest">TIME</p>
                    <p className="text-xl font-bold">{event.time}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center mt-0.5">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-brand/70 uppercase tracking-widest">LOCATION</p>
                    <p className="text-lg font-medium leading-tight">{event.location}</p>
                  </div>
                </div>

                <Button 
                  onClick={() => onRSVP(event.id)}
                  className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg ${
                    isAttending 
                      ? 'bg-emerald-500 hover:bg-emerald-600' 
                      : 'bg-brand hover:bg-brand/90'
                  }`}
                >
                  {isAttending ? (
                    <>✓ You're Going</>
                  ) : (
                    <>Register / RSVP</>
                  )}
                </Button>

                <p className="text-center text-xs text-slate-400 pt-2">
                  {event.attendeeCount || 0} students attending
                </p>
              </div>

              {/* Share Button */}
              <Button 
                variant="ghost" 
                onClick={handleShareToFeed}
                className="w-full py-4 border border-slate-200 dark:border-slate-700 hover:bg-brand hover:text-white rounded-2xl transition-all"
              >
                <FontAwesomeIcon icon={faShare} className="mr-2" />
                Share with Circle
              </Button>

              {/* Organizer Controls */}
              {isOrganizer && (
                <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button 
                    onClick={() => onEdit(event)} 
                    variant="secondary" 
                    className="flex-1"
                  >
                    <FontAwesomeIcon icon={faEdit} className="mr-2" /> Edit Event
                  </Button>
                  <Button 
                    onClick={() => onDelete(event.id)} 
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  >
                    <FontAwesomeIcon icon={faTrashAlt} className="mr-2" /> Delete
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EventModal;