import { BedDouble, Bath } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/motion/StaggerChildren";
import { formatBeds, groupRoomsByFloor } from "@/features/rooms/queries";
import type { Room } from "@/db/seed";

export function RoomGrid({ rooms }: { rooms: Room[] }) {
  if (rooms.length === 0) return null;
  const groups = groupRoomsByFloor(rooms);

  return (
    <section id="habitaciones" className="bg-sand/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <FadeIn>
          <p className="text-sm uppercase tracking-widest text-teal-deep mb-4">
            Dónde dormirás
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold text-ink tracking-tight">
            Habitaciones
          </h2>
        </FadeIn>

        <div className="mt-14 space-y-14">
          {groups.map((group) => (
            <div key={group.floor}>
              <p className="text-sm font-medium text-ink/60 uppercase tracking-wider mb-6">
                {group.floor}
              </p>
              <StaggerChildren className="grid gap-6 md:grid-cols-2">
                {group.rooms.map((room) => (
                  <StaggerItem
                    key={room.id}
                    className="rounded-2xl bg-bg border border-line/60 p-6 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-xl font-semibold text-ink">
                        {room.name}
                      </h3>
                      {room.hasBathroom && (
                        <span
                          className="inline-flex items-center gap-1 text-xs text-teal-deep bg-teal-soft px-2.5 py-1 rounded-full"
                          title="Baño en suite"
                        >
                          <Bath className="size-3.5" />
                          Baño
                        </span>
                      )}
                    </div>
                    <p className="inline-flex items-center gap-2 text-sm text-ink/70">
                      <BedDouble className="size-4 text-teal" />
                      {formatBeds(room.beds)}
                    </p>
                    {room.description && (
                      <p className="text-sm text-ink/60 leading-relaxed">
                        {room.description}
                      </p>
                    )}
                  </StaggerItem>
                ))}
              </StaggerChildren>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
