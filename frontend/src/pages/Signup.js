import React, { useState } from 'react';
import { Phone, Mail, ArrowRight, Heart, Shield, Check, User, Home, Users, Calendar } from 'lucide-react';

const SignupPage = () => {
  const [step, setStep] = useState('signup'); // 'signup' or 'otp'
  const [activeTab, setActiveTab] = useState('profile'); // Default to profile for signup
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: ''
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dummy API calls
  const signupUser = async (userData) => {
    setLoading(true);
    setError('');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Validate required fields
    if (!userData.name.trim()) {
      setError('Name is required');
      setLoading(false);
      return false;
    }
    
    if (!userData.mobile || !/^\d{10}$/.test(userData.mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      setLoading(false);
      return false;
    }
    
    // Validate email only if provided
    if (userData.email && !/\S+@\S+\.\S+/.test(userData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return false;
    }
    
    console.log('Signup data:', userData);
    setLoading(false);
    return true;
  };

  const verifyOtp = async (otpCode) => {
    setLoading(true);
    setError('');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Dummy verification (accept 123456 as valid)
    if (otpCode === '123456') {
      setLoading(false);
      alert(`Welcome to PawShare, ${formData.name}! 🐾\n\nYour account has been created successfully.`);
      return true;
    } else {
      setError('Invalid OTP. Try 123456 for demo.');
      setLoading(false);
      return false;
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSignup = async () => {
    const success = await signupUser(formData);
    if (success) {
      setStep('otp');
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
      
      // Auto-verify when all digits are entered
      if (newOtp.every(digit => digit) && newOtp.join('').length === 6) {
        verifyOtp(newOtp.join(''));
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const isFormValid = formData.name.trim() && formData.mobile && /^\d{10}$/.test(formData.mobile);

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const renderSignupContent = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl mb-4 shadow-lg">
            <Heart className="w-10 h-10 text-white" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            PawShare
          </h1>
          <p className="text-gray-600 mt-2">
            {step === 'signup' ? 'Join our pet-loving community' : 'Verify your mobile number'}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 backdrop-blur-sm border border-white/20">
          {step === 'signup' ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create Account</h2>
              
              {/* Name Field */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-lg"
                  />
                </div>
              </div>

              {/* Mobile Field (Mandatory) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter your mobile number"
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-lg"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">We'll send an OTP to verify your number</p>
              </div>

              {/* Email Field (Optional) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email (optional)"
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-lg"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">For account recovery and notifications</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={handleSignup}
                disabled={!isFormValid || loading}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Trust Indicators */}
              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Secure
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Verified
                </div>
              </div>
            </>
          ) : (
            <>
              {/* OTP Verification */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Mobile</h2>
                <p className="text-gray-600">
                  We've sent a 6-digit code to{' '}
                  <span className="font-medium text-gray-900">+91 {formData.mobile}</span>
                </p>
              </div>

              {/* OTP Input */}
              <div className="flex gap-3 justify-center mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    maxLength="1"
                  />
                ))}
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                  <p className="text-red-600 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Demo Hint */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                <p className="text-blue-600 text-sm text-center">
                  💡 Demo: Use <strong>123456</strong> as OTP
                </p>
              </div>

              {loading && (
                <div className="flex justify-center mb-6">
                  <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Resend OTP */}
              <div className="text-center">
                <button
                  onClick={() => setStep('signup')}
                  className="text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200"
                >
                  ← Back to signup
                </button>
                <div className="mt-2">
                  <button
                    onClick={handleSignup}
                    className="text-gray-500 hover:text-gray-700 text-sm transition-colors duration-200"
                  >
                    Didn't receive OTP? Resend
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>By continuing, you agree to our Terms & Privacy Policy</p>
        </div>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="min-h-screen">
        {renderSignupContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around py-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon 
                  className={`w-6 h-6 mb-1 ${isActive ? 'scale-110' : ''} transition-transform duration-200`}
                  fill={isActive ? 'currentColor' : 'none'}
                />
                <span className={`text-xs font-medium ${isActive ? 'text-orange-600' : 'text-gray-500'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SignupPage;