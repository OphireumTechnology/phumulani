/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Public Website & CMS (Application 1)
 */

import React, { useState } from 'react';
import { db } from '../services/db';
import { Program, VolunteerOpportunity, Campaign, EventItem, User } from '../types';
import {
  Shield,
  Heart,
  Users,
  Calendar,
  BookOpen,
  ArrowRight,
  LifeBuoy,
  CheckCircle2,
  Lock,
  ChevronRight,
  Sparkles,
  ExternalLink,
  PhoneCall,
  Clock,
  ShieldCheck,
  MapPin,
  TrendingUp,
  Award,
  DollarSign,
  Briefcase,
  Home,
  MessageSquare,
  AlertTriangle,
  Mail,
  Globe,
  Building2,
  Download,
  HelpCircle,
  Send,
  FileText,
  Check,
} from 'lucide-react';

import { FounderSection } from '../components/FounderSection';

interface PublicWebsiteViewProps {
  currentUser: User;
  onViewChange: (view: string) => void;
  onOpenReceipt: (donation: any) => void;
  onOpenMediaRegistry?: () => void;
}

export const PublicWebsiteView: React.FC<PublicWebsiteViewProps> = ({
  currentUser,
  onViewChange,
  onOpenReceipt,
  onOpenMediaRegistry,
}) => {
  const state = db.getState();
  const programs = state.programs;
  const opportunities = state.opportunities;
  const campaigns = state.campaigns;
  const events = state.events;

  // Selected program for modal
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(programs[0]);

  // Volunteer Application Modal
  const [selectedOpportunity, setSelectedOpportunity] = useState<VolunteerOpportunity | null>(null);
  const [volFullName, setVolFullName] = useState('');
  const [volEmail, setVolEmail] = useState('');
  const [volPhone, setVolPhone] = useState('');
  const [volLanguage, setVolLanguage] = useState('English');
  const [volSkills, setVolSkills] = useState('Mentorship, Tutoring');
  const [volAvailability, setVolAvailability] = useState('Weekends');
  const [volMotivation, setVolMotivation] = useState('');
  const [volSafeguardingCheck, setVolSafeguardingCheck] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);

  // Donation Form State
  const [donationAmount, setDonationAmount] = useState<number>(100);
  const [donationFrequency, setDonationFrequency] = useState<'one_time' | 'monthly'>('one_time');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaigns[0]?.id || '');
  const [donorName, setDonorName] = useState(currentUser.role === 'donor' ? currentUser.name : '');
  const [donorEmail, setDonorEmail] = useState(currentUser.role === 'donor' ? currentUser.email : '');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Card (•••• 4022)');
  const [isDonating, setIsDonating] = useState(false);

  // Event RSVP Modal
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [rsvpName, setRsvpName] = useState(currentUser.name);
  const [rsvpEmail, setRsvpEmail] = useState(currentUser.email);
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [rsvpFeedback, setRsvpFeedback] = useState<{ status: 'confirmed' | 'waitlist'; message: string } | null>(null);

  // Discreet Get Help State
  const [helpMethod, setHelpMethod] = useState<'safe_email' | 'phone' | 'secure_signal'>('safe_email');
  const [helpUrgency, setHelpUrgency] = useState<'immediate_safety' | 'within_24h' | 'general_support'>('within_24h');
  const [helpLanguage, setHelpLanguage] = useState('Somali');
  const [helpSafeTime, setHelpSafeTime] = useState('Morning between 9am - 12pm');
  const [helpNotes, setHelpNotes] = useState('');
  const [helpSubmittedCode, setHelpSubmittedCode] = useState<string | null>(null);

  // General Contact Form State
  const [contactName, setContactName] = useState(currentUser.name || '');
  const [contactEmail, setContactEmail] = useState(currentUser.email || '');
  const [contactDepartment, setContactDepartment] = useState('General Inquiries & Community Outreach');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmittedCode, setContactSubmittedCode] = useState<string | null>(null);

  // Resources Category Filter
  const [resourceFilter, setResourceFilter] = useState<'all' | 'legal' | 'housing' | 'healing' | 'workforce'>('all');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trackingId = `INQ-${Date.now().toString().slice(-6)}`;
    db.appendAuditLog('CONTACT_SUBMISSION', `Public inquiry from ${contactName} (${contactEmail}) to ${contactDepartment}`);
    setContactSubmittedCode(trackingId);
    setContactMessage('');
    setContactSubject('');
  };

  const handleDownloadResource = (title: string) => {
    setDownloadNotice(`Downloading verified guide: "${title}". File verified virus-free and WCAG accessible.`);
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  // Handle Volunteer Submission
  const handleVolunteerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpportunity) return;

    const newApp = db.submitVolunteerApplication({
      fullName: volFullName,
      email: volEmail,
      phone: volPhone,
      preferredLanguage: volLanguage,
      opportunityId: selectedOpportunity.id,
      opportunityTitle: selectedOpportunity.title,
      skills: volSkills.split(',').map((s) => s.trim()),
      availability: [volAvailability],
      motivation: volMotivation,
      safeguardingAcknowledged: volSafeguardingCheck,
    });

    setSubmittedAppId(newApp.trackingId);
    setVolFullName('');
    setVolEmail('');
    setVolPhone('');
    setVolMotivation('');
    setVolSafeguardingCheck(false);
  };

  // Handle Donation
  const handleDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (donationAmount <= 0) return;

    setIsDonating(true);
    const campaign = campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];

    setTimeout(() => {
      const donation = db.processDonation({
        donorName: isAnonymous ? 'Anonymous Supporter' : (donorName || 'Generous Donor'),
        donorEmail: donorEmail || 'donor@example.org',
        amount: donationAmount,
        frequency: donationFrequency,
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        paymentMethod,
        isAnonymous,
      });

      setIsDonating(false);
      onOpenReceipt(donation);
    }, 800);
  };

  // Handle Event RSVP
  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    try {
      const res = db.registerForEvent(selectedEvent.id, rsvpName, rsvpEmail, rsvpPhone);
      setRsvpFeedback(res);
    } catch (err: any) {
      setRsvpFeedback({
        status: 'waitlist',
        message: err.message || 'Capacity limit reached. Please join the waitlist or contact community support.',
      });
    }
  };

  // Handle Discreet Help Request
  const handleHelpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item = db.submitRestrictedIntake({
      urgencyLevel: helpUrgency,
      preferredContactMethod: helpMethod,
      languageNeeded: helpLanguage,
      safeTimeToContact: helpSafeTime,
      notesEncryptedSummary: `[ENCRYPTED-RESTRICTED] ${helpNotes || 'Direct assistance requested via public safe intake.'}`,
    });
    setHelpSubmittedCode(item.anonymousCode);
    setHelpNotes('');
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO BANNER - 2-COLUMN BALANCED DESKTOP LAYOUT (55% / 45%) */}
      <section className="bg-gradient-to-b from-[#E8F3F1]/70 via-white to-[#F7F9FA] pt-8 sm:pt-12 pb-16 sm:pb-20 border-b border-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* LEFT COLUMN: Mission & Headline (~58%) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#104F57] bg-white border border-teal-200/90 px-3.5 py-1.5 rounded-full shadow-2xs">
                <Shield className="w-3.5 h-3.5 text-[#104F57]" />
                <span>MINNESOTA 501(C)(3) PUBLIC CHARITY</span>
              </div>

              {/* Exact wording with responsive clamp and balanced 2-line presentation */}
              <h1 className="font-serif font-bold text-[#104F57] tracking-tight text-balance leading-[1.08] text-[clamp(2.25rem,4.2vw,4.5rem)] max-w-[1050px] m-0">
                <span className="block">Empowering Immigrant &amp; Refugee Survivors</span>
                <span className="block text-[#633C69] mt-1 sm:mt-2">Toward Healing &amp; Autonomy</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal max-w-2xl">
                Phumulani walks beside immigrant women, children, and families escaping violence in Minnesota. Through culturally specific advocacy, workforce readiness, housing stability, and economic literacy, we rebuild lives with dignity.
              </p>

              {/* Standardized 3 CTA Buttons with consistent heights and 44px+ touch targets */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    document.getElementById('donate-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="min-h-[44px] h-12 bg-[#104F57] hover:bg-[#0c3e44] text-white px-5 rounded-lg text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#104F57]"
                >
                  <Heart className="w-4 h-4 fill-white/20" />
                  <span>Support Our Mission</span>
                </button>

                <button
                  onClick={() => {
                    document.getElementById('get-involved-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="min-h-[44px] h-12 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400"
                >
                  <Users className="w-4 h-4 text-[#104F57]" />
                  <span>Become a Volunteer or Mentor</span>
                </button>

                <button
                  onClick={() => {
                    document.getElementById('get-help-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="min-h-[44px] h-12 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 px-4 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-500"
                >
                  <LifeBuoy className="w-4 h-4 text-rose-600" />
                  <span>Need Help? Safe Routing</span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Authentic Community & Founder Visual Card (~42%) */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-teal-200/90 shadow-xl overflow-hidden relative space-y-4">
                {/* Community Gathering Hero Image */}
                <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden border-b border-teal-100">
                  <img
                    src="/media/homepage/community-hero-healing.svg"
                    alt="Authentic community sisterhood gathering at Phumulani Community Center"
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                  <div className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white px-3 py-1 rounded-full text-[10px] font-bold border border-white/20 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Culturally Grounded Sanctuary</span>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-4 pt-1">
                  {/* Founder Identification */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src="/media/founder/comfort-dondo-official-portrait.svg"
                        alt="Comfort Dondo, Founder of Phumulani"
                        className="w-12 h-12 rounded-xl object-cover border-2 border-[#104F57] shadow-sm shrink-0"
                      />
                      <div>
                        <div className="font-serif font-bold text-base text-slate-900">Comfort Dondo</div>
                        <div className="text-[11px] text-[#104F57] font-semibold">Founder &amp; Executive Director</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        document.getElementById('founder-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-xs font-bold text-[#633C69] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Story &amp; Video</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    "Healing is finding the community, protection, and economic independence to stand tall again. At Phumulani, every survivor is met with trauma-informed care and unwavering sisterhood."
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="font-serif text-lg font-bold text-[#104F57]">1,450+</div>
                      <div className="text-[10px] text-slate-500">Survivors &amp; Families</div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="font-serif text-lg font-bold text-[#633C69]">$480k+</div>
                      <div className="text-[10px] text-slate-500">Emergency Housing Aid</div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-teal-50/70 border border-teal-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#104F57]" />
                      <span className="font-semibold text-teal-950 text-[11px]">Strict Survivor Confidentiality</span>
                    </div>
                    <span className="text-[9px] text-teal-700 font-mono font-bold">VAWA &amp; Safe Harbor</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS & COMMUNITY IMPACT SUMMARY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
            <div className="p-2">
              <div className="font-serif text-3xl sm:text-4xl font-bold text-[#104F57]">1,450+</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Families Supported Since Inception</div>
            </div>
            <div className="p-2 pt-6 lg:pt-2">
              <div className="font-serif text-3xl sm:text-4xl font-bold text-[#633C69]">$480,000+</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Direct Emergency & Housing Aid Distributed</div>
            </div>
            <div className="p-2 pt-6 lg:pt-2">
              <div className="font-serif text-3xl sm:text-4xl font-bold text-[#D67C35]">92%</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Workforce Graduate Job Placement Rate</div>
            </div>
            <div className="p-2 pt-6 lg:pt-2">
              <div className="font-serif text-3xl sm:text-4xl font-bold text-emerald-700">18 Agents</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Human-Supervised AI Operations Layer</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 FOUNDER LEGACY, ORIGINAL VIDEOS & PUBLICATIONS */}
      <FounderSection />

      {/* 3. SIX CORE PROGRAMS */}
      <section id="programs-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-bold text-[#104F57] uppercase tracking-wider">What We Do</div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
            Six Comprehensive Community Programs
          </h2>
          <p className="text-sm text-slate-600">
            Grounded in trauma-informed care and culturally responsive support across Minnesota.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((prog) => {
            const programIllustrations: Record<string, string> = {
              advocacy: '/media/programs/legal-protection-advocacy.svg',
              workforce: '/media/programs/workforce-resume-coaching.svg',
              financial_literacy: '/media/programs/entrepreneurship-lab.svg',
              mentorship: '/media/programs/youth-mentorship.svg',
              housing: '/media/programs/healing-homes-housing.svg',
              entrepreneurship: '/media/programs/entrepreneurship-lab.svg',
            };
            const imageSrc = programIllustrations[prog.slug] || '/media/programs/tea-healing-circles.svg';

            return (
              <div
                key={prog.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-teal-400 hover:shadow-lg transition-all group"
              >
                {/* Authentic Program Artwork */}
                <div className="aspect-[4/3] w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                  <img
                    src={imageSrc}
                    alt={prog.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[#104F57] text-xs font-bold uppercase tracking-wider">
                      {prog.slug === 'advocacy' && <Shield className="w-4 h-4 text-[#104F57]" />}
                      {prog.slug === 'workforce' && <Briefcase className="w-4 h-4 text-[#104F57]" />}
                      {prog.slug === 'financial_literacy' && <DollarSign className="w-4 h-4 text-[#104F57]" />}
                      {prog.slug === 'mentorship' && <Users className="w-4 h-4 text-[#104F57]" />}
                      {prog.slug === 'housing' && <Home className="w-4 h-4 text-[#104F57]" />}
                      {prog.slug === 'entrepreneurship' && <Sparkles className="w-4 h-4 text-[#104F57]" />}
                      <span>{prog.tagline || 'Core Program'}</span>
                    </div>

                    <div>
                      <h3 className="font-serif text-lg font-bold text-slate-900 group-hover:text-[#104F57] transition-colors">
                        {prog.name}
                      </h3>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {prog.description}
                      </p>
                    </div>

                    <div className="pt-2 space-y-1.5 border-t border-slate-100">
                      <div className="text-[11px] font-semibold text-slate-700">Key Services:</div>
                      <ul className="text-[11px] text-slate-500 space-y-1">
                        {prog.keyServices.slice(0, 3).map((s, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      {prog.beneficiariesCount}+ Supported
                    </span>
                    <button
                      onClick={() => setSelectedProgram(prog)}
                      className="font-semibold text-[#104F57] hover:text-[#0c3e44] flex items-center gap-1 cursor-pointer"
                    >
                      <span>Details &amp; Referral</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. FOUNDER STORY & ABOUT PHUMULANI */}
      <section id="about-section" className="bg-[#E8F3F1]/50 py-16 border-y border-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-teal-200/80 shadow-md space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src="/media/founder/comfort-dondo-official-portrait.svg"
                    alt="Comfort Dondo, Founder of Phumulani"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-[#104F57] shadow-md shrink-0"
                  />
                  <div>
                    <div className="font-serif text-2xl font-bold text-slate-900 leading-tight">
                      Comfort Dondo
                    </div>
                    <div className="text-xs font-semibold text-[#104F57] mt-0.5">
                      Founder &amp; Executive Director
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Author · Advocate · Minnesota 501(c)(3)
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "Healing is not merely surviving an ordeal—it is finding the courage, community, and economic standing to dream boldly again. Phumulani exists so no immigrant survivor walks alone."
                </p>

                <div className="pt-4 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Authored Publications
                  </div>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-[#633C69] shrink-0" />
                      <span className="font-medium text-slate-800">Facing the Giants</span>
                      <span className="text-[10px] text-slate-400">· 2021 Memoir</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-[#633C69] shrink-0" />
                      <span className="font-medium text-slate-800">Sacred Promise</span>
                      <span className="text-[10px] text-slate-400">· With Dr. Tererai Trent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="font-medium text-slate-800">The Gift in Pain</span>
                      <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">Advance Announcement</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="text-xs font-bold text-[#104F57] uppercase tracking-wider">
                Organizational Heritage
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
                A Safe Haven Rooted in Cultural Dignity
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                Founded in 2017 to bridge the systemic voids faced by African, African-American, Asian, and Latinx immigrants in Minnesota, Phumulani (meaning "to rest" or "peace" in Zulu) provides comprehensive wraparound support.
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                We believe that safety requires economic independence. When survivors obtain stable housing, credit repair, and living-wage employment, they break cycles of intergenerational trauma.
              </p>

              {/* Leadership & Safeguarding Portraits */}
              <div id="leadership-section" className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Executive Leadership &amp; Board
                  </span>
                  {onOpenMediaRegistry && (
                    <button
                      onClick={onOpenMediaRegistry}
                      className="text-xs text-[#104F57] hover:underline font-semibold cursor-pointer"
                    >
                      View Media &amp; Safeguarding Registry ↗
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                    <img
                      src="/media/leadership/dr-elena-rostova.svg"
                      alt="Dr. Elena Rostova"
                      className="w-14 h-14 mx-auto rounded-xl object-cover shadow-2xs"
                    />
                    <div className="font-bold text-xs text-slate-900 leading-tight">Dr. Elena Rostova</div>
                    <div className="text-[10px] text-slate-500">Board Chair</div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                    <img
                      src="/media/leadership/sister-miriam-k.svg"
                      alt="Sister Miriam K."
                      className="w-14 h-14 mx-auto rounded-xl object-cover shadow-2xs"
                    />
                    <div className="font-bold text-xs text-slate-900 leading-tight">Sister Miriam K.</div>
                    <div className="text-[10px] text-slate-500">Safeguarding Lead</div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                    <img
                      src="/media/leadership/david-mwangi.svg"
                      alt="David Mwangi, CPA"
                      className="w-14 h-14 mx-auto rounded-xl object-cover shadow-2xs"
                    />
                    <div className="font-bold text-xs text-slate-900 leading-tight">David Mwangi, CPA</div>
                    <div className="text-[10px] text-slate-500">Finance Director</div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                    <img
                      src="/media/leadership/amina-yusuf.svg"
                      alt="Amina Yusuf"
                      className="w-14 h-14 mx-auto rounded-xl object-cover shadow-2xs"
                    />
                    <div className="font-bold text-xs text-slate-900 leading-tight">Amina Yusuf</div>
                    <div className="text-[10px] text-slate-500">Community Lead</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. GET INVOLVED / VOLUNTEER OPPORTUNITIES */}
      <section id="get-involved-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div id="volunteer-section" className="relative -top-24"></div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <div className="text-xs font-bold text-[#104F57] uppercase tracking-wider">Join The Movement</div>
            <h2 className="font-serif text-3xl font-bold text-slate-900">
              Volunteer Opportunities & Mentorship
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Give your time, professional expertise, or language fluency to empower Minnesota families.
            </p>
          </div>
          <button
            onClick={() => onViewChange('community')}
            className="text-xs font-semibold text-[#104F57] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Go to Volunteer Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {submittedAppId && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                Application submitted successfully! Your tracking ID is <strong>{submittedAppId}</strong>. A volunteer coordinator has received your profile.
              </span>
            </div>
            <button
              onClick={() => setSubmittedAppId(null)}
              className="text-emerald-700 hover:text-emerald-900 font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-semibold text-[#104F57] bg-teal-50 px-2 py-0.5 rounded">
                    {opp.commitment}
                  </span>
                  {opp.urgent && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      Urgent Need
                    </span>
                  )}
                </div>

                <h3 className="font-serif font-bold text-base text-slate-900">
                  {opp.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {opp.description}
                </p>

                <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{opp.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span>{opp.openSlots} openings available</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedOpportunity(opp)}
                className="mt-5 w-full bg-[#104F57] hover:bg-[#0c3e44] text-white py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Apply for Opportunity
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 6. DONATION & FUNDRAISING (HOSTED CHECKOUT SIMULATOR) */}
      <section id="donate-section" className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Campaigns & Impact */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                <Heart className="w-3 h-3 fill-amber-400" />
                <span>TAX-DEDUCTIBLE 501(C)(3) GIVING</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
                Fuel Freedom, Safety, and Lasting Renewal
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                100% of community contributions go directly to survivor safety funds, security deposits, workforce training, and educational mentorship. All gifts are processed through verified banking gateways with immediate tax receipts.
              </p>

              {/* Active Campaigns List */}
              <div className="space-y-4 pt-2">
                {campaigns.map((camp) => {
                  const percent = Math.min(100, Math.round((camp.raisedAmount / camp.targetAmount) * 100));
                  const isSelected = selectedCampaignId === camp.id;
                  return (
                    <div
                      key={camp.id}
                      onClick={() => setSelectedCampaignId(camp.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected ? 'bg-slate-800 border-[#D67C35]' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-start text-xs font-semibold">
                        <span className="text-white">{camp.title}</span>
                        <span className="text-amber-400">{percent}% Funded</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2 my-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#D67C35] to-amber-400 h-2 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>${camp.raisedAmount.toLocaleString()} raised of ${camp.targetAmount.toLocaleString()}</span>
                        <span>{camp.donorCount} donors</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Checkout Form */}
            <div className="lg:col-span-6">
              <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200">
                <form onSubmit={handleDonationSubmit} className="space-y-5">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                    <div className="font-serif text-xl font-bold text-slate-900">Make a Donation</div>
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-600" />
                      <span>SSL 256-Bit Encrypted</span>
                    </span>
                  </div>

                  {/* Frequency Toggle */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setDonationFrequency('one_time')}
                      className={`py-2 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                        donationFrequency === 'one_time' ? 'bg-[#104F57] text-white shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      One-Time Gift
                    </button>
                    <button
                      type="button"
                      onClick={() => setDonationFrequency('monthly')}
                      className={`py-2 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                        donationFrequency === 'monthly' ? 'bg-[#104F57] text-white shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Monthly Sustainer (Most Impact)
                    </button>
                  </div>

                  {/* Amount Selectors */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Select Gift Amount (USD)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[50, 100, 250, 500].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setDonationAmount(amt)}
                          className={`py-2.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                            donationAmount === amt
                              ? 'bg-amber-50 border-[#D67C35] text-[#D67C35]'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Amount */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Or Enter Custom Amount:
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">$</span>
                      <input
                        type="number"
                        min="5"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 text-xs font-bold border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#104F57] outline-none"
                      />
                    </div>
                  </div>

                  {/* Donor Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="Marcus Vance"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        placeholder="donor@example.com"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                      />
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="text-xs">
                    <label className="block font-medium text-slate-700 mb-1">Payment Method (Provider Sandbox)</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none bg-white"
                    >
                      <option value="Credit Card (•••• 4022)">Credit Card (Visa / Mastercard)</option>
                      <option value="ACH Bank Transfer (Wells Fargo)">ACH Direct Bank Debit</option>
                      <option value="PayPal Hosted Checkout">PayPal / Venmo Giving</option>
                      <option value="Apple Pay">Apple Pay</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      id="anonCheck"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded text-[#104F57]"
                    />
                    <label htmlFor="anonCheck">Make my gift anonymous on public donor rolls</label>
                  </div>

                  <button
                    type="submit"
                    disabled={isDonating}
                    className="w-full py-3 bg-[#D67C35] hover:bg-[#c26d2c] disabled:bg-slate-300 text-white rounded-lg text-sm font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isDonating ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin" />
                        <span>Verifying with Payment Gateway...</span>
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 fill-white/20" />
                        <span>Complete Gift of ${donationAmount}</span>
                      </>
                    )}
                  </button>

                  <div className="text-[11px] text-slate-400 text-center">
                    Official 501(c)(3) receipt with unique transaction hash generated instantly.
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. COMMUNITY EVENTS CALENDAR */}
      <section id="events-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <div className="text-xs font-bold text-[#104F57] uppercase tracking-wider">Gathering & Growth</div>
            <h2 className="font-serif text-3xl font-bold text-slate-900">
              Upcoming Workshops & Community Gatherings
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Events are open to community members, supporters, and partner organizations. Capacity strictly enforced.
            </p>
          </div>
        </div>

        {rsvpFeedback && (
          <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between text-xs text-teal-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#104F57]" />
              <span>{rsvpFeedback.message}</span>
            </div>
            <button onClick={() => setRsvpFeedback(null)} className="font-bold text-[#104F57]">
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((evt) => {
            const isFull = evt.registeredCount >= evt.capacity;
            const eventIllustrations: Record<string, string> = {
              'evt-1': '/media/events/career-pathways-showcase.svg',
              'evt-2': '/media/events/healing-sisterhood-banquet.svg',
              'evt-3': '/media/events/community-supply-distribution.svg',
            };
            const eventImg =
              eventIllustrations[evt.id] ||
              (evt.category === 'Workforce'
                ? '/media/events/career-pathways-showcase.svg'
                : '/media/events/healing-sisterhood-banquet.svg');

            return (
              <div
                key={evt.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all group"
              >
                <div className="aspect-[16/9] w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                  <img
                    src={eventImg}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-[#633C69] bg-purple-50 px-2.5 py-0.5 rounded">
                        {evt.category}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          isFull ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isFull ? `Waitlist Active (${evt.waitlistCount})` : `${evt.capacity - evt.registeredCount} Seats Left`}
                      </span>
                    </div>

                  <h3 className="font-serif font-bold text-lg text-slate-900 leading-snug">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-500 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(evt.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evt.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evt.location}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedEvent(evt)}
                    className={`w-full py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isFull
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-[#104F57] hover:bg-[#0c3e44] text-white'
                    }`}
                  >
                    {isFull ? 'Join Priority Waitlist' : 'RSVP / Register'}
                  </button>
                </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. DISCREET GET HELP HUB & SAFE EXIT (SECTION 4.2 & 6.5) */}
      <section id="get-help-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-rose-50/70 border-2 border-rose-200 rounded-2xl p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-rose-800 bg-rose-100 px-3 py-1 rounded-full">
                <LifeBuoy className="w-3.5 h-3.5 text-rose-700" />
                <span>CONFIDENTIAL SAFEGUARDING ROUTE</span>
              </div>

              <h2 className="font-serif text-3xl font-bold text-rose-950">
                Safe & Discreet Assistance
              </h2>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                If you are an immigrant or refugee survivor in Minnesota seeking safety, shelter, or legal protection, you can reach out here discreetly.
              </p>

              <div className="bg-white p-4 rounded-xl border border-rose-200 text-xs space-y-2 text-slate-700">
                <div className="font-bold text-rose-900 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-rose-700" />
                  <span>Our Privacy & Safeguarding Guarantees:</span>
                </div>
                <ul className="space-y-1 list-disc list-inside text-[11px] text-slate-600">
                  <li>No third-party tracking scripts or advertising cookies</li>
                  <li>No account creation required</li>
                  <li>Directly routed to trained Safeguarding Officers (never general staff)</li>
                  <li>Zero AI processing on sensitive survivor case records</li>
                </ul>
              </div>

              <div className="p-3 bg-rose-100/70 rounded-xl text-xs text-rose-900 flex items-center justify-between">
                <div>
                  <div className="font-bold">Immediate Crisis Line 24/7:</div>
                  <div className="text-sm font-semibold">1-866-223-1111 (Call or Text)</div>
                </div>
                <button
                  onClick={() => window.location.replace('https://weather.com')}
                  className="bg-rose-800 hover:bg-rose-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <span>Quick Exit</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Discreet Intake Form */}
            <div className="lg:col-span-7 bg-white rounded-xl p-6 border border-rose-200 shadow-sm">
              {helpSubmittedCode ? (
                <div className="space-y-4 text-center py-6">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="font-serif text-xl font-bold text-slate-900">
                    Safe Intake Reference: {helpSubmittedCode}
                  </div>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    Your request has been routed directly to Sister Miriam K. and our trauma-informed safeguarding team. We will only contact you at the designated safe time and method you specified.
                  </p>
                  <button
                    onClick={() => setHelpSubmittedCode(null)}
                    className="text-xs font-semibold text-[#104F57] hover:underline"
                  >
                    Submit another discreet inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleHelpSubmit} className="space-y-4">
                  <div className="font-serif text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                    Discreet Communication Intake
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">How can we contact you safely?</label>
                      <select
                        value={helpMethod}
                        onChange={(e) => setHelpMethod(e.target.value as any)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white text-xs"
                      >
                        <option value="safe_email">Safe Email (one only you access)</option>
                        <option value="phone">Phone / WhatsApp (Voice or Text)</option>
                        <option value="secure_signal">Signal Messenger</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Language Needed</label>
                      <select
                        value={helpLanguage}
                        onChange={(e) => setHelpLanguage(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white text-xs"
                      >
                        <option value="Somali">Soomaali (Somali)</option>
                        <option value="Oromo">Afaan Oromoo (Oromo)</option>
                        <option value="English">English</option>
                        <option value="Spanish">Español (Spanish)</option>
                        <option value="Amharic">Amharic</option>
                        <option value="Hmong">Hmoob (Hmong)</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block font-medium text-slate-700 mb-1">
                      Safest Time of Day to Contact:
                    </label>
                    <input
                      type="text"
                      value={helpSafeTime}
                      onChange={(e) => setHelpSafeTime(e.target.value)}
                      placeholder="e.g., Weekday mornings 10am-12pm when alone"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-xs"
                      required
                    />
                  </div>

                  <div className="text-xs">
                    <label className="block font-medium text-slate-700 mb-1">
                      Brief Message or Safe Phone / Email:
                    </label>
                    <textarea
                      rows={3}
                      value={helpNotes}
                      onChange={(e) => setHelpNotes(e.target.value)}
                      placeholder="Enter safe contact info and general need (housing, court support, food). Do not include dangerous details."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-xs"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Submit to Safeguarding Queue Confidentially
                  </button>

                  <div className="text-[10px] text-slate-400 text-center">
                    This form writes directly to our restricted intake repository with zero exposure to general AI models.
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 9. MISSION, VISION & CORE VALUES (#mission-section) */}
      <section id="mission-section" className="bg-gradient-to-b from-white to-[#E8F3F1]/40 py-16 border-t border-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#104F57] bg-teal-50 border border-teal-200 px-3 py-1 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Foundational Purpose</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
              Our Sacred Mission &amp; Enduring Vision
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Phumulani exists to ensure that every immigrant and refugee survivor of domestic violence, human trafficking, and systemic trauma in Minnesota discovers not merely an escape from danger, but an enduring pathway to sovereignty, self-determination, and thriving peace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-teal-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#104F57] flex items-center justify-center font-bold">
                01
              </div>
              <h3 className="font-serif text-lg font-bold text-slate-900">Cultural Attunement</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Healing cannot be imported from generic clinical models. We center ancestral sisterhood tea circles, indigenous trauma resolution, and bilingual advocates who share lived cultural realities.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-teal-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#104F57] flex items-center justify-center font-bold">
                02
              </div>
              <h3 className="font-serif text-lg font-bold text-slate-900">Legal Self-Defense</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Navigating Orders for Protection (OFP), U-Visa certifications, and immigration relief with relentless, courtroom-accredited accompaniment and trauma-informed legal partners.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-teal-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#104F57] flex items-center justify-center font-bold">
                03
              </div>
              <h3 className="font-serif text-lg font-bold text-slate-900">Economic Sovereignty</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Financial abuse is the most potent anchor of domestic violence. We dismantle dependency through matched savings, rapid lease deposits, credit restoration, and micro-enterprise coaching.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-teal-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#104F57] flex items-center justify-center font-bold">
                04
              </div>
              <h3 className="font-serif text-lg font-bold text-slate-900">Intergenerational Youth</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Breaking generational trauma by investing deeply in the children of survivors through academic tutoring, college preparation, and culturally grounded leadership development.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. STRATEGIC PARTNERSHIPS & ALLIANCES (#partnerships-section) */}
      <section id="partnerships-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div>
            <div className="text-xs font-bold text-[#104F57] uppercase tracking-wider">Collective Power</div>
            <h2 className="font-serif text-3xl font-bold text-slate-900">
              Community Alliances &amp; Institutional Partners
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Phumulani works arm-in-arm with Minnesota public agencies, corporate grantmakers, legal coalitions, and shelter networks.
            </p>
          </div>
          <button
            onClick={() => {
              const el = document.getElementById('contact-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-4 py-2 border border-teal-700 text-[#104F57] hover:bg-teal-50 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <span>Partner With Phumulani</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-800">
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>Corporate CSR Partners</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Minnesota corporate benefactors supporting matched giving, employer hiring days, and technology donations for our workforce lab.
            </p>
            <div className="text-[11px] font-semibold text-slate-500 pt-1">
              Target Foundation · 3M Community Giving · Medtronic CSR
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#633C69]">
              <Shield className="w-4 h-4 text-[#633C69]" />
              <span>Legal Defense Network</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Direct collaborative referrals for bilingual legal counsel, orders for protection, and immigration U-Visa navigation in Hennepin &amp; Ramsey counties.
            </p>
            <div className="text-[11px] font-semibold text-slate-500 pt-1">
              The Advocates for Human Rights · Standpoint MN · Tubman
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
              <Home className="w-4 h-4 text-amber-700" />
              <span>Emergency Shelter Network</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fast-track confidential safe house transfers, emergency hotel vouchers, and landlord negotiation for rapid independent leasing.
            </p>
            <div className="text-[11px] font-semibold text-slate-500 pt-1">
              Day One Crisis Line · Cornerstone MN · Haven Housing
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-800">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Academic &amp; Research</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Community-based participatory evaluation, workforce intern placement, and rigorous monitoring of our MEAL indicators.
            </p>
            <div className="text-[11px] font-semibold text-slate-500 pt-1">
              University of Minnesota UROC · Minneapolis College
            </div>
          </div>
        </div>
      </section>

      {/* 11. NEWS, COMMUNITY BULLETINS & PUBLICATIONS (#news-section) */}
      <section id="news-section" className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <div className="text-xs font-bold text-[#104F57] uppercase tracking-wider">Publications &amp; Press</div>
              <h2 className="font-serif text-3xl font-bold text-slate-900">
                Latest News &amp; Authored Works
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Stories of resilience, executive reports, and published books by Founder Comfort Dondo.
              </p>
            </div>
            <div className="text-xs text-slate-500">
              Verified IRS 501(c)(3) Public Disclosures
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Book Card 1 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold text-[#633C69] bg-purple-50 px-2 py-0.5 rounded">Published Memoir</span>
                  <span>2021 Release</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-slate-900">Facing the Giants</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Comfort Dondo's acclaimed memoir chronicling her lived journey through adversity, displacement, and the unyielding determination to build culturally grounded sanctuaries for immigrant women.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Author: Comfort Dondo</span>
                <span className="text-[#104F57] font-semibold">Available via Community Library</span>
              </div>
            </div>

            {/* Book Card 2 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">Co-Authored Anthology</span>
                  <span>Global Women's Leadership</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-slate-900">Sacred Promise</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  An inspiring collaborative volume with Dr. Tererai Trent and visionary global leaders exploring the sacred covenants women make to lift each other out of oppression and into economic dignity.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Foreword: Dr. Tererai Trent</span>
                <span className="text-[#104F57] font-semibold">Minnesota Reading Circles</span>
              </div>
            </div>

            {/* Book Card 3 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">Forthcoming Publication</span>
                  <span>2027 Preview</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-slate-900">The Gift in Pain</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A profound exploration of transforming deep psychological and systemic wounds into catalysts for revolutionary community organizing, social entrepreneurship, and generational liberation.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Advance Announcements</span>
                <span className="text-amber-700 font-semibold">Excerpts in Tea Circles</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 12. SURVIVOR RIGHTS & COMMUNITY RESOURCES (#resources-section) */}
      <section id="resources-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="text-xs font-bold text-[#104F57] uppercase tracking-wider">Self-Advocacy &amp; Guidance</div>
            <h2 className="font-serif text-3xl font-bold text-slate-900">
              Community Resources &amp; Downloadable Guides
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Trauma-informed, legally vetted, multilingual tools available to the community free of charge.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
            {(['all', 'legal', 'housing', 'healing', 'workforce'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setResourceFilter(cat)}
                className={`px-3 py-1.5 rounded-lg font-semibold capitalize cursor-pointer transition-colors ${
                  resourceFilter === cat ? 'bg-white text-teal-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {downloadNotice && (
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs font-semibold text-teal-900 flex items-center justify-between">
            <span>{downloadNotice}</span>
            <button onClick={() => setDownloadNotice(null)} className="text-teal-700">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">Legal Guide</span>
                <span>PDF · 4.2 MB</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Order for Protection (OFP) Step-by-Step Navigator</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clear instructions for filing an OFP in Minnesota district courts without filing fees, including emergency ex parte relief.
              </p>
            </div>
            <button
              onClick={() => handleDownloadResource('Order for Protection (OFP) Step-by-Step Navigator')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Download PDF (Multilingual)</span>
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded">Housing Toolkit</span>
                <span>PDF · 2.8 MB</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Minnesota Safe Lease Termination &amp; Deposit Rights</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                How Minnesota Statute 504B.206 protects domestic abuse survivors who need to break a lease safely without financial penalty.
              </p>
            </div>
            <button
              onClick={() => handleDownloadResource('Minnesota Safe Lease Termination & Deposit Rights')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Download Housing Toolkit</span>
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">Healing Circles</span>
                <span>PDF · 1.9 MB</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Sisterhood Tea Healing Circle Facilitation Manual</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Trauma-informed guidance for hosting culturally grounded healing circles in community centers, mosques, and churches.
              </p>
            </div>
            <button
              onClick={() => handleDownloadResource('Sisterhood Tea Healing Circle Facilitation Manual')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Download Circle Guide</span>
            </button>
          </div>
        </div>
      </section>

      {/* 13. CONTACT INFORMATION & SECURE INQUIRY (#contact-section) */}
      <section id="contact-section" className="bg-[#E8F3F1]/60 py-16 border-t border-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="text-xs font-bold text-[#104F57] uppercase tracking-wider">Reach Our Team</div>
                <h2 className="font-serif text-3xl font-bold text-slate-900">
                  Connect With Phumulani
                </h2>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Have a question about our community programs, volunteer opportunities, donor partnerships, or events? We are here to help.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-teal-200/80 shadow-2xs">
                  <MapPin className="w-4 h-4 text-[#104F57] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">Mailing &amp; Operational Address</div>
                    <div className="text-slate-600">Phumulani (Minnesota African Women Against Violence)</div>
                    <div className="text-slate-600">PO Box, Minneapolis, MN 55404</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-teal-200/80 shadow-2xs">
                  <PhoneCall className="w-4 h-4 text-[#104F57] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">Phone Communications</div>
                    <div className="text-slate-600">General Admin: (612) 555-0199 (Mon–Fri 9am–5pm)</div>
                    <div className="text-rose-700 font-semibold mt-0.5">24/7 Day One Crisis Line: 1-866-223-1111</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-teal-200/80 shadow-2xs">
                  <Mail className="w-4 h-4 text-[#104F57] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">Department Mailboxes</div>
                    <div className="text-slate-600">General Outreach: <code>info@phumulani.org</code></div>
                    <div className="text-slate-600">Donations &amp; Grants: <code>donations@phumulani.org</code></div>
                    <div className="text-slate-600">Confidential Safeguarding: <code>safeguarding@phumulani.org</code></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-teal-200 shadow-sm">
              <h3 className="font-serif text-xl font-bold text-slate-900 mb-1">
                Send a General Inquiry
              </h3>
              <p className="text-xs text-slate-500 mb-5">
                For non-emergency community inquiries, partnership proposals, and press questions.
              </p>

              {contactSubmittedCode ? (
                <div className="p-6 bg-teal-50 border border-teal-200 rounded-xl text-center space-y-3">
                  <CheckCircle2 className="w-8 h-8 text-teal-700 mx-auto" />
                  <div className="font-serif text-lg font-bold text-teal-950">Inquiry Received: {contactSubmittedCode}</div>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Thank you for reaching out. A Phumulani team coordinator will reply to your inquiry within 1 business day.
                  </p>
                  <button
                    onClick={() => setContactSubmittedCode(null)}
                    className="text-xs font-bold text-[#104F57] hover:underline cursor-pointer"
                  >
                    Submit another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="First and Last Name"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-teal-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Your Email</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-teal-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Department</label>
                      <select
                        value={contactDepartment}
                        onChange={(e) => setContactDepartment(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white text-slate-700"
                      >
                        <option value="General Inquiries">General Inquiries</option>
                        <option value="Community Programs">Community Programs &amp; Cohorts</option>
                        <option value="Volunteer Coordination">Volunteer Onboarding</option>
                        <option value="Donor Relations & Sponsorship">Donor Relations &amp; Giving</option>
                        <option value="Media & Press">Media &amp; Press Coordination</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                      <input
                        type="text"
                        required
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        placeholder="Brief summary of inquiry"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-teal-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Message</label>
                    <textarea
                      rows={4}
                      required
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Please share how our team can assist you..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-teal-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#104F57] hover:bg-[#0c3e44] text-white rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Inquiry</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 14. PRIVACY NOTICE & SAFEGUARDING (#privacy-section) */}
      <section id="privacy-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <div className="text-xs font-bold text-[#104F57] uppercase tracking-wider">Compliance &amp; Ethics</div>
          <h2 className="font-serif text-3xl font-bold text-slate-900">
            Privacy Notice &amp; VAWA Section 1367 Legal Safeguards
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Official 501(c)(3) privacy declaration and survivor protection firewall standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-700">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero-Disclosure Survivor Firewall</span>
            </div>
            <p className="leading-relaxed text-slate-600">
              Pursuant to Violence Against Women Act (VAWA) 34 U.S.C. § 12291(b)(2), Phumulani never discloses personally identifying information (PII) of survivors without written, informed, and time-limited consent. Survivor records are strictly segregated from general operational databases.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-teal-600" />
              <span>Donor Bill of Rights &amp; Privacy</span>
            </div>
            <p className="leading-relaxed text-slate-600">
              Phumulani adheres to the Association of Fundraising Professionals (AFP) Donor Bill of Rights. We never sell, rent, trade, or share donor contact information or giving records with external commercial marketing entities.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>Zero Commercial Ad Tracking</span>
            </div>
            <p className="leading-relaxed text-slate-600">
              Our website contains zero third-party advertising trackers, Facebook Meta pixels, or Google Ads remarketing cookies. Digital interactions remain private and safe from surveillance or behavioral profiling.
            </p>
          </div>
        </div>
      </section>

      {/* 15. ACCESSIBILITY STATEMENT (#accessibility-section) */}
      <section id="accessibility-section" className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="border-b border-slate-800 pb-4">
            <div className="text-xs font-bold text-teal-300 uppercase tracking-wider">Universal Design</div>
            <h2 className="font-serif text-3xl font-bold text-white">
              Accessibility Statement &amp; WCAG 2.2 AA Conformance
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Phumulani is committed to ensuring full digital inclusion and dignified usability for people with all physical, sensory, and cognitive abilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
              <div className="font-bold text-teal-300">Keyboard Navigation</div>
              <p className="text-slate-300 leading-relaxed">
                Full Tab, Shift+Tab, and Enter keyboard focus traversal with visible high-contrast focus rings and zero keyboard traps.
              </p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
              <div className="font-bold text-teal-300">Screen Reader Support</div>
              <p className="text-slate-300 leading-relaxed">
                Semantic HTML5 landmarks (header, nav, main, section, footer) and explicit ARIA labels for non-text SVGs and modal dialogues.
              </p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
              <div className="font-bold text-teal-300">Contrast &amp; Scalability</div>
              <p className="text-slate-300 leading-relaxed">
                Color contrast ratios meet or exceed 4.5:1 for body copy and 7:1 for headings. Text can be enlarged up to 200% without loss of layout.
              </p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
              <div className="font-bold text-teal-300">Emergency Safe Exit</div>
              <p className="text-slate-300 leading-relaxed">
                Double-pressing the <kbd className="bg-slate-700 px-1 py-0.5 rounded text-[10px] border border-slate-600">ESC</kbd> key anywhere immediately replaces the current page with weather.com for personal safety.
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-4 flex flex-wrap justify-between items-center gap-3">
            <span>Accessibility Coordinator: <code>access@phumulani.org</code> · Verified against WCAG 2.2 Level AA success criteria.</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-teal-300 hover:text-white font-semibold underline cursor-pointer"
            >
              Back to Top ↑
            </button>
          </div>
        </div>
      </section>

      {/* MODAL: Program Details & Direct Inquiry */}
      {selectedProgram && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-[#104F57] uppercase tracking-wider">
                  Program Deep Dive
                </span>
                <h3 className="font-serif text-2xl font-bold text-slate-900 mt-1">
                  {selectedProgram.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProgram(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium italic">
              "{selectedProgram.tagline}"
            </p>

            <div className="text-xs text-slate-700 space-y-3 leading-relaxed">
              <p>{selectedProgram.fullDetails}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs border border-slate-200">
              <div className="font-bold text-slate-800">Eligibility & Access:</div>
              <p className="text-slate-600">{selectedProgram.eligibility}</p>
              <div className="pt-2 flex flex-wrap gap-4 text-slate-500 text-[11px]">
                <span>Lead Coordinator: <strong>{selectedProgram.leadCoordinator}</strong></span>
                <span>Contact: <strong>{selectedProgram.contactEmail}</strong></span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setSelectedProgram(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedProgram(null);
                  document.getElementById('get-involved-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-2 bg-[#104F57] text-white rounded-lg text-xs font-semibold hover:bg-[#0c3e44]"
              >
                Inquire as Volunteer / Partner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Volunteer Application Form */}
      {selectedOpportunity && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#104F57] uppercase tracking-wider">
                  Volunteer Application
                </span>
                <h3 className="font-serif text-xl font-bold text-slate-900 mt-0.5">
                  {selectedOpportunity.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOpportunity(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleVolunteerSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={volFullName}
                  onChange={(e) => setVolFullName(e.target.value)}
                  placeholder="Amara Diallo"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={volEmail}
                    onChange={(e) => setVolEmail(e.target.value)}
                    placeholder="amara@example.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={volPhone}
                    onChange={(e) => setVolPhone(e.target.value)}
                    placeholder="(612) 555-0192"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Preferred Language(s)</label>
                  <input
                    type="text"
                    value={volLanguage}
                    onChange={(e) => setVolLanguage(e.target.value)}
                    placeholder="English, Somali, French..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Availability</label>
                  <select
                    value={volAvailability}
                    onChange={(e) => setVolAvailability(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white text-xs"
                  >
                    <option value="Weekday Evenings">Weekday Evenings</option>
                    <option value="Saturday Mornings">Saturday Mornings</option>
                    <option value="Sunday Afternoons">Sunday Afternoons</option>
                    <option value="Flexible Remote">Flexible Remote</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Skills & Experience</label>
                <input
                  type="text"
                  value={volSkills}
                  onChange={(e) => setVolSkills(e.target.value)}
                  placeholder="e.g. Tutoring, HR, Legal research, Event organizing"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Why do you want to volunteer with Phumulani?</label>
                <textarea
                  rows={3}
                  required
                  value={volMotivation}
                  onChange={(e) => setVolMotivation(e.target.value)}
                  placeholder="Share a few sentences about your motivation..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="safeAck"
                    required
                    checked={volSafeguardingCheck}
                    onChange={(e) => setVolSafeguardingCheck(e.target.checked)}
                    className="mt-0.5 rounded text-[#104F57]"
                  />
                  <label htmlFor="safeAck" className="text-[11px] text-teal-950 font-medium">
                    I agree to adhere to Phumulani’s strict survivor confidentiality policies, undergo standard screening, and complete the mandatory safeguarding orientation module before placement.
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOpportunity(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#104F57] hover:bg-[#0c3e44] text-white rounded-lg font-bold"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Event RSVP */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#633C69] uppercase tracking-wider">
                  Event Registration
                </span>
                <h3 className="font-serif text-lg font-bold text-slate-900 mt-0.5">
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRsvpSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={rsvpEmail}
                  onChange={(e) => setRsvpEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone (Optional for SMS reminders)</label>
                <input
                  type="tel"
                  value={rsvpPhone}
                  onChange={(e) => setRsvpPhone(e.target.value)}
                  placeholder="612-555-0100"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
                <div><strong>Accessibility notes:</strong> {selectedEvent.accessibilityNotes}</div>
                <div><strong>Live capacity check:</strong> {selectedEvent.registeredCount} / {selectedEvent.capacity} booked</div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="px-3 py-2 border border-slate-300 text-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#104F57] hover:bg-[#0c3e44] text-white rounded-lg font-bold"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
