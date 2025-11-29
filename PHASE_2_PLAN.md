# Phase 2: Visual Enhancements - Implementation Plan

## Phase 2.1: Change Blue to Purple Color Scheme

### Objective
Replace all blue color accents (#4488ff) with deep purple (#6B46C1) throughout the application.

### Color Palette

#### Primary Colors
- **Old Blue**: `#4488ff` → **New Purple**: `#6B46C1`
- **Light Blue**: `#5599ff` → **Light Purple**: `#7C3AED`
- **Dark Blue**: `#3377ee` → **Dark Purple**: `#5B21B6`

#### Supporting Colors
- **Hover Blue**: `#5599ff` → **Hover Purple**: `#8B5CF6`
- **Active Blue**: `#3377ee` → **Active Purple**: `#6D28D9`
- **Disabled Blue**: `#88bbff` → **Disabled Purple**: `#A78BFA`

### Files to Modify

#### 1. Core Styles
- `ui/styles.scss` - Main stylesheet with CSS variables
- `ui/views/app-fixes.scss` - Application-wide fixes

#### 2. Component Styles
- `ui/views/components/*.scss` - All component stylesheets
- `ui/views/graph/three-galaxy-view.js` - 3D visualization colors

#### 3. Graph/Visualization
- `ui/views/graph/*.scss` - Graph component styles
- `ui/views/graph/three-galaxy-view.js` - Change `#4488ff` to `#6B46C1`

#### 4. Explorer Views
- `ui/views/explorer/**/*.scss` - All explorer component styles

### Implementation Steps

1. **Create Color Variables** (5 min)
   - Add CSS custom properties for purple theme
   - Define light/dark theme variants

2. **Update Main Stylesheet** (10 min)
   - Replace blue hex codes with purple
   - Update CSS variables

3. **Update 3D Visualization** (5 min)
   - Change particle colors in three-galaxy-view.js
   - Update glow effects

4. **Update Component Styles** (20 min)
   - Search and replace blue hex codes
   - Test in both light and dark themes

5. **Test Visual Consistency** (10 min)
   - Check all pages
   - Verify hover states
   - Test dark mode

### Search and Replace Strategy

```bash
# Find all blue color references
grep -r "#4488ff" ui/
grep -r "#5599ff" ui/
grep -r "#3377ee" ui/

# Replace with purple
sed -i '' 's/#4488ff/#6B46C1/g' file.scss
sed -i '' 's/#5599ff/#7C3AED/g' file.scss
sed -i '' 's/#3377ee/#5B21B6/g' file.scss
```

### Testing Checklist

- [ ] Homepage displays purple accents
- [ ] Search bar has purple focus
- [ ] Buttons use purple hover states
- [ ] Links are purple
- [ ] Charts use purple colors
- [ ] 3D visualization has purple particles
- [ ] Dark mode looks good
- [ ] Light mode looks good
- [ ] All hover states work
- [ ] Active states are visible

### Estimated Time
**Total**: 50 minutes

### Risk Assessment
- **Low Risk**: Color changes are purely visual
- **No Breaking Changes**: Functionality unchanged
- **Easy Rollback**: Can revert color changes easily

### Success Criteria
- ✅ All blue (#4488ff) replaced with purple (#6B46C1)
- ✅ Consistent purple theme across all pages
- ✅ Works in both light and dark modes
- ✅ Hover and active states use purple
- ✅ 3D visualization uses purple particles
- ✅ No visual regressions

---

## Implementation Order

1. ✅ Create color variables
2. ✅ Update main stylesheet
3. ✅ Update 3D visualization
4. ✅ Update component styles
5. ✅ Test and verify

Let's begin!
