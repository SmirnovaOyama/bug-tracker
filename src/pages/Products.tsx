import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    InputAdornment,
    Stack,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    Paper,
    Divider,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Popover,
    FormControl,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel,
    Drawer,
    useMediaQuery,
    useTheme,
    ListItemButton,
    ListItemText
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterListIcon,
    Description as FileIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Product {
    id: number;
    name: string;
    description: string;
    // Mock fields for UI demo
    category?: 'iOS' | 'Android' | 'Websites';
    status?: 'Open' | 'Closed';
    bugCount?: number;
    iconColor?: string;
}

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [mobileOpen, setMobileOpen] = useState(false);

    // Filter Popover Data
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [sortBy, setSortBy] = useState('Date updated');
    const [accessLevel, setAccessLevel] = useState('All');
    const [productType, setProductType] = useState('All');
    const [requestsAccepted, setRequestsAccepted] = useState(false);
    const [notMember, setNotMember] = useState(false);

    // Dialog state
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then((data) => {
                // Enhance data with mock fields for demo
                const enhanced = (data as any[]).map(p => ({
                    ...p,
                    category: (p.name.includes('iOS') ? 'iOS' : p.name.includes('Android') ? 'Android' : 'Websites'),
                    status: (Math.random() > 0.5 ? 'Open' : 'Closed'),
                    bugCount: Math.floor(Math.random() * 5000) + 100,
                    iconColor: p.name.includes('iOS') ? '#007AFF' : p.name.includes('Android') ? '#3DDC84' : '#FF9500'
                }));
                setProducts(enhanced);
            })
            .catch(console.error);
    }, []);

    const handleCreate = async () => {
        await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description })
        });
        setOpen(false);
        setName('');
        setDescription('');
        // Reload and re-enhance
        fetch('/api/products')
            .then(res => res.json())
            .then((data) => {
                const enhanced = (data as any[]).map(p => ({
                    ...p,
                    category: (p.name.includes('iOS') ? 'iOS' : p.name.includes('Android') ? 'Android' : 'Websites'),
                    status: 'Open',
                    bugCount: 0,
                    iconColor: '#9E9E9E'
                }));
                setProducts(enhanced);
            });
    };

    const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleFilterClose = () => {
        setAnchorEl(null);
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const openFilter = Boolean(anchorEl);
    const id = openFilter ? 'simple-popover' : undefined;

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;

        // Mock logic for filters
        let matchesAccess = true;
        if (accessLevel !== 'All' && product.status !== accessLevel) matchesAccess = false;

        let matchesType = true;
        // Mock mapping for "Product Type" filter based on mock category
        if (productType !== 'All') {
            if (productType === 'iOS Mobile App' && product.category !== 'iOS') matchesType = false;
            if (productType === 'Android Mobile App' && product.category !== 'Android') matchesType = false;
            if (productType === 'Site' && product.category !== 'Websites') matchesType = false;
        }

        const matchesTab = tabValue === 0 || (tabValue === 1 && product.status === 'Open'); // Mock "My products" as Open

        return matchesSearch && matchesCategory && matchesAccess && matchesType && matchesTab;
    });

    const categories = ['All', 'iOS', 'Android', 'Websites'];
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
                    <ListItemButton selected={tabValue === 0} onClick={() => setTabValue(0)}>
                        <ListItemText primary="Product catalog" primaryTypographyProps={{ fontWeight: 500, fontSize: '0.90rem' }} />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton selected={tabValue === 1} onClick={() => setTabValue(1)}>
                        <ListItemText primary="My products" primaryTypographyProps={{ fontWeight: 500, fontSize: '0.90rem' }} />
                    </ListItemButton>
                </ListItem>
            </List>

            <Divider sx={{ my: 2, mx: 1 }} />

            <Stack spacing={1.5}>
                <FormControl fullWidth size="small">
                    <Select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        variant="outlined"
                        sx={{
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            fontSize: '0.9rem',
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.12)' },
                            '& .MuiSelect-select': { py: 1 }
                        }}
                    >
                        {categories.map(cat => (
                            <MenuItem key={cat} value={cat}>{cat === 'All' ? 'All products' : cat}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Stack>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
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
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                        {tabValue === 0 ? 'Product catalog' : 'My products'}
                    </Typography>

                    <Stack direction="row" spacing={2} alignItems="center">
                        {isMobile && (
                            <IconButton onClick={handleDrawerToggle} sx={{ mr: 1 }}>
                                <FilterListIcon />
                            </IconButton>
                        )}
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={handleFilterClick}>
                                            <FilterListIcon />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                            sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                        />
                    </Stack>
                </Box>

                <Popover
                    id={id}
                    open={openFilter}
                    anchorEl={anchorEl}
                    onClose={handleFilterClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    PaperProps={{ sx: { width: 320, p: 2, borderRadius: 2, mt: 1 } }}
                >
                    <Stack spacing={2}>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Sort by</Typography>
                            <FormControl fullWidth size="small">
                                <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    <MenuItem value="Date updated">Date updated</MenuItem>
                                    <MenuItem value="Date created">Date created</MenuItem>
                                    <MenuItem value="Name">Name</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Access level</Typography>
                            <FormControl fullWidth size="small">
                                <Select value={accessLevel} onChange={(e) => setAccessLevel(e.target.value)} displayEmpty>
                                    <MenuItem value="All">All</MenuItem>
                                    <MenuItem value="Open">Open</MenuItem>
                                    <MenuItem value="Closed">Closed</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Product types</Typography>
                            <FormControl fullWidth size="small">
                                <Select value={productType} onChange={(e) => setProductType(e.target.value)} displayEmpty>
                                    <MenuItem value="All">All</MenuItem>
                                    <MenuItem value="Site">Site</MenuItem>
                                    <MenuItem value="iOS Mobile App">iOS Mobile App</MenuItem>
                                    <MenuItem value="Android Mobile App">Android Mobile App</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        <Stack>
                            <FormControlLabel
                                control={<Checkbox checked={requestsAccepted} onChange={(e) => setRequestsAccepted(e.target.checked)} />}
                                label={<Typography variant="body2">Requests accepted</Typography>}
                            />
                            <FormControlLabel
                                control={<Checkbox checked={notMember} onChange={(e) => setNotMember(e.target.checked)} />}
                                label={<Typography variant="body2">Products I don't belong to</Typography>}
                            />
                        </Stack>
                    </Stack>
                </Popover>

                {/* Product List */}
                <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: 'transparent' }}>
                    <List sx={{ p: 0 }}>
                        {filteredProducts.map((product, index) => (
                            <Box key={product.id}>
                                <ListItem
                                    sx={{
                                        py: 2,
                                        px: 2, // Added padding to avoid clipping against container corners
                                        borderRadius: 2, // Rounded corners for the hover background
                                        cursor: 'pointer',
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                        }
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            variant="rounded"
                                            sx={{
                                                width: 56,
                                                height: 56,
                                                bgcolor: product.iconColor || 'primary.main',
                                                mr: 2,
                                                borderRadius: 1.5 // Slightly less than container
                                            }}
                                        >
                                            {product.name.charAt(0)}
                                        </Avatar>
                                    </ListItemAvatar>

                                    <Box sx={{ flexGrow: 1, minWidth: 200 }}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {product.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {product.description || 'Mobile application'}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ width: 100, textAlign: 'center', display: { xs: 'none', sm: 'block' } }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {product.status}
                                        </Typography>
                                    </Box>

                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ width: 150, display: { xs: 'none', md: 'flex' } }}>
                                        <FileIcon fontSize="small" color="disabled" />
                                        <Typography variant="body2" color="text.secondary">
                                            {product.bugCount}
                                        </Typography>
                                        <TrendingUpIcon color="primary" fontSize="small" sx={{ ml: 1, opacity: 0.5 }} />
                                    </Stack>

                                    <Box sx={{ minWidth: 120, textAlign: 'right' }}>
                                        <Button
                                            variant="contained"
                                            disableElevation
                                            size="small"
                                            sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#ebf2fa', color: '#2d81e0', '&:hover': { bgcolor: '#e0eaf5' } }}
                                            onClick={() => navigate(`/reports?productId=${product.id}`)}
                                        >
                                            {product.status === 'Open' ? 'Join' : 'Send request'}
                                        </Button>
                                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                            Updated today
                                        </Typography>
                                    </Box>
                                </ListItem>
                                {index < filteredProducts.length - 1 && <Divider component="li" />}
                            </Box>
                        ))}
                    </List>
                    {filteredProducts.length === 0 && (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography color="text.secondary">No products found.</Typography>
                        </Box>
                    )}
                </Paper>
            </Box>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Product Name"
                        fullWidth
                        variant="outlined"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
