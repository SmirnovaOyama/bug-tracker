import React, { useState, useRef } from 'react';
import {
    Box,
    Typography,
    Paper,
    Avatar,
    Button,
    TextField,
    Stack,
    IconButton,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    CameraAlt as CameraIcon,
    Save as SaveIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const { user, token, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState(user?.name || '');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name })
            });

            if (res.ok) {
                updateUser({ name });
                setMessage({ type: 'success', text: 'Profile updated successfully' });
            } else {
                setMessage({ type: 'error', text: 'Failed to update profile' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Connection error' });
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setMessage(null);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/user/avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json() as { avatar_url: string, error?: string };
            if (res.ok) {
                updateUser({ avatar_url: data.avatar_url });
                setMessage({ type: 'success', text: 'Avatar updated successfully' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to upload avatar' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Connection error' });
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return <Typography>Please login</Typography>;

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', p: 4 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 4 }}>Settings</Typography>

            {message && (
                <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage(null)}>
                    {message.text}
                </Alert>
            )}

            <Stack spacing={4}>
                {/* Avatar Section */}
                <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                        <Avatar
                            src={user.avatar_url ? user.avatar_url : undefined}
                            sx={{ width: 120, height: 120, mb: 2, bgcolor: 'primary.main', fontSize: '3rem' }}
                        >
                            {!user.avatar_url && user.name.charAt(0)}
                        </Avatar>
                        <IconButton
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            sx={{
                                position: 'absolute',
                                bottom: 16,
                                right: 0,
                                bgcolor: 'background.paper',
                                border: '1px solid',
                                borderColor: 'divider',
                                '&:hover': { bgcolor: '#f0f2f5' }
                            }}
                        >
                            {uploading ? <CircularProgress size={20} /> : <CameraIcon fontSize="small" />}
                        </IconButton>
                        <input
                            type="file"
                            hidden
                            ref={fileInputRef}
                            onChange={handleAvatarUpload}
                            accept="image/*"
                        />
                    </Box>
                    <Typography variant="subtitle1" fontWeight="bold">{user.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                </Paper>

                {/* Personal Info */}
                <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 3 }}>Personal Information</Typography>
                    <Stack spacing={3}>
                        <TextField
                            label="Name"
                            fullWidth
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <TextField
                            label="Email Address"
                            fullWidth
                            disabled
                            value={user.email}
                            helperText="Email cannot be changed"
                        />
                        <Button
                            variant="contained"
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            onClick={handleSave}
                            disabled={loading || name === user.name}
                            sx={{ alignSelf: 'flex-start', px: 4 }}
                        >
                            Save Changes
                        </Button>
                    </Stack>
                </Paper>

                {/* Danger Zone */}
                <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: '#ffcdd2', borderRadius: 3, bgcolor: '#fff9f9' }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="error" sx={{ mb: 2 }}>Account Actions</Typography>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<LogoutIcon />}
                        onClick={handleLogout}
                    >
                        Log out of account
                    </Button>
                </Paper>
            </Stack>
        </Box>
    );
}
