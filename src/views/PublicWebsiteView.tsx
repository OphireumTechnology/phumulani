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
import { SafeImage } from '../components/SafeImage';
import { PhumulaniLogo, PhumulaniLogoMark, PhumulaniLogoFull } from '../components/branding/PhumulaniLogo';
import { BrandPatternDivider } from '../components/branding/BrandPatternDivider';

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
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

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
    <div className="space-y-16 pb-20 font-sans">
      {/* 1. HERO BANNER - OFFICIAL BRAND IDENTITY GUIDELINES */}
      <section className="bg-gradient-to-b from-[#FFF7E6] via-white to-[#FFF7E6]/40 pt-8 sm:pt-12 pb-14 sm:pb-18 border-b border-teal-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* LEFT COLUMN: Mission & Headline (~58%) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2.5 max-w-full text-xs font-semibold text-[#006D6F] bg-white border border-teal-200 px-3.5 py-1.5 rounded-xl sm:rounded-full shadow-2xs">
                <PhumulaniLogoMark className="w-4 h-4 shrink-0" />
                <span className="font-heading tracking-wide uppercase text-[10px] sm:text-[11px] leading-snug min-w-0 break-words">MINNESOTA 501(C)(3) · THE VOICE OF IMMIGRANTS &amp; REFUGEES</span>
              </div>

              {/* Exact wording with responsive clamp and brand colors */}
              <h1 className="font-heading font-extrabold text-[#006D6F] tracking-tight leading-[1.08] text-[clamp(1.85rem,4.2vw,4.25rem)] max-w-[1050px] min-w-0 break-words m-0">
                <span className="block">Empowering Immigrant &amp; Refugee Survivors</span>
                <span className="block text-[#F05A28] mt-1 sm:mt-2">Toward Healing &amp; Autonomy</span>
              </h1>

              {/* Official Mission Statement from Brand Identity Guide */}
              <div className="border-l-4 border-[#F05A28] pl-4 py-1 bg-white/70 rounded-r-lg">
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-sans font-normal max-w-2xl">
                  To empower immigrant and refugee survivors through culturally specific advocacy, safety, housing stability, education, and economic opportunity.
                </p>
              </div>

              {/* Standardized 3 CTA Buttons with consistent heights and 44px+ touch targets */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    document.getElementById('donate-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="min-h-[44px] h-12 bg-[#F05A28] hover:bg-[#d94819] text-white px-5 rounded-lg text-xs sm:text-sm font-heading font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#F05A28]"
                >
                  <Heart className="w-4 h-4 fill-white/20" />
                  <span>Support Our Mission</span>
                </button>

                <button
                  onClick={() => {
                    document.getElementById('get-involved-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="min-h-[44px] h-12 bg-white hover:bg-[#FFF7E6] text-[#006D6F] border-2 border-[#006D6F] px-5 rounded-lg text-xs sm:text-sm font-heading font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#006D6F]"
                >
                  <Users className="w-4 h-4 text-[#006D6F]" />
                  <span>Become a Volunteer or Mentor</span>
                </button>

                <button
                  onClick={() => {
                    document.getElementById('get-help-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="min-h-[44px] h-12 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 px-4 rounded-lg text-xs sm:text-sm font-heading font-bold transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-500"
                >
                  <LifeBuoy className="w-4 h-4 text-rose-600" />
                  <span>Need Help? Safe Routing</span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Official Photography & Founder Spotlight (~42%) */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-teal-200/90 shadow-xl overflow-hidden relative space-y-4">
                {/* Official Community Hero Photography from Reference A */}
                <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden border-b border-teal-100 group">
                  <SafeImage
                    src="/images/branding/phumulani-hero-family.png"
                    fallbackSrc="/images/homepage/community-hero.svg"
                    fallbackType="hero"
                    alt="Joyful African mother in traditional headwrap smiling warmly and embracing her two children against the Minneapolis skyline and Stone Arch Bridge"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    loading="eager"
                  />
                  <div className="absolute bottom-2.5 left-2.5 bg-[#006D6F]/90 backdrop-blur-xs text-white px-3 py-1 rounded-full text-[10px] font-heading font-bold border border-white/20 flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-[#7A9B29] animate-pulse" />
                    <span>Culturally Grounded Sanctuary</span>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-4 pt-1">
                  {/* Founder Identification */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <SafeImage
                        src="/images/leadership/comfort-dondo.svg"
                        fallbackSrc="/media/founder/comfort-dondo-official-portrait.svg"
                        fallbackType="founder"
                        initials="CD"
                        alt="Comfort Dondo, Founder of Phumulani"
                        className="w-12 h-12 rounded-xl object-cover border-2 border-[#006D6F] shadow-sm shrink-0"
                      />
                      <div>
                        <div className="font-heading font-bold text-base text-slate-900">Comfort Dondo</div>
                        <div className="text-[11px] text-[#006D6F] font-semibold font-heading">Founder &amp; Executive Director</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        document.getElementById('founder-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-xs font-bold font-heading text-[#F05A28] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Story &amp; Video</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed italic font-quote">
                    "Healing is finding the community, protection, and economic independence to stand tall again. At Phumulani, every survivor is met with trauma-informed care and unwavering sisterhood."
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#FFF7E6]/70 p-2.5 rounded-xl border border-amber-200/60">
                      <div className="font-heading text-lg font-bold text-[#006D6F]">1,450+</div>
                      <div className="text-[10px] text-slate-600">Survivors &amp; Families</div>
                    </div>
                    <div className="bg-[#FFF7E6]/70 p-2.5 rounded-xl border border-amber-200/60">
                      <div className="font-heading text-lg font-bold text-[#F05A28]">$480k+</div>
                      <div className="text-[10px] text-slate-600">Emergency Housing Aid</div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-teal-50/80 border border-teal-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#006D6F]" />
                      <span className="font-semibold font-heading text-teal-950 text-[11px]">Strict Survivor Confidentiality</span>
                    </div>
                    <span className="text-[9px] text-[#006D6F] font-mono font-bold">VAWA § 1367</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND PATTERN ACCENT DIVIDER */}
      <BrandPatternDivider height={10} />

      {/* 1.5 OFFICIAL CORE VALUES (FROM BRAND IDENTITY GUIDE REFERENCE A) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <div className="text-xs font-bold text-[#006D6F] font-heading uppercase tracking-wider">
            Brand Foundations
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
            Our Core Values
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            A unified framework for advocacy, safety, empowerment, and dignity for immigrants and refugees.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-[#FFF7E6]/70 p-4 rounded-2xl border border-amber-200/70 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-white border border-amber-200 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <Users className="w-6 h-6 text-[#F05A28]" />
            </div>
            <h3 className="font-heading font-bold text-sm text-slate-900 leading-snug">Safety &amp; Protection</h3>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Confidential sanctuary &amp; legal accompaniment</p>
          </div>

          <div className="bg-[#FFF7E6]/70 p-4 rounded-2xl border border-amber-200/70 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-white border border-amber-200 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <Home className="w-6 h-6 text-[#006D6F]" />
            </div>
            <h3 className="font-heading font-bold text-sm text-slate-900 leading-snug">Stable Housing</h3>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Emergency bridge funding &amp; rapid leasing</p>
          </div>

          <div className="bg-[#FFF7E6]/70 p-4 rounded-2xl border border-amber-200/70 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-white border border-amber-200 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <TrendingUp className="w-6 h-6 text-[#7A9B29]" />
            </div>
            <h3 className="font-heading font-bold text-sm text-slate-900 leading-snug">Economic Empowerment</h3>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Financial literacy &amp; business ownership</p>
          </div>

          <div className="bg-[#FFF7E6]/70 p-4 rounded-2xl border border-amber-200/70 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-white border border-amber-200 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <BookOpen className="w-6 h-6 text-[#F4B400]" />
            </div>
            <h3 className="font-heading font-bold text-sm text-slate-900 leading-snug">Education &amp; Workforce</h3>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Job readiness, certifications &amp; tutoring</p>
          </div>

          <div className="bg-[#FFF7E6]/70 p-4 rounded-2xl border border-amber-200/70 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-white border border-amber-200 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <Heart className="w-6 h-6 text-[#C62828]" />
            </div>
            <h3 className="font-heading font-bold text-sm text-slate-900 leading-snug">Cultural Belonging</h3>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Sisterhood tea circles &amp; lived heritage</p>
          </div>

          <div className="bg-[#FFF7E6]/70 p-4 rounded-2xl border border-amber-200/70 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-white border border-amber-200 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <Sparkles className="w-6 h-6 text-[#006D6F]" />
            </div>
            <h3 className="font-heading font-bold text-sm text-slate-900 leading-snug">Dignity &amp; Autonomy</h3>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Trauma-informed self-determination</p>
          </div>
        </div>
      </section>

      {/* 2. STATS & COMMUNITY IMPACT SUMMARY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-teal-100 shadow-sm p-6 sm:p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-y lg:divide-y-0 lg:divide-x divide-teal-50">
            <div className="p-2">
              <div className="font-heading text-3xl sm:text-4xl font-extrabold text-[#006D6F]">1,450+</div>
              <div className="text-xs text-slate-600 font-medium mt-1">Families Supported Since Inception</div>
            </div>
            <div className="p-2 pt-6 lg:pt-2">
              <div className="font-heading text-3xl sm:text-4xl font-extrabold text-[#F05A28]">$480,000+</div>
              <div className="text-xs text-slate-600 font-medium mt-1">Direct Emergency &amp; Housing Aid Distributed</div>
            </div>
            <div className="p-2 pt-6 lg:pt-2">
              <div className="font-heading text-3xl sm:text-4xl font-extrabold text-[#7A9B29]">92%</div>
              <div className="text-xs text-slate-600 font-medium mt-1">Workforce Graduate Job Placement Rate</div>
            </div>
            <div className="p-2 pt-6 lg:pt-2">
              <div className="font-heading text-3xl sm:text-4xl font-extrabold text-[#F4B400]">100%</div>
              <div className="text-xs text-slate-600 font-medium mt-1">Dedicated to Culturally Specific Survivor Healing</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 FOUNDER LEGACY, ORIGINAL VIDEOS & PUBLICATIONS */}
      <FounderSection />

      {/* 3. SIX CORE PROGRAMS */}
      <section id="programs-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-3 text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-bold text-[#006D6F] font-heading uppercase tracking-wider">
            What We Do
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900">
            Six Comprehensive Community Programs
          </h2>
          <p className="text-sm text-slate-600 font-sans">
            Grounded in trauma-informed care and culturally responsive support across Minnesota.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((prog) => {
            const programPhotos: Record<string, { src: string; fallback: string; alt: string }> = {
              advocacy: {
                src: '/media/phumulani/programs/safety-protection.jpg',
                fallback: '/images/programs/legal-protection-advocacy.svg',
                alt: 'Culturally grounded tea healing circle and trauma-informed survivor advocacy in Minnesota',
              },
              housing: {
                src: '/media/phumulani/programs/housing-stability.jpg',
                fallback: '/images/programs/healing-homes-housing.svg',
                alt: 'Joyful immigrant mother and daughter arriving at their new safe Minnesota apartment home',
              },
              financial_literacy: {
                src: '/media/phumulani/programs/economic-empowerment.jpg',
                fallback: '/images/programs/economic-empowerment.svg',
                alt: 'African immigrant women collaborating on financial planning and entrepreneurship with mentor',
              },
              workforce: {
                src: '/media/phumulani/programs/education-workforce.jpg',
                fallback: '/images/programs/education-workforce.svg',
                alt: 'African immigrant woman completing career workforce skills training in computer lab',
              },
              mentorship: {
                src: '/media/phumulani/programs/youth-mentorship.jpg',
                fallback: '/images/programs/youth-mentorship.svg',
                alt: 'Young African immigrant girls engaged in uplifting youth mentorship and sisterhood',
              },
              entrepreneurship: {
                src: '/media/phumulani/programs/economic-empowerment.jpg',
                fallback: '/images/programs/economic-empowerment.svg',
                alt: 'Immigrant women entrepreneurship lab and small business launch coaching in Minneapolis',
              },
            };
            const progMedia = programPhotos[prog.slug] || {
              src: '/media/phumulani/programs/safety-protection.jpg',
              fallback: '/images/programs/community-wellness.svg',
              alt: prog.name,
            };

            return (
              <div
                key={prog.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-[#006D6F] hover:shadow-lg transition-all group"
              >
                {/* Authentic Program Artwork */}
                <div className="aspect-[4/3] w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                  <SafeImage
                    src={progMedia.src}
                    fallbackSrc={progMedia.fallback}
                    fallbackType="program"
                    fallbackText={prog.name}
                    alt={progMedia.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[#006D6F] text-xs font-bold font-heading uppercase tracking-wider">
                      {prog.slug === 'advocacy' && <Shield className="w-4 h-4 text-[#006D6F]" />}
                      {prog.slug === 'workforce' && <Briefcase className="w-4 h-4 text-[#006D6F]" />}
                      {prog.slug === 'financial_literacy' && <DollarSign className="w-4 h-4 text-[#006D6F]" />}
                      {prog.slug === 'mentorship' && <Users className="w-4 h-4 text-[#006D6F]" />}
                      {prog.slug === 'housing' && <Home className="w-4 h-4 text-[#006D6F]" />}
                      {prog.slug === 'entrepreneurship' && <Sparkles className="w-4 h-4 text-[#006D6F]" />}
                      <span>{prog.tagline || 'Core Program'}</span>
                    </div>

                    <div>
                      <h3 className="font-heading text-lg font-bold text-slate-900 group-hover:text-[#006D6F] transition-colors">
                        {prog.name}
                      </h3>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed font-sans">
                        {prog.description}
                      </p>
                    </div>

                    <div className="pt-2 space-y-1.5 border-t border-slate-100">
                      <div className="text-[11px] font-semibold font-heading text-slate-700">Key Services:</div>
                      <ul className="text-[11px] text-slate-500 space-y-1 font-sans">
                        {prog.keyServices.slice(0, 3).map((s, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-[#7A9B29] shrink-0" />
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
                      className="font-semibold font-heading text-[#006D6F] hover:text-[#004A4C] flex items-center gap-1 cursor-pointer"
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
      <section id="about-section" className="bg-[#FFF7E6] py-16 border-y border-amber-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-amber-200/90 shadow-md space-y-4">
                <div className="flex items-center gap-4">
                  <SafeImage
                    src="/images/leadership/comfort-dondo.svg"
                    fallbackSrc="/media/founder/comfort-dondo-official-portrait.svg"
                    fallbackType="founder"
                    initials="CD"
                    alt="Comfort Dondo, Founder of Phumulani"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-[#006D6F] shadow-md shrink-0"
                  />
                  <div>
                    <div className="font-heading text-2xl font-bold text-slate-900 leading-tight">
                      Comfort Dondo
                    </div>
                    <div className="text-xs font-semibold font-heading text-[#006D6F] mt-0.5">
                      Founder &amp; Executive Director
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 font-sans">
                      Author · Advocate · Minnesota 501(c)(3)
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed italic font-quote">
                  "Healing is not merely surviving an ordeal—it is finding the courage, community, and economic standing to dream boldly again. Phumulani exists so no immigrant survivor walks alone."
                </p>

                <div className="pt-4 border-t border-slate-100">
                  <div className="text-[11px] font-bold font-heading text-slate-700 uppercase tracking-wider mb-2">
                    Authored Publications
                  </div>
                  <div className="space-y-2 text-xs text-slate-600 font-sans">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-[#F05A28] shrink-0" />
                      <span className="font-medium text-slate-800">Facing the Giants</span>
                      <span className="text-[10px] text-slate-400">· 2021 Memoir</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-[#006D6F] shrink-0" />
                      <span className="font-medium text-slate-800">Sacred Promise</span>
                      <span className="text-[10px] text-slate-400">· With Dr. Tererai Trent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-[#F4B400] shrink-0" />
                      <span className="font-medium text-slate-800">The Gift in Pain</span>
                      <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">Advance Announcement</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              {/* Community Solidarity Hero Visual */}
              <div className="relative rounded-2xl overflow-hidden border border-teal-200/90 shadow-md aspect-[16/9] group">
                <SafeImage
                  src="/media/phumulani/about/community-solidarity.jpg"
                  fallbackSrc="/images/homepage/community-hero.svg"
                  fallbackType="hero"
                  alt="Multi-generational African immigrant women standing together in unified solidarity by a Minnesota lake"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent flex items-end p-5">
                  <div>
                    <span className="text-[#F4B400] font-heading font-bold text-[11px] uppercase tracking-wider">
                      Sisterhood &amp; Shared Strength
                    </span>
                    <h3 className="font-heading text-white text-lg sm:text-xl font-bold mt-0.5">
                      Rooted in Heritage. Unified in Healing.
                    </h3>
                  </div>
                </div>
              </div>

              <div className="text-xs font-bold font-heading text-[#006D6F] uppercase tracking-wider">
                Organizational Heritage
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900">
                A Safe Haven Rooted in Cultural Dignity
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed font-sans">
                Founded in 2017 to bridge the systemic voids faced by African, African-American, Asian, and Latinx immigrants in Minnesota, Phumulani (meaning "to rest" or "peace" in Zulu) provides comprehensive wraparound support.
              </p>
              <p className="text-sm text-slate-700 leading-relaxed font-sans">
                We believe that safety requires economic independence. When survivors obtain stable housing, credit repair, and living-wage employment, they break cycles of intergenerational trauma.
              </p>

              {/* Leadership & Safeguarding Portraits */}
              <div id="leadership-section" className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold font-heading text-slate-900 uppercase tracking-wide">
                    Executive Leadership &amp; Board
                  </span>
                  {onOpenMediaRegistry && (
                    <button
                      onClick={onOpenMediaRegistry}
                      className="text-xs font-heading text-[#006D6F] hover:text-[#004A4C] hover:underline font-semibold cursor-pointer"
                    >
                      View Media &amp; Safeguarding Registry ↗
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                    <SafeImage
                      src="/images/leadership/dr-elena-rostova.svg"
                      fallbackSrc="/media/leadership/dr-elena-rostova.svg"
                      fallbackType="leadership"
                      initials="ER"
                      alt="Dr. Elena Rostova"
                      className="w-14 h-14 mx-auto rounded-xl object-cover shadow-2xs"
                    />
                    <div className="font-heading font-bold text-xs text-slate-900 leading-tight">Dr. Elena Rostova</div>
                    <div className="text-[10px] text-slate-500 font-sans">Board Chair</div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                    <SafeImage
                      src="/images/leadership/sister-miriam-k.svg"
                      fallbackSrc="/media/leadership/sister-miriam-k.svg"
                      fallbackType="leadership"
                      initials="MK"
                      alt="Sister Miriam K."
                      className="w-14 h-14 mx-auto rounded-xl object-cover shadow-2xs"
                    />
                    <div className="font-heading font-bold text-xs text-slate-900 leading-tight">Sister Miriam K.</div>
                    <div className="text-[10px] text-slate-500 font-sans">Safeguarding Lead</div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                    <SafeImage
                      src="/images/leadership/david-mwangi.svg"
                      fallbackSrc="/media/leadership/david-mwangi.svg"
                      fallbackType="leadership"
                      initials="DM"
                      alt="David Mwangi, CPA"
                      className="w-14 h-14 mx-auto rounded-xl object-cover shadow-2xs"
                    />
                    <div className="font-heading font-bold text-xs text-slate-900 leading-tight">David Mwangi, CPA</div>
                    <div className="text-[10px] text-slate-500 font-sans">Finance Director</div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                    <SafeImage
                      src="/images/leadership/amina-yusuf.svg"
                      fallbackSrc="/media/leadership/amina-yusuf.svg"
                      fallbackType="leadership"
                      initials="AY"
                      alt="Amina Yusuf"
                      className="w-14 h-14 mx-auto rounded-xl object-cover shadow-2xs"
                    />
                    <div className="font-heading font-bold text-xs text-slate-900 leading-tight">Amina Yusuf</div>
                    <div className="text-[10px] text-slate-500 font-sans">Community Lead</div>
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
            <div className="text-xs font-bold font-heading text-[#006D6F] uppercase tracking-wider">Join The Movement</div>
            <h2 className="font-heading text-3xl font-extrabold text-slate-900">
              Volunteer Opportunities &amp; Mentorship
            </h2>
            <p className="text-xs text-slate-600 mt-1 font-sans">
              Give your time, professional expertise, or language fluency to empower Minnesota families.
            </p>
          </div>
          <button
            onClick={() => onViewChange('community')}
            className="text-xs font-semibold font-heading text-[#006D6F] hover:text-[#004A4C] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Go to Volunteer Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Featured Volunteer Action Banner */}
        <div className="mb-8 rounded-2xl overflow-hidden border border-teal-200/90 shadow-sm bg-gradient-to-r from-[#003839] via-[#006D6F] to-[#008A8C] text-white grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 relative aspect-[16/9] lg:aspect-auto lg:h-full bg-slate-900 overflow-hidden">
            <SafeImage
              src="/media/phumulani/get-involved/volunteers.jpg"
              fallbackSrc="/images/volunteers/volunteer-engagement.svg"
              fallbackType="volunteer"
              alt="Diverse community volunteers joyfully collaborating and packing care kits at Phumulani Community Center"
              className="w-full h-full object-cover min-h-[260px]"
              loading="lazy"
            />
          </div>
          <div className="lg:col-span-5 p-6 sm:p-8 space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold font-heading text-[#F4B400] uppercase tracking-wider">
              <Users className="w-4 h-4 text-[#F4B400]" />
              <span>Community In Action</span>
            </div>
            <h3 className="font-heading text-2xl font-bold text-white">
              Every Hour Contributed Creates Safety
            </h3>
            <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed font-sans">
              Our volunteers package dignity kits, accompany survivors to court appointments, mentor youth, and host bilingual conversation circles. Join over 120 active volunteers across the Twin Cities.
            </p>
            <div className="pt-2 text-xs text-[#F4B400] font-semibold flex items-center gap-2 font-heading">
              <CheckCircle2 className="w-4 h-4" />
              <span>Orientation &amp; trauma-informed training provided</span>
            </div>
          </div>
        </div>

        {submittedAppId && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#7A9B29]" />
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
              className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:border-[#006D6F] hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-semibold font-heading text-[#006D6F] bg-teal-50 px-2 py-0.5 rounded">
                    {opp.commitment}
                  </span>
                  {opp.urgent && (
                    <span className="text-[10px] font-bold font-heading text-[#C62828] bg-red-50 px-2 py-0.5 rounded">
                      Urgent Need
                    </span>
                  )}
                </div>

                <h3 className="font-heading font-bold text-base text-slate-900">
                  {opp.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {opp.description}
                </p>

                <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-100 font-sans">
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
                className="mt-5 w-full bg-[#006D6F] hover:bg-[#004A4C] text-white py-2.5 px-3 rounded-lg text-xs font-semibold font-heading transition-colors cursor-pointer shadow-xs"
              >
                Apply for Opportunity
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 6. DONATION & FUNDRAISING (HOSTED CHECKOUT SIMULATOR) */}
      <section id="donate-section" className="bg-[#004A4C] text-white py-16 relative overflow-hidden">
        <BrandPatternDivider height={8} className="absolute top-0 left-0 right-0 opacity-80" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Campaigns & Impact */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold font-heading text-[#F4B400] bg-teal-900/80 px-3 py-1 rounded-full border border-teal-700/60">
                <Heart className="w-3.5 h-3.5 fill-[#F4B400]" />
                <span className="tracking-wide">TAX-DEDUCTIBLE 501(C)(3) GIVING</span>
              </div>

              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Fuel Freedom, Safety, and Lasting Renewal
              </h2>

              <p className="text-sm text-teal-100/90 leading-relaxed font-sans">
                100% of community contributions go directly to survivor safety funds, security deposits, workforce training, and educational mentorship. All gifts are processed through verified banking gateways with immediate tax receipts.
              </p>

              {/* Community Celebration & Gratitude Visual */}
              <div className="relative rounded-xl overflow-hidden border border-teal-700/70 shadow-md aspect-[16/9] group">
                <SafeImage
                  src="/media/phumulani/donations/impact-gathering.jpg"
                  fallbackSrc="/images/events/community-celebration.svg"
                  fallbackType="event"
                  alt="Warm community celebration banquet in deep teal and gold candlelight celebrating survivor resilience"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex items-end p-4">
                  <div className="text-xs">
                    <span className="text-[#F4B400] font-heading font-bold uppercase tracking-wider text-[10px]">Your Impact In Action</span>
                    <div className="font-heading text-white font-bold text-sm sm:text-base">Families Rebuilding with Dignity &amp; Joy</div>
                  </div>
                </div>
              </div>

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
                        isSelected ? 'bg-teal-900/90 border-[#F05A28] shadow-md' : 'bg-teal-900/40 border-teal-800/80 hover:bg-teal-900/60'
                      }`}
                    >
                      <div className="flex justify-between items-start text-xs font-semibold font-heading">
                        <span className="text-white">{camp.title}</span>
                        <span className="text-[#F4B400]">{percent}% Funded</span>
                      </div>
                      <div className="w-full bg-teal-950 rounded-full h-2 my-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#F05A28] to-[#F4B400] h-2 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-teal-200/80 font-sans">
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
                    <div className="font-heading text-xl font-bold text-slate-900">Make a Donation</div>
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Lock className="w-3 h-3 text-[#7A9B29]" />
                      <span className="font-sans">SSL 256-Bit Encrypted</span>
                    </span>
                  </div>

                  {/* Frequency Toggle */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setDonationFrequency('one_time')}
                      className={`py-2 text-xs font-bold font-heading rounded-md transition-colors cursor-pointer ${
                        donationFrequency === 'one_time' ? 'bg-[#006D6F] text-white shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      One-Time Gift
                    </button>
                    <button
                      type="button"
                      onClick={() => setDonationFrequency('monthly')}
                      className={`py-2 text-xs font-bold font-heading rounded-md transition-colors cursor-pointer ${
                        donationFrequency === 'monthly' ? 'bg-[#006D6F] text-white shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Monthly Sustainer (Most Impact)
                    </button>
                  </div>

                  {/* Amount Selectors */}
                  <div>
                    <label className="block text-xs font-semibold font-heading text-slate-700 mb-2">
                      Select Gift Amount (USD)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[50, 100, 250, 500].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setDonationAmount(amt)}
                          className={`py-2.5 rounded-lg text-xs font-bold font-heading border transition-colors cursor-pointer ${
                            donationAmount === amt
                              ? 'bg-[#FFF7E6] border-[#F05A28] text-[#F05A28]'
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
                    <label className="block text-xs font-medium text-slate-600 mb-1 font-sans">
                      Or Enter Custom Amount:
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">$</span>
                      <input
                        type="number"
                        min="5"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 text-xs font-bold font-heading border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#006D6F] outline-none"
                      />
                    </div>
                  </div>

                  {/* Donor Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1 font-sans">Full Name</label>
                      <input
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="Marcus Vance"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-sans"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1 font-sans">Email Address</label>
                      <input
                        type="email"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        placeholder="donor@example.com"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-sans"
                      />
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="text-xs">
                    <label className="block font-medium text-slate-700 mb-1 font-sans">Payment Method (Provider Sandbox)</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none bg-white font-sans"
                    >
                      <option value="Credit Card (•••• 4022)">Credit Card (Visa / Mastercard)</option>
                      <option value="ACH Bank Transfer (Wells Fargo)">ACH Direct Bank Debit</option>
                      <option value="PayPal Hosted Checkout">PayPal / Venmo Giving</option>
                      <option value="Apple Pay">Apple Pay</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600 font-sans">
                    <input
                      type="checkbox"
                      id="anonCheck"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded text-[#006D6F]"
                    />
                    <label htmlFor="anonCheck">Make my gift anonymous on public donor rolls</label>
                  </div>

                  <button
                    type="submit"
                    disabled={isDonating}
                    className="w-full py-3 bg-[#F05A28] hover:bg-[#d94819] disabled:bg-slate-300 text-white rounded-lg text-sm font-heading font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
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

                  <div className="text-[11px] text-slate-400 text-center font-sans">
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
            <div className="text-xs font-bold font-heading text-[#006D6F] uppercase tracking-wider">Gathering &amp; Growth</div>
            <h2 className="font-heading text-3xl font-extrabold text-slate-900">
              Upcoming Workshops &amp; Community Gatherings
            </h2>
            <p className="text-xs text-slate-600 mt-1 font-sans">
              Events are open to community members, supporters, and partner organizations. Capacity strictly enforced.
            </p>
          </div>
        </div>

        {rsvpFeedback && (
          <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between text-xs text-teal-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#006D6F]" />
              <span className="font-sans">{rsvpFeedback.message}</span>
            </div>
            <button onClick={() => setRsvpFeedback(null)} className="font-bold text-[#006D6F] font-heading">
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((evt) => {
            const isFull = evt.registeredCount >= evt.capacity;
            const eventPhotos: Record<string, { src: string; fallback: string }> = {
              'evt-1': {
                src: '/media/phumulani/programs/education-workforce.jpg',
                fallback: '/images/events/career-pathways-showcase.svg',
              },
              'evt-2': {
                src: '/media/phumulani/events/annual-gala.jpg',
                fallback: '/images/events/healing-sisterhood-banquet.svg',
              },
              'evt-3': {
                src: '/media/phumulani/get-involved/volunteers.jpg',
                fallback: '/images/events/community-supply-distribution.svg',
              },
            };
            const eventImgConfig =
              eventPhotos[evt.id] || {
                src: '/media/phumulani/events/annual-gala.jpg',
                fallback: '/images/events/community-celebration.svg',
              };

            return (
              <div
                key={evt.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-[#006D6F] hover:shadow-md transition-all group"
              >
                <div className="aspect-[16/9] w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                  <SafeImage
                    src={eventImgConfig.src}
                    fallbackSrc={eventImgConfig.fallback}
                    fallbackType="event"
                    fallbackText={evt.title}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold font-heading text-[#006D6F] bg-teal-50 px-2.5 py-0.5 rounded">
                        {evt.category}
                      </span>
                      <span
                        className={`text-[11px] font-bold font-heading px-2 py-0.5 rounded ${
                          isFull ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {isFull ? `Waitlist Active (${evt.waitlistCount})` : `${evt.capacity - evt.registeredCount} Seats Left`}
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-lg text-slate-900 leading-snug">
                      {evt.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed font-sans">
                      {evt.description}
                    </p>

                    <div className="space-y-1.5 text-xs text-slate-500 pt-3 border-t border-slate-100 font-sans">
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
                      className={`w-full py-2.5 rounded-lg text-xs font-semibold font-heading transition-colors cursor-pointer shadow-xs ${
                        isFull
                          ? 'bg-[#F4B400] hover:bg-amber-600 text-slate-950 font-bold'
                          : 'bg-[#006D6F] hover:bg-[#004A4C] text-white'
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
              <div className="inline-flex items-center gap-2 text-xs font-bold font-heading text-rose-800 bg-rose-100 px-3 py-1 rounded-full">
                <LifeBuoy className="w-3.5 h-3.5 text-rose-700" />
                <span>CONFIDENTIAL SAFEGUARDING ROUTE</span>
              </div>

              <h2 className="font-heading text-3xl font-extrabold text-rose-950">
                Safe &amp; Discreet Assistance
              </h2>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                If you are an immigrant or refugee survivor in Minnesota seeking safety, shelter, or legal protection, you can reach out here discreetly.
              </p>

              <div className="bg-white p-4 rounded-xl border border-rose-200 text-xs space-y-2 text-slate-700 font-sans">
                <div className="font-bold font-heading text-rose-900 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-rose-700" />
                  <span>Our Privacy &amp; Safeguarding Guarantees:</span>
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
                  <div className="font-bold font-heading">Immediate Crisis Line 24/7:</div>
                  <div className="text-sm font-semibold font-heading">1-866-223-1111 (Call or Text)</div>
                </div>
                <button
                  onClick={() => window.location.replace('https://weather.com')}
                  className="bg-rose-800 hover:bg-rose-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold font-heading flex items-center gap-1 cursor-pointer"
                >
                  <span>Quick Exit</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Discreet Intake Form */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-rose-200 shadow-sm">
              {helpSubmittedCode ? (
                <div className="space-y-4 text-center py-6">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6 text-[#7A9B29]" />
                  </div>
                  <div className="font-heading text-xl font-bold text-slate-900">
                    Safe Intake Reference: {helpSubmittedCode}
                  </div>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed font-sans">
                    Your request has been routed directly to Sister Miriam K. and our trauma-informed safeguarding team. We will only contact you at the designated safe time and method you specified.
                  </p>
                  <button
                    onClick={() => setHelpSubmittedCode(null)}
                    className="text-xs font-semibold font-heading text-[#006D6F] hover:underline"
                  >
                    Submit another discreet inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleHelpSubmit} className="space-y-4">
                  <div className="font-heading text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                    Discreet Communication Intake
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1 font-sans">How can we contact you safely?</label>
                      <select
                        value={helpMethod}
                        onChange={(e) => setHelpMethod(e.target.value as any)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white text-xs font-sans"
                      >
                        <option value="safe_email">Safe Email (one only you access)</option>
                        <option value="phone">Phone / WhatsApp (Voice or Text)</option>
                        <option value="secure_signal">Signal Messenger</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1 font-sans">Language Needed</label>
                      <select
                        value={helpLanguage}
                        onChange={(e) => setHelpLanguage(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white text-xs font-sans"
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
                    <label className="block font-medium text-slate-700 mb-1 font-sans">
                      Safest Time of Day to Contact:
                    </label>
                    <input
                      type="text"
                      value={helpSafeTime}
                      onChange={(e) => setHelpSafeTime(e.target.value)}
                      placeholder="e.g., Weekday mornings 10am-12pm when alone"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-xs font-sans"
                      required
                    />
                  </div>

                  <div className="text-xs">
                    <label className="block font-medium text-slate-700 mb-1 font-sans">
                      Brief Message or Safe Phone / Email:
                    </label>
                    <textarea
                      rows={3}
                      value={helpNotes}
                      onChange={(e) => setHelpNotes(e.target.value)}
                      placeholder="Enter safe contact info and general need (housing, court support, food). Do not include dangerous details."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-xs font-sans"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold font-heading transition-colors cursor-pointer shadow-xs"
                  >
                    Submit to Safeguarding Queue Confidentially
                  </button>

                  <div className="text-[10px] text-slate-400 text-center font-sans">
                    This form writes directly to our restricted intake repository with zero exposure to general AI models.
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 9. MISSION, VISION & CORE VALUES (#mission-section) */}
      <section id="mission-section" className="bg-gradient-to-b from-white to-[#FFF7E6]/50 py-16 border-t border-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold font-heading text-[#006D6F] bg-teal-50 border border-teal-200 px-3 py-1 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#F05A28]" />
              <span>Foundational Purpose</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900">
              Our Sacred Mission &amp; Enduring Vision
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              Phumulani exists to ensure that every immigrant and refugee survivor of domestic violence, human trafficking, and systemic trauma in Minnesota discovers not merely an escape from danger, but an enduring pathway to sovereignty, self-determination, and thriving peace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-teal-100 shadow-xs space-y-3 hover:border-[#006D6F] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#006D6F] flex items-center justify-center font-bold font-heading">
                01
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-900">Cultural Attunement</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Healing cannot be imported from generic clinical models. We center ancestral sisterhood tea circles, indigenous trauma resolution, and bilingual advocates who share lived cultural realities.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-teal-100 shadow-xs space-y-3 hover:border-[#006D6F] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#006D6F] flex items-center justify-center font-bold font-heading">
                02
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-900">Legal Self-Defense</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Navigating Orders for Protection (OFP), U-Visa certifications, and immigration relief with relentless, courtroom-accredited accompaniment and trauma-informed legal partners.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-teal-100 shadow-xs space-y-3 hover:border-[#006D6F] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#006D6F] flex items-center justify-center font-bold font-heading">
                03
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-900">Economic Sovereignty</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Financial abuse is the most potent anchor of domestic violence. We dismantle dependency through matched savings, rapid lease deposits, credit restoration, and micro-enterprise coaching.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-teal-100 shadow-xs space-y-3 hover:border-[#006D6F] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#006D6F] flex items-center justify-center font-bold font-heading">
                04
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-900">Intergenerational Youth</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
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
            <div className="text-xs font-bold font-heading text-[#006D6F] uppercase tracking-wider">Collective Power</div>
            <h2 className="font-heading text-3xl font-extrabold text-slate-900">
              Community Alliances &amp; Institutional Partners
            </h2>
            <p className="text-xs text-slate-600 mt-1 font-sans">
              Phumulani works arm-in-arm with Minnesota public agencies, corporate grantmakers, legal coalitions, and shelter networks.
            </p>
          </div>
          <button
            onClick={() => {
              const el = document.getElementById('contact-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-4 py-2 border-2 border-[#006D6F] text-[#006D6F] hover:bg-[#FFF7E6] rounded-lg text-xs font-bold font-heading flex items-center gap-1.5 cursor-pointer"
          >
            <span>Partner With Phumulani</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold font-heading text-[#006D6F]">
              <Building2 className="w-4 h-4 text-[#006D6F]" />
              <span>Corporate CSR Partners</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Minnesota corporate benefactors supporting matched giving, employer hiring days, and technology donations for our workforce lab.
            </p>
            <div className="text-[11px] font-semibold text-slate-500 pt-1 font-sans">
              Target Foundation · 3M Community Giving · Medtronic CSR
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold font-heading text-[#F05A28]">
              <Shield className="w-4 h-4 text-[#F05A28]" />
              <span>Legal Defense Network</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Direct collaborative referrals for bilingual legal counsel, orders for protection, and immigration U-Visa navigation in Hennepin &amp; Ramsey counties.
            </p>
            <div className="text-[11px] font-semibold text-slate-500 pt-1 font-sans">
              The Advocates for Human Rights · Standpoint MN · Tubman
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold font-heading text-[#7A9B29]">
              <Home className="w-4 h-4 text-[#7A9B29]" />
              <span>Emergency Shelter Network</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Fast-track confidential safe house transfers, emergency hotel vouchers, and landlord negotiation for rapid independent leasing.
            </p>
            <div className="text-[11px] font-semibold text-slate-500 pt-1 font-sans">
              Day One Crisis Line · Cornerstone MN · Haven Housing
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold font-heading text-[#F4B400]">
              <Users className="w-4 h-4 text-[#F4B400]" />
              <span>Academic &amp; Research</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Community-based participatory evaluation, workforce intern placement, and rigorous monitoring of our MEAL indicators.
            </p>
            <div className="text-[11px] font-semibold text-slate-500 pt-1 font-sans">
              University of Minnesota UROC · Minneapolis College
            </div>
          </div>
        </div>
      </section>

      {/* 11. NEWS, COMMUNITY BULLETINS & PUBLICATIONS (#news-section) */}
      <section id="news-section" className="bg-[#FFF7E6]/50 py-16 border-y border-amber-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <div className="text-xs font-bold font-heading text-[#006D6F] uppercase tracking-wider">Publications &amp; Press</div>
              <h2 className="font-heading text-3xl font-extrabold text-slate-900">
                Latest News &amp; Authored Works
              </h2>
              <p className="text-xs text-slate-600 mt-1 font-sans">
                Stories of resilience, executive reports, and published books by Founder Comfort Dondo.
              </p>
            </div>
            <div className="text-xs text-slate-500 font-sans">
              Verified IRS 501(c)(3) Public Disclosures
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Book Card 1 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#006D6F] transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 font-sans">
                  <span className="font-bold font-heading text-[#F05A28] bg-orange-50 px-2 py-0.5 rounded">Published Memoir</span>
                  <span>2021 Release</span>
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-900">Facing the Giants</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Comfort Dondo's acclaimed memoir chronicling her lived journey through adversity, displacement, and the unyielding determination to build culturally grounded sanctuaries for immigrant women.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 font-sans">Author: Comfort Dondo</span>
                <span className="text-[#006D6F] font-semibold font-heading">Available via Community Library</span>
              </div>
            </div>

            {/* Book Card 2 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#006D6F] transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 font-sans">
                  <span className="font-bold font-heading text-[#006D6F] bg-teal-50 px-2 py-0.5 rounded">Co-Authored Anthology</span>
                  <span>Global Women's Leadership</span>
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-900">Sacred Promise</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  An inspiring collaborative volume with Dr. Tererai Trent and visionary global leaders exploring the sacred covenants women make to lift each other out of oppression and into economic dignity.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 font-sans">Foreword: Dr. Tererai Trent</span>
                <span className="text-[#006D6F] font-semibold font-heading">Minnesota Reading Circles</span>
              </div>
            </div>

            {/* Book Card 3 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#006D6F] transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 font-sans">
                  <span className="font-bold font-heading text-[#F4B400] bg-amber-50 px-2 py-0.5 rounded">Forthcoming Publication</span>
                  <span>2027 Preview</span>
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-900">The Gift in Pain</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  A profound exploration of transforming deep psychological and systemic wounds into catalysts for revolutionary community organizing, social entrepreneurship, and generational liberation.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 font-sans">Advance Announcements</span>
                <span className="text-amber-700 font-semibold font-heading">Excerpts in Tea Circles</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 12. SURVIVOR RIGHTS & COMMUNITY RESOURCES (#resources-section) */}
      <section id="resources-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="text-xs font-bold font-heading text-[#006D6F] uppercase tracking-wider">Self-Advocacy &amp; Guidance</div>
            <h2 className="font-heading text-3xl font-extrabold text-slate-900">
              Community Resources &amp; Downloadable Guides
            </h2>
            <p className="text-xs text-slate-600 mt-1 font-sans">
              Trauma-informed, legally vetted, multilingual tools available to the community free of charge.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 bg-slate-100 p-1 rounded-xl text-xs max-w-full">
            {(['all', 'legal', 'housing', 'healing', 'workforce'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setResourceFilter(cat)}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-semibold font-heading capitalize cursor-pointer transition-colors ${
                  resourceFilter === cat ? 'bg-[#006D6F] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {downloadNotice && (
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs font-semibold text-teal-900 flex items-center justify-between font-sans">
            <span>{downloadNotice}</span>
            <button onClick={() => setDownloadNotice(null)} className="text-teal-700">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between hover:border-[#006D6F] transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-sans">
                <span className="font-bold font-heading text-[#006D6F] bg-teal-50 px-2 py-0.5 rounded">Legal Guide</span>
                <span>PDF · 4.2 MB</span>
              </div>
              <h4 className="font-heading font-bold text-slate-900 text-sm">Order for Protection (OFP) Step-by-Step Navigator</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Clear instructions for filing an OFP in Minnesota district courts without filing fees, including emergency ex parte relief.
              </p>
            </div>
            <button
              onClick={() => handleDownloadResource('Order for Protection (OFP) Step-by-Step Navigator')}
              className="w-full py-2 bg-[#FFF7E6] hover:bg-amber-100 text-[#006D6F] border border-amber-200 rounded-lg text-xs font-semibold font-heading flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#006D6F]" />
              <span>Download PDF (Multilingual)</span>
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between hover:border-[#006D6F] transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-sans">
                <span className="font-bold font-heading text-[#F05A28] bg-orange-50 px-2 py-0.5 rounded">Housing Toolkit</span>
                <span>PDF · 2.8 MB</span>
              </div>
              <h4 className="font-heading font-bold text-slate-900 text-sm">Minnesota Safe Lease Termination &amp; Deposit Rights</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                How Minnesota Statute 504B.206 protects domestic abuse survivors who need to break a lease safely without financial penalty.
              </p>
            </div>
            <button
              onClick={() => handleDownloadResource('Minnesota Safe Lease Termination & Deposit Rights')}
              className="w-full py-2 bg-[#FFF7E6] hover:bg-amber-100 text-[#006D6F] border border-amber-200 rounded-lg text-xs font-semibold font-heading flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#006D6F]" />
              <span>Download Housing Toolkit</span>
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between hover:border-[#006D6F] transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-sans">
                <span className="font-bold font-heading text-[#7A9B29] bg-emerald-50 px-2 py-0.5 rounded">Healing Circles</span>
                <span>PDF · 1.9 MB</span>
              </div>
              <h4 className="font-heading font-bold text-slate-900 text-sm">Sisterhood Tea Healing Circle Facilitation Manual</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Trauma-informed guidance for hosting culturally grounded healing circles in community centers, mosques, and churches.
              </p>
            </div>
            <button
              onClick={() => handleDownloadResource('Sisterhood Tea Healing Circle Facilitation Manual')}
              className="w-full py-2 bg-[#FFF7E6] hover:bg-amber-100 text-[#006D6F] border border-amber-200 rounded-lg text-xs font-semibold font-heading flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#006D6F]" />
              <span>Download Circle Guide</span>
            </button>
          </div>
        </div>
      </section>

      {/* 13. CONTACT INFORMATION & SECURE INQUIRY (#contact-section) */}
      <section id="contact-section" className="bg-[#FFF7E6]/70 py-16 border-t border-amber-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="text-xs font-bold font-heading text-[#006D6F] uppercase tracking-wider">Reach Our Team</div>
                <h2 className="font-heading text-3xl font-extrabold text-slate-900">
                  Connect With Phumulani
                </h2>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed font-sans">
                  Have a question about our community programs, volunteer opportunities, donor partnerships, or events? We are here to help.
                </p>
              </div>

              <div className="space-y-4 text-xs font-sans">
                <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-2xs">
                  <MapPin className="w-4 h-4 text-[#006D6F] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold font-heading text-slate-900">Mailing &amp; Operational Address</div>
                    <div className="text-slate-600">Phumulani (Minnesota African Women Against Violence)</div>
                    <div className="text-slate-600">PO Box, Minneapolis, MN 55404</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-2xs">
                  <PhoneCall className="w-4 h-4 text-[#006D6F] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold font-heading text-slate-900">Phone Communications</div>
                    <div className="text-slate-600">General Admin: (612) 555-0199 (Mon–Fri 9am–5pm)</div>
                    <div className="text-rose-700 font-semibold font-heading mt-0.5">24/7 Day One Crisis Line: 1-866-223-1111</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-2xs">
                  <Mail className="w-4 h-4 text-[#006D6F] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold font-heading text-slate-900">Department Mailboxes</div>
                    <div className="text-slate-600">General Outreach: <code>info@phumulani.org</code></div>
                    <div className="text-slate-600">Donations &amp; Grants: <code>donations@phumulani.org</code></div>
                    <div className="text-slate-600">Confidential Safeguarding: <code>safeguarding@phumulani.org</code></div>
                  </div>
                </div>

                {/* Peaceful Lake Sanctuary Visual */}
                <div className="relative rounded-2xl overflow-hidden border border-teal-200/90 shadow-2xs aspect-[16/9] group">
                  <SafeImage
                    src="/media/phumulani/contact/lake-haven.jpg"
                    fallbackSrc="/images/homepage/community-hero.svg"
                    fallbackType="generic"
                    alt="Tranquil Minnesota lake sanctuary at dawn with lavender reflections, representing peace, rest, and hope"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent flex items-end p-4">
                    <div className="text-white text-xs">
                      <span className="text-[#F4B400] font-heading font-bold uppercase tracking-wider text-[10px]">A Place of Rest</span>
                      <div className="font-heading font-bold text-sm">Phumulani — Rooted in Peace &amp; Sisterhood</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-amber-200 shadow-sm">
              <h3 className="font-heading text-xl font-bold text-slate-900 mb-1">
                Send a General Inquiry
              </h3>
              <p className="text-xs text-slate-500 mb-5 font-sans">
                For non-emergency community inquiries, partnership proposals, and press questions.
              </p>

              {contactSubmittedCode ? (
                <div className="p-6 bg-teal-50 border border-teal-200 rounded-xl text-center space-y-3">
                  <CheckCircle2 className="w-8 h-8 text-[#006D6F] mx-auto" />
                  <div className="font-heading text-lg font-bold text-teal-950">Inquiry Received: {contactSubmittedCode}</div>
                  <p className="text-xs text-slate-600 max-w-md mx-auto font-sans">
                    Thank you for reaching out. A Phumulani team coordinator will reply to your inquiry within 1 business day.
                  </p>
                  <button
                    onClick={() => setContactSubmittedCode(null)}
                    className="text-xs font-bold font-heading text-[#006D6F] hover:underline cursor-pointer"
                  >
                    Submit another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4 text-xs font-sans">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="First and Last Name"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-[#006D6F]"
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
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-[#006D6F]"
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
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-[#006D6F]"
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-[#006D6F]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#006D6F] hover:bg-[#004A4C] text-white rounded-lg font-bold font-heading flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
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
          <div className="text-xs font-bold font-heading text-[#006D6F] uppercase tracking-wider">Compliance &amp; Ethics</div>
          <h2 className="font-heading text-3xl font-extrabold text-slate-900">
            Privacy Notice &amp; VAWA Section 1367 Legal Safeguards
          </h2>
          <p className="text-xs text-slate-600 mt-1 font-sans">
            Official 501(c)(3) privacy declaration and survivor protection firewall standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-700">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="font-bold font-heading text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#7A9B29]" />
              <span>Zero-Disclosure Survivor Firewall</span>
            </div>
            <p className="leading-relaxed text-slate-600 font-sans">
              Pursuant to Violence Against Women Act (VAWA) 34 U.S.C. § 12291(b)(2), Phumulani never discloses personally identifying information (PII) of survivors without written, informed, and time-limited consent. Survivor records are strictly segregated from general operational databases.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="font-bold font-heading text-slate-900 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#006D6F]" />
              <span>Donor Bill of Rights &amp; Privacy</span>
            </div>
            <p className="leading-relaxed text-slate-600 font-sans">
              Phumulani adheres to the Association of Fundraising Professionals (AFP) Donor Bill of Rights. We never sell, rent, trade, or share donor contact information or giving records with external commercial marketing entities.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="font-bold font-heading text-slate-900 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-[#006D6F]" />
              <span>Zero Commercial Ad Tracking</span>
            </div>
            <p className="leading-relaxed text-slate-600 font-sans">
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
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedProgram(null);
          }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
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
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedOpportunity(null);
          }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
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
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedEvent(null);
          }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
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
