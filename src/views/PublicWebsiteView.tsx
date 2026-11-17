/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Public Website & CMS (Application 1)
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db } from '../services/db';
import { Program, VolunteerOpportunity, Campaign, EventItem, User } from '../types';
import { getAssetUrl } from '../utils/assetPath';
import {
  ShieldCheck,
  Heart,
  HandHeart,
  HeartHandshake,
  UsersRound,
  CalendarDays,
  BookOpen,
  ArrowRight,
  LifeBuoy,
  CheckCircle2,
  LockKeyhole,
  ChevronRight,
  Sparkles,
  ExternalLink,
  PhoneCall,
  Clock,
  MapPin,
  Sprout,
  GraduationCap,
  House,
  Layers3,
  AlertTriangle,
  Mail,
  Globe,
  Building2,
  Download,
  Send,
  LibraryBig,
  Accessibility,
} from 'lucide-react';

import { FounderSection } from '../components/FounderSection';
import { SafeImage } from '../components/SafeImage';
import { BrandPatternDivider } from '../components/branding/BrandPatternDivider';
import { CulturalGeometricAccent } from '../components/branding/CulturalGeometricAccent';
import { RevealSection, RevealItem, CountUpMetric } from '../components/ui/MotionPrimitives';

const FOUNDER_IMAGE = '/images/leadership/phumulani-founder-official.png';
const HERO_IMAGE = '/images/home/phumulani-homepage-hero.webp';

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

  // Controlled Public Resources Registry (Verified Assets)
  const PUBLIC_RESOURCES = [
    {
      id: 'res-ofp-001',
      title: 'Order for Protection (OFP) Step-by-Step Navigator',
      category: 'legal' as const,
      tag: 'Legal Guide',
      filename: 'order-for-protection-navigator.pdf',
      downloadUrl: '/resources/order-for-protection-navigator.pdf',
      fileSize: '2.3 KB',
      format: 'PDF',
      description: 'Clear instructions for filing an OFP in Minnesota district courts without filing fees under Minn. Stat. § 518B.01, including emergency ex parte relief.',
      statutoryReference: 'Minn. Stat. § 518B.01',
    },
    {
      id: 'res-lease-002',
      title: 'Minnesota Safe Lease Termination & Deposit Rights',
      category: 'housing' as const,
      tag: 'Housing Toolkit',
      filename: 'minnesota-safe-lease-termination-toolkit.pdf',
      downloadUrl: '/resources/minnesota-safe-lease-termination-toolkit.pdf',
      fileSize: '2.2 KB',
      format: 'PDF',
      description: 'How Minnesota Statute 504B.206 protects domestic abuse survivors who need to break a lease safely without financial penalty, including required notices.',
      statutoryReference: 'Minn. Stat. § 504B.206',
    },
    {
      id: 'res-tea-003',
      title: 'Sisterhood Tea Healing Circle Facilitation Manual',
      category: 'healing' as const,
      tag: 'Healing Circles',
      filename: 'tea-healing-circle-facilitation-manual.pdf',
      downloadUrl: '/resources/tea-healing-circle-facilitation-manual.pdf',
      fileSize: '2.4 KB',
      format: 'PDF',
      description: 'Trauma-informed guidance for hosting culturally grounded healing circles in community centers, mosques, and churches.',
      methodology: 'Tea Healing Circle Model by Comfort Dondo',
    },
    {
      id: 'res-safe-004',
      title: 'Survivor Safety Planning & Digital Confidentiality Guide',
      category: 'legal' as const,
      tag: 'Safety Planning',
      filename: 'survivor-safety-planning-guide.pdf',
      downloadUrl: '/resources/survivor-safety-planning-guide.pdf',
      fileSize: '2.2 KB',
      format: 'PDF',
      description: 'Actionable steps for discreet communications, tech safety, protective relocation, and day-one emergency protocols.',
    },
  ];

  // Donation Form State & Real Provider Detection
  const [gatewayConfig, setGatewayConfig] = useState<{
    status: 'CONNECTED' | 'NOT_CONNECTED';
    liveCheckoutEnabled: boolean;
  }>({
    status: 'NOT_CONNECTED',
    liveCheckoutEnabled: false,
  });
  const [donationAmount, setDonationAmount] = useState<number>(100);
  const [donationFrequency, setDonationFrequency] = useState<'one_time' | 'monthly'>('one_time');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaigns[0]?.id || '');
  const [donorName, setDonorName] = useState(currentUser.role === 'donor' ? currentUser.name : '');
  const [donorEmail, setDonorEmail] = useState(currentUser.role === 'donor' ? currentUser.email : '');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isDonating, setIsDonating] = useState(false);
  const [donationError, setDonationError] = useState<string | null>(null);
  const [pledgeConfirmed, setPledgeConfirmed] = useState<{
    reference: string;
    amount: number;
    campaignTitle: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/payments/config')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.liveCheckoutEnabled === 'boolean') {
          setGatewayConfig(data);
        }
      })
      .catch(() => {
        // Safe staging fallback
      });
  }, []);

  const isVisitor = currentUser.role === 'visitor' || currentUser.role === 'PUBLIC_VISITOR';

  // Event RSVP Modal
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [rsvpName, setRsvpName] = useState(isVisitor ? '' : currentUser.name);
  const [rsvpEmail, setRsvpEmail] = useState(isVisitor ? '' : currentUser.email);
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [rsvpFeedback, setRsvpFeedback] = useState<{ status: 'confirmed' | 'waitlist'; message: string } | null>(null);

  // Discreet Get Help State (Confidential Safeguarding)
  const [helpMethod, setHelpMethod] = useState<'safe_email' | 'phone' | 'secure_signal'>('safe_email');
  const [helpUrgency, setHelpUrgency] = useState<'immediate_safety' | 'within_24h' | 'general_support'>('within_24h');
  const [helpLanguage, setHelpLanguage] = useState('Somali');
  const [helpSafeTime, setHelpSafeTime] = useState('Morning between 9am - 12pm');
  const [helpNotes, setHelpNotes] = useState('');
  const [isSubmittingHelp, setIsSubmittingHelp] = useState(false);
  const [helpError, setHelpError] = useState<string | null>(null);
  const [helpSubmittedCode, setHelpSubmittedCode] = useState<string | null>(null);

  // General Contact Form State
  const [contactName, setContactName] = useState(isVisitor ? '' : (currentUser.name || ''));
  const [contactEmail, setContactEmail] = useState(isVisitor ? '' : (currentUser.email || ''));
  const [contactDepartment, setContactDepartment] = useState('General Inquiries');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactRoutedTo, setContactRoutedTo] = useState<string | null>(null);
  const [contactSubmittedCode, setContactSubmittedCode] = useState<string | null>(null);
  const [contactDeliveryStatus, setContactDeliveryStatus] = useState<'EMAIL_QUEUED' | 'EMAIL_SENT' | 'EMAIL_DELIVERY_FAILED' | null>(null);
  const [contactDeliveryNotice, setContactDeliveryNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCampaignId && campaigns.length > 0) {
      setSelectedCampaignId(campaigns[0].id);
    }
  }, [campaigns, selectedCampaignId]);

  useEffect(() => {
    const visitor = currentUser.role === 'visitor' || currentUser.role === 'PUBLIC_VISITOR';
    if (!visitor) {
      setContactName((prev) => prev || currentUser.name || '');
      setContactEmail((prev) => prev || currentUser.email || '');
      setRsvpName((prev) => prev || currentUser.name || '');
      setRsvpEmail((prev) => prev || currentUser.email || '');
    }
  }, [currentUser.id, currentUser.role, currentUser.name, currentUser.email]);

  // Resources Category Filter
  const [resourceFilter, setResourceFilter] = useState<'all' | 'legal' | 'housing' | 'healing' | 'workforce'>('all');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Handle Contact Submit with verified backend delivery
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContact(true);
    setContactError(null);

    try {
      const res = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          department: contactDepartment,
          subject: contactSubject,
          message: contactMessage,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to submit inquiry.');
      }
      setContactSubmittedCode(data.trackingId);
      setContactRoutedTo(data.routedTo);
      setContactDeliveryStatus(
        data.emailDeliveryStatus ||
          (data.emailSent ? 'EMAIL_SENT' : data.emailDeliveryFailed ? 'EMAIL_DELIVERY_FAILED' : 'EMAIL_QUEUED')
      );
      setContactDeliveryNotice(data.message || null);
      setContactMessage('');
      setContactSubject('');
    } catch (err: any) {
      setContactError(err.message || 'Failed to submit inquiry. Please try again or email info@phumulani.org directly.');
    } finally {
      setIsSubmittingContact(false);
    }
  };

  // Real Resource Download Handler
  const handleDownloadResource = (resource: typeof PUBLIC_RESOURCES[0]) => {
    try {
      const url = getAssetUrl(resource.downloadUrl);
      const link = document.createElement('a');
      link.href = url;
      link.download = resource.filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadNotice(`Downloaded authentic resource: "${resource.title}".`);
      setTimeout(() => setDownloadNotice(null), 4000);
    } catch {
      setDownloadNotice(`Download unavailable. Please contact info@phumulani.org to receive this guide directly.`);
      setTimeout(() => setDownloadNotice(null), 4000);
    }
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

  // Handle Donation & Verified Payment Flow
  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (donationAmount <= 0) {
      setDonationError('Donation amount must be at least $1.00');
      return;
    }
    if (!donorEmail || !donorEmail.includes('@')) {
      setDonationError('A valid email address is required for donation or pledge records.');
      return;
    }

    setIsDonating(true);
    setDonationError(null);
    const campaign = campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];

    try {
      if (gatewayConfig.liveCheckoutEnabled) {
        // Authenticated live checkout session
        const idempotencyKey = `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const res = await fetch('/api/payments/checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            donorName: isAnonymous ? 'Anonymous Supporter' : (donorName || 'Generous Supporter'),
            donorEmail,
            amountDollars: donationAmount,
            programDesignation: campaign.title,
            campaignId: campaign.id,
            isRecurring: donationFrequency === 'monthly',
            frequency: donationFrequency === 'monthly' ? 'MONTHLY' : 'ONE_TIME',
            idempotencyKey,
          }),
        });
        const data = await res.json();
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
          return;
        }
        if (data.status === 'BLOCKED_GATEWAY_NOT_CONNECTED') {
          setGatewayConfig({ status: 'NOT_CONNECTED', liveCheckoutEnabled: false });
        } else {
          throw new Error(data.error || 'Payment gateway returned an unexpected state.');
        }
      }

      // If live merchant gateway is not configured, capture genuine donor pledge (NO fake receipt!)
      const pledgeRes = await fetch('/api/payments/pledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName: isAnonymous ? 'Anonymous Supporter' : (donorName || 'Generous Supporter'),
          donorEmail,
          amountDollars: donationAmount,
          frequency: donationFrequency,
          campaignId: campaign.id,
          campaignTitle: campaign.title,
          isAnonymous,
        }),
      });
      const pledgeData = await pledgeRes.json();
      if (!pledgeData.success) {
        throw new Error(pledgeData.error || 'Failed to record pledge.');
      }

      setPledgeConfirmed({
        reference: pledgeData.pledgeReference,
        amount: donationAmount,
        campaignTitle: campaign.title,
        message: pledgeData.message,
      });
    } catch (err: any) {
      setDonationError(err.message || 'Unable to process donation pledge. Please contact donations@phumulani.org.');
    } finally {
      setIsDonating(false);
    }
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

  // Handle Discreet Help Request with AES-256-GCM Server Encryption
  const handleHelpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingHelp(true);
    setHelpError(null);

    try {
      const res = await fetch('/api/intake/restricted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urgencyLevel: helpUrgency,
          preferredContactMethod: helpMethod,
          languageNeeded: helpLanguage,
          safeTimeToContact: helpSafeTime,
          notes: helpNotes,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Submission failed.');
      }
      setHelpSubmittedCode(data.anonymousCode);
      setHelpNotes('');
    } catch (err: any) {
      setHelpError(err.message || 'Unable to process confidential intake. For immediate emergency safety, please call the Minnesota Day One Crisis Line at 1-866-223-1111 (24/7).');
    } finally {
      setIsSubmittingHelp(false);
    }
  };

  return (
    <div className="space-y-16 pb-20 font-sans min-w-0 overflow-x-clip">
      {/* 1. HERO BANNER */}
      <section className="relative overflow-hidden bg-phumulani-cream pt-10 sm:pt-14 pb-14 sm:pb-18 border-b border-phumulani-charcoal/12">
        {/* Culturally grounded low-contrast geometric lattice background accent */}
        <div className="hidden md:block absolute right-0 bottom-0 w-[520px] h-[410px] pointer-events-none">
          <CulturalGeometricAccent variant="hero-lattice" className="w-full h-full" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* LEFT COLUMN: Mission & Headline (~58%) */}
            <div className="lg:col-span-7 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wider uppercase text-phumulani-earth font-heading"
              >
                <span>Minnesota 501(c)(3)</span>
                <span aria-hidden="true" className="text-phumulani-charcoal/50">
                  ·
                </span>
                <span>The Voice of Immigrants &amp; Refugees</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.58, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="font-heading font-extrabold text-phumulani-charcoal tracking-tight leading-[1.12] text-3xl sm:text-4xl lg:text-5xl xl:text-[3.25rem] max-w-2xl text-balance"
              >
                Empowering Immigrant &amp; Refugee Survivors{' '}
                <span className="text-phumulani-earth">Toward Healing</span>{' '}
                <span className="text-phumulani-earth">&amp; Autonomy</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.64, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
                className="text-base sm:text-lg text-phumulani-charcoal leading-relaxed font-sans font-normal max-w-2xl"
              >
                To empower immigrant and refugee survivors through culturally specific advocacy, safety, housing stability, education, and economic opportunity.
              </motion.p>

              {/* Action Controls */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2"
              >
                <button
                  onClick={() => {
                    document.getElementById('donate-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="min-h-[44px] h-12 bg-phumulani-earth hover:bg-phumulani-charcoal text-white px-5 sm:px-6 rounded-lg text-xs sm:text-sm font-heading font-bold shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-phumulani-orange group whitespace-nowrap"
                >
                  <Heart className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.75} aria-hidden="true" />
                  <span>Support Our Mission</span>
                </button>

                <button
                  onClick={() => {
                    document.getElementById('get-involved-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="min-h-[44px] h-12 bg-white hover:bg-phumulani-gold/25 text-phumulani-charcoal border border-phumulani-charcoal/20 px-5 sm:px-6 rounded-lg text-xs sm:text-sm font-heading font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-phumulani-earth whitespace-nowrap"
                >
                  <UsersRound className="w-4 h-4 text-phumulani-earth" strokeWidth={1.75} aria-hidden="true" />
                  <span>Become a Volunteer or Mentor</span>
                </button>

                <button
                  onClick={() => {
                    document.getElementById('get-help-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="min-h-[44px] h-12 bg-transparent hover:bg-white text-phumulani-earth border border-phumulani-earth/35 px-4 sm:px-5 rounded-lg text-xs sm:text-sm font-heading font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-phumulani-earth whitespace-nowrap"
                >
                  <LifeBuoy className="w-4 h-4 text-phumulani-earth" strokeWidth={1.75} aria-hidden="true" />
                  <span>Need Help? Safe Routing</span>
                </button>
              </motion.div>
            </div>

            {/* RIGHT COLUMN: Official Photography & Founder Spotlight Card (~42%) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5"
            >
              <div className="bg-white rounded-2xl border border-phumulani-charcoal/12 shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                {/* Official Community Hero Photography */}
                <div className="relative aspect-[4/3] bg-phumulani-charcoal overflow-hidden border-b border-phumulani-charcoal/10 group">
                  <SafeImage
                    src={HERO_IMAGE}
                    fallbackSrc="/media/homepage/phumulani-homepage-hero.webp"
                    fallbackType="hero"
                    alt="Three empowered women from diverse immigrant and refugee backgrounds standing in solidarity in a sunlit community center overlooking the Minneapolis skyline"
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-phumulani-charcoal/85 via-phumulani-charcoal/15 to-transparent pointer-events-none flex items-end p-4">
                    <span className="text-white font-heading font-semibold text-xs tracking-wide">
                      Culturally Grounded Sanctuary · Minneapolis, MN
                    </span>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  {/* Founder Identification */}
                  <div className="flex items-center justify-between border-b border-phumulani-charcoal/10 pb-3 gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <SafeImage
                        src={FOUNDER_IMAGE}
                        fallbackType="founder"
                        initials="CD"
                        alt="Phumulani Foundation Founder — Official Corporate Portrait"
                        className="w-12 h-12 rounded-xl object-contain bg-white border border-phumulani-charcoal/15 shrink-0"
                        loading="lazy"
                        decoding="async"
                        width={1254}
                        height={1254}
                      />
                      <div className="min-w-0">
                        <div className="font-heading font-bold text-base text-phumulani-charcoal truncate">
                          Comfort Dondo
                        </div>
                        <div className="text-xs text-phumulani-earth font-semibold font-heading truncate">
                          Founder &amp; Executive Director
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        document.getElementById('founder-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-xs font-semibold font-heading text-phumulani-earth hover:text-phumulani-orange hover:underline underline-offset-4 flex items-center gap-0.5 cursor-pointer shrink-0 group/link focus-visible:ring-2 focus-visible:ring-phumulani-earth rounded"
                    >
                      <span>Story &amp; Video</span>
                      <ChevronRight
                        className="w-3.5 h-3.5 transition-transform duration-150 group-hover/link:translate-x-0.5"
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  <p className="text-xs sm:text-[13.5px] text-phumulani-charcoal leading-relaxed font-display-serif italic py-1">
                    &ldquo;Healing is finding the community, protection, and economic independence to stand tall again. At Phumulani, every survivor is met with trauma-informed care and unwavering sisterhood.&rdquo;
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-phumulani-cream p-3.5 rounded-xl border border-phumulani-charcoal/12">
                      <div className="font-heading text-lg font-extrabold text-phumulani-earth tabular-nums">
                        <CountUpMetric value={1450} suffix="+" immediate />
                      </div>
                      <div className="text-[11px] text-phumulani-charcoal mt-0.5 font-medium">
                        Survivors &amp; Families
                      </div>
                    </div>
                    <div className="bg-phumulani-cream p-3.5 rounded-xl border border-phumulani-charcoal/12">
                      <div className="font-heading text-lg font-extrabold text-phumulani-earth tabular-nums">
                        <CountUpMetric value={480} prefix="$" suffix="k+" formatWithCommas={false} immediate />
                      </div>
                      <div className="text-[11px] text-phumulani-charcoal mt-0.5 font-medium">
                        Emergency Housing Aid
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-phumulani-cream/70 border border-phumulani-charcoal/12 rounded-xl flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2 text-phumulani-charcoal">
                      <ShieldCheck className="w-4 h-4 text-phumulani-earth shrink-0" strokeWidth={1.75} aria-hidden="true" />
                      <span className="font-medium text-[11px]">Strict Survivor Confidentiality</span>
                    </div>
                    <span className="text-[10px] text-phumulani-earth font-mono font-semibold inline-flex items-center gap-1 shrink-0 tabular-nums">
                      <LockKeyhole className="w-3 h-3" strokeWidth={1.75} aria-hidden="true" />
                      <span>VAWA § 1367</span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 1.5 OFFICIAL CORE VALUES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealSection className="text-center max-w-2xl mx-auto mb-9 space-y-2.5">
          <div className="text-xs font-bold text-phumulani-earth font-heading uppercase tracking-wider">
            Brand Foundations
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-phumulani-charcoal">
            Our Core Values
          </h2>
          <CulturalGeometricAccent variant="section-crest" />
          <p className="text-xs sm:text-sm text-phumulani-charcoal leading-relaxed">
            A unified framework for advocacy, safety, empowerment, and dignity for immigrants and refugees.
          </p>
        </RevealSection>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            {
              icon: ShieldCheck,
              title: 'Safety & Protection',
              desc: 'Confidential sanctuary & legal accompaniment',
            },
            {
              icon: House,
              title: 'Stable Housing',
              desc: 'Emergency bridge funding & rapid leasing',
            },
            {
              icon: Sprout,
              title: 'Economic Empowerment',
              desc: 'Financial literacy & business ownership',
            },
            {
              icon: GraduationCap,
              title: 'Education & Workforce',
              desc: 'Job readiness, certifications & tutoring',
            },
            {
              icon: HeartHandshake,
              title: 'Cultural Belonging',
              desc: 'Sisterhood tea circles & lived heritage',
            },
            {
              icon: UsersRound,
              title: 'Dignity & Autonomy',
              desc: 'Trauma-informed self-determination',
            },
          ].map((val, idx) => {
            const Icon = val.icon;
            return (
              <RevealItem key={val.title} index={idx}>
                <div className="h-full bg-white p-4 sm:p-5 rounded-2xl border border-phumulani-charcoal/12 hover:border-phumulani-earth/40 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col items-center">
                  <div className="w-11 h-11 rounded-xl bg-phumulani-cream border border-phumulani-charcoal/12 flex items-center justify-center mb-3 shadow-2xs">
                    <Icon className="w-5 h-5 text-phumulani-earth" strokeWidth={1.75} aria-hidden="true" />
                  </div>
                  <h3 className="font-heading font-bold text-sm text-phumulani-charcoal leading-snug">
                    {val.title}
                  </h3>
                  <p className="text-[11px] text-phumulani-charcoal mt-1.5 leading-relaxed">
                    {val.desc}
                  </p>
                </div>
              </RevealItem>
            );
          })}
        </div>
      </section>

      {/* 2. STATS & COMMUNITY IMPACT SUMMARY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealSection className="bg-white rounded-2xl border border-phumulani-charcoal/12 shadow-xs overflow-hidden">
          <BrandPatternDivider variant="subtle" height={4} />
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-y lg:divide-y-0 lg:divide-x divide-phumulani-charcoal/10">
              <div className="p-2">
                <div className="font-heading text-3xl sm:text-4xl font-extrabold text-phumulani-earth tabular-nums">
                  <CountUpMetric value={1450} suffix="+" />
                </div>
                <div className="text-xs text-phumulani-charcoal font-medium mt-1.5">
                  Families Supported Since Inception
                </div>
              </div>
              <div className="p-2 pt-6 lg:pt-2">
                <div className="font-heading text-3xl sm:text-4xl font-extrabold text-phumulani-earth tabular-nums">
                  <CountUpMetric value={480000} prefix="$" suffix="+" />
                </div>
                <div className="text-xs text-phumulani-charcoal font-medium mt-1.5">
                  Direct Emergency &amp; Housing Aid Distributed
                </div>
              </div>
              <div className="p-2 pt-6 lg:pt-2">
                <div className="font-heading text-3xl sm:text-4xl font-extrabold text-phumulani-earth tabular-nums">
                  <CountUpMetric value={92} suffix="%" formatWithCommas={false} />
                </div>
                <div className="text-xs text-phumulani-charcoal font-medium mt-1.5">
                  Workforce Graduate Job Placement Rate
                </div>
              </div>
              <div className="p-2 pt-6 lg:pt-2">
                <div className="font-heading text-3xl sm:text-4xl font-extrabold text-phumulani-earth tabular-nums">
                  <CountUpMetric value={100} suffix="%" formatWithCommas={false} />
                </div>
                <div className="text-xs text-phumulani-charcoal font-medium mt-1.5">
                  Dedicated to Culturally Specific Survivor Healing
                </div>
              </div>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* 2.5 FOUNDER LEGACY, ORIGINAL VIDEOS & PUBLICATIONS */}
      <FounderSection />

      {/* 3. SIX CORE PROGRAMS */}
      <section id="programs-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <RevealSection className="space-y-3 text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-bold text-phumulani-earth font-heading uppercase tracking-wider">
            What We Do
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-phumulani-charcoal">
            Six Comprehensive Community Programs
          </h2>
          <CulturalGeometricAccent variant="section-crest" />
          <p className="text-sm text-phumulani-charcoal font-sans">
            Grounded in trauma-informed care and culturally responsive support across Minnesota.
          </p>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((prog, idx) => {
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
              <RevealItem key={prog.id} index={idx} className="flex">
                <div className="bg-white rounded-2xl border border-phumulani-charcoal/12 overflow-hidden flex flex-col justify-between w-full hover:border-phumulani-earth/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group">
                  {/* Authentic Program Artwork */}
                  <div className="aspect-[4/3] w-full bg-phumulani-cream overflow-hidden border-b border-phumulani-charcoal/10">
                    <SafeImage
                      src={progMedia.src}
                      fallbackSrc={progMedia.fallback}
                      fallbackType="program"
                      fallbackText={prog.name}
                      alt={progMedia.alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-phumulani-earth text-xs font-bold font-heading uppercase tracking-wider">
                        {prog.slug === 'advocacy' && <ShieldCheck className="w-4 h-4 text-phumulani-earth shrink-0" strokeWidth={1.75} aria-hidden="true" />}
                        {prog.slug === 'workforce' && <GraduationCap className="w-4 h-4 text-phumulani-earth shrink-0" strokeWidth={1.75} aria-hidden="true" />}
                        {prog.slug === 'financial_literacy' && <Sprout className="w-4 h-4 text-phumulani-earth shrink-0" strokeWidth={1.75} aria-hidden="true" />}
                        {prog.slug === 'mentorship' && <UsersRound className="w-4 h-4 text-phumulani-earth shrink-0" strokeWidth={1.75} aria-hidden="true" />}
                        {prog.slug === 'housing' && <House className="w-4 h-4 text-phumulani-earth shrink-0" strokeWidth={1.75} aria-hidden="true" />}
                        {prog.slug === 'entrepreneurship' && <Layers3 className="w-4 h-4 text-phumulani-earth shrink-0" strokeWidth={1.75} aria-hidden="true" />}
                        <span>{prog.tagline || 'Core Program'}</span>
                      </div>

                      <div>
                        <h3 className="font-heading text-lg font-bold text-phumulani-charcoal group-hover:text-phumulani-earth transition-colors">
                          {prog.name}
                        </h3>
                        <p className="text-xs text-phumulani-charcoal mt-2 leading-relaxed font-sans">
                          {prog.description}
                        </p>
                      </div>

                      <div className="pt-2 space-y-1.5 border-t border-phumulani-charcoal/10">
                        <div className="text-[11px] font-semibold font-heading text-phumulani-charcoal">
                          Key Services
                        </div>
                        <ul className="text-[11px] text-phumulani-charcoal space-y-1 font-sans">
                          {prog.keyServices.slice(0, 3).map((s, idx2) => (
                            <li key={idx2} className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-phumulani-earth shrink-0" strokeWidth={1.75} aria-hidden="true" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-phumulani-charcoal/10 flex items-center justify-between text-xs">
                      <span className="text-phumulani-charcoal font-medium tabular-nums">
                        {prog.beneficiariesCount}+ Supported
                      </span>
                      <button
                        onClick={() => setSelectedProgram(prog)}
                        className="font-semibold font-heading text-phumulani-earth hover:text-phumulani-orange flex items-center gap-1 cursor-pointer group/btn focus-visible:ring-2 focus-visible:ring-phumulani-earth rounded"
                      >
                        <span>Details &amp; Referral</span>
                        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" strokeWidth={1.75} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </RevealItem>
            );
          })}
        </div>
      </section>

      {/* 4. FOUNDER STORY & ABOUT PHUMULANI */}
      <section id="about-section" className="bg-white py-16 border-y border-phumulani-charcoal/12 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-phumulani-cream rounded-2xl p-6 border border-phumulani-charcoal/12 shadow-xs space-y-4">
                <div className="flex items-center gap-4">
                  <SafeImage
                    src={FOUNDER_IMAGE}
                    fallbackType="founder"
                    initials="CD"
                    alt="Phumulani Foundation Founder — Official Corporate Portrait"
                    className="w-20 h-20 rounded-2xl object-contain bg-white border border-phumulani-charcoal/15 shadow-xs shrink-0"
                    loading="lazy"
                    decoding="async"
                    width={1254}
                    height={1254}
                  />
                  <div>
                    <div className="font-heading text-2xl font-bold text-phumulani-charcoal leading-tight">
                      Comfort Dondo
                    </div>
                    <div className="text-xs font-semibold font-heading text-phumulani-earth mt-0.5">
                      Founder &amp; Executive Director
                    </div>
                    <div className="text-[11px] text-phumulani-charcoal mt-1 font-sans">
                      Author · Advocate · Minnesota 501(c)(3)
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-[13px] text-phumulani-charcoal leading-relaxed italic font-display-serif py-2 border-y border-phumulani-charcoal/10">
                  &ldquo;Healing is not merely surviving an ordeal—it is finding the courage, community, and economic standing to dream boldly again. Phumulani exists so no immigrant survivor walks alone.&rdquo;
                </p>

                <div className="pt-2">
                  <div className="text-[11px] font-bold font-heading text-phumulani-charcoal uppercase tracking-wider mb-2">
                    Authored Publications
                  </div>
                  <div className="space-y-2 text-xs text-phumulani-charcoal font-sans">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-phumulani-earth shrink-0" strokeWidth={1.75} aria-hidden="true" />
                      <span className="font-medium text-phumulani-charcoal">Facing the Giants</span>
                      <span className="text-[10px] text-phumulani-charcoal">· 2021 Memoir</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-phumulani-earth shrink-0" strokeWidth={1.75} aria-hidden="true" />
                      <span className="font-medium text-phumulani-charcoal">Sacred Promise</span>
                      <span className="text-[10px] text-phumulani-charcoal">· With Dr. Tererai Trent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-phumulani-earth shrink-0" strokeWidth={1.75} aria-hidden="true" />
                      <span className="font-medium text-phumulani-charcoal">The Gift in Pain</span>
                      <span className="text-[10px] text-phumulani-earth font-semibold">· Advance Announcement</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              {/* Community Solidarity Hero Visual */}
              <div className="relative rounded-2xl overflow-hidden border border-phumulani-charcoal/12 shadow-md aspect-[16/9] group">
                <SafeImage
                  src="/media/phumulani/about/community-solidarity.jpg"
                  fallbackSrc="/images/homepage/community-hero.svg"
                  fallbackType="hero"
                  alt="Multi-generational African immigrant women standing together in unified solidarity by a Minnesota lake"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-phumulani-charcoal via-phumulani-charcoal/70 to-transparent flex items-end p-5">
                  <div className="bg-phumulani-charcoal/90 rounded-xl px-3.5 py-2.5 border border-phumulani-cream/20">
                    <span className="text-phumulani-gold font-heading font-bold text-[11px] uppercase tracking-wider">
                      Sisterhood &amp; Shared Strength
                    </span>
                    <h3 className="font-heading text-white text-lg sm:text-xl font-bold mt-0.5">
                      Rooted in Heritage. Unified in Healing.
                    </h3>
                  </div>
                </div>
              </div>

              <div className="text-xs font-bold font-heading text-phumulani-earth uppercase tracking-wider">
                Organizational Heritage
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-phumulani-charcoal">
                A Safe Haven Rooted in Cultural Dignity
              </h2>
              <p className="text-sm text-phumulani-charcoal leading-relaxed font-sans">
                Founded in 2017 to bridge the systemic voids faced by African, African-American, Asian, and Latinx immigrants in Minnesota, Phumulani (meaning &ldquo;to rest&rdquo; or &ldquo;peace&rdquo; in Zulu) provides comprehensive wraparound support.
              </p>
              <p className="text-sm text-phumulani-charcoal leading-relaxed font-sans">
                We believe that safety requires economic independence. When survivors obtain stable housing, credit repair, and living-wage employment, they break cycles of intergenerational trauma.
              </p>

              {/* Leadership & Safeguarding Portraits */}
              <div id="leadership-section" className="pt-2">
                <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                  <span className="text-xs font-bold font-heading text-phumulani-charcoal uppercase tracking-wide">
                    Executive Leadership &amp; Board
                  </span>
                  {onOpenMediaRegistry && (
                    <button
                      onClick={onOpenMediaRegistry}
                      className="text-xs font-heading text-phumulani-earth hover:text-phumulani-orange hover:underline underline-offset-4 font-semibold cursor-pointer focus-visible:ring-2 focus-visible:ring-phumulani-earth rounded"
                    >
                      View Media &amp; Safeguarding Registry ↗
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  {[
                    {
                      src: '/images/leadership/dr-elena-rostova.svg',
                      fallback: '/media/leadership/dr-elena-rostova.svg',
                      initials: 'ER',
                      name: 'Dr. Elena Rostova',
                      role: 'Board Chair',
                    },
                    {
                      src: '/images/leadership/sister-miriam-k.svg',
                      fallback: '/media/leadership/sister-miriam-k.svg',
                      initials: 'MK',
                      name: 'Sister Miriam K.',
                      role: 'Safeguarding Lead',
                    },
                    {
                      src: '/images/leadership/david-mwangi.svg',
                      fallback: '/media/leadership/david-mwangi.svg',
                      initials: 'DM',
                      name: 'David Mwangi, CPA',
                      role: 'Finance Director',
                    },
                    {
                      src: '/images/leadership/amina-yusuf.svg',
                      fallback: '/media/leadership/amina-yusuf.svg',
                      initials: 'AY',
                      name: 'Amina Yusuf',
                      role: 'Community Lead',
                    },
                  ].map((leader) => (
                    <div
                      key={leader.name}
                      className="bg-phumulani-cream/60 p-3 rounded-xl border border-phumulani-charcoal/12 hover:border-phumulani-earth/40 hover:-translate-y-0.5 shadow-2xs transition-all duration-200 space-y-1.5"
                    >
                      <SafeImage
                        src={leader.src}
                        fallbackSrc={leader.fallback}
                        fallbackType="leadership"
                        initials={leader.initials}
                        alt={leader.name}
                        className="w-14 h-14 mx-auto rounded-xl object-cover shadow-2xs"
                      />
                      <div className="font-heading font-bold text-xs text-phumulani-charcoal leading-tight">
                        {leader.name}
                      </div>
                      <div className="text-[10px] text-phumulani-charcoal font-sans">{leader.role}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* 5. GET INVOLVED / VOLUNTEER OPPORTUNITIES */}
      <section id="get-involved-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <div id="volunteer-section" className="relative -top-24"></div>
        <RevealSection className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <div className="text-xs font-bold font-heading text-phumulani-earth uppercase tracking-wider">
              Join The Movement
            </div>
            <h2 className="font-heading text-3xl font-extrabold text-phumulani-charcoal">
              Volunteer Opportunities &amp; Mentorship
            </h2>
            <p className="text-xs text-phumulani-charcoal mt-1 font-sans">
              Give your time, professional expertise, or language fluency to empower Minnesota families.
            </p>
          </div>
          <button
            onClick={() => onViewChange('community')}
            className="text-xs font-semibold font-heading text-phumulani-earth hover:text-phumulani-orange hover:underline underline-offset-4 flex items-center gap-1 cursor-pointer group focus-visible:ring-2 focus-visible:ring-phumulani-earth rounded"
          >
            <span>Go to Volunteer Portal</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </RevealSection>

        {/* Featured Volunteer Action Banner */}
        <RevealSection className="mb-8 rounded-2xl overflow-hidden border border-phumulani-charcoal/15 shadow-sm bg-phumulani-charcoal text-white grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 relative aspect-[16/9] lg:aspect-auto lg:h-full bg-phumulani-charcoal overflow-hidden">
            <SafeImage
              src="/media/phumulani/get-involved/volunteers.jpg"
              fallbackSrc="/images/volunteers/volunteer-engagement.svg"
              fallbackType="volunteer"
              alt="Diverse community volunteers joyfully collaborating and packing care kits at Phumulani Community Center"
              className="w-full h-full object-cover min-h-[260px]"
              loading="lazy"
            />
          </div>
          <div className="lg:col-span-5 p-6 sm:p-8 space-y-3.5 flex flex-col justify-center">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold font-heading text-phumulani-gold uppercase tracking-wider">
              <HandHeart className="w-4 h-4 text-phumulani-gold" strokeWidth={1.75} aria-hidden="true" />
              <span>Community In Action</span>
            </div>
            <h3 className="font-heading text-2xl font-bold text-white">
              Every Hour Contributed Creates Safety
            </h3>
            <p className="text-xs sm:text-sm text-phumulani-cream leading-relaxed font-sans">
              Our volunteers package dignity kits, accompany survivors to court appointments, mentor youth, and host bilingual conversation circles. Join over <span className="tabular-nums font-semibold">120</span> active volunteers across the Twin Cities.
            </p>
            <div className="pt-2 text-xs text-phumulani-gold font-semibold flex items-center gap-2 font-heading">
              <CheckCircle2 className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span>Orientation &amp; trauma-informed training provided</span>
            </div>
          </div>
        </RevealSection>

        {submittedAppId && (
          <div className="mb-6 p-4 bg-white border border-phumulani-green rounded-xl flex items-center justify-between text-xs text-phumulani-charcoal">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-phumulani-earth" strokeWidth={1.75} aria-hidden="true" />
              <span>
                Application submitted successfully! Your tracking ID is <strong className="tabular-nums">{submittedAppId}</strong>. A volunteer coordinator has received your profile.
              </span>
            </div>
            <button
              onClick={() => setSubmittedAppId(null)}
              className="text-phumulani-earth hover:text-phumulani-charcoal font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {opportunities.map((opp, idx) => (
            <RevealItem key={opp.id} index={idx} className="flex">
              <div className="bg-white rounded-2xl border border-phumulani-charcoal/12 p-5 flex flex-col justify-between w-full hover:border-phumulani-earth/40 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2 text-[11px] font-heading">
                    <span className="font-semibold text-phumulani-earth">
                      {opp.commitment}
                    </span>
                    {opp.urgent && (
                      <span className="font-bold text-phumulani-earth shrink-0">
                        · Urgent Need
                      </span>
                    )}
                  </div>

                  <h3 className="font-heading font-bold text-base text-phumulani-charcoal">
                    {opp.title}
                  </h3>

                  <p className="text-xs text-phumulani-charcoal leading-relaxed font-sans">
                    {opp.description}
                  </p>

                  <div className="text-[11px] text-phumulani-charcoal space-y-1 pt-2 border-t border-phumulani-charcoal/10 font-sans">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-phumulani-earth shrink-0" strokeWidth={1.75} aria-hidden="true" />
                      <span>{opp.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UsersRound className="w-3.5 h-3.5 text-phumulani-earth shrink-0" strokeWidth={1.75} aria-hidden="true" />
                      <span className="tabular-nums">{opp.openSlots} openings available</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedOpportunity(opp)}
                  className="mt-5 w-full min-h-[42px] bg-phumulani-earth hover:bg-phumulani-charcoal text-white py-2.5 px-3 rounded-lg text-xs font-semibold font-heading transition-colors cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-phumulani-earth"
                >
                  Apply for Opportunity
                </button>
              </div>
            </RevealItem>
          ))}
        </div>
      </section>

      {/* 6. DONATION & FUNDRAISING */}
      <section
        id="donate-section"
        className="bg-phumulani-charcoal text-white py-16 relative overflow-hidden border-t border-phumulani-gold/30 scroll-mt-28"
      >
        <div className="hidden lg:block absolute top-0 right-0 w-[420px] h-[260px] pointer-events-none">
          <CulturalGeometricAccent variant="dark-woven" className="w-full h-full" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Campaigns & Impact */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold font-heading text-phumulani-gold uppercase tracking-wider">
                <HandHeart className="w-4 h-4 text-phumulani-gold" strokeWidth={1.75} aria-hidden="true" />
                <span>TAX-DEDUCTIBLE 501(C)(3) GIVING</span>
              </div>

              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Fuel Freedom, Safety, and Lasting Renewal
              </h2>

              <p className="text-sm text-phumulani-cream leading-relaxed font-sans">
                100% of community contributions go directly to survivor safety funds, security deposits, workforce training, and educational mentorship. All gifts are processed through verified banking gateways with immediate tax receipts.
              </p>

              {/* Community Celebration & Gratitude Visual */}
              <div className="relative rounded-xl overflow-hidden border border-white/15 shadow-md aspect-[16/9] group">
                <SafeImage
                  src="/media/phumulani/donations/impact-gathering.jpg"
                  fallbackSrc="/images/events/community-celebration.svg"
                  fallbackType="event"
                  alt="Warm community celebration banquet in deep teal and gold candlelight celebrating survivor resilience"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-phumulani-charcoal/80 via-phumulani-charcoal/20 to-transparent flex items-end p-4">
                  <div className="text-xs">
                    <span className="text-phumulani-gold font-heading font-bold uppercase tracking-wider text-[10px]">
                      Your Impact In Action
                    </span>
                    <div className="font-heading text-white font-bold text-sm sm:text-base">
                      Families Rebuilding with Dignity &amp; Joy
                    </div>
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
                      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-phumulani-charcoal border-phumulani-orange shadow-md'
                          : 'bg-phumulani-charcoal border-white/15 hover:border-phumulani-gold'
                      }`}
                    >
                      <div className="flex justify-between items-start text-xs font-semibold font-heading gap-2">
                        <span className="text-white">{camp.title}</span>
                        <span className="text-phumulani-gold tabular-nums shrink-0">{percent}% Funded</span>
                      </div>
                      <div className="w-full bg-white/15 rounded-full h-2 my-2 overflow-hidden">
                        <div
                          className="bg-phumulani-orange h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-phumulani-cream font-sans tabular-nums">
                        <span>
                          ${camp.raisedAmount.toLocaleString()} raised of ${camp.targetAmount.toLocaleString()}
                        </span>
                        <span>{camp.donorCount} donors</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Checkout Form */}
            <div className="lg:col-span-6">
              <div className="bg-white text-phumulani-charcoal rounded-2xl p-6 sm:p-8 shadow-2xl border border-phumulani-charcoal/12">
                <form onSubmit={handleDonationSubmit} className="space-y-5">
                  <div className="flex justify-between items-center border-b border-phumulani-charcoal/10 pb-3 gap-2">
                    <div className="font-heading text-xl font-bold text-phumulani-charcoal">
                      Make a Donation
                    </div>
                    <span className="text-xs text-phumulani-charcoal font-medium flex items-center gap-1.5 shrink-0">
                      <LockKeyhole className="w-3.5 h-3.5 text-phumulani-earth" strokeWidth={1.75} aria-hidden="true" />
                      <span className="font-sans">SSL 256-Bit Encrypted</span>
                    </span>
                  </div>

                  {/* Frequency Toggle */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-phumulani-cream rounded-lg">
                    <button
                      type="button"
                      onClick={() => setDonationFrequency('one_time')}
                      className={`py-2 text-xs font-bold font-heading rounded-md transition-colors cursor-pointer ${
                        donationFrequency === 'one_time' ? 'bg-phumulani-earth text-white shadow-xs' : 'text-phumulani-charcoal'
                      }`}
                    >
                      One-Time Gift
                    </button>
                    <button
                      type="button"
                      onClick={() => setDonationFrequency('monthly')}
                      className={`py-2 text-xs font-bold font-heading rounded-md transition-colors cursor-pointer ${
                        donationFrequency === 'monthly' ? 'bg-phumulani-earth text-white shadow-xs' : 'text-phumulani-charcoal'
                      }`}
                    >
                      Monthly Sustainer (Most Impact)
                    </button>
                  </div>

                  {/* Amount Selectors */}
                  <div>
                    <label className="block text-xs font-semibold font-heading text-phumulani-charcoal mb-2">
                      Select Gift Amount (USD)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[50, 100, 250, 500].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setDonationAmount(amt)}
                          className={`py-2.5 rounded-lg text-xs font-bold font-heading tabular-nums border transition-colors cursor-pointer ${
                            donationAmount === amt
                              ? 'bg-phumulani-cream border-phumulani-earth text-phumulani-earth'
                              : 'bg-white border-phumulani-charcoal/20 text-phumulani-charcoal hover:border-phumulani-earth'
                          }`}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Amount */}
                  <div>
                    <label className="block text-xs font-medium text-phumulani-charcoal mb-1 font-sans">
                      Or Enter Custom Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-phumulani-charcoal font-bold text-xs">$</span>
                      <input
                        type="number"
                        min="5"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 text-xs font-bold font-heading tabular-nums border border-phumulani-charcoal/20 rounded-lg focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20 outline-none"
                      />
                    </div>
                  </div>

                  {/* Donor Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-medium text-phumulani-charcoal mb-1 font-sans">Full Name</label>
                      <input
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="Marcus Vance"
                        className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20 outline-none font-sans"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-phumulani-charcoal mb-1 font-sans">Email Address</label>
                      <input
                        type="email"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        placeholder="donor@example.com"
                        className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20 outline-none font-sans"
                      />
                    </div>
                  </div>

                  {/* Payment Gateway Status & Transparency Banner */}
                  <div className={`p-3.5 rounded-xl text-xs space-y-1.5 border ${
                    gatewayConfig.liveCheckoutEnabled
                      ? 'bg-phumulani-cream border-phumulani-green text-phumulani-charcoal'
                      : 'bg-phumulani-cream border-phumulani-charcoal/15 text-phumulani-charcoal'
                  }`}>
                    <div className="font-heading font-bold flex items-center gap-1.5 text-phumulani-earth">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>{gatewayConfig.liveCheckoutEnabled ? 'Live Verified Payment Gateway (Stripe SSL)' : 'Payment Gateway In Configuration Mode'}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed font-sans">
                      {gatewayConfig.liveCheckoutEnabled
                        ? 'Payments are processed directly via secure PCI-DSS Level 1 provider checkout. Your tax receipt is generated upon webhook verification.'
                        : 'Online credit card charging is temporarily disabled pending production merchant credentials. You may record a tax-deductible donor pledge below or contact donations@phumulani.org for wire/ACH transfer.'}
                    </p>
                  </div>

                  {donationError && (
                    <div className="p-3 bg-phumulani-cream border border-phumulani-earth rounded-lg text-xs text-phumulani-earth flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-phumulani-earth mt-0.5" />
                      <span>{donationError}</span>
                    </div>
                  )}

                  {pledgeConfirmed ? (
                    <div className="p-5 bg-phumulani-cream border border-phumulani-teal rounded-xl space-y-3 text-center">
                      <CheckCircle2 className="w-8 h-8 text-phumulani-earth mx-auto" />
                      <div className="font-heading text-base font-bold text-phumulani-earth tabular-nums">
                        Donor Pledge Recorded: {pledgeConfirmed.reference}
                      </div>
                      <p className="text-xs text-phumulani-charcoal font-sans leading-relaxed tabular-nums">
                        Thank you for pledging <strong>${pledgeConfirmed.amount}</strong> toward <em>{pledgeConfirmed.campaignTitle}</em>. Our Finance Office will contact you to coordinate funds transfer.
                      </p>
                      <div className="text-[11px] text-phumulani-charcoal font-sans bg-white p-2.5 rounded-lg border border-phumulani-charcoal/12">
                        Official 501(c)(3) tax receipt is legally issued upon verified funds settlement.
                      </div>
                      <button
                        type="button"
                        onClick={() => setPledgeConfirmed(null)}
                        className="text-xs font-bold text-phumulani-earth hover:underline cursor-pointer"
                      >
                        Make another pledge or donation
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-xs text-phumulani-charcoal font-sans">
                        <input
                          type="checkbox"
                          id="anonCheck"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="rounded text-phumulani-earth"
                        />
                        <label htmlFor="anonCheck">Make my gift anonymous on public donor rolls</label>
                      </div>

                      <button
                        type="submit"
                        disabled={isDonating}
                        className="w-full py-3 bg-phumulani-earth hover:bg-phumulani-charcoal disabled:bg-phumulani-cream disabled:text-phumulani-charcoal text-white rounded-lg text-sm font-heading font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-phumulani-orange tabular-nums"
                      >
                        {isDonating ? (
                          <>
                            <Sparkles className="w-4 h-4 animate-spin" />
                            <span>Processing Request...</span>
                          </>
                        ) : (
                          <>
                            <Heart className="w-4 h-4" />
                            <span>
                              {gatewayConfig.liveCheckoutEnabled
                                ? `Proceed to Secure Checkout ($${donationAmount})`
                                : `Record Verified Pledge of $${donationAmount}`}
                            </span>
                          </>
                        )}
                      </button>

                      <div className="text-[11px] text-phumulani-charcoal text-center font-sans">
                        {gatewayConfig.liveCheckoutEnabled
                          ? 'Official 501(c)(3) receipt with unique transaction hash issued upon confirmed settlement.'
                          : 'Official 501(c)(3) tax receipt issued following verified funds receipt and settlement.'}
                      </div>
                    </>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. COMMUNITY EVENTS CALENDAR */}
      <section id="events-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <RevealSection className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <div className="text-xs font-bold font-heading text-phumulani-earth uppercase tracking-wider">
              Gathering &amp; Growth
            </div>
            <h2 className="font-heading text-3xl font-extrabold text-phumulani-charcoal">
              Upcoming Workshops &amp; Community Gatherings
            </h2>
            <p className="text-xs text-phumulani-charcoal mt-1 font-sans">
              Events are open to community members, supporters, and partner organizations. Capacity strictly enforced.
            </p>
          </div>
        </RevealSection>

        {rsvpFeedback && (
          <div className="mb-6 p-4 bg-phumulani-cream border border-phumulani-teal rounded-xl flex items-center justify-between text-xs text-phumulani-earth">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-phumulani-earth" strokeWidth={1.75} aria-hidden="true" />
              <span className="font-sans">{rsvpFeedback.message}</span>
            </div>
            <button onClick={() => setRsvpFeedback(null)} className="font-bold text-phumulani-earth font-heading cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((evt, idx) => {
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
              <RevealItem key={evt.id} index={idx} className="flex">
                <div className="bg-white rounded-2xl border border-phumulani-charcoal/12 overflow-hidden flex flex-col justify-between w-full hover:border-phumulani-earth/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group">
                  <div className="aspect-[16/9] w-full bg-phumulani-cream overflow-hidden border-b border-phumulani-charcoal/10">
                    <SafeImage
                      src={eventImgConfig.src}
                      fallbackSrc={eventImgConfig.fallback}
                      fallbackType="event"
                      fallbackText={evt.title}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs gap-2">
                        <span className="font-semibold font-heading text-phumulani-earth">
                          {evt.category}
                        </span>
                        <span className="text-[11px] font-semibold font-heading text-phumulani-charcoal tabular-nums shrink-0">
                          {isFull ? `Waitlist Active (${evt.waitlistCount})` : `${evt.capacity - evt.registeredCount} Seats Left`}
                        </span>
                      </div>

                      <h3 className="font-heading font-bold text-lg text-phumulani-charcoal leading-snug group-hover:text-phumulani-earth transition-colors">
                        {evt.title}
                      </h3>

                      <p className="text-xs text-phumulani-charcoal leading-relaxed font-sans">
                        {evt.description}
                      </p>

                      <div className="space-y-1.5 text-xs text-phumulani-charcoal pt-3 border-t border-phumulani-charcoal/10 font-sans">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-3.5 h-3.5 text-phumulani-earth shrink-0" strokeWidth={1.75} aria-hidden="true" />
                          <span>
                            {new Date(evt.date).toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-phumulani-earth shrink-0" strokeWidth={1.75} aria-hidden="true" />
                          <span className="tabular-nums">{evt.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-phumulani-earth shrink-0" strokeWidth={1.75} aria-hidden="true" />
                          <span>{evt.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-phumulani-charcoal/10">
                      <button
                        onClick={() => setSelectedEvent(evt)}
                        className={`w-full min-h-[42px] py-2.5 rounded-lg text-xs font-semibold font-heading transition-colors cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-phumulani-earth ${
                          isFull
                            ? 'bg-phumulani-gold hover:bg-phumulani-cream text-phumulani-charcoal font-bold'
                            : 'bg-phumulani-earth hover:bg-phumulani-charcoal text-white'
                        }`}
                      >
                        {isFull ? 'Join Priority Waitlist' : 'RSVP / Register'}
                      </button>
                    </div>
                  </div>
                </div>
              </RevealItem>
            );
          })}
        </div>
      </section>

      {/* 8. DISCREET GET HELP HUB & SAFE EXIT */}
      <section id="get-help-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <RevealSection className="bg-white border border-phumulani-earth/30 rounded-2xl p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold font-heading text-phumulani-earth uppercase tracking-wider">
                <LifeBuoy className="w-4 h-4 text-phumulani-earth" strokeWidth={1.75} aria-hidden="true" />
                <span>Confidential Safeguarding Route</span>
              </div>

              <h2 className="font-heading text-3xl font-extrabold text-phumulani-earth">
                Safe &amp; Discreet Assistance
              </h2>

              <p className="text-xs sm:text-sm text-phumulani-charcoal leading-relaxed font-sans">
                If you are an immigrant or refugee survivor in Minnesota seeking safety, shelter, or legal protection, you can reach out here discreetly.
              </p>

              <div className="bg-phumulani-cream p-4 rounded-xl border border-phumulani-charcoal/12 text-xs space-y-2 text-phumulani-charcoal font-sans">
                <div className="font-bold font-heading text-phumulani-earth flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-phumulani-earth shrink-0" strokeWidth={1.75} aria-hidden="true" />
                  <span>Privacy &amp; Safeguarding Guarantees</span>
                </div>
                <ul className="space-y-1 list-disc list-inside text-[11px] text-phumulani-charcoal">
                  <li>No third-party tracking scripts or advertising cookies</li>
                  <li>No account creation required</li>
                  <li>Directly routed to trained Safeguarding Officers (never general staff)</li>
                  <li>Zero AI processing on sensitive survivor case records</li>
                </ul>
              </div>

              <div className="p-4 bg-phumulani-cream border border-phumulani-charcoal/12 rounded-xl text-xs text-phumulani-earth flex items-center justify-between gap-2">
                <div>
                  <div className="font-bold font-heading">Immediate Crisis Line 24/7</div>
                  <div className="text-sm font-semibold font-heading tabular-nums">1-866-223-1111 (Call or Text)</div>
                </div>
                <button
                  onClick={() => window.location.replace('https://weather.com')}
                  className="bg-phumulani-earth hover:bg-phumulani-charcoal text-white px-3.5 py-2 rounded-lg text-xs font-semibold font-heading flex items-center gap-1 cursor-pointer shrink-0 transition-colors focus-visible:ring-2 focus-visible:ring-phumulani-earth"
                >
                  <span>Quick Exit</span>
                  <ExternalLink className="w-3 h-3" strokeWidth={1.75} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Discreet Intake Form */}
            <div className="lg:col-span-7 bg-phumulani-cream/40 rounded-2xl p-6 border border-phumulani-charcoal/12">
              {helpSubmittedCode ? (
                <div className="space-y-4 text-center py-6">
                  <div className="w-12 h-12 bg-phumulani-cream text-phumulani-charcoal rounded-full flex items-center justify-center mx-auto border border-phumulani-charcoal/12">
                    <CheckCircle2 className="w-6 h-6 text-phumulani-earth" />
                  </div>
                  <div className="font-heading text-xl font-bold text-phumulani-charcoal tabular-nums">
                    Safe Intake Reference: {helpSubmittedCode}
                  </div>
                  <p className="text-xs text-phumulani-charcoal max-w-md mx-auto leading-relaxed font-sans">
                    Your request has been routed directly to Sister Miriam K. and our trauma-informed safeguarding team. We will only contact you at the designated safe time and method you specified.
                  </p>
                  <button
                    onClick={() => setHelpSubmittedCode(null)}
                    className="text-xs font-semibold font-heading text-phumulani-earth hover:underline cursor-pointer"
                  >
                    Submit another discreet inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleHelpSubmit} className="space-y-4">
                  <div className="font-heading text-base font-bold text-phumulani-charcoal border-b border-phumulani-charcoal/10 pb-2">
                    Discreet Communication Intake
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-medium text-phumulani-charcoal mb-1 font-sans">How can we contact you safely?</label>
                      <select
                        value={helpMethod}
                        onChange={(e) => setHelpMethod(e.target.value as any)}
                        className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20 outline-none bg-white text-xs font-sans"
                      >
                        <option value="safe_email">Safe Email (one only you access)</option>
                        <option value="phone">Phone / WhatsApp (Voice or Text)</option>
                        <option value="secure_signal">Signal Messenger</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-phumulani-charcoal mb-1 font-sans">Language Needed</label>
                      <select
                        value={helpLanguage}
                        onChange={(e) => setHelpLanguage(e.target.value)}
                        className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20 outline-none bg-white text-xs font-sans"
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
                    <label className="block font-medium text-phumulani-charcoal mb-1 font-sans">
                      Safest Time of Day to Contact
                    </label>
                    <input
                      type="text"
                      value={helpSafeTime}
                      onChange={(e) => setHelpSafeTime(e.target.value)}
                      placeholder="e.g., Weekday mornings 10am-12pm when alone"
                      className="w-full px-3 py-2 bg-white border border-phumulani-charcoal/20 rounded-lg focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20 outline-none text-xs font-sans"
                      required
                    />
                  </div>

                  {helpError && (
                    <div className="p-3 bg-phumulani-cream border border-phumulani-earth rounded-lg text-xs text-phumulani-earth flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-phumulani-earth mt-0.5" />
                      <div>
                        <div className="font-bold">Submission Notice</div>
                        <div>{helpError}</div>
                      </div>
                    </div>
                  )}

                  <div className="text-xs">
                    <label className="block font-medium text-phumulani-charcoal mb-1 font-sans">
                      Brief Message or Safe Phone / Email
                    </label>
                    <textarea
                      rows={3}
                      value={helpNotes}
                      onChange={(e) => setHelpNotes(e.target.value)}
                      placeholder="Enter safe contact info and general need (housing, court support, food). Do not include dangerous details."
                      className="w-full px-3 py-2 bg-white border border-phumulani-charcoal/20 rounded-lg focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20 outline-none text-xs font-sans"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingHelp}
                    className="w-full py-2.5 bg-phumulani-earth hover:bg-phumulani-charcoal disabled:bg-phumulani-cream disabled:text-phumulani-charcoal text-white rounded-lg text-xs font-bold font-heading transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
                  >
                    {isSubmittingHelp ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>Encrypting &amp; Routing Confidentially...</span>
                      </>
                    ) : (
                      <span>Submit to Safeguarding Queue Confidentially</span>
                    )}
                  </button>

                  <div className="text-[10px] text-phumulani-charcoal text-center font-sans space-y-0.5">
                    <div>End-to-end encrypted (AES-256-GCM) on transmission. Zero storage in public AI models or browser logs.</div>
                    <div className="text-phumulani-charcoal">Note: Quick Exit replaces this page with weather.com; it cannot delete external ISP logs or hardware keyloggers.</div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* 9. MISSION, VISION & CORE VALUES */}
      <section id="mission-section" className="bg-white py-16 border-t border-phumulani-charcoal/12 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <RevealSection className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold font-heading text-phumulani-earth uppercase tracking-wider">
              <HeartHandshake className="w-4 h-4 text-phumulani-earth" strokeWidth={1.75} aria-hidden="true" />
              <span>Foundational Purpose</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-phumulani-charcoal">
              Our Sacred Mission &amp; Enduring Vision
            </h2>
            <CulturalGeometricAccent variant="section-crest" />
            <p className="text-xs sm:text-sm text-phumulani-charcoal leading-relaxed font-sans">
              Phumulani exists to ensure that every immigrant and refugee survivor of domestic violence, human trafficking, and systemic trauma in Minnesota discovers not merely an escape from danger, but an enduring pathway to sovereignty, self-determination, and thriving peace.
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                num: '01',
                title: 'Cultural Attunement',
                desc: 'Healing cannot be imported from generic clinical models. We center ancestral sisterhood tea circles, indigenous trauma resolution, and bilingual advocates who share lived cultural realities.',
              },
              {
                num: '02',
                title: 'Legal Self-Defense',
                desc: 'Navigating Orders for Protection (OFP), U-Visa certifications, and immigration relief with relentless, courtroom-accredited accompaniment and trauma-informed legal partners.',
              },
              {
                num: '03',
                title: 'Economic Sovereignty',
                desc: 'Financial abuse is the most potent anchor of domestic violence. We dismantle dependency through matched savings, rapid lease deposits, credit restoration, and micro-enterprise coaching.',
              },
              {
                num: '04',
                title: 'Intergenerational Youth',
                desc: 'Breaking generational trauma by investing deeply in the children of survivors through academic tutoring, college preparation, and culturally grounded leadership development.',
              },
            ].map((item, idx) => (
              <RevealItem key={item.num} index={idx} className="flex">
                <div className="bg-phumulani-cream/70 p-6 rounded-2xl border border-phumulani-charcoal/12 shadow-2xs space-y-3 hover:border-phumulani-earth/40 hover:shadow-md hover:-translate-y-1 transition-all duration-200 w-full">
                  <div className="w-10 h-10 rounded-xl bg-white border border-phumulani-charcoal/15 text-phumulani-earth flex items-center justify-center font-bold font-heading tabular-nums">
                    {item.num}
                  </div>
                  <h3 className="font-heading text-lg font-bold text-phumulani-charcoal">{item.title}</h3>
                  <p className="text-xs text-phumulani-charcoal leading-relaxed font-sans">{item.desc}</p>
                </div>
              </RevealItem>
            ))}
          </div>
        </div>
      </section>

      {/* 10. STRATEGIC PARTNERSHIPS & ALLIANCES */}
      <section id="partnerships-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-28">
        <RevealSection className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div>
            <div className="text-xs font-bold font-heading text-phumulani-earth uppercase tracking-wider">
              Collective Power
            </div>
            <h2 className="font-heading text-3xl font-extrabold text-phumulani-charcoal">
              Community Alliances &amp; Institutional Partners
            </h2>
            <p className="text-xs text-phumulani-charcoal mt-1 font-sans">
              Phumulani works arm-in-arm with Minnesota public agencies, corporate grantmakers, legal coalitions, and shelter networks.
            </p>
          </div>
          <button
            onClick={() => {
              const el = document.getElementById('contact-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-4 py-2.5 bg-white border border-phumulani-earth/40 text-phumulani-earth hover:bg-phumulani-earth hover:text-white rounded-lg text-xs font-bold font-heading flex items-center gap-1.5 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-phumulani-earth group whitespace-nowrap"
          >
            <span>Partner With Phumulani</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Building2,
              title: 'Corporate CSR Partners',
              desc: 'Minnesota corporate benefactors supporting matched giving, employer hiring days, and technology donations for our workforce lab.',
              partners: 'Target Foundation · 3M Community Giving · Medtronic CSR',
            },
            {
              icon: ShieldCheck,
              title: 'Legal Defense Network',
              desc: 'Direct collaborative referrals for bilingual legal counsel, orders for protection, and immigration U-Visa navigation in Hennepin & Ramsey counties.',
              partners: 'The Advocates for Human Rights · Standpoint MN · Tubman',
            },
            {
              icon: House,
              title: 'Emergency Shelter Network',
              desc: 'Fast-track confidential safe house transfers, emergency hotel vouchers, and landlord negotiation for rapid independent leasing.',
              partners: 'Day One Crisis Line · Cornerstone MN · Haven Housing',
            },
            {
              icon: GraduationCap,
              title: 'Academic & Research',
              desc: 'Community-based participatory evaluation, workforce intern placement, and rigorous monitoring of our MEAL indicators.',
              partners: 'University of Minnesota UROC · Minneapolis College',
            },
          ].map((partner, idx) => {
            const Icon = partner.icon;
            return (
              <RevealItem key={partner.title} index={idx} className="flex">
                <div className="bg-white p-5 rounded-2xl border border-phumulani-charcoal/12 hover:border-phumulani-earth/40 hover:shadow-md hover:-translate-y-1 transition-all duration-200 shadow-2xs space-y-2.5 w-full">
                  <div className="flex items-center gap-2 text-xs font-bold font-heading text-phumulani-earth">
                    <Icon className="w-4 h-4 text-phumulani-earth shrink-0" strokeWidth={1.75} aria-hidden="true" />
                    <span>{partner.title}</span>
                  </div>
                  <p className="text-xs text-phumulani-charcoal leading-relaxed font-sans">{partner.desc}</p>
                  <div className="text-[11px] font-semibold text-phumulani-charcoal pt-1 font-sans">
                    {partner.partners}
                  </div>
                </div>
              </RevealItem>
            );
          })}
        </div>
      </section>

      {/* 11. NEWS, COMMUNITY BULLETINS & PUBLICATIONS */}
      <section id="news-section" className="bg-white py-16 border-y border-phumulani-charcoal/12 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <RevealSection className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <div className="text-xs font-bold font-heading text-phumulani-earth uppercase tracking-wider">
                Publications &amp; Press
              </div>
              <h2 className="font-heading text-3xl font-extrabold text-phumulani-charcoal">
                Latest News &amp; Authored Works
              </h2>
              <p className="text-xs text-phumulani-charcoal mt-1 font-sans">
                Stories of resilience, executive reports, and published books by Founder Comfort Dondo.
              </p>
            </div>
            <div className="text-xs text-phumulani-charcoal font-sans">
              Verified IRS 501(c)(3) Public Disclosures
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                badge: 'Published Memoir',
                meta: '2021 Release',
                title: 'Facing the Giants',
                desc: "Comfort Dondo's acclaimed memoir chronicling her lived journey through adversity, displacement, and the unyielding determination to build culturally grounded sanctuaries for immigrant women.",
                leftFooter: 'Author: Comfort Dondo',
                rightFooter: 'Available via Community Library',
              },
              {
                badge: 'Co-Authored Anthology',
                meta: "Global Women's Leadership",
                title: 'Sacred Promise',
                desc: 'An inspiring collaborative volume with Dr. Tererai Trent and visionary global leaders exploring the sacred covenants women make to lift each other out of oppression and into economic dignity.',
                leftFooter: 'Foreword: Dr. Tererai Trent',
                rightFooter: 'Minnesota Reading Circles',
              },
              {
                badge: 'Forthcoming Publication',
                meta: '2027 Preview',
                title: 'The Gift in Pain',
                desc: 'A profound exploration of transforming deep psychological and systemic wounds into catalysts for revolutionary community organizing, social entrepreneurship, and generational liberation.',
                leftFooter: 'Advance Announcements',
                rightFooter: 'Excerpts in Tea Circles',
              },
            ].map((item, idx) => (
              <RevealItem key={item.title} index={idx} className="flex">
                <div className="bg-phumulani-cream/60 rounded-2xl p-6 border border-phumulani-charcoal/12 shadow-2xs flex flex-col justify-between space-y-4 w-full hover:border-phumulani-earth/40 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-phumulani-charcoal font-sans gap-2">
                      <span className="font-bold font-heading text-phumulani-earth">{item.badge}</span>
                      <span className="tabular-nums">{item.meta}</span>
                    </div>
                    <h3 className="font-heading text-xl font-bold text-phumulani-charcoal">{item.title}</h3>
                    <p className="text-xs text-phumulani-charcoal leading-relaxed font-sans">{item.desc}</p>
                  </div>
                  <div className="pt-4 border-t border-phumulani-charcoal/10 flex items-center justify-between text-xs gap-2">
                    <span className="font-bold text-phumulani-charcoal font-sans">{item.leftFooter}</span>
                    <span className="text-phumulani-earth font-semibold font-heading text-right">{item.rightFooter}</span>
                  </div>
                </div>
              </RevealItem>
            ))}
          </div>
        </div>
      </section>

      {/* 12. SURVIVOR RIGHTS & COMMUNITY RESOURCES */}
      <section id="resources-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 scroll-mt-28">
        <RevealSection className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold font-heading text-phumulani-earth uppercase tracking-wider">
              <LibraryBig className="w-4 h-4 text-phumulani-earth" strokeWidth={1.75} aria-hidden="true" />
              <span>Self-Advocacy &amp; Guidance</span>
            </div>
            <h2 className="font-heading text-3xl font-extrabold text-phumulani-charcoal mt-1">
              Community Resources &amp; Downloadable Guides
            </h2>
            <p className="text-xs text-phumulani-charcoal mt-1 font-sans">
              Trauma-informed, legally vetted, multilingual tools available to the community free of charge.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 bg-white p-1.5 rounded-xl text-xs max-w-full border border-phumulani-charcoal/15">
            {(['all', 'legal', 'housing', 'healing', 'workforce'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setResourceFilter(cat)}
                className={`px-3 py-1.5 rounded-lg font-semibold font-heading capitalize cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-phumulani-earth ${
                  resourceFilter === cat
                    ? 'bg-phumulani-earth text-white shadow-2xs'
                    : 'text-phumulani-charcoal hover:text-phumulani-earth hover:bg-phumulani-cream/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </RevealSection>

        {downloadNotice && (
          <div className="p-3 bg-white border border-phumulani-teal rounded-xl text-xs font-semibold text-phumulani-earth flex items-center justify-between font-sans">
            <span>{downloadNotice}</span>
            <button onClick={() => setDownloadNotice(null)} className="text-phumulani-earth cursor-pointer">
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PUBLIC_RESOURCES
            .filter((res) => resourceFilter === 'all' || res.category === resourceFilter)
            .map((res, idx) => (
              <RevealItem key={res.id} index={idx} className="flex">
                <div className="bg-white p-5 rounded-2xl border border-phumulani-charcoal/12 shadow-2xs space-y-3 flex flex-col justify-between w-full hover:border-phumulani-earth/40 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-phumulani-charcoal font-sans gap-2">
                      <span className="font-bold font-heading text-phumulani-earth">{res.tag}</span>
                      <span className="tabular-nums">
                        {res.format} · {res.fileSize}
                      </span>
                    </div>
                    <h4 className="font-heading font-bold text-phumulani-charcoal text-sm leading-snug">
                      {res.title}
                    </h4>
                    <p className="text-xs text-phumulani-charcoal leading-relaxed font-sans line-clamp-3">
                      {res.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownloadResource(res)}
                    className="w-full min-h-[40px] py-2 bg-phumulani-cream hover:bg-phumulani-earth text-phumulani-earth hover:text-white border border-phumulani-charcoal/12 rounded-lg text-xs font-semibold font-heading flex items-center justify-center gap-1.5 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-phumulani-earth"
                  >
                    <Download className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                    <span>Download {res.format}</span>
                  </button>
                </div>
              </RevealItem>
            ))}
        </div>
      </section>

      {/* 13. CONTACT INFORMATION & SECURE INQUIRY */}
      <section id="contact-section" className="bg-phumulani-cream py-16 border-t border-phumulani-charcoal/12 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="text-xs font-bold font-heading text-phumulani-earth uppercase tracking-wider">Reach Our Team</div>
                <h2 className="font-heading text-3xl font-extrabold text-phumulani-charcoal">
                  Connect With Phumulani
                </h2>
                <p className="text-xs text-phumulani-charcoal mt-2 leading-relaxed font-sans">
                  Have a question about our community programs, volunteer opportunities, donor partnerships, or events? We are here to help.
                </p>
              </div>

              <div className="space-y-4 text-xs font-sans">
                <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-phumulani-charcoal/12 shadow-2xs">
                  <MapPin className="w-4 h-4 text-phumulani-earth shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold font-heading text-phumulani-charcoal">Mailing &amp; Operational Address</div>
                    <div className="text-phumulani-charcoal">Phumulani (Minnesota African Women Against Violence)</div>
                    <div className="text-phumulani-charcoal tabular-nums">PO Box, Minneapolis, MN 55404</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-phumulani-charcoal/12 shadow-2xs">
                  <PhoneCall className="w-4 h-4 text-phumulani-earth shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold font-heading text-phumulani-charcoal">Phone Communications</div>
                    <div className="text-phumulani-charcoal tabular-nums">General Admin: <a href="tel:6122519421" className="text-phumulani-earth font-semibold hover:underline">612-251-9421</a> (Mon–Fri 9am–5pm)</div>
                    <div className="text-phumulani-earth font-semibold font-heading mt-0.5 tabular-nums">24/7 Day One Crisis Line: 1-866-223-1111</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-phumulani-charcoal/12 shadow-2xs">
                  <Mail className="w-4 h-4 text-phumulani-earth shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold font-heading text-phumulani-charcoal">Department Mailboxes</div>
                    <div className="text-phumulani-charcoal">General Outreach: <code>info@phumulani.org</code></div>
                    <div className="text-phumulani-charcoal">Donations &amp; Grants: <code>donations@phumulani.org</code></div>
                    <div className="text-phumulani-charcoal">Confidential Safeguarding: <code>safeguarding@phumulani.org</code></div>
                  </div>
                </div>

                {/* Peaceful Lake Sanctuary Visual */}
                <div className="relative rounded-2xl overflow-hidden border border-phumulani-charcoal/12 shadow-2xs aspect-[16/9] group">
                  <SafeImage
                    src="/media/phumulani/contact/lake-haven.jpg"
                    fallbackSrc="/images/homepage/community-hero.svg"
                    fallbackType="generic"
                    alt="Tranquil Minnesota lake sanctuary at dawn with lavender reflections, representing peace, rest, and hope"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-phumulani-charcoal via-phumulani-charcoal/70 to-transparent flex items-end p-4">
                    <div className="bg-phumulani-charcoal/90 rounded-lg px-3 py-2 text-white text-xs border border-phumulani-cream/20">
                      <span className="text-phumulani-gold font-heading font-bold uppercase tracking-wider text-[10px]">A Place of Rest</span>
                      <div className="font-heading font-bold text-sm">Phumulani — Rooted in Peace &amp; Sisterhood</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-phumulani-charcoal/12 shadow-xs">
              <h3 className="font-heading text-xl font-bold text-phumulani-charcoal mb-1">
                Send a General Inquiry
              </h3>
              <p className="text-xs text-phumulani-charcoal mb-5 font-sans">
                For non-emergency community inquiries, partnership proposals, and press questions.
              </p>

              {contactSubmittedCode ? (
                <div
                  className={`p-6 rounded-xl text-center space-y-3 border ${
                    contactDeliveryStatus === 'EMAIL_DELIVERY_FAILED'
                      ? 'bg-phumulani-cream border-phumulani-gold'
                      : 'bg-phumulani-cream border-phumulani-teal'
                  }`}
                >
                  {contactDeliveryStatus === 'EMAIL_DELIVERY_FAILED' ? (
                    <AlertTriangle className="w-8 h-8 text-phumulani-earth mx-auto" />
                  ) : (
                    <CheckCircle2 className="w-8 h-8 text-phumulani-earth mx-auto" />
                  )}
                  <div className="font-heading text-lg font-bold text-phumulani-earth tabular-nums">
                    Inquiry Saved: {contactSubmittedCode}
                  </div>
                  <div className="inline-block px-3 py-1 rounded-md text-[11px] font-heading font-bold uppercase tracking-wider border bg-white text-phumulani-charcoal border-phumulani-charcoal/15">
                    {contactDeliveryStatus === 'EMAIL_SENT'
                      ? 'Email Sent'
                      : contactDeliveryStatus === 'EMAIL_DELIVERY_FAILED'
                      ? 'Email Delivery Failed'
                      : 'Email Queued'}
                  </div>
                  <p className="text-xs text-phumulani-charcoal max-w-md mx-auto font-sans leading-relaxed">
                    {contactDeliveryNotice || (
                      <>
                        Your inquiry was saved and queued for <strong>{contactRoutedTo || 'our team'}</strong>.
                      </>
                    )}
                  </p>
                  <button
                    onClick={() => {
                      setContactSubmittedCode(null);
                      setContactRoutedTo(null);
                      setContactDeliveryStatus(null);
                      setContactDeliveryNotice(null);
                    }}
                    className="text-xs font-bold font-heading text-phumulani-earth hover:underline cursor-pointer"
                  >
                    Submit another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4 text-xs font-sans">
                  {contactError && (
                    <div className="p-3 bg-phumulani-cream border border-phumulani-earth rounded-lg text-xs text-phumulani-earth flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-phumulani-earth mt-0.5" />
                      <div>{contactError}</div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-phumulani-charcoal mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="First and Last Name"
                        className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg outline-none focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-phumulani-charcoal mb-1">Your Email</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg outline-none focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-phumulani-charcoal mb-1">Department</label>
                      <select
                        value={contactDepartment}
                        onChange={(e) => setContactDepartment(e.target.value)}
                        className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg outline-none focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20 bg-white text-phumulani-charcoal"
                      >
                        <option value="General Inquiries">General Inquiries</option>
                        <option value="Community Programs & Cohorts">Community Programs &amp; Cohorts</option>
                        <option value="Volunteer Onboarding">Volunteer Onboarding</option>
                        <option value="Donor Relations & Giving">Donor Relations &amp; Giving</option>
                        <option value="Media & Press Coordination">Media &amp; Press Coordination</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-phumulani-charcoal mb-1">Subject</label>
                      <input
                        type="text"
                        required
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        placeholder="Brief summary of inquiry"
                        className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg outline-none focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-phumulani-charcoal mb-1">Message</label>
                    <textarea
                      rows={4}
                      required
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Please share how our team can assist you..."
                      className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg outline-none focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingContact}
                    className="w-full py-2.5 bg-phumulani-earth hover:bg-phumulani-charcoal disabled:bg-phumulani-cream disabled:text-phumulani-charcoal text-white rounded-lg font-bold font-heading flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-phumulani-earth"
                  >
                    {isSubmittingContact ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>Delivering to Department Mailbox...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Inquiry</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 14. PRIVACY NOTICE & SAFEGUARDING */}
      <section id="privacy-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6 scroll-mt-28">
        <RevealSection className="border-b border-phumulani-charcoal/12 pb-4">
          <div className="text-xs font-bold font-heading text-phumulani-earth uppercase tracking-wider">
            Compliance &amp; Ethics
          </div>
          <h2 className="font-heading text-3xl font-extrabold text-phumulani-charcoal">
            Privacy Policy &amp; VAWA Confidentiality Safeguards
          </h2>
          <p className="text-xs text-phumulani-charcoal mt-1 font-sans">
            Official 501(c)(3) privacy declaration and trauma-informed survivor confidentiality policies.
          </p>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-phumulani-charcoal">
          <RevealItem index={0} className="flex">
            <div className="bg-white p-5 rounded-2xl border border-phumulani-charcoal/12 hover:border-phumulani-earth/40 hover:shadow-md transition-all duration-200 shadow-2xs space-y-2 w-full">
              <div className="font-bold font-heading text-phumulani-charcoal flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-phumulani-earth shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>Survivor Confidentiality Safeguards</span>
              </div>
              <p className="leading-relaxed text-phumulani-charcoal font-sans">
                Pursuant to Violence Against Women Act (VAWA) 34 U.S.C. § 12291(b)(2) guidelines, Phumulani upholds strict organizational protocols prohibiting the unauthorized disclosure of personally identifying information (PII) of survivors. Internal compliance indicators reflect continuous operational self-assessments.
              </p>
            </div>
          </RevealItem>

          <RevealItem index={1} className="flex">
            <div className="bg-white p-5 rounded-2xl border border-phumulani-charcoal/12 hover:border-phumulani-earth/40 hover:shadow-md transition-all duration-200 shadow-2xs space-y-2 w-full">
              <div className="font-bold font-heading text-phumulani-charcoal flex items-center gap-1.5">
                <LockKeyhole className="w-4 h-4 text-phumulani-earth shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>Donor Bill of Rights &amp; Privacy</span>
              </div>
              <p className="leading-relaxed text-phumulani-charcoal font-sans">
                Phumulani adheres to the Association of Fundraising Professionals (AFP) Donor Bill of Rights. We never sell, rent, trade, or share donor contact information or giving records with external commercial marketing entities.
              </p>
            </div>
          </RevealItem>

          <RevealItem index={2} className="flex">
            <div className="bg-white p-5 rounded-2xl border border-phumulani-charcoal/12 hover:border-phumulani-earth/40 hover:shadow-md transition-all duration-200 shadow-2xs space-y-2 w-full">
              <div className="font-bold font-heading text-phumulani-charcoal flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-phumulani-earth shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>Zero Commercial Ad Tracking</span>
              </div>
              <p className="leading-relaxed text-phumulani-charcoal font-sans">
                Our website contains zero third-party advertising trackers, Facebook Meta pixels, or Google Ads remarketing cookies. While Safe Exit replaces this page, users should note it cannot delete local hardware or network ISP logs.
              </p>
            </div>
          </RevealItem>
        </div>
      </section>

      {/* 15. ACCESSIBILITY STATEMENT */}
      <section id="accessibility-section" className="bg-phumulani-charcoal text-white py-16 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <RevealSection className="border-b border-white/15 pb-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-phumulani-gold uppercase tracking-wider font-heading">
              <Accessibility className="w-4 h-4 text-phumulani-gold" strokeWidth={1.75} aria-hidden="true" />
              <span>Universal Design</span>
            </div>
            <h2 className="font-heading text-3xl font-extrabold text-white mt-1">
              Accessibility Statement &amp; WCAG 2.2 AA Conformance
            </h2>
            <p className="text-xs text-phumulani-cream mt-1 font-sans">
              Phumulani is committed to ensuring full digital inclusion and dignified usability for people with all physical, sensory, and cognitive abilities.
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
            <div className="bg-phumulani-charcoal p-4 rounded-xl border border-white/15 space-y-2">
              <div className="font-bold text-phumulani-gold font-heading">Keyboard Navigation</div>
              <p className="text-phumulani-cream leading-relaxed font-sans">
                Full Tab, Shift+Tab, and Enter keyboard focus traversal with visible high-contrast focus rings and zero keyboard traps.
              </p>
            </div>

            <div className="bg-phumulani-charcoal p-4 rounded-xl border border-white/15 space-y-2">
              <div className="font-bold text-phumulani-gold font-heading">Screen Reader Support</div>
              <p className="text-phumulani-cream leading-relaxed font-sans">
                Semantic HTML5 landmarks (header, nav, main, section, footer) and explicit ARIA labels for non-text SVGs and modal dialogues.
              </p>
            </div>

            <div className="bg-phumulani-charcoal p-4 rounded-xl border border-white/15 space-y-2">
              <div className="font-bold text-phumulani-gold font-heading">Contrast &amp; Scalability</div>
              <p className="text-phumulani-cream leading-relaxed font-sans">
                Color contrast ratios meet or exceed 4.5:1 for body copy and 7:1 for headings. Text can be enlarged up to 200% without loss of layout.
              </p>
            </div>

            <div className="bg-phumulani-charcoal p-4 rounded-xl border border-white/15 space-y-2">
              <div className="font-bold text-phumulani-gold font-heading">Emergency Safe Exit</div>
              <p className="text-phumulani-cream leading-relaxed font-sans">
                Double-pressing the <kbd className="bg-phumulani-charcoal px-1.5 py-0.5 rounded text-[10px] border border-white/25">ESC</kbd> key anywhere immediately replaces the current page with weather.com for personal safety.
              </p>
            </div>
          </div>

          <div className="text-[11px] text-phumulani-cream border-t border-white/15 pt-4 flex flex-wrap justify-between items-center gap-3">
            <span>
              Accessibility Coordinator: <code>access@phumulani.org</code> · Designed in continuous conformance with WCAG 2.2 Level AA guidelines.
            </span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-phumulani-gold hover:text-white font-semibold underline underline-offset-4 cursor-pointer focus-visible:ring-2 focus-visible:ring-phumulani-gold rounded"
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
          className="fixed inset-0 z-50 bg-phumulani-charcoal/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-phumulani-charcoal/15 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-phumulani-charcoal/12 pb-4">
              <div>
                <span className="text-xs font-bold font-heading text-phumulani-earth uppercase tracking-wider">
                  Program Deep Dive
                </span>
                <h3 className="font-heading text-2xl font-bold text-phumulani-charcoal mt-1">
                  {selectedProgram.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProgram(null)}
                aria-label="Close program dialog"
                className="p-1.5 text-phumulani-charcoal hover:text-phumulani-earth rounded-md cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-phumulani-charcoal leading-relaxed font-medium italic">
              &ldquo;{selectedProgram.tagline}&rdquo;
            </p>

            <div className="text-xs text-phumulani-charcoal space-y-3 leading-relaxed">
              <p>{selectedProgram.fullDetails}</p>
            </div>

            <div className="bg-phumulani-cream p-4 rounded-xl space-y-2 text-xs border border-phumulani-charcoal/12">
              <div className="font-bold font-heading text-phumulani-charcoal">Eligibility &amp; Access</div>
              <p className="text-phumulani-charcoal">{selectedProgram.eligibility}</p>
              <div className="pt-2 flex flex-wrap gap-4 text-phumulani-charcoal text-[11px]">
                <span>Lead Coordinator: <strong>{selectedProgram.leadCoordinator}</strong></span>
                <span>Contact: <strong>{selectedProgram.contactEmail}</strong></span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setSelectedProgram(null)}
                className="px-4 py-2 border border-phumulani-charcoal/20 text-phumulani-charcoal rounded-lg text-xs font-semibold hover:bg-phumulani-cream cursor-pointer transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedProgram(null);
                  document.getElementById('get-involved-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-2 bg-phumulani-earth text-white rounded-lg text-xs font-semibold hover:bg-phumulani-charcoal cursor-pointer transition-colors"
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
          className="fixed inset-0 z-50 bg-phumulani-charcoal/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full border border-phumulani-charcoal/15 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-phumulani-charcoal/12 pb-3">
              <div>
                <span className="text-[10px] font-bold font-heading text-phumulani-earth uppercase tracking-wider">
                  Volunteer Application
                </span>
                <h3 className="font-heading text-xl font-bold text-phumulani-charcoal mt-0.5">
                  {selectedOpportunity.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOpportunity(null)}
                aria-label="Close volunteer application dialog"
                className="p-1.5 text-phumulani-charcoal hover:text-phumulani-earth cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleVolunteerSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-phumulani-charcoal mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={volFullName}
                  onChange={(e) => setVolFullName(e.target.value)}
                  placeholder="Amara Diallo"
                  className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-phumulani-charcoal mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={volEmail}
                    onChange={(e) => setVolEmail(e.target.value)}
                    placeholder="amara@example.com"
                    className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-phumulani-charcoal mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={volPhone}
                    onChange={(e) => setVolPhone(e.target.value)}
                    placeholder="(612) 555-0192"
                    className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-phumulani-charcoal mb-1">Preferred Language(s)</label>
                  <input
                    type="text"
                    value={volLanguage}
                    onChange={(e) => setVolLanguage(e.target.value)}
                    placeholder="English, Somali, French..."
                    className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-phumulani-charcoal mb-1">Availability</label>
                  <select
                    value={volAvailability}
                    onChange={(e) => setVolAvailability(e.target.value)}
                    className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20 outline-none bg-white text-xs"
                  >
                    <option value="Weekday Evenings">Weekday Evenings</option>
                    <option value="Saturday Mornings">Saturday Mornings</option>
                    <option value="Sunday Afternoons">Sunday Afternoons</option>
                    <option value="Flexible Remote">Flexible Remote</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-phumulani-charcoal mb-1">Skills &amp; Experience</label>
                <input
                  type="text"
                  value={volSkills}
                  onChange={(e) => setVolSkills(e.target.value)}
                  placeholder="e.g. Tutoring, HR, Legal research, Event organizing"
                  className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-phumulani-charcoal mb-1">Why do you want to volunteer with Phumulani?</label>
                <textarea
                  rows={3}
                  required
                  value={volMotivation}
                  onChange={(e) => setVolMotivation(e.target.value)}
                  placeholder="Share a few sentences about your motivation..."
                  className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20 outline-none"
                />
              </div>

              <div className="p-3 bg-phumulani-cream border border-phumulani-charcoal/12 rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="safeAck"
                    required
                    checked={volSafeguardingCheck}
                    onChange={(e) => setVolSafeguardingCheck(e.target.checked)}
                    className="mt-0.5 rounded text-phumulani-earth"
                  />
                  <label htmlFor="safeAck" className="text-[11px] text-phumulani-earth font-medium">
                    I agree to adhere to Phumulani’s strict survivor confidentiality policies, undergo standard screening, and complete the mandatory safeguarding orientation module before placement.
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOpportunity(null)}
                  className="px-4 py-2 border border-phumulani-charcoal/20 text-phumulani-charcoal rounded-lg font-medium hover:bg-phumulani-cream cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-phumulani-earth hover:bg-phumulani-charcoal text-white rounded-lg font-bold cursor-pointer transition-colors"
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
          className="fixed inset-0 z-50 bg-phumulani-charcoal/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-md w-full border border-phumulani-charcoal/15 shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-phumulani-charcoal/12 pb-3">
              <div>
                <span className="text-[10px] font-bold font-heading text-phumulani-earth uppercase tracking-wider">
                  Event Registration
                </span>
                <h3 className="font-heading text-lg font-bold text-phumulani-charcoal mt-0.5">
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                aria-label="Close event dialog"
                className="p-1 text-phumulani-charcoal hover:text-phumulani-earth cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRsvpSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-phumulani-charcoal mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-phumulani-charcoal mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={rsvpEmail}
                  onChange={(e) => setRsvpEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-phumulani-charcoal mb-1">Phone (Optional for SMS reminders)</label>
                <input
                  type="tel"
                  value={rsvpPhone}
                  onChange={(e) => setRsvpPhone(e.target.value)}
                  placeholder="612-555-0100"
                  className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20 outline-none"
                />
              </div>

              <div className="p-3 bg-phumulani-cream border border-phumulani-charcoal/12 rounded-lg text-[11px] text-phumulani-charcoal space-y-1 tabular-nums">
                <div><strong>Accessibility notes:</strong> {selectedEvent.accessibilityNotes}</div>
                <div><strong>Live capacity check:</strong> {selectedEvent.registeredCount} / {selectedEvent.capacity} booked</div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="px-3.5 py-2 border border-phumulani-charcoal/20 text-phumulani-charcoal rounded-lg hover:bg-phumulani-cream cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-phumulani-earth hover:bg-phumulani-charcoal text-white rounded-lg font-bold cursor-pointer transition-colors"
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
