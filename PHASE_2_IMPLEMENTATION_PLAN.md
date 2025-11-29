# Phase 2: Visual Enhancements - Implementation Plan

## Objective
Transform Lumina's visual identity from blue to purple, creating a unique, modern aesthetic that stands out from competitors.

---

## Color Palette

### Primary Colors
| Old (Blue) | New (Purple) | Usage |
|------------|--------------|-------|
| `#4488ff` | `#6B46C1` | Primary brand color |
| `#5599ff` | `#7C3AED` | Light accent |
| `#3377ee` | `#5B21B6` | Dark accent |
| `#88bbff` | `#A78BFA` | Disabled/muted |

### Supporting Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Deep Purple | `#6B46C1` | Buttons, links, icons |
| Violet | `#7C3AED` | Hover states |
| Purple | `#8B5CF6` | Active states |
| Light Purple | `#A78BFA` | Borders, disabled |
| Ultra Light | `#C4B5FD` | Backgrounds |

---

## Files to Modify

### Priority 1: Core Styles (15 min)
1. `ui/styles.scss` - Main stylesheet
2. `ui/views/app-fixes.scss` - App-wide fixes

### Priority 2: 3D Visualization (10 min)
3. `ui/views/graph/three-galaxy-view.js` - Particle colors

### Priority 3: Components (20 min)
4. `ui/views/components/*.scss` - All component styles
5. `ui/views/explorer/**/*.scss` - Explorer views

### Priority 4: Charts (10 min)
6. Chart color configurations

---

## Implementation Steps

### Step 1: Create CSS Variables (5 min)
Add purple theme variables to `ui/styles.scss`

### Step 2: Global Search & Replace (10 min)
Replace all blue hex codes with purple equivalents

### Step 3: Update 3D Galaxy (5 min)
Change particle colors in `three-galaxy-view.js`

### Step 4: Test Visual Consistency (10 min)
Check all pages in light and dark mode

### Step 5: Fine-tune (10 min)
Adjust any colors that don't look right

---

## Total Time Estimate
**50 minutes** for complete visual transformation

---

## Testing Checklist
- [ ] Homepage purple theme
- [ ] Search bar purple focus
- [ ] Buttons purple hover
- [ ] Links purple color
- [ ] Charts purple lines
- [ ] 3D galaxy purple particles
- [ ] Dark mode works
- [ ] Light mode works
- [ ] All hover states purple
- [ ] All active states purple

---

## Let's Begin! 🚀
