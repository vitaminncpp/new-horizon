# Design System Specification: The Academic Atelier

## 1. Overview & Creative North Star
**The Creative North Star: "The Digital Curator"**

This design system transcends the typical "educational dashboard" by adopting an editorial, high-end gallery aesthetic. We are not just building a platform; we are crafting a sanctuary for knowledge. The "Digital Curator" philosophy rejects the cluttered, grid-heavy layouts of traditional LMS platforms in favor of intentional asymmetry, expansive breathing room, and a sophisticated layering of information.

To break the "template" look, designers must embrace **Tonal Depth**. By utilizing the subtle shifts between primary and secondary backgrounds and leveraging modular, overlapping components, we create a sense of physical space. The interface should feel like a premium, well-organized physical workspace—where every element is placed with purpose and "quiet" elegance.

---

## 2. Colors & Surface Philosophy

The color palette is grounded in professional cool tones, punctuated by vibrant, intellectually stimulating gradients.

### The Palette (Material Design Mapping)
*   **Primary Core:** `primary` (#5543cf) | `primary_container` (#9e93ff)
*   **Secondary/Accent:** `secondary` (#006855) | `secondary_container` (#5ffbd6)
*   **Tertiary/Nuance:** `tertiary` (#843aa3) | `tertiary_container` (#e192ff)
*   **Base Neutrals:** `surface` (#f5f7f9) | `surface_container_lowest` (#ffffff)

### Editorial Color Rules
*   **The "No-Line" Rule:** Explicitly prohibit the use of 1px solid borders for sectioning or layout containment. Boundaries must be defined through background shifts. Transition from `surface` to `surface_container_low` to define a sidebar or header.
*   **Surface Hierarchy & Nesting:** Treat the UI as a series of stacked sheets.
    *   *Level 0:* `background` (#f5f7f9) - The base canvas.
    *   *Level 1:* `surface_container_low` (#eef1f3) - Inset content areas.
    *   *Level 2:* `surface_container_lowest` (#ffffff) - Interactive cards and primary focus elements.
*   **The "Glass & Gradient" Rule:** Main CTAs and high-impact hero sections must use the **Signature Textures**. Instead of flat fills, use a linear gradient from `primary` (#5543cf) to `primary_dim` (#4935c3) at a 135-degree angle to provide a sense of "visual soul."
*   **Glassmorphism:** For floating navigation or modal overlays, use `surface_container_lowest` at 80% opacity with a `24px` backdrop-blur. This ensures the layout feels integrated and "liquid" rather than static.

---

## 3. Typography: The Editorial Voice

We utilize **Inter** not as a system font, but as a Swiss-style typographic tool. The focus is on dramatic scale contrasts to guide the learner's eye.

*   **Display (Large/Medium):** Used for hero headlines and major section entrances. High tracking (-0.02em) to create a compact, authoritative look.
*   **Headline (Small/Medium):** Used for module titles. These should always sit on a `surface` or `surface_container_low` background to maintain "The Digital Curator" feel.
*   **Body (Large/Medium):** Use `on_surface_variant` (#595c5e) for long-form reading to reduce eye strain, reserving `on_surface` (#2c2f31) for critical UI instructions.
*   **Label (Small):** Always uppercase with +0.05em tracking when used as a category eyebrow.

---

## 4. Elevation & Depth: Tonal Layering

Traditional shadows are loud; we prefer "Ambient Presence."

*   **The Layering Principle:** Avoid elevation shadows where possible. Instead, place a `surface_container_lowest` card atop a `surface_container` background. The 4-5% contrast difference creates a sophisticated, "borderless" lift.
*   **Ambient Shadows:** When an element must float (e.g., a dropdown or active state card), use a highly diffused shadow: `0px 20px 40px rgba(15, 23, 42, 0.06)`. Note the tint—the shadow color is derived from the `on_surface` blue-slate, not pure black.
*   **The "Ghost Border" Fallback:** If a divider is essential for accessibility, use the `outline_variant` token at 15% opacity. It should be felt, not seen.
*   **Modular Radii:**
    *   *Outer Containers/Cards:* `1.5rem` (xl)
    *   *Interactive Elements (Buttons):* `0.75rem` (md)
    *   *System Elements (Inputs):* `0.5rem` (DEFAULT)

---

## 5. Components

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary_dim`), no border, `md` corner radius.
*   **Secondary:** `surface_container_high` fill with `on_surface` text.
*   **Tertiary:** Transparent background, `primary` text, with a subtle underline appearing only on hover.

### Inputs & Fields
*   **Treatment:** Background `surface_container_lowest` with a `Ghost Border`. On focus, the border transitions to `primary` at 50% opacity with a soft 4px outer glow of the same color.

### Cards & Lists
*   **Forbid Divider Lines:** Separate list items using `12px` of vertical white space or by alternating background tones between `surface_container_low` and `surface_container_lowest`.
*   **Learning Progress Chips:** Use the **Accent Gradient** (`00C9A7` to `4D96FF`) as a thin 4px progress bar at the very top edge of a card to signify completion status without cluttering the card body.

### Specialty Component: The "Insight Ghost"
*   A specialized tooltip for academic annotations. Use a glassmorphic background (`surface_container_lowest` @ 70%) with a heavy blur and a 1px `outline_variant` at 10% opacity.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical padding. Give the left side of a layout more "air" than the right to mimic high-end editorial magazines.
*   **Do** use `primary_fixed_dim` for icons to ensure they feel like part of the brand rather than generic assets.
*   **Do** use type scale to indicate hierarchy—a `display-sm` heading is often more effective than a bold box.

### Don't:
*   **Don't** use 100% black (#000000) for text. It breaks the sophistication of the light theme. Use `on_surface`.
*   **Don't** use standard 1px borders to separate the "Header" from the "Content." Use a height-based shadow or a tonal shift.
*   **Don't** cram content. If a screen feels full, it's over-designed. Remove an element or increase the `surface` spacing.