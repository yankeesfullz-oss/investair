import Image from "next/image";
import { boardMembers } from "@/lib/boardMembers";

export default function BoardOfDirectorsSection() {
  return (
    <section className="rounded-[2.5rem] border border-slate-100 bg-[linear-gradient(135deg,#fff7fb_0%,#ffffff_55%,#f8fafc_100%)] p-8 shadow-sm sm:p-10">
      <div className="max-w-3xl">
        <p className="inline-flex rounded-full border border-rose-100 bg-rose-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-rose-600">
          Board of Directors
        </p>
        <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Leadership experience spanning venture, real estate, and company building.
        </h2>
        <p className="mt-4 text-base leading-8 text-slate-600">
          This section highlights the current board roster and partner leadership references. Each headshot is a local placeholder graphic so you can replace the image files later without changing the component structure.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {boardMembers.map((member) => (
          <article
            key={member.name}
            className="rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]"
          >
            <div className="mx-auto max-w-[18rem]">
              <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-100 bg-slate-50 aspect-[3/4]">
                <Image
                  src={member.image}
                  alt={`${member.name} headshot placeholder`}
                  fill
                  className="object-cover object-top"
                />
              </div>
            </div>
            <div className="mt-5">
              <h3 className="text-xl font-semibold tracking-tight text-slate-950">{member.name}</h3>
              <p className="mt-2 text-sm font-medium text-slate-700">{member.title}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}