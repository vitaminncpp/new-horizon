# Design System Specification: The Architectural Scholar

## 1. Overview & Creative North Star
The "Creative North Star" for this design system is **The Digital Curator**. This system moves away from the rigid, "boxed-in" feel of traditional educational software and instead adopts the aesthetic of a high-end, interactive museum or a premium editorial publication. 

The goal is to provide a "Modern Sleek" experience that feels authoritative yet fluid. We achieve this by breaking the traditional dashboard grid with **intentional asymmetry**—offsetting widgets and using varied card heights—and leveraging **tonal depth** over structural lines. The result is a platform that feels like an infinite workspace for the mind rather than a set of digital folders.

---

## 2. Colors & Surface Philosophy
Color is not just for decoration; it defines the topography of the learning experience.

### Brand Gradients
These are our "Signature Textures." They should be used sparingly for primary actions, progress indicators, and hero states to provide a professional "soul" that flat colors lack.
*   **Primary Academic Gradient:** `#6C5CE7` → `#8E44AD` (Used for Primary CTAs and high-level progress).
*   **Momentum Gradient:** `#00C9A7` → `#4D96FF` (Used for success states, achievements, and interactive "hotspots").

### The "No-Line" Rule
**Explicit Instruction:** Prohibition of 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts or subtle tonal transitions.
*   **Standard:** Use `surface-container-low` for the page background and `surface` or `surface-container-high` for card elements.
*   **Result:** The UI feels like a seamless landscape rather than a collection of fenced-off boxes.

### Glass & Nesting
To achieve the "Sleek" attribute, floating elements (modals, dropdowns, hovering widgets) must use **Glassmorphism**.
*   **Implementation:** Use a semi-transparent `surface` color (80% opacity) with a `backdrop-blur` of 20px.
*   **Nesting:** Depth is created by stacking tiers. Place a `surface-container-lowest` card inside a `surface-container-low` section to create a soft, natural "recessed" look.

---

## 3. Typography: The Editorial Scale
We use **Inter** not as a system font, but as a high-performance typeface that bridges the gap between technical clarity and editorial elegance.

| Level | Token | Size | Tracking | Weight | Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | 3.5rem | -0.02em | 700 | Massive achievement milestones. |
| **Headline** | `headline-lg` | 2rem | -0.01em | 600 | Main dashboard section titles. |
| **Title** | `title-md` | 1.125rem | 0 | 500 | Card titles and widget headers. |
| **Body** | `body-lg` | 1rem | 0 | 400 | Course descriptions and long-form text. |
| **Label** | `label-sm` | 0.6875rem | 0.05em | 600 | Metadata, "Caps-on" labels for status. |

**Editorial Contrast:** Always pair a `headline-lg` with a `body-sm` nearby. The extreme difference in scale creates the "High-End" feel found in premium magazines.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are forbidden. We use **Ambient Lighting**.

*   **The Layering Principle:** Instead of shadows, use the `surface-container` tiers (`Lowest` to `Highest`). To make a card "pop," don't darken the shadow; lighten the card’s surface color.
*   **Ambient Shadows:** For floating elements (e.g., a dragged widget), use a shadow color tinted with the `on-surface` token (usually a deep navy/purple tint) at 4-8% opacity with a blur of 40px. 
*   **The Ghost Border:** If a boundary is strictly required for accessibility, use the `outline-variant` token at **15% opacity**. This creates a "suggestion" of a border that guides the eye without cluttering the layout.

---

## 5. Components & Modular Widgets
The system now embraces a more spacious aesthetic, enhancing readability and content prioritization.

### Buttons: The "Tactile" Interaction
*   **Primary:** Uses the **Primary Academic Gradient**. Corner radius: `12px` (`md`).
*   **Secondary:** No fill. `Ghost Border` (15% opacity `outline-variant`). On hover, fill with `surface-bright`.
*   **Tertiary:** Text only, bolded `label-md` with a subtle `primary` underline.

### Cards: The "Rounded Modular" Unit
*   **Radius:** Always `16px` (`xl`).
*   **Structure:** No dividers. Use `24px` of vertical white space to separate the header from the content.
*   **Contextual Widget:** A specialized card for "Active Learning." This uses a `surface-container-highest` background to signify it is the most important element on the screen.

### Inputs & Interaction
*   **Fields:** Background should be `surface-container-lowest`. When focused, the "Ghost Border" transitions to a 100% opaque `primary` stroke.
*   **Checkboxes/Radios:** Use `secondary` (Teal) for "Checked" states to provide a refreshing contrast against the Purple primary theme.
*   **Chips:** Pill-shaped (`full` radius). Use `surface-variant` for inactive and the `Momentum Gradient` for active "Selection" chips.

### Context-Specific Components
*   **The Progress Ribbon:** A thin (4px) gradient line at the very top of a card, rather than a bulky progress bar, to show course completion elegantly.
*   **Glass Floating Nav:** A sidebar or top-nav that uses the Glassmorphism rule to sit "above" the content without disconnecting the user from their workspace.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical spacing. A widget on the left might have a 32px margin, while a decorative element on the right has 48px.
*   **Do** lean into "Deep Dark" modes. Ensure the `background` (#060e20) feels like a vast space, not just "gray."
*   **Do** use "Optical Alignment." Sometimes a 16px radius looks different on a small button vs. a large card; adjust to ensure they *feel* related.

### Don’t:
*   **Don’t** use 1px solid black or high-contrast borders. It kills the "Sleek" aesthetic.
*   **Don’t** use standard "Drop Shadows" from a library. They look muddy.
*   **Don’t** overcrowd the widgets. High density should be achieved through small, high-quality typography, not by jamming boxes together.
*   **Don’t** use dividers. If you feel you need a divider, add 16px of whitespace instead. If it still feels messy, shift the background color of one section.