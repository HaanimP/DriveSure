# How to Access Profile Pages

## From Dashboard

### Customer Dashboard
1. Go to `/customer` after login
2. Click the **👤 Profile** button in the top-right corner
3. You'll be taken to `/customer/profile`

### Agent Dashboard  
1. Go to `/agent` after login
2. Click the **👤 Profile** button in the top-right corner
3. You'll be taken to `/agent/profile`

### Admin Dashboard
1. Go to `/admin` after login
2. Click the **👤 Profile** button in the top-right corner  
3. You'll be taken to `/admin/profile`

---

## Profile Page Tabs

### Customer Profile Tabs
- **Personal Info** - Edit name, phone, upload picture
- **Security** - Change password
- **My Requests** - View all car requests with status
- **My Reviews** - See reviews you've submitted
- **Settings** - Notification preferences and logout

### Agent Profile Tabs
- **Personal Info** - Edit name, phone, upload picture
- **Security** - Change password
- **Assigned Requests** - View your customer jobs
- **My Reviews** - View ratings from customers
- **Settings** - Job notification preferences and logout

### Admin Profile Tabs
- **Personal Info** - Edit admin details
- **Security** - Change password
- **User Management** - Search & manage all users
- **Review Approval** - Approve/reject pending reviews
- **Support Messages** - View contact form submissions
- **Settings** - System settings and logout

---

## API Endpoints

All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Profile Endpoints

**Get User Profile**
```
GET /api/profile/:userId
Response: { id, first_name, last_name, email, phone, role, profile_picture, created_at }
```

**Update Profile**
```
PUT /api/profile/:userId
Body: { first_name, last_name, phone, profile_picture }
Response: { message: "Profile updated successfully" }
```

**Change Password**
```
POST /api/profile/:userId/change-password
Body: { currentPassword, newPassword }
Response: { message: "Password changed successfully" }
```

**Get Statistics**
```
GET /api/profile/:userId/stats
Response: { total_requests, average_rating, completed_requests }
```

---

## Color Scheme by Role

| Role | Color | Hex |
|------|-------|-----|
| Customer | Blue | #0052CC |
| Agent | Green | #27AE60 |
| Admin | Purple | #8E44AD |

---

## Key Features

✅ **Profile Picture Upload**
- Click camera icon
- Select image file
- Automatically converts to base64
- Displays on profile header

✅ **Editable Fields**
- First Name
- Last Name  
- Phone Number
- Password (with verification)

✅ **Password Security**
- Must verify current password
- New password confirmation required
- Passwords must match
- Uses bcryptjs encryption

✅ **Statistics (Agent & Admin)**
- Automatic calculation from database
- Updates in real-time
- Shows key performance metrics

✅ **User Management (Admin Only)**
- Search bar for filtering users
- View all users in table format
- Activate/deactivate accounts
- See role and join date

✅ **Review Management (Admin Only)**
- Separate tabs for pending and approved
- One-click approval
- One-click rejection/deletion
- Shows 5-star ratings

✅ **Responsive Design**
- Works on desktop, tablet, mobile
- Touch-friendly buttons
- Scrollable tabs on small screens
- Flexible grid layouts

---

## Testing Profile Features

### Test 1: Upload Profile Picture
1. Go to any profile page
2. Hover over profile picture in header
3. Click camera icon
4. Select an image file
5. Picture should display immediately

### Test 2: Edit Profile
1. Go to "Personal Info" tab
2. Change first or last name
3. Change phone number
4. Click "Save Changes"
5. Should see success message

### Test 3: Change Password
1. Go to "Security" tab
2. Enter current password
3. Enter new password
4. Confirm new password
5. Click "Change Password"
6. Should see success message
7. Next login requires new password

### Test 4: View Statistics (Agent)
1. Go to Agent profile
2. View top stats cards
3. Numbers should match database records
4. Update should be reflected when requests change

### Test 5: Approve Reviews (Admin)
1. Go to Admin profile
2. Go to "Review Approval" tab
3. Click "Approve" on any pending review
4. Should move to approved section
5. "Reject" should delete review

---

## Troubleshooting

**Profile Picture Not Saving**
- Check file is under 10MB
- Ensure token is valid
- Check browser console for errors
- Verify backend is running on localhost:3001

**Cannot Change Password**
- Verify current password is correct
- Check password confirmation matches
- Ensure passwords meet requirements (if any)
- Check authorization token is valid

**Statistics Not Loading**
- Verify backend is running
- Check network tab for 401/403 errors
- Ensure user ID is correct
- Check database connection

**Cannot Access Profile**
- Must be logged in (valid JWT token)
- Must access correct role profile (/customer/profile for customers, etc.)
- Token must not be expired
- Browser localStorage must have driveSureUser data

---
