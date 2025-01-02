// types/theme.ts
export interface ThemeColors {
    primary: string;
    secondary: string;
    tertiary: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
    };
    button: {
      primary: string;
      secondary: string;
    };
  }
  
  export interface ThemeSpacing {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  }
  
  export interface ThemeBorderRadius {
    sm: number;
    md: number;
    lg: number;
  }
  
  export interface Theme {
    colors: ThemeColors;
    spacing: ThemeSpacing;
    borderRadius: ThemeBorderRadius;
  }


    export const lightTheme: Theme = {
      colors: {
        primary: '#9333EA',
        secondary: '#1F2937',
        tertiary: '#8CEB34',
        background: '#FFFFFF',
        surface: '#F3F4F6', // Light gray for cards
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
        },
        button: {
          primary: '#9333EA',
          secondary: '#E5E7EB',
        }
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
      },
      borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
      }
    }

    export const darkTheme: Theme = {
      colors: {
        primary: '#9333EA',            // Purple can stay the same if you want
        secondary: '#1F2937',          // or pick a different accent if you'd like
        tertiary: '#8CEB34',           // example, bright accent for dark mode
        background: '#0F172A',         // a dark navy/gray
        surface: '#1E293B',            // slightly lighter or darker than background
        text: {
          primary: '#F3F4F6',          // near-white or light gray
          secondary: '#9CA3AF',        // medium gray for secondary
        },
        button: {
          primary: '#9333EA',          // keep or pick something with good contrast
          secondary: '#374151',        // darker “secondary” for dark mode
        },
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
      },
      borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
      }
    }
  
export interface Entry {
    id: string;
    date: string; // ISO string for easier storage
    solo?: boolean;
  };