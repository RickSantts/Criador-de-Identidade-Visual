import { z } from 'zod';

export const identitySchema = z.object({
  brandName: z.string(),
  logo: z.string().optional(),
  logoSecondary: z.string().optional(),
  logoSymbol: z.string().optional(),
  color1: z.string().default('#1a1a1a'),
  color2: z.string().default('#ffffff'),
  color3: z.string().default('#666666'),
  color1Cmyk: z.string().optional(),
  color2Cmyk: z.string().optional(),
  color3Cmyk: z.string().optional(),
  color1Pantone: z.string().optional(),
  color2Pantone: z.string().optional(),
  color3Pantone: z.string().optional(),
  headingFont: z.string().default('Inter'),
  bodyFont: z.string().default('Inter'),
  manualContent: z.string().optional(),
  showGrid: z.boolean().optional(),
  gridSize: z.number().optional(),
  mission: z.string().optional(),
  vision: z.string().optional(),
  values: z.string().optional(),
  showMockups: z.boolean().optional(),
  clearSpace: z.string().optional(),
  minSize: z.string().optional(),
  showPositive: z.boolean().optional(),
  showNegative: z.boolean().optional(),
  showMonochrome: z.boolean().optional(),
  logoNegative: z.string().optional(),
  logoMonochrome: z.string().optional(),
  mockups: z.array(z.string()).optional(),
  toneOfVoice: z.string().optional(),
  donts: z.array(z.string()).optional(),
  pattern: z.string().optional(),
  goldenRatio: z.string().optional(),
  template: z.string().optional(),
  paletteColors: z.array(z.object({
    hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    cmyk: z.string().optional(),
    pantone: z.string().optional(),
    name: z.string().optional()
  })).optional()
});

export const TEMPLATES = {
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    icon: '◻',
    description: 'Clean & Essential',
    style: 'minimal',
    accent: '#1a1a1a',
    pattern: 'none'
  },
  corporate: {
    id: 'corporate',
    name: 'Corporate',
    icon: '◈',
    description: 'Professional & Solid',
    style: 'corporate',
    accent: '#2563eb',
    pattern: 'grid'
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    icon: '◆',
    description: 'Luxury & Elegant',
    style: 'premium',
    accent: '#b8860b',
    pattern: 'diagonal'
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    icon: '✦',
    description: 'Bold & Vibrant',
    style: 'creative',
    accent: '#ec4899',
    pattern: 'dots'
  },
  tech: {
    id: 'tech',
    name: 'Tech',
    icon: '⬡',
    description: 'Modern & Digital',
    style: 'tech',
    accent: '#06b6d4',
    pattern: 'hex'
  },
  nature: {
    id: 'nature',
    name: 'Nature',
    icon: '❋',
    description: 'Organic & Fresh',
    style: 'nature',
    accent: '#22c55e',
    pattern: 'organic'
  }
};

export function validateFormData(data) {
  const result = identitySchema.safeParse(data);
  if (!result.success) {
    const errors = {};
    result.error.issues.forEach(issue => {
      errors[issue.path[0]] = issue.message;
    });
    return { success: false, errors };
  }
  return { success: true, errors: {} };
}

export function compressImage(file, maxSizeMB = 1, maxWidthOrHeight = 1200) {
  return import('browser-image-compression').then(({ default: imageCompression }) => {
    const options = {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker: true
    };
    return imageCompression(file, options);
  });
}