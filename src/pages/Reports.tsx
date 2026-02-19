import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Divider,
    TextField,
    InputAdornment,
    Chip,
    Stack,
    IconButton,
    Drawer,
    useMediaQuery,
    useTheme,
    FormControl,
    Select,
    MenuItem,
    CircularProgress
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterListIcon
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';


// Enhanced Mock Interface
interface Bug {
    id: number;
    title: string;
    description: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    product: string;
    version: string;
    platform: string;
    created_at: string;
    author: {
        name: string;
        avatar?: string;
    };
    comments: number;
    tags: string[];
}

export default function Reports() {
    const [bugs, setBugs] = useState<Bug[]>([]);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [productFilter, setProductFilter] = useState('Any product');
    const [statusFilter, setStatusFilter] = useState('Any status');
    const [issueTypeFilter, setIssueTypeFilter] = useState('Any issue type');
    const [severityFilter, setSeverityFilter] = useState('Any severity');

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBugs();
    }, []);

    const fetchBugs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/bugs`);
            if (res.ok) {
                const data: any = await res.json();
                const mappedBugs: Bug[] = data.map((b: any) => ({
                    id: b.id,
                    title: b.title,
                    description: b.description,
                    severity: b.severity,
                    status: b.status,
                    product: b.product_name,
                    version: b.version,
                    platform: b.platform,
                    created_at: b.created_at,
                    author: { name: b.reporter_name },
                    comments: 0, // In a real app, join this
                    tags: JSON.parse(b.tags || '[]')
                }));
                setBugs(mappedBugs);
            }
        } catch (error) {
            console.error('Error fetching bugs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawerWidth = 280;

    const SidebarContent = (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <List sx={{
                '& .MuiListItemButton-root': {
                    borderRadius: 3,
                    mb: 0.5,
                    py: 1,
                    color: 'text.secondary',
                    '&.Mui-selected': {
                        bgcolor: '#ebf2fa',
                        color: '#2d81e0',
                        '&:hover': { bgcolor: '#ebf2fa' }
                    },
                    '&:hover': { bgcolor: 'action.hover' }
                }
            }}>
                <ListItem disablePadding>
                    <ListItemButton selected>
                        <ListItemText primary="All reports" primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem' }} />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton>
                        <ListItemText primary="My reports" primaryTypographyProps={{ fontSize: '0.95rem' }} />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton>
                        <ListItemText primary="My comments" primaryTypographyProps={{ fontSize: '0.95rem' }} />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton>
                        <ListItemText primary="My updates" primaryTypographyProps={{ fontSize: '0.95rem' }} />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton>
                        <ListItemText primary="My bookmarks" primaryTypographyProps={{ fontSize: '0.95rem' }} />
                    </ListItemButton>
                </ListItem>
            </List>

            <Divider sx={{ my: 2, mx: 1 }} />

            <Stack spacing={1.5}>
                {[
                    { val: productFilter, set: setProductFilter, label: 'Any product', opts: ['VK Video', 'VK Music', 'VK Messenger'] },
                    { val: statusFilter, set: setStatusFilter, label: 'Any status', opts: ['Open', 'Resolved'] },
                    { val: issueTypeFilter, set: setIssueTypeFilter, label: 'Any issue type', opts: ['Bug', 'Feature'] },
                    { val: severityFilter, set: setSeverityFilter, label: 'Any severity', opts: ['Critical', 'High'] }
                ].map((filter, idx) => (
                    <FormControl fullWidth size="small" key={idx}>
                        <Select
                            value={filter.val}
                            onChange={(e) => filter.set(e.target.value)}
                            displayEmpty
                            variant="outlined"
                            sx={{
                                bgcolor: 'background.paper',
                                borderRadius: 1, // Standard rounded corners (4px)
                                fontSize: '0.9rem',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(0, 0, 0, 0.12)', // Subtle border
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(0, 0, 0, 0.24)',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'primary.main',
                                    borderWidth: 1
                                },
                                '& .MuiSelect-select': { py: 1 }
                            }}
                            renderValue={(v) => v === filter.label ? <Typography color="text.secondary" fontSize="0.9rem">{filter.label}</Typography> : v}
                        >
                            <MenuItem value={filter.label}>{filter.label}</MenuItem>
                            {filter.opts.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                        </Select>
                    </FormControl>
                ))}
            </Stack>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}> {/* Adjusting for main app bar height approx */}

            {/* Desktop Sidebar */}
            <Box component="nav" sx={{
                width: { md: drawerWidth },
                flexShrink: { md: 0 },
                display: { xs: 'none', md: 'block' },
                position: 'sticky',
                top: 80,
                alignSelf: 'flex-start',
                maxHeight: 'calc(100vh - 48px)',
                overflowY: 'auto'
            }}>
                <Paper elevation={0} sx={{ minHeight: '100%', bgcolor: 'transparent' }}>
                    {SidebarContent}
                </Paper>
            </Box>

            {/* Mobile Sidebar Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
            >
                {SidebarContent}
            </Drawer>

            {/* Main Content */}
            <Box sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
                {/* Header */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>All reports</Typography>

                    <Stack direction="row" spacing={2} alignItems="center">
                        {isMobile && (
                            <IconButton onClick={handleDrawerToggle} sx={{ mr: 1 }}>
                                <FilterListIcon />
                            </IconButton>
                        )}
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search by title"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ bgcolor: 'background.paper' }}
                        />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            {bugs.length} reports found
                        </Typography>
                        <IconButton size="small">
                            <FilterListIcon fontSize="small" /> {/* Using as sort icon mock */}
                        </IconButton>
                    </Stack>
                </Box>

                {/* Report List */}
                <Paper elevation={0} sx={{ bgcolor: 'transparent' }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <List disablePadding>
                            {bugs.map((bug, index) => (
                                <Box key={bug.id}>
                                    <ListItem
                                        alignItems="flex-start"
                                        sx={{ px: 0, py: 2, flexDirection: 'column', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                                        onClick={() => navigate(`/reports/${bug.id}`)}
                                    >
                                        <Box sx={{ width: '100%', mb: 1 }}>
                                            <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.3, mb: 0.5, color: '#2d81e0' }}>
                                                {bug.title}
                                            </Typography>
                                            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                                                <Chip label={`${bug.product} for ${bug.platform}`} size="small" sx={{ borderRadius: 1, bgcolor: '#ebf2fa', color: '#2d81e0', fontWeight: 500 }} />
                                                <Chip label="Function not working" size="small" sx={{ borderRadius: 1, bgcolor: '#f0f2f5' }} />
                                                <Chip label={bug.version} size="small" sx={{ borderRadius: 1, bgcolor: '#f0f2f5' }} />
                                            </Stack>
                                        </Box>

                                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="caption" color="text.secondary">
                                                    today at {new Date(bug.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">·</Typography>
                                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                                    {bug.author.name}
                                                </Typography>
                                                {bug.comments > 0 && (
                                                    <>
                                                        <Typography variant="caption" color="text.secondary">·</Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {bug.comments} comment{bug.comments > 1 ? 's' : ''}
                                                        </Typography>
                                                    </>
                                                )}
                                            </Stack>

                                            <Typography variant="caption" sx={{
                                                color: bug.status === 'Open' ? 'text.secondary' : 'text.primary',
                                                fontWeight: 500,
                                                textTransform: 'lowercase'
                                            }}>
                                                {bug.status}
                                            </Typography>
                                        </Box>
                                    </ListItem>
                                    {index < bugs.length - 1 && <Divider component="li" />}
                                </Box>
                            ))}
                        </List>
                    )}
                </Paper>
            </Box>
        </Box>
    );
}
