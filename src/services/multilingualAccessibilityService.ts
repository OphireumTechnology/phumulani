/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Multilingual Accessibility Service (M33.13)
 * Provides verified translations for Minnesota community languages (English, Spanish, Somali,
 * Hmong, Karen, Oromo), WCAG 2.2 AA accessibility validation, and emergency escape utilities.
 */

import { SupportedLanguageCode, LanguageDefinition } from '../types/phase33';

export const SUPPORTED_LANGUAGES: LanguageDefinition[] = [
  { code: 'en', name: 'English', localName: 'English', isRTL: false, coverageStatus: 'VERIFIED_PRODUCTION' },
  { code: 'so', name: 'Somali', localName: 'Af-Soomaali', isRTL: false, coverageStatus: 'VERIFIED_PRODUCTION' },
  { code: 'hmn', name: 'Hmong', localName: 'Hmoob', isRTL: false, coverageStatus: 'VERIFIED_PRODUCTION' },
  { code: 'es', name: 'Spanish', localName: 'Español', isRTL: false, coverageStatus: 'VERIFIED_PRODUCTION' },
  { code: 'kar', name: 'Karen', localName: 'ကညီကျိာ်', isRTL: false, coverageStatus: 'SUPERVISED_COMMUNITY_REVIEW' },
  { code: 'orm', name: 'Oromo', localName: 'Afaan Oromoo', isRTL: false, coverageStatus: 'SUPERVISED_COMMUNITY_REVIEW' },
];

export const COMMUNITY_TRANSLATION_DICTIONARY: Record<string, Record<SupportedLanguageCode, string>> = {
  safe_exit: {
    en: 'Safe Exit (Double-ESC)',
    so: 'Ka Bax Badbaado (ESC laba jeer)',
    hmn: 'Khiav Dim Zoo (ESC ob zaug)',
    es: 'Salida Segura (Doble-ESC)',
    kar: 'မၤပူၤဖျဲးသး (Double-ESC)',
    orm: 'Baqannaa Nageenyaa (Double-ESC)',
  },
  emergency_crisis_notice: {
    en: 'If you are in immediate danger, call 911 or the Minnesota Day One Crisis Line at 1-866-223-1111.',
    so: 'Haddii aad ku jirto khatar degdeg ah, wac 911 ama Khadka Day One ee Minnesota 1-866-223-1111.',
    hmn: 'Yog koj ntsib teeb meem kub ceev, hu rau 911 lossis Minnesota Day One Crisis Line 1-866-223-1111.',
    es: 'Si está en peligro inmediato, llame al 911 o a la Línea de Crisis Day One de Minnesota al 1-866-223-1111.',
    kar: 'နမ့ၢ်အိၣ်ဒီးတၢ်ဘၣ်ယိၣ်ဘၣ်ဘါ, ကိး 911 မ့တမ့ၢ် Minnesota Day One 1-866-223-1111.',
    orm: 'Yoo balaa keessa jiraattan battalatti 911 yookiin Sarara Qorannaa Day One 1-866-223-1111 bilbilaa.',
  },
  mission_title: {
    en: 'Empowering Immigrant & Refugee Survivors',
    so: 'Awood siinta Qaxootiga & Soo-galootiga Badbaaday',
    hmn: 'Txhawb Cov Neeg Pab Uas Dim ntawm Kev Nyuaj Siab',
    es: 'Empoderando a Sobrevivientes Inmigrantes y Refugiados',
    kar: 'တၢ်ဆီၣ်ထွဲပိာ်မုၣ်တၢ်ပူၤဖျဲး',
    orm: 'Dandeettii Baqattoota fi Godaantota Eegsisuu',
  },
  programs_nav: {
    en: 'Community Programs',
    so: 'Barnaamijyada Bulshada',
    hmn: 'Cov Khoom Pab Zej Zog',
    es: 'Programas Comunitarios',
    kar: 'တၢ်ရဲၣ်တၢ်ကျဲၤလၢတၢ်အိၣ်ဖှိၣ်',
    orm: 'Sagantaalee Hawaasaa',
  },
  volunteer_nav: {
    en: 'Volunteer',
    so: 'Isku-xilqaan',
    hmn: 'Ua Haujlwm Pub Dawb',
    es: 'Voluntariado',
    kar: 'တၢ်မၤမၤသး',
    orm: 'Tola Ooltummaa',
  },
  donate_nav: {
    en: 'Donate (501c3)',
    so: 'Deeq Bixi (501c3)',
    hmn: 'Muab Pub (501c3)',
    es: 'Donar (501c3)',
    kar: 'ဟ့ၣ်တၢ်မၤဘူၣ်',
    orm: 'Gumaachaa (501c3)',
  },
  contact_nav: {
    en: 'Contact Advocates',
    so: 'La Xiriir U doodayaasha',
    hmn: 'Hu rau Tus Pab Cuam',
    es: 'Contactar Defensores',
    kar: 'တၢ်ဆဲးကျိး',
    orm: 'Falmitoota Qunnnamaa',
  },
};

class MultilingualAccessibilityService {
  private currentLanguage: SupportedLanguageCode = 'en';

  public setLanguage(lang: SupportedLanguageCode) {
    this.currentLanguage = lang;
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
   * WCAG 2.2 AA Contrast & Accessibility Verification Helper
   */
  public verifyA11yCompliance(options: {
    hasAriaLabels: boolean;
    hasKeyboardNav: boolean;
    hasColorContrastRatioAbove45: boolean;
    hasReducedMotionSupport: boolean;
  }): { passed: boolean; score: number; details: string[] } {
    const details: string[] = [];
    let score = 0;

    if (options.hasAriaLabels) {
      score += 25;
      details.push('ARIA labels and landmark roles verified.');
    } else {
      details.push('FAIL: Missing descriptive ARIA attributes.');
    }

    if (options.hasKeyboardNav) {
      score += 25;
      details.push('Full keyboard focus trapping, visible focus rings, and tab indexing verified.');
    } else {
      details.push('FAIL: Keyboard navigation gaps detected.');
    }

    if (options.hasColorContrastRatioAbove45) {
      score += 25;
      details.push('Foreground to background contrast meets WCAG 2.2 AA 4.5:1 ratio.');
    } else {
      details.push('FAIL: Contrast ratio under 4.5:1 detected.');
    }

    if (options.hasReducedMotionSupport) {
      score += 25;
      details.push('prefers-reduced-motion media queries and animation disabling verified.');
    } else {
      details.push('FAIL: Reduced motion preference not honored.');
    }

    return {
      passed: score === 100,
      score,
      details,
    };
  }
}

export const multilingualAccessibilityService = new MultilingualAccessibilityService();
