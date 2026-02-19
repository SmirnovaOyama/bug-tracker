import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    AppBar,
    Toolbar,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Stack,
    Avatar,
    CircularProgress
} from '@mui/material';
import {
    Inventory2 as ProductsIcon,
    BugReport as ReportsIcon,
    People as MembersIcon,
    AccountCircle,
    Menu as MenuIcon
} from '@mui/icons-material';

import Products from './pages/Products';
import Reports from './pages/Reports';
import Members from './pages/Members';
import ReportDetail from './pages/ReportDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { token, loading } = useAuth();
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }
    return token ? <>{children}</> : <Navigate to="/login" replace />;
};

function AppContent() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, token, logout } = useAuth();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ my: 2 }}>
                Bug Tracker
            </Typography>
            <List sx={{ flexGrow: 1 }}>
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/products" selected={location.pathname === '/products'} sx={{ textAlign: 'center' }}>
                        <ListItemIcon>
                            <ProductsIcon />
                        </ListItemIcon>
                        <ListItemText primary="Products" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/reports" selected={location.pathname === '/reports'} sx={{ textAlign: 'center' }}>
                        <ListItemIcon>
                            <ReportsIcon />
                        </ListItemIcon>
                        <ListItemText primary="Reports" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/members" selected={location.pathname === '/members'} sx={{ textAlign: 'center' }}>
                        <ListItemIcon>
                            <MembersIcon />
                        </ListItemIcon>
                        <ListItemText primary="Members" />
                    </ListItemButton>
                </ListItem>
            </List>
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                {token ? (
                    <Stack spacing={1}>
                        <Button
                            fullWidth
                            variant="outlined"
                            component={Link}
                            to="/profile"
                            startIcon={<AccountCircle />}
                        >
                            {user?.name || 'Profile'}
                        </Button>
                        <Button
                            fullWidth
                            color="error"
                            variant="text"
                            onClick={() => { logout(); navigate('/login'); }}
                            sx={{ textTransform: 'none' }}
                        >
                            Logout
                        </Button>
                    </Stack>
                ) : (
                    <Button
                        fullWidth
                        variant="contained"
                        component={Link}
                        to="/login"
                        startIcon={<AccountCircle />}
                    >
                        Login
                    </Button>
                )}
            </Box>
        </Box>
    );



    return (
        <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ mr: 4, fontWeight: 'bold' }}>
                        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Bug Tracker</Link>
                    </Typography>
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 2 }}>
                        <Button component={Link} to="/reports" color="inherit" startIcon={<ReportsIcon />} sx={{ fontWeight: location.pathname === '/reports' || location.pathname === '/' ? 'bold' : 'normal' }}>Reports</Button>
                        <Button component={Link} to="/products" color="inherit" startIcon={<ProductsIcon />} sx={{ fontWeight: location.pathname === '/products' ? 'bold' : 'normal' }}>Products</Button>
                        <Button component={Link} to="/members" color="inherit" startIcon={<MembersIcon />} sx={{ fontWeight: location.pathname === '/members' ? 'bold' : 'normal' }}>Members</Button>
                    </Box>
                    {token ? (
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
                            <Button
                                color="inherit"
                                component={Link}
                                to="/profile"
                                startIcon={
                                    <Avatar
                                        src={user?.avatar_url ? user.avatar_url : undefined}
                                        sx={{ width: 24, height: 24, fontSize: '0.8rem' }}
                                    >
                                        {user?.name.charAt(0)}
                                    </Avatar>
                                }
                            >
                                {user?.name}
                            </Button>
                        </Box>
                    ) : (
                        <Button
                            color="inherit"
                            component={Link}
                            to="/login"
                            startIcon={<AccountCircle />}
                            sx={{ display: { xs: 'none', md: 'flex' } }}
                        >
                            Login
                        </Button>
                    )}
                </Toolbar>
            </AppBar>
            <Box component="nav">
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
                    }}
                >
                    {drawer}
                </Drawer>
            </Box>

            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Routes>
                    <Route path="/" element={<Navigate to="/reports" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/reports" element={
                        <ProtectedRoute>
                            <Reports />
                        </ProtectedRoute>
                    } />
                    <Route path="/reports/:id" element={
                        <ProtectedRoute>
                            <ReportDetail />
                        </ProtectedRoute>
                    } />
                    <Route path="/members" element={<Members />} />
                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    } />
                </Routes>
            </Container>
        </Box>
    );
}

export default function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}
