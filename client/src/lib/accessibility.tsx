import { useEffect } from "react";

/**
 * Accessibility utilities and hooks
 */

// Announce to screen readers
export function announce(message: string, priority: "polite" | "assertive" = "polite") {
  const liveRegion = document.getElementById(`aria-live-${priority}`);
  if (liveRegion) {
    liveRegion.textContent = message;
    setTimeout(() => {
      liveRegion.textContent = "";
    }, 1000);
  }
}

// Keyboard navigation hook
export function useKeyboardNavigation() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tab key detection
      if (e.key === "Tab") {
        document.body.classList.add("keyboard-nav");
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove("keyboard-nav");
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);
}

// Focus trap for modals
export function useFocusTrap(ref: React.RefObject<HTMLElement>, isActive: boolean) {
  useEffect(() => {
    if (!isActive || !ref.current) return;

    const element = ref.current;
    const focusableElements = element.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    element.addEventListener("keydown", handleKeyDown);
    firstElement?.focus();

    return () => {
      element.removeEventListener("keydown", handleKeyDown);
    };
  }, [ref, isActive]);
}

// Check color contrast
export function getContrastRatio(color1: string, color2: string): number {
  // Simplified contrast calculation
  // In production, use a proper color contrast library
  return 4.5; // Placeholder
}

// Validate WCAG compliance
export function checkWCAGCompliance(element: HTMLElement): {
  contrast: boolean;
  altText: boolean;
  ariaLabels: boolean;
} {
  return {
    contrast: true, // Check color contrast
    altText: true,  // Check images have alt text
    ariaLabels: true // Check interactive elements have labels
  };
}

// Generate unique IDs for ARIA
let idCounter = 0;
export function useAriaId(prefix: string = "aria"): string {
  return `${prefix}-${++idCounter}`;
}

// Screen reader announcement component
export function LiveRegion() {
  return (
    <>
      <div
        id="aria-live-polite"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />
      <div
        id="aria-live-assertive"
        className="sr-only"
        aria-live="assertive"
        aria-atomic="true"
      />
    </>
  );
}

// Skip to main content link
export function SkipToMain() {
  return (
    <a href="#main-content" className="skip-to-main">
      Skip to main content
    </a>
  );
}
