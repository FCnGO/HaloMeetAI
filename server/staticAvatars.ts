/**
 * HoloMeet Brand Static Avatar Pool (Option 2: Generative Vector SVG Portraits)
 * 
 * Crafted specifically for HoloMeet brand presence:
 * - Professional shoulder-up portrait
 * - Business-casual executive attire
 * - Soft electric-blue (#0066FF) rim light along edge of head and shoulder
 * - Subtle cyan (#00E5FF) ambient glow in dark (#0B0B0E to #16171C) background evoking digital presence
 * - Square 1:1 aspect ratio (512x512)
 * - Diverse pool (varied in gender, ethnicity, hairstyle, and attire)
 */

export interface StaticAvatarDefinition {
  id: string;
  name: string;
  demographic: string;
  svgDataUri: string;
}

// 1. Female Executive / Founder (Warm South Asian tone, sleek dark hair, navy executive blazer, electric-blue rim light)
const avatar1Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bg1" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#16171C"/>
      <stop offset="60%" stop-color="#0E0F13"/>
      <stop offset="100%" stop-color="#08080A"/>
    </radialGradient>
    <radialGradient id="cyanGlow1" cx="28%" cy="32%" r="48%">
      <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.38"/>
      <stop offset="50%" stop-color="#0066FF" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#0B0B0E" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="rimLight1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.95"/>
      <stop offset="30%" stop-color="#0066FF" stop-opacity="0.85"/>
      <stop offset="70%" stop-color="#0066FF" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="skin1" x1="30%" y1="20%" x2="70%" y2="80%">
      <stop offset="0%" stop-color="#B87B56"/>
      <stop offset="60%" stop-color="#9C5E3B"/>
      <stop offset="100%" stop-color="#7B4527"/>
    </linearGradient>
    <linearGradient id="blazer1" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="60%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#080D1A"/>
    </linearGradient>
    <filter id="glowBlur1" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Dark Background -->
  <rect width="512" height="512" fill="url(#bg1)"/>
  
  <!-- Subtle Matrix grid lines for digital presence -->
  <g stroke="#00E5FF" stroke-opacity="0.04" stroke-width="1">
    <line x1="64" y1="0" x2="64" y2="512"/>
    <line x1="128" y1="0" x2="128" y2="512"/>
    <line x1="384" y1="0" x2="384" y2="512"/>
    <line x1="448" y1="0" x2="448" y2="512"/>
    <line x1="0" y1="128" x2="512" y2="128"/>
    <line x1="0" y1="384" x2="512" y2="384"/>
  </g>

  <!-- Ambient Cyan Presence Aura -->
  <circle cx="160" cy="180" r="190" fill="url(#cyanGlow1)"/>

  <!-- Halo Ring Accent -->
  <circle cx="256" cy="220" r="210" fill="none" stroke="#0066FF" stroke-width="1.5" stroke-opacity="0.25" stroke-dasharray="8 6"/>

  <!-- Shoulders & Business-Casual Blazer -->
  <path d="M96 512 C108 430 148 375 210 360 L256 425 L302 360 C364 375 404 430 416 512 Z" fill="url(#blazer1)"/>
  <!-- Lapel Left -->
  <path d="M190 365 L240 460 L256 425 L210 360 Z" fill="#24334A"/>
  <!-- Lapel Right -->
  <path d="M322 365 L272 460 L256 425 L302 360 Z" fill="#1A2536"/>
  <!-- Inner Silk Shell Top -->
  <path d="M228 370 L256 420 L284 370 Z" fill="#00E5FF" fill-opacity="0.18"/>
  <path d="M232 375 L256 415 L280 375 Z" fill="#38BDF8" fill-opacity="0.3"/>

  <!-- Neck -->
  <path d="M228 300 C228 350 284 350 284 300 L284 260 L228 260 Z" fill="#8C4E2D"/>
  <path d="M228 300 C242 320 270 320 284 300 L284 330 L228 330 Z" fill="#753F22" opacity="0.6"/>

  <!-- Head / Face Silhouette -->
  <path d="M256 120 C195 120 186 170 186 225 C186 280 216 320 256 320 C296 320 326 280 326 225 C326 170 317 120 256 120 Z" fill="url(#skin1)"/>

  <!-- Ears -->
  <path d="M184 210 C175 210 174 238 186 244 Z" fill="#9C5E3B"/>
  <path d="M328 210 C337 210 338 238 326 244 Z" fill="#8C4E2D"/>

  <!-- Sleek Hair Structure -->
  <path d="M180 210 C175 140 210 95 256 95 C302 95 337 140 332 210 C322 170 300 135 256 135 C212 135 190 170 180 210 Z" fill="#141419"/>
  <!-- Long Hair Behind Shoulders -->
  <path d="M178 200 C165 240 160 300 172 360 C182 340 188 300 188 250 Z" fill="#0D0E12"/>
  <path d="M334 200 C347 240 352 300 340 360 C330 340 324 300 324 250 Z" fill="#0D0E12"/>

  <!-- Facial Features (Stylized, Photorealistic Contours) -->
  <!-- Eyebrows -->
  <path d="M214 195 Q228 190 242 194" stroke="#1A1A22" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M270 194 Q284 190 298 195" stroke="#1A1A22" stroke-width="3" stroke-linecap="round" fill="none"/>
  <!-- Eyes -->
  <ellipse cx="228" cy="206" rx="9" ry="5" fill="#141419"/>
  <circle cx="229" cy="205" r="2.5" fill="#38BDF8" opacity="0.8"/>
  <ellipse cx="284" cy="206" rx="9" ry="5" fill="#141419"/>
  <circle cx="285" cy="205" r="2.5" fill="#38BDF8" opacity="0.8"/>
  <!-- Nose bridge & shadow -->
  <path d="M256 200 L254 235 L262 238" stroke="#753F22" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  <!-- Lips -->
  <path d="M242 265 Q256 272 270 265" stroke="#A84D43" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <path d="M245 265 Q256 260 267 265" stroke="#8A3830" stroke-width="2" fill="none"/>

  <!-- Left Side: Soft Electric-Blue (#0066FF) Rim Light Glow (Signature HoloMeet Presence) -->
  <path d="M172 360 C165 300 165 240 178 190 C182 145 210 100 256 95" fill="none" stroke="url(#rimLight1)" stroke-width="7" filter="url(#glowBlur1)"/>
  <path d="M96 512 C108 430 148 375 210 360" fill="none" stroke="#00E5FF" stroke-width="6" opacity="0.9" filter="url(#glowBlur1)"/>
  <path d="M186 210 C184 250 200 295 230 318" fill="none" stroke="#0066FF" stroke-width="3" opacity="0.75"/>

  <!-- Digital Presence Node Indicator -->
  <circle cx="112" cy="410" r="3" fill="#00E5FF"/>
  <circle cx="112" cy="410" r="7" fill="none" stroke="#00E5FF" stroke-width="1" opacity="0.6"/>
</svg>`;

// 2. Male Tech Executive (East Asian, sharp dark styling, charcoal executive blazer, cyan aura)
const avatar2Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bg2" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#16171C"/>
      <stop offset="65%" stop-color="#0E0F14"/>
      <stop offset="100%" stop-color="#070709"/>
    </radialGradient>
    <radialGradient id="cyanGlow2" cx="72%" cy="30%" r="48%">
      <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.38"/>
      <stop offset="50%" stop-color="#0066FF" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#0B0B0E" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="rimLight2" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.95"/>
      <stop offset="35%" stop-color="#0066FF" stop-opacity="0.85"/>
      <stop offset="70%" stop-color="#0066FF" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="skin2" x1="30%" y1="20%" x2="70%" y2="80%">
      <stop offset="0%" stop-color="#F2CBA7"/>
      <stop offset="60%" stop-color="#DFAC82"/>
      <stop offset="100%" stop-color="#BF8B62"/>
    </linearGradient>
    <linearGradient id="suit2" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#1E222D"/>
      <stop offset="60%" stop-color="#12141C"/>
      <stop offset="100%" stop-color="#090A0F"/>
    </linearGradient>
    <filter id="glowBlur2" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <rect width="512" height="512" fill="url(#bg2)"/>
  
  <g stroke="#0066FF" stroke-opacity="0.05" stroke-width="1">
    <circle cx="256" cy="256" r="160"/>
    <circle cx="256" cy="256" r="230"/>
    <line x1="256" y1="0" x2="256" y2="512"/>
  </g>

  <!-- Cyan Presence Glow (Right Side) -->
  <circle cx="360" cy="180" r="190" fill="url(#cyanGlow2)"/>

  <!-- Shoulders & Tailored Suit -->
  <path d="M86 512 C100 420 144 365 210 350 L256 425 L302 350 C368 365 412 420 426 512 Z" fill="url(#suit2)"/>
  <!-- Lapel Left -->
  <path d="M190 355 L242 455 L256 425 L210 350 Z" fill="#252A38"/>
  <!-- Lapel Right -->
  <path d="M322 355 L270 455 L256 425 L302 350 Z" fill="#181B24"/>
  <!-- Crisp Oxford Shirt Collar -->
  <path d="M228 355 L256 410 L284 355 L270 335 L256 345 L242 335 Z" fill="#F8FAFC"/>
  <!-- Dark Executive Tie -->
  <path d="M250 355 L262 355 L266 450 L256 465 L246 450 Z" fill="#0066FF" fill-opacity="0.85"/>

  <!-- Neck -->
  <path d="M224 290 C224 345 288 345 288 290 L288 250 L224 250 Z" fill="#C9946B"/>

  <!-- Head / Angular Jawline -->
  <path d="M256 120 C200 120 192 165 192 220 C192 275 220 315 256 315 C292 315 320 275 320 220 C320 165 312 120 256 120 Z" fill="url(#skin2)"/>

  <!-- Ears -->
  <path d="M190 205 C180 205 180 232 192 238 Z" fill="#C9946B"/>
  <path d="M320 205 C332 205 332 232 320 238 Z" fill="#B5815A"/>

  <!-- Modern Styled Hair -->
  <path d="M186 175 C180 130 205 90 256 86 C298 84 326 115 324 165 C316 140 292 118 256 118 C220 118 196 145 186 175 Z" fill="#14151B"/>
  <path d="M220 95 C250 82 285 86 315 106 C300 95 270 90 240 92 Z" fill="#232632"/>

  <!-- Executive Eyewear (Modern Thin Frames) -->
  <rect x="206" y="194" width="38" height="22" rx="4" fill="none" stroke="#00E5FF" stroke-width="2" stroke-opacity="0.85"/>
  <rect x="268" y="194" width="38" height="22" rx="4" fill="none" stroke="#00E5FF" stroke-width="2" stroke-opacity="0.85"/>
  <line x1="244" y1="204" x2="268" y2="204" stroke="#00E5FF" stroke-width="2" stroke-opacity="0.85"/>

  <!-- Eyes behind lenses -->
  <circle cx="225" cy="205" r="4.5" fill="#181920"/>
  <circle cx="287" cy="205" r="4.5" fill="#181920"/>
  <!-- Eyebrows -->
  <path d="M208 186 L242 188" stroke="#121318" stroke-width="3" stroke-linecap="round"/>
  <path d="M270 188 L304 186" stroke="#121318" stroke-width="3" stroke-linecap="round"/>

  <!-- Nose & Smile -->
  <path d="M256 204 L253 234 L261 236" stroke="#AA7752" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  <path d="M242 262 Q256 270 270 262" stroke="#946342" stroke-width="3" stroke-linecap="round" fill="none"/>

  <!-- Right Side: Electric-Blue (#0066FF) Rim Light Glow -->
  <path d="M256 86 C298 84 326 115 324 165 C328 200 322 250 300 300" fill="none" stroke="url(#rimLight2)" stroke-width="7" filter="url(#glowBlur2)"/>
  <path d="M426 512 C412 420 368 365 302 350" fill="none" stroke="#0066FF" stroke-width="6" opacity="0.9" filter="url(#glowBlur2)"/>

  <!-- Presence accent -->
  <circle cx="400" cy="405" r="3" fill="#0066FF"/>
</svg>`;

// 3. Male Aerospace / Venture Partner (Black executive, deep rich tone, clean beard, slate attire)
const avatar3Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bg3" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#16171C"/>
      <stop offset="60%" stop-color="#0F1015"/>
      <stop offset="100%" stop-color="#08080B"/>
    </radialGradient>
    <radialGradient id="cyanGlow3" cx="30%" cy="30%" r="50%">
      <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.36"/>
      <stop offset="50%" stop-color="#0066FF" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#0B0B0E" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="rimLight3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.95"/>
      <stop offset="30%" stop-color="#0066FF" stop-opacity="0.85"/>
      <stop offset="70%" stop-color="#0066FF" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="skin3" x1="30%" y1="20%" x2="70%" y2="80%">
      <stop offset="0%" stop-color="#734B30"/>
      <stop offset="60%" stop-color="#54331C"/>
      <stop offset="100%" stop-color="#3D2210"/>
    </linearGradient>
    <linearGradient id="suit3" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#1E2430"/>
      <stop offset="60%" stop-color="#131722"/>
      <stop offset="100%" stop-color="#0A0D14"/>
    </linearGradient>
    <filter id="glowBlur3" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <rect width="512" height="512" fill="url(#bg3)"/>

  <!-- Digital Radar grid accent -->
  <g stroke="#00E5FF" stroke-opacity="0.06" stroke-width="1.5">
    <ellipse cx="256" cy="380" rx="220" ry="110" fill="none"/>
    <ellipse cx="256" cy="380" rx="140" ry="70" fill="none"/>
  </g>

  <!-- Cyan Presence Glow -->
  <circle cx="160" cy="180" r="190" fill="url(#cyanGlow3)"/>

  <!-- Shoulders & Slate Executive Blazer -->
  <path d="M80 512 C96 415 142 360 210 345 L256 420 L302 345 C370 360 416 415 432 512 Z" fill="url(#suit3)"/>
  <!-- Lapels -->
  <path d="M190 350 L244 450 L256 420 L210 345 Z" fill="#252D3D"/>
  <path d="M322 350 L268 450 L256 420 L302 345 Z" fill="#181D29"/>
  <!-- Dark Charcoal Mockneck Base -->
  <path d="M224 320 C224 350 288 350 288 320 L288 360 L224 360 Z" fill="#101218"/>

  <!-- Neck -->
  <path d="M222 280 C222 335 290 335 290 280 L290 240 L222 240 Z" fill="#4B2C16"/>

  <!-- Head / Stately Contour -->
  <path d="M256 115 C198 115 190 162 190 220 C190 275 220 315 256 315 C292 315 322 275 322 220 C322 162 314 115 256 115 Z" fill="url(#skin3)"/>

  <!-- Clean Fade Hairstyle -->
  <path d="M188 185 C184 135 208 95 256 95 C304 95 328 135 324 185 C316 150 292 125 256 125 C220 125 196 150 188 185 Z" fill="#121215"/>

  <!-- Ears -->
  <path d="M188 205 C176 205 176 235 188 240 Z" fill="#4B2C16"/>
  <path d="M324 205 C336 205 336 235 324 240 Z" fill="#3D2210"/>

  <!-- Trimmed Executive Beard -->
  <path d="M204 235 C204 290 224 316 256 316 C288 316 308 290 308 235 C295 255 280 268 256 268 C232 268 217 255 204 235 Z" fill="#121216"/>

  <!-- Eyes & Eyebrows -->
  <path d="M210 185 Q226 180 242 184" stroke="#0F0F13" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <path d="M270 184 Q286 180 302 185" stroke="#0F0F13" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <circle cx="228" cy="198" r="5" fill="#101115"/>
  <circle cx="229" cy="197" r="1.5" fill="#38BDF8" opacity="0.9"/>
  <circle cx="284" cy="198" r="5" fill="#101115"/>
  <circle cx="285" cy="197" r="1.5" fill="#38BDF8" opacity="0.9"/>

  <!-- Nose & Confident Expression -->
  <path d="M256 195 L252 228 L264 230" stroke="#381E0C" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M242 254 Q256 260 270 254" stroke="#2B160A" stroke-width="3" stroke-linecap="round" fill="none"/>

  <!-- Left Side: Soft Electric-Blue (#0066FF) Rim Light Glow -->
  <path d="M188 185 C184 135 208 95 256 95" fill="none" stroke="url(#rimLight3)" stroke-width="8" filter="url(#glowBlur3)"/>
  <path d="M80 512 C96 415 142 360 210 345" fill="none" stroke="#00E5FF" stroke-width="6" opacity="0.95" filter="url(#glowBlur3)"/>
  <path d="M190 220 C190 275 220 315 256 315" fill="none" stroke="#0066FF" stroke-width="3" opacity="0.6"/>
</svg>`;

// 4. Female VP / Systems Director (Mediterranean / Latina tone, rich wavy hair, deep teal blazer)
const avatar4Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bg4" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#16171C"/>
      <stop offset="60%" stop-color="#0E0F14"/>
      <stop offset="100%" stop-color="#070709"/>
    </radialGradient>
    <radialGradient id="cyanGlow4" cx="70%" cy="32%" r="48%">
      <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.38"/>
      <stop offset="50%" stop-color="#0066FF" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#0B0B0E" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="rimLight4" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.95"/>
      <stop offset="30%" stop-color="#0066FF" stop-opacity="0.85"/>
      <stop offset="70%" stop-color="#0066FF" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="skin4" x1="30%" y1="20%" x2="70%" y2="80%">
      <stop offset="0%" stop-color="#E2A782"/>
      <stop offset="60%" stop-color="#C5855F"/>
      <stop offset="100%" stop-color="#A26642"/>
    </linearGradient>
    <linearGradient id="blazer4" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#132B38"/>
      <stop offset="60%" stop-color="#0B1C26"/>
      <stop offset="100%" stop-color="#060F14"/>
    </linearGradient>
    <filter id="glowBlur4" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <rect width="512" height="512" fill="url(#bg4)"/>
  
  <!-- Subtle circular presence halo -->
  <circle cx="256" cy="220" r="195" fill="none" stroke="#0066FF" stroke-width="1.5" stroke-opacity="0.25"/>

  <!-- Cyan Presence Glow (Right Side) -->
  <circle cx="355" cy="175" r="190" fill="url(#cyanGlow4)"/>

  <!-- Shoulders & Dark Teal Executive Jacket -->
  <path d="M92 512 C106 425 150 370 210 355 L256 422 L302 355 C362 370 406 425 420 512 Z" fill="url(#blazer4)"/>
  <!-- Lapels -->
  <path d="M192 360 L242 455 L256 422 L210 355 Z" fill="#1C3D4F"/>
  <path d="M320 360 L270 455 L256 422 L302 355 Z" fill="#102530"/>
  <!-- Inner V-Neck Silk Camisole -->
  <path d="M230 362 L256 415 L282 362 Z" fill="#00E5FF" fill-opacity="0.22"/>

  <!-- Neck -->
  <path d="M228 295 C228 345 284 345 284 295 L284 255 L228 255 Z" fill="#B07450"/>

  <!-- Face Contour -->
  <path d="M256 122 C196 122 188 170 188 224 C188 278 218 318 256 318 C294 318 324 278 324 224 C324 170 316 122 256 122 Z" fill="url(#skin4)"/>

  <!-- Ears -->
  <path d="M186 210 C176 210 176 238 188 242 Z" fill="#B07450"/>
  <path d="M324 210 C336 210 336 238 324 242 Z" fill="#995D3B"/>

  <!-- Rich Textured Wavy Hair -->
  <path d="M182 210 C170 145 204 94 256 94 C308 94 342 145 330 210 C318 165 294 135 256 135 C218 135 194 165 182 210 Z" fill="#1C1514"/>
  <path d="M172 210 C155 260 152 320 166 380 C180 345 188 300 186 250 Z" fill="#140E0D"/>
  <path d="M340 210 C357 260 360 320 346 380 C332 345 324 300 326 250 Z" fill="#140E0D"/>

  <!-- Eyebrows & Eyes -->
  <path d="M214 194 Q228 188 242 192" stroke="#1A1211" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M270 192 Q284 188 298 194" stroke="#1A1211" stroke-width="3" stroke-linecap="round" fill="none"/>
  <ellipse cx="228" cy="204" rx="8" ry="5" fill="#181312"/>
  <circle cx="229" cy="203" r="2" fill="#00E5FF" opacity="0.85"/>
  <ellipse cx="284" cy="204" rx="8" ry="5" fill="#181312"/>
  <circle cx="285" cy="203" r="2" fill="#00E5FF" opacity="0.85"/>

  <!-- Nose & Smile -->
  <path d="M256 198 L254 234 L262 236" stroke="#995D3B" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  <path d="M242 264 Q256 272 270 264" stroke="#B85955" stroke-width="3.5" stroke-linecap="round" fill="none"/>

  <!-- Right Side: Electric-Blue (#0066FF) Rim Light Glow -->
  <path d="M256 94 C308 94 342 145 330 210 C336 260 348 310 346 380" fill="none" stroke="url(#rimLight4)" stroke-width="8" filter="url(#glowBlur4)"/>
  <path d="M420 512 C406 425 362 370 302 355" fill="none" stroke="#00E5FF" stroke-width="6" opacity="0.9" filter="url(#glowBlur4)"/>
</svg>`;

// 5. Male Airline Systems / Operations Lead (Short textured hair, midnight navy sweater & collar)
const avatar5Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bg5" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#16171C"/>
      <stop offset="65%" stop-color="#0E1015"/>
      <stop offset="100%" stop-color="#07080B"/>
    </radialGradient>
    <radialGradient id="cyanGlow5" cx="28%" cy="30%" r="48%">
      <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.38"/>
      <stop offset="50%" stop-color="#0066FF" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#0B0B0E" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="rimLight5" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.95"/>
      <stop offset="35%" stop-color="#0066FF" stop-opacity="0.85"/>
      <stop offset="70%" stop-color="#0066FF" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="skin5" x1="30%" y1="20%" x2="70%" y2="80%">
      <stop offset="0%" stop-color="#ECC4A0"/>
      <stop offset="60%" stop-color="#D3A27D"/>
      <stop offset="100%" stop-color="#B2825F"/>
    </linearGradient>
    <linearGradient id="sweater5" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#1A2536"/>
      <stop offset="60%" stop-color="#101724"/>
      <stop offset="100%" stop-color="#080C14"/>
    </linearGradient>
    <filter id="glowBlur5" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <rect width="512" height="512" fill="url(#bg5)"/>

  <!-- Concentric Orbit Ring -->
  <circle cx="256" cy="230" r="215" fill="none" stroke="#00E5FF" stroke-width="1.2" stroke-opacity="0.2" stroke-dasharray="12 8"/>

  <!-- Cyan Presence Glow -->
  <circle cx="155" cy="175" r="190" fill="url(#cyanGlow5)"/>

  <!-- Shoulders & Midnight Merino Sweater with White Collar -->
  <path d="M88 512 C102 422 146 368 212 352 L256 420 L300 352 C366 368 410 422 424 512 Z" fill="url(#sweater5)"/>
  <!-- Crisp White Shirt Collar -->
  <path d="M228 352 L256 395 L284 352 L268 335 L256 345 L244 335 Z" fill="#F1F5F9"/>

  <!-- Neck -->
  <path d="M226 288 C226 342 286 342 286 288 L286 248 L226 248 Z" fill="#BF8D68"/>

  <!-- Head Contour -->
  <path d="M256 118 C200 118 192 165 192 222 C192 276 220 316 256 316 C292 316 320 276 320 222 C320 165 312 118 256 118 Z" fill="url(#skin5)"/>

  <!-- Textured Short Hair -->
  <path d="M190 175 C184 130 208 88 256 86 C304 88 328 130 322 175 C314 145 292 120 256 120 C220 120 198 145 190 175 Z" fill="#2E241E"/>
  <path d="M215 98 C240 85 272 85 298 98 C280 92 250 90 230 94 Z" fill="#3D3028"/>

  <!-- Ears -->
  <path d="M190 206 C178 206 178 234 190 240 Z" fill="#BF8D68"/>
  <path d="M320 206 C332 206 332 234 320 240 Z" fill="#A87754"/>

  <!-- Eyes & Eyebrows -->
  <path d="M212 188 L244 190" stroke="#241B16" stroke-width="3" stroke-linecap="round"/>
  <path d="M268 190 L300 188" stroke="#241B16" stroke-width="3" stroke-linecap="round"/>
  <circle cx="228" cy="204" r="4.5" fill="#1C1613"/>
  <circle cx="229" cy="203" r="1.5" fill="#00E5FF" opacity="0.8"/>
  <circle cx="284" cy="204" r="4.5" fill="#1C1613"/>
  <circle cx="285" cy="203" r="1.5" fill="#00E5FF" opacity="0.8"/>

  <!-- Nose & Expression -->
  <path d="M256 200 L253 232 L262 235" stroke="#9E6F4C" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  <path d="M244 262 Q256 268 268 262" stroke="#8C5E3D" stroke-width="3" stroke-linecap="round" fill="none"/>

  <!-- Left Side: Soft Electric-Blue (#0066FF) Rim Light Glow -->
  <path d="M190 175 C184 130 208 88 256 86" fill="none" stroke="url(#rimLight5)" stroke-width="8" filter="url(#glowBlur5)"/>
  <path d="M88 512 C102 422 146 368 212 352" fill="none" stroke="#00E5FF" stroke-width="6" opacity="0.9" filter="url(#glowBlur5)"/>
</svg>`;

// 6. Female AI Research Fellow / Product Lead (Braided updo, high collar business attire, electric-blue rim accent)
const avatar6Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bg6" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#16171C"/>
      <stop offset="60%" stop-color="#0E0F14"/>
      <stop offset="100%" stop-color="#08080B"/>
    </radialGradient>
    <radialGradient id="cyanGlow6" cx="72%" cy="32%" r="48%">
      <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.38"/>
      <stop offset="50%" stop-color="#0066FF" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#0B0B0E" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="rimLight6" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.95"/>
      <stop offset="35%" stop-color="#0066FF" stop-opacity="0.85"/>
      <stop offset="70%" stop-color="#0066FF" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="skin6" x1="30%" y1="20%" x2="70%" y2="80%">
      <stop offset="0%" stop-color="#8C5635"/>
      <stop offset="60%" stop-color="#6E3F22"/>
      <stop offset="100%" stop-color="#4F2B14"/>
    </linearGradient>
    <linearGradient id="blazer6" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#222032"/>
      <stop offset="60%" stop-color="#141320"/>
      <stop offset="100%" stop-color="#0A0912"/>
    </linearGradient>
    <filter id="glowBlur6" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <rect width="512" height="512" fill="url(#bg6)"/>

  <!-- Digital grid accent -->
  <g stroke="#0066FF" stroke-opacity="0.06" stroke-width="1">
    <circle cx="256" cy="220" r="180"/>
    <circle cx="256" cy="220" r="230"/>
  </g>

  <!-- Cyan Presence Glow -->
  <circle cx="360" cy="175" r="190" fill="url(#cyanGlow6)"/>

  <!-- Shoulders & High Collar Executive Jacket -->
  <path d="M92 512 C106 425 150 370 212 355 L256 422 L300 355 C362 370 406 425 420 512 Z" fill="url(#blazer6)"/>
  <!-- High Collar Trim -->
  <path d="M224 350 L256 390 L288 350 L274 325 L256 335 L238 325 Z" fill="#0066FF" fill-opacity="0.4"/>

  <!-- Neck -->
  <path d="M228 290 C228 340 284 340 284 290 L284 250 L228 250 Z" fill="#5F351B"/>

  <!-- Face Contour -->
  <path d="M256 120 C198 120 190 168 190 224 C190 276 218 316 256 316 C294 316 322 276 322 224 C322 168 314 120 256 120 Z" fill="url(#skin6)"/>

  <!-- Braided Crown Updo -->
  <path d="M188 180 C182 125 210 80 256 80 C302 80 330 125 324 180 C316 145 292 122 256 122 C220 122 196 145 188 180 Z" fill="#121014"/>
  <circle cx="256" cy="78" r="42" fill="#141217"/>
  <circle cx="256" cy="78" r="42" fill="none" stroke="#25202C" stroke-width="3" stroke-dasharray="6 4"/>

  <!-- Ears & Gold Earring Accent -->
  <path d="M188 208 C178 208 178 236 188 240 Z" fill="#5F351B"/>
  <path d="M322 208 C332 208 332 236 322 240 Z" fill="#4B2712"/>
  <circle cx="184" cy="242" r="3" fill="#00E5FF"/>
  <circle cx="326" cy="242" r="3" fill="#00E5FF"/>

  <!-- Eyes & Eyebrows -->
  <path d="M214 190 Q228 185 242 188" stroke="#100E12" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M270 188 Q284 185 298 190" stroke="#100E12" stroke-width="3" stroke-linecap="round" fill="none"/>
  <ellipse cx="228" cy="202" rx="8" ry="5" fill="#121014"/>
  <circle cx="229" cy="201" r="2" fill="#38BDF8" opacity="0.85"/>
  <ellipse cx="284" cy="202" rx="8" ry="5" fill="#121014"/>
  <circle cx="285" cy="201" r="2" fill="#38BDF8" opacity="0.85"/>

  <!-- Nose & Smile -->
  <path d="M256 198 L253 230 L262 233" stroke="#482510" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  <path d="M242 262 Q256 268 270 262" stroke="#8A4032" stroke-width="3" stroke-linecap="round" fill="none"/>

  <!-- Right Side: Electric-Blue (#0066FF) Rim Light Glow -->
  <path d="M256 80 C302 80 330 125 324 180 C328 220 326 270 300 316" fill="none" stroke="url(#rimLight6)" stroke-width="8" filter="url(#glowBlur6)"/>
  <path d="M420 512 C406 425 362 370 300 355" fill="none" stroke="#0066FF" stroke-width="6" opacity="0.9" filter="url(#glowBlur6)"/>
</svg>`;

export const STATIC_AVATAR_POOL: StaticAvatarDefinition[] = [
  {
    id: 'fallback-female-founder',
    name: 'Priya Shah / Female Executive Presence',
    demographic: 'Indian Tech Founder, Navy Executive Blazer, Electric-Blue Rim',
    svgDataUri: 'data:image/svg+xml;base64,' + Buffer.from(avatar1Svg).toString('base64')
  },
  {
    id: 'fallback-male-exec',
    name: 'Tom Reyes / Male Fintech Lead',
    demographic: 'East Asian Tech Executive, Modern Glasses, Charcoal Suit',
    svgDataUri: 'data:image/svg+xml;base64,' + Buffer.from(avatar2Svg).toString('base64')
  },
  {
    id: 'fallback-male-vc',
    name: 'Marcus Vance / Aerospace Partner',
    demographic: 'Black Venture Executive, Slate Suit, Electric-Blue Rim Light',
    svgDataUri: 'data:image/svg+xml;base64,' + Buffer.from(avatar3Svg).toString('base64')
  },
  {
    id: 'fallback-female-vp',
    name: 'Elena Rostova / Systems VP',
    demographic: 'Latina/Mediterranean VP, Dark Teal Blazer, Cyan Digital Aura',
    svgDataUri: 'data:image/svg+xml;base64,' + Buffer.from(avatar4Svg).toString('base64')
  },
  {
    id: 'fallback-male-ops',
    name: 'Liam Scott / Airline Operations Lead',
    demographic: 'Operations Director, Midnight Knit & Collar, Electric-Blue Rim',
    svgDataUri: 'data:image/svg+xml;base64,' + Buffer.from(avatar5Svg).toString('base64')
  },
  {
    id: 'fallback-female-ai',
    name: 'AI Research & Product Lead',
    demographic: 'Executive Research Fellow, High-Collar Attire, Cyan Presence',
    svgDataUri: 'data:image/svg+xml;base64,' + Buffer.from(avatar6Svg).toString('base64')
  }
];

/**
 * Select a static avatar from the polished generative vector pool.
 * Matches to persona identity when applicable, or cycles through pool on variation index.
 */
export function getStaticFallbackAvatar(params: {
  personaId: string;
  variationIndex?: number;
}): StaticAvatarDefinition {
  const varIdx = params.variationIndex || 1;

  // Match directly to known demo personas for maximum contextual fit on initial selection
  if (varIdx === 1) {
    if (params.personaId.includes('priya')) {
      return STATIC_AVATAR_POOL[0];
    }
    if (params.personaId.includes('tom')) {
      return STATIC_AVATAR_POOL[1];
    }
    if (params.personaId.includes('marcus')) {
      return STATIC_AVATAR_POOL[2];
    }
    if (params.personaId.includes('elena')) {
      return STATIC_AVATAR_POOL[3];
    }
    if (params.personaId.includes('liam')) {
      return STATIC_AVATAR_POOL[4];
    }
  }

  // When regenerating (varIdx > 1) or for custom personas, cycle through the diverse pool
  const offset = params.personaId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = (offset + (varIdx - 1)) % STATIC_AVATAR_POOL.length;
  return STATIC_AVATAR_POOL[index];
}
