\# Profitcast Signal Dashboard \- Design System Guide

A comprehensive design guide to replicate the dark, professional aesthetic of the Profitcast Signal Dashboard on Emergent.

\---

\#\# 🎨 Color Palette

\#\#\# Background Colors  
\`\`\`css  
\--app-bg: \#02040A          /\* Main app background \- Near black with blue tint \*/  
\--surface: \#09090B          /\* Card/surface backgrounds \*/  
\--surface-highlight: \#18181B /\* Elevated surfaces, inputs \*/  
\`\`\`

\#\#\# Brand Colors (Profitcast Teal/Mint)  
\`\`\`css  
\--brand-teal: \#00A1C7       /\* Primary brand color \- Cyan blue \*/  
\--brand-mint: \#00FFAA       /\* Accent color \- Bright mint green \*/  
\--brand-orange: \#FF6826     /\* Alert/warning accent \*/  
\`\`\`

\#\#\# Text Colors  
\`\`\`css  
\--text-primary: \#FAFAFA     /\* White text \*/  
\--text-secondary: \#A1A1AA   /\* Gray text (zinc-400) \*/  
\--text-muted: \#52525B       /\* Muted text (zinc-600) \*/  
\`\`\`

\#\#\# Status Colors  
\`\`\`css  
/\* Healthy/Success \*/  
\#00FFAA (--brand-mint)

/\* Warning \*/  
\#eab308 (yellow-500)

/\* Critical/Error \*/  
\#ef4444 (red-500)

/\* Info \*/  
\#00A1C7 (--brand-teal)  
\`\`\`

\#\#\# Platform Colors  
\`\`\`css  
/\* Meta \*/  
.meta-blue: \#1877F2

/\* Google \*/  
.google-blue: \#4285F4  
.google-red: \#EA4335  
.google-yellow: \#FBBC05  
.google-green: \#34A853  
\`\`\`

\---

\#\# 🔤 Typography

\#\#\# Font Families  
\`\`\`css  
/\* Primary (Body text) \*/  
font-family: 'Inter', \-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/\* Headings \*/  
font-family: 'Rubik', sans-serif;

/\* Monospace (Data/Numbers) \*/  
font-family: 'JetBrains Mono', monospace;  
\`\`\`

\#\#\# Google Fonts Import  
\`\`\`css  
@import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700\&family=Inter:wght@300;400;500;600;700\&family=JetBrains+Mono:wght@400;500;600\&display=swap');  
\`\`\`

\#\#\# Tailwind Config  
\`\`\`javascript  
fontFamily: {  
 'rubik': \['Rubik', 'sans-serif'\],  
 'inter': \['Inter', 'sans-serif'\],  
 'mono': \['JetBrains Mono', 'monospace'\],  
}  
\`\`\`

\#\#\# Font Weights Used  
\- Light: 300  
\- Regular: 400  
\- Medium: 500  
\- Semibold: 600  
\- Bold: 700

\---

\#\# 🎯 Tailwind Configuration

\#\#\# tailwind.config.js  
\`\`\`javascript  
/\*\* @type {import('tailwindcss').Config} \*/  
module.exports \= {  
 content: \[  
   "./src/\*\*/\*.{js,jsx,ts,tsx}",  
 \],  
 theme: {  
   extend: {  
     colors: {  
       'app-bg': '\#02040A',  
       'surface': '\#09090B',  
       'surface-highlight': '\#18181B',  
       'brand-teal': '\#00A1C7',  
       'brand-mint': '\#00FFAA',  
       'brand-orange': '\#FF6826',  
     },  
     fontFamily: {  
       'rubik': \['Rubik', 'sans-serif'\],  
       'inter': \['Inter', 'sans-serif'\],  
       'mono': \['JetBrains Mono', 'monospace'\],  
     },  
     animation: {  
       'slide-in': 'slideIn 0.3s ease-out',  
       'fade-in': 'fadeIn 0.3s ease-out',  
     },  
     keyframes: {  
       slideIn: {  
         '0%': { transform: 'translateX(100%)', opacity: '0' },  
         '100%': { transform: 'translateX(0)', opacity: '1' },  
       },  
       fadeIn: {  
         '0%': { opacity: '0' },  
         '100%': { opacity: '1' },  
       },  
     },  
   },  
 },  
 plugins: \[\],  
}  
\`\`\`

\---

\#\# 📦 Component Patterns

\#\#\# Cards  
\`\`\`jsx  
{/\* Standard Card \*/}  
\<div className="bg-\[\#09090B\] border border-white/10 rounded-2xl p-6"\>  
 {/\* content \*/}  
\</div\>

{/\* Card with hover effect \*/}  
\<div className="bg-\[\#09090B\] border border-white/10 rounded-2xl p-6  
               hover:border-white/20 hover:bg-white/\[0.02\]  
               transition-all duration-200"\>  
 {/\* content \*/}  
\</div\>

{/\* Glassmorphism Card \*/}  
\<div className="bg-\[\#09090B\]/95 backdrop-blur-2xl  
               border border-white/10 rounded-3xl shadow-2xl shadow-black/50"\>  
 {/\* content \*/}  
\</div\>  
\`\`\`

\#\#\# Buttons

\`\`\`jsx  
{/\* Primary Button (Gradient) \*/}  
\<button className="px-6 py-3 bg-gradient-to-r from-\[\#00A1C7\] to-\[\#00FFAA\]  
                  text-black font-bold rounded-xl hover:opacity-90  
                  transition-all duration-200  
                  shadow-\[0\_0\_30px\_rgba(0,161,199,0.4)\]"\>  
 Click Me  
\</button\>

{/\* Secondary Button (Outline) \*/}  
\<button className="px-4 py-2 bg-transparent border border-white/20  
                  text-white rounded-lg hover:bg-white/5 hover:border-white/30  
                  transition-all duration-200"\>  
 Secondary  
\</button\>

{/\* Icon Button \*/}  
\<button className="p-3 bg-white/5 rounded-xl border border-white/10  
                  hover:bg-white/10 hover:border-\[\#00A1C7\]/50  
                  transition-all duration-200"\>  
 \<svg className="w-5 h-5 text-zinc-400" /\>  
\</button\>  
\`\`\`

\#\#\# Inputs  
\`\`\`jsx  
{/\* Text Input \*/}  
\<input  
 type="text"  
 className="w-full px-4 py-3 bg-\[\#18181B\] border border-white/10  
            rounded-xl text-white placeholder-zinc-600  
            focus:border-\[\#00A1C7\] focus:ring-4 focus:ring-\[\#00A1C7\]/10  
            transition-all duration-200"  
 placeholder="Enter value..."  
/\>

{/\* Input with Icon \*/}  
\<div className="flex items-center bg-\[\#18181B\] border border-white/10 rounded-xl  
               focus-within:border-\[\#00A1C7\] focus-within:ring-4 focus-within:ring-\[\#00A1C7\]/10  
               transition-all duration-200"\>  
 \<div className="pl-4 text-zinc-500"\>  
   \<svg className="w-5 h-5" /\>  
 \</div\>  
 \<input  
   type="text"  
   className="flex-1 px-3 py-4 bg-transparent text-white outline-none placeholder-zinc-600"  
   placeholder="Search..."  
 /\>  
\</div\>  
\`\`\`

\#\#\# Badges  
\`\`\`jsx  
{/\* Health Badge \- Healthy \*/}  
\<span className="bg-\[\#00FFAA\]/15 text-\[\#00FFAA\] px-3 py-1 rounded-full  
                text-sm font-bold ring-1 ring-\[\#00FFAA\]/30  
                flex items-center gap-1.5"\>  
 \<span className="w-1.5 h-1.5 rounded-full bg-\[\#00FFAA\] animate-pulse"\>\</span\>  
 Healthy  
\</span\>

{/\* Health Badge \- Warning \*/}  
\<span className="bg-yellow-500/15 text-yellow-400 px-3 py-1 rounded-full  
                text-sm font-bold ring-1 ring-yellow-500/30"\>  
 Warning  
\</span\>

{/\* Health Badge \- Critical \*/}  
\<span className="bg-red-500/15 text-red-400 px-3 py-1 rounded-full  
                text-sm font-bold ring-1 ring-red-500/30"\>  
 Critical  
\</span\>

{/\* Objective Badge \*/}  
\<span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md  
                text-\[10px\] font-bold uppercase tracking-wider"\>  
 📝 Lead Form  
\</span\>  
\`\`\`

\#\#\# Toast Notifications  
\`\`\`jsx  
{/\* Success Toast \*/}  
\<div className="bg-\[\#00FFAA\]/10 text-\[\#00FFAA\] border border-\[\#00FFAA\]/30  
               px-4 py-3 rounded-xl flex items-center gap-3  
               animate-slide-in backdrop-blur-xl shadow-2xl"\>  
 \<svg className="w-5 h-5" /\>  
 \<p className="font-medium text-sm"\>Success message\</p\>  
\</div\>

{/\* Error Toast \*/}  
\<div className="bg-red-500/10 text-red-400 border border-red-500/30  
               px-4 py-3 rounded-xl flex items-center gap-3"\>  
 \<svg className="w-5 h-5" /\>  
 \<p className="font-medium text-sm"\>Error message\</p\>  
\</div\>  
\`\`\`

\---

\#\# ✨ Special Effects

\#\#\# Glow Effects  
\`\`\`css  
.glow-teal {  
 box-shadow: 0 0 20px rgba(0, 161, 199, 0.4);  
}

.glow-mint {  
 box-shadow: 0 0 20px rgba(0, 255, 170, 0.3);  
}

.glow-orange {  
 box-shadow: 0 0 20px rgba(255, 104, 38, 0.4);  
}

/\* Button glow \*/  
box-shadow: 0 0 30px rgba(0, 161, 199, 0.4);  
\`\`\`

\#\#\# Glassmorphism  
\`\`\`css  
.glass {  
 backdrop-filter: blur(16px);  
 background: rgba(2, 4, 10, 0.8);  
 border: 1px solid rgba(255, 255, 255, 0.05);  
}

.glass-heavy {  
 backdrop-filter: blur(24px);  
 background: rgba(2, 4, 10, 0.9);  
 border: 1px solid rgba(255, 255, 255, 0.08);  
}  
\`\`\`

\#\#\# Gradients  
\`\`\`css  
/\* Text gradient \*/  
.text-gradient {  
 background: linear-gradient(135deg, \#00A1C7 0%, \#00FFAA 100%);  
 \-webkit-background-clip: text;  
 \-webkit-text-fill-color: transparent;  
 background-clip: text;  
}

/\* Background radial gradient \*/  
background: radial-gradient(ellipse\_at\_top\_left, rgba(0,161,199,0.15) 0%, transparent 50%),  
           radial-gradient(ellipse\_at\_bottom\_right, rgba(0,255,170,0.1) 0%, transparent 50%);

/\* Border gradient \*/  
.border-gradient {  
 border: 1px solid transparent;  
 background: linear-gradient(\#09090B, \#09090B) padding-box,  
             linear-gradient(135deg, \#00A1C7, \#00FFAA) border-box;  
}

/\* Accent bar \*/  
background: linear-gradient(to right, \#00A1C7, \#00FFAA, \#00A1C7);  
\`\`\`

\#\#\# Grid Pattern Overlay  
\`\`\`jsx  
\<div  
 className="absolute inset-0 opacity-\[0.03\]"  
 style={{  
   backgroundImage: \`linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),  
                     linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)\`,  
   backgroundSize: '40px 40px'  
 }}  
/\>  
\`\`\`

\---

\#\# 🎬 Animations

\#\#\# CSS Keyframes  
\`\`\`css  
/\* Slide In \*/  
@keyframes slideIn {  
 from { transform: translateX(100%); opacity: 0; }  
 to { transform: translateX(0); opacity: 1; }  
}

/\* Slide Up \*/  
@keyframes slideUp {  
 from { transform: translateY(20px); opacity: 0; }  
 to { transform: translateY(0); opacity: 1; }  
}

/\* Fade In \*/  
@keyframes fadeIn {  
 from { opacity: 0; }  
 to { opacity: 1; }  
}

/\* Pulse Glow \*/  
@keyframes pulse-glow {  
 0%, 100% { box-shadow: 0 0 20px rgba(0, 161, 199, 0.3); }  
 50% { box-shadow: 0 0 40px rgba(0, 255, 170, 0.4); }  
}

/\* Shimmer Loading \*/  
@keyframes shimmer {  
 0% { background-position: \-200% 0; }  
 100% { background-position: 200% 0; }  
}

/\* Floating Particles \*/  
@keyframes float {  
 0%, 100% { transform: translate(0, 0\) scale(1); opacity: 0.2; }  
 25% { transform: translate(15px, \-20px) scale(1.3); opacity: 0.4; }  
 50% { transform: translate(25px, \-35px) scale(1.6); opacity: 0.5; }  
 75% { transform: translate(10px, \-15px) scale(1.2); opacity: 0.3; }  
}

/\* Spin \*/  
@keyframes spin {  
 to { transform: rotate(360deg); }  
}

/\* Shake (for errors) \*/  
@keyframes shake {  
 0%, 100% { transform: translateX(0); }  
 20%, 60% { transform: translateX(-5px); }  
 40%, 80% { transform: translateX(5px); }  
}  
\`\`\`

\#\#\# Animation Classes  
\`\`\`css  
.animate-slide-in { animation: slideIn 0.3s ease-out; }  
.animate-slide-up { animation: slideUp 0.4s ease-out; }  
.animate-fade-in { animation: fadeIn 0.3s ease-out; }  
.animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }  
.animate-shake { animation: shake 0.4s ease-in-out; }

/\* Shimmer loading effect \*/  
.animate-shimmer {  
 background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%);  
 background-size: 200% 100%;  
 animation: shimmer 2s infinite;  
}  
\`\`\`

\---

\#\# 📐 Border Radius Scale

\`\`\`css  
/\* Rounded corners used in this design \*/  
rounded-md:   6px    /\* Small elements like badges \*/  
rounded-lg:   8px    /\* Buttons, small cards \*/  
rounded-xl:   12px   /\* Inputs, medium cards \*/  
rounded-2xl:  16px   /\* Large cards \*/  
rounded-3xl:  24px   /\* Modal, login card \*/  
rounded-full: 9999px /\* Pills, avatars \*/  
\`\`\`

\---

\#\# 🔲 Spacing Patterns

\#\#\# Common Padding  
\`\`\`css  
/\* Card padding \*/  
p-4, p-6, p-8

/\* Section padding \*/  
px-4 py-3     /\* Compact \*/  
px-6 py-4     /\* Standard \*/  
px-8 py-6     /\* Spacious \*/

/\* Button padding \*/  
px-4 py-2     /\* Small \*/  
px-6 py-3     /\* Medium \*/  
px-8 py-4     /\* Large \*/  
\`\`\`

\#\#\# Gap/Spacing  
\`\`\`css  
gap-2  /\* 8px \- Tight \*/  
gap-3  /\* 12px \- Compact \*/  
gap-4  /\* 16px \- Standard \*/  
gap-6  /\* 24px \- Spacious \*/  
gap-8  /\* 32px \- Section spacing \*/  
\`\`\`

\---

\#\# 📱 Scrollbar Styling

\`\`\`css  
/\* Thin scrollbar \*/  
\* {  
 scrollbar-width: thin;  
 scrollbar-color: rgba(255, 255, 255, 0.1) transparent;  
}

::-webkit-scrollbar {  
 width: 6px;  
 height: 6px;  
}

::-webkit-scrollbar-track {  
 background: transparent;  
}

::-webkit-scrollbar-thumb {  
 background: rgba(255, 255, 255, 0.1);  
 border-radius: 3px;  
}

::-webkit-scrollbar-thumb:hover {  
 background: rgba(255, 255, 255, 0.15);  
}  
\`\`\`

\---

\#\# 🌓 Dark Mode Specific

This design is \*\*dark-mode only\*\*. Key principles:

1\. \*\*Background Hierarchy\*\*: Use darker (\#02040A) for main bg, slightly lighter (\#09090B) for cards  
2\. \*\*Borders\*\*: Use \`border-white/10\` (10% white) for subtle borders  
3\. \*\*Text Hierarchy\*\*: White (\#FAFAFA) for primary, zinc-400 for secondary, zinc-600 for muted  
4\. \*\*Hover States\*\*: Increase border opacity (\`border-white/20\`) or add subtle background (\`bg-white/5\`)  
5\. \*\*Active/Focus States\*\*: Use brand-teal (\#00A1C7) with ring effect

\---

\#\# 📋 Complete index.css Template

\`\`\`css  
@import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700\&family=Inter:wght@300;400;500;600;700\&family=JetBrains+Mono:wght@400;500;600\&display=swap');

@tailwind base;  
@tailwind components;  
@tailwind utilities;

:root {  
 /\* Background Colors \*/  
 \--app-bg: \#02040A;  
 \--surface: \#09090B;  
 \--surface-highlight: \#18181B;  
  /\* Brand Colors \*/  
 \--brand-teal: \#00A1C7;  
 \--brand-mint: \#00FFAA;  
 \--brand-orange: \#FF6826;  
  /\* Text Colors \*/  
 \--text-primary: \#FAFAFA;  
 \--text-secondary: \#A1A1AA;  
 \--text-muted: \#52525B;  
}

\* {  
 scrollbar-width: thin;  
 scrollbar-color: rgba(255, 255, 255, 0.1) transparent;  
}

body {  
 margin: 0;  
 font-family: 'Inter', \-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;  
 \-webkit-font-smoothing: antialiased;  
 background-color: var(--app-bg);  
 color: var(--text-primary);  
}

h1, h2, h3, h4, h5, h6 {  
 font-family: 'Rubik', sans-serif;  
}

.font-mono, code {  
 font-family: 'JetBrains Mono', monospace;  
}

/\* Scrollbar \*/  
::-webkit-scrollbar { width: 6px; height: 6px; }  
::-webkit-scrollbar-track { background: transparent; }  
::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 3px; }  
::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.15); }

/\* Glow Effects \*/  
.glow-teal { box-shadow: 0 0 20px rgba(0, 161, 199, 0.4); }  
.glow-mint { box-shadow: 0 0 20px rgba(0, 255, 170, 0.3); }

/\* Glassmorphism \*/  
.glass {  
 backdrop-filter: blur(16px);  
 background: rgba(2, 4, 10, 0.8);  
 border: 1px solid rgba(255, 255, 255, 0.05);  
}

/\* Text Gradient \*/  
.text-gradient {  
 background: linear-gradient(135deg, var(--brand-teal) 0%, var(--brand-mint) 100%);  
 \-webkit-background-clip: text;  
 \-webkit-text-fill-color: transparent;  
}

/\* Status Colors \*/  
.status-healthy { color: var(--brand-mint); }  
.status-warning { color: \#eab308; }  
.status-critical { color: \#ef4444; }  
.status-info { color: var(--brand-teal); }

/\* Selection \*/  
::selection {  
 background: rgba(0, 161, 199, 0.3);  
 color: white;  
}

/\* Focus visible for accessibility \*/  
:focus-visible {  
 outline: 2px solid var(--brand-teal);  
 outline-offset: 2px;  
}

/\* Button active state \*/  
button:active:not(:disabled) {  
 transform: scale(0.98);  
}

/\* Animations \*/  
@keyframes slideIn {  
 from { transform: translateX(100%); opacity: 0; }  
 to { transform: translateX(0); opacity: 1; }  
}

@keyframes fadeIn {  
 from { opacity: 0; }  
 to { opacity: 1; }  
}

.animate-slide-in { animation: slideIn 0.3s ease-out; }  
.animate-fade-in { animation: fadeIn 0.3s ease-out; }  
\`\`\`

\---

\#\# 🚀 Quick Start Checklist

When building a new app with this design:

1\. ✅ Add Google Fonts import (Rubik, Inter, JetBrains Mono)  
2\. ✅ Configure Tailwind with custom colors  
3\. ✅ Set body background to \`\#02040A\`  
4\. ✅ Use \`\#09090B\` for card backgrounds  
5\. ✅ Use \`border-white/10\` for borders  
6\. ✅ Use \`\#00A1C7\` (teal) as primary brand color  
7\. ✅ Use \`\#00FFAA\` (mint) as accent/success color  
8\. ✅ Use Rubik for headings, Inter for body text  
9\. ✅ Add glow effects on primary buttons  
10\. ✅ Include subtle animations for polish

\---

\*This design guide is based on the Profitcast Signal Dashboard v2.1\*

