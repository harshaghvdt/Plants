# PlantLife Authentication & Verification System

## Overview
This document summarizes the new authentication and verification system implemented for the PlantLife application, replacing the previous Replit Auth system with a phone-based OTP authentication system.

## 🔐 **New Authentication System**

### **Phone-Based OTP Authentication**
- **Primary Identifier**: Phone number (instead of email)
- **Authentication Flow**: 
  1. User enters phone number
  2. System generates and sends 6-digit OTP
  3. User verifies OTP to authenticate
- **Security**: JWT tokens with 7-day expiration
- **Session Management**: HTTP-only cookies with secure flags

### **Account Types**
Users must select one of four account types during registration:

1. **Student** 🎓
   - Can verify anytime
   - Gets student verification badge
   - Basic proof submission required

2. **Farmer** 🌾
   - Cannot verify
   - Access to community features
   - No verification badge

3. **Plant Enthusiast** 🌱
   - Cannot verify
   - Access to community features
   - No verification badge

4. **Professor/Scientist** 🔬
   - Must verify within 7 days of account creation
   - Gets professor/scientist verification badge
   - Requires institute name, proof of work, and selfie

## 📱 **Authentication Flow**

### **Registration Process**
```
Phone Number → OTP Verification → Account Details → Account Creation
     ↓              ↓                ↓              ↓
  Send OTP    Verify OTP    Fill Profile Info   Complete
```

### **Login Process**
```
Phone Number → OTP Verification → Authentication Complete
     ↓              ↓                    ↓
  Send OTP    Verify OTP         Access Granted
```

## ✅ **Verification System**

### **Professor/Scientist Verification**
- **Deadline**: 7 days from account creation
- **Requirements**:
  - Institute name
  - Live capture of proof of work
  - Live selfie capture
- **Process**: Admin review and approval
- **Badge**: Verified Professor/Scientist

### **Student Verification**
- **Deadline**: Anytime (no time limit)
- **Requirements**: Basic proof documents
- **Process**: Admin review and approval
- **Badge**: Verified Student

### **Verification Statuses**
- `pending`: Awaiting admin review
- `approved`: Verification successful
- `rejected`: Verification failed

## 🗄️ **Database Schema Updates**

### **New Tables**
1. **OTPs Table**
   - Phone number
   - 6-digit OTP
   - Expiration time
   - Usage status

2. **Verification Requests Table**
   - User ID
   - Verification type
   - Status
   - Required documents
   - Admin notes
   - Review information

### **Updated Users Table**
- Phone number (primary identifier)
- Account type (required)
- Verification status
- Verification type

## 🔧 **Technical Implementation**

### **Backend Components**
1. **Authentication System** (`server/auth.ts`)
   - OTP generation and validation
   - JWT token management
   - User registration and login

2. **Verification System** (`server/verification.ts`)
   - Verification request handling
   - Admin review functionality
   - Deadline enforcement

3. **Storage Layer** (`server/storage.ts`)
   - User management
   - Verification request handling
   - Database operations

4. **API Routes** (`server/routes.ts`)
   - Authentication endpoints
   - Verification endpoints
   - User management endpoints

### **Frontend Components**
1. **Authentication Hooks** (`client/src/hooks/useAuth.ts`)
   - Login functionality
   - Registration functionality
   - OTP verification
   - Logout functionality

2. **Landing Page** (`client/src/pages/landing.tsx`)
   - Phone number input
   - OTP verification
   - Account type selection
   - Registration flow

## 📋 **API Endpoints**

### **Authentication Endpoints**
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Initiate login
- `POST /api/auth/verify-login` - Verify login OTP
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/user` - Get current user

### **Verification Endpoints**
- `POST /api/verification/submit` - Submit verification request
- `GET /api/verification/requests` - Get user's verification requests
- `GET /api/verification/status` - Get verification status

### **Admin Endpoints**
- `GET /api/admin/verification/pending` - Get pending verification requests
- `PUT /api/admin/verification/:requestId/review` - Review verification request

## 🔒 **Security Features**

### **OTP Security**
- 6-digit random OTP
- 10-minute expiration
- Single-use validation
- Rate limiting (TODO: implement)

### **JWT Security**
- Secure token generation
- HTTP-only cookies
- 7-day expiration
- Secure flag in production

### **Data Validation**
- Phone number format validation
- Input sanitization
- Schema validation with Zod
- Type safety with TypeScript

## 📱 **Mobile Optimization**

### **Touch-Friendly Design**
- Large input fields
- Easy OTP entry
- Responsive dialogs
- Mobile-first layout

### **User Experience**
- Step-by-step flow
- Clear error messages
- Progress indicators
- Form validation

## 🚀 **Future Enhancements**

### **SMS Integration**
- Integrate with Twilio/AWS SNS
- Real OTP delivery
- SMS templates
- Delivery status tracking

### **Advanced Security**
- Rate limiting
- IP blocking
- Device fingerprinting
- Multi-factor authentication

### **Admin Features**
- Admin role management
- Bulk verification processing
- Verification analytics
- Automated verification

## 📝 **Usage Examples**

### **Registration Flow**
```typescript
// 1. Send OTP
const { mutate: sendOTP } = useSendOTP();
sendOTP({ phone: "+1234567890" });

// 2. Verify OTP and register
const { mutate: register } = useRegister();
register({
  phone: "+1234567890",
  otp: "123456",
  firstName: "John",
  lastName: "Doe",
  username: "johndoe",
  accountType: "student"
});
```

### **Login Flow**
```typescript
// 1. Send login OTP
const { mutate: login } = useLogin();
login({ phone: "+1234567890" });

// 2. Verify OTP
const { mutate: verifyLogin } = useVerifyLoginOTP();
verifyLogin({ phone: "+1234567890", otp: "123456" });
```

### **Verification Request**
```typescript
// Submit verification request
const { mutate: submitVerification } = useSubmitVerification();
submitVerification({
  verificationType: "professor_scientist",
  instituteName: "University of Botany",
  proofOfWorkUrl: "https://example.com/proof",
  selfieUrl: "https://example.com/selfie"
});
```

## ✅ **Testing Checklist**

- [ ] Phone number validation
- [ ] OTP generation and expiration
- [ ] User registration flow
- [ ] User login flow
- [ ] Account type selection
- [ ] Verification deadline enforcement
- [ ] Admin verification review
- [ ] JWT token management
- [ ] Cookie security
- [ ] Mobile responsiveness
- [ ] Error handling
- [ ] Form validation

## 🎉 **Summary**

The new PlantLife authentication and verification system provides:

1. **Secure phone-based authentication** with OTP verification
2. **Flexible account types** with different verification requirements
3. **Enforced verification deadlines** for professors/scientists
4. **Comprehensive verification system** with admin review
5. **Mobile-optimized user experience** with touch-friendly design
6. **Robust security features** including JWT tokens and secure cookies
7. **Scalable architecture** ready for SMS integration

This system ensures that only verified professionals can claim expert status while maintaining an inclusive community for all plant enthusiasts.
