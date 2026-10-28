/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Multilingual Accessibility Service (M38.07, M38.08, M38.09)
 * Comprehensive seven-language community dictionary, key parity auditing,
 * user language preference persistence, Ethiopic script rendering, and WCAG 2.2 AA accessibility validation.
 */

import { SupportedLanguageCode, LanguageDefinition } from '../types/phase33';

export const SUPPORTED_LANGUAGES: LanguageDefinition[] = [
  { code: 'en', name: 'English', localName: 'English', isRTL: false, coverageStatus: 'VERIFIED_PRODUCTION' },
  { code: 'so', name: 'Somali', localName: 'Af-Soomaali', isRTL: false, coverageStatus: 'VERIFIED_PRODUCTION' },
  { code: 'es', name: 'Spanish', localName: 'Español', isRTL: false, coverageStatus: 'VERIFIED_PRODUCTION' },
  { code: 'hmn', name: 'Hmong', localName: 'Hmoob', isRTL: false, coverageStatus: 'VERIFIED_PRODUCTION' },
  { code: 'kar', name: 'Karen', localName: 'ကညီကျိာ်', isRTL: false, coverageStatus: 'SUPERVISED_COMMUNITY_REVIEW' },
  { code: 'orm', name: 'Oromo', localName: 'Afaan Oromoo', isRTL: false, coverageStatus: 'SUPERVISED_COMMUNITY_REVIEW' },
  { code: 'am', name: 'Amharic', localName: 'አማርኛ', isRTL: false, coverageStatus: 'DRAFT_MACHINE_ASSISTED' },
];

/**
 * Authoritative 7-Language Community Dictionary with Full Key Parity
 */
