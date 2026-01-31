# Design Guide

> Extracted from: https://www.apple.com/
> Generated: 2026-01-31 12:12:27
> Viewport: 1600x1200

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing](#spacing)
4. [Borders & Radius](#borders--radius)
5. [Shadows & Effects](#shadows--effects)
6. [Layout](#layout)
7. [CSS Variables](#css-variables)
8. [Implementation Guide](#implementation-guide)

---

## Color Palette


#### Neutral

| Color | Hex | RGB |
|-------|-----|-----|
| ![#6e6e73](https://via.placeholder.com/20/6e6e73/6e6e73) | `#6e6e73` | `rgb(110, 110, 115)` |
| ![#333336](https://via.placeholder.com/20/333336/333336) | `#333336` | `rgb(51, 51, 54)` |
| ![#e8e8ed](https://via.placeholder.com/20/e8e8ed/e8e8ed) | `#e8e8ed` | `rgba(232, 232, 237, 0.4)` |
| ![#d2d2d7](https://via.placeholder.com/20/d2d2d7/d2d2d7) | `#d2d2d7` | `rgba(210, 210, 215, 0.64)` |

#### Text

| Color | Hex | RGB |
|-------|-----|-----|
| ![#000000](https://via.placeholder.com/20/000000/000000) | `#000000` | `rgb(0, 0, 0)` |
| ![#1d1d1f](https://via.placeholder.com/20/1d1d1f/1d1d1f) | `#1d1d1f` | `rgb(29, 29, 31)` |
| ![#191312](https://via.placeholder.com/20/191312/191312) | `#191312` | `rgb(25, 19, 18)` |
| ![#0e0602](https://via.placeholder.com/20/0e0602/0e0602) | `#0e0602` | `rgb(14, 6, 2)` |

#### Background

| Color | Hex | RGB |
|-------|-----|-----|
| ![#ffffff](https://via.placeholder.com/20/ffffff/ffffff) | `#ffffff` | `rgb(255, 255, 255)` |
| ![#fafafc](https://via.placeholder.com/20/fafafc/fafafc) | `#fafafc` | `rgb(250, 250, 252)` |
| ![#f5f5f7](https://via.placeholder.com/20/f5f5f7/f5f5f7) | `#f5f5f7` | `rgb(245, 245, 247)` |
| ![#f4f8fb](https://via.placeholder.com/20/f4f8fb/f4f8fb) | `#f4f8fb` | `rgb(244, 248, 251)` |

#### Other

| Color | Hex | RGB |
|-------|-----|-----|
| ![#0066cc](https://via.placeholder.com/20/0066cc/0066cc) | `#0066cc` | `rgb(0, 102, 204)` |
| ![#0071e3](https://via.placeholder.com/20/0071e3/0071e3) | `#0071e3` | `rgb(0, 113, 227)` |
| ![#2997ff](https://via.placeholder.com/20/2997ff/2997ff) | `#2997ff` | `rgb(41, 151, 255)` |
| ![#c7e6f1](https://via.placeholder.com/20/c7e6f1/c7e6f1) | `#c7e6f1` | `rgb(199, 230, 241)` |
| ![#3ed500](https://via.placeholder.com/20/3ed500/3ed500) | `#3ed500` | `rgb(62, 213, 0)` |
| ![#1246c4](https://via.placeholder.com/20/1246c4/1246c4) | `#1246c4` | `rgb(18, 70, 196)` |
| ![#768e31](https://via.placeholder.com/20/768e31/768e31) | `#768e31` | `rgb(118, 142, 49)` |
| ![#88aaf2](https://via.placeholder.com/20/88aaf2/88aaf2) | `#88aaf2` | `rgb(136, 170, 242)` |

---

## Typography

### Font Families

```css
--font-primary: SF Pro Text;
--font-secondary: SF Pro Icons;
--font-mono: Helvetica Neue;
```


### Typography Scale

| Element | Font Family | Size | Weight | Line Height | Color |
|---------|-------------|------|--------|-------------|-------|
| Heading 1 | `SF Pro Text` | `34px` | `600` | `50px` | `#1d1d1f` |
| Heading 2 | `SF Pro Text` | `12px` | `400` | `16.0005px` | `#6e6e73` |
| Heading 3 | `SF Pro Display` | `40px` | `600` | `44px` | `#1d1d1f` |
| Paragraph | `SF Pro Display` | `28px` | `400` | `32.0001px` | `#1d1d1f` |
| Link | `SF Pro Text` | `17px` | `600` | `21.0012px` | `#000000` |
| Button | `SF Pro Text` | `17px` | `400` | `25px` | `#1d1d1f` |
| Input | `SF Pro Display` | `24px` | `600` | `24px` | `#333336` |
| Span | `SF Pro Text` | `17px` | `400` | `25px` | `#1d1d1f` |

---

## Spacing


### Spacing Scale

Use consistent spacing values from this scale:

```css
--spacing-0: 0px; /* 0.000rem */
--spacing-1: 1px; /* 0.062rem */
--spacing-2: 2px; /* 0.125rem */
--spacing-4: 4px; /* 0.250rem */
--spacing-5: 5px; /* 0.312rem */
--spacing-6: 6px; /* 0.375rem */
--spacing-7: 7px; /* 0.438rem */
--spacing-8: 8px; /* 0.500rem */
--spacing-9: 9px; /* 0.562rem */
--spacing-10: 10px; /* 0.625rem */
--spacing-11: 11px; /* 0.688rem */
--spacing-12: 12px; /* 0.750rem */
--spacing-13: 13px; /* 0.812rem */
--spacing-14: 14px; /* 0.875rem */
--spacing-15: 15px; /* 0.938rem */
--spacing-16: 16px; /* 1.000rem */
--spacing-17: 17px; /* 1.062rem */
--spacing-18: 18px; /* 1.125rem */
--spacing-19: 19px; /* 1.188rem */
--spacing-20: 20px; /* 1.250rem */
```

---

## Borders & Radius


### Border Radius

```css
--radius-1: 5px;
--radius-2: 980px;
--radius-3: 999px;
--radius-4: 50%;
--radius-5: 8px;
```

---

## Shadows & Effects


### Shadows

#### Box Shadows

```css
--shadow-1: rgba(0, 0, 0, 0.22) 3px 5px 30px 0px;
```

#### Text Shadows

```css
--text-shadow-1: rgba(0, 0, 0, 0.6) 0px 0px 5px;
```

### Effects & Animations

#### Transitions

```css
transition: all;
transition: background 0.24s cubic-bezier(0.4, 0, 0.6, 1);
transition: color 0.32s cubic-bezier(0.4, 0, 0.6, 1);
transition: visibility 0.24s steps(1);
transition: opacity 0.24s cubic-bezier(0.4, 0, 0.6, 1);
transition: opacity 0.32s 0.08s, transform 0.32s 0.08s;
transition: opacity 0.24s, transform 0.24s;
transition: opacity 0.22s, transform 0.22s;
transition: opacity 0.2s, transform 0.2s;
transition: opacity 0.18s, transform 0.18s;
```

#### Animations

```css
animation: 0.32s cubic-bezier(0.4, 0, 0.6, 1) 0.2s both globalnav-search-fade-and-slide;
animation: 0.32s cubic-bezier(0.4, 0, 0.6, 1) 0.22s both globalnav-search-fade-and-slide;
animation: 0.32s cubic-bezier(0.4, 0, 0.6, 1) 0.24s both globalnav-search-fade-and-slide;
animation: 0.32s cubic-bezier(0.4, 0, 0.6, 1) 0.26s both globalnav-search-fade-and-slide;
animation: 0.32s cubic-bezier(0.4, 0, 0.6, 1) 0.28s both globalnav-search-fade-and-slide;
animation: 0.32s cubic-bezier(0.4, 0, 0.6, 1) 0.3s both globalnav-search-fade-and-slide;
```

---

## Layout


### Layout Patterns

#### Container Widths

- `max-width: 1024px` - ul
- `max-width: 50%` - div
- `max-width: 25%` - div

#### Grid Layouts

```css
/* section.homepage-section collection-module */
display: grid;
grid-template-columns: 1600px;
gap: 12px;

/* section.homepage-section collection-module */
display: grid;
grid-template-columns: 782px 782px;
gap: 12px;

/* a.media-gallery-wrapper-link fam-media-gallery-wrapper-link */
display: grid;
grid-template-columns: 1250px;
gap: normal;

/* a.media-gallery-wrapper-link fam-media-gallery-wrapper-link */
display: grid;
grid-template-columns: 1250px;
gap: normal;

/* a.media-gallery-wrapper-link fam-media-gallery-wrapper-link */
display: grid;
grid-template-columns: 1250px;
gap: normal;

```

#### Flexbox Layouts

Common flex patterns used:

| Direction | Justify | Align |
|-----------|---------|-------|
| `row` | `center` | `center` |
| `row` | `normal` | `center` |
| `row` | `space-between` | `normal` |
| `row` | `normal` | `normal` |

---

## CSS Variables


### CSS Custom Properties

The original site uses these CSS variables:

```css
:root {
  --r-globalnav-background-opened: #fafafc;
  --r-globalnav-background-opened-dark: #161617;
  --r-globalnav-flyout-close-delay: .12s;
  --r-globalnav-flyout-link-opacity-duration: .5s;
  --r-globalnav-flyout-spacing: 88px;
  --r-globalnav-next-flyout-height: 0px;
  --r-globalnav-previous-flyout-height: 0px;
  --r-globalnav-height: 44px;
  --r-globalnav-color: rgba(0, 0, 0, .8);
  --r-globalnav-color-secondary: #333336;
  --r-globalnav-color-hover: #000000;
  --r-globalnav-font-size: 17px;
  --globalnav-background: rgba(0, 0, 0, .8);
  --globalnav-backdrop-filter: initial;
  --r-globalnav-start: var(--r-sk-start, right);
  --r-globalnav-end: var(--r-sk-end, left);
  --r-globalnav-safe-area-inset-start: var(--sk-safe-area-inset-start, env(safe-area-inset-right));
  --r-globalnav-safe-area-inset-end: var(--sk-safe-area-inset-end, env(safe-area-inset-left));
  --r-globalnav-logical-factor: -1;
  --r-globalnav-flyout-rate: 0s;
  --r-globalnav-duration-medium: .24s;
  --sk-focus-offset: 1px;
  --r-globalnav-submenu-header-color: rgb(110, 110, 115);
  --r-globalnav-flyout-height: 0;
  --r-globalnav-search-icon-fill: rgb(110, 110, 115);
  --r-globalnav-search-icon-active-fill: #333336;
  --r-globalnav-search-input-placeholder-color: rgb(110, 110, 115);
  --r-globalnav-search-input-value-color: #333336;
  --r-globalnav-search-list-header-color: rgb(110, 110, 115);
  --r-globalnav-search-list-item-color: #333336;
  --r-globalnav-search-list-item-icon-fill: rgb(110, 110, 115);
  --r-globalnav-search-list-item-hover-background: rgb(245, 245, 247);
  --r-globalnav-search-list-item-hover-color: #000000;
  --r-globalnav-search-list-item-nonsearchterm-color: rgb(110, 110, 115);
  --r-globalnav-search-list-item-searchterm-color: #333336;
  --r-globalnav-search-input-vertical-shift: -4px;
  --r-globalnav-search-shift-vertical: 4px;
  --r-globalnav-search-base-duration: calc(.24s - 80ms);
  --r-globalnav-search-reverse-index: calc(var(--r-globalnav-flyout-item-total) - var(--r-globalnav-flyout-item-number));
  --r-globalnav-searchresults-timeout: .44s;
  --r-globalnav-search-item-base-duration: calc(.24s - 80ms);
  --r-globalnav-search-item-reverse-index: calc(var(--r-globalnav-flyout-item-total) - var(--r-globalnav-flyout-item-number));
  --globalnav-preceding-element-height: var(--r-localeswitcher-height, 0px);
  --globalmessage-segment-background: rgb(22, 22, 23);
  --globalmessage-segment-scrim-background: rgba(255, 255, 255, .08);
  --globalmessage-segment-text-color: rgba(255, 255, 255, .92);
  --globalmessage-segment-border-color: rgba(255, 255, 255, .4);
  --r-globalmessage-segment-content-inline-start: max( 22px, var(--r-globalheader-safe-area-inset-start) );
  --r-globalmessage-segment-content-inline-end: max( 22px, var(--r-globalheader-safe-area-inset-end) );
  --globalnav-badge-background: rgb(255, 255, 255);
}
```

---

## Implementation Guide


### Quick Start

1. **Set up CSS variables** - Copy the color palette and typography variables to your stylesheet's `:root`
2. **Apply base styles** - Set up body typography and background
3. **Use the spacing scale** - Apply consistent spacing using the extracted values
4. **Match interactive states** - Implement hover effects and transitions as documented

### CSS Reset Recommendations

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Responsive Considerations

The design tokens were extracted at a specific viewport size. Consider:
- Testing at multiple breakpoints
- Using relative units (rem, em, %) where appropriate
- Implementing fluid typography if needed

### Accessibility Checklist

- [ ] Color contrast meets WCAG 2.1 AA standards
- [ ] Interactive elements have visible focus states
- [ ] Typography is readable at all sizes
- [ ] Animations respect `prefers-reduced-motion`
