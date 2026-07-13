import React from 'react';
import Calendar from '../events/Calendar';
import Card, { CardHeader } from '../common/Card';
import Avatar from '../common/Avatar';
import Button from '../common/Button';

const RightSidebar = () => {
  // Mock data for "Who to follow"
  const suggestions = [
    { name: 'Guild Council', role: 'Official', id: 1 },
    { name: 'Muni Debate Club', role: 'Social', id: 2 }
  ];

  return (
    <aside className="fixed right-0 top-20 bottom-0 w-80 p-8 hidden xl:block overflow-y-auto no-scrollbar">
      <div className="space-y-8">
        {/* 1. Calendar Widget */}
        <Calendar upcomingEvents={[
          { title: "Guild Elections", date: "2026-04-12", time: "08:00 AM" },
          { title: "Tech Symposium", date: "2026-04-15", time: "02:00 PM" }
        ]} />

        {/* 2. Suggested Circles */}
        <Card className="bg-white border-slate-100">
          <CardHeader title="Suggested" subtitle="Circles for you" />
          <div className="space-y-5">
            {suggestions.map(sug => (
              <div key={sug.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={sug.name} size="sm" />
                  <div>
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">{sug.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{sug.role}</p>
                  </div>
                </div>
                <Button variant="ghost" className="h-8 px-3 rounded-lg text-[10px]">
                  Join
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* 3. Footer Links */}
        <div className="px-4 flex flex-wrap gap-x-4 gap-y-2">
          {['About', 'Privacy', 'Help', 'Terms'].map(link => (
            <a key={link} href={`#${link}`} className="text-[10px] font-bold text-slate-300 hover:text-brand uppercase tracking-widest">
              {link}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;