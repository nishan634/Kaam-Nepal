export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-low text-on-surface mt-space-xl">
      <div className="max-w-7xl mx-auto px-margin md:px-margin-md lg:px-margin-lg pt-space-xl pb-space-lg">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-gutter-lg pb-space-xl">
          <div className="col-span-2">
            <div className="flex items-center gap-space-sm mb-space-md">
              <span className="font-display text-headline-sm font-bold text-primary">
                KAAM <span className="text-secondary font-display text-title-md font-normal">नेपाल</span>
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md max-w-sm">
              Connecting Nepal's vibrant workforce with local enterprises and global remote
              opportunities — from skilled trade artisans to software engineers.
            </p>
            <div className="flex items-center gap-space-sm flex-wrap">
              <span className="inline-flex items-center gap-1 bg-surface-container-lowest px-2.5 py-1 rounded-full font-display text-label-sm text-on-surface-variant shadow-[0_1px_4px_rgba(15,41,66,0.05)]">
                <span className="material-symbols-outlined text-[16px] text-primary-container">verified_user</span>
                Verified Escrow
              </span>
              <span className="inline-flex items-center gap-1 bg-surface-container-lowest px-2.5 py-1 rounded-full font-display text-label-sm text-on-surface-variant shadow-[0_1px_4px_rgba(15,41,66,0.05)]">
                <span className="material-symbols-outlined text-[16px] text-primary-container">shield</span>
                Govt. Reg.
              </span>
            </div>
          </div>
          {[
            { title: 'Job Seekers', links: ['Browse All Jobs', 'AI CV Builder', 'Trade Certifications'] },
            { title: 'Employers', links: ['Post a Vacancy', 'Hiring Dashboard', 'Background Checks'] },
            { title: 'Freelance & Trades', links: ['Gig Marketplace', 'Daily Wages', 'Service Contracts'] },
            { title: 'Local Hubs', links: ['Kathmandu Karyalaya', 'Pokhara Helpdesk', 'Biratnagar Center'] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-label-lg text-primary uppercase tracking-wider mb-space-md">
                {col.title}
              </h4>
              <ul className="space-y-space-sm font-body-sm text-body-sm text-on-surface-variant">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="hover:text-on-surface transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md border-t border-outline-variant/40">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            © 2026 KAAM Nepal Platform Inc. (काम नेपाल प्रालि). Built for the hackathon.
          </p>
          <div className="flex items-center gap-space-md font-display text-label-sm text-on-surface-variant">
            <a href="#" className="hover:text-on-surface transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-on-surface transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