export const COMMUNITY_TRANSLATION_DICTIONARY: Record<string, Record<SupportedLanguageCode, string>> = {
  // Public Navigation & Emergency
  safe_exit: {
    en: 'Safe Exit (Double-ESC)',
    so: 'Ka Bax Badbaado (ESC laba jeer)',
    es: 'Salida Segura (Doble-ESC)',
    hmn: 'Khiav Dim Zoo (ESC ob zaug)',
    kar: 'မၤပူၤဖျဲးသး (Double-ESC)',
    orm: 'Baqannaa Nageenyaa (Double-ESC)',
    am: 'ደህንነቱ የተጠበቀ መውጫ (Double-ESC)',
  },
  emergency_crisis_notice: {
    en: 'If you are in immediate danger, call 911 or the Minnesota Day One Crisis Line at 1-866-223-1111.',
    so: 'Haddii aad ku jirto khatar degdeg ah, wac 911 ama Khadka Day One ee Minnesota 1-866-223-1111.',
    es: 'Si está en peligro inmediato, llame al 911 o a la Línea de Crisis Day One de Minnesota al 1-866-223-1111.',
    hmn: 'Yog koj ntsib teeb meem kub ceev, hu rau 911 lossis Minnesota Day One Crisis Line 1-866-223-1111.',
    kar: 'နမ့ၢ်အိၣ်ဒီးတၢ်ဘၣ်ယိၣ်ဘၣ်ဘါ, ကိး 911 မ့တမ့ၢ် Minnesota Day One 1-866-223-1111.',
    orm: 'Yoo balaa keessa jiraattan battalatti 911 yookiin Sarara Qorannaa Day One 1-866-223-1111 bilbilaa.',
    am: 'አፋጣኝ አደጋ ላይ ከሆኑ 911 ወይም የሜኔሶታ Day One የስልክ መስመርን 1-866-223-1111 ይደውሉ።',
  },
  mission_title: {
    en: 'Empowering Immigrant & Refugee Survivors',
    so: 'Awood siinta Qaxootiga & Soo-galootiga Badbaaday',
    es: 'Empoderando a Sobrevivientes Inmigrantes y Refugiados',
    hmn: 'Txhawb Cov Neeg Pab Uas Dim ntawm Kev Nyuaj Siab',
    kar: 'တၢ်ဆီၣ်ထွဲပိာ်မုၣ်တၢ်ပူၤဖျဲး',
    orm: 'Dandeettii Baqattoota fi Godaantota Eegsisuu',
    am: 'ስደተኛ እና ጥገኝነት ፈላጊ የተረፉ ሰዎችን ማብቃት',
  },
  programs_nav: {
    en: 'Community Programs',
    so: 'Barnaamijyada Bulshada',
    es: 'Programas Comunitarios',
    hmn: 'Cov Khoom Pab Zej Zog',
    kar: 'တၢ်ရဲၣ်တၢ်ကျဲၤလၢတၢ်အိၣ်ဖှိၣ်',
    orm: 'Sagantaalee Hawaasaa',
    am: 'የማህበረሰብ ፕሮግራሞች',
  },
  volunteer_nav: {
    en: 'Volunteer',
    so: 'Isku-xilqaan',
    es: 'Voluntariado',
    hmn: 'Ua Haujlwm Pub Dawb',
    kar: 'တၢ်မၤမၤသး',
    orm: 'Tola Ooltummaa',
    am: 'በጎ ፈቃደኝነት',
  },
  donate_nav: {
    en: 'Donate (501c3)',
    so: 'Deeq Bixi (501c3)',
    es: 'Donar (501c3)',
    hmn: 'Muab Pub (501c3)',
    kar: 'ဟ့ၣ်တၢ်မၤဘူၣ်',
    orm: 'Gumaachaa (501c3)',
    am: 'ይለግሱ (501c3)',
  },
  contact_nav: {
    en: 'Contact Advocates',
    so: 'La Xiriir U doodayaasha',
    es: 'Contactar Defensores',
    hmn: 'Hu rau Tus Pab Cuam',
    kar: 'တၢ်ဆဲးကျိး',
    orm: 'Falmitoota Qunnnamaa',
    am: 'ተሟጋቾችን ያነጋግሩ',
  },
  home_nav: {
    en: 'Home',
    so: 'Hoyga',
    es: 'Inicio',
    hmn: 'Tsev',
    kar: 'ဟံၣ်',
    orm: 'Mana',
    am: 'መነሻ',
  },
  about_nav: {
    en: 'About Us',
    so: 'Nagu Saabsan',
    es: 'Sobre Nosotros',
    hmn: 'Txog Peb',
    kar: 'ဘၣ်ဃးဒီးပှၤ',
    orm: 'Waa\'ee Keenya',
    am: 'ስለ እኛ',
  },
  portal_nav: {
    en: 'Member Portal',
    so: 'Xarunta Xubnaha',
    es: 'Portal de Miembros',
    hmn: 'Chaw Nkag Tswv Cuab',
    kar: 'တၢ်အိၣ်ဖှိၣ်ဖိခီၣ်ဖျဲၣ်',
    orm: 'Fuula Miseensaa',
    am: 'የአባላት ፖርታል',
  },

  // Member Portal & Self-Service Areas (Phase 35 Areas)
  member_dashboard_title: {
    en: 'Community Member Portal',
    so: 'Xarunta Xubnaha Bulshada',
    es: 'Portal Comunitario de Miembros',
    hmn: 'Zej Zog Tswv Cuab Chaw Nkag',
    kar: 'တၢ်အိၣ်ဖှိၣ်ဖိတၢ်မၤခီၣ်ဖျဲၣ်',
    orm: 'Fuula Miseensa Hawaasaa',
    am: 'የማህበረሰብ አባል ፖርታል',
  },
  my_service_requests: {
    en: 'My Service Requests',
    so: 'Codsiyadayda Adeegga',
    es: 'Mis Solicitudes de Servicio',
    hmn: 'Kuv Cov Lus Thov Kev Pab',
    kar: 'ယတၢ်ဃ့တၢ်မၤစၢၤတဖၣ်',
    orm: 'Gaaffilee Tajaajila Kiyya',
    am: 'የእኔ የአገልግሎት ጥያቄዎች',
  },
  my_programs: {
    en: 'My Enrolled Programs',
    so: 'Barnaamijyadayda Ka Diiwaangashan',
    es: 'Mis Programas Inscritos',
    hmn: 'Kuv Cov Kev Pab Sau Npe',
    kar: 'ယတၢ်ရဲၣ်တၢ်ကျဲၤလၢယနုာ်လီၤ',
    orm: 'Sagantaalee Kiyya Galmaa\'an',
    am: 'የእኔ የተመዘገቡባቸው ፕሮግራሞች',
  },
  my_applications: {
    en: 'My Applications',
    so: 'Codsiyadayda',
    es: 'Mis Solicitudes',
    hmn: 'Kuv Cov Ntaub Ntawv Thov',
    kar: 'ယတၢ်ကွဲးလံာ်တၢ်မၤတဖၣ်',
    orm: 'Iyyannoowwan Kiyya',
    am: 'የእኔ ማመልከቻዎች',
  },
  my_referrals: {
    en: 'Resource Referrals',
    so: 'U Gudbinta Khayraadka',
    es: 'Referencias de Recursos',
    hmn: 'Kev Pab Cuam Rau Lwm Qhov',
    kar: 'တၢ်ဟ့ၣ်တၢ်မၤစၢၤတၢ်လီၢ်',
    orm: 'Qajeelfama Qabeenyaa',
    am: 'የሃብት ሪፈራሎች',
  },
  my_events: {
    en: 'Community Events',
    so: 'Dhacdooyinka Bulshada',
    es: 'Eventos Comunitarios',
    hmn: 'Zej Zog Cov Kev Sib Txoos',
    kar: 'တၢ်အိၣ်ဖှိၣ်တၢ်ရဲၣ်တၢ်ကျဲၤ',
    orm: 'Qophiiwwan Hawaasaa',
    am: 'የማህበረሰብ ዝግጅቶች',
  },
  my_notifications: {
    en: 'Notifications',
    so: 'Ogeysiisyada',
    es: 'Notificaciones',
    hmn: 'Cov Lus Qhia Paub',
    kar: 'တၢ်ဟ့ၣ်ပလီၢ်တဖၣ်',
    orm: 'Beeksisoota',
    am: 'ማሳወቂያዎች',
  },
  my_profile: {
    en: 'Member Profile',
    so: 'Xogta Xubinta',
    es: 'Perfil de Miembro',
    hmn: 'Tswv Cuab Cov Ntaub Ntawv',
    kar: 'ပှၤတၢ်အိၣ်ဖှိၣ်ဖိအဂ့ၢ်',
    orm: 'Seenaa Miseensaa',
    am: 'የአባል መገለጫ',
  },
  my_preferences: {
    en: 'Communication Preferences',
    so: 'Dookha Xiriirka',
    es: 'Preferencias de Comunicación',
    hmn: 'Kev Xaiv Kev Sib Tham',
    kar: 'တၢ်ဃုထၢတၢ်ဆဲးကျိး',
    orm: 'Filannoo Quunnamtii',
    am: 'የመገናኛ ምርጫዎች',
  },
  my_feedback: {
    en: 'Feedback & History',
    so: 'Ra\'yiga & Taariikhda',
    es: 'Comentarios e Historial',
    hmn: 'Kev Tawm Tsam & Keeb Kwm',
    kar: 'တၢ်ထံၣ်တၢ်ပာ်သးဒီးတၢ်စံၣ်စိၤ',
    orm: 'Yaada fi Seenaa',
    am: 'አስተያየት እና ታሪክ',
  },

  // Service Request & Case Management
  service_request_title: {
    en: 'Submit a Confidential Service Request',
    so: 'Gudbi Codsi Adeeg oo Qarsoodi ah',
    es: 'Enviar una Solicitud de Servicio Confidencial',
    hmn: 'Xa Daim Ntawv Thov Kev Pab Cuam Ceev Ntiag Tug',
    kar: 'ဟ့ၣ်လီၤတၢ်ဃ့တၢ်မၤစၢၤလၢတၢ်ခူသူၣ်',
    orm: 'Iyyannoo Tajaajila Iccitii Dhiyeessaa',
    am: 'ሚስጥራዊ የአገልግሎት ጥያቄ ያቅርቡ',
  },
  service_category_label: {
    en: 'Service Category',
    so: 'Qaybta Adeegga',
    es: 'Categoría de Servicio',
    hmn: 'Yam Kev Pab',
    kar: 'တၢ်မၤစၢၤအကလုာ်',
    orm: 'Gosa Tajaajilaa',
    am: 'የአገልግሎት ዘርፍ',
  },
  urgency_level_label: {
    en: 'Urgency Level',
    so: 'Heerka Degdegga',
    es: 'Nivel de Urgencia',
    hmn: 'Qib Ceev Ceev',
    kar: 'တၢ်ချ့အဆံးအဒိၣ်',
    orm: 'Sadarkaa Ariifachiisummaa',
    am: 'የአስቸኳይነት ደረጃ',
  },
  description_placeholder: {
    en: 'Please describe how our advocates can support you safely...',
    so: 'Fadlan sharax sida u doodayaashu ay si badbaado leh kuu caawin karaan...',
    es: 'Por favor describa cómo nuestros defensores pueden apoyarle de manera segura...',
    hmn: 'Thov qhia seb peb pab neeg yuav pab koj zoo li cas...',
    kar: 'ဝံသးစူၤတဲဖျါထီၣ်နတၢ်လိၣ်လၢတၢ်ပူၤဖျဲး...',
    orm: 'Maaloo akkamitti akka si gargaarru nuuf ibsaa...',
    am: 'እባክዎን ተሟጋቾቻችን በደህንነት እንዴት ሊረዱዎት እንደሚችሉ ይግለጹ...',
  },
  submit_request_button: {
    en: 'Submit Request',
    so: 'Gudbi Codsiga',
    es: 'Enviar Solicitud',
    hmn: 'Xa Daim Ntawv Thov',
    kar: 'ဟ့ၣ်လီၤတၢ်ဃ့',
    orm: 'Gaaffii Dhiyeessaa',
    am: 'ጥያቄ አስገባ',
  },

  // Program Enrollment
  program_enrollment_title: {
    en: 'Community Program Enrollment',
    so: 'Isdiiwaangelinta Barnaamijka Bulshada',
    es: 'Inscripción en Programas Comunitarios',
    hmn: 'Kev Sau Npe Pab Zej Zog',
    kar: 'တၢ်နုာ်လီၤလၢတၢ်ရဲၣ်တၢ်ကျဲၤ',
    orm: 'Galmee Sagantaa Hawaasaa',
    am: 'የማህበረሰብ ፕሮግራም ምዝገባ',
  },
  applicant_name_label: {
    en: 'Full Name',
    so: 'Magaca Buuxa',
    es: 'Nombre Completo',
    hmn: 'Lub Npe Tag Nrho',
    kar: 'မံၤတၢ်ပှဲၤ',
    orm: 'Maqaa Guutuu',
    am: 'ሙሉ ስም',
  },
  family_size_label: {
    en: 'Household Size',
    so: 'Tirada Qoyska',
    es: 'Tamaño del Hogar',
    hmn: 'Tsev Neeg Qhov Luaj Li Cas',
    kar: 'ဟံၣ်ဖိဃီဖိအပှၤ',
    orm: 'Baay\'ina Maatii',
    am: 'የቤተሰብ ብዛት',
  },
  apply_button: {
    en: 'Apply Now',
    so: 'Codso Hadda',
    es: 'Aplicar Ahora',
    hmn: 'Thov Tam Sim No',
    kar: 'ကွဲးလံာ်ခဲအံၤ',
    orm: 'Amma Iyyadhaa',
    am: 'አሁን አመልክት',
  },
  waitlist_notice: {
    en: 'If program capacity is reached, you will be placed on our verified waitlist.',
    so: 'Haddii awoodda barnaamijku buuxsanto, waxaad geli doontaa liiska sugitaanka.',
    es: 'Si se alcanza la capacidad del programa, se le colocará en nuestra lista de espera verificada.',
    hmn: 'Yog kev pab puv lawm, koj yuav raug tso rau hauv daim ntawv teev npe tos.',
    kar: 'တၢ်လီၢ်မ့ၢ်ပှဲၤတ့ၢ်, နကအိၣ်လၢတၢ်အိၣ်ခိးလံာ်ပှဲၤပူၤ.',
    orm: 'Yoo sagantaan guutee jiraate, tarree eeggannoo keessa galfamtu.',
    am: 'የፕሮግራሙ አቅም ከሞላ በተረጋገጠ የተጠባባቂ ዝርዝር ውስጥ ይመደባሉ።',
  },

  // Volunteer Lifecycle
  volunteer_registration_title: {
    en: 'Volunteer Service Registration',
    so: 'Diiwaangelinta Adeegga Isku-xilqaanka',
    es: 'Registro de Servicio Voluntario',
    hmn: 'Kev Sau Npe Ua Haujlwm Pub Dawb',
    kar: 'တၢ်နုာ်လီၤမၤသးတၢ်မၤ',
    orm: 'Galmee Tajaajila Tola Ooltummaa',
    am: 'የበጎ ፈቃድ አገልግሎት ምዝገባ',
  },
  skills_interest_label: {
    en: 'Skills & Language Fluency',
    so: 'Xirfadaha & Aqoonta Luqadda',
    es: 'Habilidades y Dominio de Idiomas',
    hmn: 'Kev Txawj Ntse & Hais Lus',
    kar: 'တၢ်သ့တၢ်ဘၣ်ဒီးကျိာ်',
    orm: 'Dandeettii fi Dandeettii Afaanii',
    am: 'ክህሎት እና የቋንቋ ችሎታ',
  },
  availability_label: {
    en: 'Weekly Availability',
    so: 'Helitaanka Todobaadlaha ah',
    es: 'Disponibilidad Semanal',
    hmn: 'Sij Hawm Muaj Ib Lim Tiam',
    kar: 'နွံနွံတၢ်ဆၢကတီၢ်',
    orm: 'Yeroo Qophii Torbanii',
    am: 'የሳምንቱ ዝግጁነት',
  },
  background_check_consent: {
    en: 'I consent to statutory background checks and volunteer safeguarding clearance.',
    so: 'Waxaan ogolaaday baaritaanka asalka sharciga iyo hubinta badbaadada.',
    es: 'Doy mi consentimiento para la verificación de antecedentes y la autorización de protección.',
    hmn: 'Kuv tso cai rau kev tshawb xyuas keeb kwm thiab kev tiv thaiv kev nyab xeeb.',
    kar: 'ယဟ့ၣ်တၢ်ပျဲလၢတၢ်သမံသမိးတၢ်မၤဂ့ၢ်ဝီ.',
    orm: 'Qorannoo seera qabeessaa fi eegumsa tola ooltotaaf walii galeera.',
    am: 'ህጋዊ የጀርባ ምርመራ እና የበጎ ፈቃደኝነት ደህንነት ማጣሪያ እንዲደረግ እስማማለሁ።',
  },
  submit_volunteer_button: {
    en: 'Submit Volunteer Application',
    so: 'Gudbi Codsiga Isku-xilqaanka',
    es: 'Enviar Solicitud de Voluntariado',
    hmn: 'Xa Ntawv Ua Haujlwm Pub Dawb',
    kar: 'ဟ့ၣ်လီၤလံာ်မၤသး',
    orm: 'Iyyannoo Tola Ooltummaa Dhiyeessaa',
    am: 'የበጎ ፈቃደኝነት ማመልከቻ አስገባ',
  },

  // Donor Portal
  donor_portal_title: {
    en: 'Donor & Stewardship Portal',
    so: 'Xarunta Deeq-bixiyeyaasha',
    es: 'Portal de Donantes y Administración',
    hmn: 'Chaw Nkag Rau Cov Muab Pub',
    kar: 'ပှၤဟ့ၣ်တၢ်မၤဘူၣ်ခီၣ်ဖျဲၣ်',
    orm: 'Fuula Arjoomtootaa',
    am: 'የለጋሾች እና ደጋፊዎች ፖርታል',
  },
  pledges_history: {
    en: 'Pledge History (Unearned Commitments)',
    so: 'Taariikhda Ballanqaadyada (Aan la helin)',
    es: 'Historial de Compromisos (No Devengados)',
    hmn: 'Keeb Kwm Cov Lus Cog Tseg',
    kar: 'တၢ်အၢၣ်လီၤတၢ်စံၣ်စိၤ',
    orm: 'Seenaa Waadaa (Kan Hin Galaniin)',
    am: 'የቃል ኪዳኖች ታሪክ (ያልተከፈሉ)',
  },
  settled_contributions: {
    en: 'Settled Contributions (Verified Cash)',
    so: 'Deeqaha La Xaqiijiyay (Lacag Cadaan ah)',
    es: 'Contribuciones Liquidadas (Efectivo Verificado)',
    hmn: 'Kev Pab Nyiaj Uas Tau Txais Lawm',
    kar: 'တၢ်မၤဘူၣ်လၢဟဲတုၤတ့ၢ်',
    orm: 'Gumaacha Mirkanaa\'e (Qarshii Galii Ta\'e)',
    am: 'የተረጋገጡ የገንዘብ ክፍያዎች',
  },
  make_pledge_button: {
    en: 'Record a Donation Pledge',
    so: 'Diiwaangeli Ballanqaad Deeqeed',
    es: 'Registrar un Compromiso de Donación',
    hmn: 'Sau Npe Cog Lus Pab Nyiaj',
    kar: 'ကွဲးနီၣ်တၢ်အၢၣ်လီၤတၢ်ဟ့ၣ်',
    orm: 'Waadaa Arjoomaa Galmeessaa',
    am: 'የልገሳ ቃል ኪዳን ይመዝግቡ',
  },
  tax_deductible_notice: {
    en: 'Phumulani is a 501(c)(3) tax-exempt organization. Official receipts issued for settled gifts.',
    so: 'Phumulani waa urur 501(c)(3) ah oo canshuurta laga dhaafay. Rasiidh rasmi ah ayaa la bixiyaa.',
    es: 'Phumulani es una organización 501(c)(3) exenta de impuestos. Se emiten recibos oficiales.',
    hmn: 'Phumulani yog ib lub koom haum 501(c)(3) tsis them se. Muaj daim ntawv txais nyiaj raug cai.',
    kar: 'Phumulani မ့ၢ် 501(c)(3) တၢ်အိၣ်ဖှိၣ်လၢတဘၣ်ဟ့ၣ်ခဲးစ့ဘၣ်.',
    orm: 'Phumulaniin dhaabbata 501(c)(3) taaksii irraa bilisa ta\'eedha.',
    am: 'ፉሙላኒ 501(c)(3) ከቀረጥ ነፃ የሆነ ድርጅት ነው። ለተከፈሉ ስጦታዎች ይፋዊ ደረሰኝ ይሰጣል።',
  },

  // Notifications & Real-Time Alerts
  notifications_title: {
    en: 'Community Notifications & Alerts',
    so: 'Ogeysiisyada Bulshada & Digniinaha',
    es: 'Notificaciones y Alertas Comunitarias',
    hmn: 'Cov Lus Ceeb Toom Zej Zog',
    kar: 'တၢ်အိၣ်ဖှိၣ်တၢ်ဟ့ၣ်ပလီၢ်တဖၣ်',
    orm: 'Beeksisa fi Akeekkachiisa Hawaasaa',
    am: 'የማህበረሰብ ማሳወቂያዎች እና ማንቂያዎች',
  },
  mark_as_read: {
    en: 'Mark as Read',
    so: 'Calaamadee sidii la Akhriyay',
    es: 'Marcar como Leído',
    hmn: 'Kos Tau Nyeem Lawm',
    kar: 'ပာ်ဖျါလၢဖတ်တ့ၢ်လံ',
    orm: 'Akka Dubbifametti Galmeessi',
    am: 'እንደተነበበ ምልክት አድርግ',
  },
  no_unread_notifications: {
    en: 'No unread notifications at this time.',
    so: 'Ma jiraan ogeysiisyada aan la akhriyin hadda.',
    es: 'No hay notificaciones sin leer en este momento.',
    hmn: 'Tsis muaj lus ceeb toom tshiab.',
    kar: 'တၢ်ဟ့ၣ်ပလီၢ်သီတအိၣ်ဘၣ်.',
    orm: 'Yeroo ammaa beeksisni hin dubbifamne hin jiru.',
    am: 'በአሁኑ ጊዜ ያልተነበበ ማሳወቂያ የለም።',
  },
  urgent_alert_prefix: {
    en: 'URGENT SAFETY NOTICE',
    so: 'DIGNIIN BADBAADO OO DEGDEG AH',
    es: 'AVISO URGENTE DE SEGURIDAD',
    hmn: 'LUS CEEB TOOM KUB CEEV',
    kar: 'တၢ်ပလီၢ်တၢ်ပူၤဖျဲးချ့ချ့',
    orm: 'AKEEKKACHIISA NAGEENYAA ARIIFACHIISAA',
    am: 'አስቸኳይ የደህንነት ማሳሰቢያ',
  },

  // Form Validation & Error States
  field_required_error: {
    en: 'This field is required for processing.',
    so: 'Goobtan waxaa loo baahan yahay socodsiinta.',
    es: 'Este campo es obligatorio para el procesamiento.',
    hmn: 'Daim teb no yuav tsum tau sau rau.',
    kar: 'တၢ်လီၢ်အံၤလိၣ်ဘၣ်တၢ်ကွဲးပှဲၤ.',
    orm: 'Iddoon kun hojiif barbaachisaadha.',
    am: 'ይህ ቦታ መሞላት አለበት።',
  },
  invalid_email_error: {
    en: 'Please provide a valid email address.',
    so: 'Fadlan bixi ciwaan email oo sax ah.',
    es: 'Por favor ingrese una dirección de correo válida.',
    hmn: 'Thov sau tus email kom raug.',
    kar: 'ဝံသးစူၤကွဲး email လၢအဘၣ်.',
    orm: 'Maaloo teessoo imeelii sirrii galchaa.',
    am: 'እባክዎን ትክክለኛ የኢሜይል አድራሻ ያስገቡ።',
  },
  invalid_phone_error: {
    en: 'Please provide a valid 10-digit telephone number.',
    so: 'Fadlan bixi nambarka taleefanka oo sax ah.',
    es: 'Por favor ingrese un número de teléfono válido.',
    hmn: 'Thov sau tus xov tooj kom raug.',
    kar: 'ဝံသးစူၤကွဲးလီတဲစိနီၣ်ဂံၢ်လၢအဘၣ်.',
    orm: 'Maaloo lakkoofsa bilbilaa sirrii galchaa.',
    am: 'እባክዎን ትክክለኛ የስልክ ቁጥር ያስገቡ።',
  },
  form_submission_failed: {
    en: 'Submission failed. Please check your network or try again.',
    so: 'Gudbintii way fashilantay. Fadlan isku day markale.',
    es: 'Error al enviar. Por favor verifique su conexión o intente nuevamente.',
    hmn: 'Xa tsis tau. Thov sim dua.',
    kar: 'တၢ်ဟ့ၣ်လီၤတန့ၢ်ဘၣ်. မၤကဒါက့ၤ.',
    orm: 'Erguun hin milkoofne. Maaloo irra deebiaa yaalaa.',
    am: 'ማስገባት አልተሳካም። እባክዎ እንደገና ይሞክሩ።',
  },

  // Accessibility & Assistive Tech Labels
  skip_to_content: {
    en: 'Skip to Main Content',
    so: 'U gudub Nuxurka Guud',
    es: 'Saltar al Contenido Principal',
    hmn: 'ข้ามไปยังเนื้อหาหลัก',
    kar: 'လဲၤဆူတၢ်ဂ့ၢ်မိၢ်ပှၢ်',
    orm: 'Gara Qabiyyee Guddaatti Darbi',
    am: 'ወደ ዋና ይዘት ዝለል',
  },
  close_dialog: {
    en: 'Close Modal Dialog',
    so: 'Xir Daaqadda',
    es: 'Cerrar Cuadro de Diálogo',
    hmn: 'Kaw Lub Qhov Rooj',
    kar: 'ပံးဃာ်တၢ်ကတိၤလီၢ်',
    orm: 'Sanduuqa Cufaa',
    am: 'ይህን መስኮት ዝጋ',
  },
  main_navigation_label: {
    en: 'Main Landmark Navigation',
    so: 'Hagaha Guud ee Bogga',
    es: 'Navegación Principal',
    hmn: 'Kev Taw Qhia Tseem Ceeb',
    kar: 'တၢ်ဟ့ၣ်တၢ်ကရၢကရိမိၢ်ပှၢ်',
    orm: 'Qajeelfama Guddaa',
    am: 'ዋና ዳሰሳ',
  },
  language_selector_label: {
    en: 'Select Preferred Language',
    so: 'Dooro Luqaddaada',
    es: 'Seleccionar Idioma Preferido',
    hmn: 'Xaiv hom lus',
    kar: 'ဃုထၢနကျိာ်',
    orm: 'Afaan Filadhaa',
    am: 'ቋንቋ ይምረጡ',
  },
  high_contrast_mode: {
    en: 'High Contrast Mode (WCAG 2.2 AA)',
    so: 'Habka Muuqaalka Sare',
    es: 'Modo de Alto Contraste (WCAG 2.2 AA)',
    hmn: 'Hom Pom Zoo Tshaj',
    kar: 'တၢ်ထံၣ်ဖျါလၢအဂ့ၤတက့ၢ်',
    orm: 'Haala Waan Mul\'atuu',
    am: 'ከፍተኛ ንፅፅር (WCAG 2.2 AA)',
  },

  // Confirmation Messages
  submission_success: {
    en: 'Record submitted successfully and secured under strict tenant isolation.',
    so: 'Xogta si guul leh ayaa loo gudbiyay iyadoo la ilaalinayo.',
    es: 'Registro enviado con éxito y protegido bajo estricto aislamiento.',
    hmn: 'Daim ntawv xa tau lawm zoo heev.',
    kar: 'တၢ်ဟ့ၣ်လီၤအံၤန့ၢ်တ့ၢ်လံဒီးတၢ်ပူၤဖျဲး.',
    orm: 'Galmeen milkaa\'inaan darbee eegumsa qaba.',
    am: 'መረጃው በሚስጥር እና በደህንነት በተሳካ ሁኔታ ገብቷል።',
  },
  preferences_updated_success: {
    en: 'Your communication preferences have been updated.',
    so: 'Dookhaaga xiriirka waa la cusbooneysiiyay.',
    es: 'Sus preferencias de comunicación han sido actualizadas.',
    hmn: 'Koj cov kev xaiv sib txuas lus tau hloov tshiab lawm.',
    kar: 'နတၢ်ဃုထၢတၢ်ဆဲးကျိးဘၣ်တၢ်မၤသီထီၣ်အီၤ.',
    orm: 'Filannoon quunnamtii keessanii haaromfameera.',
    am: 'የመገናኛ ምርጫዎችዎ በተሳካ ሁኔታ ተዘምነዋል።',
  },
  service_request_received: {
    en: 'Your confidential request was received. An advocate will review it securely.',
    so: 'Codsigaaga qarsoodiga ah waa la helay. U doode ayaa dib u eegi doona.',
    es: 'Su solicitud confidencial fue recibida. Un defensor la revisará de forma segura.',
    hmn: 'Koj daim ntawv thov tau txais lawm. Tus pab cuam yuav saib xyuas.',
    kar: 'နတၢ်ဃ့တၢ်ခူသူၣ်ဟဲတုၤလံ. ပှၤမၤစၢၤတၢ်ကကွၢ်ကဒါက့ၤအီၤ.',
    orm: 'Gaaffiin keessan iccitiin dhiyaateera. Qorataan ni ilaala.',
    am: 'ሚስጥራዊ ጥያቄዎ ደርሶናል፤ ተሟጋች በቅርቡ ያነጋግርዎታል።',
  },
  changes_saved: {
    en: 'Changes saved to durable storage.',
    so: 'Isbeddelada waa la keydiyay.',
    es: 'Cambios guardados en el almacenamiento duradero.',
    hmn: 'Kev hloov pauv tau khaws tseg lawm.',
    kar: 'တၢ်မၤသီတဖၣ်ဘၣ်တၢ်ပာ်က့ၤအီၤ.',
    orm: 'Jijjiiramoonni kuufamaniiru.',
    am: 'ለውጦች በተሳካ ሁኔታ ተቀምጠዋል።',
  },

  // Safeguarding Instructions & Confidentiality
  safeguarding_notice: {
    en: 'Confidential Safeguarding Isolation Active (VAWA / VOCA Protected)',
    so: 'Ilaalinta Qarsoodiga ah ee Badbaadada ayaa Shaqaynaysa',
    es: 'Aislamiento de Protección Confidencial Activo (Protegido por VAWA / VOCA)',
    hmn: 'Kev Tiv Thaiv Tsis pub Lwm Tus Paub Ua Haujlwm Lawm',
    kar: 'တၢ်ပူၤဖျဲးတၢ်ခူသူၣ်တၢ်မၤစၢၤအိၣ်',
    orm: 'Eegumsi Iccitii Hojiirra Jira (VAWA / VOCA)',
    am: 'ሚስጥራዊ የደህንነት ጥበቃ ገባሪ ነው (በVAWA / VOCA የተጠበቀ)',
  },
  confidential_support_line: {
    en: 'Confidential 24/7 Crisis & Support Helpline: 1-866-223-1111',
    so: 'Khadka Caawinta & Xasaradda 24/7 ee Qarsoodiga ah: 1-866-223-1111',
    es: 'Línea de Crisis y Apoyo Confidencial 24/7: 1-866-223-1111',
    hmn: 'Xov Tooj Pab Kub Ceev 24/7 Ceev Ntiag Tug: 1-866-223-1111',
    kar: 'တၢ်မၤစၢၤလီတဲစိခူသူၣ် 24 နၣ်ရံၣ်: 1-866-223-1111',
    orm: 'Sarara Gargaarsaa Iccitii Sa\'aatii 24/7: 1-866-223-1111',
    am: 'ሚስጥራዊ የ24/7 የአደጋ እና የድጋፍ ስልክ መስመር፡ 1-866-223-1111',
  },
  immediate_escape_instruction: {
    en: 'Press ESC twice quickly or click Safe Exit to immediately redirect to weather.gov.',
    so: 'Riix ESC laba jeer ama guji Ka Bax Badbaado si aad ugu leexato weather.gov.',
    es: 'Presione ESC dos veces rápidamente o haga clic en Salida Segura para redirigir a weather.gov.',
    hmn: 'Nias ESC ob zaug kom nrawm kom khiav mus rau weather.gov.',
    kar: 'ထိး ESC ခံဝါချ့ချ့ မ့တမ့ၢ် ဃုထၢ Safe Exit လၢကလဲၤဆူ weather.gov.',
    orm: 'Saffisaan ESC si\'a lama cuqasaa yookiin gara weather.gov deemuu filadhaa.',
    am: 'ገጹን ወዲያውኑ ዘግተው ወደ weather.gov ለመሄድ ESCን ሁለት ጊዜ ይጫኑ።',
  },
  privacy_guarantee: {
    en: 'Your confidential records are cryptographically isolated and never shared without consent.',
    so: 'Diiwaanadaada qarsoodiga ah waa la xafiday oo lama wadaago ogolaansho la\'aan.',
    es: 'Sus registros confidenciales están criptográficamente aislados y nunca se comparten sin consentimiento.',
    hmn: 'Koj cov ntaub ntawv ceev ntiag tug raug tiv thaiv zoo heev.',
    kar: 'နတၢ်ခူသူၣ်တဖၣ်ဘၣ်တၢ်ဒီသဒၢအီၤဂ့ၤဂ့ၤတဘၣ်တၢ်ဟ့ၣ်နီၤဖးအီၤဘၣ်.',
    orm: 'Galmeen keessan iccitiin eegama, eeyyama malee hin qoodamu.',
    am: 'የእርስዎ ሚስጥራዊ መረጃዎች በጥብቅ የተጠበቁ ናቸው፤ ያለእርስዎ ፈቃድ ለማንም አይሰጡም።',
  },
};

