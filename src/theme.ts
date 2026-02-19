import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#6750A4', // MD3 Purple 40
            light: '#EADDFF', // MD3 Purple 90
            dark: '#21005D', // MD3 Purple 10
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#625B71',
            light: '#E8DEF8',
            dark: '#1D192B',
            contrastText: '#FFFFFF',
        },
        error: {
            main: '#B3261E',
            light: '#F9DEDC',
            dark: '#410E0B',
            contrastText: '#FFFFFF',
        },
        background: {
            default: '#FFFBFE', // MD3 Surface
            paper: '#FFFBFE', // MD3 Surface
        },
        text: {
            primary: '#1C1B1F',
            secondary: '#49454F',
        },
    },
    shape: {
        borderRadius: 8, // Refined for MD3 but following VK aesthetics
    },
    typography: {
        fontFamily: 'Roboto, sans-serif',
        h1: { fontSize: '57px', fontWeight: 400, lineHeight: '64px' },
        h2: { fontSize: '45px', fontWeight: 400, lineHeight: '52px' },
        h3: { fontSize: '36px', fontWeight: 400, lineHeight: '44px' },
        body1: { fontSize: '16px', fontWeight: 400, lineHeight: '24px' },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '100px', // Stadium shape (fully rounded)
                    textTransform: 'none', // MD3 is sentence case
                    fontWeight: 500,
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none', // MD3 buttons generallyflat or simplified elevation
                    },
                },
                contained: {
                    backgroundColor: '#6750A4',
                    color: '#FFFFFF',
                    '&:hover': {
                        backgroundColor: 'rgba(103, 80, 164, 0.92)',
                        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)', // Slight elevation on hover
                    },
                },
                outlined: {
                    borderColor: '#79747E',
                },
            },
        },
        MuiFab: {
            styleOverrides: {
                root: {
                    borderRadius: '16px', // Rounded square for FAB in MD3, or slightly rounded
                    boxShadow: '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)', // MD3 Elevation 3
                    textTransform: 'none',
                }
            }
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#FFFBFE', // Surface color
                    color: '#1C1B1F', // On Surface
                    boxShadow: 'none', // No shadow
                    borderBottom: '1px solid #E7E0EC', // Outline variant
                },
            },
            defaultProps: {
                elevation: 0,
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: '#FFFBFE', // Surface
                    borderRadius: '12px',
                    boxShadow: 'none', // Filled card (surface container low/highest) or outlined
                    border: '1px solid #E7E0EC', // Outlined card default
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none', // Disable gradients
                },
            },
        },
        MuiSwitch: {
            styleOverrides: {
                root: {
                    width: 52,
                    height: 32,
                    padding: 0,
                    marginLeft: 8,
                },
                switchBase: {
                    padding: 0,
                    margin: 2,
                    transitionDuration: '300ms',
                    '&.Mui-checked': {
                        transform: 'translateX(20px)',
                        color: '#fff',
                        '& + .MuiSwitch-track': {
                            backgroundColor: '#6750A4',
                            opacity: 1,
                            border: 0,
                        },
                        '&.Mui-disabled + .MuiSwitch-track': {
                            opacity: 0.5,
                        },
                    },
                    '&.Mui-focusVisible .MuiSwitch-thumb': {
                        color: '#6750A4',
                        border: '6px solid #fff',
                    },
                    '&.Mui-disabled .MuiSwitch-thumb': {
                        color: 'grey', // fallback
                    },
                    '&.Mui-disabled + .MuiSwitch-track': {
                        opacity: 0.3,
                    },
                },
                thumb: {
                    boxSizing: 'border-box',
                    width: 28,
                    height: 28,
                },
                track: {
                    borderRadius: 32 / 2,
                    backgroundColor: '#E7E0EC',
                    opacity: 1,
                    transition: 'background-color 500ms',
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: '4px', // Standard for text fields, or 28px for search bars. Sticking to 4px for form consistency.
                }
            }
        }
    },
});

export default theme;
