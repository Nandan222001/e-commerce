import React, { useState } from 'react';
import {
    Container, Paper, Tabs, Tab, Box, Typography, Grid, TextField, Button, Avatar, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Divider, Alert, FormControlLabel, Switch,
} from '@mui/material';
import {
    Person as PersonIcon, LocationOn as AddressIcon, Security as SecurityIcon, Notifications as NotificationIcon, Receipt as OrderIcon, Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, PhotoCamera as CameraIcon,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { useSelector, useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { selectCurrentUser } from '../store/slices/authSlice';
function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel" hidden={value !== index}
            id={`profile-tabpanel-${index}`}
            aria-labelledby={`profile-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}
const ProfilePage = () => {
    const user = useSelector(selectCurrentUser);
    const [tabValue, setTabValue] = useState(0);
    const [editMode, setEditMode] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [notifications, setNotifications] = useState({
        email: true, sms: false, push: true, newsletter: true,
    });
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };
    const profileFormik = useFormik({
        initialValues: {
            firstName: user?.firstName || '', lastName: user?.lastName || '',
            email: user?.email || '', phoneNumber: user?.phoneNumber || '', companyName: user?.companyName || '', gstNumber: user?.gstNumber || '',
        }, validationSchema: Yup.object({
            firstName: Yup.string().required('First name is required'), lastName: Yup.string().required('Last name is required'), email: Yup.string().email('Invalid email').required('Email is required'), phoneNumber: Yup.string().required('Phone number is required'),
        }), onSubmit: (values) => {
            console.log('Update profile:', values);
            setEditMode(false);
        },
    });
    const passwordFormik = useFormik({
        initialValues: {
            currentPassword: '', newPassword: '', confirmPassword: '',
        }, validationSchema: Yup.object({
            currentPassword: Yup.string().required('Current password is required'),
            newPassword: Yup.string()
                .min(8, 'Password must be at least 8 characters')
                .required('New password is required'), confirmPassword: Yup.string()
                    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
                    .required('Please confirm your password'),
        }), onSubmit: (values) => {
            console.log('Change password:', values);
            passwordFormik.resetForm();
        },
    });
    return (
        <>
            <Helmet>
                <title>My Profile - E-Commerce Platform</title>
            </Helmet>
            <Container maxWidth="lg" sx={{ py: 3 }}>
                <Typography variant="h4" gutterBottom>
                    My Profile
                </Typography>
                <Paper>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab icon={<PersonIcon />} label="Profile" />
                        <Tab icon={<AddressIcon />} label="Addresses" />
                        <Tab icon={<SecurityIcon />} label="Security" />
                        <Tab icon={<NotificationIcon />} label="Notifications" />
                    </Tabs>
                    {/* Profile Tab */}
                    <TabPanel value={tabValue} index={0}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                            <Typography variant="h6">Personal Information</Typography>
                            {!editMode && (
                                <Button
                                    startIcon={<EditIcon />}
                                    onClick={() => setEditMode(true)}
                                >
                                    Edit Profile
                                </Button>
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Avatar
                                sx={{ width: 100, height: 100, mr: 3 }}
                                src={user?.avatar}
                            >
                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </Avatar>
                            <Button
                                variant="outlined" startIcon={<CameraIcon />}
                            >
                                Change Photo
                            </Button>
                        </Box>
                        <form onSubmit={profileFormik.handleSubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="First Name" name="firstName" value={profileFormik.values.firstName}
                                        onChange={profileFormik.handleChange}
                                        disabled={!editMode}
                                        error={profileFormik.touched.firstName && Boolean(profileFormik.errors.firstName)}
                                        helperText={profileFormik.touched.firstName && profileFormik.errors.firstName}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Last Name" name="lastName" value={profileFormik.values.lastName}
                                        onChange={profileFormik.handleChange}
                                        disabled={!editMode}
                                        error={profileFormik.touched.lastName && Boolean(profileFormik.errors.lastName)}
                                        helperText={profileFormik.touched.lastName && profileFormik.errors.lastName}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Email" name="email" type="email" value={profileFormik.values.email}
                                        onChange={profileFormik.handleChange}
                                        disabled={!editMode}
                                        error={profileFormik.touched.email && Boolean(profileFormik.errors.email)}
                                        helperText={profileFormik.touched.email && profileFormik.errors.email}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Phone Number" name="phoneNumber" value={profileFormik.values.phoneNumber}
                                        onChange={profileFormik.handleChange}
                                        disabled={!editMode}
                                        error={profileFormik.touched.phoneNumber &&
                                            Boolean(profileFormik.errors.phoneNumber)}
                                        helperText={profileFormik.touched.phoneNumber &&
                                            profileFormik.errors.phoneNumber}
                                    />
                                </Grid>
                                {user?.customerType === 'BUSINESS' && (
                                    <>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Company Name" name="companyName" value={profileFormik.values.companyName}
                                                onChange={profileFormik.handleChange}
                                                disabled={!editMode}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="GST Number" name="gstNumber" value={profileFormik.values.gstNumber}
                                                onChange={profileFormik.handleChange}
                                                disabled={!editMode}
                                            />
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                            {editMode && (
                                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                                    <Button type="submit" variant="contained">
                                        Save Changes
                                    </Button>
                                    <Button variant="outlined" onClick={() => setEditMode(false)}>
                                        Cancel
                                    </Button>
                                </Box>
                            )}
                        </form>
                    </TabPanel>
                    {/* Addresses Tab */}
                    <TabPanel value={tabValue} index={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                            <Typography variant="h6">Saved Addresses</Typography>
                            <Button startIcon={<AddIcon />} variant="contained">
                                Add New Address
                            </Button>
                        </Box>
                        {addresses.length === 0 ? (
                            <Alert severity="info">
                                You haven't saved any addresses yet. </Alert>
                        ) : (
                            <List>
                                {addresses.map((address, index) => (
                                    <React.Fragment key={address.id}>
                                        <ListItem>
                                            <ListItemText
                                                primary={`${address.type} Address`}
                                                secondary={`${address.addressLine1}, ${address.city}, ${address.state} - ${address.postalCode}`}
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton edge="end" aria-label="edit">
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton edge="end" aria-label="delete">
                                                    <DeleteIcon />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                        {index < addresses.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                    </TabPanel>
                    {/* Security Tab */}
                    <TabPanel value={tabValue} index={2}>
                        <Typography variant="h6" gutterBottom>
                            Change Password
                        </Typography>
                        <form onSubmit={passwordFormik.handleSubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Current Password" name="currentPassword" type="password" value={passwordFormik.values.currentPassword}
                                        onChange={passwordFormik.handleChange}
                                        error={passwordFormik.touched.currentPassword &&
                                            Boolean(passwordFormik.errors.currentPassword)}
                                        helperText={passwordFormik.touched.currentPassword &&
                                            passwordFormik.errors.currentPassword}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="New Password" name="newPassword" type="password" value={passwordFormik.values.newPassword}
                                        onChange={passwordFormik.handleChange}
                                        error={passwordFormik.touched.newPassword &&
                                            Boolean(passwordFormik.errors.newPassword)}
                                        helperText={passwordFormik.touched.newPassword &&
                                            passwordFormik.errors.newPassword}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Confirm New Password" name="confirmPassword" type="password" value={passwordFormik.values.confirmPassword}
                                        onChange={passwordFormik.handleChange}
                                        error={passwordFormik.touched.confirmPassword &&
                                            Boolean(passwordFormik.errors.confirmPassword)}
                                        helperText={passwordFormik.touched.confirmPassword &&
                                            passwordFormik.errors.confirmPassword}
                                    />
                                </Grid>
                            </Grid>
                            <Button type="submit" variant="contained" sx={{ mt: 3 }}>
                                Update Password
                            </Button>
                        </form>
                        <Divider sx={{ my: 4 }} />
                        <Typography variant="h6" gutterBottom>
                            Two-Factor Authentication
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Add an extra layer of security to your account
                        </Typography>
                        <Button variant="outlined">
                            Enable Two-Factor Authentication
                        </Button>
                    </TabPanel>
                    {/* Notifications Tab */}
                    <TabPanel value={tabValue} index={3}>
                        <Typography variant="h6" gutterBottom>
                            Notification Preferences
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemText
                                    primary="Email Notifications" secondary="Receive order updates and promotions via email" />
                                <ListItemSecondaryAction>
                                    <Switch
                                        checked={notifications.email}
                                        onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem>
                                <ListItemText
                                    primary="SMS Notifications" secondary="Receive order updates via SMS" />
                                <ListItemSecondaryAction>
                                    <Switch
                                        checked={notifications.sms}
                                        onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem>
                                <ListItemText
                                    primary="Push Notifications" secondary="Receive notifications in your browser" />
                                <ListItemSecondaryAction>
                                    <Switch
                                        checked={notifications.push}
                                        onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem>
                                <ListItemText
                                    primary="Newsletter" secondary="Receive our weekly newsletter with deals and updates" />
                                <ListItemSecondaryAction>
                                    <Switch
                                        checked={notifications.newsletter}
                                        onChange={(e) => setNotifications({ ...notifications, newsletter: e.target.checked })}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                        </List>
                        <Button variant="contained" sx={{ mt: 3 }}>
                            Save Preferences
                        </Button>
                    </TabPanel>
                </Paper>
            </Container>
        </>
    );
};
export default ProfilePage