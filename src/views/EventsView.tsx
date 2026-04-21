import React, { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  CalendarPlus, 
  MapPin, 
  Plus 
} from "lucide-react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval,
  isToday
} from "date-fns";
import { Button, Card, Badge, cn } from "../components/UI";
import { UserProfile, AppEvent } from "../types";
import { 
  useEvents, 
  rsvpToEvent 
} from "../services/supabase";

export const EventsView = ({ user }: { user: UserProfile }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  useEvents(setEvents);

  const onDateClick = (day: Date) => {
    setSelectedDate(day);
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayEvents = (day: Date) => {
    return events.filter(e => isSameDay(new Date(e.date.seconds * 1000), day));
  };

  const activeDayEvents = getDayEvents(selectedDate);

  const toggleRSVP = async (eventId: string) => {
    await rsvpToEvent(eventId, user.uid);
  };

  const addToCalendar = (event: AppEvent) => {
    const startTime = new Date(event.date.seconds * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endTime = new Date(event.date.seconds * 1000 + 3600000).toISOString().replace(/-|:|\.\d\d\d/g, ""); // +1 hour
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location || "")}`;
    window.open(url, "_blank");
  };

  return (
    <div className="grid grid-cols-12 gap-8">
      {/* Calendar Grid */}
      <Card className="col-span-12 lg:col-span-7 bg-[#0B1F3B]/40 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-white">{format(currentMonth, "MMMM yyyy")}</h2>
            <div className="flex gap-1">
              <button 
                onClick={prevMonth}
                className="p-2 hover:bg-white/5 rounded-lg transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-white/40" />
              </button>
              <button 
                onClick={nextMonth}
                className="p-2 hover:bg-white/5 rounded-lg transition-all"
              >
                <ChevronRight className="w-5 h-5 text-white/40" />
              </button>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setCurrentMonth(new Date())}>Today</Button>
        </div>

        <div className="grid grid-cols-7 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="text-center text-[10px] uppercase font-black tracking-widest text-white/20 pb-4">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const dayEvents = getDayEvents(day);
            const isTodayDate = isToday(day);

            return (
              <button
                key={i}
                onClick={() => onDateClick(day)}
                className={cn(
                  "relative aspect-square p-2 border transition-all flex flex-col items-start gap-1 group",
                  !isCurrentMonth ? "bg-transparent border-transparent opacity-10" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]",
                  isSelected && "border-cyan-primary/50 bg-cyan-primary/5",
                  isTodayDate && !isSelected && "border-emerald-500/30"
                )}
              >
                <span className={cn(
                  "text-xs font-bold",
                  isSelected ? "text-cyan-primary" : "text-white/40",
                  isTodayDate && !isSelected && "text-emerald-500"
                )}>
                  {format(day, "d")}
                </span>
                
                <div className="flex flex-wrap gap-0.5 mt-auto">
                  {dayEvents.slice(0, 3).map((e, idx) => (
                    <div key={idx} className="w-1.5 h-1.5 rounded-full bg-cyan-primary shadow-[0_0_5px_rgba(6,182,212,0.5)]" />
                  ))}
                </div>

                {isTodayDate && (
                  <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Events List for Selected Day */}
      <div className="col-span-12 lg:col-span-5 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black uppercase tracking-tight text-white/60">
            Hub Events_ <span className="text-white/20 font-normal">/ {format(selectedDate, "dd MMM")}</span>
          </h3>
          {user.role === 'admin' && (
             <Button variant="cyan" size="sm" onClick={() => setIsEventModalOpen(true)}>
                <Plus className="w-3 h-3" /> New
             </Button>
          )}
        </div>

        <div className="space-y-4 h-[600px] overflow-y-auto pr-2 scrollbar-hide">
          {activeDayEvents.length === 0 ? (
            <div className="p-8 border border-white/5 rounded-2xl bg-white/[0.02] text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                <CalendarPlus className="w-6 h-6 text-white/20" />
              </div>
              <p className="text-xs text-white/40 italic">Nothing scheduled for this day.</p>
            </div>
          ) : (
            activeDayEvents.map(event => (
              <Card key={event.id} className="p-0 overflow-hidden group">
                <div className="h-32 relative">
                  <img src={event.image || "https://picsum.photos/seed/event/600/400"} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3B] to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <Badge variant="cyan">{format(new Date(event.date.seconds * 1000), "HH:mm")}</Badge>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <h4 className="font-bold text-lg mb-1">{event.title}</h4>
                    <p className="text-xs text-white/60 line-clamp-2">{event.description}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase font-black tracking-widest">
                      <MapPin className="w-3 h-3 text-cyan-primary" /> {event.location || "Online / TBD"}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex gap-2">
                    <Button 
                      variant={event.participants.includes(user.uid) ? "secondary" : "cyan"} 
                      size="sm" 
                      onClick={() => toggleRSVP(event.id)}
                      className="flex-1 text-[10px] uppercase font-black tracking-widest"
                    >
                      {event.participants.includes(user.uid) ? "Interested" : "RSVP Now"}
                    </Button>
                    <button 
                      onClick={() => addToCalendar(event)}
                      className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                    >
                      <CalendarPlus className="w-4 h-4 text-white/60" />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
