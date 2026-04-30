import { 
  Landmark, 
  ShieldCheck, 
  BarChart3, 
  ArrowUpRight, 
  CheckCircle2, 
  ChevronRight, 
  Fingerprint, 
  Activity, 
  Gavel, 
  Users,
  FileText,
  Building,
  Target,
  Search,
  UserCheck,
  Bell,
  Vote
} from 'lucide-react';
import { motion } from 'motion/react';

export function GovernmentDashboard() {
  const services = [
    { 
      title: 'Services', 
      subtitle: 'MINISTRIES & AGENCIES',
      icon: Fingerprint, 
      desc: 'NIN Enrolment, Passport Application, CAC Registration and Public Service portals.',
      img: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800&fit=crop',
      color: 'from-blue-600/20',
      items: [
        { label: 'NIN Enrolment', icon: Fingerprint },
        { label: 'Passport Application', icon: FileText },
        { label: 'CAC Registration', icon: Building }
      ]
    },
    { 
      title: 'Accountability', 
      subtitle: 'BUDGETS & EXPENDITURE',
      icon: Activity, 
      desc: 'Budgets & Expenditure, Procurement & Contracts, Projects Tracker and FOI Tools.',
      img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&fit=crop',
      color: 'from-emerald-600/20',
      items: [
        { label: 'Procurement & Contracts', icon: Gavel },
        { label: 'Projects Tracker', icon: Target },
        { label: 'FOI Tools', icon: Search }
      ]
    },
    { 
      title: 'Citizen Guides', 
      subtitle: 'ELECTIONS HUB',
      icon: Landmark, 
      desc: '2027 Candidates, INEC Updates, Voter Registration and Civic awareness.',
      img: 'https://images.unsplash.com/photo-1540910419391-40cb67f80939?q=80&w=800&fit=crop',
      color: 'from-amber-600/20',
      items: [
        { label: '2027 Candidates', icon: UserCheck },
        { label: 'INEC Updates', icon: Bell },
        { label: 'Voter Registration', icon: Vote }
      ]
    },
  ];

  return (
    <section id="government-services" className="py-12 md:py-16 bg-nag-gray-bg w-full relative overflow-hidden min-h-[auto] md:min-h-[70vh] flex items-center">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-nag-green-primary/5 rounded-full blur-[150px] -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] translate-y-1/2"></div>
      
      <div className="container-nag px-6 md:px-12 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 md:gap-8 mb-8 md:mb-12">
          <div className="space-y-4 md:space-y-5">
             <motion.div 
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               className="flex items-center gap-3 md:gap-4"
             >
                <div className="w-10 h-[2px] bg-nag-green-primary"></div>
                <span className="text-nag-green-primary font-display font-black uppercase tracking-[0.4em] text-[8px] md:text-[10px]">
                  Civic Excellence & Accountability
                </span>
             </motion.div>
             <h2 className="text-4xl md:text-5xl font-display font-black text-nag-black leading-tight tracking-tight">
               Government <span className="text-nag-green-primary">Updates.</span>
             </h2>
          </div>
          
        </div>

        {/* Premium Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {services.map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -12 }}
              className="group relative h-[340px] md:h-[380px] rounded-[40px] overflow-hidden bg-white border border-nag-border hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] hover:border-nag-green-primary/30 transition-all duration-700 cursor-pointer"
            >
              {/* Background Image with Overlay */}
              <div className="absolute inset-0">
                <img 
                  src={s.img} 
                  alt={s.title} 
                  className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000 opacity-10 grayscale group-hover:grayscale-0 group-hover:opacity-20" 
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/80 to-white"></div>
                <div className={`absolute inset-0 bg-gradient-to-t ${s.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
              </div>

              {/* Card Content */}
              <div className="relative h-full px-6 py-8 flex flex-col justify-start z-20">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-nag-gray-bg border border-nag-border flex items-center justify-center text-nag-green-primary group-hover:bg-nag-green-primary group-hover:text-white group-hover:border-transparent transition-all duration-500 shadow-sm">
                    <s.icon size={22} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-nag-green-primary mb-1">
                      {s.subtitle}
                    </p>
                    <h4 className="text-2xl md:text-3xl font-black text-nag-black tracking-tighter uppercase leading-none">
                      {s.title}
                    </h4>
                  </div>
                </div>

                <div className="mt-8 space-y-6">
                  <ul className="space-y-2">
                    {s.items?.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-nag-gray-deep text-[13px] font-bold group-hover:text-nag-black transition-all transform group-hover:translate-x-2 duration-300">
                        <div className="w-7 h-7 rounded-lg bg-nag-gray-bg flex items-center justify-center text-nag-green-primary group-hover:bg-nag-green-primary group-hover:text-white transition-all shadow-sm">
                           <item.icon size={12} />
                        </div>
                        {item.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

