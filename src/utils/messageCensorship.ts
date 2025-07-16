interface CensorshipConfig {
  strictMode: boolean;
  customWords: string[];
  allowWhitelist: boolean;
  whitelist: string[];
}

const defaultConfig: CensorshipConfig = {
  strictMode: false,
  customWords: [],
  allowWhitelist: true,
  whitelist: ['damn', 'hell']
};

const profanityList = [
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'crap', 'piss',
  'whore', 'slut', 'cock', 'dick', 'pussy', 'tits', 'ass',
  'damn', 'hell', 'bloody', 'cunt', 'faggot', 'nigger', 'retard',
  'gay', 'lesbian', 'homosexual', 'bisexual', 'transgender'
];

const hateWords = [
  'nazi', 'hitler', 'terrorist', 'suicide', 'bomb', 'kill',
  'murder', 'rape', 'assault', 'abuse', 'violence', 'hate',
  'racism', 'sexism', 'discrimination', 'harassment'
];

const spamPatterns = [
  /(.)\1{4,}/g, // Repeated characters (aaaa)
  /[A-Z]{5,}/g, // ALL CAPS words
  /(.{1,3})\1{3,}/g, // Repeated patterns (lollollol)
];

export class MessageCensor {
  private config: CensorshipConfig;
  private combinedBadWords: string[];

  constructor(config: Partial<CensorshipConfig> = {}) {
    // Try to load config from localStorage
    const savedConfig = this.loadConfigFromStorage();
    this.config = { ...defaultConfig, ...savedConfig, ...config };
    this.combinedBadWords = [
      ...profanityList,
      ...hateWords,
      ...this.config.customWords
    ].filter(word => 
      !this.config.allowWhitelist || !this.config.whitelist.includes(word)
    );
  }

  private loadConfigFromStorage(): Partial<CensorshipConfig> {
    try {
      const saved = localStorage.getItem('censorshipConfig');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  private replaceWithAsterisks(word: string): string {
    if (word.length <= 2) return '*'.repeat(word.length);
    return word[0] + '*'.repeat(word.length - 2) + word[word.length - 1];
  }

  private detectProfanity(text: string): { cleaned: string; violations: string[] } {
    let cleaned = text;
    const violations: string[] = [];
    
    this.combinedBadWords.forEach(badWord => {
      const regex = new RegExp(`\\b${badWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = text.match(regex);
      
      if (matches) {
        violations.push(...matches);
        cleaned = cleaned.replace(regex, this.replaceWithAsterisks(badWord));
      }
    });

    return { cleaned, violations };
  }

  private detectSpam(text: string): { cleaned: string; isSpam: boolean } {
    let cleaned = text;
    let isSpam = false;

    spamPatterns.forEach(pattern => {
      if (pattern.test(text)) {
        isSpam = true;
        cleaned = cleaned.replace(pattern, (match) => {
          if (match.length > 10) {
            return match.substring(0, 3) + '...';
          }
          return match;
        });
      }
    });

    if (text.split('!').length > 5) {
      isSpam = true;
      cleaned = text.replace(/!{2,}/g, '!');
    }

    return { cleaned, isSpam };
  }

  private detectSensitiveContent(text: string): { 
    cleaned: string; 
    hasSensitive: boolean; 
    sensitiveTypes: string[] 
  } {
    let cleaned = text;
    let hasSensitive = false;
    const sensitiveTypes: string[] = [];

    const phoneRegex = /(\+?1[-.\s]?)?(\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/g;
    if (phoneRegex.test(text)) {
      hasSensitive = true;
      sensitiveTypes.push('phone');
      cleaned = cleaned.replace(phoneRegex, '[PHONE NUMBER HIDDEN]');
    }

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    if (emailRegex.test(text)) {
      hasSensitive = true;
      sensitiveTypes.push('email');
      cleaned = cleaned.replace(emailRegex, '[EMAIL HIDDEN]');
    }

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    if (urlRegex.test(text)) {
      hasSensitive = true;
      sensitiveTypes.push('url');
      cleaned = cleaned.replace(urlRegex, '[LINK HIDDEN]');
    }

    const socialSecurityRegex = /\b\d{3}-?\d{2}-?\d{4}\b/g;
    if (socialSecurityRegex.test(text)) {
      hasSensitive = true;
      sensitiveTypes.push('ssn');
      cleaned = cleaned.replace(socialSecurityRegex, '[SSN HIDDEN]');
    }

    return { cleaned, hasSensitive, sensitiveTypes };
  }

  public censorMessage(text: string): {
    originalText: string;
    censoredText: string;
    violations: string[];
    isSpam: boolean;
    hasSensitiveInfo: boolean;
    sensitiveTypes: string[];
    shouldBlock: boolean;
    warningMessage?: string;
  } {
    if (!text || text.trim().length === 0) {
      return {
        originalText: text,
        censoredText: text,
        violations: [],
        isSpam: false,
        hasSensitiveInfo: false,
        sensitiveTypes: [],
        shouldBlock: false
      };
    }

    let processedText = text.trim();

    const profanityResult = this.detectProfanity(processedText);
    processedText = profanityResult.cleaned;

    const spamResult = this.detectSpam(processedText);
    processedText = spamResult.cleaned;

    const sensitiveResult = this.detectSensitiveContent(processedText);
    processedText = sensitiveResult.cleaned;

    const shouldBlock = this.config.strictMode && (
      profanityResult.violations.length > 0 ||
      spamResult.isSpam ||
      sensitiveResult.hasSensitive
    );

    let warningMessage: string | undefined;
    if (profanityResult.violations.length > 0) {
      warningMessage = 'Message contained inappropriate language';
    } else if (spamResult.isSpam) {
      warningMessage = 'Message appeared to be spam and was modified';
    } else if (sensitiveResult.hasSensitive) {
      warningMessage = 'Sensitive information was hidden for privacy';
    }

    return {
      originalText: text,
      censoredText: processedText,
      violations: profanityResult.violations,
      isSpam: spamResult.isSpam,
      hasSensitiveInfo: sensitiveResult.hasSensitive,
      sensitiveTypes: sensitiveResult.sensitiveTypes,
      shouldBlock,
      warningMessage
    };
  }

  public updateConfig(newConfig: Partial<CensorshipConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.combinedBadWords = [
      ...profanityList,
      ...hateWords,
      ...this.config.customWords
    ].filter(word => 
      !this.config.allowWhitelist || !this.config.whitelist.includes(word)
    );
  }

  public getConfig(): CensorshipConfig {
    return { ...this.config };
  }
}

export const messageCensor = new MessageCensor();

export const censorText = (text: string) => messageCensor.censorMessage(text);