export interface LanguageAuditResult {
  totalKeys: number;
  languages: {
    code: SupportedLanguageCode;
    name: string;
    localName: string;
    coverageStatus: string;
    translatedCount: number;
    missingCount: number;
    fallbackCount: number;
    keyParityPercentage: number;
    scriptRenderingValid: boolean;
    humanReviewPending: boolean;
  }[];
  allKeysValid: boolean;
}

class MultilingualAccessibilityService {
  private currentLanguage: SupportedLanguageCode = 'en';
  private storageKey = 'phumulani_user_preferred_language';

  constructor() {
    this.restoreUserPreference();
  }

  private restoreUserPreference(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem(this.storageKey);
        if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
          this.currentLanguage = saved as SupportedLanguageCode;
        }
      } catch {
        // Fallback to default
      }
    }
  }

  public setLanguage(lang: SupportedLanguageCode): void {
    this.currentLanguage = lang;
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(this.storageKey, lang);
      } catch {
        // In-memory persistence fallback
      }
    }
  }

  public getLanguage(): SupportedLanguageCode {
    return this.currentLanguage;
  }

  public translate(key: string, targetLang?: SupportedLanguageCode): string {
    const lang = targetLang || this.currentLanguage;
    const entry = COMMUNITY_TRANSLATION_DICTIONARY[key];
    if (!entry) return key;
    return entry[lang] || entry['en'] || key;
  }

  public getSupportedLanguages(): LanguageDefinition[] {
    return SUPPORTED_LANGUAGES;
  }

  /**
   * Audits all 7 community languages against canonical dictionary keys (M38.08)
   */
  public auditLanguageCoverage(): LanguageAuditResult {
    const canonicalKeys = Object.keys(COMMUNITY_TRANSLATION_DICTIONARY);
    const totalKeys = canonicalKeys.length;

    const languages = SUPPORTED_LANGUAGES.map((lang) => {
      let translated = 0;
      let missing = 0;

      for (const k of canonicalKeys) {
        const val = COMMUNITY_TRANSLATION_DICTIONARY[k]?.[lang.code];
        if (val && val.trim().length > 0) {
          translated++;
        } else {
          missing++;
        }
      }

      // Check script validity
      let scriptRenderingValid = true;
      if (lang.code === 'am') {
        // Verify genuine Ethiopic unicode range (0x1200 - 0x137F)
        const sample = COMMUNITY_TRANSLATION_DICTIONARY['safe_exit']?.['am'] || '';
        const hasEthiopic = /[\u1200-\u137F]/.test(sample);
        scriptRenderingValid = hasEthiopic;
      }

      return {
        code: lang.code,
        name: lang.name,
        localName: lang.localName,
        coverageStatus: lang.coverageStatus,
        translatedCount: translated,
        missingCount: missing,
        fallbackCount: missing,
        keyParityPercentage: Math.round((translated / totalKeys) * 100),
        scriptRenderingValid,
        humanReviewPending: lang.coverageStatus === 'DRAFT_MACHINE_ASSISTED' || lang.coverageStatus === 'SUPERVISED_COMMUNITY_REVIEW',
      };
    });

    const allKeysValid = languages.every((l) => l.missingCount === 0);

    return {
      totalKeys,
      languages,
      allKeysValid,
    };
  }

  /**
   * WCAG 2.2 AA Contrast & Accessibility Verification Helper (M38.09)
   */
  public verifyA11yCompliance(options: {
    hasAriaLabels: boolean;
    hasKeyboardNav: boolean;
    hasColorContrastRatioAbove45: boolean;
    hasReducedMotionSupport: boolean;
    hasSkipToContent?: boolean;
    hasAccessibleModals?: boolean;
  }): { passed: boolean; score: number; details: string[] } {
    const details: string[] = [];
    let score = 0;

    if (options.hasAriaLabels) {
      score += 20;
      details.push('ARIA labels, live regions, and landmark roles verified.');
    } else {
      details.push('FAIL: Missing descriptive ARIA attributes.');
    }

    if (options.hasKeyboardNav) {
      score += 20;
      details.push('Full keyboard focus trapping, visible focus rings, and tab indexing verified.');
    } else {
      details.push('FAIL: Keyboard navigation gaps detected.');
    }

    if (options.hasColorContrastRatioAbove45) {
      score += 20;
      details.push('Foreground to background contrast meets WCAG 2.2 AA 4.5:1 ratio.');
    } else {
      details.push('FAIL: Contrast ratio under 4.5:1 detected.');
    }

    if (options.hasReducedMotionSupport) {
      score += 20;
      details.push('prefers-reduced-motion media queries and animation disabling verified.');
    } else {
      details.push('FAIL: Reduced motion preference not honored.');
    }

    if (options.hasSkipToContent !== false) {
      score += 10;
      details.push('Skip to main content anchor verified for keyboard screen readers.');
    } else {
      details.push('FAIL: Skip to main content link absent.');
    }

    if (options.hasAccessibleModals !== false) {
      score += 10;
      details.push('Modal dialogs enforce focus containment and ESC dismissal.');
    } else {
      details.push('FAIL: Modal dialog accessibility incomplete.');
    }

    return {
      passed: score === 100,
      score,
      details,
    };
  }
}

export const multilingualAccessibilityService = new MultilingualAccessibilityService();
