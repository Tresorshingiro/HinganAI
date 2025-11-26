import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Save, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Calendar,
  Sprout,
  Maximize
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { userService } from '../lib/database';
import type { UserProfile } from '../types/database';

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');

      // Use the existing userService from database.ts
      const data = await userService.getProfile(user?.id || '');

      if (!data) {
        // If profile doesn't exist, create one
        const newProfile: Omit<UserProfile, 'created_at' | 'updated_at'> = {
          id: user?.id || '',
          email: user?.email || '',
          full_name: user?.user_metadata?.full_name || '',
          avatar_url: user?.user_metadata?.avatar_url || ''
        };

        const result = await userService.createProfile(newProfile);
        
        if (result.success && result.data) {
          setProfile(result.data);
          setPreviewImage(result.data.avatar_url || '');
        } else {
          throw new Error(result.error || 'Failed to create profile');
        }
      } else {
        setProfile(data);
        setPreviewImage(data.avatar_url || '');
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError((err as Error).message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (profile) {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingImage(true);
      setError('');

      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`; // Simple path without subfolder

      const { error: uploadError } = await supabase.storage
        .from('profile-avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-avatars')
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl;

      // Update profile with new avatar URL using userService
      const result = await userService.updateProfile(user?.id || '', { 
        avatar_url: avatarUrl 
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to update profile');
      }

      setProfile(result.data || profile);
      setSuccess('Profile image updated successfully!');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError((err as Error).message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Use userService to update profile
      const result = await userService.updateProfile(user?.id || '', {
        full_name: profile.full_name,
        phone_number: profile.phone_number,
        farm_location: profile.farm_location,
        farm_size: profile.farm_size,
        primary_crops: profile.primary_crops
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError((err as Error).message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account information and preferences</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Image Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Upload your profile image</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600">
                      <User className="h-20 w-20 text-white" />
                    </div>
                  )}
                </div>
                
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  {uploadingImage ? (
                    <Loader2 className="h-5 w-5 text-green-600 animate-spin" />
                  ) : (
                    <Camera className="h-5 w-5 text-green-600" />
                  )}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Click the camera icon to upload
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Max size: 5MB
                </p>
              </div>
            </div>

            {/* Account Info */}
            <div className="pt-4 border-t space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{profile?.email}</span>
              </div>
              {profile?.created_at && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    Joined {new Date(profile.created_at).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Information Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Farm & Personal Information</CardTitle>
            <CardDescription>Update your farming details and personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </div>
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={profile?.full_name || ''}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone_number">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </div>
                </Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  value={profile?.phone_number || ''}
                  onChange={handleInputChange}
                  placeholder="+250 XXX XXX XXX"
                />
              </div>

              {/* Farm Location */}
              <div className="space-y-2">
                <Label htmlFor="farm_location">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Farm Location
                  </div>
                </Label>
                <Input
                  id="farm_location"
                  name="farm_location"
                  value={profile?.farm_location || ''}
                  onChange={handleInputChange}
                  placeholder="City, District, Rwanda"
                />
              </div>

              {/* Farm Size */}
              <div className="space-y-2">
                <Label htmlFor="farm_size">
                  <div className="flex items-center gap-2">
                    <Maximize className="h-4 w-4" />
                    Farm Size (hectares)
                  </div>
                </Label>
                <Input
                  id="farm_size"
                  name="farm_size"
                  type="number"
                  step="0.1"
                  value={profile?.farm_size || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., 2.5"
                />
              </div>

              {/* Primary Crops */}
              <div className="space-y-2">
                <Label htmlFor="primary_crops">
                  <div className="flex items-center gap-2">
                    <Sprout className="h-4 w-4" />
                    Primary Crops
                  </div>
                </Label>
                <Input
                  id="primary_crops"
                  name="primary_crops"
                  value={profile?.primary_crops?.join(', ') || ''}
                  onChange={(e) => {
                    if (profile) {
                      const crops = e.target.value.split(',').map(c => c.trim()).filter(c => c);
                      setProfile({ ...profile, primary_crops: crops });
                    }
                  }}
                  placeholder="e.g., Maize, Beans, Cassava (comma-separated)"
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Additional Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Email Address</h3>
              <p className="text-sm text-gray-500">{profile?.email}</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Verified
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Password</h3>
              <p className="text-sm text-gray-500">Change your password</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                if (profile?.email) {
                  // This will send a password reset email
                  supabase.auth.resetPasswordForEmail(profile.email, {
                    redirectTo: `${window.location.origin}/reset-password`
                  }).then(() => {
                    setSuccess('Password reset email sent! Check your inbox.');
                    setTimeout(() => setSuccess(''), 5000);
                  });
                }
              }}
            >
              Reset Password
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Account Type</h3>
              <p className="text-sm text-gray-500">Free Plan</p>
            </div>
            <Button variant="outline" size="sm">
              Upgrade
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
