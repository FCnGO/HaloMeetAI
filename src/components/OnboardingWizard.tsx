import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { api } from '../services/api';
import { ChevronLeft, Camera, Sparkles, CheckCircle2, Plus, X, AlertCircle, Pencil } from 'lucide-react';

interface OnboardingWizardProps {
  currentPersona: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
  onComplete: () => void;
}

const EditableTagGroup: React.FC<{
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  tone?: 'default' | 'danger';
}> = ({ label, tags, onChange, tone = 'default' }) => {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const commitAdd = () => {
    const trimmed = draft.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setDraft('');
    setAdding(false);
  };

  const chipClass = tone === 'danger'
    ? 'bg-rose-50 text-rose-700'
    : 'bg-[#F6F6F3] text-[#16171A]';

  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-medium text-[#5A5C63]">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span key={tag} className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${chipClass}`}>
            {tag}
            <button type="button" onClick={() => onChange(tags.filter(t => t !== tag))} className="cursor-pointer">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {adding ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitAdd}
            onKeyDown={(e) => { if (e.key === 'Enter') commitAdd(); if (e.key === 'Escape') { setDraft(''); setAdding(false); } }}
            className="text-xs font-medium px-2.5 py-1 rounded-full border border-[#D8D8D3] outline-none w-28"
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border border-dashed border-[#D8D8D3] text-[#8E9097] cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        )}
      </div>
    </div>
  );
};

interface ProductDraft {
  title: string;
  description: string;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  currentPersona,
  onProfileUpdated,
  onComplete
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Step 1 state
  const [name, setName] = useState(currentPersona.name);
  const [position, setPosition] = useState(currentPersona.role);
  const [company, setCompany] = useState(currentPersona.company);
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [email, setEmail] = useState(currentPersona.contactInfo.email.replace(/^•+/, ''));
  const [phone, setPhone] = useState(currentPersona.contactInfo.phone || '');
  const [linkedin, setLinkedin] = useState(currentPersona.contactInfo.linkedin || '');
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [avatar, setAvatar] = useState(currentPersona.avatar);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Step 2 state
  const [products, setProducts] = useState<ProductDraft[]>(
    currentPersona.agentSpec.products.length > 0
      ? currentPersona.agentSpec.products.map(p => ({ title: p.title, description: p.description }))
      : [{ title: '', description: '' }]
  );

  // Step 3 state
  const [brief, setBrief] = useState(currentPersona.rawDescription);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [pendingProfile, setPendingProfile] = useState<UserProfile | null>(null);
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [isActivating, setIsActivating] = useState(false);

  const deriveLookingFor = (objective: UserProfile['objective']): string[] => {
    switch (objective) {
      case 'find_partners': return ['Partnership leads'];
      case 'invest': return ['Investment opportunities'];
      case 'sell_products': return ['Buyers & customers'];
      case 'network': return ['New connections'];
      default: return ['Relevant contacts'];
    }
  };

  const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select a valid image file.');
      return;
    }
    setAvatarError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setAvatar(dataUrl);
      setIsGeneratingAvatar(true);
      try {
        const res = await api.generateAvatar({
          personaId: currentPersona.id,
          imageBase64: dataUrl,
          mimeType: file.type,
          variationIndex: 1
        });
        if (res.avatarUrl) {
          setAvatar(res.avatarUrl);
        }
      } catch (err: any) {
        setAvatarError(err?.message || 'Avatar generation failed, using uploaded photo instead.');
      } finally {
        setIsGeneratingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddProduct = () => {
    setProducts(prev => [...prev, { title: '', description: '' }]);
  };

  const handleRemoveProduct = (index: number) => {
    setProducts(prev => prev.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, field: 'title' | 'description', value: string) => {
    setProducts(prev => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const handleGenerateAgent = async () => {
    if (!brief.trim()) return;
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const res = await api.generatePresence({
        name,
        role: position,
        company,
        objective: currentPersona.objective,
        rawDescription: brief
      });

      const updated: UserProfile = {
        ...currentPersona,
        name,
        role: position,
        company,
        avatar,
        rawDescription: brief,
        contactInfo: { ...currentPersona.contactInfo, email, phone, linkedin },
        agentSpec: {
          ...res.agentSpec,
          products: products.filter(p => p.title.trim()).map((p, i) => ({
            id: currentPersona.agentSpec.products[i]?.id || `product-${i}-${Date.now()}`,
            title: p.title,
            description: p.description,
            suggestedQuestions: currentPersona.agentSpec.products[i]?.suggestedQuestions || []
          }))
        }
      };
      setPendingProfile(updated);
      setLookingFor(deriveLookingFor(currentPersona.objective));
    } catch (err: any) {
      console.error('Failed to generate agent:', err);
      setGenerateError(err?.message || 'Failed to generate your avatar with Gemini. Please retry.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleActivate = async () => {
    if (!pendingProfile) return;
    setIsActivating(true);
    try {
      onProfileUpdated(pendingProfile);
      await api.saveProfile(pendingProfile);
      onComplete();
    } catch (err: any) {
      console.error('Failed to activate avatar:', err);
      setGenerateError(err?.message || 'Failed to activate your avatar. Please retry.');
    } finally {
      setIsActivating(false);
    }
  };

  const updatePendingPitch = (value: string) => {
    setPendingProfile(prev => prev ? { ...prev, agentSpec: { ...prev.agentSpec, oneLinePitch: value } } : prev);
  };

  const updatePendingApprovedTopics = (topics: string[]) => {
    setPendingProfile(prev => prev ? { ...prev, agentSpec: { ...prev.agentSpec, approvedTopics: topics } } : prev);
  };

  const updatePendingDisallowedTopics = (topics: string[]) => {
    setPendingProfile(prev => prev ? { ...prev, agentSpec: { ...prev.agentSpec, disallowedTopics: topics } } : prev);
  };

  const stepTitles = ['About you', 'Your products', 'Brief your avatar'];
  const stepSubtitles = [
    'Imported from your account. Edit anything.',
    "Your avatar uses these to explain what you offer. Add as many as you like.",
    'Describe your company and who you want to meet. Your avatar only shares what you approve.'
  ];

  return (
    <div className="fixed inset-0 z-[65] bg-[#F6F6F3] overflow-y-auto">
      <div className="max-w-[430px] mx-auto w-full px-6 pt-5 pb-8">
        {/* Header: back + progress bar */}
        <div className="flex items-center gap-3 mb-6 shrink-0">
          <button
            type="button"
            onClick={() => (step === 1 ? onComplete() : setStep((s) => (s - 1) as 1 | 2))}
            className="w-9 h-9 rounded-full bg-white border border-[#D8D8D3] flex items-center justify-center shadow-xs shrink-0 cursor-pointer"
          >
            <ChevronLeft className="w-4.5 h-4.5 text-[#16171A]" />
          </button>
          <div className="flex-1 flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-[#5558E8]' : 'bg-[#E2E2DC]'}`}
              />
            ))}
          </div>
        </div>

        <div className="text-[11px] font-semibold text-[#5558E8] uppercase tracking-wider mb-1">
          Step {step} of 3
        </div>
        <h1 className="text-[28px] font-semibold tracking-tight text-[#16171A] mb-1.5">
          {stepTitles[step - 1]}
        </h1>
        <p className="text-sm text-[#5A5C63] mb-6">{stepSubtitles[step - 1]}</p>

        {/* Step 1: About you */}
        {step === 1 && (
          <div className="space-y-5 flex-1">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-[#5558E8] flex items-center justify-center text-white font-semibold text-lg">
                  {avatar ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" /> : name.slice(0, 2).toUpperCase()}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-[#16171A] border-2 border-[#F6F6F3] flex items-center justify-center cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-white" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelected} />
              </div>
              <div className="flex-1 pt-1 space-y-2">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-semibold text-[#5558E8] block cursor-pointer">
                  Add profile photo
                </button>
                <p className="text-xs text-[#5A5C63]">Shown on the radar and your cards</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isGeneratingAvatar}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EEF0FD] text-[#5558E8] text-xs font-semibold cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isGeneratingAvatar ? 'Creating...' : 'Create digital twin avatar'}
                </button>
                {avatarError && <p className="text-[11px] text-rose-600">{avatarError}</p>}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-[#8E9097] uppercase tracking-wider mb-2">Profile</div>
              <div className="bg-white rounded-2xl border border-[#D8D8D3] divide-y divide-[#E2E2DC] overflow-hidden">
                {[
                  { label: 'Full name', value: name, setter: setName },
                  { label: 'Position', value: position, setter: setPosition },
                  { label: 'Company', value: company, setter: setCompany },
                  { label: 'Company website', value: companyWebsite, setter: setCompanyWebsite }
                ].map((field) => (
                  <div key={field.label} className="px-4 py-2.5">
                    <label className="text-[11px] text-[#8E9097] block mb-0.5">{field.label}</label>
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                      className="w-full text-sm text-[#16171A] bg-transparent outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-[#8E9097] uppercase tracking-wider">Contact</span>
                <span className="text-[11px] text-[#5558E8] font-medium">Private until you approve an intro</span>
              </div>
              <div className="bg-white rounded-2xl border border-[#D8D8D3] divide-y divide-[#E2E2DC] overflow-hidden">
                <div className="px-4 py-2.5 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <label className="text-[11px] text-[#8E9097] block mb-0.5">Email</label>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailVerified(false); }}
                      className="w-full text-sm text-[#16171A] bg-transparent outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmailVerified(true)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer flex items-center gap-1 ${
                      emailVerified ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#EEF0FD] text-[#5558E8]'
                    }`}
                  >
                    {emailVerified && <CheckCircle2 className="w-3 h-3" />}
                    {emailVerified ? 'Verified' : 'Verify'}
                  </button>
                </div>
                <div className="px-4 py-2.5 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <label className="text-[11px] text-[#8E9097] block mb-0.5">Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setPhoneVerified(false); }}
                      className="w-full text-sm text-[#16171A] bg-transparent outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setPhoneVerified(true)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer flex items-center gap-1 ${
                      phoneVerified ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#EEF0FD] text-[#5558E8]'
                    }`}
                  >
                    {phoneVerified && <CheckCircle2 className="w-3 h-3" />}
                    {phoneVerified ? 'Verified' : 'Verify'}
                  </button>
                </div>
                <div className="px-4 py-2.5">
                  <label className="text-[11px] text-[#8E9097] block mb-0.5">LinkedIn</label>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="linkedin.com/in/yourname"
                    className="w-full text-sm text-[#16171A] bg-transparent outline-none placeholder:text-[#C7C7C1]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Products */}
        {step === 2 && (
          <div className="space-y-3 flex-1">
            {products.map((p, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#D8D8D3] overflow-hidden">
                <div className="px-4 py-2.5 flex items-center justify-between border-b border-[#E2E2DC]">
                  <span className="text-[11px] font-semibold text-[#8E9097] uppercase tracking-wider">Product {i + 1}</span>
                  {products.length > 1 && (
                    <button type="button" onClick={() => handleRemoveProduct(i)} className="text-xs text-rose-600 font-medium cursor-pointer">
                      Remove
                    </button>
                  )}
                </div>
                <div className="px-4 py-2.5 border-b border-[#E2E2DC]">
                  <label className="text-[11px] text-[#8E9097] block mb-0.5">Name</label>
                  <input
                    type="text"
                    value={p.title}
                    onChange={(e) => handleProductChange(i, 'title', e.target.value)}
                    className="w-full text-sm font-semibold text-[#16171A] bg-transparent outline-none"
                  />
                </div>
                <div className="px-4 py-2.5">
                  <label className="text-[11px] text-[#8E9097] block mb-0.5">Description</label>
                  <textarea
                    value={p.description}
                    onChange={(e) => handleProductChange(i, 'description', e.target.value)}
                    rows={3}
                    className="w-full text-sm text-[#16171A] bg-transparent outline-none resize-none"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddProduct}
              className="btn-secondary-pill w-full h-11 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Add another product
            </button>
          </div>
        )}

        {/* Step 3: Brief your avatar */}
        {step === 3 && (
          <div className="space-y-4 flex-1">
            {generateError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-xs text-rose-900">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{generateError}</span>
              </div>
            )}
            <div className="bg-white rounded-2xl border border-[#D8D8D3] p-4">
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                rows={8}
                placeholder="I'm Tom Reyes, founder of Forthcode. We use AI to..."
                className="w-full text-sm text-[#16171A] bg-transparent outline-none resize-none leading-relaxed"
              />
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#E2E2DC]">
                <span className="text-xs text-[#8E9097]">Any language</span>
                <button
                  type="button"
                  onClick={handleGenerateAgent}
                  disabled={isGenerating || !brief.trim()}
                  className="px-4 py-2 rounded-full bg-[#EEF0FD] text-[#5558E8] text-sm font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate avatar'
                  )}
                </button>
              </div>
            </div>

            {pendingProfile && (
              <div className="bg-white rounded-2xl border border-[#D8D8D3] p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#8E9097] uppercase tracking-wider">Avatar specification</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5558E8]">
                    <Pencil className="w-3 h-3" /> Tap any field to edit
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-[#5A5C63]">Pitch</label>
                  <textarea
                    value={pendingProfile.agentSpec.oneLinePitch}
                    onChange={(e) => updatePendingPitch(e.target.value)}
                    rows={3}
                    className="w-full text-sm text-[#16171A] bg-[#F6F6F3] rounded-xl p-2.5 outline-none resize-none leading-relaxed border border-[#E2E2DC] focus:border-[#5558E8]"
                  />
                </div>

                <EditableTagGroup label="Looking for" tags={lookingFor} onChange={setLookingFor} />

                {pendingProfile.agentSpec.products.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-[#5A5C63]">Product cards</label>
                    <div className="space-y-2">
                      {pendingProfile.agentSpec.products.map((p, idx) => (
                        <div key={idx} className="p-3 bg-[#F6F6F3] rounded-xl border border-[#E2E2DC]">
                          <div className="font-semibold text-sm text-[#16171A]">{p.title}</div>
                          <div className="text-xs text-[#5A5C63] mt-0.5 leading-relaxed">{p.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <EditableTagGroup
                  label="Can discuss"
                  tags={pendingProfile.agentSpec.approvedTopics}
                  onChange={updatePendingApprovedTopics}
                />

                <EditableTagGroup
                  label="Off-limits"
                  tags={pendingProfile.agentSpec.disallowedTopics}
                  onChange={updatePendingDisallowedTopics}
                  tone="danger"
                />
              </div>
            )}
          </div>
        )}

        {/* Continue button for steps 1-2 */}
        {step < 3 && (
          <button
            type="button"
            onClick={() => setStep((s) => (s + 1) as 2 | 3)}
            className="btn-primary-pill w-full h-13 text-base shadow-sm mt-6 shrink-0"
          >
            Continue
          </button>
        )}

        {/* Activate button once the avatar has been generated */}
        {step === 3 && pendingProfile && (
          <button
            type="button"
            onClick={handleActivate}
            disabled={isActivating}
            className="btn-primary-pill w-full h-13 text-base shadow-sm mt-6 shrink-0 disabled:opacity-60"
          >
            {isActivating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                Activating...
              </>
            ) : (
              'Activate my avatar'
            )}
          </button>
        )}
      </div>
    </div>
  );
};
