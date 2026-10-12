export const colors = {
  ink: '#17213C',
  cobalt: '#3157D5',
  sky: '#EAF4FF',
  mango: '#FFB547',
  mint: '#DDF4E8',
  mintDark: '#237A57',
  coral: '#F36F56',
  white: '#FFFFFF',
  paper: '#F8FAFD',
  muted: '#667085',
  line: '#DCE3EE',
  danger: '#C83E3E',
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 12,
  md: 18,
  lg: 26,
  pill: 999,
} as const;

export const shadow = {
  shadowColor: '#17213C',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.08,
  shadowRadius: 18,
  elevation: 4,
} as const;

export const fonts = {
  display: 'Fredoka_600SemiBold',
  regular: 'NunitoSans_400Regular',
  semibold: 'NunitoSans_600SemiBold',
  bold: 'NunitoSans_700Bold',
} as const;
