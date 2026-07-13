import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarPlus, faTimes, faLayerGroup, faEdit } from '@fortawesome/free-solid-svg-icons';

// Firebase Firestore
import { db } from '../firebase/index';
import { 
  collection, query, orderBy, onSnapshot, 
  addDoc, serverTimestamp, doc, updateDoc, deleteDoc, arrayUnion, arrayRemove 
} from 'firebase/firestore';

// Modular Components
import EventGrid from '../components/events/EventGrid';
import EventModal from '../components/events/EventModal';
import Calendar from '../components/events/Calendar';

// UI Components
import Button from '../components/common/Button';

// Hooks & Contexts
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useClubs } from '../context/ClubContext'; 

const Events = () => {
  const { profile, user } = useAuth();
  const { showToast } = useToast();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Upcoming');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const DEFAULT_EVENT_IMAGE = 'https://raw.githubusercontent.com/Kaayamosesawal/images/main/muni_1.png';

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '',
    category: 'Campus Event',
    image: DEFAULT_EVENT_IMAGE
  });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "events"), orderBy("date", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(eventList);
      setLoading(false);
      
      if (isModalOpen && selectedEvent) {
        const updated = eventList.find(e => e.id === selectedEvent.id);
        if (updated) setSelectedEvent(updated);
      }
    });
    return () => unsubscribe();
  }, [user, isModalOpen, selectedEvent]);

  // Handle Sharing Event to Newsfeed
  const handleShareEvent = async (shareData) => {
    if (!user || !profile) return showToast("Please login to share", "error");

    try {
      await addDoc(collection(db, 'posts'), {
        ...shareData,
        authorName: profile.displayName || "Muni Student",
        authorPhoto: profile.photoURL || "",
        authorId: user.uid,
        timestamp: new Date().toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        createdAt: serverTimestamp(),
        likes: 0,
        comments: 0,
        isVerified: profile.isVerified || false,
        isEventShare: true
      });

      showToast("Shared to your Circle newsfeed!", "success");
    } catch (error) {
      console.error("Error sharing event:", error);
      showToast("Failed to share event", "error");
    }
  };

  // Create & Update Events
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!user || !profile) return showToast("Unauthorized session context", "error");

    try {
      if (isEditing && newEvent.id) {
        const eventRef = doc(db, "events", newEvent.id);
        // Only write the fields this form actually edits — spreading the
        // whole state object risks overwriting attendees/attendeeCount/
        // organizerId with stale values carried over from when it loaded.
        const { title, description, location, date, time, category, image } = newEvent;
        await updateDoc(eventRef, {
          title, description, location, date, time, category, image,
          updatedAt: serverTimestamp()
        });
        showToast("Event updated successfully!", "success");
      } else {
        const eventData = {
          ...newEvent,
          organizer: profile.displayName || "Muni Organizer", 
          organizerId: user.uid,
          // Fallback passes explicitly checked user properties to satisfy strict rules criteria
          clubId: profile.clubId || "muni_general",
          attendees: [],
          attendeeCount: 0,
          createdAt: serverTimestamp(),
          isFeatured: false
        };

        const eventDoc = await addDoc(collection(db, "events"), eventData);

        // Notify app members
        await addDoc(collection(db, "notifications"), {
          title: "New Event Alert",
          message: `${newEvent.title} has been scheduled.`,
          type: "event",
          eventId: eventDoc.id,
          recipientId: "all_members",
          createdAt: serverTimestamp(),
          read: false
        });

        showToast("Event launched!", "success");
      }

      setShowCreateModal(false);
      setIsEditing(false);
      setNewEvent({ title: '', description: '', location: '', date: '', time: '', category: 'Campus Event', image: DEFAULT_EVENT_IMAGE });
    } catch (err) {
      console.error("Firestore Write Blocked:", err);
      showToast("Permission denied or missing form values", "error");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await deleteDoc(doc(db, "events", eventId));
      showToast("Event removed", "success");
      setIsModalOpen(false);
    } catch (err) {
      showToast("Failed to delete", "error");
    }
  };

  const handleEditClick = (event) => {
    setNewEvent(event); 
    setIsEditing(true);
    setShowCreateModal(true);
    setIsModalOpen(false);
  };

  const handleRSVP = async (eventId) => {
    if (!user) return showToast("Please login", "error");
    const eventRef = doc(db, "events", eventId);
    const event = events.find(e => e.id === eventId);
    const isAttending = event?.attendees?.includes(user.uid);
    try {
      await updateDoc(eventRef, {
        attendees: isAttending ? arrayRemove(user.uid) : arrayUnion(user.uid),
        attendeeCount: isAttending ? (event.attendeeCount - 1) : (event.attendeeCount + 1)
      });
      showToast(isAttending ? "RSVP Removed" : "See you there!", "success");
    } catch (err) {
      showToast("RSVP Error", "error");
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const filteredEvents = events.filter(e => 
    activeTab === 'Upcoming' ? true : e.attendees?.includes(user?.uid)
  );

  // RECTIFICATION: Account for 'System Admin' and explicit naming checks
  const canCreate = ['Admin', 'System Admin', 'Club Leader', 'Staff'].includes(profile?.role);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-syne font-black text-slate-900 dark:text-white uppercase tracking-tighter">
            Campus Circle
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-dm max-w-md text-sm md:text-base">
            The hub for all activities and summits at Muni University.
          </p>
        </div>
        {canCreate && (
          <Button 
            onClick={() => { setIsEditing(false); setShowCreateModal(true); }} 
            className="bg-brand text-white rounded-[1.5rem] px-8 py-4 shadow-xl font-syne font-black uppercase tracking-widest text-[10px]"
          >
            <FontAwesomeIcon icon={faCalendarPlus} className="mr-3" /> Schedule Event
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        <div className="xl:col-span-3 space-y-8">
          <div className="flex gap-8 border-b border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
            {['Upcoming', 'My Schedule'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`pb-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-brand' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand rounded-t-full" />}
              </button>
            ))}
          </div>
          
          {loading ? (
            <div className="py-20 text-center animate-pulse text-slate-400 font-syne uppercase tracking-widest text-xs">
              Fetching...
            </div>
          ) : (
            <EventGrid events={filteredEvents} onEventClick={handleEventClick} />
          )}
        </div>

        <div className="hidden xl:block">
          <div className="sticky top-24">
            <Calendar upcomingEvents={events.slice(0, 4)} onEventClick={handleEventClick} />
          </div>
        </div>
      </div>

      <EventModal 
        event={selectedEvent} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRSVP={handleRSVP} 
        onShare={handleShareEvent}
        userId={user?.uid}
        onEdit={handleEditClick}
        onDelete={handleDeleteEvent}
      />

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => { setShowCreateModal(false); setIsEditing(false); }} className="absolute top-6 right-6 text-slate-300 hover:text-brand transition-colors">
              <FontAwesomeIcon icon={faTimes} size="xl" />
            </button>
            
            <header className="mb-8 text-center">
              <div className="w-14 h-14 bg-brand/10 text-brand rounded-2xl flex items-center justify-center text-xl mx-auto mb-4">
                <FontAwesomeIcon icon={isEditing ? faEdit : faLayerGroup} />
              </div>
              <h2 className="text-2xl md:text-3xl font-syne font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {isEditing ? 'Modify Event' : 'Post an Event'}
              </h2>
            </header>

            <form onSubmit={handleSaveEvent} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Event Name</label>
                <input required className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold dark:text-white focus:ring-2 focus:ring-brand/20 transition-all" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Brief Description</label>
                <textarea 
                  required 
                  rows="3"
                  placeholder="Tell students what this event is about..."
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-medium dark:text-white focus:ring-2 focus:ring-brand/20 transition-all resize-none" 
                  value={newEvent.description} 
                  onChange={e => setNewEvent({...newEvent, description: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Date</label>
                <input type="date" required className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold dark:text-white focus:ring-2 focus:ring-brand/20 transition-all" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Time</label>
                <input type="time" required className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold dark:text-white focus:ring-2 focus:ring-brand/20 transition-all" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Location</label>
                <input required className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold dark:text-white focus:ring-2 focus:ring-brand/20 transition-all" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} />
              </div>

              <Button type="submit" className="md:col-span-2 py-5 rounded-3xl bg-brand text-white font-syne font-black uppercase tracking-widest shadow-xl mt-4 hover:brightness-110 active:scale-[0.98]">
                {isEditing ? 'Save Changes' : 'Launch to Calendar'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;