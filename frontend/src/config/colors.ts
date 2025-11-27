/**
 * Color configuration for the application
 * Main theme colors based on AWS Console style
 */
export const colors = {
  // Primary dark color (main background)
  primary: '#232f3e',
  
  // Lighter shade of primary (for cards, sections)
  primaryLight: '#2d3a4a',
  
  // White color
  white: '#ffffff',
  
  // Additional colors for UI elements
  border: '#3d4551',
  borderDark: '#16191f',
  text: '#d1d5db',
  textSecondary: '#8c9196',
  textPrimary: '#1A3636',
  
  // Accent colors
  accent: '#0073bb',
  accentHover: '#0099ff',
  
  // Status colors
  success: '#10b981',
  error: '#ff6b35',
  warning: '#f59e0b',
  info: '#3b82f6',
  
  // Background colors
  background: '#f9fafb',
  backgroundDark: '#16191f',
  backgroundLight: '#f1f5f9',
  
  // Hover states
  hover: 'rgba(255, 255, 255, 0.1)',
  hoverLight: 'rgba(255, 255, 255, 0.05)',
  
  // Table and card colors
  tableBorder: '#eaeaea',
  textBlack: '#000000',
  textGray: '#666666',
  disabled: '#d9d9d9',
} as const;

export type ColorKey = keyof typeof colors;

