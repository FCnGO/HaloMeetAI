import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { api } from '../services/api';
import {
  Sparkles,
  Save,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Camera,
  Upload,
  ShieldAlert,
  RefreshCw,
  Pencil,
  ChevronRight,
  X,
  Activity
} from 'lucide-react';
import { getPastelTheme } from '../utils/pastel';

interface ProfileStudioProps {
  currentPersona: UserProfile;
  allHeroPersonas: UserProfile[];
  onSwitchPersona: (personaId: string) => void;
  onProfileUpdated: (updated: UserProfile) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onResetDemo?: () => void;
  onOpenActivityLog?: () => void;
  onReplaySplash?: () => void;
  onLogout?: () => void;
}

export const ProfileStudio: React.FC<ProfileStudioProps> = ({
  currentPersona,
  onProfileUpdated,
  isDarkMode,
  onToggleDarkMode,
  onOpenActivityLog,
  onLogout
}) => {
  const [formData, setFormData] = useState<UserProfile>(currentPersona);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [shareLiveLocation, setShareLiveLocation] = useState(true);

  // Expandable panels
  const [showIdentityEdit, setShowIdentityEdit] = useState(false);
  const [showAgentEdit, setShowAgentEdit] = useState(false);
  const [showAvatarPanel, setShowAvatarPanel] = useState(false);

  // Live Avatar Generator States
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarErrorNotice, setAvatarErrorNotice] = useState<string | null>(null);
  const [uploadedPhotoBase64, setUploadedPhotoBase64] = useState<string | null>(null);
  const [uploadedMimeType, setUploadedMimeType] = useState<string>('image/jpeg');
  const [variationCount, setVariationCount] = useState<number>(1);
  const [referencePhotos, setReferencePhotos] = useState<{ base64: string; mimeType: string }[]>([]);
  const [avatarStyle, setAvatarStyle] = useState<'light' | 'signature' | 'dark'>('signature');
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const referenceInputRef = React.useRef<HTMLInputElement | null>(null);
  const MAX_REFERENCE_PHOTOS = 3;

  useEffect(() => {
    setFormData(currentPersona);
    setProfileError(null);
    setAvatarError(null);
    setAvatarErrorNotice(null);
    setUploadedPhotoBase64(null);
    setReferencePhotos([]);
    setVariationCount(1);
    setAvatarStyle('signature');
    setShowIdentityEdit(false);
    setShowAgentEdit(false);
    setShowAvatarPanel(false);
  }, [currentPersona]);

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePermissionToggle = (permKey: keyof UserProfile['permissions']) => {
    const updated = {
      ...formData,
      permissions: { ...formData.permissions, [permKey]: !formData.permissions[permKey] }
    };
    setFormData(updated);
    onProfileUpdated(updated);
    api.saveProfile(updated).catch(err => console.error('Failed to save permission toggle:', err));
  };

  const handleGeneratePresence = async () => {
    if (!formData.rawDescription.trim()) return;
    setIsGenerating(true);
    setProfileError(null);
    try {
      const res = await api.generatePresence({
        name: formData.name,
        role: formData.role,
        company: formData.company,
        objective: formData.objective,
        rawDescription: formData.rawDescription
      });

      const updated = {
        ...formData,
        agentSpec: res.agentSpec
      };
      setFormData(updated);
      onProfileUpdated(updated);
      await api.saveProfile(updated);
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3000);
    } catch (err: any) {
      console.error('Failed to generate presence:', err);
      setProfileError(err?.message || 'Failed to synthesize presence with Gemini. Please retry.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setProfileError(null);
    try {
      const res = await api.saveProfile(formData);
      onProfileUpdated(res.profile);
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3000);
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      setProfileError(err?.message || 'Failed to save profile settings. Please retry.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Photo size exceeds 5MB. Please upload a smaller photo.');
      return;
    }

    setAvatarError(null);
    setAvatarErrorNotice(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setUploadedPhotoBase64(dataUrl);
      setUploadedMimeType(file.type);
      setVariationCount(1);
      setReferencePhotos([]);
      const immediateProfile = {
        ...formData,
        avatar: dataUrl
      };
      setFormData(immediateProfile);
      onProfileUpdated(immediateProfile);
      await executeAvatarGeneration(dataUrl, file.type, 1, []);
    };
    reader.onerror = () => {
      setAvatarError('Failed to read the selected image file. Please try another image.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleReferencePhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !uploadedPhotoBase64) return;
    if (referencePhotos.length >= MAX_REFERENCE_PHOTOS) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const nextRefs = [...referencePhotos, { base64: dataUrl, mimeType: file.type }];
      setReferencePhotos(nextRefs);
      const nextVariation = variationCount + 1;
      setVariationCount(nextVariation);
      await executeAvatarGeneration(uploadedPhotoBase64, uploadedMimeType, nextVariation, nextRefs);
    };
    reader.readAsDataURL(file);
  };

  const executeAvatarGeneration = async (imageBase64: string, mimeType: string, variationIndex: number, refs?: { base64: string; mimeType: string }[], styleOverride?: 'light' | 'signature' | 'dark') => {
    setIsGeneratingAvatar(true);
    setAvatarError(null);
    try {
      const res = await api.generateAvatar({
        personaId: formData.id,
        imageBase64,
        mimeType,
        variationIndex,
        extraImages: refs ?? referencePhotos,
        style: styleOverride ?? avatarStyle
      });

      if (res.avatarUrl) {
        const updated = {
          ...formData,
          avatar: res.avatarUrl
        };
        setFormData(updated);
        onProfileUpdated(updated);
        if (res.errorNotice) {
          setAvatarErrorNotice(res.errorNotice);
        }
      }
    } catch (err: any) {
      console.error('Failed to generate avatar:', err);
      setAvatarError(err?.message || 'Avatar generation failed. Please retry.');
      if (imageBase64) {
        const updated = {
          ...formData,
          avatar: imageBase64
        };
        setFormData(updated);
        onProfileUpdated(updated);
      }
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const handleRegenerateAvatar = async () => {
    if (!uploadedPhotoBase64) return;
    const nextVariation = variationCount + 1;
    setVariationCount(nextVariation);
    await executeAvatarGeneration(uploadedPhotoBase64, uploadedMimeType, nextVariation);
  };

  const handleSelectStyle = async (style: 'light' | 'signature' | 'dark') => {
    setAvatarStyle(style);
    if (!uploadedPhotoBase64) return;
    const nextVariation = variationCount + 1;
    setVariationCount(nextVariation);
    await executeAvatarGeneration(uploadedPhotoBase64, uploadedMimeType, nextVariation, referencePhotos, style);
  };

  const currentPastel = getPastelTheme(formData.id);
  const myAgentDescription = formData.agentSpec.products[0]?.description || formData.agentSpec.oneLinePitch;

  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-[430px] mx-auto pb-24">

      <h1 className="font-semibold text-[#16171A] text-[28px] tracking-tight">Profile</h1>

      {onOpenActivityLog && (
        <button
          type="button"
          onClick={onOpenActivityLog}
          className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-[#D8D8D3] text-left cursor-pointer hover:bg-[#F6F6F3] transition-colors shadow-xs"
        >
          <div className="w-9 h-9 rounded-2xl bg-[#E0F2FE] border border-[#BAE6FD] flex items-center justify-center text-[#0369A1] shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-[#16171A]">Activity log &amp; demo tools</div>
            <div className="text-xs text-[#5A5C63]">Judge inspector, transcripts, audit trail</div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8E9097] shrink-0" />
        </button>
      )}

      {/* Visible Error State Display */}
      {profileError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 animate-fade-in shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-rose-900">
                Action Failed
              </div>
              <div className="text-[11px] text-rose-700 mt-0.5 leading-relaxed break-words">
                {profileError}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => setProfileError(null)}
              className="px-3.5 py-1.5 text-xs font-medium text-rose-800 bg-white border border-rose-200 rounded-full cursor-pointer hover:bg-rose-50"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Identity Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={formData.avatar}
            alt={formData.name}
            className="w-16 h-16 rounded-full object-cover ring-2 shrink-0"
            style={{ borderColor: currentPastel.border }}
          />
          <div className="min-w-0">
            <div className="font-semibold text-[22px] tracking-tight text-[#16171A] truncate">{formData.name}</div>
            <div className="text-sm text-[#5A5C63] font-normal truncate">{formData.role}, {formData.company}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowIdentityEdit(!showIdentityEdit)}
          className="w-9 h-9 rounded-full bg-white border border-[#D8D8D3] flex items-center justify-center text-[#5558E8] shadow-xs shrink-0 cursor-pointer"
          title="Edit profile"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>

      {showIdentityEdit && (
        <div className="clean-card p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#5A5C63] mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 border border-[#D8D8D3] rounded-2xl bg-white text-[#16171A] focus:outline-hidden focus:border-[#16171A]"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-[#5A5C63] mb-1">Role Title</label>
              <input
                type="text"
                value={formData.role}
                onChange={e => handleInputChange('role', e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 border border-[#D8D8D3] rounded-2xl bg-white text-[#16171A] focus:outline-hidden focus:border-[#16171A]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#5A5C63] mb-1">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={e => handleInputChange('company', e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 border border-[#D8D8D3] rounded-2xl bg-white text-[#16171A] focus:outline-hidden focus:border-[#16171A]"
              />
            </div>
          </div>
          {saveSuccessNotice && (
            <span className="text-xs font-semibold text-[#166534] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Saved
            </span>
          )}
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="btn-primary-pill w-full h-10 text-sm shadow-xs disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      )}

      {/* Create Digital Twin Card */}
      <button
        type="button"
        onClick={() => setShowAvatarPanel(!showAvatarPanel)}
        className="w-full flex items-center gap-3 p-4 rounded-2xl bg-[#EEF0FD] text-left cursor-pointer hover:bg-[#E4E8FC] transition-colors"
      >
        <div className="w-10 h-10 rounded-2xl bg-[#5558E8] flex items-center justify-center shrink-0">
          <Sparkles className="w-4.5 h-4.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[15px] text-[#5558E8]">Create digital twin</div>
          <div className="text-xs text-[#5A5C63]">Turn a selfie into your on-brand avatar</div>
        </div>
        <ChevronRight className="w-4 h-4 text-[#5558E8] shrink-0" />
      </button>

      {showAvatarPanel && (
        <div className="clean-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#16171A]">
              <Camera className="w-4 h-4 text-[#16171A]" />
              <span>Digital twin</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]">
                Gemini Image Model
              </span>
            </div>
            <button type="button" onClick={() => setShowAvatarPanel(false)} className="text-[#8E9097] hover:text-[#16171A] cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-[#5A5C63] leading-relaxed">
            Turn one selfie into an on-brand avatar used across the radar, chats and avatar transcripts.
          </p>

          {avatarError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-xs text-rose-900 shadow-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="font-semibold">Avatar Generation Notice:</span>
                <p className="text-[11px] mt-0.5 text-rose-700 break-words">{avatarError}</p>
              </div>
              <button type="button" onClick={() => setAvatarError(null)} className="text-[10px] underline text-rose-700 hover:text-rose-900 shrink-0 cursor-pointer">
                Dismiss
              </button>
            </div>
          )}

          {avatarErrorNotice && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2 text-xs text-amber-900 shadow-xs">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="font-semibold">Image Model Quota Status:</span>
                <p className="text-[11px] mt-0.5 text-amber-800 leading-relaxed">{avatarErrorNotice}</p>
              </div>
              <button type="button" onClick={() => setAvatarErrorNotice(null)} className="text-[10px] underline text-amber-800 hover:text-amber-900 shrink-0 cursor-pointer">
                Dismiss
              </button>
            </div>
          )}

          <div className="flex items-center gap-4 p-4 bg-[#F6F6F3] rounded-2xl border border-[#E2E2DC]">
            <div className="relative shrink-0">
              <img
                src={formData.avatar}
                alt={formData.name}
                className="w-20 h-20 rounded-3xl object-cover ring-2 shadow-sm bg-white"
                style={{ borderColor: currentPastel.border }}
              />
              {isGeneratingAvatar && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center text-white">
                  <RefreshCw className="w-5 h-5 animate-spin text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2.5 min-w-0">
              <div>
                <div className="text-sm font-semibold text-[#16171A] truncate">{formData.name}</div>
                <div className="text-[11px] text-[#5A5C63]">
                  {uploadedPhotoBase64 && formData.avatar === uploadedPhotoBase64
                    ? (variationCount > 1 ? `Variation #${variationCount} (Uploaded Photo)` : 'Uploaded Photo (Active)')
                    : (variationCount > 1 ? `Variation #${variationCount} Active` : 'Current Active Avatar')}
                </div>
              </div>

              <input type="file" ref={fileInputRef} onChange={handlePhotoFileSelected} accept="image/jpeg,image/png,image/webp" className="hidden" />

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  disabled={isGeneratingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary-pill px-3.5 py-1.5 text-xs shadow-xs disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadedPhotoBase64 ? 'Upload New Photo' : 'Upload Your Photo'}</span>
                </button>

                {uploadedPhotoBase64 && (
                  <button
                    type="button"
                    disabled={isGeneratingAvatar}
                    onClick={handleRegenerateAvatar}
                    className="btn-secondary-pill px-3.5 py-1.5 text-xs shadow-xs disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAvatar ? 'animate-spin' : ''}`} />
                    <span>Regenerate Variation</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {uploadedPhotoBase64 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[#8E9097] uppercase tracking-wider">Source &amp; References</span>
                <span className="text-[10px] text-[#8E9097] font-medium">{1 + referencePhotos.length} / {1 + MAX_REFERENCE_PHOTOS}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-12 h-12 shrink-0">
                  <img src={uploadedPhotoBase64} alt="Selfie" className="w-12 h-12 rounded-xl object-cover" />
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[7px] font-semibold uppercase tracking-wider bg-[#16171A] text-white px-1.5 py-0.2 rounded-full whitespace-nowrap">Selfie</span>
                </div>
                {referencePhotos.map((ref, idx) => (
                  <img key={idx} src={ref.base64} alt={`Reference ${idx + 1}`} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                ))}
                {referencePhotos.length < MAX_REFERENCE_PHOTOS && (
                  <>
                    <input type="file" ref={referenceInputRef} onChange={handleReferencePhotoSelected} accept="image/jpeg,image/png,image/webp" className="hidden" />
                    <button
                      type="button"
                      disabled={isGeneratingAvatar}
                      onClick={() => referenceInputRef.current?.click()}
                      className="w-12 h-12 rounded-xl border border-dashed border-[#D8D8D3] bg-[#F6F6F3] flex items-center justify-center text-[#8E9097] hover:text-[#16171A] hover:border-[#16171A] transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      <span className="text-lg leading-none">+</span>
                    </button>
                  </>
                )}
              </div>
              <p className="text-[11px] text-[#8E9097] leading-relaxed">
                One selfie is enough. Add up to {MAX_REFERENCE_PHOTOS} more (other angles, product logos, booth shots) to sharpen the likeness and branding.
              </p>
            </div>
          )}

          {uploadedPhotoBase64 && (
            <div className="space-y-2">
              <span className="text-[10px] font-semibold text-[#8E9097] uppercase tracking-wider">Style</span>
              <div className="flex items-center gap-2.5">
                {([
                  { id: 'light', label: 'Light', bg: '#DCE4FF', text: '#3B4AC8' },
                  { id: 'signature', label: 'Signature', bg: '#5558E8', text: '#FFFFFF' },
                  { id: 'dark', label: 'Dark', bg: '#16171A', text: '#FFFFFF' }
                ] as const).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    disabled={isGeneratingAvatar}
                    onClick={() => handleSelectStyle(s.id)}
                    className="flex flex-col items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <span
                      className={`w-11 h-11 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${avatarStyle === s.id ? 'ring-2 ring-[#16171A] ring-offset-2' : ''}`}
                      style={{ backgroundColor: s.bg, color: s.text }}
                    >
                      {formData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                    <span className="text-[10px] font-medium text-[#5A5C63]">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-[#5A5C63]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#166534] shrink-0" />
            <span>Privacy: Uploaded photos are processed in memory and never stored. Only the generated avatar is saved.</span>
          </div>
        </div>
      )}

      {/* MY AVATAR Card */}
      <div className="clean-card p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#8E9097] uppercase tracking-wider">My Avatar</span>
          <button
            type="button"
            onClick={() => setShowAgentEdit(!showAgentEdit)}
            className="text-sm font-semibold text-[#5558E8] cursor-pointer"
          >
            Edit
          </button>
        </div>
        <p className="text-sm text-[#16171A] leading-relaxed">{myAgentDescription}</p>
        {formData.agentSpec.disallowedTopics.length > 0 && (
          <p className="text-xs text-[#B45309]">
            Off-limits: {formData.agentSpec.disallowedTopics.join(', ')}
          </p>
        )}
      </div>

      {showAgentEdit && (
        <div className="clean-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#16171A] uppercase tracking-wider">Edit Avatar Brief</span>
            <button type="button" onClick={() => setShowAgentEdit(false)} className="text-[#8E9097] hover:text-[#16171A] cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5A5C63] mb-1">Free-Text Pitch &amp; Product Notes</label>
            <textarea
              rows={4}
              value={formData.rawDescription}
              onChange={e => handleInputChange('rawDescription', e.target.value)}
              className="w-full text-sm p-3 border border-[#D8D8D3] rounded-2xl bg-white text-[#16171A] focus:outline-hidden focus:border-[#16171A] leading-relaxed"
            />
          </div>
          <button
            type="button"
            onClick={handleGeneratePresence}
            disabled={isGenerating || !formData.rawDescription.trim()}
            className="btn-primary-pill w-full h-11 text-sm shadow-xs disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'Synthesizing with Gemini...' : 'Regenerate My Digital Presence'}</span>
          </button>
          {saveSuccessNotice && (
            <span className="text-xs font-semibold text-[#166534] flex items-center gap-1 justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Saved
            </span>
          )}

          <div className="space-y-2 pt-1 border-t border-[#E2E2DC]">
            <div className="text-[10px] font-semibold text-[#8E9097] uppercase tracking-wider pt-2">Products</div>
            {formData.agentSpec.products.map((p, idx) => (
              <div key={idx} className="p-3 bg-[#F6F6F3] rounded-2xl border border-[#E2E2DC] text-xs">
                <div className="font-semibold text-[#16171A]">{p.title}</div>
                <div className="text-[11px] text-[#5A5C63] mt-0.5 leading-relaxed">{p.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toggles Card */}
      <div className="clean-card divide-y divide-[#E2E2DC]">
        {[
          {
            key: 'discoverable',
            label: 'Discoverable',
            sub: 'Others can see you and talk to your avatar',
            checked: formData.permissions.showPresence,
            onToggle: () => handlePermissionToggle('showPresence')
          },
          {
            key: 'location',
            label: 'Share live location',
            sub: 'Only with accepted intros',
            checked: shareLiveLocation,
            onToggle: () => setShareLiveLocation(v => !v)
          },
          {
            key: 'askBefore',
            label: 'Ask before intros',
            sub: 'Avatar drafts, you approve',
            checked: formData.permissions.requireApprovalForMeetings,
            onToggle: () => handlePermissionToggle('requireApprovalForMeetings')
          },
          {
            key: 'dark',
            label: 'Dark mode',
            sub: '',
            checked: !!isDarkMode,
            onToggle: onToggleDarkMode
          }
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between p-4">
            <div>
              <div className="text-[15px] text-[#16171A]">{item.label}</div>
              {item.sub && <div className="text-xs text-[#8E9097] mt-0.5">{item.sub}</div>}
            </div>
            <button
              type="button"
              onClick={item.onToggle}
              className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors shrink-0 cursor-pointer ${
                item.checked ? 'bg-[#5558E8]' : 'bg-[#D8D8D3]'
              }`}
            >
              <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${item.checked ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        ))}
      </div>

      {onLogout && (
        <button
          type="button"
          onClick={onLogout}
          className="w-full text-center text-sm text-rose-600 font-medium py-2 cursor-pointer"
        >
          Log out
        </button>
      )}

    </div>
  );
};
